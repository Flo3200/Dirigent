import Foundation

/// Beschreibung aller Endpunkte – für die Oberfläche und für Maschinen (GET /api/docs).
let apiDocs: [[String: String]] = [
    ["method": "GET", "path": "/join", "desc": "Anmelde-Anleitung für Agenten (Text). Optional ?name=&role=&tags="],
    ["method": "GET", "path": "/api/overview", "desc": "Kompakter Text-Überblick über Agenten und Aufträge"],
    ["method": "GET", "path": "/api/state", "desc": "Kompletter Zustand als JSON (Agenten, Aufträge, Vorlagen, …)"],
    ["method": "GET", "path": "/api/events", "desc": "Live-Ereignisse als Server-Sent Events"],
    ["method": "GET", "path": "/api/docs", "desc": "Diese Endpunkt-Liste als JSON"],
    ["method": "GET", "path": "/api/agents", "desc": "Alle Agenten mit Status"],
    ["method": "POST", "path": "/api/agents", "desc": "Agent registrieren: name, role (worker|manager), tags, description, cwd, model, supervisor. ?format=text liefert Anleitung"],
    ["method": "GET", "path": "/api/agents/:id", "desc": "Einzelnen Agenten abrufen"],
    ["method": "PATCH", "path": "/api/agents/:id", "desc": "Agent ändern (name, role, tags, description, color, supervisor)"],
    ["method": "DELETE", "path": "/api/agents/:id", "desc": "Agent abmelden/entfernen"],
    ["method": "GET", "path": "/api/agents/:id/wait", "desc": "Long-Poll: blockiert bis ein Auftrag kommt (Text; ?format=json). 204 bei Timeout (?timeout=Sek.)"],
    ["method": "GET", "path": "/api/tasks", "desc": "Aufträge auflisten (?status=&agent=&limit=)"],
    ["method": "POST", "path": "/api/tasks", "desc": "Auftrag erstellen. JSON {prompt,title,target,priority,parent,from,notify} ODER Query-Parameter + Rohtext-Body als Prompt"],
    ["method": "GET", "path": "/api/tasks/:id", "desc": "Auftrag abrufen (?format=text)"],
    ["method": "PATCH", "path": "/api/tasks/:id", "desc": "Wartenden Auftrag ändern (title, prompt, target, priority)"],
    ["method": "DELETE", "path": "/api/tasks/:id", "desc": "Auftrag löschen"],
    ["method": "POST", "path": "/api/tasks/:id/complete", "desc": "Ergebnis melden (Rohtext oder JSON {result})"],
    ["method": "POST", "path": "/api/tasks/:id/fail", "desc": "Fehler melden (Rohtext oder JSON {error})"],
    ["method": "POST", "path": "/api/tasks/:id/progress", "desc": "Zwischenstand melden (Rohtext)"],
    ["method": "POST", "path": "/api/tasks/:id/cancel", "desc": "Auftrag abbrechen"],
    ["method": "POST", "path": "/api/tasks/:id/retry", "desc": "Auftrag erneut einreihen"],
    ["method": "GET", "path": "/api/tasks/:id/wait", "desc": "Blockiert bis der Auftrag abgeschlossen ist (?timeout=Sek.)"],
    ["method": "GET", "path": "/api/templates", "desc": "Vorlagen auflisten"],
    ["method": "POST", "path": "/api/templates", "desc": "Vorlage anlegen: name, description, prompt (mit {{variablen}}), target, icon, scheduleMinutes"],
    ["method": "PUT", "path": "/api/templates/:id", "desc": "Vorlage ändern"],
    ["method": "DELETE", "path": "/api/templates/:id", "desc": "Vorlage löschen"],
    ["method": "POST", "path": "/api/templates/:id/run", "desc": "Vorlage ausführen: {vars:{…}, target, priority, from, notify}"],
    ["method": "GET", "path": "/api/workflows", "desc": "Workflows auflisten"],
    ["method": "POST", "path": "/api/workflows", "desc": "Workflow anlegen: name, description, steps[{name, templateId, prompt, target}]"],
    ["method": "PUT", "path": "/api/workflows/:id", "desc": "Workflow ändern"],
    ["method": "DELETE", "path": "/api/workflows/:id", "desc": "Workflow löschen"],
    ["method": "POST", "path": "/api/workflows/:id/run", "desc": "Workflow starten: {input}. Variablen: {{input}}, {{prev}}, {{step1}}…"],
    ["method": "GET", "path": "/api/runs/:id", "desc": "Workflow-Lauf abrufen"],
    ["method": "POST", "path": "/api/runs/:id/cancel", "desc": "Workflow-Lauf abbrechen"],
    ["method": "POST", "path": "/api/tasks/:id/ask", "desc": "Rückfrage des Agenten (Rohtext) → an seinen Manager/Vorgesetzten bzw. den Nutzer. Antwort enthält Warte-Befehl"],
    ["method": "POST", "path": "/api/tasks/:id/message", "desc": "Nachricht an den Agenten des Auftrags ({text, urgent}; to=manager → Ergänzung an den zuständigen Manager)"],
    ["method": "GET", "path": "/api/tasks/:id/doc", "desc": "Beschreibungsdatei des Auftrags (.dirigent/…md)"],
    ["method": "POST", "path": "/api/agents/:id/messages", "desc": "Direkte Nachricht an einen Agenten (Rohtext; from, task, urgent=1 = Unterbrechung)"],
    ["method": "GET", "path": "/api/agents/:id/inbox", "desc": "Offene Nachrichten abholen (Text; ?format=json)"],
    ["method": "GET", "path": "/api/agents/:id/transcript", "desc": "Live-Protokoll der Claude-Code-Sitzung (?since=ms&limit=)"],
    ["method": "GET", "path": "/api/messages", "desc": "Nachrichten (?agent=&task=&project=&open=1)"],
    ["method": "POST", "path": "/api/messages", "desc": "Nachricht senden: to (agent:<name>|user), text, from, task, project, urgent, kind"],
    ["method": "POST", "path": "/api/messages/:id/answer", "desc": "Rückfrage beantworten (Rohtext)"],
    ["method": "POST", "path": "/api/messages/:id/escalate", "desc": "Rückfrage an den Vorgesetzten bzw. Nutzer weiterleiten"],
    ["method": "GET", "path": "/api/messages/:id/wait", "desc": "Long-Poll: blockiert bis die Rückfrage beantwortet ist (Text)"],
    ["method": "POST", "path": "/api/projects/:id/message", "desc": "Ergänzung an den Projekt-Manager – er zerlegt sie und verteilt sie an die Agenten"],
    ["method": "GET", "path": "/api/projects", "desc": "Projekte auflisten"],
    ["method": "POST", "path": "/api/projects", "desc": "Projekt anlegen: name, goal, cwd, manager, requireReview (Standard true), plan (Standard true = Planung beim Manager anfordern)"],
    ["method": "GET", "path": "/api/projects/:id", "desc": "Projekt abrufen (?format=text = Überblick für Agenten)"],
    ["method": "PATCH", "path": "/api/projects/:id", "desc": "Projekt ändern (name, goal, cwd, manager, requireReview, summary)"],
    ["method": "DELETE", "path": "/api/projects/:id", "desc": "Projekt löschen (bricht laufende Aufträge ab)"],
    ["method": "POST", "path": "/api/projects/:id/plan", "desc": "Manager reicht Plan ein (JSON): {summary, standards:[{category,title,rule,mandatory}], parts:[{key,name,goal,prompt,acceptance[],paths[],tags[],dependsOn[],suggestedAgent}]}"],
    ["method": "POST", "path": "/api/projects/:id/replan", "desc": "Überarbeitung beim Manager anfordern (Rohtext oder {feedback})"],
    ["method": "POST", "path": "/api/projects/:id/approve", "desc": "Alle Entwürfe freigeben (optional {parts:[ids]})"],
    ["method": "POST", "path": "/api/projects/:id/cancel", "desc": "Projekt abbrechen"],
    ["method": "POST", "path": "/api/projects/:id/standards", "desc": "Standard ergänzen: category, title, rule, mandatory · PATCH/DELETE …/standards/:sid"],
    ["method": "POST", "path": "/api/projects/:id/parts", "desc": "Teilbereich ergänzen · PATCH …/parts/:pid (Inhalt im Entwurf, agentId = einteilen) · DELETE"],
    ["method": "POST", "path": "/api/projects/:id/parts/:pid/approve", "desc": "Teilbereich freigeben → Worker erhält den Auftrag (sobald Abhängigkeiten abgenommen sind)"],
    ["method": "POST", "path": "/api/projects/:id/parts/:pid/unapprove", "desc": "Freigabe zurückziehen (nur vor Arbeitsbeginn)"],
    ["method": "POST", "path": "/api/projects/:id/parts/:pid/accept", "desc": "Abgelieferten Teilbereich abnehmen (Rohtext = Notiz)"],
    ["method": "POST", "path": "/api/projects/:id/parts/:pid/rework", "desc": "Nacharbeit anfordern (Rohtext oder {note, prompt}) → zurück in den Entwurf, erneute Freigabe nötig"],
    ["method": "GET", "path": "/api/webhooks", "desc": "Webhooks auflisten"],
    ["method": "POST", "path": "/api/webhooks", "desc": "Webhook anlegen: url, events ([\"*\"] oder z. B. task.completed, agent.*)"],
    ["method": "PATCH", "path": "/api/webhooks/:id", "desc": "Webhook ändern (active, url, events)"],
    ["method": "DELETE", "path": "/api/webhooks/:id", "desc": "Webhook löschen"],
    ["method": "POST", "path": "/api/webhooks/:id/test", "desc": "Test-Ereignis senden"],
    ["method": "PUT", "path": "/api/settings", "desc": "Einstellungen: port, lanAccess, notifications"],
    ["method": "POST", "path": "/api/settings/apikey", "desc": "API-Key neu erzeugen ({clear:true} entfernt ihn)"],
]

