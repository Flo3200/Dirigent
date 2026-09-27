import Foundation

/// Projekte: Der Manager plant Teilbereiche und Standards, du teilst Agenten ein und gibst frei –
/// erst dann erhalten die Worker ihren Auftrag. Abgelieferte Teilbereiche nimmt der Manager (oder du) ab.
extension Hub {

    // MARK: Hilfen

    func projectIndex(_ ref: String) -> Int? {
        db.projects.firstIndex(where: { $0.id == ref }) ?? db.projects.firstIndex(where: { $0.name.lowercased() == ref.lowercased() })
    }

    func partIndex(_ pi: Int, _ ref: String) -> Int? {
        db.projects[pi].parts.firstIndex(where: { $0.id == ref }) ?? db.projects[pi].parts.firstIndex(where: { $0.key.lowercased() == ref.lowercased() })
    }

    func projectLog(_ pi: Int, _ text: String) {
        db.projects[pi].log.append(ProgressEntry(time: nowMs(), text: text))
        if db.projects[pi].log.count > 400 { db.projects[pi].log.removeFirst(db.projects[pi].log.count - 400) }
        db.projects[pi].updatedAt = nowMs()
    }

    /// Anzeigename für „wer war das“ (Agent oder du im Dashboard).
    func actorName(_ from: String?) -> String {
        guard let f = from, !f.isEmpty, f != "user" else { return "Du" }
        if let i = agentIndex(f) { return db.agents[i].name }
        return f
    }

    /// „Du hast …“ bzw. „<Agent> hat …“ für das Projekt-Protokoll.
    func actorHas(_ from: String?) -> String {
        let n = actorName(from)
        return n == "Du" ? "Du hast" : "\(n) hat"
    }

    func planActive(_ p: Project) -> Bool {
        db.tasks.contains { $0.projectId == p.id && $0.partId == nil && $0.kind == "task" && ($0.status == "queued" || $0.status == "running")
            && $0.createdAt > (p.planSubmittedAt ?? 0) }
    }

    /// Liste aus JSON-Array oder mehrzeiligem Text.
    static func list(_ raw: Any?) -> [String] {
        if let a = raw as? [Any] { return a.map { "\($0)".trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty } }
        if let s = raw as? String {
            return s.split(whereSeparator: { $0 == "\n" }).map { String($0).trimmingCharacters(in: .whitespaces) }
                .map { $0.hasPrefix("- ") ? String($0.dropFirst(2)) : $0 }.filter { !$0.isEmpty }
        }
        return []
    }

    // MARK: Anlegen & Planung

    func createProject(name: String, goal: String, cwd: String, manager: String?, requireReview: Bool,
                       createdBy: String, plan: Bool) -> Result<Project, HubError> {
        let goal = goal.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !goal.isEmpty else { return .failure(.msg("Ziel (goal) fehlt")) }
        var name = name.trimmingCharacters(in: .whitespacesAndNewlines)
        if name.isEmpty { name = String((goal.split(separator: "\n").first.map(String.init) ?? goal).prefix(50)) }
        let managerId = manager.flatMap { $0.isEmpty ? nil : agentIndex($0) }.map { db.agents[$0].id }
        let t = nowMs()
        let p = Project(id: makeId("pj", 6), name: name, goal: goal, cwd: cwd.trimmingCharacters(in: .whitespacesAndNewlines),
                        managerId: managerId, status: "planning", summary: "", standards: [], parts: [], planTaskIds: [],
                        revision: 0, requireReview: requireReview, log: [], createdAt: t, updatedAt: t, finishedAt: nil)
        db.projects.append(p)
        let pi = db.projects.count - 1
        projectLog(pi, "Projekt angelegt" + (createdBy.hasPrefix("agent:") ? " von \(actorName(String(createdBy.dropFirst(6))))" : ""))
        emit("project.created", "Projekt angelegt: \(name)", ref: p.id)
        if plan { _ = requestPlan(p.id, feedback: nil, createdBy: createdBy) }
        return .success(db.projects.first(where: { $0.id == p.id })!)
    }

    /// Planungsauftrag an den Manager (erstmalig oder als Überarbeitung mit Rückmeldung).
    func requestPlan(_ id: String, feedback: String?, createdBy: String) -> Result<TaskItem, HubError> {
        guard let pi = projectIndex(id) else { return .failure(.msg("Projekt unbekannt")) }
        guard db.projects[pi].status != "cancelled" else { return .failure(.msg("Projekt ist abgebrochen")) }
        // Noch nicht zugestellte Planungsaufträge ersetzen
        for t in db.tasks where t.projectId == db.projects[pi].id && t.partId == nil && t.kind == "task" && t.status == "queued" { _ = cancel(t.id) }
        let p = db.projects[pi]
        var prompt = "Plane das Projekt „\(p.name)“.\n\n## Ziel\n\(p.goal)"
        if !p.cwd.isEmpty { prompt += "\n\nArbeitsverzeichnis: \(p.cwd)" }
        let fb = feedback?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        if !fb.isEmpty { prompt += "\n\n## Überarbeitung – Rückmeldung des Nutzers\n\(fb)" }
        if !p.parts.isEmpty || !p.standards.isEmpty { prompt += "\n\n## Aktueller Plan (Revision \(p.revision))\n" + Texts.planSummary(p, hub: self) }
        var target = "manager"
        if let m = p.managerId, db.agents.contains(where: { $0.id == m }) { target = "agent:\(m)" }
        switch createTasks(prompt: prompt, title: "Projektplan: \(p.name)\(fb.isEmpty ? "" : " (Überarbeitung)")", target: target,
                           createdBy: createdBy, priority: 3, projectId: p.id) {
        case .success(let ts):
            guard let t = ts.first, let pi2 = projectIndex(id) else { return .failure(.msg("Planungsauftrag fehlt")) }
            db.projects[pi2].planTaskIds.append(t.id)
            projectLog(pi2, fb.isEmpty ? "Planung beim Manager angefordert" : "Überarbeitung angefordert: \(fb.prefix(160))")
            recomputeProject(pi2)
            return .success(t)
        case .failure(let e): return .failure(e)
        }
    }

