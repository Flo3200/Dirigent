import Foundation

/// Texte, die Agenten (z. B. Claude Code) direkt als Anleitung lesen.
enum Texts {

    static func waitCommand(_ base: String, _ agentId: String) -> String {
        "while :; do R=$(curl -s --max-time 75 \"\(base)/api/agents/\(agentId)/wait?timeout=60\"); [ -n \"$R\" ] && { printf '%s\\n' \"$R\"; break; }; sleep 2; done"
    }

    static func join(base: String, name: String?, role: String?, tags: String?) -> String {
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
          --data-urlencode "cwd=$PWD"

        - name: kurz und eindeutig. Nutze den Namen, den dir der Nutzer gibt, sonst den Projektordner.
        - role: `worker` (Standard) oder `manager`, wenn der Nutzer dich zum Manager/Orchestrator macht.
        - tags: Fähigkeiten, kommagetrennt (z. B. `frontend,swift,tests`). Aufträge können an Tags gehen.

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

    static func task(_ t: TaskItem, agent a: Agent, hub: Hub, base: String) -> String {
        let from: String = {
            if t.createdBy.hasPrefix("agent:"), let i = hub.agentIndex(String(t.createdBy.dropFirst(6))) { return "Agent \(hub.db.agents[i].name)" }
            switch t.createdBy {
            case "user": return "Nutzer (Dashboard)"
            case "system": return "Dirigent"
            case "zeitplan": return "Zeitplan"
            case "api": return "API / curl"
            default: return t.createdBy
            }
        }()
        var s = """
        ════════════ 🎼 DIRIGENT · \(t.kind == "notification" ? "RÜCKMELDUNG" : "NEUER AUFTRAG") ════════════
        Auftrag: \(t.title)
        ID: \(t.id)   ·   Von: \(from)   ·   Für: \(a.name)

        ──────────── PROMPT ────────────
        \(t.prompt)
        ────────────────────────────────


        """
        if a.role == "manager" { s += managerGuide(a, base: base, hub: hub, parentId: t.parentId ?? t.id) + "\n" }
        s += """
        ## Wenn du fertig bist
        Ergebnis melden (knappe, aussagekräftige Zusammenfassung):

        curl -s -X POST "\(base)/api/tasks/\(t.id)/complete" --data-binary @- <<'DIRIGENT_EOF'
        <dein Ergebnis>
        DIRIGENT_EOF

        Falls es nicht klappt:     curl -s -X POST "\(base)/api/tasks/\(t.id)/fail" --data-binary "Grund…"
        Zwischenstand (optional):  curl -s -X POST "\(base)/api/tasks/\(t.id)/progress" --data-binary "Stand…"

        Danach wieder bereit melden – IM HINTERGRUND starten (run_in_background) und Zug sofort beenden:
        \(waitCommand(base, a.id))
        """
        if t.kind == "notification" {
            s += "\n\n(Hinweis: Das ist eine Rückmeldung. Bestätige sie mit /complete – ein kurzes „ok“ genügt –, arbeite dann dein eigentliches Ziel weiter ab.)"
        }
        return s + "\n"
    }

    static func managerGuide(_ a: Agent, base: String, hub: Hub, parentId: String?) -> String {
        let others = hub.db.agents.filter { $0.id != a.id }
        let roster = others.isEmpty ? "  (noch keine weiteren Agenten angemeldet)" : others.map { o in
            let st = ["waiting": "bereit", "working": "arbeitet", "idle": "verbindet", "offline": "offline"][hub.status(of: o)] ?? ""
            let tags = o.tags.isEmpty ? "" : "  #" + o.tags.joined(separator: " #")
            let d = o.description.isEmpty ? "" : " – \(o.description)"
            return "  • \(o.name) [\(o.id)] (\(o.role), \(st))\(tags)\(d)"
        }.joined(separator: "\n")
        let parent = parentId.map { "&parent=\($0)" } ?? ""
        let tpls = hub.db.templates.isEmpty ? "  (keine)" : hub.db.templates.map { "  • \($0.name) [\($0.id)]" }.joined(separator: "\n")
        return """
        ## 🎼 Du bist MANAGER – Orchestrierung
        Verfügbare Agenten:
        \(roster)

        Auftrag an einen Agenten delegieren (Rückmeldung kommt automatisch als neuer Auftrag an dich):
        curl -s -X POST "\(base)/api/tasks?target=agent:<NAME>&from=\(a.id)&notify=1\(parent)" --data-binary @- <<'DIRIGENT_EOF'
        <Prompt für den Agenten – vollständig und selbsterklärend>
        DIRIGENT_EOF

        Ziele: target=agent:<name|id>  ·  target=tag:<tag>  ·  target=any (nächster freier Worker)  ·  target=all (alle Worker)
        Optional: &title=<URL-kodiert>  ·  &priority=<Zahl, höher = früher>
        Vorlage starten: curl -s -X POST "\(base)/api/templates/<id>/run?from=\(a.id)&notify=1" -d "vars[x]=..." (Vorlagen:)
        \(tpls)
        Überblick als Text: curl -s "\(base)/api/overview"

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
        let recent = hub.db.tasks.filter { $0.status == "done" || $0.status == "failed" }.suffix(8)
        s += "\nZuletzt abgeschlossen:\n"
        s += recent.isEmpty ? "  (keine)\n" : recent.reversed().map { "  • [\($0.status)] \($0.title) (\($0.id))" }.joined(separator: "\n") + "\n"
        return s
    }
}