extension Hub {

    func route(_ req: HTTPRequest, _ conn: HTTPConnection) {
        let r = handle(req, conn)
        if let r = r { conn.send(r) }
    }

    /// Gibt eine Antwort zurück – oder nil, wenn die Verbindung offen gehalten wird.
    private func handle(_ req: HTTPRequest, _ conn: HTTPConnection) -> HTTPResponse? {
        if req.method == "OPTIONS" { return .noContent }
        let parts = req.path.split(separator: "/").map(String.init)
        let text = req.wantsText
        let base = baseURL(req)

        // Statische Oberfläche
        if parts.first != "api" && parts.first != "join" { return serveStatic(req.path) }

        // Zugriffsschutz für Anfragen aus dem Netzwerk
        if !req.isLocal && !db.settings.apiKey.isEmpty {
            let auth = req.headers["authorization"]?.replacingOccurrences(of: "Bearer ", with: "")
            let key = req.headers["x-api-key"] ?? auth ?? req.query["key"]
            if key != db.settings.apiKey { return .error("API-Key fehlt oder ist falsch", status: 401, text: text) }
        }

        if parts == ["join"] || parts == ["api", "join"] {
            return .text(Texts.join(base: base, name: req.query["name"], role: req.query["role"], tags: req.query["tags"], supervisor: req.query["supervisor"]))
        }
        guard parts.count >= 2 else {
            return .text("🎼 Dirigent API \(Hub.version)\nAnleitung für Agenten: \(base)/join\nEndpunkte: \(base)/api/docs\n")
        }
        let p = req.params
        let m = req.method
        let id = parts.count >= 3 ? parts[2] : ""
        let action = parts.count >= 4 ? parts[3] : ""
        let creator = p.str("from").map { "agent:\($0)" } ?? (req.headers["x-agent-id"].map { "agent:\($0)" } ?? "api")

        switch parts[1] {
        case "state": return .json(snapshot())
        case "docs": return .json(["endpoints": apiDocs, "targets": ["any", "manager", "all", "agent:<id|name>", "tag:<tag>", "team:<manager>"], "version": Hub.version])
        case "overview": return .text(Texts.overview(hub: self))
        case "events":
            addSSE(conn)
            return nil

        // MARK: Agenten
        case "agents":
            if id.isEmpty {
                if m == "GET" { return .json(db.agents.map { agentJSON($0) }) }
                if m == "POST" {
                    let a = registerAgent(p)
                    return text ? .text(Texts.registered(a, base: base, hub: self)) : .json(["agent": agentJSON(a), "waitUrl": "\(base)/api/agents/\(a.id)/wait", "waitCommand": Texts.waitCommand(base, a.id)], status: 201)
                }
            }
            guard let i = agentIndex(id) else {
                return .text("Agent '\(id)' ist nicht (mehr) angemeldet. Neu anmelden: curl -s \(base)/join\n", status: 404)
            }
            let agentId = db.agents[i].id
            switch (m, action) {
            case ("GET", ""): return .json(agentJSON(db.agents[i]))
            case ("PATCH", ""), ("PUT", ""): updateAgent(i, p); return .json(agentJSON(db.agents[i]))
            case ("DELETE", ""): removeAgent(i); return .json(["ok": true])
            case ("GET", "wait"), ("POST", "wait"):
                let timeout = min(max(Double(req.query["timeout"] ?? "55") ?? 55, 1), 600)
                addWaiter(agentId: agentId, conn: conn, timeout: timeout, json: req.query["format"] == "json", base: base)
                return nil
            case ("GET", "instructions"): return .text(Texts.registered(db.agents[i], base: base, hub: self))
            case ("POST", "messages"):
                let raw: String = { if let j = req.json { return j.str("text") ?? "" }; if req.isForm { return p.str("text") ?? "" }; return req.bodyString }()
                guard !raw.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return .error("Text fehlt", text: text) }
                let fromRef = p.str("from").flatMap { agentIndex($0) }.map { "agent:\(db.agents[$0].id)" } ?? "user"
                let taskRef = p.str("task").flatMap { tr in db.tasks.first(where: { $0.id == tr }) }
                let m = sendMessage(from: fromRef, to: "agent:\(agentId)", text: raw, kind: p.str("kind") ?? "message", taskId: taskRef?.id,
                                    projectId: taskRef?.projectId, urgent: p.bool("urgent") ?? false)
                let how = isWaiting(agentId) || m.status == "delivered" ? "sofort zugestellt" : "wird beim nächsten Kontakt (Zwischenstand, Rückfrage, neuer Auftrag) zugestellt"
                return req.json == nil || text ? .text("✉️ Nachricht \(m.id) an \(db.agents[i].name) – \(how).\n") : .json(toJSONObject(m), status: 201)
            case ("GET", "inbox"):
                let inbox = takeInbox(agentId)
                if req.query["format"] == "json" { return .json(inbox.map { toJSONObject($0) }) }
                return .text(inbox.isEmpty ? "Keine neuen Nachrichten.\n" : Texts.inboxText(inbox, agent: db.agents[i], base: base, hub: self))
            case ("GET", "transcript"):
                guard req.isLocal || !db.settings.apiKey.isEmpty else { return .error("Live-Protokoll nur lokal oder mit API-Key", status: 401) }
                return .json(transcript(agentId: agentId, since: req.query["since"].flatMap(Double.init), limit: Int(req.query["limit"] ?? "300") ?? 300))
            default: break
            }

        // MARK: Aufträge
        case "tasks":
            if id.isEmpty {
                if m == "GET" {
                    var list = db.tasks
                    if let s = req.query["status"] { list = list.filter { $0.status == s } }
                    if let a = req.query["agent"], let ai = agentIndex(a) { list = list.filter { $0.assignedAgentId == db.agents[ai].id } }
                    let limit = Int(req.query["limit"] ?? "200") ?? 200
                    return .json(list.suffix(limit).map { toJSONObject($0) })
                }
                if m == "POST" {
                    var prompt = p.str("prompt") ?? ""
                    if prompt.isEmpty && req.json == nil && !req.isForm { prompt = req.bodyString }
                    let from = p.str("from")
                    let notify = p.bool("notify") ?? false
                    var notifyId: String? = nil
                    if notify, let f = from, let ai = agentIndex(f) { notifyId = db.agents[ai].id }
                    let createdBy = from.flatMap { agentIndex($0) }.map { "agent:\(db.agents[$0].id)" } ?? (p.str("createdBy") ?? creator)
                    let wantsDoc = p.bool("doc") ?? docDefault
                    let docTitle = p.str("title").flatMap { $0.isEmpty ? nil : $0 } ?? String(prompt.split(separator: "\n").first ?? "auftrag")
                    let res = createTasks(prompt: prompt, title: p.str("title"), target: p.str("target") ?? "any",
                                          createdBy: createdBy, parentId: p.str("parent"), notifyAgentId: notifyId,
                                          priority: p.int("priority") ?? 0, docPath: wantsDoc ? Hub.taskDocPath(title: docTitle) : nil)
                    switch res {
                    case .success(let ts):
                        if text { return .text(ts.map { "✅ Auftrag \($0.id) erstellt → \(targetLabel($0.target))" }.joined(separator: "\n") + "\n") }
                        return .json(["tasks": ts.map { toJSONObject($0) }], status: 201)
                    case .failure(.msg(let e)): return .error(e, text: text)
                    }
                }
            }
            guard let ti = db.tasks.firstIndex(where: { $0.id == id }) else { return .error("Auftrag '\(id)' unbekannt", status: 404, text: true) }
            let bodyText: (String) -> String = { key in
                if let j = req.json { return j.str(key) ?? j.str("text") ?? "" }
                return req.bodyString
            }
            let reply: (Result<TaskItem, HubError>, String) -> HTTPResponse = { res, ok in
                switch res {
                case .success(let t): return req.query["format"] == "json" ? .json(toJSONObject(t)) : .text(ok + "\n")
                case .failure(.msg(let e)): return .error(e, status: 409, text: true)
                }
            }
            switch (m, action) {
            case ("GET", ""):
                let t = db.tasks[ti]
                if text {
                    return .text("\(t.title) [\(t.status)]\n\n\(t.prompt)\n\n--- Ergebnis ---\n\(t.result ?? t.error ?? "(noch keins)")\n")
                }
                return .json(toJSONObject(t))
            case ("PATCH", ""), ("PUT", ""):
                if let v = p.str("title") { db.tasks[ti].title = v }
                if let v = p.str("prompt"), db.tasks[ti].status == "queued" { db.tasks[ti].prompt = v }
                if let v = p.str("target"), db.tasks[ti].status == "queued" { db.tasks[ti].target = resolveTarget(v) }
                if let v = p.int("priority") { db.tasks[ti].priority = v }
                changed(); dispatch()
                return .json(toJSONObject(db.tasks[ti]))
            case ("DELETE", ""):
                let t = db.tasks.remove(at: ti)
                emit("task.deleted", "Gelöscht: \(t.title)", ref: t.id)
                return .json(["ok": true])
            case ("POST", "complete"), ("POST", "done"):
                return reply(finish(id, success: true, text: bodyText("result")),
                             "✅ Ergebnis gespeichert. Starte jetzt den Warte-Befehl wieder im Hintergrund und beende deinen Zug.")
            case ("POST", "fail"):
                return reply(finish(id, success: false, text: bodyText("error")),
                             "Fehler gespeichert. Starte jetzt den Warte-Befehl wieder im Hintergrund und beende deinen Zug.")
            case ("POST", "progress"):
                let res = addProgress(id, bodyText("text"))
                if case .success(let t) = res, let aid = t.assignedAgentId, let a = db.agents.first(where: { $0.id == aid }) {
                    let inbox = takeInbox(aid, taskId: t.id)
                    if req.query["format"] == "json" { return .json(["task": toJSONObject(t), "messages": inbox.map { toJSONObject($0) }]) }
                    let st = t.status == "cancelled" ? "\n⛔ Dieser Auftrag ist ABGEBROCHEN. Höre auf, melde kein Ergebnis und starte deinen Warte-Befehl im Hintergrund.\n" : ""
                    return .text("📝 Zwischenstand gespeichert.\n" + st + (inbox.isEmpty ? "Keine neuen Nachrichten.\n" : "\n" + Texts.inboxText(inbox, agent: a, base: base, hub: self)))
                }
                return reply(res, "📝 Zwischenstand gespeichert.")
            case ("POST", "ask"):
                switch ask(taskId: id, text: bodyText("question"), from: p.str("from")) {
                case .success(let q): return req.query["format"] == "json" ? .json(toJSONObject(q)) : .text(Texts.askedReply(q, base: base, hub: self))
                case .failure(.msg(let e)): return .error(e, status: 409, text: true)
                }
            case ("POST", "message"):
                // Nachricht an den Agenten dieses Auftrags (oder to=manager → an den zuständigen Manager)
                let t = db.tasks[ti]
                let msgText = bodyText("text")
                guard !msgText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return .error("Text fehlt", text: text) }
                let fromRef = p.str("from").flatMap { agentIndex($0) }.map { "agent:\(db.agents[$0].id)" } ?? "user"
                var to = t.assignedAgentId.map { "agent:\($0)" } ?? "task"
                var kind = "message"
                if p.str("to") == "manager" {
                    let sup = supervisorRef(task: t, agentId: t.assignedAgentId ?? "")
                    guard sup != "user" else { return .error("Kein zuständiger Manager für diesen Auftrag", status: 409, text: text) }
                    to = sup; kind = "supplement"
                }
                let m = sendMessage(from: fromRef, to: to, text: msgText, kind: kind, taskId: t.id, projectId: t.projectId, urgent: p.bool("urgent") ?? false)
                return text ? .text("✉️ Nachricht \(m.id) an \(partyName(to)) – wird beim nächsten Kontakt zugestellt.\n") : .json(toJSONObject(m), status: 201)
            case ("GET", "doc"):
                let t = db.tasks[ti]
                guard let d = readDoc(t) else { return .error(t.docPath == nil ? "Keine Beschreibungsdatei für diesen Auftrag" : "Beschreibungsdatei noch nicht angelegt (wird bei Zustellung erstellt)", status: 404, text: text) }
                return req.query["format"] == "json" ? .json(["path": t.docFile ?? "", "content": d]) : .text(d)
            case ("POST", "cancel"): return reply(cancel(id), "Abgebrochen.")
            case ("POST", "retry"): return reply(retry(id), "Erneut eingereiht.")
            case ("GET", "wait"):
                let t = db.tasks[ti]
                if !["queued", "running"].contains(t.status) { return .json(toJSONObject(t)) }
                let timeout = min(max(Double(req.query["timeout"] ?? "55") ?? 55, 1), 600)
                waitForTask(id, conn: conn, timeout: timeout)
                return nil
            default: break
            }

