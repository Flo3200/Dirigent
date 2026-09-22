import Foundation

struct HubSummary {
    var agents: Int
    var waiting: Int
    var working: Int
    var queued: Int
    var running: Int
    var serverError: String?
    var port: Int
}

/// Zentraler Zustand der Plattform. Alle Zugriffe laufen über `queue`.
final class Hub {
    static let version = "1.0.0"

    let queue = DispatchQueue(label: "dirigent.hub")
    let server: HTTPServer
    var db = Database()
    let dataURL: URL
    let webRoot: URL

    private struct Waiter { let conn: HTTPConnection; let json: Bool; let timer: DispatchSourceTimer; let base: String }
    private var waiters: [String: Waiter] = [:]
    private var sseClients: [UUID: HTTPConnection] = [:]
    private var taskWaiters: [String: [(conn: HTTPConnection, timer: DispatchSourceTimer)]] = [:]
    private var saveScheduled = false
    private var lastStatuses: [String: String] = [:]
    private var timers: [DispatchSourceTimer] = []
    private(set) var serverError: String?
    private(set) var startedAt = nowMs()

    var onSummary: ((HubSummary) -> Void)?
    var onNotify: ((String, String) -> Void)?   // Titel, Text

    init() {
        let support = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("Dirigent", isDirectory: true)
        try? FileManager.default.createDirectory(at: support, withIntermediateDirectories: true)
        dataURL = support.appendingPathComponent("db.json")
        webRoot = Bundle.main.resourceURL!.appendingPathComponent("web", isDirectory: true)
        server = HTTPServer(queue: queue)
        load()
        server.handler = { [weak self] req, conn in self?.route(req, conn) }
    }

    // MARK: Lebenszyklus

    func start() {
        queue.async {
            self.startServer()
            self.every(5) { self.checkPresence() }
            self.every(20) { self.runSchedules() }
            self.every(20) { self.sseClients.values.forEach { $0.write(": ping\n\n") } }
            self.emit("hub.started", "Dirigent gestartet (Port \(self.db.settings.port))")
        }
    }

    func startServer() {
        server.start(port: UInt16(db.settings.port), lanAccess: db.settings.lanAccess) { [weak self] err in
            guard let self = self else { return }
            self.serverError = err
            self.publishSummary()
        }
    }

    private func every(_ seconds: Double, _ fn: @escaping () -> Void) {
        let t = DispatchSource.makeTimerSource(queue: queue)
        t.schedule(deadline: .now() + seconds, repeating: seconds)
        t.setEventHandler(handler: fn)
        t.resume()
        timers.append(t)
    }

    // MARK: Persistenz

    private func load() {
        guard let data = try? Data(contentsOf: dataURL) else { seed(); return }
        if let loaded = try? JSONDecoder().decode(Database.self, from: data) { db = loaded } else { seed() }
    }

    func scheduleSave() {
        guard !saveScheduled else { return }
        saveScheduled = true
        queue.asyncAfter(deadline: .now() + 0.4) {
            self.saveScheduled = false
            self.saveNow()
        }
    }

    func saveNow() {
        let enc = JSONEncoder()
        enc.outputFormatting = [.prettyPrinted, .sortedKeys]
        if let data = try? enc.encode(db) { try? data.write(to: dataURL, options: .atomic) }
    }

