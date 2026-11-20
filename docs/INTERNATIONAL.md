# UDI · Sprachen und Märkte getrennt skalieren

Entscheidung vom 20.11.2026: Deutsch und Englisch als erster vollständiger Bedienungsumfang derselben App. Kein neuer Stack, kein zusätzliches Browserprodukt. Eine englische App bedeutet keine US-/UK-Angebote. Die aktuell belegte Angebotsregion bleibt Schweiz, Währung CHF, Zeitzone Europe/Zurich. Sprache beeinflusst UI, Formatierung und neue Diktate, keine Preise oder Lieferbedingungen.

## Reihenfolge und Abnahme

| Etappe | Nutzen | Notwendiger Nachweis |
|---|---|---|
| 1 · Deutsch/Englisch, Markt CH | Deutsch- und englischsprachige Nutzer können denselben engen Pilot verstehen. | Gesamter vorhandener Ablauf einschliesslich Kosten, Passport, Watchlist, Hilfe, Aufnahme-/Berechtigungsfehler, Teilen und Installation; Eingaben bleiben beim Wechsel erhalten. Englische CHF-Budgets und Zustandswünsche funktionieren. Bestehende Quellenabnahme unverändert. |
| 2 · Französisch/Italienisch, weiterhin CH | Zugang für weitere Schweizer Nutzer ohne vorzeitigen Quellen-/Rechtsausbau. | Vollständiger fachlich geprüfter Textkatalog, natürliche Suchformulierungen, Betrags-/Datums-/Pluralregeln, Diktat auf tatsächlichen Geräten sowie Erstnutzer-Abnahme. Kein automatisches Übersetzen von Produktfakten oder Angeboten. |
| 3 · genau ein zusätzlicher Markt | Erst nach wiederkehrendem Nutzen und verlässlicher Schweizer Kostenbasis. Deutschland ist ein zu prüfender Kandidat, kein beschlossener oder angebundener Markt. | Eigene zulässige Quellen, exakte Produkt-/Zustandszuordnung, Verkäufer, Liefergebiet/-ort, Bestands-/Linkprüfung, Steuern, Versand/Import/Pflichtkosten, native Markt-Währung, Limits und reale Vergleichs-/Geräteabnahme. Vor konkreter Anbindung aktuelle Regeln/Partnerbedingungen prüfen. |
| 4 · weitere Märkte / grenzüberschreitender Vergleich | Erweiterung nach nachgewiesenem Bedarf und positiver Betriebsökonomie. | Marktweise Akzeptanz, unabhängige Quellen, aktuelle FX-Belege und Wechselkosten, Zoll/Import, real lieferbare Ziele und Datenrechte. Keine Umrechnung als bestätigten Endpreis ausgeben. Keine parallele Universalabdeckung vortäuschen. |

Neue Sprache: Katalog und Sprachmetadaten ergänzen, Vollständigkeit und Platzhalter prüfen, Bedarfsparser/Spracherkennung mit echten Formulierungen abnehmen, UI/Screenreader/Schrift/Zeilenumbrüche prüfen. Neue Schriftsysteme benötigen zudem Schriftabdeckung und gegebenenfalls RTL-Layouts. Ein eingeblendeter Ländername ist keine Marktintegration.

Neue Region: Marktkennung, Währung und Zeitzone festlegen; getrennte Datenquellen und Kostenannahmen. [Der gemeinsame Marktvertrag](MARKETS.md) bindet Suchaufträge, Quellen und Beobachtungen bereits ausdrücklich an CH. V2-Speicher und -Freigaben führen Lieferwunsch und CHF-Budget; historische v1-Suchen/-Links werden eindeutig CH zugeordnet. Bestehende CH-Freigabelinks dürfen nie stillschweigend unter einem anderen Markt ausgeführt werden. Neue aktive Regionen benötigen eigene Quellen-/Kostenabnahme, ohne bestehende Suchen umzudeuten. Bis dahin kein Länderumschalter mit vorgetäuschten Angeboten.

## USP ohne Behauptungen

Zielgruppe des aktuellen Pilots: Schweizer PC-Interessierte mit einem konkreten SSD-Kaufwunsch. Belegt sind ein konkreter aktueller Preis-/Status-/MPN-Pfad zur passenden Händlerseite, sichtbare Unsicherheit bei fehlenden Kosten und lokal gespeicherte Suchen. Nicht belegt sind bessere Marktabdeckung, niedrigster Gesamtpreis, eine verlässliche Zeitersparnis gegenüber Alternativen oder eine erfolgreiche native Mobilverteilung.

[Toppreise bietet bereits Schweizer Preisvergleiche und eine englische Oberfläche](https://www.toppreise.ch/en); [Preisalarme und mehrere Wunschlisten werden öffentlich beschrieben](https://www.toppreise.ch/register). [Galaxus beschreibt seine Preisverläufe](https://www.galaxus.ch/en/page/how-dynamic-pricing-at-galaxus-works-39120). Deshalb sind Preisvergleich, Zweisprachigkeit, Preisverlauf und der Einsatz von KI allein keine belegten Alleinstellungsmerkmale.

UDI muss die Kombination aus verständlichem Wunsch, passend geprüfter konkreter Quelle und offen ausgewiesenen Kosten im Alltag beweisen. Der bisherige Live-Pilot bleibt enger als diese Produktvision. Fünf freiwillige Tests sollen messen, ob Nutzer schneller zu einem passenden aktiven Angebot kommen, Risiken richtig verstehen und später sinnvoll weiterprüfen. Kein Siegerurteil über Wettbewerber oder erfundener Nutzernachweis.

Monetarisierung bleibt wie in docs/MONETIZATION.md gestuft: mögliche Preisvorteile nur mit passender Vergleichsbasis; bestätigte Ersparnis nur mit belastbarem Kaufnachweis; selbst gemeldeter Kauf als Nutzerangabe. Keine Affiliate-/Cashback-/Gutschein-Integration ohne tatsächlichen erlaubten Zugang. Die Startgates für HTTPS, Zugriffsschutz, Budget und echte Geräte gelten unabhängig von Sprache.
