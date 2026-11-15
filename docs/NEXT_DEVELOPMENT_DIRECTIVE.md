# CODEX — VERSATZ: NEXT DEVELOPMENT DIRECTIVE
## Gameplay Intelligence · Balance Research · Strategic Depth · Creative Innovation · Continuous Delivery

### 1. Ausgangspunkt

Repository:
https://github.com/essenmitpassion-sudo/Catworld.git

Das neue Strategiespiel **VERSATZ** wurde bereits implementiert.

Die bisherige Entwicklung enthält unter anderem:

- 5×5-Spielbrett und Reihenverschiebung.
- Vollständige Spielregeln und Zugvalidierung.
- Lokalen Hotseat-Modus.
- KI-Gegner mit unterschiedlichen Suchstufen.
- Zugvorschau und Bestätigung.
- Rücknahme, Neustart und Wiederholungserkennung.
- Browser- und Regressionstests.
- Simulationsskript und dokumentierte Vergleichspartien.

Arbeite mit der tatsächlichen vorhandenen Codebasis.

**Keine erneute Projektsuche. Kein erneuter Konzept-Neustart. Kein unnötiger Umbau.**

Zuerst laufende Arbeiten und Repository-Status prüfen. Nicht abgeschlossene Tests oder Prozesse kontrolliert beenden beziehungsweise ihre Ergebnisse sichern.

### 2. P0 — Die bisherigen Balance-Ergebnisse richtig interpretieren

Die bisherigen Berichte zeigen:

- Kompakte Aufstellung: 64/64 Starter-Siege.
- Versetzte Aufstellung: 19/64 Starter-Siege.
- Starker Einfluss der Anfangsformation.
- KI mit fünf Halbzügen Suche schlägt bisher die mit drei Halbzügen.
- Funktionierende Browser-Partien mit unterschiedlichen Spielausgängen.

Diese Ergebnisse sind ernst zu nehmen, aber nicht überzuinterpretieren.

**19/64 Starter-Siege sind kein Beweis für gute Balance.**

Prüfe insbesondere:

1. Sind die Startstellungen tatsächlich symmetrisch?
2. Sind beide Spielerfarben regeltechnisch gleichgestellt?
3. Ist der Startervorteil korrekt gemessen?
4. Bestehen Vor- oder Nachteile durch Torpositionen?
5. Verzerrt die Bewertungsfunktion der KI die Ergebnisse?
6. Erzeugt die Reihenverschiebung zu starke Siegkombinationen?
7. Gibt es asymmetrische taktische Abkürzungen?
8. Werden Gewinner, Starter, Formation und Seitenwechsel korrekt protokolliert?
9. Sind die getesteten Seeds, Aufstellungen und Partien ausreichend unterschiedlich?
10. Gibt es längerfristig erzwungene Siege, die kurze Suchhorizonte übersehen?

Teste nicht nur eine vermeintlich bessere Anfangsformation.

Vergleiche verschiedene regeltechnisch sinnvolle Alternativen.

Stelle sicher, dass die Balance nicht bloss an die aktuelle KI angepasst wird.

### 3. Unabhängige Balance-Werkzeuge entwickeln

Nutze vorhandene Simulationen und erweitere sie nur gezielt.

Untersuche:

- Gespiegelte Startpositionen.
- Vertauschte Spielerfarben.
- Unterschiedliche KI-Stärken.
- Alternative Bewertungsfunktionen.
- Random- und Greedy-Baselines.
- Tiefergehende Suchverfahren.
- Wiederkehrende Taktiken.
- Erzwungene Siege.
- Strategische Dominanz.
- Remiswahrscheinlichkeit.
- Partiedauer.
- Entscheidungsvielfalt.

Erstelle kleine, nachvollziehbare Experimente statt riesiger unkontrollierter Simulationsläufe.

Prüfe mögliche Bugs in der Simulation unabhängig von der Engine, wo sinnvoll.

Wichtig: Eine stärkere KI beweist nicht automatisch ein besseres Spiel.

### 4. P1 — Strategische Tiefe ehrlich beurteilen

Untersuche, ob VERSATZ tatsächlich interessante Entscheidungen erzeugt.

Stelle dir kritisch folgende Fragen:

**Kann ein Spieler durch einen einzigen cleveren Zug mehrere taktische Ziele gleichzeitig verfolgen?**

**Gibt es Entscheidungen, bei denen zwei attraktive Optionen unterschiedliche langfristige Konsequenzen haben?**

**Kann der Gegner scheinbar starke Strategien intelligent kontern?**

**Entstehen überraschende, aber nachvollziehbare Wendungen?**

**Sind Fehler lehrreich oder lediglich frustrierend?**

