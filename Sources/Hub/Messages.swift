import Foundation

/// Nachrichten, Rückfragen und Beschreibungsdateien.
/// Zustellung ist kooperativ: Wartende Agenten werden sofort mit einem Nachrichten-Auftrag geweckt,
/// arbeitende Agenten erhalten ihr Postfach bei jeder Zwischenstand-Meldung (/progress), Rückfrage oder neuem Auftrag.
extension Hub {

    // MARK: Hilfen

    func agentExists(_ id: String?) -> Bool { id.map { i in db.agents.contains(where: { $0.id == i }) } ?? false }

    /// Name für Absender/Empfänger in Texten.
    func partyName(_ ref: String) -> String {
        if ref == "user" { return "Nutzer" }
        if ref == "system" { return "Dirigent" }
        if ref == "task" { return "Agent des Auftrags" }
        if ref.hasPrefix("agent:") { return db.agents.first(where: { $0.id == String(ref.dropFirst(6)) })?.name ?? String(ref.dropFirst(6)) }
        return ref
    }

    /// Alle Agenten unterhalb eines Leiters (direkt und indirekt).
    func teamMembers(of leadRef: String) -> [String] {
        guard let li = agentIndex(leadRef) else { return [] }
        let lead = db.agents[li].id
        var out: [String] = [], frontier = [lead]
        while let cur = frontier.popLast(), out.count < 500 {
            for a in db.agents where a.supervisorId == cur && !out.contains(a.id) && a.id != lead { out.append(a.id); frontier.append(a.id) }
        }
        return out
    }

    /// Wer ist für Rückfragen dieses Agenten zu diesem Auftrag zuständig? ("agent:<id>" oder "user")
    func supervisorRef(task t: TaskItem?, agentId: String) -> String {
        if let t = t {
            if let n = t.notifyAgentId, n != agentId, agentExists(n) { return "agent:\(n)" }
            if let pid = t.projectId, let p = db.projects.first(where: { $0.id == pid }) {
                if let m = p.managerId, m != agentId, agentExists(m) { return "agent:\(m)" }
                if let pp = p.parentProjectId, let parent = db.projects.first(where: { $0.id == pp }),
                   let m = parent.managerId, m != agentId, agentExists(m) { return "agent:\(m)" }
            }
            if t.createdBy.hasPrefix("agent:") {
                let c = String(t.createdBy.dropFirst(6))
                if c != agentId, agentExists(c) { return "agent:\(c)" }
            }
        }
        if let s = db.agents.first(where: { $0.id == agentId })?.supervisorId, agentExists(s) { return "agent:\(s)" }
        return "user"
    }

    // MARK: Senden & Zustellen

    @discardableResult
    func sendMessage(from: String, to: String, text: String, kind: String = "message", taskId: String? = nil, projectId: String? = nil,
                     urgent: Bool = false, replyTo: String? = nil, wake: Bool = true) -> Message {
        let m = Message(id: makeId("m", 8), time: nowMs(), from: from, to: to, taskId: taskId, projectId: projectId, kind: kind,
                        text: text.trimmingCharacters(in: .whitespacesAndNewlines), urgent: urgent, replyTo: replyTo,
                        status: to == "user" ? "delivered" : "pending", deliveredAt: to == "user" ? nowMs() : nil,
                        viaTaskId: nil, answer: nil, answeredAt: nil)
        db.messages.append(m)
        if db.messages.count > 4000 { db.messages.removeFirst(db.messages.count - 4000) }
        let label = ["question": "Rückfrage", "answer": "Antwort", "supplement": "Ergänzung", "system": "Hinweis"][kind] ?? "Nachricht"
        emit(kind == "question" ? "message.question" : "message.sent",
             "\(label) \(partyName(from)) → \(partyName(to)): \(m.text.prefix(100))", ref: m.taskId ?? m.projectId ?? m.id, data: toJSONObject(m))
        if to == "user" && kind == "question" && db.settings.notifications {
            let cb = onNotify, title = "❓ Rückfrage von \(partyName(from))", body = String(m.text.prefix(200))
            DispatchQueue.main.async { cb?(title, body) }
        }
        if wake, to.hasPrefix("agent:") {
            let aid = String(to.dropFirst(6))
            if isWaiting(aid) { flushInboxAsTask(aid) }
        }
        return m
    }

