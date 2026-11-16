# SAUM · Designentscheidung V5 · 16.11.2026

Bewertung 1–5 = Designhypothese; Risiko 5 = geringes Risiko. Eigenständige Designerentscheidung gemäss V5, keine behauptete Nutzerwahl.

| Konzept | Originalität | Gefühl | Tiefe | Bild | Wiederholung | Machbarkeit | Risiko | Emergenz |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| SAUM: bewohnte Meeresriesen geleiten; ein ruhender Körper schützt die anderen | 4 | 5 | 4 | 5 | 4 | 5 | 4 | 4 |
| ERBSCHULD: Versprechen eines sterbenden Hofs an Nachfolger vererben, die Macht und Feinde gewinnen | 5 | 3 | 5 | 4 | 5 | 3 | 2 | 5 |
| FALTENLAND: Landschaft falten; Ufer verbinden, dabei auf der Rückseite bewohnten Raum verlieren | 5 | 5 | 4 | 5 | 4 | 2 | 2 | 4 |

SAUM verbindet unmittelbar verständliche Körper mit räumlicher Strategie. ERBSCHULD braucht viel Inhalt, bevor Beziehungen glaubwürdig werden. FALTENLAND riskiert schwer lesbare Geometrie. Keine Behauptung weltweiter Neuheit.

## Referenzprinzipien, keine neu gespielten Referenzspiele
Into the Breach: angekündigter Schaden erlaubt Verantwortung. RimWorld/Kenshi: beschädigte Reisegruppen erzeugen Folgen. Factorio: Anordnung verändert Leistung → Formation schützt. Slay the Spire: heutiger Gewinn gegen zukünftige Handlungsfähigkeit → Eile verbraucht Atem. Balatro: wenige Regeln kombinieren → dieselben Körper retten, tragen und schützen. Noita: konsistente räumliche Regeln. The Farmer Was Replaced: beobachtbare reproduzierbare Verbesserung. Vogelzug/Windschatten und nautische Kupferstiche: Gruppengeometrie wird sichtbare Welt.
Deepfall/KNICK/Chaincore/Soundweave sind nur Nutzerberichte. Catworld docs/DECISION.md im Archiv gelesen: Bots beweisen keinen Spass, Symmetrie keine Balance, reduzierte Bewegung keine korrekte Animation. KIPPWERK hier vor Ersatz mit 9/9 Regeltests geprüft; frühere Browserberichte bleiben historische Angaben.

## Regeln und Erlebnis
Du bist Lotse dreier lebender Garteninseln. Terrakottadörfer auf ihren Rücken. Riesen wählen, Kurs durchs Wasser ziehen, alle gleichzeitig mit nächster Tide bewegen. Kein Raster, kein Produktionsnetz, kein Metaspiel.
Ziel: mindestens 12 Familien vor Ende von 14 Tiden im östlichen Saum. Anfangs 3 je Riese, Kapazität 6; Flossdörfer tragen je 2. Unterschiedliche Tempi, breiter Hüter gibt mehr Windschatten. Gleiten kostet 1 Atem; Eilen 2 für 1,5-fache Strecke; Ruhen gewinnt 3 bis zum Maximum. Illegaler Atemverbrauch wird abgelehnt. Freie Kurse zwischen −1 und +1 Radiant, Wassergrenzen begrenzen Position. Vorschau und Ausführung verwenden dieselbe deterministische Simulation.
Wandernde Stürme: gefüllt jetzt, gestrichelt nächste Tide. Ein anderer lebender Riese schützt am Endpunkt hinter seinem Körper: Hüter Radius 145, Ruhende 155, sonst 85. Riffe treffen den gesamten Fahrweg. Sich gleichzeitig kreuzende Körper kollidieren unter 48 Abstand. Ungeschützter Sturm, Riff und Kollision kosten je 1 Leben und Familie; die westliche Sturmfront kostet 2. Zerstörte Wesen retten niemanden. Aufnahme entlang Fahrweg, genau einmal, bis Kapazität. Lieferung nach Gefahr. Erfolg bei 12 angekommenen Familien; Verlust bei Frist, keinen Reisenden oder nicht mehr genügend erreichbaren Familien.

## Originalitätsfilter
Hypothese: ein bewohnter Körper ist Transporter, Atemvorrat und räumlicher Schutz. Ein Rettungsumweg kann Nachbarn aus dem Windschatten nehmen. Zurückbleiben schützt andere, kostet verfügbare Transportkapazität. Ohne diese Welt verlieren die Regeln ihre Lesbarkeit. Nach Erstpartie zu entdecken: Ruheinseln als Brücken, Sprint im Windschatten, bewusste Kapazitätsverteilung. Viele Partien und menschliche Faszination bleiben offene Nachweise. Kein Anspruch auf bereits bewiesene Langzeittiefe.

## Art Direction und Architektur
Helles Papier, Petrol-Wasserlinien, Indigo-Körper, Terrakottadächer, Salbeigärten. Organische SVG-Silhouetten und gezeichnete Tiefenlinien. Welt als Hauptfläche, Lotsenleiste unten, Fortschritt oben; keine Seitenleiste. Wege, Schutzkonturen und textliche Gefahren. Bewegung aus echtem Vorzustand mit Eingabesperre; Tastatur/Touch/reduzierte Bewegung.
Vanilla JS/SVG/CSS, vorhandenes esbuild für portable HTML-Datei, Node-Tests/Playwright-Chromium. engine.js Zustand/Regeln; scene.js Illustration; main.js Eingaben. Kein Laufzeitnetzwerk. Hosting unverändert; keine Veröffentlichung.
