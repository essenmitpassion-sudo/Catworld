# MASTERPROMPT – UDI: MARKE, USP, UI UND BEDIENUNG

## Auftrag

Arbeite direkt im bestehenden UDI-Projekt. Übernimm Verantwortung für Produktqualität, Nutzerführung und Umsetzung. Verbessere die App Schritt für Schritt so, dass neue und erfahrene Nutzer schnell verstehen:

1. Was UDI für sie erledigt.
2. Was sie eingeben können.
3. Warum die angezeigten Vorschläge passen.
4. Was sie als Nächstes tun können.

Untersuche zuerst den vorhandenen Code, die Screens, Dokumentation, Tests und den Git-Stand. Entwickle die bestehende App weiter. Starte keinen unbegründeten Komplettumbau und entferne keine funktionierenden Funktionen ohne klaren Grund.

Arbeite selbstständig. Stelle Rückfragen nur, wenn eine kritische Entscheidung, Berechtigung oder ein nicht sicher lösbarer Blocker vorliegt. Ein Blocker bei einem Teilbereich darf unabhängige Arbeit nicht stoppen.

---

## 1. Produktidee und Zielgruppe

UDI hilft Menschen, aus einem Wunsch oder Ziel passende Produkte, Angebote und mögliche Alternativen zu finden.

Die Eingabe muss nicht der genaue Produktname sein. Nutzer sollen beschreiben können, **was sie erreichen möchten** – zum Beispiel:

> „Ich brauche 2 TB zusätzlichen Speicher für meinen PC, maximal CHF 200.“

UDI soll daraus erkennbare Suchkriterien ableiten, passende Möglichkeiten suchen und transparent zeigen, weshalb die Treffer infrage kommen.

Die App ist für Menschen gedacht, die keine KI-Fachbegriffe kennen und keine langen Formulare ausfüllen möchten. Die Bedienung muss für unterschiedliche Altersgruppen, Sprachkenntnisse und Geräte sicher verständlich sein.

---

## 2. USP: Hypothese prüfen und konkret machen

### Zu prüfende USP-Hypothese

**UDI beginnt beim Bedarf der Person, nicht bei einem bekannten Produktnamen.** Die App versteht das Ziel hinter der Anfrage, sucht passende Optionen und kann – wenn Datenquellen und Funktionen es tatsächlich ermöglichen – auch sinnvolle Alternativen zeigen, wenn kein exakter Treffer verfügbar ist.

Der mögliche Unterschied liegt in der zusammenhängenden Nutzerreise:

**Wunsch beschreiben → Kriterien verstehen → passende Optionen finden → Unterschiede nachvollziehen → nächsten Schritt wählen.**

Prüfe diese Hypothese vor der Umsetzung anhand realer Suchbeispiele und aktueller Vergleichsprodukte. Untersuche, was andere Apps tatsächlich anbieten. Behaupte nicht, UDI sei „einzigartig“, „finde alles“ oder anderen überlegen, wenn das nicht belegt ist.

### Gestalte den USP in der App sichtbar

- Nutzer können ihr Ziel in eigenen Worten beschreiben.
- Erkannte Kriterien werden verständlich angezeigt und – soweit sinnvoll – editierbar gemacht.
- Ergebnisse erklären knapp, **warum** sie passen und welche Einschränkungen bekannt sind.
- Alternativen werden klar als Alternativen gekennzeichnet.
- Preis, Lieferkosten, Gutschein, Verfügbarkeit, Quelle und Aktualität werden nur angezeigt, wenn sie belastbar vorliegen.
- Wenn die Suche nichts Verlässliches findet, erklärt UDI den Grund und schlägt einen konkreten nächsten Suchweg vor.
- UDI darf keine Ergebnisse, Preise, Gutscheine, Verfügbarkeiten oder Quellen erfinden.

Wenn ein Teil des USP technisch noch nicht möglich ist, kennzeichne ihn als offen. Baue keine Attrappe, die wie eine echte Live-Suche wirkt.

---

## 3. Markenführung

### Arbeitsmarke

**Markenname:** `udi.`  
**International verständliche Funktionszeile:** `Find what you need.`  
**Produktbeschreibung für Stores und erste Nutzung:** `Smart product search`  
**Deutsche Funktionszeile:** `Produkt- und Angebotssuche`

Der kurze Markenname erklärt allein nicht die Funktion. Deshalb muss die Funktionszeile dort erscheinen, wo neue Nutzer UDI zum ersten Mal sehen. Verwende keine erfundene Bedeutung für „UDI“ und erfinde keine komplizierten Namensableitungen.

### Tonalität

UDI klingt klar, ruhig, hilfsbereit und kompetent. Schreibe wie ein guter Berater, nicht wie Werbung.

Bevorzugte Botschaften:

- Deutsch: **„Sag uns, was du brauchst. UDI sucht passende Optionen.“**
- Englisch: **“Tell UDI what you need. It finds relevant options.”**
- Optionaler Marken-Claim: **“Search beyond the obvious.”**

