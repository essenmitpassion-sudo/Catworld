# MASTERPROMPT – UDI: DER INTELLIGENTE SCHNÄPPCHENJÄGER

## Mission

Arbeite am bestehenden UDI-Projekt weiter. Entwickle UDI zu einem **einfachen, verlässlichen Schnäppchenjäger**, der nicht nur Suchergebnisse sammelt, sondern eigenständig Wege findet, das Ziel des Nutzers günstiger, besser oder einfacher zu erreichen.

UDI soll weit mehr leisten als eine gewöhnliche Google-Suche oder ein täglich beauftragter KI-Watchdog:

- Der Nutzer beschreibt sein Ziel in Alltagssprache.
- UDI versteht, was wirklich gebraucht wird und welche Bedingungen wichtig sind.
- Die KI denkt in mehreren Richtungen weiter, wenn der direkte Weg teuer, ausverkauft oder ungeeignet ist.
- Sie prüft reale Angebote, Gutscheine, Kosten und Bedingungen.
- Am Ende zeigt sie knapp den besten belegbaren Weg – mit nachvollziehbaren Quellen und direkten Links.

**Der entscheidende USP:** UDI findet nicht nur, wonach der Nutzer ausdrücklich sucht. Es entdeckt auch sinnvolle Alternativen, Umwege und Kombinationen, die das gewünschte Ergebnis besser erreichen.

**Leitidee:** *Sag UDI, was du erreichen willst. UDI findet den besten belegbaren Weg dorthin.*

Prüfe zuerst den tatsächlichen Projektstand. Erfinde keine vorhandenen Funktionen, Datenquellen, Händlerzugänge oder Ergebnisse. Entwickle Bestehendes gezielt weiter.

## P0 – Den USP an echten Aufgaben beweisen

Eine KI-Suche, eine Preisliste oder ein automatisch wiederholter Suchauftrag sind allein kein ausreichender USP.

Wähle einen konkreten Anwendungsfall aus dem bestehenden Projekt und prüfe, ob UDI dabei einen besseren Weg findet, als wenn der Nutzer nur den Produktnamen googelt oder täglich einen Agenten beauftragt.

UDI muss dabei eigenständig fragen:

- Was ist das eigentliche Ziel hinter der Anfrage?
- Welche Merkmale sind zwingend, welche sind nur Wunsch?
- Gibt es dasselbe Produkt unter einem anderen Namen, einer anderen Marke oder Artikelnummer?
- Gibt es eine gleichwertige, bessere oder günstigere Alternative?
- Welche Kaufwege und Kombinationen wurden bei einer Standardsuche leicht übersehen?
- Welche Angaben müssen geprüft werden, bevor eine Empfehlung zuverlässig ist?

Wenn der USP im bestehenden Projekt noch nicht belegbar ist, schärfe ihn anhand echter Daten und eines realen Nutzerablaufs. Behaupte keinen Vorteil, den du nicht demonstrieren kannst.

## P0 – UDI muss ausserhalb der Standardsuche denken

Behandle die Nutzereingabe als **Ziel**, nicht bloss als Suchbegriff. Entwickle intern mehrere Suchwege, ohne den Nutzer mit der gesamten Recherche zu belasten.

Prüfe – sofern für die konkrete Anfrage sinnvoll und technisch erreichbar – auch:

- andere Produktnamen, Marken, Modellnummern und Schreibweisen;
- identische Produkte unter Eigenmarken oder bei weniger bekannten Händlern;
- Produkte mit denselben entscheidenden Eigenschaften statt nur exakt dieselben Treffer;
- Sets, Bundles oder Mehrfachpackungen, wenn sie im Endpreis besser abschneiden;
- Outlet-, Ausstellungs-, B-Ware-, refurbished- und geprüfte Gebrauchtangebote;
- Gutschein, Rabattcode, Cashback, Newsletterrabatt und zulässige Rabattkombinationen;
- Händleraktionen, saisonale Zeitpunkte, Preisverläufe und mögliche Preisrückgänge;
- Abholung, lokale Angebote und Lieferoptionen;
- Angebote ausserhalb der Schweiz, wenn Lieferung, Zoll, Mehrwertsteuer, Versand und Rückgabe fair mitgerechnet werden;
- eine andere Lösung, falls sie das Ziel besser erfüllt als das ursprünglich genannte Produkt.