        // MARK: Vorlagen
        case "templates":
            if id.isEmpty {
                if m == "GET" { return .json(db.templates.map { toJSONObject($0) }) }
                if m == "POST" {
                    let t = Template(id: makeId("tpl"), name: p.str("name") ?? "Neue Vorlage", description: p.str("description") ?? "",
                                     prompt: p.str("prompt") ?? "", target: resolveTarget(p.str("target") ?? "any"),
                                     icon: p.str("icon") ?? "✨", scheduleMinutes: p.int("scheduleMinutes") ?? 0,
                                     lastRunAt: nil, createdAt: nowMs())
                    db.templates.append(t)
                    emit("template.created", "Vorlage angelegt: \(t.name)", ref: t.id)
                    return .json(toJSONObject(t), status: 201)
                }
            }
            guard let i = db.templates.firstIndex(where: { $0.id == id || $0.name.lowercased() == id.lowercased() }) else { return .error("Vorlage unbekannt", status: 404, text: text) }
            switch (m, action) {
            case ("GET", ""): return .json(toJSONObject(db.templates[i]))
            case ("PUT", ""), ("PATCH", ""):
                if let v = p.str("name") { db.templates[i].name = v }
                if let v = p.str("description") { db.templates[i].description = v }
                if let v = p.str("prompt") { db.templates[i].prompt = v }
                if let v = p.str("target") { db.templates[i].target = resolveTarget(v) }
                if let v = p.str("icon") { db.templates[i].icon = v }
                if let v = p.int("scheduleMinutes") { db.templates[i].scheduleMinutes = max(0, v) }
                emit("template.updated", "Vorlage geändert: \(db.templates[i].name)", ref: db.templates[i].id)
                return .json(toJSONObject(db.templates[i]))
            case ("DELETE", ""):
                let t = db.templates.remove(at: i)
                emit("template.deleted", "Vorlage gelöscht: \(t.name)", ref: t.id)
                return .json(["ok": true])
            case ("POST", "run"):
                var vars: [String: String] = [:]
                if let v = p["vars"] as? [String: Any] { for (k, x) in v { vars[k] = "\(x)" } }
                for (k, v) in p where k.hasPrefix("vars[") && k.hasSuffix("]") { vars[String(k.dropFirst(5).dropLast())] = "\(v)" }
                let from = p.str("from").flatMap { agentIndex($0) }.map { db.agents[$0].id }
                let tplId = db.templates[i].id
                switch runTemplate(tplId, vars: vars, target: p.str("target"), createdBy: from.map { "agent:\($0)" } ?? (p.str("createdBy") ?? creator),
                                   priority: p.int("priority") ?? 0, doc: p.bool("doc")) {
                case .success(let ts):
                    if (p.bool("notify") ?? false), let f = from {
                        for t in ts { if let j = db.tasks.firstIndex(where: { $0.id == t.id }) { db.tasks[j].notifyAgentId = f; db.tasks[j].parentId = p.str("parent") } }
                    }
                    if text { return .text(ts.map { "✅ Auftrag \($0.id) erstellt → \(targetLabel($0.target))" }.joined(separator: "\n") + "\n") }
                    return .json(["tasks": ts.map { toJSONObject($0) }], status: 201)
                case .failure(.msg(let e)): return .error(e, text: text)
                }
            default: break
            }

