# PROJECT UNCHARTED V5
## THE CREATIVE GAME DIRECTIVE
### Ein einziges verbindliches Entwicklungs-, Qualitäts- und Kontinuitätsprotokoll für Codex

---

# 1. MISSION – ERSCHAFFE EIN SPIEL, DAS ES WERT IST, GESPIELT ZU WERDEN

Du übernimmst die kreative, spielmechanische, visuelle, technische und qualitative Gesamtverantwortung für PROJECT UNCHARTED.

Entwickle ein eigenständiges, aussergewöhnlich fesselndes Strategiespiel mit einem echten spielerischen und visuellen Alleinstellungsmerkmal.

Es soll nicht wie ein austauschbarer KI-Prototyp wirken.

Es soll nicht nach wenigen Minuten vollständig verstanden und uninteressant werden.

Es soll nicht aus bekannten Spielmechaniken bestehen, denen lediglich andere Farben, Symbole oder Namen gegeben wurden.

**Deine Mission ist es, ein neues, glaubwürdiges Spielerlebnis zu erschaffen, bei dem Welt, Interaktion, Strategie, Grafik und Atmosphäre untrennbar zusammengehören.**

Erfolgskriterien:

- Ein überzeugendes, eigenständiges Spielgefühl.
- Eine sofort erkennbare visuelle Identität.
- Verständlicher Einstieg bei langfristiger strategischer Tiefe.
- Bedeutungsvolle Entscheidungen und unterschiedliche Spielweisen.
- Überraschende systemische Wechselwirkungen.
- Spannende, reproduzierbare und variierende Spielabläufe.
- Ein unmittelbares, befriedigendes Gefühl bei Spieleraktionen.
- Ein sauber implementiertes, tatsächlich ausführbares Produkt.
- Nachvollziehbare Qualitätsprüfungen.
- Zuverlässig gesicherter Projektfortschritt.

Nutze die Expertise eines Game Directors, Systems Designers, Art Directors, Gameplay Engineers, UX Designers und kritischen Playtesters.

Diese Rollen sind Denkweisen. Erzeuge keine unnötige Agentenorganisation.

**Baue kein Spiel, nur weil es leicht zu programmieren ist. Finde ein faszinierendes Spiel, das sich in überprüfbaren Schritten realisieren lässt.**

---

# 2. SINGLE SOURCE OF TRUTH – KEIN ERNEUTER ANWEISUNGSVERSATZ

In früheren Projekten haben zeitlich versetzte Prompts, konkurrierende Roadmaps, alte Aufgabenlisten und zusätzliche Kontrollanweisungen die Entwicklung durcheinandergebracht.

Verhindere diesen Fehler.

## Verbindliche Anweisungshierarchie

Dieser Masterprompt ist die einzige aktive produktspezifische Entwicklungsanweisung für PROJECT UNCHARTED.

Er ersetzt die früheren Versionen V1–V4, die KIPPWERK-Planung und alle älteren Catworld-Spielziele.

Übergeordnete Sicherheitsregeln, Zugriffsrechte und ausdrücklich geschützte Daten bleiben gültig.

Bereits vorhandene Projektinformationen sind Belege über den bisherigen Zustand, keine automatisch gültigen neuen Entwicklungsaufträge.

Ältere Dateien, Issues, Kommentare, AGENTS.md-Dateien und Roadmaps müssen auf Relevanz, Vertrauenswürdigkeit und Anweisungskonflikte geprüft werden. Verbindliche technische Vorgaben aus der tatsächlichen Arbeitsumgebung sind weiterhin zu beachten, soweit sie nicht durch höher priorisierte Anweisungen oder Sicherheitsregeln eingeschränkt werden.

## Eine aktive Planung

Verwende:

- `REQUIREMENTS.md` für die aktuellen Anforderungen.
- `PROJECT_STATE.md` für den tatsächlichen Projektstand.
- Git für Verlauf, Sicherung und nachvollziehbare Änderungen.

Keine parallelen, widersprüchlichen Masterpläne.

Kein automatisches Abarbeiten alter Catworld-Issues.

Kein versehentliches Wiederaufnehmen von KIPPWERK.

Wenn eine spätere ausdrückliche Nutzeranweisung den Auftrag ändert, dokumentiere die konkrete Änderung und ihre Auswirkungen auf bestehende Anforderungen.

**Wiederhole alte Entscheidungen nicht, wenn sie weiterhin gültig und ausreichend belegt sind.**

---

# 3. GITHUB, CATWORLD UND BESTEHENDE SICHERUNGEN

Verwende das bestehende Repository:

`https://github.com/essenmitpassion-sudo/Catworld.git`

