# SIGNALBRUCH / Entscheidung und reale Grenzen

## Drei Kernideen

| Idee | Eigenständiger Ansatz | Entscheidung, Verständlichkeit, Aufwand | Urteil |
| --- | --- | --- | --- |
| SIGNALBRUCH | Autonome Siedlungen erzeugen physische Einflussimpulse; gemeinsame Weichen verändern beide Seiten. | Zeit gegen Kontrolle, kurze Regeln, gut simulierbar; Reise und Prognosen müssen klar sein. | Für den ersten vollständigen Kern gewählt. |
| Kippfeld | Ein gemeinsames Feld aus drehbaren Segmenten; jede Drehung verschiebt eigene und gegnerische Muster, nur zusammenhängende offene Formen zählen. | Unmittelbare räumliche Abwägung, leicht bedienbar; Gefahr eines bekannten Schiebepuzzles und einfacher lokaler Punktoptimierung. | Verworfen vor Implementierung. |
| Nachlass | Beide Seiten verpflichten knappe Aktionen an zukünftige Runden; eine heute gewonnene Aktion trägt dem Gegner später eine Gegenleistung ein. | Interessante langfristige Schulden und Bluff; ohne mehrere Ressourcen/Zeithorizonte anfangs abstrakt und schwer vermittelbar. | Verworfen vor Implementierung. |

Dies sind drei Designhypothesen, keine Behauptung neuerfindbarer Spielgattungen. Die beiden Gegenentwürfe sind keine zusätzlichen implementierten Spielmodi. Der frühere SPUR-Entwurf blieb unimplementiert und wird nicht fortgesetzt.

## Bewusste Reduktion

Der Master schlägt komplexe Befehlsübermittlung mit Täuschung vor. P0 verwendet stattdessen offen sichtbare Einflussimpulse. So lassen sich Reise, Übernahme und autonome Ausgänge mit drei Aktionen prüfen, ohne verdeckte Befehlssprache oder weitere Ressourcen einzuführen. Keine Armeen, Rollenränge, Schere-Stein-Papier-Kämpfe, passiven Relaispunkte oder königliche Zielfigur. Ein physischer Ausgang beeinflusst die nächste automatische Sendung und alle wartenden Signale. Späte Umleitung ist sofort wirksam, laufende Pakete behalten ihr Ziel.

Vorhandenes JavaScript/Node/esbuild mit SVG und HTML wird weitergenutzt: getestet, zugänglich, offline und mobil bedienbar. Ein TypeScript-/Canvas-Wechsel würde für diesen kleinen Kern zusätzlichen Umbau ohne P0-Nutzen verursachen. Kein Backend, keine neuen Abhängigkeiten und kein Agentensystem.

## Grösster beobachteter Fehler und Experimente

Gleiche 24 Seeds/Profile der Startfassung: 22 Remis, 2 Ostsiege. Freies sofortiges Zurückstellen einer Weiche erzeugte schlechte Gegenaktionsschleifen. Einrasten bis zum nächsten Takt allein löste das nicht: 24/24 Remis. Freundliche Zentralheilung wurde entfernt; danach 16 Remis. Die KI bewertete ausserdem überflüssige Verstärkung voll gebundener Siedlungen zu hoch. Nach Korrektur auf tatsächlichen zusätzlichen Einfluss blieben 14 Remis, bei 6 West- und 4 Ostsiegen.

**Letzter kontrollierter Eingriff:** Übernahme kostet 1 eigene Zentralstabilität; der letzte Punkt ist geschützt. Dieselbe bestehende Verlustressource macht Abfangen zu einer echten Entscheidung. Im gleichen 24-Partien-Batch danach 6 Westsiege, 18 Ostsiege, 0 Remis; durchschnittlich 12,58 Netztakte. 194 Sendungen, 318 Umleitungen, 92 Übernahmen. Die Verbesserung von 14 auf 0 Remis stammt aus diesem letzten Vergleich; frühere Änderungen werden nicht fälschlich dieser einen Regel zugeschrieben.

Separat: 12 Seeds jeweils mit beiden anfänglichen Startseiten, identische taktische KI beidseits. 24 terminale rekonstruierbare Partien: 4 Siege der anfänglichen Startseite, 20 der zweiten Seite; West 8, Ost 16, keine Remis. Die 12 Seeds enthalten nur vier unterschiedliche Kombinationen von Laufzeit/Mittelweiche, keine 12 eigenständigen Topologien. Diese Diagnose zeigt sowohl Startreihenfolge- als auch mögliche deterministische Auswahlasymmetrie. Sie beweist keine universelle Gewinnstrategie und keine menschliche Balance.

## Nachweise und Grenzen

15 Regel-/KI-Tests, 24 gemischte Profilpartien plus 24 gepaarte Partien; alle terminalen Zustände bestehen autoritative Verlaufsrekonstruktion. Echte Browserklicks durch vollständigen Sieg, Verlust und Übernahme; alle drei menschlichen Aktionen, Laden während Folgeaktionen, historischer Verlauf, Neustart, verweigerter Speicher, native Regeldialoge, 320/390/768/1920 px, keine Laufzeitfehler. Es ist ein Test des genauen Offline-Builds an einer abgefangenen Testadresse, kein authentifizierter Besuch der Hostingseite. Screenshots wurden auf Mobilgerätbreite und Desktop geprüft.

Die KI benutzt öffentliches Wissen und legale Übergänge, aber begrenzte Suche. Drei Profile sind Gewichtungen, kein Beweis drei tragfähiger menschlicher Strategien. Der Taktdeckel und Signallebensdauer begrenzen Schleifen. Menschlicher Spass, Dauer von 5–10 Minuten, Lesbarkeit unter Zeitdruck und Wiederspielwert bleiben ungemessen. P0 ist technisch vollständig; P1 bleibt offen. Keine P2-Erweiterung vor einer belastbareren Prüfung des Startvorteils und einer menschlichen ersten Partie.

## Vorbilder recherchiert

[Radio Commander](https://radiocommander.net/) beschreibt Vermittlung von Befehlen und Informationen über Funk. [Neptune’s Pride](https://np.ironhelmet.com/help/intro) verwendet langfristige Strategie; seine [Flottenregeln](https://triton.ironhelmet.com/help/fleets) und [Tore](https://triton.ironhelmet.com/help/gates) beschreiben Reisezeiten. SIGNALBRUCH testet eine kompakte Kombination aus öffentlichen Paketen, autonomer Sendung und gemeinsam gesperrten Weichen. Diese Recherche rechtfertigt ausdrücklich keine Weltneuheitsbehauptung.
