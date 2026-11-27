# UDI – DIE EINFACHSTE KI-SUCHE STATT GOOGLE

## Mission

Entwickle UDI zu einer App, die Menschen für Recherchen und Kaufentscheidungen lieber öffnen als eine klassische Suchmaschine:

**Ein Wunsch. Eine Eingabe. Eine verständliche, KI-gestützte Antwort mit echten, überprüfbaren Ergebnissen.**

Der Nutzer soll nicht erst Modelle konfigurieren, API-Schlüssel suchen, mehrere Websites öffnen oder Antworten zwischen KI-Apps kopieren müssen. UDI übernimmt im Hintergrund so viel Arbeit wie technisch, rechtlich und wirtschaftlich sinnvoll – und zeigt vorne ein klares, vertrauenswürdiges Ergebnis.

Der USP verbindet:

1. **Einfache Suche in natürlicher Sprache**
2. **Intelligente Recherche und sinnvolle Lösungswege**
3. **Zusammenarbeit mit geeigneten KI-Modellen, wenn sie das Ergebnis messbar verbessert**
4. **Echte, aktuelle und nachvollziehbare Quellen und Angebote**
5. **Klare nächste Schritte statt einer langen Trefferliste**

Die Zusammenarbeit mit mehreren KI-Helfern bleibt ein wichtiger Teil des USP. Sie muss im Hintergrund funktionieren, soweit Anbieter und Plattformen es offiziell erlauben. Der Nutzer soll dafür nicht bei jeder Suche einen komplizierten Verbindungsablauf durchlaufen.

## Ausgangslage zuerst prüfen

Untersuche das vorhandene UDI-Projekt und die bisher getroffenen Entscheidungen, bevor du etwas neu konzipierst.

Prüfe insbesondere:

- Was bei Suche, Spracheingabe, Ergebnisdarstellung und KI heute wirklich funktioniert.
- Welche Datenquellen, Anbieter, Testdienste und Plattformfunktionen vorhanden sind.
- Welche offenen Fehler den Nutzer aktuell daran hindern, die App tatsächlich zu testen.
- Was auf Android und iOS bereits läuft und wo die Abläufe voneinander abweichen.
- Welche Such- und KI-Funktionen bislang nur geplant oder simuliert sind.

Nutze den vorhandenen isolierten Testdienst, sofern er im Projekt verfügbar ist. Richte nicht voreilig einen neuen HTTPS-Dienst, Hosting-Zugang, echte Anbieter-Konten oder kostenpflichtige Dienste ein. Erfinde weder vorhandene Funktionen noch Daten oder Freigaben.

## P0 – Das Nutzererlebnis radikal vereinfachen

Entwirf den idealen Alltagseinstieg:

- App öffnen und sofort suchen können.
- Wunsch eintippen oder – wenn zuverlässig verfügbar – diktieren.
- Keine Pflicht, zuerst einen KI-Anbieter auszuwählen oder zu verbinden.
- Keine API-Schlüssel, komplizierten Einstellungen oder unnötige Abfragen.
- Rückfragen nur, wenn eine wichtige Entscheidung ohne sie nicht möglich ist. Sonst sinnvolle Annahmen treffen und sichtbar machen.
- Ladezustand, Fortschritt, Fehler und fehlende Daten verständlich erklären.

Die erste Ansicht muss in Sekunden zeigen, welchen Nutzen UDI bringt. Die Ergebnisansicht soll zuerst eine kurze, brauchbare Antwort zeigen. Quellen, Details, Alternativen und Methodik dürfen bei Bedarf aufklappbar sein.

## P1 – UDI muss echte Recherche leisten

Prüfe, welche seriösen und erlaubten Quellen UDI für seine Zielmärkte tatsächlich abfragen kann. Unterscheide je nach Kategorie zwischen Produkten, Dienstleistungen, lokalen Angeboten, Tickets, Reisen und anderen Sucharten.

Für jedes Ergebnis, soweit die Daten verfügbar sind:

- aktuelle Quelle und Zeitpunkt der Prüfung
- Preis und relevante Zusatzkosten
- Lieferbarkeit oder tatsächliche Verfügbarkeit
- Gutscheinbedingungen und Einschränkungen
- kurze Begründung, weshalb das Ergebnis zum Wunsch passt
- direkte, nachvollziehbare Links
- klare Trennung zwischen bestätigten Fakten, KI-Einschätzungen und Unsicherheiten

