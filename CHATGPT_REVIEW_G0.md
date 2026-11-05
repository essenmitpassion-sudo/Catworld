# CATWORLD – unabhängiger G0-Audit und Produktübergabe
Datum: 2026-11-05 · Autor: ChatGPT · Branch: `g0/first-cat-action`

**Wichtig:** Dies ist ein nicht-blockierender REVIEW-HANDOFF. Der Entwicklungsintegrator bleibt Codex. Die Datei enthält Beobachtungen und Empfehlungen, keine selbst gestarteten Codex-Tasks. Prüfe bei Übernahme zuerst den aktuellen Git-HEAD und `CURRENT.md`; falls zwischenzeitlich überholt, nur das weiterhin Relevante anwenden.

## 1. Bestätigter Stand und Evidenzgrenzen

- **G (direkt aus GitHub gelesen):** Branch `g0/first-cat-action` existiert und enthält `neonpaw/core/world.py`, `neonpaw/code/runner.py`, `neonpaw/ui/app.py`, `README.md`, `G0_SECURITY.md`, `LEARNINGS.md`, `PROGRESS_LOG.md`.
- **G:** Weltzustand wird als unveränderliche Dataclass mit einer klaren `transition`-Funktion verändert. Aktuell wird ausschliesslich `move_right` unterstützt.
- **G:** Runner nutzt `ast.parse`; einzig `move_right()` ohne Argumente wird akzeptiert. Beschränkungen: 4096 Zeichen, 320 AST-Knoten, Tiefe 16, 64 Befehle, 64 Schritte. Unbekannter Code wird vor Ausführung abgelehnt.
- **G:** UI enthält Editor, Run/Step/Stop/Reset, SDL-Input und selbst gezeichnete Pixel-Gasse.
- **G (Codex-eigene Belege):** `PROGRESS_LOG.md` meldet 29 bestandene Tests, frische Installation, SDL-Offscreen-Smoke und Screenshots. **ChatGPT hat diese Tests nicht unabhängig erneut ausgeführt.**
- **G:** `G0_SECURITY.md` benennt die korrekte Einschränkung: das ist keine Sandbox für beliebigen fremden Python-Code. Kein Internet-/Dateizugriff über Spielercode implementiert.
- **OPEN:** Windows-Start, menschliche Bedienbarkeit, tatsächliches Anfänger-Lernen und Spielspass sind nicht belegt. Technischer G0-Pass ist nicht gleich Human-Pass.
- **G:** `CURRENT.md` und `NEXT_TASK.md` können zeitlich hinter Commits zurückliegen. In Zweifelsfällen gilt der echte Code/Teststand, nicht das Dokument.

## 2. Unabhängige fachliche Bewertung

**Positiv – behalten:**
- Begrenzte Aufgabe, eine Aktion, ein Renderer, ein Runner; keine parallele Agentenarchitektur.
- Welt und Darstellung sind getrennt; das erlaubt später neue Aktionen, ohne Python-Editor und Rendering zu verdoppeln.
- Ehrliche Testprotokolle: erste rote Collection-Fehler werden nicht als vollständige Verhaltens-REDs verkauft; tatsächlicher regressionsbezogener RED wurde dokumentiert.
- Kein unbeschränktes `exec`/`eval` und keine Behauptung eines vollwertigen Python-Sandboxes.
- Lokales Backup bei GitHub-403 statt künstlichem Entwicklungsstopp.

**Gezielte Risiken – prüfen, aber nicht G0 künstlich neu aufmachen:**
1. Die unterstützte Sprachmenge ist absichtlich sehr schmal. Als G0 korrekt; für G1/G2 Erweiterung pro *einzelner* neuer Aktion mit Parser-Negativtests. Kein vorschnelles generisches Python-Framework.
2. `Runner.stop()` setzt Status, bewahrt aber Position; `reset()` setzt Zustand zurück. In der UI muss diese Semantik für Erstspieler ohne Lesen der README erkennbar sein.
3. Code-Zeilenmarkierung nach Editieren ist ein dokumentierter behobener Bug (L009): Regressionstest dauerhaft erhalten.
4. Demo funktioniert offscreen laut Codex, aber Windows und konkrete Schrift-/DPI-/Eingabesituationen müssen später an einem realen Bildschirm geprüft werden.
5. Im branch kann die Dokumentation noch den früheren Zustand `G0_NOT_STARTED` enthalten. Codex sollte die Statusdateien beim nächsten Dokumentationscheckpoint an den echten Stand angleichen, nicht als Blockade benutzen.