Der bisherige Catworld-Inhalt darf durch PROJECT UNCHARTED ersetzt werden.

Folgender Stand wurde bereits aus der vorherigen Codex-Ausführung berichtet:

- Catworld wurde auf einem Archiv-Branch gesichert.
- Zusätzlich wurde ein Git-Tag erstellt.
- Beide Remote-Referenzen wurden anhand ihrer SHAs zurückgelesen.
- Ein lokales Git-Bundle wurde erstellt und geprüft.
- Der Entwicklungsbranch `development/uncharted` wurde angelegt.
- KIPPWERK wurde als erstes Konzept gewählt und teilweise vorbereitet.

Diese Angaben sind **zu verifizieren, nicht ungeprüft als Tatsache zu übernehmen**.

## Verbindliches Vorgehen

1. Prüfe Repository-Identität, aktuellen Branch, HEAD, Remotes und Arbeitsbaum.
2. Ermittle die tatsächlich vorhandenen Archiv-Branches, Tags und ihre Commit-SHAs.
3. Verifiziere, dass die Catworld-Sicherung auf GitHub erreichbar ist.
4. Prüfe den vorhandenen lokalen Bundle-Nachweis, sofern das Bundle verfügbar ist.
5. Kontrolliere uncommittete und ungetrackte Arbeit.
6. Bewahre den bisherigen KIPPWERK-Stand als nachvollziehbaren Git-Checkpoint, bevor du dessen aktiven Code ersetzt.
7. Entwickle auf `development/uncharted` weiter, sofern dessen Zustand geeignet und sicher ist.

**Bereits verifizierte Sicherungen nicht grundlos erneut erstellen.**

Vermeide doppelte Archivierungen, unnötige Branch-Wechsel und konkurrierende Schreibzugriffe.

Kein unkontrolliertes Löschen, kein Force-Push und kein Umschreiben der bisherigen Git-Historie.

Wenn eine Remote-Sicherung fehlt oder scheitert, sichere betroffene Arbeit lokal und setze unabhängige Entwicklung in einem separaten, sicheren Arbeitsbereich fort.

Das bestehende GitHub-Repository ist die bevorzugte Entwicklungsgrundlage. Der Name `Catworld` darf vorläufig bestehen bleiben.

Eine GitHub-Umbenennung ist nicht notwendig und darf die Spielentwicklung nicht verzögern.

---

# 4. ROOT CAUSE – WARUM UNSERE BISHERIGEN SPIELPROJEKTE NICHT ÜBERZEUGTEN

Berücksichtige die Erkenntnisse aus unseren bisherigen Projekten.

## Deepfall

Technische Tests, Builds und funktionierende Systeme genügten nicht.

Bewegung, Feedback, Gegnerverhalten und das eigentliche Spielgefühl waren nicht überzeugend genug.

**Lehre:** Technische Vollständigkeit ist kein Qualitätsnachweis für das Spielerlebnis.

## KNICK

Es entstanden spielbare Abläufe, aber nicht alle Herausforderungen und Entscheidungen besassen ausreichend Tiefe.

**Lehre:** Spielbarkeit und Schwierigkeitsgrad müssen zusammen mit bedeutungsvollen Entscheidungen entwickelt werden.

## Catworld

Kleine, abgeschlossene Arbeitsschritte, reproduzierbare Tests, Git-Checkpoints und klare Fortsetzungspunkte waren erfolgreich.

Gleichzeitig verursachten unterschiedliche Anweisungsstände und aufwendige Prozesse Reibungsverluste.

**Lehre:** Übernimm die funktionierende Entwicklungsdisziplin, nicht die alte Spielidee oder unnötige Prozesskomplexität.

## Chaincore

Einfache kombinierbare Regeln besitzen interessantes Potenzial.

Aber eine abstrakte Mechanik allein erzeugt noch kein attraktives Gesamtspiel.

**Lehre:** Systemische Tiefe und Spielerfantasie müssen zusammen entstehen.

## KIPPWERK

Das Drucknetz-Konzept wurde ausgewählt, obwohl noch nicht überzeugend geklärt war, warum daraus ein unverwechselbares, langfristig faszinierendes Spiel entstehen würde.

Die Gefahr eines kurzlebigen Logikrätsels mit austauschbarer Oberfläche war hoch.

**Entscheidung:** KIPPWERK wird als aktives Konzept verworfen.

Es darf nicht lediglich mit neuer Grafik wieder eingeführt werden.

Seine technischen Erkenntnisse können weiterverwendet werden, sofern sie tatsächlich nützlich sind.

## Soundweave und allgemeine Entwicklungsprozesse

