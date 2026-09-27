import Foundation

/// Texte für Projekte: Planungsanleitung (Manager), freigegebener Worker-Prompt, Abnahme-Anleitung.
extension Texts {

    static let partStatusLabel = [
        "draft": "Entwurf – wartet auf Freigabe", "waiting": "freigegeben – wartet auf Abhängigkeiten", "queued": "freigegeben – wartet auf Agent",
        "running": "in Arbeit", "delivered": "abgeliefert – wartet auf Abnahme", "accepted": "abgenommen",
        "failed": "fehlgeschlagen", "cancelled": "abgebrochen",
    ]

    /// Standards nach Kategorie gruppiert (Reihenfolge des ersten Auftretens).
    static func standardsText(_ list: [ProjectStandard]) -> String {
        guard !list.isEmpty else { return "(keine Standards festgelegt)" }
        var cats: [String] = []
        for s in list where !cats.contains(s.category) { cats.append(s.category) }
        return cats.map { c in
            "### \(c)\n" + list.filter { $0.category == c }.map { s in
                let head = "- [\(s.mandatory ? "MUSS" : "SOLL")] \(s.id) \(s.title)"
                return s.rule == s.title ? head : head + ": \(s.rule)"
            }.joined(separator: "\n")
        }.joined(separator: "\n\n")
    }

    static func agentName(_ id: String?, hub: Hub) -> String? {
        id.flatMap { a in hub.db.agents.first(where: { $0.id == a })?.name }
    }

    /// Der Prompt, den ein Worker nach deiner Freigabe erhält – vollständig und selbsterklärend.
    static func partPrompt(_ p: Project, _ part: ProjectPart, hub: Hub) -> String {
        let n = (p.parts.firstIndex(where: { $0.id == part.id }) ?? 0) + 1
        var s = """
        🎼 PROJEKT „\(p.name)“ · Teilbereich \(n)/\(p.parts.count): \(part.name)
        Vom Nutzer freigegeben. Plan-Revision \(p.revision)\(agentName(p.managerId, hub: hub).map { ", geplant von Manager \($0)" } ?? "").

        ## Projektziel
        \(p.goal)
        """
        if !p.cwd.isEmpty { s += "\n\nArbeitsverzeichnis: \(p.cwd)" }
        if !p.summary.isEmpty { s += "\n\n## Architektur & Plan (vom Manager)\n\(p.summary)" }
        s += "\n\n## Dein Teilbereich: \(part.name)"
        if !part.goal.isEmpty { s += "\nZiel: \(part.goal)" }
        s += "\n\n\(part.prompt)"
        if !part.paths.isEmpty {
            s += "\n\n## Zuständigkeit – nur diese Pfade ändern\n" + part.paths.map { "- \($0)" }.joined(separator: "\n")
            s += "\nAndere Teilbereiche werden parallel von anderen Agenten bearbeitet. Änderungen außerhalb deiner Pfade nur, wenn unvermeidbar – dann im Ergebnis begründen."
        }
        let others = p.parts.filter { $0.id != part.id }
        if !others.isEmpty {
            s += "\n\n## Andere Teilbereiche (nicht deine Aufgabe)\n" + others.map { o in
                "- \(o.name)\(o.paths.isEmpty ? "" : " [\(o.paths.joined(separator: ", "))]")\(agentName(o.agentId, hub: hub).map { " – \($0)" } ?? "")"
            }.joined(separator: "\n")
        }
        if !part.acceptance.isEmpty {
            s += "\n\n## Abnahmekriterien – alle müssen erfüllt sein\n" + part.acceptance.enumerated().map { "\($0.offset + 1). \($0.element)" }.joined(separator: "\n")
        }
        s += "\n\n## Verbindliche Projekt-Standards\nMUSS = zwingend einhalten. SOLL = einhalten, Abweichungen im Ergebnis begründen.\n\n" + standardsText(p.standards)
        let deps = part.dependsOn.compactMap { d in p.parts.first(where: { $0.id == d }) }
        if !deps.isEmpty {
            s += "\n\n## Ergebnisse, auf denen du aufbaust\n" + deps.map { d in
                let r = d.result ?? "(noch kein Ergebnis)"
                return "### \(d.name)\(agentName(d.agentId, hub: hub).map { " (\($0))" } ?? "")\n" + (r.count > 2500 ? String(r.prefix(2500)) + "\n…(gekürzt)" : r)
            }.joined(separator: "\n\n")
        }
        if part.round > 1 {
            s += "\n\n## ⚠️ NACHARBEIT – Runde \(part.round)\n\(part.note ?? "")"
            if let r = part.result, !r.isEmpty { s += "\n\nVorheriges Ergebnis:\n" + (r.count > 2500 ? String(r.prefix(2500)) + "\n…(gekürzt)" : r) }
        }
        s += """


        ## Ergebnis melden – genau dieses Format
        1. Zusammenfassung (2–4 Sätze)
        2. Geänderte / neue Dateien
        3. Abnahmekriterien: je Kriterium ✅ oder ❌ mit kurzem Nachweis (z. B. Befehl + Ausgabe)
        4. Standards: Abweichungen mit Begründung (oder „keine“)
        5. Offene Punkte / Hinweise für andere Teilbereiche
        Kannst du ein Abnahmekriterium nicht erfüllen, melde /fail mit Grund statt /complete.
        """
        return s
    }

