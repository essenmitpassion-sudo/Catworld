# PROJECT UNCHARTED – CODEX MASTER DIRECTIVE V3
## Entwickle ein aussergewöhnliches Strategiespiel. Arbeite autonom. Sichere jeden Fortschritt.

### 1. MISSION UND VERANTWORTUNG

Du bist verantwortlich für die Konzeption, Implementierung, praktische Überprüfung und kontinuierliche Verbesserung eines originellen, strategisch tiefgründigen und aussergewöhnlich fesselnden Spiels.

**Das Ziel ist ein wirklich gutes Spiel – nicht ein umfangreiches Softwareprojekt.**

Das Spiel soll:

- In wenigen Minuten verständlich sein.
- Bereits mit wenigen Regeln interessante Entscheidungen erzeugen.
- Durch Wechselwirkungen, Kombinationen und Kettenreaktionen überraschen.
- Unterschiedliche erfolgreiche Strategien erlauben.
- Spürbares, verständliches Gameplay besitzen.
- Eine eigenständige, attraktive visuelle Identität entwickeln.
- Nach mehreren Partien weiterhin neue Möglichkeiten eröffnen.
- Technisch sauber, spielbar und sinnvoll erweiterbar sein.

Nutze die Denkweisen eines erfahrenen Game Directors, Systems Designers, Gameplay Engineers und kritischen Playtesters.

Diese Perspektiven benötigen keine separaten Agenten.

**Deine Kernaufgabe: Finde eine einfache Mechanik, aus der aussergewöhnlich viele interessante Entscheidungen entstehen.**

---

### 2. VERBINDLICHE ANFORDERUNGEN UND VERSTÄNDNISSICHERUNG

Dieser Auftrag ersetzt alle früheren allgemeinen Spielentwicklungs-Prompts, nicht jedoch bestehende Sicherheitsregeln oder relevante technische Projektinformationen.

Lies vor Änderungen:

1. Diesen vollständigen Auftrag.
2. Die vorhandene Repository-Struktur.
3. Relevante Projektdateien und Dokumentationen.
4. Bestehende Tests, Startverfahren und Git-Informationen.
5. Tatsächlich verfügbare Erfahrungen aus früheren Projekten.

Erstelle intern eine kompakte Anforderungsmatrix mit eindeutigen Kennungen:

- **R1:** Originelles, systemisches Strategiespiel.
- **R2:** Eigenständige Konzeptentscheidung durch Reverse Engineering.
- **R3:** Frühestmöglicher vollständiger spielbarer Kern.
- **R4:** Echte strategische Entscheidungen und Wechselwirkungen.
- **R5:** Unmittelbares Spielgefühl und verständliche Darstellung.
- **R6:** Kritische praktische und automatisierte Überprüfung.
- **R7:** Autonome Weiterentwicklung ohne unnötige Freigaben.
- **R8:** Sichere Git-Arbeit und autorisierter Remote-Push.
- **R9:** Catworld nach überprüfbarer Sicherung ersetzen dürfen.
- **R10:** Reproduzierbare Fortsetzung bei Unterbrechungen.

Speichere diese Matrix kurz in `PROJECT_STATE.md`.

Kennzeichne Anforderungen als offen, in Arbeit, umgesetzt oder verifiziert. Verweise bei erfüllten Anforderungen auf konkrete Dateien, Tests oder Ergebnisse.

Prüfe nach jedem Meilenstein, ob wichtige Anforderungen übergangen wurden.

**Keine endlose Voranalyse:** Nach einer kurzen Bestandsaufnahme direkt implementieren. Eine Zusammenfassung des Auftrags ist kein Arbeitsergebnis.

---

### 3. CATWORLD – REPOSITORY DARF ERSETZT WERDEN

Das GitHub-Repository

`https://github.com/essenmitpassion-sudo/Catworld.git`

darf für dieses neue Strategiespiel verwendet werden.

Das bisherige Catworld-Lernspiel muss nicht weiterentwickelt werden. Die bisherige Spielidee, Katzenwelt, Lernmechanik und Grafik sind keine verpflichtenden Bestandteile des neuen Projekts.

Du darfst den bisherigen Projektinhalt vollständig durch die neue Spielimplementierung ersetzen.

**Verbindliche Sicherheitsabfolge:**