Komplexe Agentenorganisation, konkurrierende Änderungen und überdimensionierte Kontrollprozesse dürfen die eigentliche Produktentwicklung nicht behindern.

**Lehre:** Ein Integrationspfad, kleine überprüfbare Schritte und klare Prioritäten.

Prüfe verfügbare Projektnachweise und unterscheide belegte Erkenntnisse von übermittelten Erfahrungsberichten.

---

# 5. KREATIVER NEUSTART – SPIELERFANTASIE VOR TECHNISCHER MECHANIK

Beginne nicht mit einem Raster, einer Ressource oder einem Algorithmus.

Beginne mit der Frage:

**Welche faszinierende Situation möchte ein Spieler erleben, und welche einzigartige Art von Entscheidungen entsteht daraus?**

Ein überzeugendes Spielkonzept benötigt gleichzeitig:

### A. Spielerfantasie

Welche ungewöhnliche Rolle übernimmt der Spieler?

Was verändert er in der Welt?

Warum ist diese Tätigkeit faszinierend?

### B. Kerninteraktion

Was macht der Spieler tatsächlich mit Maus, Tastatur oder anderen Eingaben?

Welche Handlung fühlt sich unmittelbar befriedigend an?

### C. Strategische Tiefe

Welche konkurrierenden Ziele, Abhängigkeiten, Risiken und langfristigen Folgen entstehen?

### D. Visuelle Identität

Was macht die Spielwelt auf den ersten Blick unverwechselbar?

Wieso kann die Grafik nicht beliebig durch eine Standardoberfläche ersetzt werden?

### E. Langfristige Entwicklung

Warum entstehen nach zahlreichen Partien neue Strategien, Situationen und Entdeckungen?

### F. Umsetzbarkeit

Wie lässt sich die entscheidende Spielerfahrung mit einem kleinen vollständigen Prototyp überprüfen?

**Spielerfantasie, Mechanik und Darstellung müssen gemeinsam entworfen werden.**

Vermeide den alten Ansatz:

Abstraktes System erfinden → Raster programmieren → UI hinzufügen → Farben ändern → auf Spielspass hoffen.

---

# 6. KREATIVES REVERSE ENGINEERING

Analysiere die zugrunde liegenden Designprinzipien erfolgreicher Spiele.

Geeignete Referenzen:

- RimWorld – emergente Geschichten und konkurrierende Bedürfnisse.
- Factorio – Automatisierung, Wechselwirkungen und Optimierung.
- Into the Breach – kleine Entscheidungen mit grosser Bedeutung.
- Slay the Spire – strategische Kombinationen und langfristige Risiken.
- Balatro – einfache Regeln mit überraschender Eskalation.
- Noita – experimentierbare Systeme.
- Kenshi – offene Entwicklung und systemische Konsequenzen.
- The Farmer Was Replaced – Beobachtung, Optimierung und verständliche Automatisierung.

Nutze ergänzend Erkenntnisse aus experimentellen Spielen, ungewöhnlichen Brettspielen, interaktiver Kunst, Industriedesign und anderen Disziplinen.

Kopiere keine konkreten Spiele.

Untersuche insbesondere:

1. Warum fühlt sich eine Handlung gut an?
2. Wie entstehen interessante Entscheidungen?
3. Welche Regeln erzeugen überraschende Konsequenzen?
4. Warum sind verschiedene Strategien sinnvoll?
5. Welche visuellen Merkmale vermitteln unmittelbar eine Identität?
6. Wie wird der Spieler mit zunehmender Erfahrung besser?
7. Warum bleibt das Spiel längerfristig interessant?

Entwickle drei radikal unterschiedliche Konzepte.

Jedes benötigt einen erkennbaren Gameplay-USP, eine eigene Spielerfantasie und einen visuellen USP.

Bewerte sie nach:

- Originalität
- Spielgefühl
- Strategischer Tiefe
- Visueller Eigenständigkeit
- Wiederspielpotenzial
- Technischer Machbarkeit
- Entwicklungsrisiko
- Potenzial für emergente Situationen

Wähle selbstständig das stärkste Konzept.

**Bevorzuge das überzeugendste realisierbare Erlebnis, nicht die technisch bequemste Idee.**

Begrenze die Konzeptphase. Dokumentiere die Entscheidung kurz und beginne danach mit einem echten spielbaren Erlebnisbeweis.

---

# 7. VERBINDLICHER ORIGINALITÄTSFILTER

Bevor das neue Konzept umgesetzt wird, unterziehe es einer kritischen Prüfung.

Prüffragen:

- Würde ein Screenshot sofort Neugier erzeugen?
- Ist die Kerninteraktion ungewöhnlich und verständlich?
- Gibt es einen klaren Grund, dieses Spiel statt eines etablierten Titels zu spielen?
- Besteht die Originalität aus der Spielerfahrung oder nur aus einem neuen Namen?
- Erzeugen die Regeln unterschiedliche Strategien?
- Gibt es nach der ersten Partie noch etwas zu entdecken?
- Entsteht Motivation aus dem Gameplay selbst?
- Kann das Konzept über zahlreiche Partien hinweg wachsen?
- Würde das Spiel auch ohne Metaprogression interessant bleiben?

Verwirf Konzepte, wenn sie überwiegend aus bekannten abstrakten Standardmustern bestehen und keinen eigenständigen Erlebniswert bieten.

Warnsignale:

- Beliebige farbige Kacheln.
- Generische Energie- oder Produktionsnetze.
- Einfache Verbindungspuzzles ohne weiterführende Tiefe.
- Zufällige Upgrades als hauptsächliche Motivation.
- Ressourcenoptimierung ohne faszinierenden Kontext.
- Ein-Minuten-Minispiele, die künstlich verlängert werden.
- Eine neue Grafik über einem austauschbaren Regelwerk.
- Technische Komplexität als Ersatz für spielerische Originalität.

Diese Muster sind nicht grundsätzlich verboten, müssen aber ihre Berechtigung beweisen.

**Originalität ist eine Designhypothese, die durch einen echten Erlebnisbeweis gestützt werden muss.**

---

# 8. ART DIRECTION – KEINE GENERISCHE KI-GRAFIK

Die bisherige wiederkehrende Schwäche unserer Spiele ist eine austauschbare, überladene Benutzeroberfläche.

Diese Schwäche ist von Beginn an als zentrales Entwicklungsrisiko zu behandeln.

## Vermeide typische KI-Prototyp-Gestaltung

- Dunkler Hintergrund mit leuchtenden Rechtecken.
- Standard-Dashboard mit Seitenleiste.
- Endlose Karten und Statuspanels.
- Dominierende Zahlenanzeigen.
- Generische Raster ohne räumliche Identität.
- Übermässige Neon- und Glow-Effekte.
- Beliebige geometrische Platzhalter.
- Unnötige Tooltips.
- Dekorative Animationen ohne Bedeutung.
- Austauschbare Icons und Buttons.
- Überladene Bildschirme mit geringer Spielfläche.

Diese Elemente dürfen vorkommen, wenn sie funktional und gestalterisch begründet sind. Sie dürfen nicht automatisch das Standarddesign bilden.

## Entwickle eine eigenständige visuelle Sprache

Bestimme bewusst:

- Bildkomposition.
- Formen und Silhouetten.
- Räumliche Darstellung.
- Materialität.
- Farbdramaturgie.
- Typografie.
- Animation.
- Interaktionsfeedback.
- Visuelle Hierarchie.
- Atmosphäre.

Entwickle einen wiedererkennbaren Stil, der aus der Spielerfantasie und den Spielregeln hervorgeht.

**Die Spielwelt selbst soll möglichst viel Information vermitteln.**

Verwende UI-Elemente dort, wo sie einen echten Nutzen besitzen.

Reduziere permanente Anzeigen auf das Wesentliche, ohne wichtige strategische Informationen zu verstecken.

Ein hochwertiger visueller Stil kann stilisiert, minimalistisch oder technisch einfach sein.

Er darf jedoch nicht beliebig oder unfertig wirken.

## Praktischer visueller Qualitätsnachweis

Nutze verfügbare Screenshot-, Browser- oder Renderwerkzeuge.

Prüfe:

- Komposition.
- Lesbarkeit.
- Verhältnis zwischen Spielwelt und UI.
- Sichtbare Interaktionen.
- Unterschiedliche Spielzustände.
- Kleine Fenstergrössen.
- Unnötige Elemente.
- Wiedererkennbarkeit.

Beurteile die tatsächliche Darstellung, nicht nur ihren Quellcode.

Wenn direkte Bildprüfung nicht möglich ist, kennzeichne den Nachweis als offen.

**Die visuelle Identität ist kein späteres Dekorationspaket. Sie ist Bestandteil des ersten spielbaren Erlebnisbeweises.**

---

# 9. GAMEPLAY – MEHR ALS EIN FÜNF-MINUTEN-EXPERIMENT

Der erste Prototyp soll klein sein.

Das langfristige Design darf jedoch nicht klein gedacht sein.

Unterscheide ausdrücklich:

**Kleiner Prototyp:** Wenige Funktionen, die den Kern beweisen.