Der Claim darf nie den Funktionshinweis ersetzen. Versprich keine umfassende Suche über „das ganze Internet“, solange die verfügbaren Quellen das nicht tragen. Übersetze den Sinn natürlich in jede unterstützte Sprache, statt englische Sätze wortwörtlich zu übertragen.

---

## 4. Logo und visuelle Identität

Nutze das bestehende Logo als Ausgangspunkt und verbessere es gestalterisch. Die Arbeitsrichtung:

- Wortmarke `udi.` in Kleinbuchstaben: freundlich, klar und auch klein lesbar.
- App-Symbol: eine einfache Lupe, deren Innenraum in einen offenen Suchweg übergeht, der zu einem Fundpunkt führt.
- Dunkles Petrol oder tiefes Grün als vertrauenswürdige Grundfarbe, warmes Weiss als ruhige Fläche und ein sparsamer heller Akzent am Fundpunkt.
- Das Symbol muss als App-Icon, in der Navigation und in kleiner Darstellung funktionieren.
- Erstelle Varianten für hellen und dunklen Hintergrund sowie eine einfarbige Version.
- Verwende keine dekorativen Elemente ohne Produktfunktion.

Prüfe das Logo in realer UI-Grösse. Wenn die Symbolidee bei 24–32 px unklar wird, vereinfache sie.

---

## 5. UI und Nutzerführung

Gestalte die App modern, aufgeräumt und vertrauenswürdig. Die Oberfläche soll Nutzern helfen, ihre Suche abzuschliessen – nicht mit Karten, Erklärungen und Optionen konkurrieren.

### Start und Suche

- Der erste Bildschirm erklärt in einem kurzen Satz, was UDI macht.
- Ein gut sichtbares Eingabefeld lädt zur freien Beschreibung des Wunsches ein.
- Beispielanfragen zeigen verschiedene verständliche Anwendungsfälle.
- Die Tastatur öffnet sich erst, wenn der Nutzer das Eingabefeld antippt. Kein unerwarteter Autofokus.
- Ein klarer Hauptbutton startet die Suche. Zusatzkriterien bleiben optional und treten visuell zurück.
- Gespeicherte Suchen sind erreichbar, aber verdrängen die zentrale Suche nicht.

### Ergebnisse

Jedes Ergebnis beantwortet möglichst schnell:

- Was ist es?
- Warum passt es zum Wunsch?
- Was kostet es insgesamt, soweit bekannt?
- Woher stammt die Information und wie aktuell ist sie?
- Welche Einschränkung oder Unsicherheit besteht?

Unterscheide visuell zwischen genauem Treffer, ähnlichem Produkt und Alternative. Verstecke Unsicherheit nicht in Kleingedrucktem.

### Leere, Lade- und Fehlerzustände

Gestalte diese Zustände als Teil des Produkts:

- Suche läuft: verständliche Rückmeldung, keine endlose Animation.
- Keine Treffer: hilfreicher nächster Schritt statt leerer Seite.
- Datenquelle nicht erreichbar: transparent anzeigen und gegebenenfalls andere verfügbare Quellen weiter nutzen.
- Live-Angebote noch nicht verfügbar: klar und ehrlich kennzeichnen; niemals Beispieldaten als aktuelle Angebote ausgeben.

---

## 6. Mobile Bedienung und Tastatur: P0

Untersuche besonders den vollständigen Suchablauf auf iOS und Android. Die Tastatur darf die Eingabe, den Hauptbutton oder den nächsten Schritt nicht verdecken.

Prüfe und behebe mindestens:

- korrektes Verhalten bei eingeblendeter und ausgeblendeter Tastatur;
- Scrollen des Eingabefelds in den sichtbaren Bereich;
- Berücksichtigung von Safe Areas, Tastaturhöhe und unteren Navigationsleisten;
- kein abgeschnittener Text und kein verdeckter Suchbutton;
- passende Tastaturart für Text, Preis und Zahlen;
- sinnvolles Verhalten der Enter-/Suchen-Taste;
- Tastatur schliesst oder reduziert sich nach dem Absenden passend;
- Nutzer können ihre Eingabe während der Suche weiterhin bearbeiten;
- Fokus, Kontrast und Touch-Flächen sind auf beiden Plattformen brauchbar.

Entferne Funktionen nicht nur, weil sie Platz beanspruchen. Prüfe zuerst, ob sie für den aktuellen Schritt nötig sind und ob sie sich einfacher oder später anbieten lassen.

---

## 7. Internationalisierung und Vertrauen

Prüfe die bestehende Trennung von Sprache, Markt, Lieferland und Währung. Bewahre sie und erweitere sie nur, wenn die bestehende Architektur es erfordert.

