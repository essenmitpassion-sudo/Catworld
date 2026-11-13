# Lebendige Zuflucht — zusammenhängendes Figuren-/Strompaket
Basis438e7aa4,337 Tests/Paket vor Änderung erneut geprüft. Remote-Dokument per
Fast-forward integriert; kein offener PR laut Connector, kein anderer Core-Writer.
Vollständiger Upload unverändert in AUTONOMOUS_MASTER_EXECUTION_2026-11-13.md.

Beobachtete Defizite: Miso bleibt trotz Zufluchtstrom am Kai; Bewohner besitzen
nur eine statische Pose; Textreaktion zeigt keine tatsächliche Bewohnerhandlung.
Ferner bleibt die Spielfeldkarte klein bei schmalem Fenster (nachgelagerte Prüfung).
Optionen: A reversible Bewohnerhandlung beim Stromwechsel; B neue Entdeckung auf
Kanalroute (mehr Weltregeln); C UI-/Codeinszenierung (kein aktueller Blocker).
Gewählt A: hoher Figuren-/Weltbezug, bestehende Regeln, kleines Risiko. Keine
Punkte, keine zusätzliche Syntax. Nicht mit menschlichem Spielwert verwechseln.

Miso startet am Kai(0,5). Zuflucht an→er geht zur Hausterrasse(0,1); aus→zurück.
Nur vorhandene sichere Landfelder x0. Sichtbare Fortbewegung2 Felder/s, bei
Umverteilung mitten im Weg umkehren. Actorpositionen sind Präsentation; Energie,
Runner und Kollisionsregeln bleiben unverändert. Reset/Rewind setzen alle Akteure
auf zum wiederhergestellten Weltzustand passende Positionen. Anklicken folgt
sichtbarem Sprite, nicht altem Startfeld. Eigene vier Miso-Posen nötig, da der
vorhandene Miso nur sitzt; bestätigte Identität/Porträt unverändert.

RED→GREEN: Hin/Rückweg, Umkehr mitten im Weg, grosse dt begrenzen, Positionen nach
Reset/Rewind, Klick auf bewegten Bewohner, Runnerstate unverändert. Neues Atlas
prüfen; SDL: zwei Energieprioritäten und Versuch ohne Energie; Baseline+Suite,
Screenshot/Animation in zwei Fenstergrössen, entpacktes Paket, Review.
Dann Commit/Bundle/Remote/Manifestbuild. Anschliessend Bewegung/Lesbarkeit prüfen.

Umgesetzt: 341 Tests, SDL und Paket-Selbsttest; unabhängiger Review mit einem
korrigierten Schildbefund. Checkpoint ffc3526 plus Bundle und bestätigter Push.
Fortsetzung: freie Fenstergröße verzerrte Figuren. Optionen: feste Fenstergröße,
proportionale Darstellung mit Rand, komplette responsive Neuaufteilung. Gewählt:
proportionale Darstellung (geringstes Risiko, gesamte Karte und Editor bleiben).
344 Tests PASS, unabhängige Eingabeprüfung bei vier Fenstergrößen, keine Befunde.
