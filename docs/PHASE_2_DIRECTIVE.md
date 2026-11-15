# CODEX — VERSATZ: CONTINUOUS GAME DEVELOPMENT
## Phase 2 · Strategic Depth · Game Feel · Creative Innovation · Autonomous Execution

### 1. Mission — Bestehende Entwicklung fortsetzen

Repository:
https://github.com/essenmitpassion-sudo/Catworld.git

Setze die Entwicklung von **VERSATZ** auf Grundlage des tatsächlich vorhandenen Projektstands fort.

Kein Neustart. Keine erneute Konzeptsuche. Keine Wiederherstellung des alten Catworld-Lernspiels.

**Deine Aufgabe: Entwickle aus dem bereits funktionierenden Strategie-Prototyp ein aussergewöhnlich gutes, eigenständiges Spiel.**

Arbeite als Game Director, Senior Gameplay Engineer, AI Developer und unabhängiger Playtest-Auditor.

Du besitzt ausdrücklich kreative und technische Entscheidungsfreiheit.

### 2. Zuerst tatsächlichen Fortschritt prüfen

Prüfe kurz:

- Letzten Git-Commit und aktuellen Arbeitsbaum.
- Bestehende Spielregeln und Siegbedingungen.
- Aktuelle Startaufstellung.
- Ergebnisse der bisherigen Balance-Simulationen.
- Implementierung des KI-Gegners.
- Browser- und Gameplay-Tests.
- Bekannte Animationsfehler.
- Offene Aufgaben und vorhandene Dokumentation.

Beachte bisherige Befunde:

- Kompakte Formation: 64/64 Starter-Siege.
- Versetzte Formation: 19/64 Starter-Siege.
- Starker Einfluss der Startaufstellung.
- Tiefere KI-Suche erzielte bisher bessere Ergebnisse.
- Erste vollständige Browser-Partien wurden durchgeführt.
- Fehler bei Randumwicklung und Animation wurden untersucht.

**Überprüfe diese Befunde am aktuellen Code. Wiederhole nicht unnötig bereits ausreichende Tests.**

### 3. P0 — Strategische Fairness und Spieltiefe

Finde heraus, ob das Spiel tatsächlich faire und interessante Entscheidungen erzeugt.

Prüfe:

- Spieler- und Startvorteil.
- Symmetrie der Anfangsposition.
- Früh erzwungene Siege.
- Starke Tor-Rush-Strategien.
- Dominante Zugfolgen.
- Defensive Gegenmöglichkeiten.
- Wiederholungen und Sackgassen.
- Relevanz von Schlägen.
- Unterschiedliche erfolgreiche Strategien.
- Qualität der KI-Bewertung.

**Ziel ist nicht eine künstliche 50/50-Statistik, sondern ein faires Spiel mit echtem Gegenspiel.**

Falls grundlegende Regeln zu starken Verzerrungen führen, darfst du sie gezielt verändern.

Jede Regeländerung muss eine klare Hypothese und einen reproduzierbaren Vergleich besitzen.

### 4. P1 — Eigenständige kreative Innovation

Hier liegt eine deiner wichtigsten Aufgaben.

**Überrasche mit eigenen Ideen, die VERSATZ unverwechselbar machen.**

Untersuche insbesondere, wie die Reihenverschiebung neue strategische Entscheidungen erzeugen kann.

Erforsche:

- Mehrfachbedrohungen durch Verschiebungen.
- Intelligente Positionsopfer.
- Taktische Kettenreaktionen.
- Bewegungsblockaden mit Gegenstrategien.
- Überraschende Umpositionierungen.
- Unterschiedliche langfristige Spielpläne.
- Neue, intuitive Formen räumlicher Kontrolle.

Entwickle selbstständig mindestens drei Verbesserungsansätze:

**Evolution:** Bestehende Regeln präziser und spannender machen.

**Innovation:** Eine neue strategische Wechselwirkung ergänzen.

**Radical:** Eine ungewöhnliche, eigenständige Weiterentwicklung der Kernmechanik.

Vergleiche die Ansätze und implementiere nur den überzeugendsten.

Keine Feature-Flut.

**Ein genialer neuer Zugtyp kann wertvoller sein als zehn neue Spielfiguren.**

### 5. P2 — Premium Game Feel

Das Spiel soll nicht nur logisch korrekt, sondern angenehm und faszinierend zu bedienen sein.

Verbessere:

- Auswahl und Hervorhebung von Figuren.
- Zugvorschau inklusive Reihenverschiebung.
- Verständlichkeit der taktischen Konsequenzen.
- Smooth Movement und kurze Animationen.
- Eindeutige Darstellung von Schlägen.
- Visuelle Warnung vor konkreten Torgefahren.
- KI-Denkphase und Zugfeedback.
- Rücknahme und Revanche.
- Übergänge zwischen Spielzuständen.
- Responsive Darstellung auf mobilen Geräten.

**Wichtig:** Die Animation muss den tatsächlichen Regelzustand exakt wiedergeben.

Keine verzerrten Übergänge beim Umwickeln von Figuren am Rand.

