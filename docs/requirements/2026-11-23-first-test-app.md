# MASTERPROMPT – UDI ZUR ERSTEN TESTAPP BRINGEN

## Deine Verantwortung

Handle mit der Verantwortung eines **CEO und Lead Developers**: Entscheide selbstständig, was UDI jetzt zum besten und am zuverlässigsten testbaren Produkt macht. Verstehe den bestehenden Projektstand, schütze funktionierende Arbeit und entwickle UDI konsequent weiter.

Arbeite kreativ und denke über Standardsuche, gewöhnliche Preisvergleiche und offensichtliche Lösungen hinaus. Baue aber nichts ein, das für den Nutzer keinen echten Mehrwert bringt oder nicht zuverlässig geprüft werden kann.

**Ziel ist die erste vollständige, praktisch testbare UDI-App für Android und iOS** – einschliesslich eines klaren Bewertungsbogens, mit dem sich Produktnutzen, Bedienbarkeit und Zuverlässigkeit beurteilen lassen.

„Fehlerfrei“ bedeutet: keine bekannten kritischen Fehler, keine vorgetäuschten Funktionen und keine offenen P0-Blocker. Behaupte keine absolute Fehlerfreiheit. Belege stattdessen, was tatsächlich gebaut, geprüft und praktisch verifiziert wurde.

## Produktkern

UDI soll dem Nutzer nicht einfach Suchergebnisse zeigen. Es soll sein Ziel verstehen und einen **besseren, belegbaren Weg** dorthin finden.

Der Nutzer beschreibt in Alltagssprache, was er erreichen will. UDI sucht daraufhin nach:

- passenden direkten Treffern und echten Preis-Leistungs-Alternativen;
- anderen Produktnamen, Marken, Modellnummern oder Bezugsquellen;
- Bundles, Outlet, B-Ware, geprüfter Gebrauchtware oder lokalen Angeboten, sofern passend;
- bestätigten Gutscheinen und relevanten Rabattmöglichkeiten;
- dem tatsächlichen Gesamtpreis einschliesslich Versand und bekannter Zusatzkosten.

UDI muss kreativ suchen und kritisch prüfen. Es darf keine Preise, Händler, Gutscheine, Verfügbarkeiten oder Fähigkeiten erfinden.

**USP:** *Der Nutzer beschreibt sein Ziel. UDI findet den besten belegbaren Weg dorthin – auch wenn dieser nicht der naheliegende Suchtreffer ist.*

## P0 – Ist-Zustand und grösste Lücken

Prüfe zuerst das echte Repository und die aktuelle App:

- vorhandene Plattformen, Builds, Tests und laufende Abläufe;
- Suchfunktion, Datenquellen und Angebotsdienst;
- Gutscheinlogik, Links und Ergebnisdarstellung;
- Android- und iOS-Implementierung;
- bekannte Fehler, Sicherheitsrisiken und externe Blocker;
- vorhandene Design- und Architekturentscheidungen.

Verifiziere frühere Statusangaben, statt sie ungeprüft zu übernehmen. Erhalte funktionierende Arbeit. Vermeide unnötige Neuentwicklung und Feature-Bloat.

Finde den **kleinsten vollständigen Produktablauf**, der den UDI-Nutzen realistisch demonstriert. Priorisiere diesen Ablauf vor weiteren Funktionen.

## P0 – Den zentralen Ablauf fertigstellen

Baue den Hauptablauf von der Eingabe bis zur überprüfbaren Empfehlung:

1. Nutzer beschreibt ein Ziel in Alltagssprache.
2. UDI versteht die Absicht und fragt nur nach, wenn eine fehlende Angabe das Ergebnis wesentlich verändert.
3. UDI sucht echte Angebote und prüft passende alternative Wege.
4. Ergebnisse zeigen Gesamtpreis, Händler, Verfügbarkeit, Quelle und Prüfzeitpunkt, soweit diese Angaben zugänglich sind.
5. Gutscheine werden nur als Ersparnis angerechnet, wenn ihre Bedingungen ausreichend geprüft sind.
6. UDI empfiehlt knapp den besten belegbaren Weg und erklärt den entscheidenden Grund.
7. Direkte Links führen zum passenden Angebot.

Zeige Unsicherheit offen. Wenn Live-Daten oder Gutscheinprüfung nicht verfügbar sind, stelle Testdaten eindeutig als Testdaten dar und behaupte nicht, dass die Kernfunktion live arbeitet.

## P0 – Erste Testversion für beide Plattformen

Bereite eine praktisch testbare Android- und iOS-Version vor. Die Plattformen müssen gleichwertig behandelt werden.

- Baue die App mit den vorhandenen Projektwerkzeugen.
- Installiere und starte sie auf Emulator oder Simulator, soweit in der Umgebung möglich.
- Prüfe den tatsächlichen Hauptablauf auf beiden Plattformen.
- Kontrolliere Layout, Lesbarkeit, Navigation, Ladezustände, leere Ergebnisse und Fehlerzustände.
- Behebe die wichtigsten sichtbaren und funktionalen Fehler vor der Übergabe.
- Erstelle die verfügbaren Testpakete und lege sie an einem klar benannten, zugänglichen Ort ab.
- Nenne exakt, welche Datei auf welchem Gerät oder Simulator getestet werden kann.

Wenn eine signierte iOS-Installationsdatei oder ein echter Gerätebuild mangels Zertifikat, Apple-Zugang oder Hardware nicht erstellt werden kann, benenne den konkreten Grund. Liefere trotzdem den bestmöglichen Simulator-Build und klare Installationsschritte. Gib niemals vor, ein Paket sei installierbar, wenn es nicht verifiziert wurde.

Die App wird nicht veröffentlicht. Löse keine Kosten aus und ändere keine produktiven Dienste ohne vorhandene Berechtigung.