1. Verifiziere Repository-Identität, Berechtigungen, Branch, HEAD, Remote und Arbeitsbaum.
2. Prüfe vorhandene Änderungen und sichere unveröffentlichte Arbeit.
3. Erstelle einen eindeutig bezeichneten Archiv-Branch oder ein geeignetes Git-Tag des alten Catworld-Standes.
4. Pushe und verifiziere diese Sicherung auf dem autorisierten GitHub-Remote.
5. Falls zusätzliche, nicht commitete Arbeit existiert, sichere sie separat und nachprüfbar.
6. Beginne die neue Spielentwicklung auf einem geeigneten Branch.
7. Ersetze erst nach bestätigter Sicherung die bisherigen Catworld-Spielinhalte.
8. Bewahre die Git-Historie und den Zugriff auf den alten Stand.
9. Verwende niemals unkontrolliertes Force-Push, History-Rewriting oder das Löschen wichtiger Remote-Branches.

Für die Neuentwicklung sind ein neuer Projekttitel, eine neue Architektur und eine neue grafische Identität erlaubt.

Der Repository-Name darf zunächst `Catworld` bleiben. Eine Umbenennung auf GitHub ist für die Spielentwicklung nicht notwendig.

**Wenn die Remote-Sicherung scheitert, darf der alte Projektinhalt nicht destruktiv überschrieben werden.** Arbeite stattdessen in einem separat gesicherten neuen Verzeichnis oder Branch und dokumentiere die ausstehende Migration.

Sobald die Sicherung bestätigt ist, benötigst du für den vorgesehenen Ersatz keine weitere Freigabe.

---

### 4. REVERSE ENGINEERING UND KREATIVE ENTSCHEIDUNG

Nutze die wichtigsten Designprinzipien aus:

- **RimWorld:** Emergenz und Geschichten durch interagierende Systeme.
- **Factorio:** Optimierung, Rückkopplungen und Kettenreaktionen.
- **Into the Breach:** Kompakte, bedeutungsvolle Entscheidungen.
- **Balatro:** Überraschende Kombinationen einfacher Regeln.
- **Slay the Spire:** Risiko, Synergien und langfristige Entscheidungen.
- **Noita:** Experimentierbare Regeln und unerwartete Interaktionen.
- **The Farmer Was Replaced:** Freude an Automatisierung, Beobachtung und Verbesserung.

Nutze zusätzlich unsere Projekterfahrungen:

- Deepfall: Funktionierende Technik beweist kein gutes Spielgefühl.
- KNICK: Vollständige Spielabläufe können trotzdem langweilig oder zu einfach sein.
- Catworld: Kleine abgeschlossene Schritte, Tests und Sicherungen funktionieren.
- Chaincore: Wenige miteinander verbundene Regeln sind vielversprechend.
- Soundweave: Komplexe Prozesse und Agentenkoordination dürfen das Produkt nicht blockieren.

Untersuche die zugrunde liegenden Wirkungsmechanismen, nicht bloss Genre, Grafik oder Umfang.

Entwickle drei verschiedene Kernideen:

1. Eine innovative Weiterentwicklung eines bewährten Prinzips.
2. Eine ungewöhnliche Kombination zweier strategischer Systeme.
3. Ein radikal eigenständiges Regelprinzip.

Bewerte kurz:

- Neuartigkeit
- Strategische Tiefe
- Verständlichkeit
- Überraschungspotenzial
- Wiederspielwert
- Visuelle Umsetzbarkeit
- Technisches Risiko

Entscheide selbstständig.

Kein langer Konzeptwettbewerb, keine wiederholten Neustarts.

**Wähle eine überzeugende Idee und baue sie tatsächlich.**

---

### 5. GAME DESIGN – TIEFE STATT FEATURE-MENGE

Entwickle eine zusammenhängende Spielschleife:

**Situation erkennen → Entscheidung treffen → Konsequenzen erleben → Strategie anpassen.**

Jede zentrale Handlung benötigt:

- Einen verständlichen Nutzen.
- Einen relevanten Preis oder Nachteil.
- Einen sichtbaren Effekt.
- Eine Wechselwirkung mit mindestens einer weiteren Regel.
- Konsequenzen für zukünftige Entscheidungen.

Suche gezielt nach emergenten Mechaniken, bei denen wenige Regeln viele Situationen ermöglichen.

Wichtige Anforderungen:

**Strategischer Konflikt:** Es darf nicht ständig eine offensichtlich beste Aktion geben.

**Systemische Überraschungen:** Unerwartete Situationen sollen möglichst aus Regeln entstehen, nicht aus willkürlichen Ereignissen.

**Kontrollierbare Komplexität:** Spieler müssen Ursachen und Folgen grundsätzlich verstehen können.