**Gibt es unterschiedliche erfolgreiche Spielstile?**

**Wie häufig ist der beste Zug offensichtlich?**

**Sind Partien spannend oder werden sie durch wiederholte Standardkombinationen entschieden?**

Untersuche konkrete Spielsituationen und aufgezeichnete Partien.

Nutze Suchverfahren, Simulationen und interaktive Playtests.

Kennzeichne Spielspass ausdrücklich als noch nicht menschlich validiert, solange solche Tests fehlen.

### 5. P2 — Eigenständige kreative Verbesserungen

Du bist ausdrücklich aufgefordert, überraschend kreativ zu werden.

Erfinde neue Lösungen für erkannte Schwächen.

Untersuche beispielsweise:

**Strategic Tension**

Wie lässt sich Spannung bis ins Endspiel aufrechterhalten?

**Meaningful Counterplay**

Wie können Spieler auf starke Kombinationen reagieren?

**Emergent Tactics**

Welche minimalen Regeländerungen erzeugen neue, interessante Kombinationen?

**Spatial Mind Games**

Wie könnte die Reihenverschiebung psychologische Planung und Täuschung unterstützen?

**Alternative Victory Pressure**

Wie lassen sich alternative Siegwege spannend gestalten, ohne die Regeln aufzublähen?

**Board Personality**

Kann das Spielfeld durch wenige elegante Regeln eine unverwechselbare Identität entwickeln?

Entwickle eigene bessere Ideen.

Vergleiche mindestens eine konservative, eine innovative und eine radikale Verbesserung, wenn ein grundlegendes Designproblem vorliegt.

**Implementiere nicht automatisch alle Ideen.**

Wähle nur Veränderungen, die das Spiel voraussichtlich stärker machen, und überprüfe diesen Nutzen.

### 6. P3 — Game Feel auf Premium-Niveau

Die Oberfläche ist bereits spielbar.

Jetzt soll sie sich hochwertig, reaktionsschnell und intuitiv anfühlen.

Untersuche:

- Auswahl von Figuren.
- Vorschau der vollständigen Bewegung.
- Reihenverschiebung.
- Randumwicklung.
- Visuelle Kennzeichnung des aktiven Spielers.
- Verständlichkeit möglicher Schläge.
- Darstellung drohender Torsiege.
- Zugbestätigung.
- Rücknahme.
- KI-Denkphase.
- Sieg und Niederlage.
- Revanche.
- Mobile Bedienung.

Besonderes Augenmerk:

**Die Animation der Reihenverschiebung muss korrekt und räumlich nachvollziehbar sein.**

Prüfe den bereits erkannten Fehler beim Umwickeln am linken Rand sowie die getrennte Darstellung von Figurenbewegung und anschliessender Reihenverschiebung.

Die Animation darf weder falsche Endpositionen noch ungültige Zwischenzustände suggerieren.

Entwickle hochwertige, kurze Bewegungsanimationen und angenehme Microinteractions.

Keine unnötige visuelle Überladung.

### 7. P4 — Das Spiel selbstständig spielen und verbessern

Nutze vorhandene Browser- und Testwerkzeuge.

Prüfe vollständige Partien gegen unterschiedliche KI-Stufen.

Untersuche bewusst:

- Aggressive Torsiege.
- Defensive Strategien.
- Opfer und Schläge.
- Mehrfachbedrohungen.
- Reihenverschiebungen am Rand.
- Ungewöhnliche Zwischenstellungen.
- Remis.
- Rücknahme nach komplexen Zügen.
- Wiederaufnahme gespeicherter Partien.
- Schwache und starke KI-Gegner.

Bewerte nicht bloss, ob eine Partie technisch endet.

Untersuche, welche Entscheidungen die Partie interessant oder vorhersehbar machten.

### 8. Wichtiger kreativer Auftrag

**Überrasche mit einem echten neuen strategischen Erlebnis.**

Entwickle eigene Prüfwerkzeuge, taktische Suchverfahren und neue Gameplay-Ideen, wenn sie einen klaren Mehrwert ermöglichen.

Denke nicht nur in bekannten Schach- oder Brettspielmustern.

Das Ziel ist kein Schachklon mit verschiebbaren Reihen.

Das Ziel ist ein eigenständiges Strategiespiel, bei dem Spieler neue taktische Denkweisen entdecken.

Frage dich:

**Welche besondere Entscheidung kann VERSATZ ermöglichen, die ein gewöhnliches Strategiespiel nicht bieten würde?**

Nutze die Antwort, um den tatsächlichen USP zu schärfen.

### 9. Entwicklungsentscheidungen nach Pareto

