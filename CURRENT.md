# CURRENT — 2026-11-12 — Animation folgt neuem Weltstart

Basis9b6d54b extern bestätigt; Bundle catworld-skipped-lines.bundle geprüft.
Bei visueller Selbstprüfung entdeckt: direktes Step im gleichen Ereignisbatch wie
Neustart/Szenariowechsel animierte von alter Position. Neue gemeinsame restart_world
setzt Simulation und Animationsursprung zusammen, bevor weitere Eingaben eintreffen.
RED3, GREEN274, kompletter SDL-Smoke inkl. F10+F6 im selben Ereignisbatch PASS.
Belege evidence/visual-restart-*.txt. Kein Schema-/Syntaxwechsel.
Vor nächstem Paket Commit/Bundle/Push. Nächste Aufgabe weiterhin Planvergleich
für beide Torstarts (NEXT_TASK.md); keine neue Freigabe erforderlich.

---

# CURRENT — 2026-11-12 — übersprungene Zweige sichtbar

Basis37da8c7 extern bestätigt; Bundle /workspace/work/catworld-gate-condition.bundle
geprüft. Branch codex/masterplan-run-consistency.
Neu: nicht ausgeführte separate Aktionszeilen sind grau mit Strich links neben
Zeilennummer. Inline-if wird nicht komplett als unausgeführt markiert. Trace bleibt
für denselben Versuch, Edit/Undo/Reset/load löschen ihn. Kein neuer Modus/Syntax.
RED6, Suite271 PASS, voller SDL-Smoke PASS, Screenshots geprüft. Unabhängiger Review:
34 relevante Tests PASS, nur Markerüberlappung bei dreistelligen Nummern; Marker
nach links verlegt, Darstellung der Zeilen103/104 geprüft. Keine übrigen Befunde.

Vor Fortsetzung Commit/Bundle/Push prüfen. Nächster Pareto-Hebel: freiwilliger
Planvergleich für beide vorhandenen Torstarts, mit genauer Fehlerzeile und ohne
Veränderung der aktuellen Welt/eigenen Programme. Damit wird Robustheit direkt
prüfbar, ohne zusätzliche Level, Syntax oder gespeicherte Modi.
Menschliches Lernen/Spielspass und Windows/DPI weiter offen. Vorheriger Stand unten.

---

# CURRENT — 2026-11-12 — live ausgewertete Torbedingungen

Branch codex/masterplan-run-consistency. Bestätigte Checkpoints: c047575 Werkstatt,
3018555 Startvariation. Letzten Commit und Remote vor Fortsetzung prüfen.

## Spielbarer Fortschritt
F10: Werkstatt mit Schalter auf Feld 3, Tor auf 5, Batterie auf 7; eigener sechster
Entwurf. toggle öffnet/schliesst, Versorgung als Hauptziel, gesicherter Heimweg optional.
F11: Anfangszustand offen/zu, ohne Codeänderung; Auswahl bleibt gespeichert (Format6,
Versionen1–5 lesbar). Neu: gate_open() und oberste if/if-not-Blöcke mit Aktionskörper.
Bedingung liest aktuellen Weltzustand, Step höchstens eine Aktion, übersprungene
Zweige bewirken nichts. F1 optional; Anzeige der letzten tatsächlichen Prüfung.
Keine else/nesting/Variablen oder beliebige Python-Ausführung.

## Nachweise und Selbstkontrolle
265 Tests PASS, kompletter SDL-Offscreen-Smoke PASS inkl. identischem Code für beide
Starts und Edit/Undo. Core RED9, UI RED3. Unabhängiger Review: keine Sicherheitsbefunde,
aber veraltete if-Anzeige nach Edit/Undo (Important) und PC als Aktionszähler (Minor).
Beides korrigiert: RED2+1, GREEN265. Zählfehler ebenfalls als verständnisrelevant
behandelt. Keine falschen historischen Befunde nach Codeänderung.
Belege evidence/gate-condition-*.txt/png. Menschliches Lernen/Spielspass, Windows/DPI
weiter offen. Review ersetzte keine menschlichen Tests.

## Sicherung und nächste Aktion
Bisherige vollständige Bundles /workspace/work/catworld-workshop.bundle und
catworld-workshop-transfer.bundle geprüft; Checkpoints jeweils extern bestätigt.
Bedingungspaket vor nächster Änderung committen, Bundle prüfen, pushen, SHA vergleichen.
Danach: bei false übersprungene Weltaktionszeilen sichtbar markieren, Edit/Undo/Reset
müssen diese Historie ebenso verwerfen. Kleinster Hebel aus unabhängigem Review.
Owner: ohne Mikrofreigaben fortsetzen bis tatsächliche Grenze; vorher vollständig sichern.
Erster Befehl: git status --short --branch && git log -3 --oneline.
