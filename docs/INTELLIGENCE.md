> Historical rules-v1 report through34a7e57. Current rules-v2 development and evidence: [PHASE_2.md](PHASE_2.md). References to prior tactical fixtures concern that Git revision.

# Gameplay intelligence · 2026-11-15

Ausgangspunkt d46be8b, Auftrag `NEXT_DEVELOPMENT_DIRECTIVE.md`. Regeln und Aufstellung bleiben in diesem Inkrement unverändert. Die versetzte Aufstellung wird nicht erneut als Balancekorrektur verkauft.

## Ursache und Grenzen der Starterzahlen

Alle vier Aufstellungen sind unter 180°-Drehung plus Farbtausch identisch. Die Gates werden dabei korrekt ausgetauscht. Spiegelung tauscht die versetzten Formationen 2/3, während 0/1 invariant bleiben. Produktionsübergänge und vollständige Spielprotokolle wurden gegen ein separat formulierendes Koordinaten-Orakel geprüft. In den 68 Folgepartien wurde kein Regel-, Gewinner- oder Starterzuordnungsfehler gefunden. Ergebnisvergleiche zählen ausdrücklich den ursprünglichen Starter, auch bei eröffneten Zwischenstellungen.

Die auffälligen Zahlen sind hingegen stark **politikabhängig**. Im kleinen kontrollierten Horizontversuch gewinnt kompakt bei Tiefe3 zweimal der Starter, bei Tiefe4 zweimal der Nachziehende. Versetzt gewinnt bei Tiefe3 zweimal der Nachziehende, bei Tiefe4 zweimal der Starter. Tiefe5 gibt nochmals andere, teilweise viel längere Partien. Die tatsächlich abgeschlossenen Suchtiefen sind pro Partie protokolliert; der Effekt ist hier nicht bloß ein still ausgeschöpftes Rechenbudget.

Eine unabhängige Suche mit derselben Positionsbewertung, aber anderer Tie-Reihenfolge, gewinnt versetzt als Starter, während die ursprüngliche Tiefe3-Politik nachzieht und gewinnt. `tie-audit.json` isoliert die erste Abweichung nach vier Halbzügen: D1→D2/links und B1→B2/rechts erhalten beide denselben vollständig geprüften Drei-Halbzug-Wert44. Gleicher kurzer Suchwert bedeutet nicht gleiche langfristige Qualität. Nur Material und reine Rennbewertung liefern wiederum andere Dauern/Ergebnisse.

Daraus folgt **nicht**, dass die Aufstellung fair ist oder der tiefere Horizont sie gelöst hat. Die bisherigen 19/64 und64/64 sind echte Ergebnisse der getesteten Politiken, aber keine unabhängigen 64 Messungen perfekten Spiels. Spiegelpaare und identische Pfade müssen als korrelierte Kontrollen gezählt werden. In zwölf unabhängigen Bewertungs-Partien gibt es beispielsweise nur sechs Pfade bis auf Drehung/Spiegelung. Neue legale vierzügige Eröffnungen werden separat getestet: acht Partien mit fünf Remis zeigen eine weitere Schwäche, nämlich Ausweich-/Schleifenstellungen.

Erzwungene Eröffnungssiege: Für kompakt und versetzt kein Startersieg innerhalb von sieben Halbzügen gefunden. Beide Neun-Halbzug-Suchen erschöpfen ihr getrenntes250.000-Knoten-Budget. Ergebnis dort ist **unbekannt**, nicht „kein Sieg“.

## Gewählte Verbesserung: sichtbares Gegenspiel

Konservativ: unveränderte Regeln, aber vollständige Vorschau mit konkreter sofortiger Gewinnantwort. Innovativ geprüft: die gerade verschobene Reihe für eine Antwort sperren; das würde zusätzliches Gedächtnis benötigen und auch legitime Verteidigungen verbieten. Radikal geprüft: Richtungswahl simultan verdecken; das würde das vollständige Informationsspiel verändern und die klare Vorschau schwächen. Für beides fehlt ein reproduzierbarer Nachweis, dass der aktuelle Kern eine solche Änderung braucht. Nicht implementiert.

