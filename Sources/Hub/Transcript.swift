import Foundation

/// Live-Protokoll: liest die Claude-Code-Sitzung eines Agenten (~/.claude/projects/…/*.jsonl) mit,
/// damit man wie in Claude sieht, was er gerade tut (Texte, Befehle, Ausgaben).
extension Hub {

    static var claudeProjectsDir: URL {
        FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent(".claude/projects", isDirectory: true)
    }

    /// Claude Code kodiert den Arbeitsordner als Ordnernamen (alles außer Buchstaben/Ziffern → "-").
    static func encodedCwd(_ cwd: String) -> String {
        String(cwd.map { $0.isASCII && ($0.isLetter || $0.isNumber) ? $0 : "-" })
    }

    /// Sucht die Sitzungsdatei, in der sich der Agent angemeldet hat (Marker aus der Anmelde-Antwort).
    func transcriptURL(for a: Agent) -> URL? {
        if let u = transcriptCache[a.id], FileManager.default.fileExists(atPath: u.path) { return u }
        // Erfolglose Suche nicht bei jeder Abfrage wiederholen
        if let miss = transcriptMiss[a.id], nowMs() - miss < 60_000 { return nil }
        let fm = FileManager.default
        let root = Hub.claudeProjectsDir
        guard let dirs = try? fm.contentsOfDirectory(at: root, includingPropertiesForKeys: nil) else { return nil }
        let preferred = root.appendingPathComponent(Hub.encodedCwd(a.cwd)).path
        let ordered = dirs.sorted { ($0.path == preferred ? 0 : 1) < ($1.path == preferred ? 0 : 1) }
        let marker = Data("(ID: \(a.id),".utf8)
        let cutoff = Date().addingTimeInterval(-21 * 86400)
        var candidates: [(URL, Date)] = []
        for d in ordered {
            guard let files = try? fm.contentsOfDirectory(at: d, includingPropertiesForKeys: [.contentModificationDateKey]) else { continue }
            for f in files where f.pathExtension == "jsonl" {
                let m = (try? f.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate) ?? .distantPast
                if m >= cutoff { candidates.append((f, m)) }
            }
            // Im bevorzugten Ordner zuerst suchen – spart das Lesen aller anderen
            if d.path == preferred, let hit = firstMatch(candidates, marker) { transcriptCache[a.id] = hit; return hit }
        }
        if let hit = firstMatch(candidates, marker) { transcriptCache[a.id] = hit; return hit }
        transcriptMiss[a.id] = nowMs()
        return nil
    }

    private func firstMatch(_ files: [(URL, Date)], _ marker: Data) -> URL? {
        for (f, _) in files.sorted(by: { $0.1 > $1.1 }) {
            if let d = try? Data(contentsOf: f, options: .mappedIfSafe), d.range(of: marker) != nil { return f }
        }
        return nil
    }

    /// Einträge des Protokolls: {time, kind: text|tool|result|prompt, name?, text, error?}
    func transcript(agentId: String, since: Double?, limit: Int) -> [String: Any] {
        guard let a = db.agents.first(where: { $0.id == agentId }) else { return ["error": "Agent unbekannt"] }
        guard let url = transcriptURL(for: a) else {
            return ["entries": [], "found": false,
                    "hint": "Keine Claude-Code-Sitzung gefunden. Das Protokoll erscheint, sobald sich der Agent per Anleitung (/join, Text-Antwort) angemeldet hat."]
        }
        guard let h = try? FileHandle(forReadingFrom: url) else { return ["entries": [], "found": false] }
        defer { try? h.close() }
        let size = (try? h.seekToEnd()) ?? 0
        let window: UInt64 = 4 * 1024 * 1024
        try? h.seek(toOffset: size > window ? size - window : 0)
        let data = h.readDataToEndOfFile()
        var lines = data.split(separator: UInt8(ascii: "\n"))
        if size > window, !lines.isEmpty { lines.removeFirst() }
        let iso = ISO8601DateFormatter(); iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let iso2 = ISO8601DateFormatter()
        var out: [[String: Any]] = []
        let clip = { (s: String, n: Int) -> String in s.count > n ? String(s.prefix(n)) + " …" : s }
        for l in lines {
            guard let o = try? JSONSerialization.jsonObject(with: Data(l)) as? [String: Any],
                  let type = o["type"] as? String, type == "assistant" || type == "user",
                  (o["isSidechain"] as? Bool) != true else { continue }
            let ts = (o["timestamp"] as? String).flatMap { iso.date(from: $0) ?? iso2.date(from: $0) }.map { $0.timeIntervalSince1970 * 1000 } ?? 0
            if let s = since, ts < s { continue }
            let msg = o["message"] as? [String: Any]
            if let text = msg?["content"] as? String {
                if type == "user" { out.append(["time": ts, "kind": "prompt", "text": clip(text, 4000)]) }
                continue
            }
            for c in msg?["content"] as? [[String: Any]] ?? [] {
                switch c["type"] as? String {
                case "text":
                    let t = (c["text"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                    if !t.isEmpty { out.append(["time": ts, "kind": type == "assistant" ? "text" : "prompt", "text": clip(t, 6000)]) }
                case "tool_use":
                    let name = c["name"] as? String ?? "Tool"
                    let input = c["input"] as? [String: Any] ?? [:]
                    let main = (input["command"] ?? input["file_path"] ?? input["pattern"] ?? input["url"] ?? input["prompt"]) as? String
                    let desc = input["description"] as? String
                    var text = main ?? ((try? JSONSerialization.data(withJSONObject: input, options: [.sortedKeys])).map { String(decoding: $0, as: UTF8.self) } ?? "")
                    if name == "Edit", let o = input["old_string"] as? String, let n = input["new_string"] as? String {
                        text += "\n− " + clip(o, 600) + "\n+ " + clip(n, 600)
                    }
                    var e: [String: Any] = ["time": ts, "kind": "tool", "name": name, "text": clip(text, 3000)]
                    if let d = desc { e["desc"] = d }
                    out.append(e)
                case "tool_result":
                    var t = ""
                    if let s = c["content"] as? String { t = s }
                    else if let arr = c["content"] as? [[String: Any]] { t = arr.compactMap { $0["text"] as? String }.joined(separator: "\n") }
                    out.append(["time": ts, "kind": "result", "text": clip(t.trimmingCharacters(in: .whitespacesAndNewlines), 2500),
                                "error": (c["is_error"] as? Bool) ?? false])
                default: break
                }
            }
        }
        return ["entries": Array(out.suffix(max(1, min(limit, 2000)))), "found": true, "file": url.path]
    }
}