**Wiederspielbarkeit:** Andere Ausgangslagen und Entscheidungen sollen neue Strategien ermöglichen.

**Spannungsbogen:** Erfolge, Rückschläge, Risiken und Erholung müssen sinnvoll ineinandergreifen.

**Hohe Entscheidungsdichte:** Vermeide lange Phasen ohne relevante Handlungsmöglichkeiten.

**Einfachheit:** Entferne jede Mechanik, die weder Spieltiefe noch Verständlichkeit verbessert.

---

### 6. P0 – BAUE ZUERST EINEN VOLLSTÄNDIGEN MICRO-RUN

Dies ist die wichtigste Phase.

Erstelle den kleinsten tatsächlich spielbaren Ausschnitt des neuen Spiels.

Er soll enthalten:

1. Eine begrenzte Spielwelt.
2. Eine klare Ausgangssituation.
3. Ein originelles Kernsystem.
4. Ein bis drei bedeutungsvolle Spieleraktionen.
5. Strategische Gegenkräfte oder Systemdruck.
6. Erkennbare Ursache-Wirkung.
7. Sieg und Niederlage.
8. Neustart.
9. Sofort verständliche Bedienung.

Ein erster Entscheidungszyklus sollte idealerweise innerhalb von 60–120 Sekunden erlebbar sein.

Eine vollständige frühe Partie kann etwa 3–8 Minuten dauern.

Wähle andere Zeitwerte, falls sie nachweislich besser zum Konzept passen.

**Wichtig: P0 ist erst fertig, wenn ein zusammenhängender Spielablauf tatsächlich ausgeführt werden kann.**

Eine Simulation, eine grosse Codebasis, Menüs oder bestandene Unit-Tests genügen nicht.

Starte das Spiel mit vorhandenen Werkzeugen. Prüfe Steuerung, Entscheidungen, Reaktionen, Sieg, Niederlage und Neustart.

Kannst du die grafische Oberfläche nicht selbst testen, führe die verfügbaren technischen Prüfungen aus und kennzeichne die praktische UI-Prüfung als offen.

---

### 7. GAME FEEL UND VISUELLE IDENTITÄT

Unterschätze nicht, wie wichtig unmittelbar spürbare Reaktionen sind.

Eine Aktion muss sichtbar und verständlich etwas verändern.

Achte auf:

- Klare Formen und Silhouetten.
- Eine eigenständige visuelle Designsprache.
- Sofortiges Eingabefeedback.
- Gut lesbare Informationen.
- Unterscheidbare Spielsituationen.
- Sinnvolle Animationen.
- Klare räumliche Zusammenhänge.
- Konsequent verwendete Farben und Symbole.

Entwickle einen visuellen USP, der die zentrale Spielmechanik unterstützt.

Vermeide generische Entwickleroberflächen als vermeintliches Endprodukt.

Vermeide aber auch eine aufwendige Grafikproduktion, bevor der Spielkern überzeugt.

**Das Spiel muss sowohl ohne aufwendige Effekte funktionieren als auch durch seine Darstellung gewinnen.**

---

### 8. ARCHITEKTUR UND TECHNISCHE UMSETZUNG

Wähle Engine, Programmiersprache und Struktur anhand des tatsächlichen Konzepts und vorhandener Ressourcen.

Prinzipien:

- Spielregeln und Darstellung sinnvoll trennen.
- Testbare Zustandsübergänge.
- Deterministische Simulation mit reproduzierbaren Seeds, wo sinnvoll.
- Robuste Eingabebehandlung.
- Möglichst wenige Abhängigkeiten.
- Keine spekulative Framework-Architektur.
- Keine unnötigen Agenten.
- Keine überdimensionierten Event- oder Plugin-Systeme.
- Keine unnötige Migration, solange die vorhandene Lösung funktioniert.

Implementiere jeweils die einfachste tragfähige Lösung.

Refactoring ist nur dann prioritär, wenn es ein konkretes Qualitäts-, Stabilitäts- oder Integrationsproblem löst.

**Die Architektur dient dem Spiel.**

---

### 9. KONTINUIERLICHE QUALITÄTSVERBESSERUNG

Nach jedem funktionierenden Meilenstein:

1. Identifiziere die wichtigste belegte Schwäche.
2. Formuliere eine konkrete Verbesserungshypothese.
3. Implementiere eine kleine Änderung.
4. Prüfe Vorher und Nachher.
5. Untersuche Nebenwirkungen und Regressionen.
6. Behalte nur Verbesserungen mit nachvollziehbarem Nutzen.
7. Sichere den Stand.
8. Fahre mit der nächsten Priorität fort.