    /// Plan des Managers übernehmen. Liefert einen Bericht (inkl. Warnungen) für den Agenten.
    func submitPlan(_ id: String, _ j: [String: Any], from: String?) -> Result<String, HubError> {
        guard let pi = projectIndex(id) else { return .failure(.msg("Projekt unbekannt")) }
        guard db.projects[pi].status != "cancelled" else { return .failure(.msg("Projekt ist abgebrochen")) }
        let rawParts = j["parts"] as? [[String: Any]] ?? []
        guard !rawParts.isEmpty else { return .failure(.msg("Plan NICHT gespeichert: \"parts\" fehlt oder ist leer (gültiges JSON?).")) }
        var errors: [String] = [], warnings: [String] = []
        var p = db.projects[pi]

        // Standards
        var standards: [ProjectStandard] = []
        let rawStandards = j["standards"] as? [[String: Any]]
        for (n, s) in (rawStandards ?? []).enumerated() {
            let rule = (s.str("rule") ?? s.str("text") ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            let title = (s.str("title") ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            if rule.isEmpty && title.isEmpty { errors.append("standards[\(n)]: \"rule\" fehlt"); continue }
            let cat = (s.str("category") ?? "").trimmingCharacters(in: .whitespaces)
            let mandatory = s.bool("mandatory") ?? !["SOLL", "SHOULD", "KANN"].contains((s.str("level") ?? "").uppercased())
            standards.append(ProjectStandard(id: "S\(standards.count + 1)", category: cat.isEmpty ? "Allgemein" : cat,
                                             title: title.isEmpty ? String(rule.prefix(70)) : title,
                                             rule: rule.isEmpty ? title : rule, mandatory: mandatory))
        }

        // Teilbereiche – bereits freigegebene bleiben unverändert
        let locked = p.parts.filter { $0.status != "draft" }
        var keyToId: [String: String] = [:]
        for part in p.parts { keyToId[part.key.lowercased()] = part.id }
        var seen = Set<String>()
        var fresh: [ProjectPart] = []
        var rawDeps: [String: [String]] = [:]
        for (n, r) in rawParts.enumerated() {
            var key = (r.str("key") ?? r.str("id") ?? "").trimmingCharacters(in: .whitespaces).lowercased()
            if key.isEmpty { key = "teil\(n + 1)" }
            if seen.contains(key) { errors.append("parts[\(n)]: key „\(key)“ ist doppelt"); continue }
            seen.insert(key)
            if let ex = locked.first(where: { $0.key.lowercased() == key }) {
                warnings.append("„\(ex.name)“ ist bereits freigegeben (\(ex.status)) und bleibt unverändert.")
                continue
            }
            let name = (r.str("name") ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            let prompt = (r.str("prompt") ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            if name.isEmpty { errors.append("parts[\(n)] (\(key)): \"name\" fehlt") }
            if prompt.isEmpty { errors.append("parts[\(n)] (\(key)): \"prompt\" fehlt") }
            let existing = p.parts.first(where: { $0.key.lowercased() == key && $0.status == "draft" })
            let pid = existing?.id ?? makeId("pt", 6)
            keyToId[key] = pid
            let suggested = (r.str("suggestedAgent") ?? r.str("agent")).flatMap { $0.isEmpty ? nil : $0 }
            var agentId = existing?.agentId   // deine Einteilung bleibt erhalten
            if agentId == nil, let s = suggested, let ai = agentIndex(s) { agentId = db.agents[ai].id }
            fresh.append(ProjectPart(id: pid, key: key, name: name, goal: (r.str("goal") ?? "").trimmingCharacters(in: .whitespacesAndNewlines),
                                     prompt: prompt, acceptance: Hub.list(r["acceptance"]), paths: Hub.list(r["paths"]),
                                     tags: Hub.list(r["tags"]), dependsOn: [], suggestedAgent: suggested, agentId: agentId,
                                     status: "draft", taskIds: existing?.taskIds ?? [], result: existing?.result, note: existing?.note,
                                     round: existing?.round ?? 1, approvedAt: nil, finishedAt: nil))
            rawDeps[pid] = Hub.list(r["dependsOn"])
        }
        for i in fresh.indices {
            var deps: [String] = []
            for d in rawDeps[fresh[i].id] ?? [] {
                if let did = keyToId[d.lowercased()] ?? p.parts.first(where: { $0.id == d })?.id {
                    if did != fresh[i].id && !deps.contains(did) { deps.append(did) }
                } else { errors.append("„\(fresh[i].name)“: dependsOn „\(d)“ ist unbekannt") }
            }
            fresh[i].dependsOn = deps
        }
        let all = locked + fresh
        if let cycle = Hub.findCycle(all) { errors.append("Zyklische Abhängigkeit: \(cycle)") }
        guard errors.isEmpty else { return .failure(.msg("Plan NICHT gespeichert:\n- " + errors.joined(separator: "\n- "))) }

        // Hinweise (Plan wird trotzdem gespeichert)
        if rawStandards != nil && standards.count < 12 { warnings.append("Nur \(standards.count) Standards – Richtwert sind 15–40 präzise, prüfbare Regeln.") }
        for part in fresh {
            if part.acceptance.isEmpty { warnings.append("„\(part.name)“: keine Abnahmekriterien (acceptance).") }
            if part.paths.isEmpty { warnings.append("„\(part.name)“: keine Pfade (paths) – Zuständigkeit unklar.") }
        }
        for (a, x) in all.enumerated() {
            for y in all[(a + 1)...] where !Hub.reaches(all, x.id, y.id) && !Hub.reaches(all, y.id, x.id) {
                for px in x.paths { for py in y.paths where px.hasPrefix(py) || py.hasPrefix(px) {
                    warnings.append("Pfad-Überschneidung zwischen parallelen Teilbereichen „\(x.name)“ und „\(y.name)“: \(px) ↔ \(py)")
                } }
            }
        }

        p.parts = all
        if rawStandards != nil { p.standards = standards }
        if let s = j.str("summary"), !s.isEmpty { p.summary = s }
        p.revision += 1
        p.planSubmittedAt = nowMs()
        let submitter: String? = from.flatMap { agentIndex($0) }.map { db.agents[$0].id }
            ?? p.planTaskIds.last.flatMap { tid in db.tasks.first(where: { $0.id == tid })?.assignedAgentId }
        if let m = submitter { p.managerId = m }
        db.projects[pi] = p
        projectLog(pi, "Plan Revision \(p.revision) eingereicht\(submitter.map { " von \(actorName($0))" } ?? ""): \(p.standards.count) Standards, \(p.parts.count) Teilbereiche")
        emit("project.planned", "Plan für „\(p.name)“ eingereicht – wartet auf deine Freigabe", ref: p.id)
        if db.settings.notifications {
            let cb = onNotify
            let body = "\(fresh.count) Teilbereiche, \(p.standards.count) Standards – bitte prüfen, Agenten einteilen und freigeben."
            DispatchQueue.main.async { cb?("📋 Plan bereit: \(p.name)", body) }
        }
        recomputeProject(pi)
        var report = "✅ Plan gespeichert (Revision \(p.revision)): \(p.standards.count) Standards, \(p.parts.count) Teilbereiche (\(fresh.count) neu/aktualisiert).\n"
        report += "Der Nutzer prüft jetzt den Plan, teilt Agenten ein und gibt frei. Nichts startet ohne Freigabe.\n"
        if !warnings.isEmpty { report += "\n⚠️ Hinweise (bei Bedarf korrigieren und erneut einreichen):\n- " + warnings.joined(separator: "\n- ") + "\n" }
        report += "\nWenn der Plan so passt: schließe deinen Planungsauftrag mit /complete ab (kurze Zusammenfassung).\n"
        return .success(report)
    }

    static func findCycle(_ parts: [ProjectPart]) -> String? {
        var state: [String: Int] = [:]   // 1 = in Arbeit, 2 = fertig
        var path: [String] = []
        let byId = Dictionary(parts.map { ($0.id, $0) }, uniquingKeysWith: { a, _ in a })
        func visit(_ id: String) -> String? {
            if state[id] == 2 { return nil }
            if state[id] == 1 {
                let names = (path.drop(while: { $0 != id }) + [id]).compactMap { byId[$0]?.name }
                return names.joined(separator: " → ")
            }
            state[id] = 1; path.append(id)
            for d in byId[id]?.dependsOn ?? [] where byId[d] != nil { if let c = visit(d) { return c } }
            path.removeLast(); state[id] = 2
            return nil
        }
        for p in parts { if let c = visit(p.id) { return c } }
        return nil
    }

    /// Hängt `from` (direkt oder indirekt) von `to` ab?
    static func reaches(_ parts: [ProjectPart], _ from: String, _ to: String) -> Bool {
        var stack = [from], seen = Set<String>()
        while let id = stack.popLast() {
            guard seen.insert(id).inserted, let p = parts.first(where: { $0.id == id }) else { continue }
            if p.dependsOn.contains(to) { return true }
            stack.append(contentsOf: p.dependsOn)
        }
        return false
    }

    /// Ausführungswelle eines Teilbereichs (0 = sofort startbar, 1 = nach Welle 0 …).
    func wave(_ p: Project, _ partId: String, depth: Int = 0) -> Int {
        guard depth < 50, let part = p.parts.first(where: { $0.id == partId }), !part.dependsOn.isEmpty else { return 0 }
        return 1 + (part.dependsOn.map { wave(p, $0, depth: depth + 1) }.max() ?? 0)
    }

    // MARK: Freigabe & Ausführung

    func approvePart(_ pi: Int, _ ref: String, by: String?) -> Result<ProjectPart, HubError> {
        guard let k = partIndex(pi, ref) else { return .failure(.msg("Teilbereich unbekannt")) }
        guard db.projects[pi].status != "cancelled" else { return .failure(.msg("Projekt ist abgebrochen")) }
        let part = db.projects[pi].parts[k]
        guard part.status == "draft" else { return .failure(.msg("„\(part.name)“ ist nicht im Entwurf (Status: \(part.status))")) }
        guard !part.prompt.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return .failure(.msg("„\(part.name)“ hat keinen Prompt")) }
        db.projects[pi].parts[k].status = "waiting"
        db.projects[pi].parts[k].approvedAt = nowMs()
        let who = part.agentId.flatMap { a in db.agents.first(where: { $0.id == a })?.name } ?? "beliebigen Worker"
        projectLog(pi, "\(actorHas(by)) „\(part.name)“ freigegeben → \(who)\(part.round > 1 ? " (Nacharbeit, Runde \(part.round))" : "")")
        emit("project.part.approved", "Freigegeben: \(db.projects[pi].name) · \(part.name) → \(who)", ref: db.projects[pi].id)
        startReadyParts(pi)
        recomputeProject(pi)
        return .success(db.projects[pi].parts[k])
    }

    /// Freigegebene Teilbereiche starten, deren Abhängigkeiten abgenommen sind.
    func startReadyParts(_ pi: Int) {
        guard db.projects[pi].status != "cancelled" else { return }
        let ids = db.projects[pi].parts.filter { $0.status == "waiting" }.map { $0.id }
        for id in ids {
            let parts = db.projects[pi].parts
            guard let part = parts.first(where: { $0.id == id }) else { continue }
            let ready = part.dependsOn.allSatisfy { d in parts.first(where: { $0.id == d }).map { $0.status == "accepted" } ?? true }
            if ready { launchPart(pi, id) }
        }
    }

    private func launchPart(_ pi: Int, _ partId: String) {
        guard let k = db.projects[pi].parts.firstIndex(where: { $0.id == partId }) else { return }
        let p = db.projects[pi]
        let part = p.parts[k]
        var target = "any"
        if let a = part.agentId, db.agents.contains(where: { $0.id == a }) { target = "agent:\(a)" }
        db.projects[pi].parts[k].status = "queued"
        let res = createTasks(prompt: Texts.partPrompt(p, part, hub: self), title: "\(p.name) · \(part.name)", target: target,
                              createdBy: "project:\(p.id)", parentId: p.planTaskIds.last, priority: 2, projectId: p.id, partId: part.id)
        guard let k2 = db.projects[pi].parts.firstIndex(where: { $0.id == partId }) else { return }
        switch res {
        case .success(let ts):
            db.projects[pi].parts[k2].taskIds.append(contentsOf: ts.map { $0.id })
            projectLog(pi, "Gestartet: „\(part.name)“ → \(targetLabel(target))")
        case .failure(.msg(let e)):
            db.projects[pi].parts[k2].status = "failed"
            db.projects[pi].parts[k2].note = "Start fehlgeschlagen: \(e)"
            projectLog(pi, "Start von „\(part.name)“ fehlgeschlagen: \(e)")
        }
    }

    /// Freigabe zurückziehen (nur solange der Worker noch nicht angefangen hat).
    func unapprovePart(_ pi: Int, _ ref: String, by: String?) -> Result<ProjectPart, HubError> {
        guard let k = partIndex(pi, ref) else { return .failure(.msg("Teilbereich unbekannt")) }
        let part = db.projects[pi].parts[k]
        guard ["waiting", "queued"].contains(part.status) else { return .failure(.msg("Freigabe kann nur vor Arbeitsbeginn zurückgezogen werden (Status: \(part.status))")) }
        if part.status == "queued", let tid = part.taskIds.last { _ = cancel(tid) }
        db.projects[pi].parts[k].status = "draft"
        db.projects[pi].parts[k].approvedAt = nil
        projectLog(pi, "\(actorHas(by)) die Freigabe von „\(part.name)“ zurückgezogen")
        recomputeProject(pi)
        return .success(db.projects[pi].parts[k])
    }

    func acceptPart(_ pi: Int, _ ref: String, note: String, by: String?) -> Result<ProjectPart, HubError> {
        guard let k = partIndex(pi, ref) else { return .failure(.msg("Teilbereich unbekannt")) }
        let part = db.projects[pi].parts[k]
        guard ["delivered", "failed", "cancelled"].contains(part.status) else { return .failure(.msg("„\(part.name)“ ist noch nicht abgeliefert (Status: \(part.status))")) }
        let n = note.trimmingCharacters(in: .whitespacesAndNewlines)
        db.projects[pi].parts[k].status = "accepted"
        if !n.isEmpty { db.projects[pi].parts[k].note = n }
        projectLog(pi, "\(actorHas(by)) „\(part.name)“ abgenommen\(n.isEmpty ? "" : ": \(n.prefix(160))")")
        emit("project.part.accepted", "Abgenommen: \(db.projects[pi].name) · \(part.name)", ref: db.projects[pi].id)
        startReadyParts(pi)
        recomputeProject(pi)
        return .success(db.projects[pi].parts[k])
    }

    /// Nacharbeit: Teilbereich geht als Entwurf zurück und braucht erneut deine Freigabe.
    func reworkPart(_ pi: Int, _ ref: String, note: String, prompt: String?, by: String?) -> Result<ProjectPart, HubError> {
        guard let k = partIndex(pi, ref) else { return .failure(.msg("Teilbereich unbekannt")) }
        let part = db.projects[pi].parts[k]
        guard ["delivered", "failed", "cancelled", "accepted"].contains(part.status) else { return .failure(.msg("Nacharbeit erst nach Ablieferung möglich (Status: \(part.status))")) }
        let n = note.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !n.isEmpty else { return .failure(.msg("Beschreibe die Nacharbeit (was genau muss anders werden?)")) }
        db.projects[pi].parts[k].status = "draft"
        db.projects[pi].parts[k].round += 1
        db.projects[pi].parts[k].note = n
        db.projects[pi].parts[k].approvedAt = nil
        if let pr = prompt?.trimmingCharacters(in: .whitespacesAndNewlines), !pr.isEmpty { db.projects[pi].parts[k].prompt = pr }
        projectLog(pi, "\(actorHas(by)) Nacharbeit an „\(part.name)“ angefordert: \(n.prefix(200))")
        emit("project.part.rework", "Nacharbeit: \(db.projects[pi].name) · \(part.name) – wartet auf Freigabe", ref: db.projects[pi].id)
        if db.settings.notifications {
            let cb = onNotify, title = "🔁 Nacharbeit: \(part.name)", body = "Bitte prüfen und erneut freigeben. \(n.prefix(140))"
            DispatchQueue.main.async { cb?(title, body) }
        }
        recomputeProject(pi)
        return .success(db.projects[pi].parts[k])
    }

    /// Wird bei jeder Statusänderung eines Auftrags aufgerufen.
    func projectTaskChanged(_ t: TaskItem) {
        guard let pid = t.projectId, t.kind == "task", let pi = db.projects.firstIndex(where: { $0.id == pid }) else { return }
        guard let partId = t.partId else {
            if t.status == "failed" { projectLog(pi, "Planung fehlgeschlagen: \((t.error ?? "").prefix(160))") }
            if t.status == "done" { projectLog(pi, "Manager hat die Planung abgeschlossen") }
            recomputeProject(pi)
            return
        }
        guard let k = db.projects[pi].parts.firstIndex(where: { $0.id == partId }) else { return }
        let part = db.projects[pi].parts[k]
        // Nur der jüngste Auftrag des Teilbereichs zählt
        if let last = part.taskIds.last, last != t.id, part.taskIds.contains(t.id) { return }
        guard !["draft", "accepted"].contains(part.status) else { return }
        let agentName = t.assignedAgentId.flatMap { a in db.agents.first(where: { $0.id == a })?.name } ?? "?"
        switch t.status {
        case "queued": db.projects[pi].parts[k].status = "queued"
        case "running":
            db.projects[pi].parts[k].status = "running"
            projectLog(pi, "\(agentName) arbeitet an „\(part.name)“")
        case "done":
            db.projects[pi].parts[k].result = t.result
            db.projects[pi].parts[k].finishedAt = nowMs()
            if db.projects[pi].requireReview {
                db.projects[pi].parts[k].status = "delivered"
                projectLog(pi, "\(agentName) hat „\(part.name)“ abgeliefert – wartet auf Abnahme")
                notifyManagerReview(pi, k, t, success: true)
            } else {
                db.projects[pi].parts[k].status = "accepted"
                projectLog(pi, "\(agentName) hat „\(part.name)“ erledigt")
                startReadyParts(pi)
            }
        case "failed":
            db.projects[pi].parts[k].status = "failed"
            db.projects[pi].parts[k].result = t.error
            db.projects[pi].parts[k].finishedAt = nowMs()
            projectLog(pi, "\(agentName) meldet Fehler in „\(part.name)“: \((t.error ?? "").prefix(160))")
            notifyManagerReview(pi, k, t, success: false)
        case "cancelled":
            db.projects[pi].parts[k].status = "cancelled"
            projectLog(pi, "„\(part.name)“ abgebrochen")
        default: break
        }
        recomputeProject(pi)
    }

    private func notifyManagerReview(_ pi: Int, _ k: Int, _ t: TaskItem, success: Bool) {
        let p = db.projects[pi], part = p.parts[k]
        guard let mid = p.managerId, db.agents.contains(where: { $0.id == mid }) else { return }
        let agentName = t.assignedAgentId.flatMap { a in db.agents.first(where: { $0.id == a })?.name } ?? "?"
        let criteria = part.acceptance.enumerated().map { "\($0.offset + 1). \($0.element)" }.joined(separator: "\n")
        let body = """
        Teilbereich „\(part.name)“ im Projekt „\(p.name)“ wurde \(success ? "ABGELIEFERT" : "als FEHLGESCHLAGEN gemeldet").
        Bearbeitet von: \(agentName) · Runde \(part.round)

        --- \(success ? "Ergebnis" : "Fehler") ---
        \(success ? (t.result ?? "") : (t.error ?? ""))

        --- Abnahmekriterien ---
        \(criteria.isEmpty ? "(keine definiert)" : criteria)
        """
        _ = createTasks(prompt: body, title: "Abnahme: \(p.name) · \(part.name)", target: "agent:\(mid)", createdBy: "project:\(p.id)",
                        parentId: p.planTaskIds.last, priority: 5, kind: "notification", projectId: p.id, partId: part.id)
    }

    func cancelProject(_ pi: Int, by: String?) {
        db.projects[pi].status = "cancelled"
        db.projects[pi].finishedAt = nowMs()
        let pid = db.projects[pi].id
        for t in db.tasks where t.projectId == pid && (t.status == "queued" || t.status == "running") { _ = cancel(t.id) }
        for k in db.projects[pi].parts.indices where ["waiting", "queued", "running"].contains(db.projects[pi].parts[k].status) {
            db.projects[pi].parts[k].status = "cancelled"
        }
        projectLog(pi, "\(actorHas(by)) das Projekt abgebrochen")
        emit("project.cancelled", "Projekt abgebrochen: \(db.projects[pi].name)", ref: pid)
    }

    /// Projektstatus aus Planungsauftrag und Teilbereichen ableiten.
    func recomputeProject(_ pi: Int) {
        let p = db.projects[pi]
        guard p.status != "cancelled" else { changed(); return }
        let new: String
        if !p.parts.isEmpty && p.parts.allSatisfy({ $0.status == "accepted" }) { new = "done" }
        else if planActive(p) || p.parts.isEmpty { new = "planning" }
        else if p.parts.contains(where: { $0.status != "draft" }) { new = "running" }
        else { new = "review" }
        if new != p.status {
            db.projects[pi].status = new
            db.projects[pi].updatedAt = nowMs()
            let label = ["planning": "in Planung", "review": "wartet auf deine Freigabe", "running": "in Ausführung", "done": "abgeschlossen"][new] ?? new
            if new == "done" {
                db.projects[pi].finishedAt = nowMs()
                projectLog(pi, "🏁 Alle Teilbereiche abgenommen – Projekt abgeschlossen")
                emit("project.completed", "Projekt abgeschlossen: \(p.name)", ref: p.id)
                if db.settings.notifications {
                    let cb = onNotify, title = "🏁 Projekt fertig: \(p.name)", body = "\(p.parts.count) Teilbereiche abgenommen."
                    DispatchQueue.main.async { cb?(title, body) }
                }
                if let mid = p.managerId, db.agents.contains(where: { $0.id == mid }) {
                    let body = """
                    Alle \(p.parts.count) Teilbereiche des Projekts „\(p.name)“ sind abgenommen.
                    Prüfe das Gesamtergebnis (Build, Tests, Zusammenspiel der Teilbereiche, Einhaltung der Standards)
                    und melde einen kurzen Abschlussbericht über /complete. Falls etwas fehlt: fordere für den
                    betroffenen Teilbereich Nacharbeit an (siehe Projekt-Überblick).
                    """
                    _ = createTasks(prompt: body, title: "Projekt abgeschlossen: \(p.name)", target: "agent:\(mid)",
                                    createdBy: "project:\(p.id)", parentId: p.planTaskIds.last, priority: 5, kind: "notification", projectId: p.id)
                }
            } else {
                if p.status == "done" { db.projects[pi].finishedAt = nil }
                emit("project.status", "\(p.name): \(label)", ref: p.id)
            }
        }
        changed()
    }

    // MARK: API

    func handleProjects(_ req: HTTPRequest, parts: [String], base: String) -> HTTPResponse {
        let p = req.params
        let m = req.method
        let id = parts.count >= 3 ? parts[2] : ""
        let action = parts.count >= 4 ? parts[3] : ""
        let sub = parts.count >= 5 ? parts[4] : ""
        let subAction = parts.count >= 6 ? parts[5] : ""
        let asJSON = req.query["format"] == "json"
        let from = p.str("from")
        let creator = from.flatMap { agentIndex($0) }.map { "agent:\(db.agents[$0].id)" } ?? (p.str("createdBy") ?? "api")
        let rawText: (String) -> String = { key in
            if let j = req.json { return j.str(key) ?? j.str("text") ?? "" }
            if req.isForm { return p.str(key) ?? "" }
            return req.bodyString
        }
        let partReply: (Result<ProjectPart, HubError>, String) -> HTTPResponse = { res, ok in
            switch res {
            case .success(let part): return asJSON ? .json(toJSONObject(part)) : .text(ok + "\n")
            case .failure(.msg(let e)): return .error(e, status: 409, text: !asJSON)
            }
        }

        if id.isEmpty {
            if m == "GET" { return .json(db.projects.map { toJSONObject($0) }) }
            if m == "POST" {
                switch createProject(name: p.str("name") ?? "", goal: p.str("goal") ?? (req.json == nil && !req.isForm ? req.bodyString : ""),
                                     cwd: p.str("cwd") ?? "", manager: p.str("manager"), requireReview: p.bool("requireReview") ?? true,
                                     createdBy: creator, plan: p.bool("plan") ?? true) {
                case .success(let pr):
                    return req.wantsText ? .text("✅ Projekt \(pr.id) angelegt – Planung beim Manager angefordert.\n") : .json(toJSONObject(pr), status: 201)
                case .failure(.msg(let e)): return .error(e, text: req.wantsText)
                }
            }
            return .error("Methode nicht erlaubt", status: 405)
        }
        guard let pi = projectIndex(id) else { return .error("Projekt '\(id)' unbekannt", status: 404, text: !asJSON) }
        let pid = db.projects[pi].id

        switch (m, action) {
        case ("GET", ""):
            return req.wantsText || req.query["format"] == "text" ? .text(Texts.projectText(db.projects[pi], hub: self)) : .json(toJSONObject(db.projects[pi]))
        case ("PATCH", ""), ("PUT", ""):
            if let v = p.str("name"), !v.isEmpty { db.projects[pi].name = v }
            if let v = p.str("goal"), !v.isEmpty { db.projects[pi].goal = v }
            if let v = p.str("cwd") { db.projects[pi].cwd = v }
            if let v = p.str("summary") { db.projects[pi].summary = v }
            if let v = p.bool("requireReview") { db.projects[pi].requireReview = v }
            if let v = p.str("manager") { db.projects[pi].managerId = v.isEmpty ? nil : agentIndex(v).map { db.agents[$0].id } }
            db.projects[pi].updatedAt = nowMs()
            changed()
            return .json(toJSONObject(db.projects[pi]))
        case ("DELETE", ""):
            if db.projects[pi].status != "cancelled" && db.projects[pi].status != "done" { cancelProject(pi, by: from) }
            let pr = db.projects.remove(at: pi)
            emit("project.deleted", "Projekt gelöscht: \(pr.name)", ref: pr.id)
            return .json(["ok": true])
        case ("POST", "plan"):
            guard let j = req.json else { return .error("Plan muss gültiges JSON sein: {\"summary\":…, \"standards\":[…], \"parts\":[…]}", status: 400, text: !asJSON) }
            switch submitPlan(pid, j, from: from) {
            case .success(let report): return asJSON ? .json(toJSONObject(db.projects[pi])) : .text(report)
            case .failure(.msg(let e)): return .error(e, status: 400, text: !asJSON)
            }
        case ("POST", "replan"):
            switch requestPlan(pid, feedback: rawText("feedback"), createdBy: creator) {
            case .success(let t): return asJSON ? .json(toJSONObject(t)) : .text("✅ Planungsauftrag \(t.id) an den Manager gesendet.\n")
            case .failure(.msg(let e)): return .error(e, status: 409, text: !asJSON)
            }
        case ("POST", "approve"):
            let only = Hub.list(p["parts"])
            var ok = 0, errs: [String] = []
            for part in db.projects[pi].parts where part.status == "draft" && (only.isEmpty || only.contains(part.id) || only.contains(part.key)) {
                switch approvePart(pi, part.id, by: from) { case .success: ok += 1; case .failure(.msg(let e)): errs.append(e) }
            }
            if asJSON { return .json(["approved": ok, "errors": errs, "project": toJSONObject(db.projects[pi])]) }
            return .text("✅ \(ok) Teilbereich(e) freigegeben.\(errs.isEmpty ? "" : "\n" + errs.joined(separator: "\n"))\n")
        case ("POST", "cancel"):
            cancelProject(pi, by: from)
            return asJSON ? .json(toJSONObject(db.projects[pi])) : .text("Projekt abgebrochen.\n")

        // Standards
        case (_, "standards"):
            if sub.isEmpty && m == "POST" {
                let rule = (p.str("rule") ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                guard !rule.isEmpty else { return .error("rule fehlt", text: !asJSON) }
                var n = db.projects[pi].standards.count + 1
                while db.projects[pi].standards.contains(where: { $0.id == "S\(n)" }) { n += 1 }
                let s = ProjectStandard(id: "S\(n)", category: (p.str("category") ?? "").isEmpty ? "Allgemein" : p.str("category")!,
                                        title: (p.str("title") ?? "").isEmpty ? String(rule.prefix(70)) : p.str("title")!,
                                        rule: rule, mandatory: p.bool("mandatory") ?? true)
                db.projects[pi].standards.append(s)
                projectLog(pi, "\(actorHas(from)) Standard \(s.id) ergänzt: \(s.title)")
                changed()
                return .json(toJSONObject(s), status: 201)
            }
            guard let si = db.projects[pi].standards.firstIndex(where: { $0.id == sub }) else { return .error("Standard unbekannt", status: 404) }
            if m == "DELETE" {
                let s = db.projects[pi].standards.remove(at: si)
                projectLog(pi, "\(actorHas(from)) Standard \(s.id) entfernt: \(s.title)")
                changed()
                return .json(["ok": true])
            }
            if m == "PATCH" || m == "PUT" {
                if let v = p.str("category"), !v.isEmpty { db.projects[pi].standards[si].category = v }
                if let v = p.str("title"), !v.isEmpty { db.projects[pi].standards[si].title = v }
                if let v = p.str("rule"), !v.isEmpty { db.projects[pi].standards[si].rule = v }
                if let v = p.bool("mandatory") { db.projects[pi].standards[si].mandatory = v }
                projectLog(pi, "\(actorHas(from)) Standard \(db.projects[pi].standards[si].id) geändert")
                changed()
                return .json(toJSONObject(db.projects[pi].standards[si]))
            }

        // Teilbereiche
        case (_, "parts"):
            if sub.isEmpty && m == "POST" {
                let name = (p.str("name") ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                guard !name.isEmpty else { return .error("name fehlt", text: !asJSON) }
                var key = (p.str("key") ?? "").lowercased()
                if key.isEmpty || partIndex(pi, key) != nil { key = "teil\(db.projects[pi].parts.count + 1)-\(makeId("x", 3).dropFirst(2))" }
                let part = ProjectPart(id: makeId("pt", 6), key: key, name: name, goal: p.str("goal") ?? "", prompt: p.str("prompt") ?? "",
                                       acceptance: Hub.list(p["acceptance"]), paths: Hub.list(p["paths"]), tags: Hub.list(p["tags"]),
                                       dependsOn: Hub.list(p["dependsOn"]).compactMap { partIndex(pi, $0).map { db.projects[pi].parts[$0].id } },
                                       suggestedAgent: nil, agentId: p.str("agentId").flatMap { agentIndex($0) }.map { db.agents[$0].id },
                                       status: "draft", taskIds: [], result: nil, note: nil, round: 1, approvedAt: nil, finishedAt: nil)
                db.projects[pi].parts.append(part)
                projectLog(pi, "\(actorHas(from)) Teilbereich „\(name)“ angelegt")
                recomputeProject(pi)
                return .json(toJSONObject(part), status: 201)
            }
            guard let k = partIndex(pi, sub) else { return .error("Teilbereich unbekannt", status: 404, text: !asJSON) }
            let partId = db.projects[pi].parts[k].id
            switch (m, subAction) {
            case ("GET", ""):
                return req.query["format"] == "text" ? .text(Texts.partPrompt(db.projects[pi], db.projects[pi].parts[k], hub: self)) : .json(toJSONObject(db.projects[pi].parts[k]))
            case ("PATCH", ""), ("PUT", ""):
                let st = db.projects[pi].parts[k].status
                let editable = st == "draft"
                var changedFields: [String] = []
                func set(_ key: String, _ apply: () -> Void) {
                    guard p[key] != nil else { return }
                    guard editable else { return }
                    apply(); changedFields.append(key)
                }
                set("name") { if let v = p.str("name"), !v.isEmpty { db.projects[pi].parts[k].name = v } }
                set("goal") { db.projects[pi].parts[k].goal = p.str("goal") ?? "" }
                set("prompt") { db.projects[pi].parts[k].prompt = p.str("prompt") ?? "" }
                set("acceptance") { db.projects[pi].parts[k].acceptance = Hub.list(p["acceptance"]) }
                set("paths") { db.projects[pi].parts[k].paths = Hub.list(p["paths"]) }
                set("tags") { db.projects[pi].parts[k].tags = Hub.list(p["tags"]) }
                set("note") { db.projects[pi].parts[k].note = p.str("note") }
                set("dependsOn") {
                    let deps = Hub.list(p["dependsOn"]).compactMap { partIndex(pi, $0).map { db.projects[pi].parts[$0].id } }.filter { $0 != partId }
                    var trial = db.projects[pi].parts
                    trial[k].dependsOn = deps
                    if Hub.findCycle(trial) == nil { db.projects[pi].parts[k].dependsOn = deps }
                }
                if !editable && ["name", "goal", "prompt", "acceptance", "paths", "tags", "dependsOn"].contains(where: { p[$0] != nil }) {
                    return .error("Inhalt ist nach der Freigabe gesperrt – zuerst Freigabe zurückziehen oder Nacharbeit anfordern.", status: 409, text: !asJSON)
                }
                // Einteilen: im Entwurf, vor dem Start oder solange der Auftrag noch wartet
                if p["agentId"] != nil {
                    guard ["draft", "waiting", "queued", "failed", "cancelled"].contains(st) else {
                        return .error("Agent kann während der Arbeit nicht gewechselt werden.", status: 409, text: !asJSON)
                    }
                    let aid = p.str("agentId").flatMap { $0.isEmpty ? nil : agentIndex($0) }.map { db.agents[$0].id }
                    db.projects[pi].parts[k].agentId = aid
                    if st == "queued", let tid = db.projects[pi].parts[k].taskIds.last, let ti = db.tasks.firstIndex(where: { $0.id == tid }), db.tasks[ti].status == "queued" {
                        db.tasks[ti].target = aid.map { "agent:\($0)" } ?? "any"
                    }
                    let who = aid.flatMap { a in db.agents.first(where: { $0.id == a })?.name } ?? "beliebigen Worker"
                    projectLog(pi, "\(actorHas(from)) „\(db.projects[pi].parts[k].name)“ eingeteilt → \(who)")
                    dispatch()
                }
                if !changedFields.isEmpty { projectLog(pi, "\(actorHas(from)) „\(db.projects[pi].parts[k].name)“ bearbeitet (\(changedFields.joined(separator: ", ")))") }
                changed()
                return .json(toJSONObject(db.projects[pi].parts[k]))
            case ("DELETE", ""):
                guard ["draft", "cancelled", "failed"].contains(db.projects[pi].parts[k].status) else { return .error("Nur Entwürfe, abgebrochene oder fehlgeschlagene Teilbereiche können gelöscht werden.", status: 409) }
                let part = db.projects[pi].parts.remove(at: k)
                for j in db.projects[pi].parts.indices { db.projects[pi].parts[j].dependsOn.removeAll { $0 == part.id } }
                projectLog(pi, "\(actorHas(from)) Teilbereich „\(part.name)“ gelöscht")
                startReadyParts(pi)
                recomputeProject(pi)
                return .json(["ok": true])
            case ("POST", "approve"):
                return partReply(approvePart(pi, partId, by: from), "✅ Freigegeben.")
            case ("POST", "unapprove"):
                return partReply(unapprovePart(pi, partId, by: from), "Freigabe zurückgezogen.")
            case ("POST", "accept"):
                return partReply(acceptPart(pi, partId, note: rawText("note"), by: from), "✅ Abgenommen. Abhängige Teilbereiche starten automatisch, sobald sie freigegeben sind.")
            case ("POST", "rework"):
                let j = req.json
                return partReply(reworkPart(pi, partId, note: j?.str("note") ?? rawText("note"), prompt: j?.str("prompt"), by: from),
                                 "🔁 Nacharbeit angefordert. Der Nutzer prüft und gibt sie frei; danach geht sie an den Worker.")
            default: break
            }
        default: break
        }
        return .error("Unbekannter Endpunkt: \(m) \(req.path) – siehe \(base)/api/docs", status: 404, text: !asJSON)
    }
}
