import Foundation

/// Texte, die Agenten (z. B. Claude Code) direkt als Anleitung lesen.
enum Texts {

    static func waitCommand(_ base: String, _ agentId: String) -> String {
        "while :; do R=$(curl -s --max-time 75 \"\(base)/api/agents/\(agentId)/wait?timeout=60\"); [ -n \"$R\" ] && { printf '%s\\n' \"$R\"; break; }; sleep 2; done"
    }

    static func join(base: String, name: String?, role: String?, tags: String?, supervisor: String? = nil) -> String {
        let sup = supervisor ?? ""
        let n = name ?? "<NAME>"
        let r = role ?? "worker"
        let t = tags ?? "<tags>"
        return """
        # 🎼 Dirigent – Anmeldung für KI-Agenten

        Du meldest dich jetzt als Agent bei der Orchestrierungs-Plattform „Dirigent“ an (\(base)).
        Danach hältst du dich bereit und bekommst Aufträge per curl zugestellt.

        ## 1. Registrieren
        Führe diesen Befehl aus (Platzhalter ersetzen):

        curl -s -X POST "\(base)/api/agents?format=text" \\
          --data-urlencode "name=\(n)" \\
          --data-urlencode "role=\(r)" \\
          --data-urlencode "tags=\(t)" \\
          --data-urlencode "description=<ein Satz: wofür du zuständig bist>" \\
          --data-urlencode "supervisor=\(sup)" \\
          --data-urlencode "cwd=$PWD"

        - name: kurz und eindeutig. Nutze den Namen, den dir der Nutzer gibt, sonst den Projektordner.
        - role: `worker` (Standard) oder `manager`, wenn der Nutzer dich zum Manager/Orchestrator macht.
        - tags: Fähigkeiten, kommagetrennt (z. B. `frontend,swift,tests`). Aufträge können an Tags gehen.
        - supervisor: Name deines Vorgesetzten (Manager/Orchestrator), falls der Nutzer einen nennt – sonst leer lassen.
          So entstehen Teams und Orchestratoren über mehreren Orchestratoren.

        Grundregeln in Dirigent: Stelle bei Unklarheiten Rückfragen an deinen Manager, statt zu raten. Melde regelmäßig deinen
        Zwischenstand (die Antwort enthält neue Nachrichten und Unterbrechungen). Dokumentiere jeden Auftrag in der
        Beschreibungsdatei, die Dirigent dir nennt. Details stehen in jedem Auftrag.

        Die Antwort enthält deine persönliche ID und den Warte-Befehl. Folge ihr genau.
        """
    }

    static func registered(_ a: Agent, base: String, hub: Hub) -> String {
        var s = """
        ✅ Angemeldet bei Dirigent als „\(a.name)“ (ID: \(a.id), Rolle: \(a.role == "manager" ? "Manager" : "Worker")).

        ## So funktioniert das Bereithalten (wichtig – spart alle Tokens)
        1. Starte den Warte-Befehl unten mit dem Bash-Tool IM HINTERGRUND (`run_in_background: true`).
        2. Beende danach SOFORT deinen Zug mit einer kurzen Meldung wie „Bereit – warte auf Aufträge von Dirigent.“
           Nicht nachsehen, nicht pollen, kein sleep, kein Monitor. Solange du wartest, verbrauchst du keine Tokens.
        3. Claude Code weckt dich automatisch, sobald der Befehl endet – das passiert genau dann, wenn ein Auftrag da ist.
           Die Ausgabe des Befehls IST dein Auftrag, inklusive Anleitung zum Melden des Ergebnisses.
        4. Nach jedem Auftrag: Ergebnis melden → Warte-Befehl erneut im Hintergrund starten → Zug beenden.

        ## Warte-Befehl (jetzt im Hintergrund starten)
        \(waitCommand(base, a.id))

        """
        if a.role == "manager" { s += "\n" + managerGuide(a, base: base, hub: hub, parentId: nil) }
        return s
    }

