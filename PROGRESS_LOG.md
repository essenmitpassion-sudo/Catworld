# NEONPAW — verifiable progress journal (append-only)

Initial entry 2026-11-05: **G** Design package v4 created; no new repository or game code verified. No tests run. Never label docs as shipped product.

For every meaningful change append:

```
Date/time UTC:
Scope / task ID:
Branch and before/after HEAD:
RED: command + expected fail + observed fail or N/A with reason
GREEN: command + exit code + evidence
REFACTOR: command + exit code + evidence
UI smoke: real observed interaction / UI_UNVERIFIED
Known FAIL / OPEN:
Git commit / PR:
Agent contribution (if any): task ID, read-only finding, integration proof
Learning ID added to LEARNINGS.md:
One next action:
```

The journal records history; CURRENT.md is a short current snapshot, and actual git/test state outranks both.

## 2026-11-05 — Startpaket / Zugriffssicherung
M: 25 Owner-Dokumente eingelesen, Paketcommit 09cb0f4 auf g0/first-cat-action. Git-Lesen Exit 0 ohne Refs; Push Exit 128 / HTTP 403. Kein G0-Code, RED/GREEN/REFACTOR NOT_RUN, UI_UNVERIFIED, NEEDS_HUMAN. LOCAL_ONLY; kein PR erstellt. Nächste Aktion: nach Schreibfreigabe denselben Branch pushen und Remote-SHA prüfen. Keine Subagenten gestartet.

## 2026-11-05 — G0 lokales Gameplay und erfolgreiche Veröffentlichung
O: Governance korrigiert: geprüftes lokales Backup erlaubt Entwicklung trotz 403.
M: Ausgangspunkt 90de7e2 und Bundle intakt; git fsck Exit 0. Implementierungscheckpoint ffd2d7f, finale Implementierung 118eaba auf g0/first-cat-action.
RED: `.venv/bin/python -m pytest -q` Exit 2 wegen fehlendem world-Modul (evidence/red.txt); UI analog Exit 2. Diese Initialläufe waren Collection-Fehler, keine durchgelaufenen Verhaltenstests.
GREEN: 26 Core-Tests, anschliessend 28 mit UI, Exit 0 (green-core.txt / green-ui.txt).
Echter Regression-RED: Editoränderung behielt alte Ausführungszeile, 1 failed / 2 passed, Exit 1 (red-editor.txt).
Fix/REFACTOR: gemeinsame Edit-Invalidierung und gecachter Schild-Font; Gesamtsuite 29 passed, Exit 0 (refactor.txt).
Clean install: frische venv + pip install -r requirements.txt Exit 0; dort 29 passed, Exit 0 (clean-install.txt / clean-tests.txt).
UI: echte SDL-Eventqueue, Textinput, Buttons, Rendering, Quit mit offscreen-Treiber PASS (smoke.txt); Vorher/Nachher/Fehler-Screenshots. Kein physischer Desktop oder Human-Test. App-Einstieg mit Quit nach 1 s separat Exit 0.
GitHub: einmaliger neuer Pushversuch nach G0 erfolgreich; git ls-remote bestätigt 118eaba. GitHub-API gh pr list / repo view Forbidden; kein PR erstellt, offene PRs UNKNOWN. Default ist aktuell der erste Branch g0/first-cat-action, kein Merge.
Modelle/Agenten: ein Integrator, keine Subagenten, kein behaupteter Modellwechsel.
Learning: L008 Governance, L009 Editor-Markierung.
OPEN: NEEDS_HUMAN, Windows ungetestet, unabhängiger Audit offen, NO_CI.
Nächste einzige Aufgabe: G0-Abnahme gemäss NEXT_TASK.

## 2026-11-05 — G0-Abschluss vor G1
M: Fast-forward 9315cdf -> e566cea bei sauberem Arbeitsverzeichnis. ChatGPT-Review vom Remote geprüft. AST-Grenzen, Weltimmutabilität, Stop/Reset und L009 stimmen mit Code überein; keine technische Blockade reproduziert. Statusmeldungen präzisiert, keine unnötige Architekturarbeit.
M: 29 Tests grün und SDL-Offscreen-Smoke Exit 0; evidence/g0-closure-tests.txt und g0-closure-smoke.txt. Nur Textänderung, RED hierfür N/A. G0_TECH_CLOSED; Human-/Windows-Test bleiben offen. Gemäss Owner/AGENTS ist der kleine collect-Schritt nun aktiv. Dieser Abschluss wird separat vor G1 committed.

