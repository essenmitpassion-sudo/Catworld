# Endpreisfilter für Schweizer Händlerangebote · 27.11.2026

Geprüft wurde die Samsung 990 PRO 2 TB ohne Kühlkörper, MPN MZ-V9P2T0BW. Beide Händler meldeten aktiven Bestand. DQ bestätigt Neuware, bei MIXEL ist der Zustand offen. [Angebots- und Variantennachweis](2026-11-27-mixel-second-source.md).

DQ nennt für den üblichen Versand in der Schweiz und Liechtenstein ab CHF 49 einen kostenlosen Versand sowie mehrere gebührenfreie Zahlungsarten. Die AGB sehen mögliche Verpackungs- und Zusatzkosten vor. MIXEL verweist für den konkreten Versandpreis auf die Checkout-Berechnung. Für keines der Angebote ist die Summe aus Artikelpreis, Versand und sämtlichen Pflichtkosten für das konkrete Lieferziel vollständig bestätigt. Die Prüfung der öffentlichen Seiten erforderte keine Bestellung, Kundenanmeldung oder Zahlung. [DQ-Versand](https://www.dq-solutions.ch/de/wissenswert/versandinformationen) · [DQ-Zahlung](https://www.dq-solutions.ch/de/wissenswert/zahlungsinformationen) · [DQ-AGB](https://www.dq-solutions.ch/de/agb) · [MIXEL-Versand](https://shop.mixel.ch/versand).

## Vorher und nachher

Der geschützte lokale HTTP-Pilot verwendete eine synthetische Anmeldung und prüfte beide öffentlichen Händlerangebote. Der Ausgangsstand acfcf72 meldete in allen drei Fällen zwei ausgeschlossene Angebote ohne Grund für den Endpreisfilter. Der erneute Abruf im Änderungsstand erfolgte um 13:33:34 UTC. Je Händler genügte ein Seitenabruf. Die beiden weiteren Anfragen nutzten die frischen Befunde im Zwischenspeicher.

| Suchfall bei aktivem Endpreisfilter | Sichtbare Angebote | Sonst passend mit offenem Endpreis |
|---|---:|---:|
| Samsung 990 PRO 2 TB | 0 | 2 |
| Samsung 990 PRO 2 TB bis CHF 200 | 0 | 0 |
| I am looking for a Samsung 990 PRO 2 TB without a heatsink. · nur Neuware | 0 | 1 |

Nur sonst passende, identifizierte Angebote können den eigenen Leerzustand auslösen. «Kostenfilter prüfen» zeigt den weiterhin aktiven Filter, erhält Suchtext und Kriterien und startet keine weitere Suche. UDI gibt bei diesen drei Anfragen keine Kaufempfehlung aus.

186 Tests, Typprüfung, Build und Chromium-Smoke bestanden. Die Live-Browserabläufe mit zwei echten Anbieterprüfungen bestanden auf Deutsch und Englisch (npm run live -- --endprice, zusätzlich --english). Die native Live-Abnahme auf Android und iOS braucht den separat freigegebenen UDI-Testdienst.