        // MARK: Workflows
        case "workflows":
            let parseSteps: (Any?) -> [WorkflowStep]? = { raw in
                guard let arr = raw as? [[String: Any]] else { return nil }
                return arr.map { s in
                    WorkflowStep(name: s.str("name") ?? "Schritt", templateId: (s.str("templateId")).flatMap { $0.isEmpty ? nil : $0 },
                                 prompt: s.str("prompt") ?? "", target: s.str("target") ?? "")
                }
            }
            if id.isEmpty {
                if m == "GET" { return .json(db.workflows.map { toJSONObject($0) }) }
                if m == "POST" {
                    let w = Workflow(id: makeId("wf"), name: p.str("name") ?? "Neuer Workflow", description: p.str("description") ?? "",
                                     steps: parseSteps(p["steps"]) ?? [], createdAt: nowMs())
                    db.workflows.append(w)
                    emit("workflow.created", "Workflow angelegt: \(w.name)", ref: w.id)
                    return .json(toJSONObject(w), status: 201)
                }
            }
            guard let i = db.workflows.firstIndex(where: { $0.id == id || $0.name.lowercased() == id.lowercased() }) else { return .error("Workflow unbekannt", status: 404, text: text) }
            switch (m, action) {
            case ("GET", ""): return .json(toJSONObject(db.workflows[i]))
            case ("PUT", ""), ("PATCH", ""):
                if let v = p.str("name") { db.workflows[i].name = v }
                if let v = p.str("description") { db.workflows[i].description = v }
                if let s = parseSteps(p["steps"]) { db.workflows[i].steps = s }
                emit("workflow.updated", "Workflow geändert: \(db.workflows[i].name)", ref: db.workflows[i].id)
                return .json(toJSONObject(db.workflows[i]))
            case ("DELETE", ""):
                let w = db.workflows.remove(at: i)
                emit("workflow.deleted", "Workflow gelöscht: \(w.name)", ref: w.id)
                return .json(["ok": true])
            case ("POST", "run"):
                var input = p.str("input") ?? ""
                if input.isEmpty && req.json == nil && !req.isForm { input = req.bodyString }
                switch startRun(db.workflows[i].id, input: input, createdBy: p.str("from").map { "agent:\($0)" } ?? creator) {
                case .success(let run): return text ? .text("✅ Workflow-Lauf \(run.id) gestartet\n") : .json(toJSONObject(run), status: 201)
                case .failure(.msg(let e)): return .error(e, text: text)
                }
            default: break
            }

