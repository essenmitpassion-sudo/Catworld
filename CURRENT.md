# CURRENT — 2026-11-11 — offener Torstart als Transfer

Basis c047575 extern bestätigt, Bundle /workspace/work/catworld-workshop.bundle geprüft.
Neu: F11 wählt in der Werkstatt den Anfangszustand. Code/Cursor/Undo bleiben;
Run/Reset/Neustart verwenden die Auswahl. Version 6 lädt Versionen 1–5 weiter.
Unverändert getoggelter Plan schliesst das anfangs offene Tor und scheitert sichtbar;
Hinweis fordert Beobachtung der eigenen Zustandsänderung statt blind mehr Code.

RED 3, GREEN 237; voller SDL-Smoke PASS. Review: 26 relevante Tests und
12 Kombinationen von Startzustand/Runnerstatus PASS, keine Befunde.
Menschliches Verständnis/Spielspass und Windows weiterhin nicht getestet.
Belege evidence/workshop-transfer-*.txt/png. Sicherung dieses Pakets vor Ausbau.
Nächste Entscheidung: begrenzten Tor-Sensor plus if ermöglichen, damit ein eigenes
Programm auf beide Startzustände reagieren kann. Keine beliebige Python-Ausführung.

---

# CURRENT — 2026-11-11 — Werkstatt spielbar

Branch: codex/masterplan-run-consistency; Basis 69604d1. Der Owner verlangt
fortgesetzte autonome Arbeit bis zur verfügbaren Grenze und regelmässige Sicherung.

Neu: Nach dem Laternenpaar führt F10 in eine Werkstatt mit eigenem leeren Editor.
Auf Feld 3 öffnet/schliesst toggle() das Tor auf Feld 5; Batterie auf Feld 7.
Das geschlossene Tor blockiert beide Richtungen mit Fehlerzeile. Versorgung reicht
als Erfolg; freiwillig heimkehren und Tor schliessen. Sechs Entwürfe, Undo je Editor,
dreistufige optionale Hilfe, Speicherversion 5 mit Unterstützung für Versionen 1–4.
Kein exec/eval, keine neue Python-Grammatik oder grössere Architekturänderung.

Nachweise: 231 Tests PASS; voller SDL-Offscreen-Smoke PASS. Vorher Core RED 11,
UI RED 7. 500 deterministische Wechsel/Fehler/Stop/Speicher-/Neustartzyklen PASS.
Unabhängiger Review: 22 neue Tests und 62 zulässige v5-Flagkombinationen geprüft,
keine Befunde. Menschlicher Spielspass/Lerntransfer und Windows bleiben offen.
Belege evidence/workshop-*.txt/png. Screenshots geprüft; Reviewer keine Schreibzugriffe.

Sicherung: vollständiges WIP-Archiv inkl. untracked Dateien/Assets unter
/workspace/work/catworld-workshop-wip-2026-11-11.tar.gz; 226 Dateiinhalte per Hash geprüft.
Fertiger Commit und Bundle folgen; SHA/Remote immer mit git prüfen.
Nächster Schritt: Werkstatt unter verändertem anfänglichem Torzustand spielbar
prüfen, damit die eigene Lösung an neue Bedingungen angepasst werden muss.
Keine Freigabe-Warteschleife; bis dahin vorhandenes Paket sichern und weiterarbeiten.

---

# CURRENT — 2026-11-10 — Masterplan geprüft, Run wiederholbar

Aktueller Arbeitsbranch: `codex/masterplan-run-consistency`.
Basis: `7175190acf5dec4c84bf00d1a1d22f36acb4c1d2`, Remote-SHA bestätigt.
Abschluss-SHA mit `git log -1 --format=%H` lesen; Historie unten ist älter.

