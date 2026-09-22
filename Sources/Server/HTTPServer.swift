import Foundation
import Network

/// Minimaler HTTP/1.1-Server auf Basis von Network.framework.
/// Jede Verbindung beantwortet genau eine Anfrage (Connection: close).
/// Verbindungen können offen gehalten werden (Long-Poll, Server-Sent Events).
final class HTTPServer {
    let queue: DispatchQueue
    private var listener: NWListener?
    var handler: ((HTTPRequest, HTTPConnection) -> Void)?

    init(queue: DispatchQueue) { self.queue = queue }

    func start(port: UInt16, lanAccess: Bool, onState: @escaping (String?) -> Void) {
        stop()
        do {
            let params = NWParameters.tcp
            params.allowLocalEndpointReuse = true
            guard let nwPort = NWEndpoint.Port(rawValue: port) else { onState("Ungültiger Port"); return }
            if !lanAccess {
                params.requiredLocalEndpoint = .hostPort(host: .ipv4(.loopback), port: nwPort)
                listener = try NWListener(using: params)
            } else {
                listener = try NWListener(using: params, on: nwPort)
            }
        } catch {
            onState("Server konnte nicht starten: \(error.localizedDescription)")
            return
        }
        listener?.stateUpdateHandler = { state in
            switch state {
            case .ready: onState(nil)
            case .failed(let err): onState("Port \(port) nicht verfügbar: \(err.localizedDescription)")
            default: break
            }
        }
        listener?.newConnectionHandler = { [weak self] nw in
            guard let self = self else { return }
            let c = HTTPConnection(nw, queue: self.queue)
            c.onRequest = { [weak self] req in self?.handler?(req, c) }
            c.start()
        }
        listener?.start(queue: queue)
    }

    func stop() {
        listener?.cancel()
        listener = nil
    }
}

struct HTTPRequest {
    var method: String
    var path: String
    var query: [String: String]
    var headers: [String: String]
    var body: Data
    var isLocal: Bool

    var bodyString: String { String(decoding: body, as: UTF8.self) }

    /// JSON-Objekt aus dem Body (falls vorhanden).
    var json: [String: Any]? {
        guard !body.isEmpty, let obj = try? JSONSerialization.jsonObject(with: body) as? [String: Any] else { return nil }
        return obj
    }

    /// Formular-Parameter (application/x-www-form-urlencoded).
    var form: [String: String] {
        var out: [String: String] = [:]
        let s = bodyString
        guard s.contains("=") else { return out }
        for pair in s.split(separator: "&") {
            let kv = pair.split(separator: "=", maxSplits: 1).map(String.init)
            guard let k = kv.first else { continue }
            let v = kv.count > 1 ? kv[1] : ""
            let dec = { (x: String) in x.replacingOccurrences(of: "+", with: " ").removingPercentEncoding ?? x }
            out[dec(k)] = dec(v)
        }
        return out
    }

    /// Kombinierte Parameter: Query < Formular < JSON.
    var params: [String: Any] {
        var out: [String: Any] = query
        if let j = json { for (k, v) in j { out[k] = v } }
        else if isForm { for (k, v) in form { out[k] = v } }
        return out
    }

    /// Body sieht wie ein echtes Formular aus (nur Bezeichner als Schlüssel) –
    /// sonst wird er als Rohtext behandelt (z. B. ein Prompt per Heredoc).
    var isForm: Bool {
        let f = form
        guard !f.isEmpty else { return false }
        let allowed = CharacterSet(charactersIn: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-[]")
        return f.keys.allSatisfy { !$0.isEmpty && $0.count <= 40 && $0.unicodeScalars.allSatisfy { allowed.contains($0) } }
    }

    var wantsText: Bool { query["format"] == "text" }
    var host: String? { headers["host"] }
}

struct HTTPResponse {
    var status: Int = 200
    var headers: [String: String] = [:]
    var body: Data = Data()

    static func json(_ obj: Any, status: Int = 200) -> HTTPResponse {
        let data = (try? JSONSerialization.data(withJSONObject: obj, options: [.sortedKeys, .fragmentsAllowed])) ?? Data("{}".utf8)
        return HTTPResponse(status: status, headers: ["Content-Type": "application/json; charset=utf-8"], body: data)
    }
    static func encodable<T: Encodable>(_ obj: T, status: Int = 200) -> HTTPResponse {
        let enc = JSONEncoder()
        enc.outputFormatting = [.sortedKeys]
        let data = (try? enc.encode(obj)) ?? Data("{}".utf8)
        return HTTPResponse(status: status, headers: ["Content-Type": "application/json; charset=utf-8"], body: data)
    }
    static func text(_ s: String, status: Int = 200) -> HTTPResponse {
        HTTPResponse(status: status, headers: ["Content-Type": "text/plain; charset=utf-8"], body: Data(s.utf8))
    }
    static func error(_ message: String, status: Int = 400, text: Bool = false) -> HTTPResponse {
        text ? .text("FEHLER: \(message)\n", status: status) : .json(["error": message], status: status)
    }
    static let noContent = HTTPResponse(status: 204)
}

final class HTTPConnection {
    private let nw: NWConnection
    private let queue: DispatchQueue
    private var buffer = Data()
    private var parsed = false
    private(set) var closed = false
    private var closeHandlers: [() -> Void] = []
    var onRequest: ((HTTPRequest) -> Void)?
    let id = UUID()