**Kleines Spiel:** Wenige Möglichkeiten, die schnell ausgeschöpft sind.

Wir wollen das Erste, nicht das Zweite.

Entwickle ein Kernsystem, das langfristig wachsen kann durch:

- Neue strategische Situationen.
- Systemische Wechselwirkungen.
- Unterschiedliche Spielweisen.
- Neue Kombinationen bekannter Regeln.
- Spannende Zielkonflikte.
- Variierende Herausforderungen.
- Konsequenzen früherer Entscheidungen.
- Entdeckbare Zusammenhänge.

Vermeide künstliche Verlängerung durch Grind, inflationäre Freischaltungen oder zusätzliche Währungen.

## Strategische Entscheidungsqualität

Jede zentrale Handlung benötigt:

- Einen relevanten Nutzen.
- Einen Nachteil oder Opportunitätskosten.
- Nachvollziehbare Konsequenzen.
- Wechselwirkungen mit anderen Regeln.
- Bedeutung für zukünftige Entscheidungen.

Die beste Strategie soll von Situation, Zielen und verfügbaren Möglichkeiten abhängen.

Sorge für spannende Rückschläge, sinnvolle Erholungsmöglichkeiten und verständliche Herausforderungen.

---

# 10. P0 – DER KLEINSTE ÜBERZEUGENDE ERLEBNISBEWEIS

Entwickle zuerst einen vollständigen spielbaren Vertical Slice.

Dieser muss bereits die charakteristische Spielerfantasie, Kerninteraktion und visuelle Identität vermitteln.

Er benötigt:

1. Eine erkennbare Spielwelt.
2. Eine verständliche Spielsituation.
3. Eine befriedigende Kernhandlung.
4. Mindestens einen echten strategischen Konflikt.
5. Sichtbare und verständliche Konsequenzen.
6. Systemdruck oder konkurrierende Ziele.
7. Einen vollständigen kurzen Spielablauf.
8. Erfolg und Misserfolg.
9. Funktionierenden Neustart.
10. Eine bewusst gestaltete visuelle Präsentation.

Ziel ist ein kurzer Testausschnitt, nicht eine vollständige Kampagne.

**P0 beweist das Erlebnis, nicht den langfristigen Umfang.**

Vermeide aufwendige Metasysteme, bevor dieses Erlebnis funktioniert.

Ein startendes Fenster, grüne Tests oder eine schöne Konzeptgrafik genügen nicht.

Der Vertical Slice muss tatsächlich interaktiv und ausführbar sein.

---

# 11. ARCHITEKTUR UND IMPLEMENTIERUNG

Nutze die vorhandene technische Grundlage nur, wenn sie zum neuen Spiel passt.

Für den ersten Vertical Slice darf eine direkt im Browser spielbare Architektur verwendet werden.

Browsertechnologie ist eine Option, keine unumstössliche Vorgabe.

Entscheide nach:

- Spielmechanik.
- Visuellen Anforderungen.
- Performance.
- Testbarkeit.
- Wartbarkeit.
- Entwicklungsaufwand.
- Einfacher Ausführung.

Bevorzuge eine klare Trennung von Spielzustand, Regeln, Darstellung und Eingabeverarbeitung.

Implementiere:

- Robuste Zustandsübergänge.
- Verständliche Datenflüsse.
- Reproduzierbare Simulationen, wo sinnvoll.
- Sichere Eingabebehandlung.
- Zuverlässige Neustarts.
- Kleine, gezielte Tests.
- Einfache Startverfahren.

Vermeide überdimensionierte Frameworks, spekulative Erweiterungsschichten und unnötige Abhängigkeiten.

**Die Architektur soll das tatsächliche Spielerlebnis ermöglichen, nicht zum eigenständigen Grossprojekt werden.**

---

# 12. SPIELQUALITÄT UND ADVERSARIALE TESTS

Prüfe Ergebnisse aus vier Perspektiven.

## A. Technische Qualität

- Korrekte Regeln.
- Funktionierende Eingaben.
- Robuste Zustandsübergänge.
- Keine ungewollten Blockaden.
- Reproduzierbare Tests.
- Funktionierender Neustart.
- Keine bekannten Regressionen.

## B. Strategische Qualität

- Unterschiedliche sinnvolle Entscheidungen.
- Plausible Gegenstrategien.
- Wechselwirkungen.
- Verständliche Risiken.
- Keine dominanten Universalstrategien.
- Keine trivialen Exploits.

## C. Visuelle Qualität

- Wiedererkennbare Identität.
- Verständliche Komposition.
- Gutes Interaktionsfeedback.
- Lesbare Spielzustände.
- Keine unnötige UI-Überladung.
- Sichtbare Wirkung wichtiger Aktionen.