    static func task(_ t: TaskItem, agent a: Agent, hub: Hub, base: String, inbox: [Message] = []) -> String {
        let from: String = {
            if t.createdBy.hasPrefix("agent:"), let i = hub.agentIndex(String(t.createdBy.dropFirst(6))) { return "Agent \(hub.db.agents[i].name)" }
            if t.createdBy.hasPrefix("project:"), let p = hub.db.projects.first(where: { $0.id == String(t.createdBy.dropFirst(8)) }) { return "Projekt „\(p.name)“" + (t.partId != nil && t.kind == "task" ? " (vom Nutzer freigegeben)" : "") }
            switch t.createdBy {
            case "user": return "Nutzer (Dashboard)"
            case "system": return "Dirigent"
            case "zeitplan": return "Zeitplan"
            case "api": return "API / curl"
            default: return t.createdBy
            }
        }()
        let head = ["notification": "RÜCKMELDUNG", "message": "NACHRICHT"][t.kind] ?? "NEUER AUFTRAG"
        var s = """
        ════════════ 🎼 DIRIGENT · \(head) ════════════
        Auftrag: \(t.title)
        ID: \(t.id)   ·   Von: \(from)   ·   Für: \(a.name)


        """
        if t.kind == "message" {
            s += inboxText(inbox, agent: a, base: base, hub: hub)
            s += """

            ## Wenn du fertig bist
            Bearbeite die Nachricht(en) – bei Ergänzungen: weiterleiten bzw. umsetzen, bei Rückfragen: beantworten.
            Schließe dann mit /complete ab. Dein Ergebnistext geht als Antwort an den Absender (bei einer Rückfrage ist er die Antwort):

            curl -s -X POST "\(base)/api/tasks/\(t.id)/complete" --data-binary @- <<'DIRIGENT_EOF'
            <deine Antwort / was du veranlasst hast>
            DIRIGENT_EOF

            Danach wieder bereit melden – IM HINTERGRUND starten (run_in_background) und Zug sofort beenden:
            \(waitCommand(base, a.id))

            """
            return s
        }
        s += """
        ──────────── PROMPT ────────────
        \(t.prompt)
        ────────────────────────────────


        """
        if !inbox.isEmpty { s += inboxText(inbox, agent: a, base: base, hub: hub) + "\n" }
        if let pid = t.projectId, let p = hub.db.projects.first(where: { $0.id == pid }) {
            if t.kind == "task" && t.partId == nil { s += planGuide(p, agent: a, base: base, hub: hub) + "\n" }
            if t.kind == "notification", let partId = t.partId, let part = p.parts.first(where: { $0.id == partId }) {
                s += reviewGuide(p, part, agent: a, base: base) + "\n"
            }
            if a.role == "manager" && t.kind == "task" && t.partId != nil { s += managerGuide(a, base: base, hub: hub, parentId: t.id) + "\n" }
        } else if a.role == "manager" { s += managerGuide(a, base: base, hub: hub, parentId: t.parentId ?? t.id) + "\n" }
        if t.kind == "task" { s += workingGuide(t, agent: a, base: base, hub: hub) + "\n" }
        s += """
        ## Wenn du fertig bist
        Ergebnis melden (knappe, aussagekräftige Zusammenfassung\(t.docFile != nil ? " – nenne die Beschreibungsdatei" : "")):

        curl -s -X POST "\(base)/api/tasks/\(t.id)/complete" --data-binary @- <<'DIRIGENT_EOF'
        <dein Ergebnis>
        DIRIGENT_EOF

        Falls es nicht klappt:     curl -s -X POST "\(base)/api/tasks/\(t.id)/fail" --data-binary "Grund…"

        Danach wieder bereit melden – IM HINTERGRUND starten (run_in_background) und Zug sofort beenden:
        \(waitCommand(base, a.id))
        """
        if t.kind == "notification" {
            s += "\n\n(Hinweis: Das ist eine Rückmeldung. Bestätige sie mit /complete – ein kurzes „ok“ genügt –, arbeite dann dein eigentliches Ziel weiter ab.)"
        }
        return s + "\n"
    }

