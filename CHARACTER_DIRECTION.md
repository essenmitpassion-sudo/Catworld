# Verbindliche Charakter- und Produktrichtung

Stand: 2026-11-12. Quelle: direkte Owner-Rückmeldungen in dieser Sitzung.

## Was der Owner entschieden hat
- Bisheriger Build: „super langweilig,..nicht schön“. Technik-PASS hat diese
  Produktkritik nicht widerlegt. Masterprompt darauf vollständig erneut gelesen.
- „mach spiel test ready ... effektiver, besser und sauberer ... tolle grafik“.
- „character und figuren,..höchste prio“; „cute adorable ... cool und sexy“.
- Nach den gezeigten neuen Figuren und ihrer Integration: „ist super“.
- Jetzt: „speichere all neues wissen ab“.

Die positive Rückmeldung bestätigt die gezeigte Richtung, nicht automatisch
Langzeitspielspass, Lerntransfer oder eine beobachtete vollständige Testsitzung.
„Sexy“ wird in dieser Katzenwelt als Charme, Stil und selbstbewusste Ausstrahlung
umgesetzt. Die Figuren sind nicht-anthropomorphe, nicht-erotische Katzen.

## Erhalten und weiterentwickeln
Nox: schwarze Hauptfigur, grosse türkisfarbene Augen, petrolfarbenes Halstuch,
Mondanhänger und kleiner Ohrschmuck. Neugierig, eigenwillig, selbstbewusst.
Miso: orange, rund und gemütlich; humorvolle, ruhige Ausstrahlung.
Lumi: cremefarben, neugierig und mutig; eigene Tasche/Accessoires.
Pixel: grau-lavendel, frech und erfinderisch; technische Accessoires.
Eigene Gesichter und Silhouetten statt bloss umgefärbter Kopien. Charaktere und
Beziehung zur Welt vor weiterer Lektions-/Featuremenge priorisieren.

## Tatsächlich implementiert
Vier transparente Charakter-Sprites und Porträts; Nox mit Idle, zwei Gehkontakten,
Blinzeln und gespiegelter Blickrichtung. Figuren anklicken zeigt Porträt und kurze
zustandsbezogene Reaktion, ohne Welt oder Code zu verändern. Bewohner bleiben
auch bei abgeschalteter Zuflucht sichtbar. Keine neue Save-/Queststruktur dafür.
Gemaltes Hafenpanorama und drei Gebäudesprites; Stromzustände bleiben lesbar.
Grafik und Simulation getrennt, Bilder/Skalierungen gecacht, grafischer Fallback.

AFTERLIGHT ist ein direkt zugänglicher Bezirksprototyp mit umverteilbarer Energie,
zwei Kanalübergängen und drei funktional unterschiedlichen Gebäuden. Alte lineare
Lernfassung bleibt erhalten. Neuer Loop: Welt erkunden, eigene Priorität wählen,
Code wirken lassen, Reaktion beobachten, Energie/Wege neu kombinieren.
Masterprompt §7: Autonomie, Kompetenz, Entdeckung, Kreativität und Bedeutung;
keine Zwangs-Streaks, Wartezeiten oder Grind als Ersatz für Motivation.

## Sauberer Zugang und Nachweise
Runtime benötigt nur pygame-ce. Eigene Windows-/Unix-Starter; kuratiertes ZIP
mit SHA-256-Manifest ohne persönliche Saves, Git oder Entwicklungsumgebung.
Expliziter Paket-Selbsttest nutzt temporäre Daten, lädt alle Bilder/Figuren,
versorgt den Bezirk und prüft Code-Wiederherstellung. Kein Upload/Telemetrie.
333 Tests PASS; entpacktes Paket und frische Laufzeitumgebung mit nur pygame
geprüft. Unabhängiger Review:6 neue Tests PASS, keine weiteren Befunde.
Linux-Dummy-Render:120 Frames, Median4.90ms, p95 9.30ms; kein Windows-FPS-Nachweis.

Windows-PyInstaller-Workflow vorbereitet, aber kein bestätigter Windows-Lauf oder
verfügbares EXE-Artefakt. Physischer Desktop, menschlicher Lerntransfer und
Langzeitmotivation bleiben offen. Keine automatisierte Ausführung nach Sitzungsende.

## Wiederaufnahme nach Ausfall
Die Umgebung fiel vor dem letzten Commit aus. Nach Wiederverbindung waren alle
Änderungen und das ZIP erhalten. Der erste Archivvergleich wurde durch parallel
geänderte Dokumente ungültig; deshalb wird der endgültige Commitstand erneut
archiviert und vollständig verglichen. Aktueller Commit,
Bundle und Remote sind für die Wiederaufnahme massgeblich, nicht alte Chat-SHAs.
Bei neuen Sitzungen zuerst AGENTS.md, CURRENT.md, NEXT_TASK.md und dieses Dokument.

2026-11-13: Miso erhält vier eigene Posen (Sitzen, zwei Gehkontakte, Blinzeln),
aus genehmigtem Figurenatlas mit image_gen abgeleitet. Originaldatei unverändert
in neonpaw/district/assets/miso-poses.png. Porträt bleibt original. Reversible
Bewohnerhandlung verbindet Zufluchtstrom mit sichtbarem Einzug/Rückweg.

Owner-Korrektur 2026-11-13: frühere Figuren wirkten schöner/süsser/stilvoller.
Geprüft: characters.png und nox-poses.png seit bestätigt 4420d7b bytegleich;
kein Verlust der Originale. Darstellung zuvor nur58–72px. Überarbeitung:
74–90px Weltfiguren, dezente Idle-Bewegung, F2/Porträt öffnet Crew-Nahansicht
mit Originalgrafiken, persönlichem Text und pausiertem Programm. Keine Zustimmung
zum neuen Ergebnis unterstellen; Owner-Kritik ist maßgeblich.