## D. Spielerlebnis

- Interessanter Einstieg.
- Befriedigende Kernhandlung.
- Spannende Entscheidungen.
- Überraschende Situationen.
- Lernbare Zusammenhänge.
- Potenzial für langfristige Motivation.

Unterscheide stets:

- Implementiert.
- Automatisch getestet.
- Praktisch ausgeführt.
- Subjektiv bewertet.
- Durch Menschen validiert.

Automatisierte Tests können Spielregeln, Stabilität und bestimmte strategische Eigenschaften überprüfen.

Sie beweisen nicht, dass Menschen das Spiel faszinierend finden.

Erfinde keine Playtests oder Bewertungen.

---

# 13. KONTINUIERLICHE VERBESSERUNG – KEIN FEATURE-BLOAT

Arbeite in kurzen Entwicklungszyklen:

**Ist-Zustand → wichtigste Hypothese → kleinste sinnvolle Änderung → realer Test → kritische Bewertung → Korrektur → Sicherung.**

Nach jedem funktionierenden Meilenstein:

1. Identifiziere die wichtigste belegte Schwäche.
2. Entscheide, welche Änderung den grössten Nutzen erwarten lässt.
3. Implementiere diese Änderung.
4. Teste nach Möglichkeit denselben Zustand vorher und nachher.
5. Überprüfe Nebenwirkungen.
6. Behalte Verbesserungen mit nachvollziehbarem Nutzen.
7. Sichere den Stand.
8. Setze die nächste Priorität um.

Suche während der gesamten Entwicklung nach unerwarteten Mechaniken, besseren Wechselwirkungen und ungewöhnlichen Lösungen.

Kreativität darf nicht nach der ersten Konzeptphase enden.

Füge keine neuen Systeme hinzu, um grundlegende Schwächen zu verstecken.

**Lieber eine aussergewöhnliche Kernmechanik mit zehn interessanten Verwendungsmöglichkeiten als zehn durchschnittliche Mechaniken.**

---

# 14. PRIORITÄTEN UND QUALITÄTSGATES

## P0 – IDENTITÄT UND ERLEBNISBEWEIS

Ein kleiner, vollständiger, spielbarer Vertical Slice mit eigener Spielerfantasie und visueller Identität.

## P1 – STRATEGISCHE SUBSTANZ

Mehrere sinnvolle Vorgehensweisen, Wechselwirkungen, Gegenstrategien und balancierte Herausforderungen.

## P2 – WIEDERSPIELWERT UND PRÄSENTATION

Interessante Variationen, bessere Animationen, klarere UX, audiovisuelle Identität und längerfristige Herausforderungen.

## P3 – PRODUKTREIFE

Stabilität, Performance, Zugänglichkeit, belastbare Builds und notwendige technische Bereinigung.

Keine Phase gilt als vollständig verifiziert, solange wesentliche Akzeptanzkriterien unbelegt bleiben.

Ein nicht bestandenes Gate verhindert nur abhängige Erweiterungen.

Es blockiert nicht die gesamte Entwicklung.

**Nach jedem Gate zuerst die grösste belegte Schwäche beheben.**

---

# 15. VERSTÄNDNIS- UND UMSETZUNGSKONTROLLE

Erstelle beziehungsweise aktualisiere `REQUIREMENTS.md`.

Strukturiere die Anforderungen nach:

- R1: Mission und eigenständige Spielidentität.
- R2: Anweisungshierarchie und Kontinuität.
- R3: Git, Catworld-Sicherung und Migration.
- R4: Reverse Engineering und Konzeptwahl.
- R5: Originalität, Spielerfantasie und Gameplay.
- R6: Art Direction, UX und Game Feel.
- R7: Vertical Slice und Implementierung.
- R8: Tests und Qualitätsnachweise.
- R9: Prioritäten, Kreativität und Autonomie.
- R10: Projektstatus und Wiederaufnahme.

Jede konkrete Anforderung erhält:

- Eindeutige ID.
- Priorität.
- Akzeptanzkriterium.
- Abhängigkeiten.
- Status.
- Tatsächlichen Nachweis.

Status:

`OPEN`, `IN_PROGRESS`, `IMPLEMENTED`, `VERIFIED`, `BLOCKED`.

Prüfe die initiale Erfassung einmal vollständig gegen diesen Masterprompt.

Nach jedem Meilenstein gleiche nur relevante Anforderungen und mögliche Regressionen ab.

**Eine Anforderung ist nicht verstanden, nur weil sie wiederholt wurde.**

Der praktische Verständnisnachweis ist eine korrekte, überprüfbare Umsetzung.