## 3. Zwei Minimal-Abnahmen statt Audit-Marathon

**Technisch:** Codex hält reproduzierbare `pytest`-/SDL-Smoke-Ausgaben im Branch vor. Falls ChatGPT keinen ausführbaren Quellcode-Workspace hat, Ergebnis als `G/Codex-eigener M-Beleg` kennzeichnen, nicht `M/eigene Messung`.

**Menschlich (5 Minuten; kein Entwicklungsstopp bei fehlendem Tester):**
- Ohne Erklärtext ausser dem Spiel starten; erkennt ein Anfänger die erste gewünschte Aktion?
- `move_right()` ändern, Run und Step beobachten, einen Tippfehler machen, Stop und Reset nutzen.
- Nach dem Test genau drei Dinge notieren: Verstandener Aha-Moment, Verwirrung, Wunsch nach nächster Handlung.
- Bis dahin `HUMAN_NEEDS_TEST`; keine „FUN_PASS“-Behauptung.

## 4. Produktentscheidung für nach G0 (nicht jetzt implementieren)

**Nächstes kleinste Gameplay-Inkrement:** Batterie aufnehmen → einen Neon-Automaten sichtbar einschalten. Danach erst Wiederholung/Schleife. Weltreaktion muss sofort verständlich und attraktiv sein.

Ausführung nach Pareto:
- 1 neue erlaubte Aktion (`collect()`) mit Weltzustandsübergang und klarer Fehlersemantik.
- 1 ansprechende Reaktion im Renderer (Automat wird hell), keine generische Event-Bus-/Quest-Engine.
- 1 nachvollziehbarer neuer Tutorial-Schritt für absolute Anfänger, ohne die Lösung ungefragt einzusetzen.
- RED Verhalten + GREEN + Refactor + SDL-Smoke + Status-Checkpoint.
- Keine Flotten, Drohnen, Production Chains, Procedural City oder zusätzlichen Agenten für dieses Inkrement.

Siehe [Design-Issue #1](https://github.com/essenmitpassion-sudo/Catworld/issues/1): 90-Sekunden-First-Time-Experience und langfristige Systemtiefe. **Design-Issue #1 ist keine aktive G0-Blockade.**

## 5. Hand-in-Hand-Protokoll ohne Live-Verbindungsbehauptung

1. Codex liest bei jeder *neuen* Arbeitsrunde Git-HEAD, `NEXT_TASK.md`, `CURRENT.md` und dieses Audit-Dokument; nur die aktuelle Aufgabe ist aktiv.
2. ChatGPT kontrolliert GitHub unabhängig und hinterlegt Befunde als PR-Review, Issue oder diese Review-Datei. Keine Änderungen an laufenden Kerncode-Dateien durch ChatGPT, solange Codex darin schreibt.
3. Codex nimmt Befunde nach eigenem Repro-/Relevanzcheck auf; ein REVIEW ist nicht automatisch eine Produktfreigabe oder ein Befehl zum Umbau.
4. Bei Schreib-/Pushkonflikten gilt: keine force pushes; neuen HEAD lesen, korrigierenden Commit anfügen oder gesonderte Review-Branch nutzen.
5. Fehler mit wiederverwendbarer Ursache in `LEARNINGS.md`, verifizierte Lieferungen in `PROGRESS_LOG.md`, aktuellen Stand in `CURRENT.md` dokumentieren. Nicht pro Mikro-Fix Papier produzieren.
6. Nur ein Codex-Integrator; Reviewer/Agenten read-only bis ein klarer Nutzen nachgewiesen wird. GitHub-Meldungen starten Codex nicht automatisch.
7. **Nicht auf neue Freigaben warten**, wenn innerhalb der aktiven Scope-Grenzen korrekt lokal getestet und gesichert weiterentwickelt werden kann.

## 6. Wichtigste dauerhafte Erkenntnis

**Ein Sicherheitscheckpoint ist keine Veröffentlichungsabhängigkeit. Ein grüner technischer Test ist kein Nachweis von Lernwert. Ein Agentenbericht ist kein Produktfortschritt.** Jede neue Regel muss zeigen, welchen konkreten Fehler sie verhindert und darf den kleinsten nächsten spielbaren Schritt nicht blockieren.
