# Zwei Schweizer Angebote für dieselbe Variante · 27.11.2026

Ausgangscommit [80671a4](https://github.com/essenmitpassion-sudo/Catworld/commit/80671a4eeb4a92790b9956ab66c2c4c286e50d27). Die Quellenprüfung beschränkt sich auf Samsung 990 PRO 2 TB ohne Kühlkörper, MPN MZ-V9P2T0BW, GTIN 8806094215038. Vorher bestätigte der Pilot nur DQ Solutions für diese Variante.

## Quellenprüfung

Die öffentliche [MIXEL-robots.txt](https://shop.mixel.ch/robots.txt) antwortete mit HTTP 200. Sie erlaubt öffentlichen Abruf auch für KI-Assistenten und schliesst Checkout, Kundenbereiche und API im allgemeinen Bot-Profil aus. UDI ruft ausschliesslich die fest eingetragene öffentliche Angebotsseite ab und übernimmt daraus die konkreten Angebotsfakten. Der MIXEL-Adapter verlangt auf derselben Seite eine eindeutige Herstellerangabe, passende GTIN, kanonische Angebots-URL und den passenden Verkäufer. Das für diese Quelle gesetzte Abrufintervall beträgt zehn Sekunden. Mobiledevice.ch lieferte für die geprüfte direkte 1-TB-SSD-Seite HTTP 404, obwohl ein älterer Suchtreffer noch ein Angebot zeigte.

Im geschützten lokalen Pilot-HTTP-Pfad mit synthetischer Anmeldung und echten Händlerseiten meldeten beide Quellen aktiven Bestand.

| Verkäufer | Prüfzeit UTC | Artikelpreis | Zustand | Versand / Pflichtgebühren / Endpreis |
|---|---|---:|---|---|
| DQ Solutions | 09:31:51.123 | CHF 439.00 | Neu belegt | offen / offen / offen |
| MIXEL Shop | 09:31:51.390 | CHF 450.90 | offen | offen / offen / offen |

Die MIXEL-Seite veröffentlicht einen strukturierten Versandwert von CHF 0.00 für CH. Ihre Versandseite und AGB verweisen für die konkrete Sendung auf die Checkout-Berechnung. Die AGB nennen im Preis enthaltene Schweizer MwSt., Zoll und Einfuhrabgaben. Ein für die konkrete Liefer- und Zahlungsart verbindlicher Versandtarif und sämtliche übrigen Pflichtgebühren bleiben offen. Es gibt keinen bestätigten Endpreis, Preisvorteil oder Kaufvorschlag. Bei «nur Neuware» blieb im Live-HTTP-Test ausschliesslich DQ sichtbar. Bei «nur mit vollständigen Kosten» zeigte UDI keinen Treffer. Keine Bestellung, Kundenanmeldung am Shop oder Zahlung ausgelöst. [MIXEL-Angebot](https://shop.mixel.ch/product/samsung-ssd-990-pro-m-2-2280-nvme-2000-gb-1425209) · [MIXEL-Versandbedingungen](https://shop.mixel.ch/versand) · [MIXEL-AGB](https://shop.mixel.ch/agb) · [DQ-Angebot](https://www.dq-solutions.ch/de/samsung-2-tb-ssd-990-pro-nvme-m-2-ssd-m-2-hs2011).

Die geschützte Route verwendet für zusätzliche Quellen das vom aktuellen Client angeforderte Accept-Profil. Alte Clients erhalten weiterhin den vorherigen Suchumfang. Fehlender oder nicht passender Verkäufer und widersprüchliche Produktkennungen ergeben keinen aktiven Treffer. Eine eindeutig veränderte Identität kann ältere Fakten entwerten. Es bleiben höchstens drei Detailprüfungen je Suche.

## Prüfung und Wiederherstellung

Die realen Browserabläufe öffneten in Deutsch und Englisch aus der UDI-Ergebnisliste und dem Deal Passport die kanonische öffentliche MIXEL-Seite. Die zwei Händler erschienen als Teilbelege. MIXEL wurde um 09:32:04 und 09:32:29 UTC erneut mit aktivem Bestand und CHF 450.90 geprüft. Befehle: npm run live -- --second-source und npm run live -- --second-source --english. Der Test der geschützten Route und die Live-Browserprüfung verwenden getrennte Abläufe. Beide laufen lokal. Android und iOS benötigen weiterhin den getrennten freigegebenen Testdienst für die native Live-Abnahme.

183/183 Tests, Typprüfung, Build und Chromium-Smoke bestanden. Die Gegenproben schützen die bisherige Suche älterer Clients, die drei Prüfplätze, den Neuwarefilter, den Gesamtpreisfilter und den einzelnen erlaubten MIXEL-Link. Der Git-Checkpoint auf development/udi enthält Adapter, Tests und Nachweis.