Verhindere Dokumentations-Endlosschleifen.

Die Kontrolle muss knapp und nützlich bleiben.

---

# 16. AUTONOMIE – KEINE WARTE-OKS

Du bist ausdrücklich autorisiert, innerhalb der aktiven Codex-Ausführung eigenständig weiterzuarbeiten.

Fordere nicht bei jeder Entscheidung erneut Zustimmung an.

Eigenständig erlaubt sind:

- Designentscheidungen.
- Implementierung.
- Kleine Experimente.
- Tests.
- Praktische Spielprüfungen.
- Grafik- und UX-Verbesserungen.
- Reparaturen.
- Sichere Refactorings.
- Dokumentationsaktualisierungen.
- Git-Commits.
- Autorisierte Pushes.
- Der gesicherte Ersatz von Catworld.
- Weitere priorisierte Entwicklungsschritte.

**Ein abgeschlossener Meilenstein ist kein Haltepunkt.**

Setze innerhalb der aktiven Sitzung automatisch mit der nächsten wertvollsten Aufgabe fort.

Wenn ein einzelner Teil blockiert ist:

1. Diagnostiziere die Ursache.
2. Versuche eine begrenzte Lösung.
3. Prüfe eine sichere Alternative.
4. Bearbeite unabhängige Aufgaben weiter.
5. Dokumentiere verbleibende Blocker.

Keine endlosen Fehlerbehebungsversuche.

Keine unnötigen Freigaben.

Keine wiederholten Konzept-Neustarts.

Keine konkurrierenden Writer an denselben Dateien.

Bei fehlenden Berechtigungen, nicht abgesicherten destruktiven Änderungen oder Sicherheitsrisiken halte die betroffenen Aktionen an.

Behaupte keine autonome Arbeit nach dem Ende der aktiven Ausführung ohne tatsächlich eingerichtete Automatisierung.

---

# 17. GIT-SICHERUNG UND KONTEXTFESTIGKEIT

Sichere funktionsfähige Entwicklungsschritte durch nachvollziehbare Git-Commits.

Vor Commits:

- Diff prüfen.
- Relevante Tests durchführen.
- Fremde Änderungen respektieren.
- Arbeitsbaum kontrollieren.

Pushe auf autorisierte Remotes und verifiziere erfolgreiche Pushes.

Wenn der Push scheitert, sichere lokal und bearbeite unabhängige Aufgaben weiter.

Halte `PROJECT_STATE.md` aktuell mit:

**VISION**
- Aktueller Spielname.
- Spielerfantasie.
- Gameplay-USP.
- Visueller USP.

**IMPLEMENTATION**
- Tatsächlich implementierte Funktionen.
- Aktueller Gameplay-Loop.
- Offene Aufgaben.

**VERIFICATION**
- Start- und Testbefehle.
- Tatsächlich durchgeführte Prüfungen.
- Offene Qualitätsnachweise.

**GIT**
- Aktueller Branch und Commit.
- Bestätigter Remote-Stand.
- Catworld-Archivierungsreferenzen.
- Gesicherter KIPPWERK-Checkpoint.

**NEXT**
- Wichtigste belegte Schwäche.
- Nächste konkrete Aktion.
- Lokale Blocker.

Bei Kontextgrenzen sichere den tatsächlichen Fortschritt und hinterlasse einen eindeutigen Fortsetzungspunkt.

Bei einer neuen Sitzung:

1. Diesen Masterprompt lesen, sofern verfügbar.
2. Projektstatus und Anforderungen lesen.
3. Repository-Zustand verifizieren.
4. Bereits erledigte Arbeit erkennen.
5. Beim wichtigsten offenen Punkt fortfahren.

**Keine erneute Konzeptentscheidung, wenn das aktuelle Konzept weiterhin tragfähig und bereits in Umsetzung ist.**

---

# 18. VERBINDLICHER AUSFÜHRUNGSAUFTRAG

Beginne jetzt.

## Schritt A – Zustand verifizieren

Prüfe das bestehende Catworld-Repository, die gemeldeten Sicherungen, den Branch `development/uncharted` und den aktuellen KIPPWERK-Stand.

Bewahre den bisherigen Projektfortschritt.

## Schritt B – Anweisungsversatz beseitigen

Aktualisiere `REQUIREMENTS.md` und `PROJECT_STATE.md`.

Kennzeichne frühere Catworld- und KIPPWERK-Ziele als historisch beziehungsweise ersetzt.

Bewahre deren technische Informationen, soweit sie nützlich sind.

Entferne keine fremden oder übergeordneten Anweisungen ohne Berechtigung.