- Sprache, Markt, Lieferland und Währung sind getrennte Einstellungen.
- Sprache darf nicht automatisch Lieferland oder Währung ändern.
- Starte mit den im Projekt tatsächlich unterstützten Märkten und Sprachen.
- Zeige lokale Preise und Versandkosten nur für den entsprechenden Markt.
- Verwende einheitliche, verständliche Begriffe in Navigation, Suche, Ergebnissen und Fehlermeldungen.
- Behandle Datenschutz, Datenquellen, Affiliate-Hinweise und Aktualität transparent.
- Mache keine Vertrauensversprechen, die durch den Produktablauf nicht eingehalten werden.

---

## 8. Priorisierte Umsetzung

### P0 – Ist-Zustand und Risiken

1. Lies Projektdokumentation und aktuelle Markenentscheidungen.
2. Prüfe Repository, Plattformen, laufende Funktionen, vorhandene Tests und Git-Änderungen.
3. Führe die App auf Android und iOS durch den Suchablauf.
4. Dokumentiere kurz: Was funktioniert? Was ist nur Mock oder Platzhalter? Was ist offen?
5. Vergleiche die USP-Hypothese mit aktuellen Wettbewerbsfunktionen anhand konkreter Beispiele.
6. Sichere vorhandene Nutzeränderungen und beginne keine Arbeiten, die sie überschreiben könnten.

**Ergebnis:** Priorisierte Befundliste mit Belegen, Risiken und dem kleinsten sinnvollen nächsten Schritt.

### P1 – Wichtigster vollständiger Nutzungsablauf

Verbessere zuerst den Weg von der Eingabe bis zum Verständnis der Ergebnisse:

1. Wunsch eingeben.
2. Erkannte Suchkriterien prüfen oder anpassen.
3. Suche starten.
4. Ergebnisse und Alternativen verstehen.
5. Ergebnis öffnen oder Suche sinnvoll verfeinern.

Behebe zuerst die grösste belegte Schwäche dieses Ablaufs. Ergänze keine Nebenfunktionen, bevor der Kernweg verständlich und bedienbar ist.

### P2 – Marke und UI-System

- Setze `udi.` und die Funktionszeile konsistent in den relevanten Bereichen um.
- Vereinheitliche Farben, Schrift, Abstände, Buttons, Karten, Icons und Zustände.
- Entferne visuelle Wiederholungen und unnötige UI-Elemente.
- Bewahre die bestehende Gestaltung, wenn sie funktioniert; ändere sie nur mit nachvollziehbarem Nutzen.

### P3 – Suche, Verfügbarkeit und Ausbau

- Prüfe den aktuellen Stand des gemeinsamen Angebotsdienstes und der Datenquellen.
- Implementiere nur Funktionen, für die im Projekt eine reale technische Grundlage besteht.
- Falls Zugang, Schlüssel oder Hosting blockieren: Ursache genau dokumentieren und alle unabhängigen Aufgaben fortsetzen.
- Keine Schutzmechanismen umgehen, keine Kosten auslösen und nichts veröffentlichen.

### P4 – Qualitätsnachweis und Sicherung

Prüfe den überarbeiteten Ablauf auf beiden Plattformen, passend zur vorhandenen Projektstruktur. Nutze automatisierte Prüfungen und reale Geräte- oder Emulatorabläufe, wenn verfügbar. Prüfe insbesondere Suche, Tastatur, leere Ergebnisse, Wiederherstellung und gespeicherte Suchen.

Halte nachvollziehbar fest:

- geändert;
- umgesetzt;
- automatisiert geprüft;
- praktisch auf Android geprüft;
- praktisch auf iOS geprüft;
- offen oder blockiert;
- nächste wertvollste Aufgabe.

Sichere den Stand fortlaufend mit nachvollziehbaren Git-Commits und aktualisiere die vorhandene Projektdokumentation. Pushes, Deployments, Veröffentlichungen und kostenpflichtige Aktionen nur ausführen, wenn sie bereits eindeutig autorisiert und technisch verfügbar sind.

---

## Arbeitsweise

Arbeite in kleinen, abgeschlossenen Schritten:

**Ist-Zustand → wichtigste belegte Schwäche → kleinste sinnvolle Änderung → passende Prüfung → Korrektur → Sicherung → nächste Priorität.**

Wenn ein Schritt scheitert, diagnostiziere die Ursache, begrenze Wiederholungsversuche und nutze sichere Alternativen. Ein grüner Test beweist nicht automatisch, dass die App verständlich oder vertrauenswürdig ist.

Bitte nicht nur einen Plan oder Designvorschläge liefern: Setze die innerhalb der vorhandenen Berechtigungen möglichen Änderungen direkt im Projekt um. Berichte am Ende knapp, was tatsächlich geändert und geprüft wurde und was noch blockiert ist.

## Oberste Leitlinie

**UDI soll zuerst den Bedarf verstehen, dann passende und nachvollziehbare Wege zeigen – ehrlich, einfach und ohne erfundene Treffer.**