    /// Pflichten während der Arbeit: Rückfragen, Zwischenstände (= Postfach), Beschreibungsdatei.
    static func workingGuide(_ t: TaskItem, agent a: Agent, base: String, hub: Hub) -> String {
        let sup = hub.supervisorRef(task: t, agentId: a.id)
        let who = sup == "user" ? "den Nutzer" : hub.partyName(sup) + (sup == "user" ? "" : " (dein Manager)")
        var s = """
        ## Während der Arbeit – verbindlich
        1. RÜCKFRAGEN STATT RATEN. Ist etwas unklar, widersprüchlich, fehlt eine Entscheidung oder eine Information –
           frage \(who). Lieber einmal zu viel fragen als falsch bauen:
           curl -s -X POST "\(base)/api/tasks/\(t.id)/ask" --data-binary @- <<'DIRIGENT_EOF'
           <präzise Frage mit Kontext, deinen Optionen und deiner Empfehlung>
           DIRIGENT_EOF
           Die Antwort enthält einen Warte-Befehl: im Hintergrund starten, Unabhängiges weiterbearbeiten
           oder den Zug beenden – du wirst mit der Antwort geweckt (0 Tokens beim Warten).
        2. ZWISCHENSTAND + POSTFACH. Melde nach jedem größeren Schritt (spätestens alle ~5 Minuten Arbeit) kurz den Stand:
           curl -s -X POST "\(base)/api/tasks/\(t.id)/progress" --data-binary "Stand…"
           Die Antwort enthält neue Nachrichten, Ergänzungen und ggf. eine ⛔ UNTERBRECHUNG. Lies sie immer und befolge sie sofort.
        """
        if let doc = t.docFile {
            s += """

            3. BESCHREIBUNGSDATEI (wie eine README auf GitHub): \(doc)
               Dirigent hat sie angelegt; dein vollständiger Auftrag steht wörtlich darin – lass ihn stehen.
               Fülle ALLE Abschnitte präzise und ausführlich aus und halte sie während der Arbeit aktuell:
               was genau umgesetzt wurde, Entscheidungen samt Begründung, Schnittstellen/Datenformate, geänderte Dateien,
               Nutzung mit Beispielen, Tests/Nachweise, Abweichungen, offene Punkte, Rückfragen & Antworten.
               Alles, was im Auftrag steht, muss sich darin wiederfinden – plus alle Ergänzungen, die sich ergeben haben.
            """
        }
        return s + "\n"
    }

    static func inboxText(_ msgs: [Message], agent a: Agent, base: String, hub: Hub) -> String {
        guard !msgs.isEmpty else { return "## 📬 Keine neuen Nachrichten\n(Sie wurden bereits zugestellt.)\n" }
        var s = "## 📬 NEUE NACHRICHTEN (\(msgs.count))\n"
        if msgs.contains(where: { $0.urgent }) {
            s += "⛔ UNTERBRECHUNG: Halte sofort an. Lies die Nachricht(en) und richte dich danach, bevor du irgendetwas anderes tust.\n"
        }
        for m in msgs {
            let fromName = hub.partyName(m.from)
            let taskRef = m.taskId.flatMap { hub.task($0) }.map { " zu Auftrag „\($0.title)“ (\($0.id))" } ?? ""
            let label: String = {
                switch m.kind {
                case "question": return "❓ RÜCKFRAGE von \(fromName)\(taskRef)"
                case "answer": return "💬 ANTWORT von \(fromName)\(m.replyTo != nil ? " auf deine Frage" : "")\(taskRef)"
                case "supplement": return "➕ ERGÄNZUNG von \(fromName)" + (m.projectId.flatMap { pid in hub.db.projects.first(where: { $0.id == pid }) }.map { " zu Projekt „\($0.name)“" } ?? taskRef)
                case "system": return "⚙️ HINWEIS von Dirigent\(taskRef)"
                default: return "💬 NACHRICHT von \(fromName)\(taskRef)"
                }
            }()
            s += "\n--- \(m.urgent ? "⛔ DRINGEND · " : "")\(label) [\(m.id)] ---\n\(m.text)\n"
            if m.kind == "question" {
                s += """
                → Antworten:     curl -s -X POST "\(base)/api/messages/\(m.id)/answer?from=\(a.id)" --data-binary @- <<'DIRIGENT_EOF'
                                 <Antwort>
                                 DIRIGENT_EOF
                → Weiß du es nicht sicher: weitergeben an deinen Vorgesetzten bzw. den Nutzer:
                                 curl -s -X POST "\(base)/api/messages/\(m.id)/escalate?from=\(a.id)" --data-binary "kurzer Hinweis"

                """
            }
            if m.kind == "supplement" { s += supplementGuide(m, agent: a, base: base, hub: hub) }
        }
        return s
    }

