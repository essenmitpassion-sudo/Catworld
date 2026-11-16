# KIPPWERK · Designentscheidung, 16.11.2026

## Absicht und Grenzen
Ein kleines Solo-Strategiespiel über das Umlenken einer sichtbaren Kettenreaktion. Neues Gameplay ersetzt VERSATZ. Kein Metaspiel, keine KI-Gegner, keine Kartenproduktion. Browser und standalone HTML, Vanilla JS / SVG / CSS; bestehendes esbuild und Chromium nach geprüftem Nutzen übernommen. Kein Runtime-Netzwerk. Entscheidungen sind eigenständige Designerentscheidungen gemäß V4, keine behauptete Nutzerwahl.

## Referenzen: bekannte Systeme, keine neuen praktischen Spielbeobachtungen
Into the Breach: sichtbare Bedrohung macht den kleinen Zug abwägbar → exakte Flutvorschau. Factorio: lokales Netz bestimmt globalen Durchsatz → dieselbe Energie durch viele Knoten. RimWorld: konkurrierende Bedürfnisse → Schutz der Hülle versus vier Verbraucher. Balatro: einfache Operatoren verstärken einander → Schwellenketten. Slay the Spire: jetzige Sicherheit versus spätere Vorbereitung → zwei Eingriffe, zehn Fluten. Noita: konsistente Stoffregeln → jeder Druckpunkt bleibt nachvollziehbar. The Farmer Was Replaced: beobachten/verbessern → folgenlose Planung, reproduzierbarer Seed. Dies sind Kenntnisse der veröffentlichten Regeln und Designhypothesen; keine in dieser Sitzung neu gespielten Referenzspiele.

Die kleinste Handlung ändert eine Achse. Schwierigkeit: sie verbessert zwei Ausgänge und verschlechtert zwei andere. Neue Situationen entstehen aus zurückbleibendem Druck und sichtbaren Einspeisungen. Überraschungen sind deterministisch. Seeds, knappe Eingriffe und Lastverteilung sollen Wiederholung tragen; das ist zu prüfen. Überflüssig sind Techbaum, Wirtschaftswährungen und Gegner-KI.

## Drei Ansätze (Bewertung 1–5, Hypothesen)
| Ansatz | Originalität | Strategie | Verständlichkeit | Machbarkeit | Wiederholung |
|---|---:|---:|---:|---:|---:|
| Evolutionär: Gefahrenfeld – Rettungsfiguren tauschen ihre angekündigten Bedrohungen beim Ziehen | 3 | 4 | 4 | 5 | 3 |
| Innovativ: Treibgut – Produktionsketten bedienen Verbraucher, die mit jeder Produktion wandern | 4 | 4 | 3 | 3 | 4 |
| Radikal: KIPPWERK – keine Einheiten bewegen, nur die Teilungsachsen einer Drucklawine kippen | 4 | 4 | 5 | 5 | 4 |
KIPPWERK gewinnt wegen kleiner Regelmenge und direkt sichtbarer Ursache/Wirkung. Keine Behauptung weltweiter Neuheit. Kein erneuter Wettbewerb nach jedem Meilenstein.

## Verfügbare Projektlehren
Catworld/VERSATZ: docs/DECISION.md am archivierten e7c16bf gelesen. Symmetrie beweist keine Balance; Botresultate beweisen keinen Spaß; reduzierte Animation deckt Bewegungsfehler nicht ab; überprüfte SHA-Sicherung vor Ersatz. SOG/SIGNALBRUCH als vorhandene Branches bestätigt, ihre konkreten Präsentationen werden nicht übernommen. Deepfall, KNICK, Chaincore, Soundweave: keine verifizierbaren Quellen im vorhandenen Projekt gefunden, daher keine erfundenen Lehren.

## Regeln, erster überprüfbarer Entwurf
5×5 Zellen, je horizontale oder vertikale Achse und 0–3 gespeicherter Druck. Bei mindestens 4 Druck entlädt eine Zelle 4: je 2 zu beiden Nachbarn entlang ihrer Achse. Weitere Zellen können folgen. Außerhalb des Feldes fangen die vier mittigen Leuchtfeuer Druck auf; andere Ausgänge kosten pro Paket Hülle. Vier Feuer benötigen je 8 Druck; zehn Fluten, Hülle 12 (vorläufig, durch Vergleich zu prüfen). Pro Flut höchstens zwei Eingriffe: Achse kippen oder 2 Druck entlasten. Entlastung opfert Energie und einen Eingriff; Kippen ändert beide künftigen Ausgänge. Keine Leerwartezeiten. Eingriffe vor der Flut einzeln rücknehmbar. Neue Einspeisungen sind vorab bekannt, Vorschau berechnet exakt dieselben Regeln wie Ausführung. Ketten terminieren an absorbierenden Rändern; zusätzliche harte Schranke als Fehlerdetektor, nicht versteckte Regel.

Gewinn sobald alle Feuer geladen; Hülle null verliert, nach zehn Fluten unvollständig verliert. Gleichzeitig zerstörte Hülle hat Vorrang. Gleiches Seed startet identisch. Vollständig geladene Feuer nehmen weiterhin Druck auf; keine zusätzliche Strafe für Überversorgung. Dieses Trade-off muss auf triviale Ein-Achsen-Politik geprüft werden.

## Spielbild
Dunkle technische Seekarte, messingfarbene Rahmen, milchige Druckpunkte, türkisfarbene Vorschau und korallfarbene Lecks. Das Feld selbst erklärt den USP: quer/hoch liegende Leiter teilen die Welle. Großer Flutknopf; Feuer am echten jeweiligen Rand. Keine Entwicklerkonsole als Produkt. Tastatur, Touch, reduzierte Bewegung, keine ausschließlich farbabhängigen Zustände.

## Nachweisgrenzen
P0 braucht echte UI-Partie, Gewinn/Verlust/Neustart. P1 braucht Strategievergleich über Seeds und gezielte Gegenbeispiele. P2 visuelle Prüfung. P3 Offline-Artefakt, Eingabefehler, schmale Breiten und Speicherverweigerung. Menschliche Verständlichkeit, 3–8 Minuten Spielzeit und Wiederholungsreiz bleiben bis Menschentest offen.
