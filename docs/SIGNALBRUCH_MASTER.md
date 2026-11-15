# MASTERPROMPT – PROJECT SIGNALBRUCH
## Entwickle ein aussergewöhnliches, originelles Strategiespiel

### 1. MISSION – ERFINDE EIN NEUES SPIELGEFÜHL

Du übernimmst die kreative, technische und qualitative Gesamtverantwortung für ein neues Strategiespiel.

Entwickle kein gewöhnliches Aufbau-, Kriegs- oder Ressourcenmanagementspiel. Erschaffe ein zugängliches, intelligentes und überraschend tiefes Strategiespiel, das durch seine Mechaniken überzeugt – nicht durch Feature-Masse.

**Ziel:** Innerhalb weniger Minuten verständlich, nach mehreren Stunden noch voller Entdeckungen.

Erfolg bedeutet:
- Ein spielbarer, unterhaltsamer Kern statt einer beeindruckenden Konzeptbeschreibung.
- Entscheidungen mit nachvollziehbaren Konsequenzen und echten Zielkonflikten.
- Verschiedene erfolgreiche Strategien ohne offensichtliche Universallösung.
- Überraschende Situationen aus miteinander verbundenen Regeln.
- Klare, charakteristische Grafik und unmittelbares Feedback.
- Kurze, spannende Partien mit hohem Wiederspielwert.

### 2. KREATIVE STARTHYPOTHESE – SIGNALBRUCH

**Leitidee: In diesem Strategiespiel kontrollierst du nicht primär Armeen oder Territorien – du kontrollierst, wie Entscheidungen durch die Welt reisen.**

Die Karte besteht aus autonomen Siedlungen, Relaisstationen und Verbindungen. Befehle sind physische Signale. Sie benötigen Zeit, können umgeleitet, abgefangen, verzögert oder gefälscht werden.

Beispiel:

Du beauftragst eine Siedlung mit ihrer Verteidigung. Der Befehl braucht drei Runden. Währenddessen verändert der Gegner die Verbindung. Deine Siedlung könnte den Befehl verspätet erhalten – oder eine völlig andere Situation vorfinden.

Dadurch entstehen neue strategische Möglichkeiten:

- **Kommunikation als Macht:** Gute Verbindungen ermöglichen schnelle Reaktionen, eröffnen aber auch Angriffswege.
- **Information als Waffe:** Täuschung, Beobachtung und Vorhersage können wichtiger werden als Stärke.
- **Autonome Welt:** Siedlungen handeln nach einfachen eigenen Regeln weiter, wenn keine neuen Befehle eintreffen.
- **Planung gegen Anpassung:** Langfristige Vorbereitung konkurriert mit kurzfristiger Kontrolle.
- **Emergenz:** Wenige verständliche Systeme erzeugen unerwartete Kettenreaktionen.

**Wichtig:** Dies ist eine Hypothese, keine unveränderliche Vorgabe.

Vergleiche sie mit zwei unabhängig entwickelten, radikal anderen Spielkonzepten. Bewerte Originalität, Entscheidungsqualität, Verständlichkeit, Umsetzbarkeit und Spielpotenzial. Wähle selbstständig den überzeugendsten Ansatz.

Vermeide Innovationsbehauptungen ohne Recherche. Entscheidend ist eine eigenständige, spielerisch wirksame Kombination.

### 3. GAME-DESIGN – TIEFE STATT KOMPLEXITÄT

Entwickle einen strategischen Kern mit maximal drei zentralen Aktionen und wenigen verständlichen Ressourcen.

Jede Mechanik muss mindestens eines bewirken:
1. Eine interessante Entscheidung erzeugen.
2. Eine neue Strategie ermöglichen.
3. Ein bestehendes System sinnvoll verändern.

Bevorzuge Mechaniken, die mehrere Aufgaben gleichzeitig erfüllen.

Entwickle insbesondere:
- Einen spannenden Entscheidungszyklus mit kurzen Wartezeiten.
- Konkurrierende Strategien und erkennbare Gegenmassnahmen.
- Kontrollierbare Risiken statt willkürlicher Bestrafung.
- Interessante Niederlagen, die zum erneuten Spielen motivieren.
- Überraschende Synergien ohne unverständliche Sonderregeln.
- Einen Gegner, der nachvollziehbar handelt und Schwächen ausnutzt.

