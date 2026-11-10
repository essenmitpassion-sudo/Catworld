# CURRENT — 2026-11-10 — Rückwege und freiwilliger Heimweg

Ziel: Cyberpunk-Python-Lernspiel, kleine spielbare Batches, ein Integrator.
Branch g0/first-cat-action. Ausgangspunkt a647738a879e78f2ad32db01530600f5883a2d9e.
Extern bestätigter Rückweg-Checkpoint 86aed28b8e73bd2a7014a50c9436f3e706490939.
Nachfolgender Abschlusscommit ergänzt optionalen Heimweg; SHA mit git log -1 prüfen.

## Tatsächlich spielbar
Bestehende sechs Lernabschnitte bis zum Laternenpaar; fünf gespeicherte Editorentwürfe.
Undo/Redo, horizontale Nachführung, Hilfe ohne Weltüberdeckung und Zeilenfortschritt.
Neu: move_left() für freie Rückwege in allen bestehenden Szenarien. Keine neue
Python-Grammatik, nur zusätzlicher erlaubter parameterloser Aktionsname. Grenzen,
Argumente, Schleifen-Shadowing und Ressourcenlimits getestet. Umwege sind gültig.
Dachfortschritt nutzt aktuelle Position statt Gesamtbewegungen.
Optional beim Laternenpaar: eigener Plan schaltet beide Lichter ein und führt Nox
zur Startposition zurück. Titel „NOX IST ZUHAUSE“ erst bei beendetem Programm,
beiden Lichtern und Startposition. Alter Erfolg bleibt gültig; kein neuer Editor,
kein neues Save-Schema, kein automatisch eingefügter Code. Heim-Marker sichtbar.

## Tests und Grenzen
RED Rückweg 5 failed/3 passed; GREEN 186. Heimweg RED 1; finale Suite 187 GREEN.
SDL-Offscreen-Smoke: Umweg mit Linksbewegung, Stop/Reset, alle früheren Aufgaben,
beide Laternen, freiwilliger Heimweg, Entwurfswiederherstellung. Screenshots geprüft.
Belege evidence/backtracking-*.txt und homecoming-*.txt.
Menschlicher Spielspaß/Lerntransfer, Windows/DPI und unabhängiger Audit bleiben offen.
Keine bekannte reproduzierte Regression. Nur Test-CI, kein Entwicklungsscheduler.

## Produktentscheidung / Wiederaufnahme
Ressourcenwahl vertagt: bloß unterschiedliche Lichtfarben wären kein zusätzlicher
Entscheidungsraum. Rückwege bieten mehr Freiheit mit minimalen Weltregeländerungen.
Nächste priorisierte Aufgabe: Fehlerreaktion beim Überschreiten eines Kartenrands
verbessern, damit Spieler die fehlerhafte Stelle direkt im Plan korrigieren können;
aktuelle Fehlermeldung/Zeilenmarkierung zuerst prüfen, nichts doppelt implementieren.
Erster Befehl: `cd /workspace/Catworld && git status --short --branch && git log -5 --oneline`
1. Arbeit und Backups sichern, Remote/Reviews vergleichen.
2. NEXT_TASK.md mit einer reproduzierbaren kleinen Verbesserung bearbeiten.
3. Volle Tests/SDL, Commit + Bundle verify + Push/Remote prüfen; bei Limit Checkpoint.
Recovery-Archive nicht überschrieben. /workspace/Catworld-backtracking.bundle geprüft.
Keine bewusst offene WIP-Arbeit; echter Git-Status gilt vor diesem Dokument.