Die gewählte Hilfe zeigt ein wirklich legales Gegenmanöver einschließlich Schrittfeld, Verschieberichtung und anschließendem Tor. Sie blockiert einen schlechten Zug nicht. Kein Warnhinweis bedeutet ausschließlich keine sofortige Gewinnantwort; spätere Taktiken bleiben möglich. Beide Hotseat-Seiten erhalten dieselbe Hilfe.

Proxy-Vergleich mit identischer einfacher Ein-Zug-Rangfolge, einmal mit exakter Sofortverlust-Vermeidung, einmal ohne: gefiltert11 Siege, ungefiltert4, ein Remis in16 Partien mit Farb-/Startwechsel. Vermeidbare sofortige Verlustzüge0 gegenüber11. Gegen die tiefere Suche verliert die gefilterte Politik trotzdem0:8; die ungefilterte verliert ebenfalls0:8 und begeht sieben vermeidbare Sofortverluste. Das belegt verfügbare Gegenwehr für einfache Spieler, keinen menschlichen Lerneffekt und keine perfekte Balance.

## Konkrete VERSATZ-Taktiken

`docs/tactical-cases.json` enthält vollständig erreichbare Stellungen samt legaler Historie:

- **Schlag und Transport:** Elfenbein C3→C4/links schlägt die Figur auf C4 und transportiert gleichzeitig einen anderen Gegner von B4 nach A4. Ein Schritt verfolgt zwei Ziele.
- **Richtungs-Konter:** Nach elf Halbzügen erlaubt Jade B5→B4/rechts den sofortigen gegnerischen Torsieg; derselbe Schritt mit Linksversatz erlaubt ihn nicht. Hier ist die Richtungsentscheidung der eigentliche strategische Hebel.
- **Transport-Sieg:** Jade A2→A1/links transportiert die eigene Figur D1→C1 ins Tor, während die bewegte Figur selbst auf E1 endet. Der Sieger muss nicht die ziehende Figur sein.
- **Drei-Halbzug-Drohung:** Nach Jade B3→B2/links hat Elfenbein14 unabhängig enumerierte legale Antworten. Für jede gibt es danach einen direkten Jadesieg. Alle14 vollständigen Zweige werden gegen das unabhängige Orakel geprüft. Das ist eine konkrete taktische Aussage, keine Aussage über die gesamte Eröffnung.

Diese Beispiele zeigen Wechselwirkungen. Ob sie für Menschen Spannung, Verständnis oder Wiederholungswunsch erzeugen, bleibt ungeprüft.

## Bedienung und Suche

Die Vorschau beschreibt jetzt das dargestellte Brett auch für Screenreader und erklärt Schlagen, mitreisende Figuren und Endfeld. Eine unabhängige Browserprüfung fand einen wichtigen alten Interaktionsfehler: sichtbare versetzte Figuren wurden noch nach der ursprünglichen Belegung angeklickt. Die Vorschau ist jetzt schreibgeschützt; „Anderes Feld“ behält die gewählte Figur bei. Tastaturfokus und Hover dürfen die gewählte Richtung nicht mehr unbemerkt verändern. Beide Regressionen wurden erst rot, dann grün beobachtet.

Auf390×844px werden Brett und Bestätigung beim Prüfen zusammen sichtbar gehalten. Der Prüfbereich wird kompakter und scrollt bei einer neu eingeblendeten längeren Antwort nach. Die Einzelschritt-/Reihen- und Linkswrap-Regressionen mit normaler Bewegung bleiben erhalten.

Die KI überspringt nun identische Folgestellungen innerhalb desselben Elternknotens. Verschiedene Bewegungen können dasselbe Brett liefern; Zugzähler, Wiederholungshistorie und nächster Spieler sind dabei gleich. Es ist kein historienunsicherer Transpositionscache. Auf16 erreichbaren Vergleichsstellungen blieb der vollständige Tiefe4-Wert immer gleich; Suchknoten25.600→21.853 (−14,6%). Bei2.000 Knoten erreicht die Suche in2/16 Fällen einen weiteren vollständigen Horizont, nie einen geringeren. Die gemessene Laufzeit war in diesem kleinen Lauf sogar höher; **kein belegter Zeitgewinn** wird behauptet.