    /// Anleitung für den Manager, wie er eine Ergänzung zerlegt und verteilt.
    static func supplementGuide(_ m: Message, agent a: Agent, base: String, hub: Hub) -> String {
        var s = """
        → Zerlege diese Ergänzung und ordne sie den betroffenen Agenten zu:
          • laufende Arbeit ergänzen:  curl -s -X POST "\(base)/api/agents/<NAME>/messages?from=\(a.id)&task=<Auftrags-ID>" --data-binary "…"
          • sofort unterbrechen:       dasselbe mit &urgent=1   ·   ganz abbrechen: curl -s -X POST "\(base)/api/tasks/<ID>/cancel"
          • neue Arbeit:               curl -s -X POST "\(base)/api/tasks?target=agent:<NAME>&from=\(a.id)&notify=1" --data-binary @- <<'DIRIGENT_EOF' … DIRIGENT_EOF

        """
        if let pid = m.projectId, let p = hub.db.projects.first(where: { $0.id == pid }) {
            let rows = p.parts.map { x -> String in
                let tid = x.taskIds.last.flatMap { hub.task($0) }
                let who = (tid?.assignedAgentId ?? x.agentId).map { hub.partyName("agent:\($0)") } ?? "nicht eingeteilt"
                return "    [\(x.key)] \(x.name) – \(partStatusLabel[x.status] ?? x.status) – \(who)\(tid.map { " – Auftrag \($0.id)" } ?? "")"
            }.joined(separator: "\n")
            s += """
              • noch nicht freigegebene Teilbereiche anpassen: Plan erneut einreichen (POST \(base)/api/projects/\(p.id)/plan) –
                nur Entwürfe werden ersetzt; der Nutzer gibt danach erneut frei.
              Teilbereiche von „\(p.name)“:
            \(rows.isEmpty ? "    (noch keine)" : rows)

            """
        }
        return s
    }

    static func answerDelivery(q: Message, answer: Message, hub: Hub) -> String {
        """
        💬 ANTWORT von \(hub.partyName(answer.from)) auf deine Rückfrage [\(q.id)]:
        \(answer.text)

        Deine Frage war: \(q.text.prefix(400))
        Arbeite jetzt mit dieser Antwort weiter\(q.taskId.map { " an Auftrag \($0)" } ?? "") und trage sie in deine Beschreibungsdatei (Abschnitt „Rückfragen & Antworten“) ein.

        """
    }

    static func askedReply(_ q: Message, base: String, hub: Hub) -> String {
        """
        ❓ Rückfrage [\(q.id)] an \(hub.partyName(q.to)) gestellt.
        Starte JETZT diesen Befehl im Hintergrund (run_in_background). Arbeite an Unabhängigem weiter oder beende deinen Zug –
        sobald die Antwort da ist, endet der Befehl und du wirst geweckt:
        while :; do R=$(curl -s --max-time 75 "\(base)/api/messages/\(q.id)/wait?timeout=60"); [ -n "$R" ] && { printf '%s\\n' "$R"; break; }; sleep 2; done

        """
    }

