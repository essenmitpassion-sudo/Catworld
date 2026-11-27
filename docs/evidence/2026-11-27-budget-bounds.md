# Verbindliche Budgetgrenzen · 27.11.2026

Ausgangscommit [db7ff5c](https://github.com/essenmitpassion-sudo/Catworld/commit/db7ff5c). Der reale lokale HTTP-Pilotablauf mit synthetischer Anmeldung und dem gemeinsamen App-Client prüfte Samsung 990 PRO 2 TB bei DQ Solutions. Die Quelle meldete CHF 439 Artikelpreis und aktiven Bestand. Die Gesamtkosten blieben offen.

| Suchtext | Formulargrenze | Bisher angewandt | Ziel |
|---|---:|---:|---|
| Samsung 990 PRO 2 TB bis CHF 200 | CHF 500 | CHF 500, Angebot angezeigt | CHF 200, ausgeschlossen |
| Samsung 990 PRO 2 TB under CHF 439 | CHF 500 | CHF 500, Angebot angezeigt | CHF 438.99, ausgeschlossen |
| Samsung 990 PRO 2 TB bis CHF 500 | CHF 450 | CHF 450, Teilbeleg | CHF 450, Teilbeleg |
| Samsung 990 PRO 2 TB | CHF 500 | CHF 500, Teilbeleg | CHF 500, Teilbeleg |

Ziel vor der Änderung: beide Verstösse gegen die Preisgrenze ausschliessen, beide Kontrollfälle erhalten. Ein frischer Abruf derselben bereits freigegebenen Quelle pro Durchlauf und null Modellaufrufe. Für Text und Formular gilt die engere bindende Grenze, einschliesslich des Rappenabstands bei «unter».

## Nachmessung

Am selben lokalen HTTP-Pfad lieferte der Händler um 08:53:03 UTC wieder HTTP 200 und CHF 439 Artikelpreis. Beide zu teuren Angebote verschwanden aus der Antwort. Die Antwortkriterien zeigten CHF 200 bzw. CHF 438.99. Die Kontrollfälle blieben Teilbelege mit CHF 450 bzw. CHF 500 Obergrenze. Endkosten und Lieferziel blieben offen. Ein frischer Händlerabruf pro Durchlauf, drei Antworten aus dem Quellen-Kurzzeitcache, null Modellaufrufe. Die Gegenproben im Kriterien- und Clientvertragstest schlugen vor der Korrektur fehl und bestanden danach. 174 Tests, Typprüfung, App-Build und Chromium-Smoke bestanden. [Konkrete Händlerseite](https://www.dq-solutions.ch/de/samsung-2-tb-ssd-990-pro-nvme-m-2-ssd-m-2-hs2011).