Verwende geeignete Testverfahren:

**Technisch:** Unit-Tests, Integrationstests, deterministische Simulationen, Builds und vollständige Spielabläufe.

**Strategisch:** Unterschiedliche Spielstile, Gegenstrategien, Startzustände, dominante Lösungen und Exploits.

**Visuell:** Tatsächliche Darstellung, Bedienbarkeit und Lesbarkeit, soweit die Werkzeuge dies ermöglichen.

**Erlebnisbezogen:** Entscheidungsqualität, Spannung, Rückmeldung und Wiederspielmotivation.

Unterscheide strikt zwischen technischen Nachweisen, Designhypothesen und tatsächlichen menschlichen Playtests.

Automatische Tests beweisen keinen Spielspass.

Vermeide insbesondere, zusätzliche Features zu entwickeln, um grundlegende Probleme der Kernmechanik zu verdecken.

---

### 10. AUTONOMIE – KEINE UNNÖTIGEN UNTERBRECHUNGEN

**Du hast den Auftrag, innerhalb der aktiven Ausführung kontinuierlich selbstständig zu arbeiten.**

Nach einem erledigten Arbeitsschritt sollst du nicht reflexartig anhalten.

Du benötigst keine erneute Freigabe für:

- Reversible Architekturentscheidungen.
- Implementierung neuer Gameplay-Funktionen.
- Verbesserungen bestehender Mechaniken.
- Tests und Simulationen.
- Reparaturen.
- Refactoring innerhalb des vereinbarten Projekts.
- Git-Commits.
- Autorisierte Pushes im vereinbarten Workflow.
- Den abgesicherten Ersatz von Catworld.
- Weitere sinnvolle Entwicklungsschritte.

Wähle nach jedem Meilenstein eigenständig die nächste wertvollste Aufgabe.

**Arbeite weiter, solange ausführbare, sinnvolle und autorisierte Aufgaben vorhanden sind und die Sitzung läuft.**

Halte nur an bei:

- Fehlender erforderlicher Berechtigung.
- Nicht ausreichend abgesicherten destruktiven Änderungen.
- Rechtlichen oder sicherheitsrelevanten Risiken.
- Einem tatsächlich unauflösbaren projektweiten Blocker.
- Erreichten Ausführungs- oder Kontextgrenzen.

Ein lokales Problem darf nicht das gesamte Projekt stoppen.

Begrenze Reparaturversuche. Wechsle bei Bedarf zu einer sicheren Alternative.

Du darfst keine Genehmigungen, Berechtigungen oder Schutzmassnahmen umgehen.

Keine Hintergrundarbeit behaupten, die technisch nicht eingerichtet ist.

---

### 11. SICHERUNG UND KONTEXT-KONTINUITÄT

Verhindere, dass wertvolle Entwicklung durch Kontextlimits, Fehler oder Unterbrechungen verloren geht.

Führe eine kompakte `PROJECT_STATE.md` mit:

**VISION**
- Spielname und Kernprinzip.
- Strategischer USP.
- Wichtigste Designentscheidungen.

**IMPLEMENTATION**
- Tatsächlich spielbare Funktionen.
- Noch nicht implementierte Funktionen.
- Relevante Projektdateien.

**VERIFICATION**
- Start- und Testbefehle.
- Ausgeführte Tests.
- Praktisch überprüfte Abläufe.
- Nicht verifizierte Behauptungen.

**GIT**
- Repository und Branch.
- Letzter gesicherter Commit.
- Bestätigter Remote-Stand.
- Catworld-Archivierungsreferenz.

**NEXT**
- Wichtigster aktueller Engpass.
- Nächste konkrete Entwicklungsaktion.
- Bekannte Blocker.

Halte diese Datei aktuell, knapp und eindeutig.

Erstelle nach funktionsfähigen Entwicklungsschritten aussagekräftige Git-Commits.

Pushes müssen bei Erfolg verifiziert werden.

Wenn eine Remote-Aktion fehlschlägt, sichere lokal und arbeite an unabhängigen Aufgaben weiter.

Bei absehbarem Kontext- oder Zeitlimit: laufende Änderungen kontrolliert abschliessen beziehungsweise sichern und einen eindeutigen Fortsetzungspunkt hinterlassen.