    private func seed() {
        let t = nowMs()
        db.templates = [
            Template(id: makeId("tpl"), name: "Code-Review", description: "Prüft Änderungen im Repository auf Fehler und Verbesserungen.",
                     prompt: "Führe ein gründliches Code-Review der aktuellen Änderungen ({{scope}}) durch. Nenne konkrete Fehler mit Datei und Zeile, sortiert nach Schwere. Ändere nichts, nur berichten.",
                     target: "any", icon: "🔍", scheduleMinutes: 0, lastRunAt: nil, createdAt: t),
            Template(id: makeId("tpl"), name: "Tests ausführen", description: "Führt die Test-Suite aus und fasst das Ergebnis zusammen.",
                     prompt: "Führe die Tests des Projekts aus. Fasse zusammen: Anzahl bestanden/fehlgeschlagen, und für jeden Fehler die wahrscheinliche Ursache.",
                     target: "any", icon: "🧪", scheduleMinutes: 0, lastRunAt: nil, createdAt: t),
            Template(id: makeId("tpl"), name: "Status-Bericht", description: "Kurzer Stand: woran arbeitest du, was ist offen?",
                     prompt: "Gib einen kurzen Status-Bericht (max. 5 Stichpunkte): Projekt, letzter Stand, offene Punkte, Risiken.",
                     target: "all", icon: "📋", scheduleMinutes: 0, lastRunAt: nil, createdAt: t),
            Template(id: makeId("tpl"), name: "Ziel an Manager", description: "Ein größeres Ziel, das der Manager-Agent zerlegt und verteilt.",
                     prompt: "Ziel: {{ziel}}\n\nZerlege das Ziel in sinnvolle Teilaufträge, verteile sie an passende Agenten (mit Rückmeldung) und fasse am Ende die Ergebnisse zusammen.",
                     target: "manager", icon: "🎼", scheduleMinutes: 0, lastRunAt: nil, createdAt: t)
        ]
        let review = db.templates[0]
        db.workflows = [
            Workflow(id: makeId("wf"), name: "Feature: Bauen → Prüfen → Fixen", description: "Ein Agent implementiert, ein zweiter prüft, der erste behebt die Befunde.",
                     steps: [
                        WorkflowStep(name: "Implementieren", templateId: nil, prompt: "Implementiere folgendes Feature: {{input}}\nFasse am Ende zusammen, welche Dateien du geändert hast.", target: "any"),
                        WorkflowStep(name: "Review", templateId: review.id, prompt: "", target: "any"),
                        WorkflowStep(name: "Befunde beheben", templateId: nil, prompt: "Behebe die folgenden Review-Befunde:\n\n{{prev}}", target: "any")
                     ], createdAt: t)
        ]
        scheduleSave()
    }

    // MARK: Events, SSE, Webhooks

    func emit(_ type: String, _ message: String, ref: String? = nil, data: Any? = nil) {
        let e = EventEntry(id: makeId("ev", 10), time: nowMs(), type: type, message: message, ref: ref)
        db.events.append(e)
        if db.events.count > 600 { db.events.removeFirst(db.events.count - 600) }
        var payload: [String: Any] = ["type": type, "message": message, "time": e.time]
        if let ref = ref { payload["ref"] = ref }
        if let data = data { payload["data"] = data }
        broadcast(payload)
        fireWebhooks(type, payload)
        scheduleSave()
    }

    /// Stille Zustandsänderung – nur die Oberfläche aktualisieren.
    func changed() {
        broadcast(["type": "state.changed", "time": nowMs()])
        scheduleSave()
    }

    private func broadcast(_ payload: [String: Any]) {
        if let data = try? JSONSerialization.data(withJSONObject: payload),
           let s = String(data: data, encoding: .utf8) {
            for c in sseClients.values { c.write("data: \(s)\n\n") }
        }
        publishSummary()
    }

    func addSSE(_ conn: HTTPConnection) {
        conn.startStream(headers: ["Content-Type": "text/event-stream", "Cache-Control": "no-cache"])
        conn.write("retry: 2000\n\n")
        sseClients[conn.id] = conn
        conn.onClose { [weak self] in self?.sseClients[conn.id] = nil }
    }

    private func fireWebhooks(_ type: String, _ payload: [String: Any]) {
        for (i, hook) in db.webhooks.enumerated() where hook.active {
            guard hook.events.contains("*") || hook.events.contains(type) || hook.events.contains(where: { $0.hasSuffix(".*") && type.hasPrefix(String($0.dropLast(1))) }) else { continue }
            sendWebhook(index: i, hook: hook, payload: payload)
        }
    }