## Tatsächliche Browserprüfungen

Neben den vier bestehenden vollständigen Matches weitere vollständige Partien gegen alle drei echten Worker-KI-Stufen: Entspannt17 Halbzüge/Elfenbeinsieg, Taktisch14/Jadesieg, Weitblick12/Jadesieg. Reale UI-Eingaben prüfen beide Richtungen des dokumentierten Konters, tatsächlichen Verlust, exakte Rücknahme, Transport-Sieg, Schlag+Transport, Tastaturbestätigung und Reload der Endstellung. Menschen wurden durch automatisierte Eingaben ersetzt; es gab keine menschlichen Testpersonen.

Quellen: `intelligence.json`, `tie-audit.json`, `search-benchmark.json`, `counterplay-browser.json`. Reproduktion: `npm run research:classic`, `node scripts/tie-audit.mjs`, `npm run benchmark`, `npm run smoke:counterplay`. Berichtete Suchknoten haben zwischen unterschiedlichen Suchimplementierungen verschiedene Definitionen; nur der kontrollierte Vorher-/Nachher-Benchmark vergleicht dieselbe Zählweise.


## Weitergearbeitet nach Checkpoint0f2f366: Torwege

Eine weitere konkrete Hypothese wurde getestet: Die alte lineare Fortschritts-/Mitte-Bewertung bildet die zusammengesetzte Aktion nur grob ab. Auf leerem Brett ist C4 für eine einzelne Elfenbeinfigur drei Aktionen von C5 entfernt, B4 und D4 nur eine. Ein separat berechneter Rückwärts-Breitensuchgraph über25 Felder liefert die vollständige Solo-Distanz. Tests prüfen bekannte Wege, alle Folgezustände, Farb-/Spiegelsymmetrie und die gewünschte Bewertung der echten Ein-Zug-Annäherung. Andere Figuren können blockieren, schlagen oder transportieren; die Solo-Distanz ist kein Stellungswert-Beweis.

80 kontrollierte Vergleichspartien mit dieser optionalen Bewertung sind in `route-experiment.json` gespeichert, einschließlich vollständiger Historien, Seed, Farben, Startpräfix und tatsächlich abgeschlossener Tiefen. Bei Tiefe3 gewann Route20:12 gegen die bisherige Bewertung. Bei Tiefe2 war es6:2. Bei Tiefe4 war es dagegen0:5 mit3 Remis. Gegen unabhängige Material-/Rennpolitiken waren die Resultate in der kleinen Stichprobe günstiger als die alte Bewertung (8/8 und5/8 statt7/8 und2/8), aber auch das hebt den Tiefen-Gegenbefund nicht auf.

**Entscheidung:** keine pauschale Umstellung der Standard-KI. Regeln, Standardaufstellung und Standardbewertung bleiben fest. Der optionale Forschungsstil `route` ermöglicht reproduzierbare Folgeversuche, ohne einen weiteren Produktmodus einzuführen. Der vorhandene Regelhinweis erklärt jetzt den anschaulichen B4/D4-versus-C4-Unterschied. Besonders mitreisende Figuren sind ein Grund, aus bloßer Solo-Distanz kein vollständiges Urteil abzuleiten.

Die ersten Scratch-Proben16 und32 wurden zur Hypothesenbildung benutzt; die32 gleichen Held-out-Konfigurationen im abschließenden80er-Lauf sind eine Reproduktion, keine zusätzlichen unabhängigen32 Spiele. Sie werden nicht doppelt zu einer großen Bilanz addiert. Reproduktion: `npm run research:routes`. Nächste Priorität sind konkrete zyklische Zwischenstellungen unter stärkerem Gegenspiel, kein weiteres pauschales Gewichtstuning.


## Weitergearbeitet nach d2c5315: gewinnbare Pendel-Endspiele