        case "runs":
            guard let ri = db.runs.firstIndex(where: { $0.id == id }) else { return .error("Lauf unbekannt", status: 404, text: text) }
            if m == "GET" { return .json(toJSONObject(db.runs[ri])) }
            if m == "POST" && action == "cancel" {
                db.runs[ri].status = "cancelled"; db.runs[ri].finishedAt = nowMs()
                for tid in db.runs[ri].taskIds { _ = cancel(tid) }
                emit("workflow.cancelled", "Workflow abgebrochen: \(db.runs[ri].workflowName)", ref: id)
                return .json(toJSONObject(db.runs[ri]))
            }
            if m == "DELETE" { db.runs.remove(at: ri); changed(); return .json(["ok": true]) }

        // MARK: Nachrichten
        case "messages":
            if id.isEmpty {
                if m == "GET" {
                    var list = db.messages
                    if let a = req.query["agent"], let ai = agentIndex(a) { let r = "agent:\(db.agents[ai].id)"; list = list.filter { $0.from == r || $0.to == r } }
                    if let t = req.query["task"] { list = list.filter { $0.taskId == t } }
                    if let pj = req.query["project"] { list = list.filter { $0.projectId == pj } }
                    if req.query["open"] != nil { list = list.filter { $0.kind == "question" && $0.status != "answered" } }
                    return .json(list.suffix(Int(req.query["limit"] ?? "300") ?? 300).map { toJSONObject($0) })
                }
                if m == "POST" {
                    let body = p.str("text") ?? (req.json == nil && !req.isForm ? req.bodyString : "")
                    guard !body.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return .error("Text fehlt", text: text) }
                    guard let toRaw = p.str("to"), !toRaw.isEmpty else { return .error("Empfänger (to) fehlt: agent:<name> oder user", text: text) }
                    var to = toRaw
                    if toRaw != "user" {
                        let r = toRaw.hasPrefix("agent:") ? String(toRaw.dropFirst(6)) : toRaw
                        guard let ai = agentIndex(r) else { return .error("Agent '\(r)' unbekannt", status: 404, text: text) }
                        to = "agent:\(db.agents[ai].id)"
                    }
                    let fromRef = p.str("from").flatMap { agentIndex($0) }.map { "agent:\(db.agents[$0].id)" } ?? "user"
                    let msg = sendMessage(from: fromRef, to: to, text: body, kind: p.str("kind") ?? "message", taskId: p.str("task"),
                                          projectId: p.str("project"), urgent: p.bool("urgent") ?? false)
                    return text ? .text("✉️ Nachricht \(msg.id) an \(partyName(to)).\n") : .json(toJSONObject(msg), status: 201)
                }
            }
            guard db.messages.contains(where: { $0.id == id }) else { return .error("Nachricht unbekannt", status: 404, text: true) }
            let fromRef = p.str("from").flatMap { agentIndex($0) }.map { "agent:\(db.agents[$0].id)" } ?? "user"
            let raw: String = { if let j = req.json { return j.str("text") ?? j.str("answer") ?? j.str("note") ?? "" }; if req.isForm { return p.str("text") ?? "" }; return req.bodyString }()
            switch (m, action) {
            case ("GET", ""): return .json(toJSONObject(db.messages.first(where: { $0.id == id })!))
            case ("POST", "answer"):
                switch answerMessage(id, text: raw, from: fromRef) {
                case .success(let a): return req.json != nil ? .json(toJSONObject(a)) : .text("✅ Antwort zugestellt. Mach mit deiner eigentlichen Arbeit weiter.\n")
                case .failure(.msg(let e)): return .error(e, status: 409, text: req.json == nil)
                }
            case ("POST", "escalate"):
                switch escalate(id, from: fromRef, note: raw) {
                case .success(let q): return req.json != nil ? .json(toJSONObject(q)) : .text("↗️ Rückfrage weitergeleitet an \(partyName(q.to)).\n")
                case .failure(.msg(let e)): return .error(e, status: 409, text: req.json == nil)
                }
            case ("GET", "wait"):
                let timeout = min(max(Double(req.query["timeout"] ?? "55") ?? 55, 1), 600)
                return waitForMessage(id, conn: conn, timeout: timeout)
            case ("DELETE", ""):
                db.messages.removeAll { $0.id == id }; changed()
                return .json(["ok": true])
            default: break
            }

        // MARK: Projekte
        case "projects":
            return handleProjects(req, parts: parts, base: base)

        // MARK: Webhooks
        case "webhooks":
            if id.isEmpty {
                if m == "GET" { return .json(db.webhooks.map { toJSONObject($0) }) }
                if m == "POST" {
                    guard let url = p.str("url"), URL(string: url)?.scheme?.hasPrefix("http") == true else { return .error("Gültige URL fehlt") }
                    let h = Webhook(id: makeId("wh"), url: url, events: p.strings("events").flatMap { $0.isEmpty ? nil : $0 } ?? ["*"],
                                    active: true, lastStatus: nil, createdAt: nowMs())
                    db.webhooks.append(h)
                    emit("webhook.created", "Webhook angelegt: \(url)", ref: h.id)
                    return .json(toJSONObject(h), status: 201)
                }
            }
            guard let i = db.webhooks.firstIndex(where: { $0.id == id }) else { return .error("Webhook unbekannt", status: 404) }
            switch (m, action) {
            case ("PATCH", ""), ("PUT", ""):
                if let v = p.bool("active") { db.webhooks[i].active = v }
                if let v = p.str("url") { db.webhooks[i].url = v }
                if let v = p.strings("events"), !v.isEmpty { db.webhooks[i].events = v }
                changed()
                return .json(toJSONObject(db.webhooks[i]))
            case ("DELETE", ""):
                db.webhooks.remove(at: i); changed()
                return .json(["ok": true])
            case ("POST", "test"):
                sendWebhook(index: i, hook: db.webhooks[i], payload: ["type": "webhook.test", "message": "Test von Dirigent", "time": nowMs()])
                return .json(["ok": true])
            default: break
            }

        // MARK: Einstellungen
        case "settings":
            if id == "apikey" && m == "POST" {
                if p.bool("clear") == true { db.settings.apiKey = "" }
                else { db.settings.apiKey = "dk_" + UUID().uuidString.replacingOccurrences(of: "-", with: "").lowercased() }
                changed()
                return .json(["apiKey": db.settings.apiKey])
            }
            if id == "apikey" && m == "GET" { return .json(["apiKey": db.settings.apiKey]) }
            if m == "PUT" || m == "PATCH" {
                guard req.isLocal else { return .error("Einstellungen nur lokal änderbar", status: 401) }
                var restart = false
                if let v = p.int("port"), v > 0, v < 65536, v != db.settings.port { db.settings.port = v; restart = true }
                if let v = p.bool("lanAccess"), v != db.settings.lanAccess { db.settings.lanAccess = v; restart = true }
                if let v = p.bool("notifications") { db.settings.notifications = v }
                if let v = p.bool("docFiles") { db.settings.docFiles = v }
                saveNow()
                changed()
                if restart {
                    // Erst antworten, dann Server neu starten
                    queue.asyncAfter(deadline: .now() + 0.3) { self.startServer() }
                }
                return .json(["ok": true, "restart": restart, "settings": toJSONObject(db.settings)])
            }
            if m == "GET" { return .json(toJSONObject(db.settings)) }

        default: break
        }
        return .error("Unbekannter Endpunkt: \(m) \(req.path) – siehe \(base)/api/docs", status: 404, text: text)
    }

    private func serveStatic(_ path: String) -> HTTPResponse {
        var rel = path == "/" ? "index.html" : String(path.drop(while: { $0 == "/" }))
        if rel.contains("..") { return .error("Nein", status: 400) }
        var url = webRoot.appendingPathComponent(rel)
        if !FileManager.default.fileExists(atPath: url.path) { rel = "index.html"; url = webRoot.appendingPathComponent(rel) }
        guard let data = try? Data(contentsOf: url) else { return .error("Nicht gefunden", status: 404) }
        let types = ["html": "text/html; charset=utf-8", "js": "application/javascript; charset=utf-8", "css": "text/css; charset=utf-8",
                     "svg": "image/svg+xml", "png": "image/png", "json": "application/json", "webmanifest": "application/manifest+json"]
        return HTTPResponse(status: 200, headers: ["Content-Type": types[url.pathExtension] ?? "application/octet-stream", "Cache-Control": "no-cache"], body: data)
    }
}
