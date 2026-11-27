# Vier Preiszustände und erreichbare CH-Quellen · 27.11.2026

Ausgangscommit 88ce701. UDI verwendet denselben Preisvertrag für geschützte Suche, Vergleich und Deal Passport. Berechnung in CHF-Rappen aus belegtem Artikelpreis plus Versand, zusätzlichen Steuern, Importkosten und Pflichtgebühren, abzüglich eines ausdrücklich angerechneten Rabatts. Ein unbekannter Rabatt löst keine Preisreduktion aus. Fehlende Pflichtbestandteile bleiben offen.

| Preiszustand | Voraussetzung |
|---|---|
| Verbindlich bestätigt | Frischer und vollständiger Betrag sowie ein Checkout- oder autorisierter Händlerbeleg für genau diesen Betrag und das ausgewiesene CH-Lieferziel. Die Quellenprüfung muss die Variante bestätigt haben. |
| Preis geprüft | Vollständige, frisch gemeldete Kosten ohne passenden verbindlichen Gesamtbeleg. |
| Unvollständig / Schätzung | Aktueller Quellenpreis mit offenen Pflichtbestandteilen. UDI zeigt bekannte Beträge und kennzeichnet fehlende Angaben. |
| Nicht verifizierbar | Aktuelle passende Preisbelege fehlen oder die Prüfung ist abgelaufen. |

Der Antwortvertrag prüft Summe und Rabatt neu. Der optionale Anbieterbeleg muss zum ausgewiesenen Land und zur vierstelligen CH-Postleitzahl passen. Widersprüche und zusätzliche Belegdaten werden abgewiesen. Die autorisierte Transportgrenze bleibt der bestehende Angebotsdienst. UDI vertraut weder einem Suchergebnis-Titel noch einem beliebigen URL-Parameter als Preisbestätigung. Die vorhandenen öffentlichen Seitenadapter erzeugen keinen Gesamtpreisbeleg. Die Postleitzahl ist erst erforderlich, wenn eine freigegebene Preisquelle sie für den konkreten Versand benötigt. Aktuell bleibt der Suchauftrag beim Markt Schweiz. Der Händlerlink öffnet auf Nutzeraktion die öffentliche Angebotsseite.

## Erneute Prüfung nach der Änderung

Dieselbe Samsung 990 PRO 2 TB ohne Kühlkörper, MPN MZ-V9P2T0BW, wurde über den geschützten lokalen HTTP-Dienst mit synthetischer Anmeldung und echten Händlerseiten geprüft.

| Anbieter | UTC | CH-Artikelpreis und Bestand | Was die öffentliche Quelle abdeckt | Preiszustand im Dienst |
|---|---|---|---|---|
| DQ Solutions | 15:13:58.892 | CHF 439.00 · verfügbar | Produktlink und Artikelpreis. AGB nennen Schweizer MwSt. und gesetzliche Gebühren im Preis. Allgemeine Standardversand- und Zahlungskonditionen sind einsehbar. Versand und alle Neben-/Pflichtkosten sind für die konkrete Lieferung nicht vollständig bestätigt. Kein angerechneter Rabatt oder konkretes Lieferziel belegt. | Unvollständig / Schätzung |
| MIXEL Shop | 15:13:59.120 | CHF 450.90 · verfügbar | Produktlink und Artikelpreis. AGB nennen MwSt., Zoll und Einfuhrabgaben im Preis. Die konkrete Sendung wird im Checkout berechnet. Das strukturierte Versandfeld der Produktseite allein reicht dafür nicht. Kein angerechneter Rabatt oder konkretes Lieferziel belegt. | Unvollständig / Schätzung |

[Konkretes DQ-Angebot](https://www.dq-solutions.ch/de/samsung-2-tb-ssd-990-pro-nvme-m-2-ssd-m-2-hs2011) · [DQ-Versand](https://www.dq-solutions.ch/de/wissenswert/versandinformationen) · [DQ-Zahlung](https://www.dq-solutions.ch/de/wissenswert/zahlungsinformationen) · [DQ-AGB](https://www.dq-solutions.ch/de/wissenswert/agb) · [Konkretes MIXEL-Angebot](https://shop.mixel.ch/product/samsung-ssd-990-pro-m-2-2280-nvme-2000-gb-1425209) · [MIXEL-Versand](https://shop.mixel.ch/versand) · [MIXEL-AGB](https://shop.mixel.ch/agb).

Deutsch und Englisch bestanden den Chromium-Live-Ablauf über die Ergebnisliste und den Deal Passport zur echten MIXEL-Angebotsseite. Je Lauf erschienen zwei aktive Teilbelege. Der lokale Fachtest deckt die vier Zustände, einen belegten Rabatt sowie falschen Betrag, falsche PLZ, veraltete Preise, unbekannte Kosten und unzulässige Zusatzfelder ab. Typprüfung, Build und Chromium-Smoke bestanden. Für beide Anbieter fehlt ein für UDI freigegebener Zielpreis-Endpunkt oder ein nachweislich zulässiger Weg zu einer vollständigen verbindlichen Angebotsbestätigung. Es wurde kein Checkout gestartet.