    init(_ nw: NWConnection, queue: DispatchQueue) {
        self.nw = nw
        self.queue = queue
    }

    var isLocal: Bool {
        if case let .hostPort(host, _) = nw.endpoint {
            let s = "\(host)"
            return s.hasPrefix("127.") || s == "::1" || s.hasPrefix("::ffff:127.") || s.hasPrefix("localhost")
        }
        return false
    }

    func start() {
        nw.stateUpdateHandler = { [weak self] state in
            switch state {
            case .failed, .cancelled: self?.markClosed()
            default: break
            }
        }
        nw.start(queue: queue)
        receive()
    }

    func onClose(_ fn: @escaping () -> Void) {
        if closed { fn() } else { closeHandlers.append(fn) }
    }

    private func markClosed() {
        guard !closed else { return }
        closed = true
        onRequest = nil // löst den Halte-Zyklus Verbindung ↔ Handler
        let hs = closeHandlers
        closeHandlers = []
        hs.forEach { $0() }
    }

    private func receive() {
        nw.receive(minimumIncompleteLength: 1, maximumLength: 256 * 1024) { [weak self] data, _, isComplete, error in
            guard let self = self else { return }
            if let data = data, !data.isEmpty, !self.parsed {
                self.buffer.append(data)
                if self.buffer.count > 20 * 1024 * 1024 {
                    self.send(.error("Anfrage zu groß", status: 413)); return
                }
                self.tryParse()
            }
            if isComplete || error != nil {
                self.close()
                return
            }
            self.receive() // weiterlesen, um das Schließen durch den Client zu bemerken
        }
    }

    private func tryParse() {
        let sep = Data("\r\n\r\n".utf8)
        guard let range = buffer.range(of: sep) else { return }
        let headData = buffer.subdata(in: 0..<range.lowerBound)
        let head = String(decoding: headData, as: UTF8.self)
        var lines = head.components(separatedBy: "\r\n")
        guard !lines.isEmpty else { close(); return }
        let requestLine = lines.removeFirst().split(separator: " ").map(String.init)
        guard requestLine.count >= 2 else { close(); return }
        var headers: [String: String] = [:]
        for l in lines {
            guard let idx = l.firstIndex(of: ":") else { continue }
            let k = l[..<idx].trimmingCharacters(in: .whitespaces).lowercased()
            let v = l[l.index(after: idx)...].trimmingCharacters(in: .whitespaces)
            headers[k] = v
        }
        let length = Int(headers["content-length"] ?? "0") ?? 0
        let bodyStart = range.upperBound
        guard buffer.count - bodyStart >= length else { return }
        let body = buffer.subdata(in: bodyStart..<(bodyStart + length))
        parsed = true

        let target = requestLine[1]
        let comps = URLComponents(string: "http://x" + target)
        var query: [String: String] = [:]
        for item in comps?.queryItems ?? [] { query[item.name] = item.value ?? "" }
        var path = comps?.percentEncodedPath.removingPercentEncoding ?? target
        if path.count > 1 && path.hasSuffix("/") { path.removeLast() }

        let req = HTTPRequest(method: requestLine[0].uppercased(), path: path, query: query,
                              headers: headers, body: body, isLocal: isLocal)
        onRequest?(req)
    }

    private func headString(status: Int, headers: [String: String]) -> String {
        var h = headers
        h["Connection"] = "close"
        h["Access-Control-Allow-Origin"] = "*"
        h["Access-Control-Allow-Headers"] = "*"
        h["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        h["Server"] = "Dirigent"
        var s = "HTTP/1.1 \(status) \(HTTPConnection.reason(status))\r\n"
        for (k, v) in h { s += "\(k): \(v)\r\n" }
        return s + "\r\n"
    }

    /// Vollständige Antwort senden und Verbindung schließen.
    func send(_ r: HTTPResponse, completion: ((Bool) -> Void)? = nil) {
        guard !closed else { completion?(false); return }
        var headers = r.headers
        headers["Content-Length"] = "\(r.body.count)"
        var data = Data(headString(status: r.status, headers: headers).utf8)
        data.append(r.body)
        nw.send(content: data, completion: .contentProcessed { [weak self] err in
            completion?(err == nil)
            self?.close()
        })
    }

    // MARK: Streaming (SSE)
    func startStream(headers: [String: String]) {
        guard !closed else { return }
        nw.send(content: Data(headString(status: 200, headers: headers).utf8), completion: .contentProcessed { _ in })
    }

    func write(_ s: String) {
        guard !closed else { return }
        nw.send(content: Data(s.utf8), completion: .contentProcessed { [weak self] err in
            if err != nil { self?.close() }
        })
    }

    func close() {
        if nw.state != .cancelled { nw.cancel() }
        markClosed()
    }

    static func reason(_ s: Int) -> String {
        switch s {
        case 200: return "OK"
        case 201: return "Created"
        case 204: return "No Content"
        case 400: return "Bad Request"
        case 401: return "Unauthorized"
        case 404: return "Not Found"
        case 409: return "Conflict"
        case 413: return "Payload Too Large"
        default: return "Status"
        }
    }
}