## 2026-11-05 — G1-Minislice: Batterie -> Neon-Automat
M: G0 vor Implementierung separat abgeschlossen in 442cddc. G1-Code 24d644e auf demselben autorisierten Branch. Genau eine neue Aktion; kein Framework/Agent hinzugefügt.
RED: tests/test_collect.py 6 failed / 7 passed, Exit 1 (g1-red.txt); Negativfälle bereits durch G0-Abweisung grün. GREEN Gesamtsuite 42 passed. UI-RED 1 failed / 3 passed, Exit 1 wegen unverändertem Automatenbild; GREEN 43 passed. Refactor: Parserlokale von lines auf commands umbenannt, weiterhin 43 grün. Interne Parserausgabe jetzt (Zeile, Aktionsname), bestehender Sequenztest entsprechend angepasst; Endnutzerverhalten unverändert.
Zusätzliche Grenzcharakterisierung 64 akzeptiert / 65 abgewiesen war sofort grün; kein Produktfix dafür. Final: 45 passed, Exit 0, g1-final-tests.txt. Bestehende G0-Tests bleiben enthalten. Separat installierte venv ebenfalls 45 grün, pip check ohne gebrochene Anforderungen.
UI: echte SDL-Events und offscreen-Renderer: Bewegung, Codeänderung, Step, Stop, Reset, collect, Automatenbeleuchtung, Welt-/Syntaxfehler, Quit. Exit 0 (g1-smoke.txt). Screenshots visuell geprüft; kein Human-Pass. Windows-Start weiterhin nicht auf Windows ausgeführt.
Review-Befunde umgesetzt: nur schmale neue Aktion mit Negativtests; Statussemantik klarer; L009-Test erhalten; alte aktive Statusangaben ersetzt. Learning L010 ergänzt. GitHub PR-API Forbidden; kein PR behauptet. Push nach Checkpoint separat prüfen.
Nächste einzige Aufgabe: Befehlsfolge auf Batterie ein Feld weiter übertragen.

## 2026-11-05 — Lerntransfer statt reinem Run-Erfolg
O: erster Windows-G0-Test war Bedienerfolg, kein eigenes Schreiben. M: sauberer Fast-forward 7bad76c -> 5c67e51, Review G1 gelesen; Aufgabe fehlte im Code.
Implementierung 207ed14: Szenario-Position 2/3, gemeinsame Simulation/Renderer; Weiter bzw. direkter Freier Einstieg mit erhaltenem Code. Transfer-Neustart verhindert Gewinn durch wiederholtes Run/Step bei unverändertem Code, pausierter Step setzt korrekt fort. Drei freiwillige Hilfen, Code nur nach expliziter Beispielanforderung, keine Codeinjektion. Unterstützung bleibt über Reset sichtbar.
RED: sechs neue Tests fehlgeschlagen (fehlender Runner-Parameter/Transfer-Button), Exit 1, evidence/transfer-red.txt. GREEN: 51 passed, Exit 0. Zwei weitere Charakterisierungstests für Fortsetzen/Shortcuts sofort grün. Refactor: Hilfedarstellung aus draw extrahiert; komplette Suite 53 passed, Exit 0 (transfer-refactor.txt). Alle bisherigen G0/G1-Tests erhalten.
UI: SDL-Eventqueue mit Button-Klicks und Textinput, alte Lösung wiederholt erfolglos, geänderte Folge erfolgreich, Hilfestufen/Reset/Szenariowechsel/Fehler/Quit geprüft, Exit 0 (transfer-smoke.txt). Screenshots visuell kontrolliert. Nur offscreen; menschliches Verständnis und Spass offen.
Learnings L011 (Bedienung != Lernen) und L012 (Run-Akkumulation umgeht Transfer) direkt ergänzt. Keine neuen Abhängigkeiten oder Agenten. gh pr list weiterhin Forbidden, kein PR erstellt. Git-Push nach Checkpoint separat bestätigen.
Nächste einzelne Aufgabe: unabhängiger Abruf derselben Befehle, ohne neue Syntax und ohne bestehenden Code zu verlieren.

## 2026-11-06 — Wiederaufnahme ohne Datenverlust; Abruf abgeschlossen
M: Lokal e32eed0 plus uncommitteter Abruf-Schritt, 58 Tests frisch bestanden. Rettung vor Fetch: 0469ae8 und geprüftes Catworld-resume-2026-11-06.bundle. Remote 6358fd8 enthielt nur Handoff; konfliktfreie lokale Integration 4a03027. Kein PR-Merge oder Force-Push. Keine Doppelimplementierung.
M: Gestarteter Batch hatte 5 RED-Fehler, danach 58 GREEN. Vollständige erneute Suite 58 passed / Exit 0 (recall-final-tests.txt). SDL-Smoke nun auch Abruf, echte Eingabe, Rückkehr zu beiden Entwürfen, Stop/Reset/Hilfen, erfolgreiche Weltreaktion und Quit; Exit 0 (recall-smoke.txt). Screenshot visuell geprüft, Human-/Windows-Test der aktuellen Version offen.
M: Keine verfügbare Thread-Automationsfunktion; keine tägliche Automation und kein Scheduler eingerichtet. Ein Integrator, keine Subagenten. gh pr list weiter Forbidden; kein PR behauptet. Learning L013 zur lokal/remote unterschiedlichen Evidenz ergänzt.
Spielschritt: freiwilliges Schreiben aus leerem Editor nach Transfer-Erfolg; Eigenlösung und Abrufentwurf samt Hilfestatus innerhalb Sitzung erhalten. Noch keine dauerhafte Speicherung. Nächste einzelne Aufgabe: diese Texte über Neustarts erhalten, ohne Auto-Ausführung.