Erfinde keine Angebote, Gutscheine, Preise, Händler oder Verfügbarkeiten. Verwende keine geschützten oder nicht autorisierten Zugänge und behaupte nicht, UDI durchsuche „das ganze Internet“, wenn die Quellenabdeckung das nicht belegt.

Wenn eine Quelle fehlt, nicht erreichbar oder veraltet ist, sage das klar und biete den besten verfügbaren nächsten Schritt. Entwickle nicht zuerst eine universelle Suchmaschine für alle Kategorien. Bestimme die wertvollsten Suchfälle, die UDI mit vorhandenen Daten zuverlässig abdecken kann, und erweitere die Abdeckung planvoll.

## P2 – KI im Hintergrund sinnvoll einsetzen

UDI soll den Auftrag zunächst selbst verstehen und passende Arbeitsschritte wählen. Entscheide anhand des tatsächlichen Nutzens:

- Einfacher Auftrag: möglichst wenige passende Modell- und Suchschritte.
- Komplexer oder folgenreicher Auftrag: zusätzliche Prüfung oder ein zweites Modell nur, wenn es Qualität oder Verlässlichkeit erkennbar verbessert.
- Uneinige Modelle: Unterschiede prüfen und offen darstellen, nicht künstlich eine Einigkeit behaupten.
- KI-Ergebnis: immer mit verfügbaren Quellen und realen Daten abgleichen.
- Keine endlosen Modellketten, doppelten Suchläufe oder unnötigen Wiederholungen.

Vergleiche geeignete Architekturen: UDI-eigener geschützter KI-Dienst, offizielle Anbieterintegrationen, nutzereigene Anbieterzugänge und plattformvermittelte Übergaben. Prüfe aktuelle offizielle Dokumentation und Abrechnungsbedingungen. Ein ChatGPT-, Claude- oder Gemini-Verbraucher-Abo darf nicht als API-Zugang vorausgesetzt werden.

Wähle den Weg, der für Nutzer am einfachsten, zuverlässigsten, sichersten und finanzierbarsten ist. Eine externe KI-App darf nur dann direkt verbunden werden, wenn das offiziell unterstützt wird. Eine reine „Teilen“-Funktion darf nicht als nahtlose KI-Zusammenarbeit verkauft werden.

Externe KI-Übergaben bleiben eine optionale Erweiterung für Nutzer, die sie ausdrücklich wollen. Sie dürfen die normale UDI-Suche nicht blockieren oder unnötig komplizieren.

## P3 – Keine versteckten oder unerwarteten Kosten

Erstelle vor jeder kostenwirksamen Architekturentscheidung ein realistisches Kostenmodell für:

- durchschnittliche und aufwendige Suche
- Web- oder Produktdatenquellen
- ein oder mehrere Modellaufrufe
- Spracheingabe und weitere Medien
- erwartete Nutzung pro aktivem Konto
- Betrieb, Missbrauchsschutz und Wachstum

Prüfe ausdrücklich, ob ein Abo im Zielbereich von etwa 3–4 CHF pro Monat tragfähig wäre. Erfinde keinen Preis und verspreche keine unbegrenzte Nutzung, bevor die Rechnung belastbar ist.

Produktregeln:

- Keine nutzerseitigen API-Kosten ohne vorherige klare Zustimmung.
- Keine automatische Weiterleitung an separat verrechnete KI-Anbieter.
- Keine API-Schlüssel als Voraussetzung für die normale Suche.
- Kein stilles Überschreiten eines enthaltenen Nutzungsrahmens.
- Keine nachträglichen Überraschungsgebühren.
- Zeige Preis, enthaltene Nutzung, Grenzen und Kündigung vor dem Kauf verständlich an.
- Wenn ein Limit erreicht ist: verständlicher Hinweis und klare Optionen; keine automatische kostenpflichtige Fortsetzung.

Kann UDI eine gewünschte Qualität zu einem einfachen, transparenten Preis nicht finanzieren, optimiere die Architektur oder reduziere unnötige Modellaufrufe. Verschleiere die Grenze nicht.

## P4 – USP konkret beweisen

Erstelle eine kurze Vergleichsmatrix für einige typische Suchaufgaben:

- Was würde ein Nutzer normalerweise selbst über eine klassische Suche erledigen?
- Welche Schritte übernimmt UDI tatsächlich?
- Was ist dadurch schneller, verständlicher oder verlässlicher?
- Welche Aussage kann UDI mit dem aktuellen Produktstand belegen?
- Was ist noch Zukunftsversprechen?

