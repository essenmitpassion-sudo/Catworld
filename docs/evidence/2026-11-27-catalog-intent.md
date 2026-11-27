# One-Touch-Suche nach Produktmerkmalen · 27.11.2026

Ausgangsstand [d7bb971](https://github.com/essenmitpassion-sudo/Catworld/commit/d7bb971). Der bestehende geschützte Suchadapter wurde vor der Umsetzung mit acht Anfragen ausgeführt. Vier passende Anfragen erhielten «ausserhalb des Katalogs», ohne Kandidaten- oder Händlerprüfung. Drei Gegenproben erhielten denselben Status. Die Kontrollanfrage Samsung 990 PRO 2 TB fand ihre bisherige Variante.

| Anfrage | Erwartung vor der Umsetzung |
|---|---|
| Ich suche eine externe SSD 1 TB USB-C bis CHF 350. | MU-PE1T0S/EU als Teilbeleg, CHF 350 als feste Grenze, Endpreis offen |
| I need a 1 TB portable SSD USB-C up to CHF 350. | Derselbe passende Teilbeleg in EN |
| Samsung 2 TB 990 EVO Plus | MZ-V9S2T0BW als Teilbeleg |
| MU-PE1T0S/EU | Vollständige Herstellernummer anschliessend gegen die Händlerseite prüfen |
| Samsung 990 PRO 2 TB | MZ-V9P2T0BW erhalten |
| externe SSD 2 TB USB-C | Kein Treffer und keine Händlerprüfung |
| external SSD 1 TB Thunderbolt | Kein Treffer und keine Händlerprüfung |
| 1 TB SSD | Keine Zuordnung ohne weitere passende Merkmale |

Ziel: vier neu brauchbare Suchantworten mit zwei verschiedenen Produktvarianten, weiterhin null Treffer bei den drei Gegenproben. Höchstens ein frischer Händlerabruf je passender Suche, null Modellaufrufe. Kurzzeitcache und Quellenpause des vorhandenen Adapters bleiben wirksam. Für die Erweiterung verwende ich ausschliesslich zwei öffentliche konkrete Detailseiten desselben bereits genutzten Händlers. Die am 27.11. gelesenen [Robots-Regeln](https://www.dq-solutions.ch/de/robots.txt) liefern HTTP 200 und Crawl-delay 10 Sekunden. Die öffentlichen [Händlerbedingungen](https://www.dq-solutions.ch/de/wissenswert/agb) und die konkreten Detailseiten wurden erneut eingesehen. Die Erweiterung bleibt im bestehenden begrenzten Pilotbetrieb.

Die Händlerseiten bestätigten beide Varianten vorab mit HTTP 200 und aktivem Status. Die Merkmale stammen zusätzlich von Samsung Schweiz. Für die externe SSD sind Typ, 1 TB und USB-C erforderlich. Ein generischer Typ allein reicht für keine Zuordnung. Das Identitätsformat mit regionalem Suffix wird im Dienst und gemeinsamen Client gleich geprüft. [Samsung T7 Shield](https://www.samsung.com/ch/memory-storage/portable-ssd/t7-shield-1tb-black-external-storage-nvme-1050-mbs-mu-pe1t0s-eu/) · [Samsung 990 EVO Plus](https://www.samsung.com/ch/memory-storage/nvme-ssd/990-evo-plus-2tb-nvme-pcie-gen-4-mz-v9s2t0bw/).

## Gemessener Stand

Im geschützten lokalen HTTP-Ablauf mit synthetischer Anmeldung führten alle vier bisher erfolglosen passenden Anfragen zu Teilbelegen. Die bestehende Kontrollvariante und alle drei Gegenproben verhielten sich wie erwartet. Die drei frischen DQ-Abrufe waren über die vereinbarte Quellenpause verteilt. Zwei T7-Anfragen verwendeten denselben frischen Beleg aus dem Kurzzeitcache. Gegenproben verursachten keinen Detailseitenabruf. Null Modellaufrufe.

- T7 Shield MU-PE1T0S/EU, 08:41:56 UTC. HTTP 200, Quelle meldete aktiv, Artikelpreis CHF 239. Der CHF-350-Filter blieb bei beiden Merkmalsanfragen gesetzt. Gesamtpreis und konkretes Lieferziel blieben offen. [Händlerseite](https://www.dq-solutions.ch/de/samsung-1-tb-t7-shield-portable-ssd-schwarz-hs1114).
- 990 EVO Plus MZ-V9S2T0BW, 08:42:07 UTC. HTTP 200, Quelle meldete aktiv, Artikelpreis CHF 399. Gesamtpreis und konkretes Lieferziel blieben offen. [Händlerseite](https://www.dq-solutions.ch/de/samsung-2-tb-ssd-990-evo-plus-nvme-m-2-ssd-m-2-hs2010).
- 990 PRO MZ-V9P2T0BW, 08:42:18 UTC. HTTP 200, Quelle meldete aktiv, Artikelpreis CHF 439. Die beiden im Katalog registrierten anderen Händler wurden vom Laufzeitprüfer ohne Netzaufruf abgewiesen.

Die neue reale Prüfroutine ist npm run live -- --attribute für Deutsch und npm run live -- --attribute --english für Englisch. Beide bestätigten Suchknopf, landessprachliche Variante, offene Kosten, Deal Passport und Direktlink zur DQ-Seite. Nach dem Review waren 172 Tests, Typprüfung, Build und Chromium-Smoke grün. Der englische Live-Ablauf bestätigte den abschliessenden Stand um 08:44:34 UTC. Der Review schützte zusätzlich Kurzabfragen mit Modellbezeichnung und explizite Ausschlüsse nach Satzzeichen.

## Stichprobe gegen Preisvergleich

Die öffentliche Suche von Toppreise.ch führt dieselben Varianten und weist bei der T7 Shield mehrere Händler und Versandangaben aus. Die Seiten wurden als öffentliche Produktansicht geprüft. Die Händlerangebote wurden dort nicht am Checkout bestätigt. Diese Stichprobe belegt die geringere Breite des UDI-Pilots und ist kein vollständiger Wettbewerbsbenchmark oder Datenzugang für UDI. [T7 Shield im Preisvergleich](https://www.toppreise.ch/preisvergleich/Externe-Solid-State-Drives-SSD/SAMSUNG-Portable-SSD-T7-Shield-USB-C-3-2-Gen-2-1-MU-PE1T0S-EU-p691217?posf=1&pselav=1) · [990 EVO Plus im Preisvergleich](https://www.toppreise.ch/produktsuche?q=Samsung+990+EVO+Plus+SSD+2TB).

## Rückkehr zur Eingabe

Ausgangscommit [0e8aaa0](https://github.com/essenmitpassion-sudo/Catworld/commit/0e8aaa0). Gegenprobe im Chromium-Ablauf für die geschützte Suche bei 320 px. Bei einer 422-Antwort setzte die bisherige Folgeaktion den Suchwunsch Kingston NV3 2 TB auf das Beispiel zurück. Die Werte CHF 350, Zustand Neu und «nur mit vollständigen Kosten» gingen dabei verloren. Die neue Aktion fokussiert den vorhandenen Suchwunsch und erhält alle drei Kriterien. Seit dem Ergebnis bleibt der Zähler bei einer HTTP-Anfrage, bis die bearbeitete Anfrage bewusst abgeschickt wird. Auf DE/EN bestanden, mit synthetischem Pilotdienst. 172/172 Tests, Typprüfung, Build und Chromium-Smoke bestanden.