Priorisiere grundsätzlich:

1. Korrekte Regeln und reproduzierbare Ergebnisse.
2. Faire Ausgangsbedingungen und echtes Gegenspiel.
3. Strategisch interessante Entscheidungen.
4. Verständliche und befriedigende Interaktion.
5. Unterschiedliche KI-Stärken.
6. Zusätzliche kreative Mechaniken.
7. Erweiterungen und kosmetische Details.

Passe die Reihenfolge nur an, wenn ein klarer Produkt- oder Qualitätsgrund vorliegt.

Eine neue Mechanik ist nicht automatisch besser als eine kluge Vereinfachung bestehender Regeln.

### 10. Anti-Deadlock und kontinuierliche Entwicklung

Arbeite innerhalb der aktiven Sitzung eigenständig weiter.

Keine unnötigen Rückfragen.

Keine endlosen Analysen.

Keine mehrfachen identischen Testversuche ohne neue Erkenntnisse.

Keine unkontrollierten Architekturumbauten.

Keine ständigen Konzept-Neustarts.

Wenn ein Simulationslauf zu aufwendig wird:

- Lauf kontrolliert begrenzen.
- Zwischenergebnisse sichern.
- Aussagekraft korrekt kennzeichnen.
- Mit einer kleineren unabhängigen Prüfung fortfahren.

Wenn ein Browser- oder Build-Werkzeug blockiert:

- Ursache erfassen.
- Einen sinnvollen Lösungsversuch durchführen.
- Alternativ relevante Engine- und KI-Arbeit fortsetzen.

**Ein lokaler Blocker darf keinen globalen Stillstand auslösen.**

### 11. Kontinuierliche Sicherung

Nach jedem überprüften Entwicklungsinkrement:

1. Relevante Tests ausführen.
2. Tatsächlichen Produktfortschritt bewerten.
3. Statusdokumentation aktualisieren.
4. Git-Commit erstellen.
5. Autorisierten Remote-Push überprüfen.
6. Offene Risiken und nächste Priorität sichern.
7. Eigenständig weiterentwickeln.

Vor riskanten Regeländerungen einen nachvollziehbaren Checkpoint erstellen.

Ein Integrator, keine konkurrierenden Schreibzugriffe.

Keine erfundenen Testergebnisse.

Keine unbestätigten Push-Meldungen.

Keine Behauptung, dass eine laufende Sitzung nach ihrem Ende automatisch fortgesetzt wird.

### 12. Sofortiger konkreter Auftrag

**Phase A:**

Prüfe den aktuellen Stand der Simulationen, Browser-Tests, Animationen und Git-Änderungen.

**Phase B:**

Untersuche das Starter-Balanceproblem. Vergleiche Anfangsstellungen und prüfe die tatsächlichen Ursachen für die stark unterschiedlichen Ergebnisse.

**Phase C:**

Implementiere die beste risikoarme Verbesserung, die Balance oder strategisches Gegenspiel nachweislich erhöht.

**Phase D:**

Teste die Veränderung mit reproduzierbaren Vergleichspartien und realen Browser-Interaktionen.

**Phase E:**

Verbessere anschliessend den wichtigsten offenen Game-Feel- oder Gameplay-Engpass.

**Phase F:**

Sichere den Stand vollständig und arbeite innerhalb der laufenden Sitzung am nächsten relevanten Entwicklungsschritt weiter.

### 13. Abschlussnachweis

Berichte kompakt:

- Welche konkrete Schwäche wurde untersucht?
- Was war die tatsächliche Ursache?
- Welche Entscheidung wurde getroffen?
- Was wurde implementiert?
- Was zeigen die neuen Vergleichspartien?
- Welche kreativen Verbesserungen wurden geprüft?
- Was wurde im Browser tatsächlich gespielt?
- Welche Probleme bestehen weiterhin?
- Welche Commits und Pushes wurden bestätigt?
- Was ist der nächste konkrete Schritt?

---

## OBERSTE LEITLINIE

**Don't just make VERSATZ work. Make VERSATZ worth mastering.**

Wir brauchen nicht mehr Code, mehr Regeln oder mehr Features um ihrer selbst willen.

Wir brauchen ein einfaches, elegantes Strategiespiel, das durch intelligente Wechselwirkungen, spannende Entscheidungen und überraschende Taktiken begeistert.

**Simple rules. Meaningful decisions. Unexpected tactics. Endless discovery.**

Sei eigenständig.

Sei kreativ.

Sei kritisch.

Prüfe deine eigenen Annahmen.

Entwickle das Spiel weiter, statt nur Berichte zu produzieren.

**Build. Play. Challenge. Improve. Save. Continue.**