Wähle einen zentralen Suchablauf als ersten vollständigen Beweis des USP. Der Ablauf muss eine echte Nutzerfrage verarbeiten, verfügbare Quellen nutzen, ein nachvollziehbares Ergebnis erzeugen und auf Android und iOS möglichst gleich funktionieren.

Das Ziel ist nicht, Google pauschal in jeder Suchart zu übertreffen. Das Ziel ist, bei den ausgewählten Suchfällen die mühsame Eigenrecherche spürbar zu reduzieren und eine bessere Entscheidung zu ermöglichen.

## P5 – Design und Bedienung

Gestalte UDI als eigenständiges, vertrauenswürdiges Produkt, nicht als generisches Chatfenster und nicht als gewöhnliche Trefferliste.

Achte auf:

- eine sofort erkennbare Eingabe und klare Hauptaktion
- kurze Antwort zuerst, Belege und Details bei Bedarf
- verständliche Unterschiede zwischen Empfehlung, Fakt und Unsicherheit
- klare Ergebnisse ohne überladene Karten oder unnötige Fachbegriffe
- barrierearme Lesbarkeit, sinnvolle Touch-Ziele und robuste deutsche/englische Texte
- konsistente Umsetzung auf Android und iOS
- ehrliche Zustände für Suche, Fehler, leere Ergebnisse und nicht verfügbare Quellen

## P6 – Autonom arbeiten und kontinuierlich sichern

Arbeite an sicheren, reversiblen Aufgaben selbstständig weiter und warte nicht auf unnötige Freigaben.

- Prüfe `git status` und vorhandene Änderungen vor dem Bearbeiten.
- Überschreibe oder stage keine unbeteiligten Änderungen.
- Sichere den Ausgangsstand vor riskanten Umbauten.
- Speichere nach jedem abgeschlossenen Meilenstein.
- Erstelle bei vorhandenem Git sinnvolle lokale Checkpoints/Commits und stage nur die eigenen Änderungen.
- Push nur, wenn dies bereits autorisiert ist und das Ziel verifiziert wurde.
- Bei einem Blocker höchstens drei gezielte Lösungsversuche. Danach Ursache dokumentieren, beste sichere Alternative wählen und unabhängige Arbeit fortsetzen.
- Keine Sicherheitsmechanismen, Anbieterregeln oder Zugangsbeschränkungen umgehen.
- Keine Erfolgsmeldung ohne tatsächlichen Nachweis.

## P7 – Prüfen, was Nutzer wirklich erleben

Prüfe den vollständigen Ablauf auf Android und iOS, soweit die vorhandene Umgebung es zulässt:

- App öffnen und sofort suchen
- natürliche Sprache und vorhandene Spracheingabe
- einfache und komplexere Suchanfragen
- echte Quellen und nicht verfügbare Quellen
- kein externer KI-Helfer verbunden
- optionale KI-Zusammenarbeit, sofern implementiert
- Lade-, Fehler-, Offline- und leere Zustände
- Preis- und Nutzungsgrenzen
- Deutsch/Englisch, kleine Bildschirme, Tastatur und Barrierefreiheit
- keine unbeabsichtigte Datenweitergabe oder Kosten

Prüfe vorhandene Tests und ergänze gezielte Tests für tatsächlich geänderte Abläufe. Ein grüner Build oder eine schöne Vorschau beweist weder echte Suche noch gute Nutzerfreundlichkeit. Trenne klar zwischen implementiert, automatisch getestet und praktisch auf Gerät oder Vorschau verifiziert.

## Abschlussbericht

Berichte knapp und belegt:

- Was der Nutzer jetzt mit UDI einfacher erledigen kann.
- Welcher Suchfall den USP am besten beweist.
- Welche Quellen und KI-Schritte tatsächlich verwendet werden.
- Wie die App ohne externe KI-Verbindung funktioniert.
- Welche Kosten und Nutzungsgrenzen für den Nutzer gelten würden.
- Was auf Android und iOS praktisch geprüft wurde.
- Welche Lücken oder Zugänge noch für einen echten Pilot fehlen.
- Was als Nächstes den grössten realen Nutzwert schafft.

## Oberste Leitlinie

**Der Nutzer soll UDI öffnen, seinen Wunsch einmal äussern und eine hilfreiche, überprüfbare Antwort erhalten. Die Komplexität gehört in die Technik – nicht in Einrichtung, Bedienung, versteckte Kosten oder leere Versprechen.**