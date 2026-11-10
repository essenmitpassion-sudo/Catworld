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

## 2026-11-10 — Fehlerkorrektur ohne festgehaltenen Ausschnitt
Heimweg-Checkpoint fc994d1958f40d96f5caa1357a20dd42ca071274 extern bestätigt.
Weiterer reproduzierter UI-Fehler: Ausführungszeile hielt den Ausschnitt nach Fehler
fest, obwohl Cursor navigiert wurde. Jetzt folgt Run/Step der Ausführung, bewusste
Cursorbewegung/Klick dem Editor. Fehlermeldung und Fehlerzeile bleiben erhalten;
keine Textänderung oder zusätzliche Undo-Einträge durch Navigation.
RED 2, finale GREEN 189; voller SDL-Smoke inkl. Fehler→Cursor-Navigation PASS.
Belege evidence/error-editing-*.txt. Nächster Schwerpunkt: gezielter Menschentest
zu eigenem Hin-/Rückwegplan; keine zusätzliche Syntax vor Beobachtung des Lernpfads.

Kurzer Menschentestablauf ohne Musterlösung jetzt in README.md: Vorhersage vor Step,
eigener Heimweg, absichtlichen Umweg korrigieren, Entwurf nach Neustart prüfen.
Nur Testanleitung erstellt, noch keine menschlichen Ergebnisse erhoben.

## 2026-11-10 — Freie Reihenfolge statt künstlicher Sperre
Ausgangspunkt 8e87fb8 sauber, Remote unverändert. Beide Laternen unabhängig
aktivierbar; ferne zuerst ist mit Rückweg gültig. powered verlangt weiterhin beide.
Zwei unabhängige Lichtzustände, beide Batterien von Anfang an sichtbar. Doppelte
Aktivierung bleibt Fehler. Kein neues Save-Schema, keine neue Sprachform.
Alten Test für erzwungene Reihenfolge bewusst durch neue Produktregel ersetzt:
RED 2, GREEN 191 einschließlich unabhängig gerenderter ferner Laterne. SDL mit
ferner Laterne zuerst, Rückweg, Heimkehr, Neustart und allen alten Aufgaben PASS.
Belege evidence/free-order-*.txt; Screenshot geprüft. Spielspaß bleibt unbewiesen.

## 2026-11-10 — Weltziel und Programmfehler unterscheiden
Checkpoint freie Routenwahl 4f70f5b8eaf638702230a3450ec43fd442541878 extern bestätigt.
Reproduziert: collect aktiviert Licht, späteres collect scheitert, alte große
Erfolgsmeldung blieb. Jetzt „LICHT AN · PROGRAMM PRÜFEN“ mit Fehlerhinweis; Weltzustand
bleibt korrekt, eigener Code unverändert. Nach echter Korrektur normale Erfolgsmeldung.
RED 1, finale GREEN 192; voller SDL-Smoke mit spätem Fehler/Korrektur und alternativen
Laternenrouten PASS. Belege evidence/partial-success-*.txt, Screenshot geprüft.
Kein menschlicher Lern-/Spaßnachweis. Nächste Aufgabe: Ausgabe-/Editor-Lesbarkeit bei
maximal erlaubtem Programm prüfen, nur reproduzierbare Engpässe beheben.
