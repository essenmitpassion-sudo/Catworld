# Betriebssystem: ChatGPT ↔ GitHub ↔ Codex

**Kein Live-Chat wird vorausgesetzt.** GitHub ist der asynchrone Austausch. ChatGPT kann berechtigte Repo-Dateien/Issues/PRs prüfen und editieren; Codex muss eigenständig auf dieselbe Repo-Quelle eingerichtet sein. GitHub-Kommentar allein startet Codex nicht automatisch. Eine explizite Codex-Task oder dafür autorisierte Automation bleibt nötig.

## Loop
1. Codex liest AGENTS/PRODUCT/CURRENT/NEXT_TASK sowie Issues; wählt genau eine priorisierte Aufgabe.
2. Integrator schreibt Test (RED), minimalen Code (GREEN), refactoriert, testet headless und interaktiv.
3. Sicherung: kleiner Commit, CURRENT mit SHA/Tests/Blocker/next, branch/PR. Nie die einzige Quelle nur lokal lassen.
4. ChatGPT reviewed GitHub **unabhängig**: Erfüllung, Risiko, Lernwert, mögliche Gegenprobe, Umfang. Danach ändert ChatGPT nur das nächstpriorisierte Issue/NEXT_TASK (bei Berechtigung), nicht parallel Core-Code ohne Abgrenzung.
5. Codex nimmt neuen Auftrag erst bei explizitem nächsten Lauf auf oder über eine tatsächlich konfigurierte autorisierte Automation. Keine angeblich aktive Verbindung erfinden.

## Red–Green–Refactor
RED reproduziert das neue gewünschte Verhalten / echten Bug und scheitert erwartungsgemäß; Beleg. GREEN implementiert minimal; Beleg. REFACTOR vereinfacht ohne Verhaltensänderung; alle vorhandenen Tests laufen. Dazu manueller Interaktionslauf für UX und Human-Test für Spaß/Lernwert. Kein Test für jeden Pixel.

## Savepoints / Quota-Stop
- Vor riskantem Eingriff HEAD + `git status`; uncommitted Arbeit identifizieren und sicher sichern.
- Nach jeder abgeschlossenen vertikalen Einheit Commit + `CURRENT.md`; vor langen Runs Zwischensicherung in eigenem Branch.
- Bei Kontextdruck, Budgetwarnung, Zeitlimit, unbekannter Agentenlage oder 2 erfolglosen identischen Fix-Runden: **STOP_FEATURES**, `CURRENT.md` schreiben, vorhandene Änderungen und ungetrackte Dateien sichern (ohne Geheimnisse), Risiken markieren, nächster exakter Test-/Startbefehl, sicherer Handoff/PR.
- Ein neuer Agent liest erst die kanonischen Dateien und kontrolliert den tatsächlichen Repo-HEAD statt Chat-Zusammenfassungen zu vertrauen.
- Keine Secrets in Git, kein blindes Overwrite, kein Force Push, kein `git reset --hard`, kein destruktiver Cleanup; Restore-Fähigkeit bei kritischen Änderungen verifizieren.

## Agentenpolicy
A0 Integrator / einzige Schreibhoheit für Core/Runner. A1 QA/Red Team READ-ONLY für Testlücken und reproduzierbare Fehler, bei Bedarf. A2 Didaktik/UX READ-ONLY für Lernreihenfolge/Verständlichkeit, bei Bedarf. A3 Art/Content nur bei echtem Bedarf, eigener Branch + exclusive files. Höchstens A0 + zwei unabhängige read-only Reviewer gleichzeitig; ohne echte Agenten-Funktion A0 erledigt Rollen sequentiell. Kein autonomer Agenten-Spawner. Jede Delegation benennt Inputs, erlaubte Dateien, Budgetgrenze, Abnahme und Integration. Agentenbelege = reale Task-/Run-ID, Branch, Commit und konkrete Tests.

## Statusformat
M = unmittelbar gemessen (mit Testbefehl, Ergebnis, SHA), G = im Repo gelesen (Quelle/Stand), V = Annahme, O = Owner-Rückmeldung. Bei offenen PRs zuerst `Nr. | Ein Satz | Stand | Aufgabe des Owners`. Sonst maximal: **Ergebnis / Belege / Risiko / Nächste Aktion**. Kein `FUN_PASS` ohne Test durch Menschen. Keine falschen Versprechen über unbegrenztes Weiterarbeiten.

## v4 linkage
Use `GOVERNANCE.md`, `SAFETY_AND_EXECUTION.md`, `REVIEW_PROTOCOL.md`, `MODEL_ROUTING.md` as more specific runbooks. Record milestone learnings in append-only `LEARNINGS.md`, evidence in `PROGRESS_LOG.md`, latest snapshot in `CURRENT.md`. Separate observed git/CI evidence from any agent claim.

## Verbindliche Owner-Korrektur — 2026-11-05
Ein geprüfter lokaler Git-Commit und ein erfolgreich geprüftes Git-Bundle sind ein ausreichender Sicherheitscheckpoint für lokale G0-Entwicklung. GitHub-HTTP-403 ist ein Veröffentlichungsproblem, kein Entwicklungsstopp. Nach einem abgeschlossenen Meilenstein höchstens einen erneuten Push versuchen; bei 403 LOCAL_ONLY dokumentieren und lokal weiterarbeiten. Kein Warten auf Mikrofreigaben. Nur echte Datenverlust-, Sicherheits- oder Ausführbarkeitsrisiken stoppen die Arbeit. Zunächst keine zusätzlichen Agenten. Diese Entscheidung ersetzt widersprechende ältere Regeln.
