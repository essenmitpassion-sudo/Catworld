# AFTERLIGHT — gemeinsame Bildsprache (2026-11-14)

Owner-Kritik: Look harmoniert nicht, nicht schön genug. Ziel: ein einladendes,
charaktervolles Hafenviertel, dessen Darstellung zu den bestätigten Katzen passt.
Keine Behauptung über Wiederspielreiz ohne menschlichen Test.

Aktuell maßgeblich für AFTERLIGHT:
- Gemalte, taktile Materialien: abgenutztes Steinpflaster, Holz, Messing, Terrakotta,
  ruhiges Petrolwasser und salbeifarbene Pflanzen. Kein hartes technisches Bodenraster.
- Nachtblau als ruhiger Rahmen, warme cremefarbene Schrift, Salbeigrün als
  Aktionsfarbe, Gold für Energie/Ziele. Hintergrund geringer kontrastiert als Figuren.
- Bestehende Katzenidentitäten/Originale bewahren; ihre Fell- und Schmuckfarben
  sind Referenz. Häuser, Boden, Brücken und Uferdetails aus derselben Materialwelt.
- Zurückhaltende Serifenschrift für den Titel, lesbare UI-Schrift und Monospace-Code.
- Dekoration an Ränder; keine begehbaren Feldmitten verdecken. Ziele und Brücken
  bleiben durch Geometrie, Text und Zustand erkennbar. Nicht nur Farben verwenden.
- Bildcache/Fallback erhalten; Weltregeln, Projektion und Eingaben bleiben stabil.

Neue Assets mit image_gen aus vorhandenen Referenzen erzeugt: harbor-paving.png,
harbor-details.png, harbor-crossings.png. Originale bleiben im Repository. Bank
im Detailatlas erhalten, wegen Feldüberlagerung nicht in der Spielwelt platziert.
Prüfung: Anfang/Vollversorgung,1152x720, SDL-Ablauf, Paket-Selbsttest, Regressionen.
Owner-Zustimmung zum neuen Gesamtlook steht noch aus.

## Historischer Entwurf für die frühere geführte Fassung

# NEONPAW – Art Direction v1

## Zielbild
Cozy gritty cyberpunk: expressive kleine schwarze Katze, 2D-Pixelart, nächtliche Seitengasse, dunkles Schieferblau, Cyan-/Magenta-Neon, warmes gelbes Fensterlicht. Atmosphärisch, freundlich, leicht frech, aber technisch stets lesbar. Keine 3D-Welt, kein realistischer Shader, kein generisches Sci-Fi-HUD.

## Raster und Lesbarkeit
- Für MVP: logische Kacheln, feste Kamera und übersichtliche Mini-Karte; Sprite-Silhouetten aus wenigen eindeutigen Formen.
- Charakter unterscheidbar von Wänden, Sammelobjekten, Terminals; Ziel/Effekt visuell und optional textlich markiert.
- Animationen wenige klare Zustände: idle, step, collect, error, success. Lesbarkeit > Animationsanzahl.
- Code-Editor und Spielfeld gleichzeitig sichtbar, auch auf 1366x768; klare Zeilenmarkierung bei Ausführung.
- Kein Effekt darf die Katze, Codezeile oder das aktuelle Ziel verdecken.
- Farbcode ist nie einzige Information (Symbole/Text hinzufügen); gut lesbarer Kontrast.

## Produktionsregel
Start mit einfachen selbst erstellten Pixel-Sprites und Palette, ohne Fremd-IP. Maximal ein kleines Tileset + Katze + zwei Interaktionsobjekte für das erste Gate. Art-Ausbau nur nach nachgewiesenem spielfähigen Kern.

## Nicht jetzt
Keine dynamische Beleuchtungs-Engine, Partikelsystem, Cinematics, offene Stadt, teure Animationen oder freie Kameraführung.

Lichtwechsel2026-11-14:0,6s reversible Überblendung der Gebäudegrafik und des
Lichtscheins. Funktionszustände/Brücken/Anschlüsse sind sofort aktuell; Animation
ist Präsentation und verzögert keine Aktion. Hilfe/Nahansicht pausieren sie.
