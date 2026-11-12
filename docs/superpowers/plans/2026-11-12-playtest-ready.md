# AFTERLIGHT spieltestbereit — Grafik, Einstieg, Auslieferung

Owner: „mach spiel test ready ... effektiver, besser und sauberer ... tolle Grafik ... prompt7“.
Basis199ce0a. Abschnitt7 als Motivationsprinzipien gelesen, kein Grind/Retentiontrick.
Inline-Ausführung, bestehende Weltregeln erhalten.

Ziel: den neuen Loop direkt testen können; visuelle Qualität und Zugang verbessern.
1. Grafik: hochwertige gemalte Nachtstadt als Hintergrund, klar getrennt von der
   spielbaren geometrischen Karte. Echte Gebäude/Wege/Zustände bleiben gerendert.
   Funktionale Beleuchtung und Orientierung statt Assets, die falsche Wege zeigen.
2. Spieltest: kurzer sichtbarer Auftrag und Befehlsentdeckung im Spiel; Route nicht
   vorsagen. Wiederholbares Startpaket, eigener Datenordner, klare Startdiagnose.
3. Sauberkeit/Effizienz: statischen Hintergrund einmal laden/skalieren, dynamische
   Welt unabhängig; Laufzeit ohne pytest-Abhängigkeit starten; schlankes ZIP mit
   Code, Grafik, Laufzeitrequirements, zwei Startern und knapper Testanleitung.
4. Prüfen: Tests für Verpackungsinhalt und Asset-Fallback/Laden, UI-Smoke aus
   entpacktem Paket statt nur aus Entwicklercheckout, Screenshots/Lesbarkeit,
   kein Erfolg unter Windows oder menschlicher Motivation ohne tatsächlichen Test.
5. Backup: Commit/Bundle/Remote, Archiv-Inhaltsvergleich; früheren Stand bewahren.

Nicht versprochen: fertiges Langzeitspiel, öffentliche Webversion, installierbare
Windows-EXE ohne Windows-Build/Prüfung. Keine neue Spielmechanik vor diesem Test.

## Owner-Steuerung: Charaktere höchste Priorität
Vier neue Figuren mit eigener Silhouette, Mimik und Accessoires. Nox erhält vier
Posen (Idle, zwei Gehkontakte, Blinzeln) und Blickrichtung; Miso/Lumi/Pixel bleiben
als Bewohner auch ohne Strom sichtbar. Anklicken öffnet Porträt und kurze auf den
Weltzustand reagierende Stimme. Keine neue Quest-/Save-Struktur oder Timer.
Cute/cool/charismatisch; „sexy“ als Stil/Charme, nicht erotische Tierdarstellung.
Erst Integration und Test dieser Figuren, danach Paketabschluss.