Die nächste Untersuchung ging von tatsächlichen Remis-Stellungen aus. Zwei aufgezeichnete Partien erreichen nach21 Halbzügen Eins-gegen-eins und pendeln danach bis zur Wiederholung bei74. Der vollständig überprüfte kleine Zustandsraum zeigt: Die gewinnende Seite kann bei bester Verteidigung innerhalb von zwölf weiteren Halbzügen gewinnen. Die alte kurze Bewertung übersieht diese Fortsetzung.

Ein eng begrenzter Endspiellöser wurde deshalb implementiert. Er berechnet einen endlichen Attraktorgraphen für genau eine Figur je Seite. Das vorherige dritte Wiederholen wird als Remiskante berücksichtigt; verbleibende Halbzüge begrenzen den Gewinnrang. Ränge einer erzwungenen Gewinnstrategie nehmen bei jedem Zug und jeder Verteidigung strikt ab. Deshalb kann diese Strategie keinen neu besuchten Zustand erneut betreten; höhere frühere Materialzahlen sind wegen irreversibler Schläge irrelevant. Es gibt keinen unsicheren allgemeinen Transpositionscache.

Unbeschränkt ergibt der strukturelle Graph1.200 Anordnungen:696 für die ziehende Seite gewonnen,282 verloren,222 remis, maximal15 Halbzüge bis zur erzwungenen Entscheidung. Das ist keine Starterquote; die Aufzählung enthält auch nicht als lebende Startstellung erreichbare Anordnungen. Durch vorbestehende Wiederholungen eingeschränkte Graphen können längere Ränge haben. Uint16Array speichert Ränge sicher bis zur gesamten Zustandszahl. Gewonnene/Verlorene Ränge werden gegen das tatsächliche Restzuglimit geprüft.

Alle1.200 Anordnungen bestehen unabhängig enumerierte Legalitäts- und Koordinatenübergangsprüfungen sowie Gewinn-/Verlust-/Remis- und Ranggleichungen. Der separate Reviewer prüfte zusätzlich84 historienabhängige Fälle mit1–6 Resthalbzügen gegen vollständigen Minimax (403.770 Knoten): Ergebnis, entscheidender Abstand und gewählter Zug stimmen überein.

Acht kontrollierte Fortsetzungen aus den beiden echten Anfangshistorien reproduzieren die alten74-Halbzug-Remis exakt. Mit exakter Fortsetzung beider Seiten kommt der korrekte Sieg bei33. Auch gegen die alte Verteidigung gewinnt die gewinnende exakte Seite bei33; eine ursprünglich verlorene exakte Seite kann gegen spätere Fehler der alten Gewinnseite sogar bei78 zurückschlagen. Dies ist eine Leistung gegen Fehlentscheidungen, kein Gegenbeispiel zum erzwungenen Verlust bei perfektem Gegner.

Taktisch und Weitblick nutzen den Löser, sobald nur eine Figur je Seite übrig ist; Entspannt bleibt begrenzte Suche. Die dokumentierten normalen Suchhorizonte gelten für größere Materialzahlen. Es wurden keine Regeln, Torpositionen oder Figuren geändert. Im tatsächlichen Browser wurde die gespeicherte Partie bei21 mit bestmöglicher menschlicher Jade-Verteidigung über reale Eingaben bis zum korrekten Elfenbeinsieg bei33 gespielt. Die sieben vollständigen bisherigen Matches und alle Animations-/Vorschau-/Mobilprüfungen bleiben grün. Insgesamt32 Node-Tests.

Die aktuelle allgemeine800-Profil-Stichprobe endet weiterhin76-mal remis. Der gezielte Endspiel-Fix beseitigt also die nachgewiesene Fehleinschätzung, ohne dass daraus eine niedrigere globale Remisrate behauptet wird. Mehrfiguren-Pendeln und menschliche Spannung bleiben offen. Reproduktion: `npm run research:endgames:v1`; vollständige Quellenfingerprints und Verläufe in `docs/endgames.json`. `docs/playtest-current.json` nutzt jetzt tatsächlich die Endspieloptionen der ausgelieferten starken Profile; `docs/playtest.json` bleibt historisch.