    /// Kompakter Plan als Text (für Überarbeitungen und den Überblick).
    static func planSummary(_ p: Project, hub: Hub) -> String {
        var s = ""
        if !p.summary.isEmpty { s += "Zusammenfassung: \(p.summary)\n\n" }
        s += "Standards (\(p.standards.count)):\n" + standardsText(p.standards) + "\n\n"
        s += "Teilbereiche (\(p.parts.count)):\n"
        s += p.parts.isEmpty ? "(keine)\n" : p.parts.map { part in
            let deps = part.dependsOn.compactMap { d in p.parts.first(where: { $0.id == d })?.key }
            var line = "- [\(part.key)] \(part.name) – \(partStatusLabel[part.status] ?? part.status)"
            if let a = agentName(part.agentId, hub: hub) { line += " – eingeteilt: \(a)" }
            if !deps.isEmpty { line += " – nach: \(deps.joined(separator: ", "))" }
            if !part.paths.isEmpty { line += "\n    Pfade: \(part.paths.joined(separator: ", "))" }
            if !part.goal.isEmpty { line += "\n    Ziel: \(part.goal)" }
            if let n = part.note, !n.isEmpty { line += "\n    Notiz: \(n)" }
            return line
        }.joined(separator: "\n") + "\n"
        return s
    }

    static func projectText(_ p: Project, hub: Hub) -> String {
        let label = ["planning": "in Planung", "review": "wartet auf Freigabe durch den Nutzer", "running": "in Ausführung", "done": "abgeschlossen", "cancelled": "abgebrochen"]
        let accepted = p.parts.filter { $0.status == "accepted" }.count
        var s = """
        🎼 Projekt „\(p.name)“ [\(p.id)] – \(label[p.status] ?? p.status)
        Manager: \(agentName(p.managerId, hub: hub) ?? "–") · Revision \(p.revision) · \(accepted)/\(p.parts.count) Teilbereiche abgenommen
        Ziel: \(p.goal)

        """
        s += planSummary(p, hub: hub)
        let log = p.log.suffix(12)
        if !log.isEmpty { s += "\nVerlauf:\n" + log.map { "  • \($0.text)" }.joined(separator: "\n") + "\n" }
        return s
    }

