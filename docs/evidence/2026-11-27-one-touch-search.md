# One-Touch-Suche · Ausgangsbasis und Zielwerte

27.11.2026, Ausgangscommit [86a6376](https://github.com/essenmitpassion-sudo/Catworld/commit/86a6376). Ausgangsprüfung im gemeinsamen App-Suchclient über den lokalen geschützten HTTP-Suchpfad mit synthetischer Anmeldung und realer DQ-Detailprüfung. Kein Modellaufruf. Drei Antworten verwendeten denselben Händlerabruf vom 27.11.2026 um 08:16:47 UTC. Die separate Chromium-Ausgangsprüfung öffnete über die bestehende App-Oberfläche und den Deal Passport die echte Händlerseite.

| Aufgabe | Ausgangsbasis | Vor Umsetzung festgelegtes Ziel |
|---|---|---|
| Samsung 990 PRO 2 TB | Passender Teilbeleg | 1 Teilbeleg mit gleicher MPN |
| Ich suche eine Samsung 990 PRO 2 TB ohne Kühlkörper bis CHF 500. | Ausserhalb des Katalogs | 1 passender Teilbeleg mit unverändertem Budget und offenem Gesamtpreis |
| I am looking for a Samsung 990 PRO 2 TB without a heatsink, up to CHF 500. | Ausserhalb des Katalogs | 1 passender Teilbeleg mit unverändertem Budget und offenem Gesamtpreis |
| Samsung 990 PRO 2 TB heatsink | Falscher Teilbeleg ohne Kühlkörper | 0 Treffer und 0 Händlerabrufe |
| ohne Samsung 990 PRO 2 TB | Falscher Teilbeleg für ausdrücklich ausgeschlossenes Produkt | 0 Treffer und 0 Händlerabrufe |
| Samsung 990 PRO 1 TB | Ausserhalb des Katalogs | 0 Treffer |
| Ich brauche 2 TB mehr Speicher für meinen PC, bis CHF 200. | Rückfrage | Rückfrage erhalten |
| Zug Basel–Paris mit Fahrrad und Rückfahrt | Ausserhalb des Katalogs | Einschränkung erhalten |

Ziel für die drei passenden Anfragen: von 1/3 auf 3/3 passende Teilbelege. Bei den beiden Fehlzuordnungen: von 2/2 auf 0/2. Für alle acht Suchläufe zusammen höchstens ein echter Abruf derselben bereits freigegebenen Händlerseite über den bestehenden Kurzzeitcache und weiterhin null Modellaufrufe. Endpreis, Lieferziel und bestätigte Einsparung blieben in der Basis offen. Der erste HTTP-Aufruf dauerte 564 ms, die weiteren 2–4 ms. Einzelmessungen dienen der Einordnung.

Der Katalog zerlegte den gesamten Suchsatz in einzelne Wörter. Dadurch blockierten Kaufwunsch-Formulierungen den Treffer. Gleichzeitig konnten «ohne» und «heatsink» beliebig verteilt sein, weil die Variantenbeschreibung als Einzelwörter abgeglichen wurde. Der geplante kleine Schritt erkennt feste DE/EN-Satzeinstiege und behandelt belegte Variantenmerkmale als zusammenhängende Wortgruppen. Die vorhandenen Produktidentitäten, Kriterien und die nachgelagerte Quellenprüfung bleiben verbindlich. Die [Samsung-Variantenübersicht](https://download.semiconductor.samsung.com/resources/brochure/990_PRO_Series_Brochure_Web_Version_1.0_230509.pdf) unterscheidet MZ-V9P2T0BW und MZ-V9P2T0CW.

## Nachmessung

Der identische geschützte HTTP-Vergleich am 27.11. um 08:22:25 UTC erreichte 3/3 richtige Teilbelege und 0/2 falsche Zuordnungen. Für beide neuen Ergebnisse blieb CHF 500 als Grenze erhalten und die Budgeteignung offen. Die Gegenfälle führten zu keiner Händlerprüfung. Die falsche Kapazität und der Reiseauftrag blieben ausserhalb der Katalogabdeckung. Der offene Speicherwunsch erhielt weiterhin eine Rückfrage. Erster HTTP-Aufruf 778 ms, weitere 2–9 ms. Ein frischer Abruf der gleichen Detailseite, zwei Wiederverwendungen innerhalb des Kurzzeitcaches und null Modellaufrufe.

DQ Solutions lieferte HTTP 200 mit MPN MZ-V9P2T0BW, aktivem Bestand und dem zu diesem Zeitpunkt ausgewiesenen Artikelpreis CHF 439. Gesamtpreis und konkretes Lieferziel blieben unbekannt. [Konkrete Händlerseite](https://www.dq-solutions.ch/de/samsung-2-tb-ssd-990-pro-nvme-m-2-ssd-m-2-hs2011).

Der Live-Browserlauf griff über den sichtbaren Suchknopf, den Deal Passport und den Händlerlink auf genau diese Seite zu. Deutsch um 08:22:39 UTC, Englisch um 08:23:05 UTC. Beide prüften die sichtbaren offenen Kosten und fehlenden Sparversprechen. Befehle: npm run live und npm run live -- --english. Dazu 168/168 Tests, Typprüfung, App-Build und vollständiger Chromium-Smoke. Der HTTP-Vergleich verwendet einen lokalen Anmeldenachweis. Chromium nutzt die gemeinsame Oberfläche und den lokalen Entwicklerendpunkt. Native Live-Anmeldung, Geräteabnahme, ein bestätigter Endpreis, eine zweite unabhängige Quelle und Vergleichsläufe mit externen Suchsystemen sind offen.
Die unabhängige Codeprüfung fand zwei Randfälle. Klammern oder eine vorangestellte Variantenphrase bleiben gültig. Ein Minus am Suchwort führt zu keiner Katalogzuordnung. Beide Fälle scheiterten vor der Korrektur und sind als Regressionstests erfasst.