**Kreative Suche darf nicht zu kreativen Behauptungen führen.** Jeder konkrete Treffer muss überprüfbar sein. Kennzeichne klar, ob etwas belegt, plausibel, ungeprüft oder nicht verfügbar ist. Bevorzuge einen nachweislich brauchbaren Umweg gegenüber einer erfundenen vermeintlichen Abkürzung.

## P0 – Einfach für den Nutzer, gründlich im Hintergrund

Der Nutzer soll nicht selbst eine lange Checkliste ausfüllen oder täglich neue Prompts schreiben müssen.

- Freitext-Eingabe in Alltagssprache als Standard.
- Stelle nur dann eine kurze Rückfrage, wenn eine fehlende Information das Ergebnis wesentlich ändern würde.
- Triff sonst eine nachvollziehbare Annahme und mache sie bei Bedarf sichtbar.
- Die KI erledigt Suchvarianten, Vergleiche und Prüfungen im Hintergrund.
- Zeige zuerst **den besten gefundenen Weg**, danach höchstens wenige sinnvolle Alternativen.
- Erkläre kurz, warum der Vorschlag zum Ziel passt und wo seine Grenzen liegen.

Der Nutzer soll sofort verstehen:

1. Was ist die beste Option?
2. Was kostet sie tatsächlich?
3. Warum ist sie für mein Ziel besser?
4. Wie sicher und aktuell ist das Ergebnis?
5. Wo kann ich es direkt prüfen oder kaufen?

## P0 – Ergebnisse und Gutscheine verlässlich belegen

Jedes Ergebnis muss klar unterscheiden zwischen:

- dem regulären Preis;
- Versand, Steuern, Zoll und weiteren bekannten Pflichtkosten;
- bestätigten Rabatten und Gutscheinen;
- möglichen, aber nicht bestätigten Ersparnissen;
- Verfügbarkeit und Lieferzeit, soweit sie geprüft werden konnten.

Für Gutscheine:

- Zeige Code, Bedingungen, Mindestbestellwert, Ablaufdatum und Händler, soweit bekannt.
- Rechne die Ersparnis nur ein, wenn die Bedingungen zum konkreten Warenkorb oder Angebot passen.
- Behaupte keine erfolgreiche Einlösung, wenn sie nicht technisch geprüft wurde.
- Kennzeichne einen Gutschein als **bestätigt**, **nicht geprüft**, **abgelaufen** oder **nicht anwendbar**.
- Weise aus, wann und worauf die Prüfung beruht.

Für Angebote:

- Prüfe, ob Produkt, Modell und Variante wirklich passen.
- Verlasse dich nicht allein auf Suchmaschinen-Snippets oder Werbeaussagen.
- Prüfe direkte Händlerseiten, Preisangaben, Verfügbarkeit und Lieferbedingungen, soweit zugänglich.
- Zeige Quelle und Prüfzeitpunkt.
- Bevorzuge den echten Gesamtpreis und den tatsächlichen Nutzwert gegenüber einem werblich hervorgehobenen Rabatt.

Wenn ein Preis oder Gutschein nicht verlässlich geprüft werden kann, stelle ihn nicht als bestätigte Ersparnis dar.

## P0 – Eine klare, knappe Empfehlung

UDI soll nicht einfach den niedrigsten Preis wählen. Bewerte passend zum Nutzerziel:

- tatsächliche Eignung;
- Gesamtpreis;
- Qualität und wichtige Merkmale;
- Verfügbarkeit und Lieferbarkeit;
- Händler- und Angebotszuverlässigkeit;
- Gutscheinbedingungen;
- Unsicherheit und mögliche Nachteile.

Gib eine klare Empfehlung, wenn die Belege reichen. Je nach Ergebnis kann sie lauten:

- **Bester direkter Treffer**
- **Cleverster Weg zum Ziel**
- **Beste Alternative**
- **Warten lohnt sich möglicherweise**
- **Noch keine zuverlässige Empfehlung möglich**

Begründe die Empfehlung in wenigen konkreten Sätzen. Zeige keine künstlich präzisen Punktzahlen oder Rankings, wenn dafür keine belastbaren Daten existieren.

## P1 – Nützlicher als ein täglicher Watchdog