    static func docSkeleton(_ t: TaskItem, agent a: Agent, stamp: String, fence: String, hub: Hub) -> String {
        let proj = t.projectId.flatMap { pid in hub.db.projects.first(where: { $0.id == pid }) }
        let todo = "_(vom Agenten auszufüllen)_"
        let sections = t.projectId != nil && t.partId == nil
            ? ["Projektüberblick", "Architektur", "Standards (vollständig)", "Teilbereiche & Zuständigkeiten", "Schnittstellen zwischen Teilbereichen", "Build, Tests & Abnahme", "Offene Punkte", "Rückfragen & Antworten"]
            : ["Zusammenfassung", "Umsetzung im Detail", "Entscheidungen & Begründungen", "Schnittstellen & Datenformate", "Geänderte / neue Dateien", "Nutzung & Beispiele", "Tests & Nachweise", "Abweichungen von Auftrag oder Standards", "Offene Punkte & Ideen", "Rückfragen & Antworten"]
        return """
        # \(t.title)

        > Beschreibungsdatei · Dirigent-Auftrag `\(t.id)` · Agent **\(a.name)** · angelegt \(stamp)\(proj.map { " · Projekt „\($0.name)“" } ?? "")
        > Diese Datei beschreibt präzise, was hier umgesetzt wird – wie eine README. Der vollständige Auftrag steht unten wörtlich;
        > der Agent ergänzt alle weiteren Abschnitte ausführlich.

        ## Auftrag (wörtlich)

        \(fence)text
        \(t.prompt)
        \(fence)


        """ + sections.map { "## \($0)\n\n\(todo)\n" }.joined(separator: "\n")
    }

    static func managerGuide(_ a: Agent, base: String, hub: Hub, parentId: String?) -> String {
        let team = Set(hub.teamMembers(of: a.id))
        let fmt = { (o: Agent) -> String in
            let st = ["waiting": "bereit", "working": "arbeitet", "idle": "verbindet", "offline": "offline"][hub.status(of: o)] ?? ""
            let tags = o.tags.isEmpty ? "" : "  #" + o.tags.joined(separator: " #")
            let d = o.description.isEmpty ? "" : " – \(o.description)"
            let sub = o.role == "manager" ? " 👑 Unter-Manager (orchestriert Team \(hub.teamMembers(of: o.id).count))" : ""
            return "  • \(o.name) [\(o.id)] (\(o.role), \(st))\(sub)\(tags)\(d)"
        }
        let mine = hub.db.agents.filter { team.contains($0.id) && $0.supervisorId == a.id }
        let others = hub.db.agents.filter { $0.id != a.id && !team.contains($0.id) }
        var roster = ""
        if !mine.isEmpty { roster += "Dein Team (direkt):\n" + mine.map(fmt).joined(separator: "\n") + "\n" }
        if !others.isEmpty { roster += (mine.isEmpty ? "Verfügbare Agenten:\n" : "Weitere Agenten:\n") + others.map(fmt).joined(separator: "\n") + "\n" }
        if roster.isEmpty { roster = "  (noch keine weiteren Agenten angemeldet)\n" }
        let parent = parentId.map { "&parent=\($0)" } ?? ""
        let tpls = hub.db.templates.isEmpty ? "  (keine)" : hub.db.templates.map { "  • \($0.name) [\($0.id)]" }.joined(separator: "\n")
        return """
        ## 🎼 Du bist MANAGER – Orchestrierung
        \(roster)
        Auftrag an einen Agenten delegieren (Rückmeldung kommt automatisch als neuer Auftrag an dich):
        curl -s -X POST "\(base)/api/tasks?target=agent:<NAME>&from=\(a.id)&notify=1\(parent)" --data-binary @- <<'DIRIGENT_EOF'
        <Prompt für den Agenten – vollständig und selbsterklärend>
        DIRIGENT_EOF

        Ziele: agent:<name|id> · team:<manager> (freier Agent aus dessen Team) · tag:<tag> · any · all
        Optional: &title=<URL-kodiert> · &priority=<Zahl> · &doc=0 (keine Beschreibungsdatei)
        Baukasten: Delegierst du an einen Unter-Manager, orchestriert er sein Team selbst und meldet dir das Gesamtergebnis.
        Größere Vorhaben mit Freigabe durch den Nutzer: Projekt anlegen – curl -s -X POST "\(base)/api/projects?from=\(a.id)" -H 'Content-Type: application/json' -d '{"name":"…","goal":"…","cwd":"…","manager":"<Unter-Manager>"}'
        Vorlage starten: curl -s -X POST "\(base)/api/templates/<id>/run?from=\(a.id)&notify=1" -d "vars[x]=..." (Vorlagen:)
        \(tpls)

        Führung deiner Agenten:
        • Rückfragen deiner Agenten landen bei dir (als Auftrag oder in deinem Postfach). Beantworte sie präzise;
          weißt du es nicht sicher, leite sie weiter (…/api/messages/<ID>/escalate) – an deinen Vorgesetzten bzw. den Nutzer.
        • Nachricht / Ergänzung an einen Agenten: curl -s -X POST "\(base)/api/agents/<NAME>/messages?from=\(a.id)&task=<Auftrags-ID>" --data-binary "…"
          Unterbrechen: dasselbe mit &urgent=1 · Abbrechen: curl -s -X POST "\(base)/api/tasks/<ID>/cancel"
        • Selbst unklar? Frag deinen Vorgesetzten bzw. den Nutzer: curl -s -X POST "\(base)/api/tasks/<deine Auftrags-ID>/ask" --data-binary "…"
        • Überblick als Text: curl -s "\(base)/api/overview"

        Vorgehen: Teilaufträge verteilen → deinen Auftrag NICHT sofort abschließen, sondern per /progress den Stand melden →
        Warte-Befehl im Hintergrund starten und Zug beenden. Jede Rückmeldung weckt dich. Sind alle Ergebnisse da,
        schließe deinen ursprünglichen Auftrag mit einer Gesamtzusammenfassung ab.

        """
    }