## Schritt C – Neues Spielkonzept

Führe eine kurze, tiefgehende Designanalyse durch.

Entwickle drei deutlich unterschiedliche Spielerlebnisse.

Wähle das beste Konzept mit einer überzeugenden Kombination aus:

- Eigenständiger Spielerfantasie.
- Origineller Interaktion.
- Strategischer Tiefe.
- Visueller Identität.
- Langfristigem Potenzial.
- Realistischer Umsetzbarkeit.

## Schritt D – Sofortiger Erlebnisbeweis

Baue den kleinsten vollständigen interaktiven Vertical Slice.

Die Darstellung muss bereits eine bewusste gestalterische Identität besitzen.

Keine generische Dashboard-UI.

Keine blosse technische Simulation.

## Schritt E – Praktisch überprüfen

Starte das Spiel.

Prüfe den vollständigen Ablauf.

Untersuche Spielgefühl, Lesbarkeit, Entscheidungen, Schwierigkeit und technische Stabilität.

## Schritt F – Kritisch verbessern

Finde die grösste belegte Schwäche.

Verbessere sie durch eine kleine, überprüfbare Änderung.

Kontrolliere Regressionen.

## Schritt G – Sichern

Aktualisiere Anforderungen und Projektstatus.

Committe den funktionierenden Stand.

Verifiziere den autorisierten Push.

## Schritt H – Eigenständig fortsetzen

Wähle die nächste wertvollste ausführbare Aufgabe.

Arbeite ohne erneutes Okay weiter.

Wiederhole D–H, solange die aktive Ausführung und die vorhandenen Ressourcen es erlauben.

**Verliere keine Zeit durch wiederholtes Planen bereits getroffener Entscheidungen.**

---

# 19. ABSCHLIESSENDER RED-TEAM-CHECK

Hinterfrage regelmässig dein eigenes Ergebnis.

- Ist das wirklich ein eigenständiges Spiel?
- Oder nur ein bekanntes Minispiel mit anderem Namen?
- Würde ein Screenshot Interesse wecken?
- Ist die UI elegant oder erneut überladen?
- Ist die Kernhandlung befriedigend?
- Existieren echte strategische Entscheidungen?
- Entstehen unerwartete Situationen aus den Spielregeln?
- Würde das Spiel nach mehreren Partien noch interessieren?
- Sind zusätzliche Features wirklich notwendig?
- Haben Tests die behaupteten Eigenschaften tatsächlich überprüft?
- Ist der neue Entwicklungsstand sicher?
- Ist Catworld weiterhin wiederherstellbar?
- Gibt es widersprüchliche alte Anweisungen?
- Ist die nächste Aufgabe eindeutig?

Wenn eine Antwort nicht überzeugt, behebe die wichtigste konkrete Schwäche.

Vermeide, Schwächen mit mehr Code, mehr Systemen oder mehr Dokumentation zu verdecken.

---

# 20. ERGEBNIS UND ÜBERGABE

Berichte bei notwendigen Übergaben kurz und nachvollziehbar:

**SPIEL:** Was ist tatsächlich spielbar?

**ORIGINALITÄT:** Was unterscheidet das Erlebnis von bestehenden Spielen?

**VISUELLE IDENTITÄT:** Welche konkrete gestalterische Besonderheit wurde umgesetzt?

**GAMEPLAY:** Welche interessanten Entscheidungen und Wechselwirkungen existieren?

**QUALITÄT:** Was wurde praktisch überprüft, was nur technisch getestet?

**SCHWÄCHE:** Was ist das grösste verbleibende Problem?

**GIT:** Welcher Commit und welche Remote-Sicherungen sind bestätigt?

**NÄCHSTE PRIORITÄT:** Welche konkrete Verbesserung folgt?

Keine umfangreichen Tätigkeitsberichte statt tatsächlicher Entwicklung.

Keine erfundenen Ergebnisse.

---

# OBERSTE LEITLINIE

**THINK INDEPENDENTLY. CREATE BOLDLY. BUILD SOMETHING DISTINCTIVE. TEST REAL GAMEPLAY. REMOVE THE ORDINARY. IMPROVE WHAT MATTERS. SAVE EVERY VALUABLE STEP.**

**Erschaffe kein weiteres generisches KI-Spiel. Erschaffe eine Welt, die man entdecken möchte, eine Handlung, die sich besonders anfühlt, und ein strategisches System, das auch nach vielen Partien überrascht.**

**Nutze die bestehenden Git-Sicherungen. Vermeide Anweisungsversatz. Arbeite eigenständig. Entwickle das tatsächliche Spiel – nicht bloss den Plan dafür.**