    func sendWebhook(index: Int, hook: Webhook, payload: [String: Any]) {
        guard let url = URL(string: hook.url) else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.timeoutInterval = 10
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Dirigent/\(Hub.version)", forHTTPHeaderField: "User-Agent")
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)
        let hookId = hook.id
        URLSession.shared.dataTask(with: req) { [weak self] _, resp, err in
            let status = err != nil ? "Fehler: \(err!.localizedDescription)" : "HTTP \((resp as? HTTPURLResponse)?.statusCode ?? 0)"
            self?.queue.async {
                if let i = self?.db.webhooks.firstIndex(where: { $0.id == hookId }) {
                    self?.db.webhooks[i].lastStatus = status
                    self?.scheduleSave()
                }
            }
        }.resume()
    }

    func publishSummary() {
        let s = HubSummary(agents: db.agents.count,
                           waiting: db.agents.filter { waiters[$0.id] != nil }.count,
                           working: db.agents.filter { status(of: $0) == "working" }.count,
                           queued: db.tasks.filter { $0.status == "queued" }.count,
                           running: db.tasks.filter { $0.status == "running" }.count,
                           serverError: serverError, port: db.settings.port)
        let cb = onSummary
        DispatchQueue.main.async { cb?(s) }
    }

    // MARK: Agenten

    func status(of a: Agent) -> String {
        if waiters[a.id] != nil { return "waiting" }
        if db.tasks.contains(where: { $0.assignedAgentId == a.id && $0.status == "running" }) { return "working" }
        // Zwischen zwei Long-Polls (Timeout + Neustart der Schleife) weiter als bereit anzeigen
        if lastStatuses[a.id] == "waiting" && nowMs() - a.lastSeen < 15_000 { return "waiting" }
        if nowMs() - a.lastSeen < 90_000 { return "idle" }
        return "offline"
    }

    func agentIndex(_ ref: String) -> Int? {
        if let i = db.agents.firstIndex(where: { $0.id == ref }) { return i }
        return db.agents.firstIndex(where: { $0.name.lowercased() == ref.lowercased() })
    }

    func agentJSON(_ a: Agent) -> [String: Any] {
        var o = toJSONObject(a) as? [String: Any] ?? [:]
        o["status"] = status(of: a)
        o["runningTasks"] = db.tasks.filter { $0.assignedAgentId == a.id && $0.status == "running" }.map { $0.id }
        o["queuedForMe"] = db.tasks.filter { $0.status == "queued" && ($0.target == "agent:\(a.id)" || $0.target.lowercased() == "agent:\(a.name.lowercased())") }.count
        return o
    }

    static let palette = ["#8B5CF6", "#06B6D4", "#F59E0B", "#10B981", "#EC4899", "#3B82F6", "#EF4444", "#14B8A6", "#A855F7", "#F97316"]

    func registerAgent(_ p: [String: Any]) -> Agent {
        let name = (p.str("name") ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let finalName = name.isEmpty ? "Agent-\(db.agents.count + 1)" : name
        let t = nowMs()
        if let i = agentIndex(finalName) {
            // Wiederanmeldung: bestehenden Eintrag aktualisieren
            if let r = p.str("role"), !r.isEmpty { db.agents[i].role = r == "manager" ? "manager" : "worker" }
            if let tags = p.strings("tags"), !tags.isEmpty { db.agents[i].tags = tags }
            if let d = p.str("description"), !d.isEmpty { db.agents[i].description = d }
            if let c = p.str("cwd"), !c.isEmpty { db.agents[i].cwd = c }
            if let m = p.str("model"), !m.isEmpty { db.agents[i].model = m }
            db.agents[i].lastSeen = t
            emit("agent.registered", "\(db.agents[i].name) hat sich erneut angemeldet", ref: db.agents[i].id)
            return db.agents[i]
        }
        let a = Agent(id: makeId("ag", 6), name: finalName,
                      role: p.str("role") == "manager" ? "manager" : "worker",
                      tags: p.strings("tags") ?? [], description: p.str("description") ?? "",
                      cwd: p.str("cwd") ?? "", model: p.str("model") ?? "",
                      color: Hub.palette[db.agents.count % Hub.palette.count],
                      registeredAt: t, lastSeen: t, completed: 0, failed: 0)
        db.agents.append(a)
        emit("agent.registered", "\(a.name) hat sich angemeldet (\(a.role == "manager" ? "Manager" : "Worker"))", ref: a.id)
        return a
    }

    func updateAgent(_ i: Int, _ p: [String: Any]) {
        if let n = p.str("name"), !n.isEmpty { db.agents[i].name = n }
        if let r = p.str("role") { db.agents[i].role = r == "manager" ? "manager" : "worker" }
        if let tags = p.strings("tags") { db.agents[i].tags = tags }
        if let d = p.str("description") { db.agents[i].description = d }
        if let c = p.str("color"), !c.isEmpty { db.agents[i].color = c }
        emit("agent.updated", "\(db.agents[i].name) aktualisiert", ref: db.agents[i].id)
    }

    func removeAgent(_ i: Int) {
        let a = db.agents[i]
        if let w = waiters.removeValue(forKey: a.id) {
            w.timer.cancel()
            w.conn.send(.text("Du wurdest von Dirigent abgemeldet. Keine weiteren Aufträge.\n", status: 410))
        }
        for j in db.tasks.indices where db.tasks[j].assignedAgentId == a.id && db.tasks[j].status == "running" {
            db.tasks[j].status = "queued"; db.tasks[j].assignedAgentId = nil; db.tasks[j].startedAt = nil
        }
        db.agents.remove(at: i)
        emit("agent.removed", "\(a.name) wurde entfernt", ref: a.id)
        dispatch()
    }

    /// Agent wartet (Long-Poll). Verbindung bleibt offen, bis ein Auftrag kommt oder das Timeout abläuft.
    func addWaiter(agentId: String, conn: HTTPConnection, timeout: Double, json: Bool, base: String) {
        guard let i = db.agents.firstIndex(where: { $0.id == agentId }) else { return }
        if let old = waiters.removeValue(forKey: agentId) {
            old.timer.cancel()
            old.conn.send(.noContent)
        }
        // Kurze Lücken zwischen zwei Long-Polls gelten nicht als neue Bereitschaft
        let wasWaiting = ["waiting", "idle"].contains(lastStatuses[agentId] ?? "")
        db.agents[i].lastSeen = nowMs()
        let timer = DispatchSource.makeTimerSource(queue: queue)
        timer.schedule(deadline: .now() + timeout)
        let connId = conn.id
        timer.setEventHandler { [weak self] in
            guard let self = self, let w = self.waiters[agentId], w.conn.id == connId else { return }
            self.waiters[agentId] = nil
            if let j = self.db.agents.firstIndex(where: { $0.id == agentId }) { self.db.agents[j].lastSeen = nowMs() }
            w.conn.send(.noContent)
        }
        timer.resume()
        waiters[agentId] = Waiter(conn: conn, json: json, timer: timer, base: base)
        conn.onClose { [weak self] in
            guard let self = self, let w = self.waiters[agentId], w.conn.id == connId else { return }
            w.timer.cancel()
            self.waiters[agentId] = nil
            if let j = self.db.agents.firstIndex(where: { $0.id == agentId }) { self.db.agents[j].lastSeen = nowMs() }
            self.changed()
        }
        lastStatuses[agentId] = "waiting"
        if !wasWaiting { emit("agent.waiting", "\(db.agents[i].name) ist bereit", ref: agentId) } else { publishSummary() }
        dispatch()
    }

    private func checkPresence() {
        var any = false
        for a in db.agents {
            let s = status(of: a)
            let old = lastStatuses[a.id]
            if old != s {
                lastStatuses[a.id] = s
                any = true
                if s == "offline" && old != nil { emit("agent.offline", "\(a.name) ist offline", ref: a.id) }
            }
        }
        if any { changed() }
    }

    // MARK: Aufträge

    enum HubError: Error { case msg(String) }

    func resolveTarget(_ raw: String) -> String {
        let t = raw.trimmingCharacters(in: .whitespaces)
        if t.isEmpty { return "any" }
        if ["any", "manager", "all"].contains(t.lowercased()) { return t.lowercased() }
        if t.hasPrefix("agent:") || t.hasPrefix("tag:") { return t }
        if let i = agentIndex(t) { return "agent:\(db.agents[i].id)" }
        return "tag:\(t)"
    }

    @discardableResult
    func createTasks(prompt: String, title: String?, target rawTarget: String, createdBy: String,
                     parentId: String? = nil, notifyAgentId: String? = nil, templateId: String? = nil,
                     runId: String? = nil, stepIndex: Int? = nil, priority: Int = 0, kind: String = "task") -> Result<[TaskItem], HubError> {
        let prompt = prompt.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !prompt.isEmpty else { return .failure(.msg("Prompt fehlt")) }
        let target = resolveTarget(rawTarget)
        var targets: [String] = [target]
        if target == "all" {
            let creator = createdBy.hasPrefix("agent:") ? String(createdBy.dropFirst(6)) : ""
            targets = db.agents.filter { $0.id != creator && $0.role != "manager" }.map { "agent:\($0.id)" }
            if targets.isEmpty { return .failure(.msg("Keine Worker-Agenten angemeldet")) }
        }
        if target.hasPrefix("agent:") {
            let ref = String(target.dropFirst(6))
            guard let i = agentIndex(ref) else { return .failure(.msg("Agent '\(ref)' unbekannt")) }
            targets = ["agent:\(db.agents[i].id)"]
        }
        let autoTitle: String = {
            if let t = title, !t.trimmingCharacters(in: .whitespaces).isEmpty { return t }
            let first = prompt.split(separator: "\n").first.map(String.init) ?? prompt
            return first.count > 70 ? String(first.prefix(67)) + "…" : first
        }()
        var created: [TaskItem] = []
        for tg in targets {
            let t = TaskItem(id: makeId("t"), title: autoTitle, prompt: prompt, target: tg, status: "queued",
                             assignedAgentId: nil, result: nil, error: nil, progress: [], createdAt: nowMs(),
                             startedAt: nil, finishedAt: nil, createdBy: createdBy, parentId: parentId,
                             notifyAgentId: notifyAgentId, templateId: templateId, runId: runId, stepIndex: stepIndex,
                             priority: priority, kind: kind)
            db.tasks.append(t)
            created.append(t)
            emit("task.created", "Neuer Auftrag: \(t.title) → \(targetLabel(tg))", ref: t.id, data: toJSONObject(t))
        }
        pruneTasks()
        dispatch()
        return .success(created.map { task($0.id) ?? $0 })
    }

    func task(_ id: String) -> TaskItem? { db.tasks.first(where: { $0.id == id }) }

    func targetLabel(_ t: String) -> String {
        if t == "any" { return "beliebiger Worker" }
        if t == "manager" { return "Manager" }
        if t == "all" { return "alle" }
        if t.hasPrefix("agent:"), let i = agentIndex(String(t.dropFirst(6))) { return db.agents[i].name }
        if t.hasPrefix("tag:") { return "#" + t.dropFirst(4) }
        return t
    }

    private func pruneTasks() {
        let limit = 3000
        guard db.tasks.count > limit else { return }
        var remove = db.tasks.count - limit
        db.tasks.removeAll { t in
            if remove > 0 && ["done", "failed", "cancelled"].contains(t.status) { remove -= 1; return true }
            return false
        }
    }

    /// Wartende Aufträge an bereite Agenten verteilen.
    func dispatch() {
        let queued = db.tasks.indices.filter { db.tasks[$0].status == "queued" }
            .sorted { a, b in
                let x = db.tasks[a], y = db.tasks[b]
                return x.priority != y.priority ? x.priority > y.priority : x.createdAt < y.createdAt
            }
        for i in queued {
            guard !waiters.isEmpty else { return }
            guard let agentId = pickAgent(for: db.tasks[i]) else { continue }
            deliver(taskIndex: i, agentId: agentId)
        }
    }

    private func pickAgent(for t: TaskItem) -> String? {
        let ready = db.agents.filter { waiters[$0.id] != nil }
        let load = { (a: Agent) in self.db.tasks.filter { $0.assignedAgentId == a.id && $0.status == "running" }.count }
        let best = { (list: [Agent]) in list.min(by: { load($0) != load($1) ? load($0) < load($1) : $0.lastSeen < $1.lastSeen })?.id }
        if t.target.hasPrefix("agent:") {
            let ref = String(t.target.dropFirst(6))
            return ready.first(where: { $0.id == ref || $0.name.lowercased() == ref.lowercased() })?.id
        }
        if t.target.hasPrefix("tag:") {
            let tag = t.target.dropFirst(4).lowercased()
            return best(ready.filter { $0.tags.contains(where: { $0.lowercased() == tag }) })
        }
        if t.target == "manager" { return best(ready.filter { $0.role == "manager" }) }
        return best(ready.filter { $0.role != "manager" })
    }

    private func deliver(taskIndex i: Int, agentId: String) {
        guard let w = waiters.removeValue(forKey: agentId),
              let ai = db.agents.firstIndex(where: { $0.id == agentId }) else { return }
        w.timer.cancel()
        db.tasks[i].status = "running"
        db.tasks[i].assignedAgentId = agentId
        db.tasks[i].startedAt = nowMs()
        db.agents[ai].lastSeen = nowMs()
        lastStatuses[agentId] = "working"
        let t = db.tasks[i]
        let agent = db.agents[ai]
        let base = w.base
        let resp: HTTPResponse = w.json ? .json(["task": toJSONObject(t)]) : .text(Texts.task(t, agent: agent, hub: self, base: base))
        let taskId = t.id
        w.conn.send(resp) { [weak self] ok in
            guard let self = self, !ok, let j = self.db.tasks.firstIndex(where: { $0.id == taskId }), self.db.tasks[j].status == "running" else { return }
            // Zustellung fehlgeschlagen → zurück in die Warteschlange
            self.db.tasks[j].status = "queued"; self.db.tasks[j].assignedAgentId = nil; self.db.tasks[j].startedAt = nil
            self.changed()
        }
        emit("task.started", "\(agent.name) arbeitet an: \(t.title)", ref: t.id, data: toJSONObject(t))
    }

    /// Blockiert eine Verbindung, bis der Auftrag abgeschlossen ist.
    func waitForTask(_ id: String, conn: HTTPConnection, timeout: Double) {
        let timer = DispatchSource.makeTimerSource(queue: queue)
        timer.schedule(deadline: .now() + timeout)
        let cid = conn.id
        timer.setEventHandler { [weak self] in
            self?.taskWaiters[id]?.removeAll { $0.conn.id == cid }
            conn.send(.noContent)
        }
        timer.resume()
        taskWaiters[id, default: []].append((conn, timer))
        conn.onClose { [weak self] in
            timer.cancel()
            self?.taskWaiters[id]?.removeAll { $0.conn.id == cid }
        }
    }

    private func resolveTaskWaiters(_ t: TaskItem) {
        guard let list = taskWaiters.removeValue(forKey: t.id) else { return }
        for w in list { w.timer.cancel(); w.conn.send(.json(toJSONObject(t))) }
    }

    func addProgress(_ id: String, _ text: String) -> Result<TaskItem, HubError> {
        guard let i = db.tasks.firstIndex(where: { $0.id == id }) else { return .failure(.msg("Auftrag unbekannt")) }
        let txt = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !txt.isEmpty else { return .failure(.msg("Text fehlt")) }
        db.tasks[i].progress.append(ProgressEntry(time: nowMs(), text: txt))
        if let a = db.tasks[i].assignedAgentId, let ai = db.agents.firstIndex(where: { $0.id == a }) { db.agents[ai].lastSeen = nowMs() }
        emit("task.progress", "\(db.tasks[i].title): \(txt.prefix(120))", ref: id)
        return .success(db.tasks[i])
    }

    func finish(_ id: String, success: Bool, text: String) -> Result<TaskItem, HubError> {
        guard let i = db.tasks.firstIndex(where: { $0.id == id }) else { return .failure(.msg("Auftrag unbekannt")) }
        let st = db.tasks[i].status
        if st == "cancelled" { return .failure(.msg("Auftrag wurde abgebrochen – Ergebnis wird ignoriert")) }
        if st == "done" || st == "failed" { return .failure(.msg("Auftrag ist bereits abgeschlossen")) }
        let txt = text.trimmingCharacters(in: .whitespacesAndNewlines)
        db.tasks[i].status = success ? "done" : "failed"
        db.tasks[i].finishedAt = nowMs()
        if success { db.tasks[i].result = txt.isEmpty ? "(kein Ergebnistext)" : txt } else { db.tasks[i].error = txt.isEmpty ? "Unbekannter Fehler" : txt }
        var agentName = "?"
        if let a = db.tasks[i].assignedAgentId, let ai = db.agents.firstIndex(where: { $0.id == a }) {
            if success { db.agents[ai].completed += 1 } else { db.agents[ai].failed += 1 }
            db.agents[ai].lastSeen = nowMs()
            agentName = db.agents[ai].name
        }
        let t = db.tasks[i]
        emit(success ? "task.completed" : "task.failed",
             success ? "\(agentName) hat erledigt: \(t.title)" : "\(agentName) meldet Fehler: \(t.title)",
             ref: t.id, data: toJSONObject(t))
        if db.settings.notifications && t.kind != "notification" {
            let cb = onNotify
            let body = (success ? t.result : t.error) ?? ""
            DispatchQueue.main.async { cb?(success ? "✅ \(agentName): \(t.title)" : "⚠️ \(agentName): \(t.title)", String(body.prefix(200))) }
        }
        // Rückmeldung an den delegierenden Agenten (z. B. Manager)
        if let n = t.notifyAgentId, db.agents.contains(where: { $0.id == n }) {
            let body = """
            Rückmeldung zu deinem delegierten Auftrag "\(t.title)" (ID \(t.id)).
            Bearbeitet von: \(agentName)
            Status: \(success ? "ERLEDIGT" : "FEHLGESCHLAGEN")
            \(t.parentId.map { "Gehört zu deinem Auftrag: \($0)\n" } ?? "")
            --- \(success ? "Ergebnis" : "Fehler") ---
            \(success ? (t.result ?? "") : (t.error ?? ""))
            """
            _ = createTasks(prompt: body, title: "Rückmeldung: \(t.title)", target: "agent:\(n)", createdBy: "system",
                            parentId: t.parentId, priority: 5, kind: "notification")
        }
        resolveTaskWaiters(t)
        if let runId = t.runId { advanceRun(runId, finished: t) }
        dispatch()
        return .success(t)
    }

    func cancel(_ id: String) -> Result<TaskItem, HubError> {
        guard let i = db.tasks.firstIndex(where: { $0.id == id }) else { return .failure(.msg("Auftrag unbekannt")) }
        guard ["queued", "running"].contains(db.tasks[i].status) else { return .failure(.msg("Auftrag ist nicht aktiv")) }
        db.tasks[i].status = "cancelled"
        db.tasks[i].finishedAt = nowMs()
        emit("task.cancelled", "Abgebrochen: \(db.tasks[i].title)", ref: id)
        resolveTaskWaiters(db.tasks[i])
        if let r = db.tasks[i].runId, let ri = db.runs.firstIndex(where: { $0.id == r }), db.runs[ri].status == "running" {
            db.runs[ri].status = "cancelled"; db.runs[ri].finishedAt = nowMs()
        }
        return .success(db.tasks[i])
    }

    func retry(_ id: String) -> Result<TaskItem, HubError> {
        guard let i = db.tasks.firstIndex(where: { $0.id == id }) else { return .failure(.msg("Auftrag unbekannt")) }
        db.tasks[i].status = "queued"
        db.tasks[i].assignedAgentId = nil
        db.tasks[i].result = nil
        db.tasks[i].error = nil
        db.tasks[i].startedAt = nil
        db.tasks[i].finishedAt = nil
        db.tasks[i].progress = []
        emit("task.retried", "Erneut eingereiht: \(db.tasks[i].title)", ref: id)
        dispatch()
        return .success(db.tasks[i])
    }

    // MARK: Vorlagen & Workflows

    static func render(_ s: String, _ vars: [String: String]) -> String {
        var out = s
        for (k, v) in vars { out = out.replacingOccurrences(of: "{{\(k)}}", with: v) }
        return out
    }

    func runTemplate(_ id: String, vars: [String: String], target: String?, createdBy: String, priority: Int = 0) -> Result<[TaskItem], HubError> {
        guard let i = db.templates.firstIndex(where: { $0.id == id || $0.name.lowercased() == id.lowercased() }) else { return .failure(.msg("Vorlage unbekannt")) }
        let tpl = db.templates[i]
        db.templates[i].lastRunAt = nowMs()
        return createTasks(prompt: Hub.render(tpl.prompt, vars), title: tpl.name,
                           target: (target?.isEmpty == false ? target! : tpl.target), createdBy: createdBy,
                           templateId: tpl.id, priority: priority)
    }

    private func runSchedules() {
        let t = nowMs()
        for tpl in db.templates where tpl.scheduleMinutes > 0 {
            let due = tpl.lastRunAt.map { t - $0 >= Double(tpl.scheduleMinutes) * 60_000 } ?? true
            let pending = db.tasks.contains { $0.templateId == tpl.id && $0.status == "queued" }
            if due && !pending { _ = runTemplate(tpl.id, vars: [:], target: nil, createdBy: "zeitplan") }
        }
    }

    func startRun(_ wfId: String, input: String, createdBy: String) -> Result<WorkflowRun, HubError> {
        guard let wf = db.workflows.first(where: { $0.id == wfId || $0.name.lowercased() == wfId.lowercased() }) else { return .failure(.msg("Workflow unbekannt")) }
        guard !wf.steps.isEmpty else { return .failure(.msg("Workflow hat keine Schritte")) }
        let run = WorkflowRun(id: makeId("run"), workflowId: wf.id, workflowName: wf.name, input: input, status: "running",
                              currentStep: 0, stepCount: wf.steps.count, taskIds: [], results: [], createdAt: nowMs(), finishedAt: nil)
        db.runs.append(run)
        if db.runs.count > 300 { db.runs.removeFirst(db.runs.count - 300) }
        emit("workflow.started", "Workflow gestartet: \(wf.name)", ref: run.id)
        if let err = createStepTask(run.id, createdBy: createdBy) { return .failure(err) }
        return .success(db.runs.first(where: { $0.id == run.id })!)
    }

    private func createStepTask(_ runId: String, createdBy: String) -> HubError? {
        guard let ri = db.runs.firstIndex(where: { $0.id == runId }),
              let wf = db.workflows.first(where: { $0.id == db.runs[ri].workflowId }) else { return .msg("Workflow fehlt") }
        let run = db.runs[ri]
        guard run.currentStep < wf.steps.count else { return nil }
        let step = wf.steps[run.currentStep]
        var prompt = step.prompt
        var target = step.target
        if let tid = step.templateId, let tpl = db.templates.first(where: { $0.id == tid }) {
            if prompt.trimmingCharacters(in: .whitespaces).isEmpty { prompt = tpl.prompt }
            if target.isEmpty { target = tpl.target }
        }
        if prompt.trimmingCharacters(in: .whitespaces).isEmpty { prompt = "{{input}}\n\n{{prev}}" }
        var vars: [String: String] = ["input": run.input, "prev": run.results.last ?? run.input, "scope": "die jüngsten Änderungen"]
        for (n, r) in run.results.enumerated() { vars["step\(n + 1)"] = r }
        let fullPrompt = Hub.render(prompt, vars) + "\n\n(Workflow \"\(wf.name)\", Schritt \(run.currentStep + 1)/\(wf.steps.count): \(step.name))"
        switch createTasks(prompt: fullPrompt, title: "\(wf.name) · \(step.name)", target: target.isEmpty ? "any" : target,
                           createdBy: createdBy, runId: runId, stepIndex: run.currentStep) {
        case .success(let ts):
            if let ri2 = db.runs.firstIndex(where: { $0.id == runId }) { db.runs[ri2].taskIds.append(contentsOf: ts.map { $0.id }) }
            return nil
        case .failure(let e):
            db.runs[ri].status = "failed"; db.runs[ri].finishedAt = nowMs()
            return e
        }
    }

    private func advanceRun(_ runId: String, finished t: TaskItem) {
        guard let ri = db.runs.firstIndex(where: { $0.id == runId }), db.runs[ri].status == "running" else { return }
        if t.status == "failed" {
            db.runs[ri].status = "failed"; db.runs[ri].finishedAt = nowMs()
            emit("workflow.failed", "Workflow fehlgeschlagen: \(db.runs[ri].workflowName)", ref: runId)
            return
        }
        db.runs[ri].results.append(t.result ?? "")
        db.runs[ri].currentStep += 1
        if db.runs[ri].currentStep >= db.runs[ri].stepCount {
            db.runs[ri].status = "done"; db.runs[ri].finishedAt = nowMs()
            emit("workflow.completed", "Workflow abgeschlossen: \(db.runs[ri].workflowName)", ref: runId,
                 data: toJSONObject(db.runs[ri]))
        } else {
            _ = createStepTask(runId, createdBy: "workflow:\(runId)")
        }
    }

    // MARK: Snapshot

    func baseURL(_ req: HTTPRequest?) -> String {
        if let h = req?.host, !h.isEmpty { return "http://\(h)" }
        return "http://127.0.0.1:\(db.settings.port)"
    }

    func snapshot() -> [String: Any] {
        let tasks = db.tasks.suffix(400)
        var settings = toJSONObject(db.settings) as? [String: Any] ?? [:]
        settings["hasApiKey"] = !db.settings.apiKey.isEmpty
        return [
            "agents": db.agents.map { agentJSON($0) },
            "tasks": tasks.map { toJSONObject($0) },
            "templates": db.templates.map { toJSONObject($0) },
            "workflows": db.workflows.map { toJSONObject($0) },
            "runs": db.runs.suffix(100).map { toJSONObject($0) },
            "webhooks": db.webhooks.map { toJSONObject($0) },
            "events": db.events.suffix(200).map { toJSONObject($0) },
            "settings": settings,
            "server": [
                "version": Hub.version, "port": db.settings.port, "lanAccess": db.settings.lanAccess,
                "addresses": Hub.lanAddresses(), "startedAt": startedAt, "error": serverError as Any,
                "dataPath": dataURL.path, "stats": [
                    "total": db.tasks.count,
                    "done": db.tasks.filter { $0.status == "done" }.count,
                    "failed": db.tasks.filter { $0.status == "failed" }.count
                ]
            ]
        ]
    }

    static func lanAddresses() -> [String] {
        var out: [String] = []
        var ifaddr: UnsafeMutablePointer<ifaddrs>?
        guard getifaddrs(&ifaddr) == 0, let first = ifaddr else { return out }
        defer { freeifaddrs(ifaddr) }
        for ptr in sequence(first: first, next: { $0.pointee.ifa_next }) {
            let flags = Int32(ptr.pointee.ifa_flags)
            guard let addr = ptr.pointee.ifa_addr, addr.pointee.sa_family == UInt8(AF_INET),
                  (flags & IFF_UP) != 0, (flags & IFF_LOOPBACK) == 0 else { continue }
            var host = [CChar](repeating: 0, count: Int(NI_MAXHOST))
            if getnameinfo(addr, socklen_t(addr.pointee.sa_len), &host, socklen_t(host.count), nil, 0, NI_NUMERICHOST) == 0 {
                out.append(String(cString: host))
            }
        }
        return out
    }
}