    static func overview(hub: Hub) -> String {
        let label = ["waiting": "bereit", "working": "arbeitet", "idle": "verbindet", "offline": "offline"]
        var s = "🎼 Dirigent – Überblick\n\nAgenten:\n"
        s += hub.db.agents.isEmpty ? "  (keine)\n" : hub.db.agents.map { "  • \($0.name) [\($0.id)] \($0.role) – \(label[hub.status(of: $0)] ?? "")  ✓\($0.completed)" }.joined(separator: "\n") + "\n"
        let active = hub.db.tasks.filter { $0.status == "queued" || $0.status == "running" }
        s += "\nAktive Aufträge (\(active.count)):\n"
        s += active.isEmpty ? "  (keine)\n" : active.map { t in
            let who = t.assignedAgentId.flatMap { id in hub.db.agents.first(where: { $0.id == id })?.name } ?? hub.targetLabel(t.target)
            return "  • [\(t.status)] \(t.title) → \(who)  (\(t.id))"
        }.joined(separator: "\n") + "\n"
        let projects = hub.db.projects.filter { $0.status != "cancelled" }.suffix(8)
        if !projects.isEmpty {
            s += "\nProjekte:\n" + projects.map { p in
                "  • \(p.name) [\(p.id)] – \(p.status) · \(p.parts.filter { $0.status == "accepted" }.count)/\(p.parts.count) abgenommen"
            }.joined(separator: "\n") + "\n"
        }
        let recent = hub.db.tasks.filter { $0.status == "done" || $0.status == "failed" }.suffix(8)
        s += "\nZuletzt abgeschlossen:\n"
        s += recent.isEmpty ? "  (keine)\n" : recent.reversed().map { "  • [\($0.status)] \($0.title) (\($0.id))" }.joined(separator: "\n") + "\n"
        return s
    }
}