## P0 – Echtheit, Sicherheit und Blocker

Untersuche vorhandene Dienste und Zugänge gründlich. Löse lokale und unabhängige Blocker selbstständig, soweit es ohne neue Berechtigungen oder Kosten möglich ist.

- Nutze keine simulierten Treffer als angeblich aktuelle Angebote.
- Prüfe Händlerlinks und Gutscheinbedingungen, soweit technisch möglich.
- Schütze Zugangsdaten und Nutzerdaten; gib keine Geheimnisse in Logs, UI oder Commits aus.
- Wenn Hosting, API-Zugang oder Berechtigungen fehlen, dokumentiere genau, was fehlt und welche Funktion dadurch eingeschränkt bleibt.
- Arbeite an unabhängigen Aufgaben weiter, statt wegen eines einzelnen Blockers die gesamte Umsetzung anzuhalten.
- Erzeuge keine externe Abhängigkeit, die nur durch eine nicht autorisierte Zahlung oder Veröffentlichung funktioniert.

## P1 – Qualität und Stabilität

Prüfe den vollständigen Ablauf unter realistischen und fehlerhaften Bedingungen:

- langsame oder fehlende Verbindung;
- leere, doppelte oder widersprüchliche Ergebnisse;
- abgelaufene oder nicht anwendbare Gutscheine;
- falsche Produktvarianten oder unvollständige Preise;
- nicht erreichbare Händlerlinks;
- Wechsel zwischen Sprachen, Markt, Lieferland und Währung;
- App-Neustart und Wiederaufnahme eines Suchvorgangs;
- verständliche Fehler- und Ladezustände.

Nutze vorhandene Tests und ergänze gezielte Prüfungen für kritische Fehler. Führe keine Tests als bestanden auf, die nicht tatsächlich gelaufen sind. Prüfe zusätzlich mindestens einen kompletten Nutzerablauf praktisch auf Android und iOS, soweit die Umgebung dies erlaubt.

## Bewertungsbogen für den ersten Test

Erstelle einen direkt nutzbaren Bewertungsbogen als Markdown-Datei im Projekt. Er soll von einer Testperson ohne technisches Vorwissen ausgefüllt werden können.

Bewerte jede Aussage von **1 = trifft gar nicht zu** bis **5 = trifft völlig zu**:

1. Ich habe sofort verstanden, was UDI für mich tut.
2. Ich konnte mein Ziel einfach beschreiben.
3. UDI hat verstanden, was ich wirklich gesucht habe.
4. Die Ergebnisse waren für mein Ziel relevant.
5. UDI hat eine sinnvolle Alternative oder einen überraschenden Suchweg gefunden.
6. Preise, Versand und mögliche Ersparnisse waren verständlich.
7. Ich konnte erkennen, was tatsächlich geprüft wurde.
8. Ich hatte Vertrauen in die Empfehlung.
9. Ich konnte das passende Angebot über den Link erreichen.
10. UDI war einfacher und hilfreicher als meine übliche Suche.
11. Ich würde UDI bei einer ähnlichen Suche wieder verwenden.

Zusätzlich freie Felder für:

- Was war am hilfreichsten?
- Was war unklar, falsch oder nicht vertrauenswürdig?
- Welches Ergebnis hat überrascht?
- An welchem Punkt hättest du die App beinahe geschlossen?
- Was müsste UDI als Nächstes verbessern?

Ergänze einen kurzen technischen Prüfteil mit Gerät/Plattform, App-Version, Testdatum, getesteten Hauptabläufen und bekannten Einschränkungen. Verwende keine erfundenen Nutzerbewertungen.

## Abnahmekriterien

Die erste Testversion ist erst übergabebereit, wenn:

- der zentrale UDI-Ablauf auf Android und iOS gebaut und tatsächlich gestartet wurde, soweit die Umgebung das erlaubt;
- der Hauptnutzen an einem realistischen Beispiel demonstriert wird;
- Quellen, Prüfzeitpunkt und Unsicherheit nachvollziehbar sind;
- keine kritischen Fehler oder irreführenden Testdaten bekannt sind;
- die Testpakete und Installationshinweise eindeutig bezeichnet sind;
- der Bewertungsbogen im Projekt enthalten ist;
- verbleibende Einschränkungen offen und konkret dokumentiert sind.

Ein nicht verfügbarer externer Zugang darf als Blocker dokumentiert werden, aber nicht als erledigte Funktion gelten.

## Arbeitsweise

Arbeite autonom, priorisiere nach Nutzwert und löse auftretende Probleme systematisch. Nach jedem wichtigen Schritt prüfst du zuerst die grösste belegte Schwäche und korrigierst sie, bevor du weitere Funktionen ergänzt.

Sichere Änderungen nachvollziehbar. Erstelle keine Remote-Pushes, Veröffentlichungen oder kostenpflichtigen Dienste, sofern sie nicht bereits ausdrücklich autorisiert sind.

## Übergabe

Berichte am Ende kurz und konkret:

- Was wurde umgesetzt?
- Welche Android- und iOS-Builds wurden erstellt?
- Was wurde auf welcher Plattform praktisch gestartet und geprüft?
- Welche Tests liefen und mit welchem Ergebnis?
- Wo liegen Testpakete, Installationshinweise und Bewertungsbogen?
- Was ist noch blockiert oder nicht verifiziert?
- Was ist der nächste sinnvollste Schritt?

Trenne klar zwischen **gebaut**, **automatisch geprüft**, **praktisch verifiziert** und **noch offen**.

## Oberste Leitlinie

**Liefere eine kleine, echte und überprüfbare UDI-Testapp, die einen überraschend guten Suchweg findet – und belege ehrlich, wie gut sie das bereits kann.**