    /// Offene Nachrichten eines Agenten abholen (und als zugestellt markieren).
    func takeInbox(_ agentId: String, taskId: String? = nil) -> [Message] {
        var out: [Message] = []
        for i in db.messages.indices where db.messages[i].status == "pending" {
            let m = db.messages[i]
            guard m.to == "agent:\(agentId)" || (m.to == "task" && taskId != nil && m.taskId == taskId) else { continue }
            db.messages[i].status = "delivered"
            db.messages[i].deliveredAt = nowMs()
            if m.to == "task" { db.messages[i].to = "agent:\(agentId)" }
            out.append(db.messages[i])
        }
        if !out.isEmpty { changed() }
        return out.sorted { ($0.urgent ? 0 : 1, $0.time) < ($1.urgent ? 0 : 1, $1.time) }
    }

    /// Wartenden Agenten mit einem Nachrichten-Auftrag wecken.
    func flushInboxAsTask(_ agentId: String) {
        let pending = db.messages.filter { $0.status == "pending" && $0.to == "agent:\(agentId)" }
        guard !pending.isEmpty else { return }
        let first = pending[0]
        let title: String = {
            if pending.count > 1 { return "📬 \(pending.count) neue Nachrichten" }
            switch first.kind {
            case "question": return "❓ Rückfrage von \(partyName(first.from))"
            case "answer": return "💬 Antwort von \(partyName(first.from))"
            case "supplement": return "➕ Ergänzung von \(partyName(first.from))"
            default: return "💬 Nachricht von \(partyName(first.from))"
            }
        }()
        // Schon ein wartender Nachrichten-Auftrag für diesen Agenten? Der nimmt beim Zustellen alle offenen mit.
        if db.tasks.contains(where: { $0.kind == "message" && $0.status == "queued" && $0.target == "agent:\(agentId)" }) { return }
        let prompt = pending.map { "[\($0.kind)] von \(partyName($0.from)): \($0.text)" }.joined(separator: "\n\n")
        let pid = pending.compactMap { $0.projectId }.first
        _ = createTasks(prompt: prompt, title: title, target: "agent:\(agentId)", createdBy: "system", priority: 8, kind: "message", projectId: pid)
    }

    // MARK: Rückfragen

    func ask(taskId: String, text: String, from: String?) -> Result<Message, HubError> {
        guard let t = task(taskId) else { return .failure(.msg("Auftrag unbekannt")) }
        guard let aid = (from.flatMap { agentIndex($0) }.map { db.agents[$0].id }) ?? t.assignedAgentId else { return .failure(.msg("Wer fragt? (from=<agent>)")) }
        let q = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !q.isEmpty else { return .failure(.msg("Frage fehlt")) }
        let to = supervisorRef(task: t, agentId: aid)
        if let i = db.tasks.firstIndex(where: { $0.id == taskId }) {
            db.tasks[i].progress.append(ProgressEntry(time: nowMs(), text: "❓ Rückfrage an \(partyName(to)): \(q.prefix(160))"))
        }
        return .success(sendMessage(from: "agent:\(aid)", to: to, text: q, kind: "question", taskId: taskId, projectId: t.projectId))
    }