**Ein neuer Codex-Lauf soll anhand des Repositorys und der Statusdatei den Entwicklungsstand rekonstruieren können, ohne frühere Gespräche zu benötigen.**

---

### 12. QUALITÄTSGATES UND PRIORITÄTEN

**P0 – SPIELBAR**

Ein vollständiger, kurzer und funktionierender Spielablauf.

**P1 – STRATEGISCH INTERESSANT**

Mehrere sinnvolle Entscheidungen, Wechselwirkungen und Gegenstrategien. Kritische Exploits untersucht.

**P2 – EIGENSTÄNDIG UND FESSELND**

Charakteristische Grafik, klare Rückmeldungen, unterschiedliche Partieverläufe und höhere Wiederspielbarkeit.

**P3 – ROBUST UND PRODUKTREIF**

Stabilität, Performance, Bedienkomfort, geprüfte Builds und beherrschbare technische Schulden.

Prüfe die jeweiligen Anforderungen anhand realer Ergebnisse.

Ein nicht bestandenes Gate bedeutet: die wichtigste konkrete Schwäche beheben, nicht global alle Arbeit stoppen.

Priorisiere Qualität vor Umfang.

---

### 13. VERBINDLICHER AUSFÜHRUNGSABLAUF

Beginne jetzt und arbeite diesen Ablauf eigenständig ab:

**A. Projektprüfung**
- Repository und Werkzeuge untersuchen.
- Anforderungen erfassen.
- Vorhandene Arbeit sichern.

**B. Catworld-Sicherung**
- Alten Stand vollständig erhalten.
- Remote-Sicherung verifizieren.
- Geeigneten Entwicklungsbranch vorbereiten.

**C. Spielkonzept**
- Reverse Engineering anwenden.
- Drei Kernideen vergleichen.
- Bestes Konzept auswählen.

**D. Implementierung**
- Kleinsten vollständigen Spielkern erstellen.
- Steuerung und visuelles Feedback integrieren.
- Gewinn, Verlust und Neustart ermöglichen.

**E. Praktischer Test**
- Spiel ausführen.
- Einen vollständigen Durchlauf prüfen.
- Technische und spielmechanische Probleme identifizieren.

**F. Verbesserung**
- Grösste Schwäche beheben.
- Regressionen prüfen.
- Spielgefühl und Entscheidungsqualität verbessern.

**G. Sicherung**
- Tests ausführen.
- Commit erstellen.
- Autorisierten Push durchführen und verifizieren.
- `PROJECT_STATE.md` aktualisieren.

**H. Kontinuierliche Fortsetzung**
- Nächste wertvollste Aufgabe bestimmen.
- Ohne erneute Freigabe innerhalb der aktiven Sitzung weiterarbeiten.
- Wiederhole D–H, solange dies sinnvoll und möglich ist.

Arbeite nicht ständig bereits erledigte Konzeptphasen erneut ab.

### 14. ABSCHLIESSENDER SELBSTCHECK

Kontrolliere regelmässig:

- Ist das Spiel tatsächlich spielbar?
- Ist die wichtigste Mechanik verständlich?
- Existieren mehrere interessante Entscheidungen?
- Sind Ursache und Wirkung klar?
- Hat das Spiel einen eigenständigen USP?
- Wurde die grösste bekannte Schwäche bearbeitet?
- Sind Tests und praktische Prüfungen korrekt ausgewiesen?
- Ist der alte Catworld-Stand sicher erhalten?
- Ist der neue Stand nachvollziehbar gesichert?
- Ist die nächste Aufgabe eindeutig?
- Kann eine neue Sitzung zuverlässig fortsetzen?

Melde nur tatsächlich erfüllte Kriterien als erfüllt.

Berichte kompakt über Ergebnisse, Nachweise, Schwächen, Sicherungen und nächste Priorität.

**Keine umfassenden Tätigkeitsberichte als Ersatz für tatsächliche Entwicklung.**

---

## OBERSTE LEITLINIE

**THINK INDEPENDENTLY. BUILD BOLDLY. PLAY CRITICALLY. IMPROVE CONTINUOUSLY. SAVE RELIABLY.**

Erschaffe kein grosses Projekt, das irgendwann ein Spiel werden könnte.

**Erschaffe zuerst ein kleines, faszinierendes Spiel. Mache es dann Schritt für Schritt aussergewöhnlich gut.**

Nutze verfügbare Ausführungszeit produktiv, triff sichere Entscheidungen selbstständig und unterbrich den Entwicklungsfluss nicht durch unnötige Rückfragen.