    static func planGuide(_ p: Project, agent a: Agent, base: String, hub: Hub) -> String {
        let others = hub.db.agents.filter { $0.id != a.id }
        let roster = others.isEmpty ? "  (noch keine weiteren Agenten angemeldet – der Nutzer teilt später ein)" : others.map { o in
            let tags = o.tags.isEmpty ? "" : "  #" + o.tags.joined(separator: " #")
            let d = o.description.isEmpty ? "" : " – \(o.description)"
            let cwd = o.cwd.isEmpty ? "" : " (\(o.cwd))"
            return "  • \(o.name)\(tags)\(d)\(cwd)"
        }.joined(separator: "\n")
        return """
        ## 🎼 PROJEKTPLANUNG – du bist der planende Manager
        Projekt: \(p.name) [\(p.id)]\(p.cwd.isEmpty ? "" : " · Arbeitsverzeichnis: \(p.cwd)")

        Deine Aufgabe ist NUR die Planung. Setze nichts selbst um und delegiere nichts selbst:
        Dirigent verteilt die Teilbereiche erst, wenn der Nutzer deinen Plan geprüft, Agenten eingeteilt und freigegeben hat.

        1. Analysiere das Projekt gründlich (Code, Struktur, Konventionen, Build, Tests, vorhandene Doku).
        2. Lege SEHR VIELE, SEHR PRÄZISE Standards fest (Richtwert 15–40), gruppiert nach Kategorien, z. B.
           Architektur · Schnittstellen & Datenformate · Code-Stil & Benennung · Fehlerbehandlung · Tests ·
           Sicherheit · Performance · UI/UX · Dokumentation · Git & Commits · Abhängigkeiten · Build & Werkzeuge.
           Jeder Standard ist konkret und prüfbar (Dateinamen, Befehle, Beispiele, Grenzwerte) und ist MUSS oder SOLL.
           Schnittstellen zwischen Teilbereichen (Typen, Funktionssignaturen, Endpunkte, Dateiformate) gehören als Standard festgeschrieben.
        3. Zerlege das Ziel in Teilbereiche, die je EIN Agent eigenständig umsetzen kann:
           - paths: klar abgegrenzte Dateien/Ordner – parallele Teilbereiche dürfen sich NICHT überschneiden
           - dependsOn: nur wo wirklich nötig (Teilbereiche ohne Abhängigkeit laufen parallel)
           - prompt: vollständig und selbsterklärend – der Worker kennt nur diesen Prompt, das Projektziel und die Standards
           - acceptance: 3–8 überprüfbare Abnahmekriterien (inkl. konkreter Build-/Test-Befehle)
           - suggestedAgent: passender Agent aus der Liste (optional, der Nutzer entscheidet)
        Angemeldete Agenten:
        \(roster)

        4. Plan einreichen (gültiges JSON; bei Fehlern kommt eine Meldung – korrigieren und erneut senden):
        curl -s -X POST "\(base)/api/projects/\(p.id)/plan?from=\(a.id)" --data-binary @- <<'DIRIGENT_EOF'
        {
          "summary": "Architektur-Überblick und Begründung der Aufteilung (einige Sätze)",
          "standards": [
            {"category": "Architektur", "title": "Kurzer Titel", "rule": "Präzise, prüfbare Regel …", "mandatory": true}
          ],
          "parts": [
            {"key": "api", "name": "REST-API", "goal": "Ein Satz", "prompt": "Vollständiger Auftrag …",
             "acceptance": ["swift build läuft ohne Warnungen", "…"], "paths": ["Sources/Api/"],
             "tags": ["swift"], "dependsOn": [], "suggestedAgent": "backend"}
          ]
        }
        DIRIGENT_EOF

        Erneutes Einreichen ersetzt Standards und alle noch nicht freigegebenen Teilbereiche (gleicher key = gleicher Teilbereich).
        Aktueller Stand: curl -s "\(base)/api/projects/\(p.id)?format=text"

        5. Danach deinen Planungsauftrag mit /complete abschließen (kurze Zusammenfassung des Plans).
           Du wirst automatisch geweckt, sobald ein Teilbereich abgeliefert wird – dann nimmst du ihn ab.

        """
    }

    static func reviewGuide(_ p: Project, _ part: ProjectPart, agent a: Agent, base: String) -> String {
        let u = "\(base)/api/projects/\(p.id)/parts/\(part.id)"
        return """
        ## 🎼 Abnahme durch dich (Manager)
        Prüfe das Ergebnis gegen die Abnahmekriterien und die Projekt-Standards – sieh dir bei Bedarf den Code an
        (Arbeitsverzeichnis: \(p.cwd.isEmpty ? "siehe Projekt" : p.cwd)). Ändere selbst nichts.

        Abnehmen (abhängige Teilbereiche starten dann automatisch):
        curl -s -X POST "\(u)/accept?from=\(a.id)" --data-binary "Kurze Begründung"

        Nacharbeit anfordern (geht zur erneuten Freigabe an den Nutzer, dann an den Worker):
        curl -s -X POST "\(u)/rework?from=\(a.id)" --data-binary @- <<'DIRIGENT_EOF'
        Konkrete, prüfbare Nachbesserungen – was genau fehlt oder ist falsch?
        DIRIGENT_EOF

        Projektstand: curl -s "\(base)/api/projects/\(p.id)?format=text"
        Danach diese Rückmeldung mit /complete bestätigen (kurz: abgenommen / Nacharbeit).

        """
    }
}