    func answerMessage(_ qid: String, text: String, from: String) -> Result<Message, HubError> {
        guard let qi = db.messages.firstIndex(where: { $0.id == qid }) else { return .failure(.msg("Rückfrage unbekannt")) }
        guard db.messages[qi].kind == "question" else { return .failure(.msg("Das ist keine Rückfrage")) }
        guard db.messages[qi].status != "answered" else { return .failure(.msg("Rückfrage ist bereits beantwortet")) }
        let a = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !a.isEmpty else { return .failure(.msg("Antwort fehlt")) }
        db.messages[qi].status = "answered"
        db.messages[qi].answer = a
        db.messages[qi].answeredAt = nowMs()
        let q = db.messages[qi]
        let hasWaiter = !(messageWaiters[qid] ?? []).isEmpty
        let ans = sendMessage(from: from, to: q.from, text: a, kind: "answer", taskId: q.taskId, projectId: q.projectId,
                              replyTo: q.id, wake: !hasWaiter)
        if let tid = q.taskId, let i = db.tasks.firstIndex(where: { $0.id == tid }) {
            db.tasks[i].progress.append(ProgressEntry(time: nowMs(), text: "💬 Antwort von \(partyName(from)): \(a.prefix(160))"))
        }
        if hasWaiter, let ai = db.messages.firstIndex(where: { $0.id == ans.id }) {
            db.messages[ai].status = "delivered"; db.messages[ai].deliveredAt = nowMs()
            let body = Texts.answerDelivery(q: q, answer: db.messages[ai], hub: self)
            for w in messageWaiters.removeValue(forKey: qid) ?? [] { w.timer.cancel(); w.conn.send(.text(body)) }
        }
        emit("message.answered", "Rückfrage beantwortet von \(partyName(from)): \(a.prefix(100))", ref: q.taskId ?? q.id)
        return .success(ans)
    }

    /// Rückfrage an die nächsthöhere Stelle weitergeben.
    func escalate(_ qid: String, from: String, note: String) -> Result<Message, HubError> {
        guard let qi = db.messages.firstIndex(where: { $0.id == qid }), db.messages[qi].kind == "question" else { return .failure(.msg("Rückfrage unbekannt")) }
        guard db.messages[qi].status != "answered" else { return .failure(.msg("Rückfrage ist bereits beantwortet")) }
        let me = from.hasPrefix("agent:") ? String(from.dropFirst(6)) : from
        let next = supervisorRef(task: db.messages[qi].taskId.flatMap { task($0) }, agentId: me)
        let target = next == db.messages[qi].from ? "user" : next
        let n = note.trimmingCharacters(in: .whitespacesAndNewlines)
        db.messages[qi].to = target
        db.messages[qi].status = target == "user" ? "delivered" : "pending"
        if !n.isEmpty { db.messages[qi].text += "\n\n(Weitergeleitet von \(partyName(from)): \(n))" }
        emit("message.question", "Rückfrage weitergeleitet an \(partyName(target)): \(db.messages[qi].text.prefix(100))", ref: db.messages[qi].taskId ?? qid)
        if target == "user" && db.settings.notifications {
            let cb = onNotify, body = String(db.messages[qi].text.prefix(200))
            DispatchQueue.main.async { cb?("❓ Rückfrage (weitergeleitet)", body) }
        }
        if target.hasPrefix("agent:"), isWaiting(String(target.dropFirst(6))) { flushInboxAsTask(String(target.dropFirst(6))) }
        return .success(db.messages[qi])
    }

    func waitForMessage(_ qid: String, conn: HTTPConnection, timeout: Double) -> HTTPResponse? {
        guard let q = db.messages.first(where: { $0.id == qid }) else { return .text("Rückfrage unbekannt\n", status: 404) }
        if q.status == "answered", let ai = db.messages.lastIndex(where: { $0.replyTo == qid && $0.kind == "answer" }) {
            db.messages[ai].status = "delivered"; db.messages[ai].deliveredAt = db.messages[ai].deliveredAt ?? nowMs()
            changed()
            return .text(Texts.answerDelivery(q: q, answer: db.messages[ai], hub: self))
        }
        let timer = DispatchSource.makeTimerSource(queue: queue)
        timer.schedule(deadline: .now() + timeout)
        let cid = conn.id
        timer.setEventHandler { [weak self] in
            self?.messageWaiters[qid]?.removeAll { $0.conn.id == cid }
            conn.send(.noContent)
        }
        timer.resume()
        messageWaiters[qid, default: []].append((conn, timer))
        conn.onClose { [weak self] in timer.cancel(); self?.messageWaiters[qid]?.removeAll { $0.conn.id == cid } }
        return nil
    }

