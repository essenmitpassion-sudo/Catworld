# CATWORLD / NEONPAW — Codex handoff: Dachweg sichern, kostenlose CI verwenden
Stand: 2026-11-06. Dieser Handoff ist eine Arbeitsinformation, kein Codex-Autostart.

## Echte Quellenlage
**G (über GitHub geprüft):** Default-Branch `g0/first-cat-action`, Remote-Commit zuletzt `37aa6fb2be37c9fab40c7f967078bafe20575ec8`. Dessen Änderung ist `.github/workflows/ci.yml`: pytest + SDL-Offscreen-Smoke auf GitHub-hosted Ubuntu/Python 3.12; Push/PR/manueller Trigger; maximal 12 Minuten; `contents: read`. Keine KI-API-Aufrufe, kein Deployment, kein Auto-Merge. Erster CI-Erfolg noch nicht verifiziert.
**G (Codex-Eigenmeldung, NICHT unabhängig auf GitHub bestätigt):** lokaler Dachweg-Commit `5d3d559`, 130 Tests und SDL-UI-Smoke bestanden, Arbeitsbaum sauber, Bundle geprüft, Wiederaufnahme lokal in `CURRENT.md` und `NEXT_TASK.md` dokumentiert. **Kein Push** des lokalen Checkpoints. Damit dürfen GitHub-Dokumente mit früheren Angaben zu 84 Tests und ausstehender Schleifen-Implementierung nicht als aktueller lokaler Stand gelten.
**G (Ausführungszustand):** 60-Minuten-Codex-Automation konnte mangels Verwaltungswerkzeug nicht eingerichtet werden; kein automatischer Codex-Lauf nachgewiesen. GitHub Actions führt Tests aus, entwickelt aber keinen Code.

## Besitzerentscheidung / Grenzen
- Keine zusätzlichen Kosten; **keinen OpenAI-API-Key, kostenpflichtigen KI-Dienst oder GitHub self-hosted Runner anlegen**.
- Haupt-App und deren Sound-/andere Runner haben absolute Priorität. Keine Modifikation ihrer Repos, Skripte, Scheduler, Prozesse, Ports oder Ressourcenverwaltung.
- Keine lokalen periodischen CMD-/PowerShell-Fenster, kein neuer Polling-Wächter, kein autonomer Windows-Autostart.
- CATWORLD darf in der bereits autorisierten Codex-Sitzung entwickelt werden, ohne Mikrofreigaben für gewöhnliche sichere Änderungen. Das bedeutet **nicht**, dass Codex unbegrenzt oder nach Sitzungsende weiterläuft.
- Genau ein CATWORLD-Kerncode-Integrator. Keine konkurrierenden Writer. Keine Force-Pushs, blindes Reset, Auto-Merges, Secrets oder unbegrenztes Python-`exec`/`eval`.

## Sofortige Codex-Aufgabe: lokale Arbeit bewahren und synchronisieren
1. **Zuerst lokal prüfen:** `git status --short --branch`, `git log --oneline --decorate -12`, aktuelle Branch-/Remote-Refs, uncommittete Änderungen und geprüfte Bundle-Sicherung. Bestätige, dass `5d3d559` vorhanden ist und die 130 Tests zum Code gehören. Nicht aufgrund des alten GitHub-`NEXT_TASK.md` den Dachweg neu implementieren.
2. Sichere ggf. noch fehlende lokale Arbeit mit Commit und überprüfbarer Sicherung. Dann **`git fetch`** und `5d3d559` gegen Remote `37aa6fb` vergleichen. Integriere die zwei Entwicklungsstränge mit normalem Fast-forward/Rebase/Merge **nur nach Analyse und ohne Überschreiben**; keine ungesicherten destruktiven Git-Operationen. Erhalte die neue `.github/workflows/ci.yml` ausdrücklich.
3. Führe die **gesamte** Test-Suite und den SDL-Smoke nach dem Zusammenführen erneut aus. Aktualisiere `CURRENT.md` / `NEXT_TASK.md` minimal mit tatsächlich geprüftem Stand. Wenn möglich, push auf den vorgesehenen Branch; wenn 403/Netzwerkfehler, lokal sichern, knapp als `LOCAL_ONLY` markieren, **keine wiederholte Blockade**.
4. Prüfe unter GitHub Actions, ob der neue Workflow für diesen Push tatsächlich angelaufen und erfolgreich abgeschlossen ist. Wenn nicht, untersuche den konkreten Fehler ohne kostenpflichtige APIs, Workflow-Vervielfachung oder Änderung an der Haupt-App.
5. Sobald Sicherung/CI stabil: nächstes kleines, spielbares Lern-/Gameplay-Inkrement nach Pareto wählen und autonom **während der aktiven Sitzung** entwickeln; Red–Green–Refactor, Regressionen, SDL-Smoke, verifizierbarer Checkpoint. Keine Arbeit nur zum Füllen eines Agentenplans.

## Abschlussmeldung an Owner und unabhängiges ChatGPT-Review
- Lokaler HEAD, Remote HEAD, Branch, Integration von `5d3d559` und `37aa6fb`, Push-Ergebnis.
- Exakte Testzahl und SDL-Smoke-Ergebnis **nach Integration**; GitHub-Actions-Status getrennt ausweisen.
- Was spielbar ist; was als Menschentest offen bleibt.
- Tatsächlicher Automationsstatus: **nur CI**, kein aktivierter kontinuierlicher Codex-Entwicklungs-Scheduler.
- Nächste konkrete spielerische Aufgabe; nur echte Blockaden.
- Quellenstatus: M = selber ausgeführt, G = gelesen, O = Owner-Aussage, V = Vermutung.

Prinzip: Sichere Wahrheit vor Aktivität. Keine falschen Dauerbetriebsversprechen und kein künstlicher Stillstand innerhalb einer aktiven, sicheren Codex-Session.
