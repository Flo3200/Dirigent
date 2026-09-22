# 🎼 Dirigent

**Offene Orchestrierungs-Plattform für KI-Agenten – als native Mac-App.**

Jede Claude-Code-Session (oder jedes andere Programm, das HTTP spricht) meldet sich mit einem Satz bei Dirigent an und hält sich dann bereit. **Solange ein Agent wartet, verbraucht er 0 Tokens.** Erst wenn ein Auftrag kommt, wird er geweckt, erledigt ihn, meldet das Ergebnis per `curl` und wartet wieder.

![Plattform](Resources/web/icon.svg)

## Funktionen

- **Agenten-Anmeldung per Prompt:** `Melde dich bei Dirigent als Agent an und halte dich bereit. Anleitung: curl -s http://127.0.0.1:7777/join`
- **Token-freies Warten:** Der Agent startet einen Long-Poll-`curl` im Hintergrund (`run_in_background`). Claude Code weckt ihn erst, wenn der Befehl endet, also wenn ein Auftrag da ist.
- **Vorlagen:** vorgefertigte Aufgaben mit `{{variablen}}`, optional mit Zeitplan (alle *n* Minuten)
- **Workflows:** mehrstufige Abläufe (`{{input}}`, `{{prev}}`, `{{step1}}` …), z. B. *Bauen → Prüfen → Fixen*
- **Manager-Rolle:** Ein angemeldeter Agent kann zum Manager ernannt werden. Er bekommt Ziele, sieht alle Agenten, delegiert Teilaufträge und wird bei jeder Rückmeldung automatisch geweckt.
- **Zielsteuerung:** `any` · `manager` · `all` · `agent:<name>` · `tag:<tag>` · Prioritäten
- **Offen integrierbar:** REST-API, Server-Sent Events (`/api/events`), Webhooks, Text-Endpunkte für Agenten, API-Key, optionaler WLAN-Zugriff (z. B. vom iPad)
- **Native Mac-App:** eigenes Fenster, Menüleisten-Symbol mit Live-Status, macOS-Mitteilungen, läuft weiter, wenn das Fenster geschlossen ist
- **Keine Abhängigkeiten:** Swift, Network.framework und WebKit; der Server steckt in der App

## Installation

Voraussetzungen: macOS 13+, Xcode, [xcodegen](https://github.com/yonaskolb/XcodeGen) (`brew install xcodegen`).

```bash
git clone https://github.com/Flo3200/Dirigent.git
cd Dirigent
bash scripts/build.sh       # baut, installiert nach /Applications und startet
```

Die Daten liegen unter `~/Library/Application Support/Dirigent/db.json`.

## So funktioniert's

```
 Du ──► Dashboard / curl / Webhook / Manager-Agent
                     │  POST /api/tasks
                     ▼
              ┌─────────────┐   Long-Poll (blockiert, 0 Tokens)
              │  Dirigent   │◄──────────────────────────────  Claude Code (Hintergrund-Befehl)
              │  :7777      │──── Auftrag als Text ─────────►  wird geweckt, arbeitet
              └─────────────┘◄─── POST /complete ───────────  meldet Ergebnis, wartet wieder
```

1. Der Agent liest `GET /join` und registriert sich mit `POST /api/agents?format=text`.
2. Die Antwort enthält seinen persönlichen Warte-Befehl:
   ```bash
   while :; do R=$(curl -s --max-time 75 "http://127.0.0.1:7777/api/agents/<id>/wait?timeout=60"); [ -n "$R" ] && { printf '%s\n' "$R"; break; }; sleep 2; done
   ```
   Timeouts (HTTP 204) fängt die Shell-Schleife ab. Das Modell wird nicht aufgerufen.
3. Kommt ein Auftrag, endet der Befehl und seine Ausgabe *ist* der Auftrag, samt `curl`-Befehlen zum Melden.

> **Hinweis zu Tokens:** Während des Wartens fallen keine Tokens an. Jeder Auftrag kostet normal, denn beim Aufwachen liest das Modell den (gecachten) Session-Kontext.

## API (Auszug)

| Methode | Pfad | Zweck |
|---|---|---|
| GET | `/join` | Anleitung für Agenten |
| POST | `/api/agents` | Agent registrieren (`name`, `role`, `tags`, `description`, `cwd`) |
| GET | `/api/agents/:id/wait` | Long-Poll auf den nächsten Auftrag |
| POST | `/api/tasks` | Auftrag erstellen (JSON oder Query + Rohtext-Body) |
| POST | `/api/tasks/:id/complete` · `fail` · `progress` | Ergebnis / Fehler / Zwischenstand |
| GET | `/api/tasks/:id/wait` | Blockieren, bis ein Auftrag fertig ist |
| POST | `/api/templates/:id/run` | Vorlage ausführen (`vars`) |
| POST | `/api/workflows/:id/run` | Workflow starten (`input`) |
| GET | `/api/events` | Live-Ereignisse (SSE) |
| GET | `/api/state` · `/api/overview` · `/api/docs` | Zustand · Text-Überblick · alle Endpunkte |

Vollständige Referenz: in der App unter **Integration** oder `curl http://127.0.0.1:7777/api/docs`.

### Beispiele

```bash
# Auftrag an einen beliebigen freien Worker
curl -s -X POST "http://127.0.0.1:7777/api/tasks?target=any" --data-binary "Führe alle Tests aus."

# Ziel an den Manager
curl -s -X POST "http://127.0.0.1:7777/api/tasks?target=manager" --data-binary "Release 2.0 vorbereiten"

# Vorlage mit Variablen
curl -s -X POST http://127.0.0.1:7777/api/templates/<id>/run -H 'Content-Type: application/json' -d '{"vars":{"ziel":"Dark Mode"}}'
```

## Projektstruktur

```
Sources/App      AppKit-Hülle: Fenster, WKWebView, Menüleiste, Mitteilungen
Sources/Server   HTTP-Server (Network.framework) inkl. Long-Poll & SSE
Sources/Hub      Zustand, Verteilung, Vorlagen, Workflows, Webhooks, API-Routen, Agenten-Texte
Resources/web    Oberfläche (HTML/CSS/JS, ohne Build-Schritt)
scripts/         build.sh, make-icon.swift
```

## Lizenz

MIT