    /// Ein Nachrichten-Auftrag wurde abgeschlossen: Ergebnis als Antwort an die Absender.
    func messageTaskFinished(_ t: TaskItem) {
        guard t.kind == "message", let aid = t.assignedAgentId else { return }
        let reply = (t.status == "done" ? t.result : t.error)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        guard !reply.isEmpty, reply != "(kein Ergebnistext)" else { return }
        let trivial = ["ok", "ok.", "okay", "erledigt", "gelesen", "verstanden", "eskaliert", "weitergeleitet", "weitergegeben"].contains(reply.lowercased())
        for m in db.messages where m.viaTaskId == t.id {
            if m.kind == "question" {
                // Nur beantworten, wenn die Frage noch bei diesem Agenten liegt (nicht eskaliert) und offen ist
                let cur = db.messages.first(where: { $0.id == m.id })
                if cur?.to == "agent:\(aid)" && cur?.status != "answered" && !trivial { _ = answerMessage(m.id, text: reply, from: "agent:\(aid)") }
            } else if m.from != "system" && m.kind != "answer" {
                if m.from.hasPrefix("agent:") && trivial { continue }
                sendMessage(from: "agent:\(aid)", to: m.from, text: reply, kind: "answer", taskId: m.taskId, projectId: m.projectId, replyTo: m.id)
            }
        }
    }

    // MARK: Beschreibungsdatei

    static func slug(_ s: String, max: Int = 40) -> String {
        let map: [Character: String] = ["ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss", "Ä": "ae", "Ö": "oe", "Ü": "ue"]
        var out = ""
        for ch in s { if let r = map[ch] { out += r } else if ch.isLetter || ch.isNumber { out += String(ch).lowercased() } else if !out.hasSuffix("-") { out += "-" } }
        let t = out.trimmingCharacters(in: CharacterSet(charactersIn: "-"))
        return String((t.isEmpty ? "auftrag" : t).prefix(max)).trimmingCharacters(in: CharacterSet(charactersIn: "-"))
    }

    static func taskDocPath(title: String) -> String {
        let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"
        return ".dirigent/auftraege/\(f.string(from: Date()))-\(slug(title, max: 36))-{id}.md"
    }

    /// Legt die Beschreibungsdatei an (Auftrag wörtlich) bzw. hängt bei Nacharbeit eine neue Runde an.
    func prepareDocFile(taskIndex i: Int, agent: Agent) {
        let t = db.tasks[i]
        guard t.kind == "task", let rel = t.docPath else { return }
        let projectCwd = t.projectId.flatMap { pid in db.projects.first(where: { $0.id == pid })?.cwd } ?? ""
        let baseDir = (projectCwd.isEmpty ? agent.cwd : projectCwd).trimmingCharacters(in: .whitespaces)
        var isDir: ObjCBool = false
        guard !baseDir.isEmpty, FileManager.default.fileExists(atPath: baseDir, isDirectory: &isDir), isDir.boolValue else { return }
        let url = URL(fileURLWithPath: baseDir).appendingPathComponent(rel)
        try? FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
        let f = DateFormatter(); f.dateFormat = "dd.MM.yyyy HH:mm"
        let stamp = f.string(from: Date())
        let fence = "~~~~~~~~"
        if FileManager.default.fileExists(atPath: url.path), let h = try? FileHandle(forWritingTo: url) {
            let add = "\n\n---\n\n## Auftrag – neue Runde (\(stamp), Auftrag \(t.id), \(agent.name)) – wörtlich\n\n\(fence)text\n\(t.prompt)\n\(fence)\n\n_Ergänze unten, was sich in dieser Runde geändert hat._\n"
            h.seekToEndOfFile(); h.write(Data(add.utf8)); try? h.close()
        } else {
            try? Texts.docSkeleton(t, agent: agent, stamp: stamp, fence: fence, hub: self).write(to: url, atomically: true, encoding: .utf8)
        }
        db.tasks[i].docFile = url.path
    }

    func readDoc(_ t: TaskItem) -> String? {
        guard let p = t.docFile else { return nil }
        return try? String(contentsOfFile: p, encoding: .utf8)
    }
}