## Aktueller Auftrag und Ergebnis
- Owner: Masterplan sorgfältig lesen, eigenständig damit arbeiten und vermerken.
- Upload ist bytegleich mit PRODUCT_MASTER_PROMPT.md (SHA-256 in AGENTS.md).
- MASTERPLAN_STATUS.md vergleicht alle 18 Abschnitte mit dem vorhandenen Stand,
  bewertet drei Spielrichtungen und hält Lern-/Architekturpfad und Roadmap fest.
- Neue Versuche im Einstieg beginnen jetzt wie alle späteren Aufgaben am Start.
  Ein erfolgreiches Programm scheitert beim zweiten Run nicht mehr an seinem alten
  Weltzustand. Nach dem ersten Schritt kann collect ergänzt und direkt gestartet werden.
- Step→Run setzt einen pausierten Versuch fort; Stop hält Position bis zum nächsten
  Versuch. Code, Cursor und Undo bleiben erhalten. UI und README sind angepasst.

## Gemessene Qualität
Baseline: 199 PASS. Regression vor Fix: 9 FAIL, 1 PASS (Fortsetzungs-Schutz).
Nach Fix: 209 PASS, voller SDL-Offscreen-Smoke PASS, Screenshot visuell geprüft.
Unabhängiger Code-Review: keine Critical/Important-Befunde; 10 neue Tests erneut PASS.
Ein falscher Methodenname im Plan wurde berichtigt.
Belege: evidence/restart-red.txt, restart-green.txt, restart-smoke.txt,
restart-replayed.png. Smoke separat in /workspace/work/restart-smoke ausgeführt,
damit ältere Bildnachweise nicht überschrieben werden.
Kein menschlicher Spielspass-/Lernnachweis und kein Windows-/DPI-Test.
Kein allgemeiner Python-Interpreter, keine neue Sprache, kein Save-Schemawechsel.

## Sicherung und Wiederaufnahme
Geprüftes Ausgangs-Bundle: /workspace/work/catworld-before-masterplan.bundle.
Implementierungscheckpoint 827bfe2a7558f0c36d6ab8dc0ee005a7467c7460:
Bundle geprüft, Push erfolgreich, identischer Remote-SHA bestätigt.
Abschluss-Bundle: /workspace/work/catworld-masterplan-final.bundle.
Nachfolgender Dokumentationscommit vermerkt den Checkpoint; finalen Push/SHA-Nachweis
in /workspace/work/masterplan-checkpoint.txt prüfen.
Vor Wiederaufnahme Branch und Remote abgleichen; dieser neue Branch enthält den
Fortschritt, g0/first-cat-action wurde nicht automatisch zusammengeführt.
Erster Befehl: `cd /workspace/Catworld && git status --short --branch && git log -3 --oneline`.
Nächste konkrete Aktion: siehe NEXT_TASK.md. Kein Scheduler eingerichtet.

---

# Historische Übergabe — Rückwege und freiwilliger Heimweg

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

## 2026-11-10 — Lange Programme und präzise Mausklicks
Checkpoint 2e8f0b9b78db62de40e1072eabd583fa96f19c7e extern bestätigt.
80 Textzeilen / 60 Aktionen geprüft: 120 Offscreen-Frames median 4,46 ms,
p95 7,89 ms, max 11,45 ms in dieser Cloud; kein Hardware-/Windows-Leistungsversprechen.
Dabei reproduzierter Fehler: Klick in Editorpadding wählte unsichtbare Nachbarzeile.
Auf sichtbare Zeilen begrenzt, bei drei Fenstergrößen geprüft. RED 6 failed/1 passed,
GREEN 199; 4096-Zeichen-Programm mit 64 Aktionen sowie Stop/Reset geprüft.
SDL-Smoke inklusive Klick nach Fehler und allen Spielabschnitten PASS.
Belege evidence/editor-padding-*.txt. Nächste Prüfung: konsistente Run-Neustartregel
im Einstieg gegenüber späteren Aufgaben, ohne pausiertes Step→Run zu verändern.