Prüfe kritisch, ob zeitverzögerte Befehle tatsächlich Spass erzeugen oder bloss die Bedienung verlangsamen. Falls nötig, kombiniere unmittelbare taktische Aktionen mit langfristigen Befehlen.

**Keine Mechanik erhält Bestandsschutz.**

### 4. P0 – KLEINSTER VOLLSTÄNDIGER SPIELKERN

Erstelle zunächst einen wirklich spielbaren Vertical Slice.

Angestrebter Umfang:
- Eine kompakte, klar lesbare Karte.
- Ein menschlicher Spieler gegen einen funktionierenden KI-Gegner.
- Drei unterschiedliche taktische Handlungsmöglichkeiten.
- Ein vollständiger Spielzyklus mit Sieg und Niederlage.
- Kurze Partien von ungefähr 5–10 Minuten.
- Verständliche Informationen, Animationen und Rückmeldungen.
- Neustart und sofortiger erneuter Spieleinstieg.

Die erste Version muss bereits interessante Entscheidungen ermöglichen.

Verzichte vorerst auf Kampagne, Inventar, aufwendige Meta-Progression, Multiplayer und umfangreiche Inhalte.

**P0 ist erst erfüllt, wenn eine vollständige Partie tatsächlich spielbar ist.**

### 5. TECHNISCHE UMSETZUNG

Untersuche zuerst Repository, vorhandenen Code, Werkzeuge und Projektzustand. Erhalte funktionierende Strukturen.

Bei einem leeren Projekt bevorzuge einen schlanken Browser-Prototyp mit TypeScript, Canvas und einer geeigneten Build-Umgebung. Wähle eine andere Technologie nur bei nachvollziehbarem Vorteil.

Architektur:
- Spielregeln unabhängig von Darstellung und Eingabe.
- Deterministischer Simulationskern mit reproduzierbaren Seeds.
- Explizite Spielzustände und klare Zustandsübergänge.
- KI verwendet dieselben legalen Aktionen wie der Spieler.
- Keine versteckten KI-Vorteile oder unbegründete Zufallseffekte.
- Datengetriebene Balancing-Werte statt verstreuter Konstanten.
- Saubere Trennung von Spiellogik, UI, Audio und Speicherung.

Keine unnötigen Frameworks, abstrakten Architekturschichten oder Agentensysteme.

### 6. VISUELLE IDENTITÄT UND SPIELGEFÜHL

Entwickle eine prägnante visuelle Sprache statt austauschbarer Platzhalter.

Für SIGNALBRUCH denkbar: eine minimalistische, stilisierte Strategiekarte mit leuchtenden Signalwegen, pulsierenden Befehlen und sichtbar reagierenden Knotenpunkten.

Entscheidend sind:
- Hohe Lesbarkeit bei kleinen und grossen Auflösungen.
- Unverwechselbare Formen und konsistente Farben.
- Sichtbare Ursache-Wirkungs-Beziehungen.
- Direkte Reaktion auf Eingaben.
- Klare Unterscheidung von Information, Prognose und Unsicherheit.
- Wenige, hochwertige Animationen mit funktionalem Nutzen.

Die Grafik muss das strategische Verständnis verbessern.

Audio kann später gezielt Spannung und Feedback unterstützen. Keine Dekoration auf Kosten der Spielbarkeit.

### 7. P1 – STRATEGISCHE QUALITÄT

Nach dem ersten vollständigen Spiel:

Analysiere systematisch:
- Gibt es dominante Eröffnungen oder unfaire Vorteile?
- Sind unterschiedliche Spielweisen tatsächlich sinnvoll?
- Erkennt der Spieler, warum er gewinnt oder verliert?
- Entsteht Spannung durch Entscheidungen oder lediglich durch Zufall?
- Kann die KI strategische Fehler des Spielers bestrafen?
- Gibt es langweilige Runden, unnötige Klicks oder Sackgassen?