Keine verwirrenden oder dekorativen Effekte ohne Gameplay-Nutzen.

Entwickle eine eigene visuelle Identität: minimalistisch, modern, charakterstark und hochwertig.

### 6. P3 — KI-Gegner weiterentwickeln

Verbessere die KI auf Grundlage tatsächlicher Partien.

Prüfe:

- Minimax-/Alpha-Beta-Suche.
- Positionsbewertung.
- Taktische Drohungen.
- Torverteidigung.
- Opferberechnung.
- Repetition Handling.
- Suchzeit und Performance.
- Unterschiedliche Schwierigkeitsgrade.

Eine stärkere KI darf nicht nur deshalb gewinnen, weil sie die aktuelle Bewertungsfunktion besser ausnutzt.

Vergleiche unterschiedliche Strategien und gespiegelte Startbedingungen.

Nutze KI-gegen-KI-Spiele, aber ergänze echte interaktive Tests.

### 7. Eigene Entwicklungswerkzeuge

Du darfst sinnvolle Tools und Tests eigenständig schreiben.

Beispielsweise:

- Tactical Puzzle Generator.
- Opening Analyzer.
- Forced-Win Detector.
- Replay Inspector.
- Strategy Diversity Analyzer.
- AI Benchmark Runner.
- Automated Rule Regression Tests.

**Baue nur Werkzeuge, die eine konkrete Entwicklungsentscheidung verbessern.**

Keine riesige Analyse-Infrastruktur ohne praktischen Nutzen.

### 8. Realer Spielspass als Produktziel

Beurteile die Qualität nicht nur anhand grüner Tests.

Frage dich nach echten Partien:

- Würde ich freiwillig noch einmal spielen?
- Habe ich interessante Entscheidungen getroffen?
- War die gegnerische Strategie nachvollziehbar?
- Gab es überraschende, aber faire Wendungen?
- Hatte ich nach einer Niederlage eine neue Idee?
- Entstanden abwechslungsreiche Partien?
- War die Spielzeit angenehm?
- Funktioniert das Spiel ohne ausführliches Tutorial?

Kennzeichne fehlende menschliche Playtests als offene Validierung.

**Don't mistake technical completion for great gameplay.**

### 9. Anti-Deadlock und eigenständige Fortsetzung

Keine unnötigen Rückfragen.

Keine endlose Planung.

Keine wiederholte Repository-Suche.

Keine Warte-OKs für risikoarme Entwicklungsentscheidungen.

Keine ständigen Regeländerungen ohne Belege.

Wenn ein Test zu lange dauert, begrenze ihn und arbeite mit überprüfbaren Zwischenergebnissen.

Wenn Browser oder Git blockiert, dokumentiere den konkreten Fehler und bearbeite eine unabhängige Aufgabe.

**Ein lokaler Blocker darf nicht das gesamte Projekt stoppen.**

Arbeite während der aktiven Sitzung kontinuierlich.

### 10. Sichern, prüfen, weitermachen

Nach jedem nachweisbaren Fortschritt:

1. Tests ausführen.
2. Gameplay überprüfen.
3. Änderungen dokumentieren.
4. Git-Commit erstellen.
5. Autorisierten Remote-Push überprüfen.
6. Fortsetzungsstatus aktualisieren.
7. Eigenständig die nächste sinnvolle Aufgabe bearbeiten.

Bewahre die Git-Historie, aber nicht unnötigerweise veraltete Spielinhalte.

Ein Integrator, keine konkurrierenden Schreibzugriffe.

Keine erfundenen Ergebnisse oder unbestätigten Pushes.

### 11. Sofortiger Ausführungsauftrag

Beginne jetzt im bestehenden VERSATZ-Projekt.

**Schritt A:** Ermittle den wichtigsten aktuell ungelösten Gameplay- oder Balancefehler.

**Schritt B:** Implementiere eine gezielte Lösung und überprüfe sie mit geeigneten Vergleichspartien.

**Schritt C:** Entwickle eine kreative Verbesserung, die tatsächlich neue taktische Möglichkeiten erzeugt.

**Schritt D:** Spiele mehrere vollständige Partien und überprüfe das Game Feel.

**Schritt E:** Sichere alle überprüften Fortschritte und arbeite selbstständig weiter.

Liefere nur nachvollziehbare Ergebnisse:

- Was wurde verändert?
- Warum?
- Was funktioniert jetzt besser?
- Welche Tests bestätigen das?
- Welche Schwächen bleiben?
- Welcher Commit ist gesichert?
- Was ist die nächste konkrete Priorität?

---

## OBERSTE LEITLINIE

**Don't just improve the code. Improve the decisions players make.**

VERSATZ soll nicht durch zusätzliche Features wachsen, sondern durch eine immer stärkere, originellere und befriedigendere Kernmechanik.

**Simple rules. Deep tactics. Beautiful interactions. One more match.**

Denke selbstständig, experimentiere kreativ, prüfe kritisch und entwickle ohne unnötigen Stillstand weiter.

**Build → Play → Learn → Improve → Save → Continue.**