UDI soll den Nutzer nicht mit täglichen Meldungen beschäftigen. Es soll gespeicherte Wünsche nur dann erneut aufgreifen, wenn es eine relevante, belegbare Änderung gibt.

Prüfe, ob sich zuverlässig umsetzen lassen:

- einen Suchwunsch mit wenigen Schritten speichern;
- Preisziel oder wichtige Bedingungen festlegen;
- Änderungen bei Preis, Verfügbarkeit oder bestätigtem Gutschein erkennen;
- nur bei relevanten Änderungen informieren;
- die neue Information mit Quelle, Prüfzeitpunkt und vorherigem Stand belegen.

Keine tägliche Meldung ohne neue Erkenntnis. Keine Benachrichtigung auf Basis simulierter, veralteter oder unsicherer Daten. Der Nutzer muss solche Funktionen freiwillig aktivieren können.

## P0 – Bestehende App, Plattformen und Datenzugänge

Untersuche den aktuellen Projektstand, bevor du Änderungen planst:

- bestehende App-Abläufe und Nutzeroberfläche;
- vorhandene Such- und Angebotsdienste;
- Datenquellen, Händlerzugänge und Gutscheinfunktionen;
- offene Hosting-, Berechtigungs- und Integrationsblocker;
- Android- und iOS-Stand;
- vorhandene Sprachen, Märkte, Lieferländer und Währungen.

Erhalte vorhandene Architekturentscheidungen, sofern sie funktionieren. Sprache, Markt, Lieferland und Währung müssen getrennt behandelt werden. Schweiz bleibt der aktive Markt; Deutsch und Englisch müssen sauber unterstützt sein.

Wenn ein externer Zugang fehlt:

- ermittle den konkreten Blocker;
- erledige unabhängige Arbeit trotzdem;
- baue sinnvolle Schnittstellen und sichtbare Fehlerzustände;
- kennzeichne Testdaten eindeutig als Testdaten;
- behaupte keine echte Live-Suche, solange sie nicht nachgewiesen funktioniert.

Veröffentliche nichts und löse keine Kosten aus, sofern das nicht ausdrücklich beauftragt ist.

## Vorgehen und Abnahme

Arbeite selbstständig und in dieser Reihenfolge:

1. **Ist-Zustand:** Bestehende App, Suchabläufe, Datenquellen und Blocker erfassen.
2. **USP-Test:** Einen realistischen Suchfall wählen, bei dem UDI einen über eine Standardsuche hinausgehenden Weg finden muss.
3. **Kleinster vollständiger Ausbau:** Den Ablauf von der Alltagseingabe bis zur belegbaren Empfehlung umsetzen.
4. **Red-Team-Prüfung:** Falsche Varianten, veraltete Preise, ungeprüfte Gutscheine, irreführende Ersparnisse, falsche Links und unfaire Auslandspreise prüfen.
5. **Verbessern und sichern:** Die wichtigste belegte Schwäche korrigieren und Änderungen nachvollziehbar sichern.

Der Meilenstein ist erreicht, wenn:

- der Nutzer sein Ziel ohne komplizierte Suchformulare beschreiben kann;
- UDI mindestens einen sinnvollen Suchweg ausserhalb der einfachen Produktnamensuche prüft;
- echte Treffer, Alternativen und Gutscheine nicht erfunden oder unbelegt als sicher dargestellt werden;
- Gesamtpreis, Quelle, Prüfzeitpunkt und wesentliche Unsicherheiten sichtbar sind;
- eine klare Empfehlung mit direktem, geprüftem Link entsteht – oder UDI ehrlich erklärt, weshalb noch keine möglich ist;
- Android und iOS entsprechend dem tatsächlichen Projektstand berücksichtigt sind.

Berichte am Ende knapp und sauber getrennt:

- **Umgesetzt**
- **Automatisch geprüft**
- **Praktisch verifiziert**
- **Noch blockiert oder unbewiesen**
- **Nächster sinnvoller Schritt**

Grüne Tests beweisen nicht automatisch, dass UDI einen besseren Suchweg findet. Zeige den Vorteil an einem konkreten Vorher-Nachher-Beispiel.

## Oberste Leitlinie

**UDI soll nicht bloss schneller suchen. Es soll das Ziel verstehen, neue Wege entdecken und nur das empfehlen, was sich anhand echter Belege vertreten lässt.**