Entwickle kleine Experimente für unsichere Mechaniken.

Nutze Simulationen mit verschiedenen Strategien und Seeds. Prüfe zusätzlich reale Partien über die Benutzeroberfläche.

**Nach jedem Meilenstein zuerst den grössten nachgewiesenen Qualitätsmangel beheben.**

### 8. P2 – ECHTER WIEDERSPIELWERT

Erweitere erst nach erfolgreicher P1-Prüfung.

Mögliche Richtungen:
- Unterschiedliche Kartenstrukturen mit strategischen Konsequenzen.
- Gegner mit erkennbaren Verhaltensprofilen.
- Neue Wechselwirkungen statt zusätzlicher Ressourcen.
- Besondere Situationen, die etablierte Strategien infrage stellen.
- Entscheidungen, die den späteren Partieverlauf verändern.

Prüfe ungewöhnliche Mechaniken anhand kleiner spielbarer Experimente.

Verwerfe Erweiterungen, die mehr Komplexität als Spieltiefe erzeugen.

### 9. QUALITÄT, RED TEAM UND REALITÄTSTEST

Arbeite im Zyklus:

**Hypothese → minimale Umsetzung → echter Test → Schwäche identifizieren → verbessern → sichern.**

Teste insbesondere:
- Spielregeln, Zustandswechsel und Siegbedingungen.
- Grenzfälle, illegale Aktionen und fehlerhafte Eingaben.
- KI-Entscheidungen und nachvollziehbares Verhalten.
- Performance, Bedienbarkeit und Bildschirmgrössen.
- Endlosschleifen, festgefahrene Zustände und Exploits.
- Speicherverhalten und Regressionen.

Nutze automatisierte Tests, Simulationen und – soweit technisch verfügbar – echte UI-Interaktion.

Unterscheide ausdrücklich technische Funktion, strategische Qualität und subjektiven Spielspass. Behaupte keinen nachgewiesenen Spielspass ohne menschliche Tests.

### 10. AUTONOMIE UND KONTINUITÄT

Arbeite innerhalb der aktiven Sitzung eigenständig weiter.

- Keine Warte-OKs zwischen sicheren, reversiblen Schritten.
- Keine endlosen Konzeptphasen oder wiederholten Neustarts.
- Begrenze fehlgeschlagene Versuche und verwende sichere Alternativen.
- Ein lokaler Fehler darf unabhängige Aufgaben nicht stoppen.
- Arbeite mit einem verantwortlichen Integrator und verhindere konkurrierende Schreibzugriffe.
- Sichere funktionierende Zwischenstände durch nachvollziehbare Git-Commits.
- Push nur auf autorisierte Remotes und verifiziere das Ergebnis.
- Schütze fremde Projekte, Dateien und bestehende Daten.
- Sichere vor grösseren Änderungen einen wiederherstellbaren Stand.

Bei Kontext- oder Sitzungslimits dokumentiere Projektzustand, Entscheidungen, Nachweise, bekannte Probleme und die unmittelbar nächste Aufgabe im Repository.

Keine behauptete Hintergrundarbeit und keine erfundenen Testergebnisse.

### 11. BERICHT UND NÄCHSTE PRIORITÄT

Berichte kompakt nach sinnvollen Meilensteinen:

1. Was ist tatsächlich spielbar?
2. Welche originelle Mechanik erzeugt welchen Mehrwert?
3. Was wurde automatisch und praktisch getestet?
4. Welcher Qualitätsmangel wurde entdeckt und behoben?
5. Welche Risiken bleiben?
6. Welcher Commit sichert den Stand?
7. Was ist der nächste wertvollste Entwicklungsschritt?

Berichte sind Nachweise der Umsetzung, kein Ersatz dafür.

## OBERSTE LEITLINIE

**Erschaffe nicht möglichst viel Spiel. Erschaffe möglichst viel Spieltiefe aus wenigen genial miteinander verbundenen Regeln. Denke unabhängig, entwickle mutig, teste kritisch und liefere ein Spiel, das man nach der ersten Partie unbedingt nochmals spielen möchte.**