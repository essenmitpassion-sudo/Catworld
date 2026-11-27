# Aktualität im Deal Passport · 27.11.2026

Ausgangscommit [d0c8d95](https://github.com/essenmitpassion-sudo/Catworld/commit/d0c8d952c19ac60428caa319a317d4f897d01dad). Ein frischer HTTP-410-Beleg für einen zuvor aktiven Kataloglink erreichte den geschützten App-Vertrag ohne Information zum betroffenen Angebot. Die Gegenprobe zeigte den alten Artikelpreis weiterhin im Passport. Eine zweite Gegenprobe zeigte dasselbe Verhalten, wenn der Händler inzwischen einen Preis über dem Budget meldete.

UDI übermittelt für bestätigte Widersprüche eine auf denselben Kataloglink und Prüfzeitpunkt begrenzte Entwertung. Bei einem frisch geprüften, aber ausgefilterten Angebot entfernt UDI nur ältere Preisstände. Ein aktiver Beleg mit identischer Prüfzeit kann nach einer bewussten Änderung des Budgets wieder angezeigt werden. Verspätete ältere Antworten können die neue Prüfung weder umgehen noch überschreiben. Eine vorübergehende Quellensperre und eine von der Katalogvariante abweichende gesuchte Herstellernummer erzeugen für sich keine Entwertung. Der Client lehnt gleichzeitiges Anbieten und Entwerten derselben URL, URL-Dubletten sowie fremde, zukünftige und veraltete Entwertungen ab.

## Prüfnachweis

- Geschützter lokaler HTTP-Pfad mit synthetischer Anmeldung und Händlerantwort. Die erste Anfrage lieferte einen aktiven Beleg, die zweite einen HTTP-410-Händlerstatus und eine Entwertung. Der vorherige Preis verschwand im Passport-Datenmodell. Eine verspätet wiederholte erste Antwort blieb wirkungslos. Der HTTP-410-Status wurde als kontrollierter Testfall bereitgestellt.
- Gegenproben zu Preiswechsel, Budgetfilterung, falsch zugeordneter Variante, widersprüchlichem Protokoll und vorübergehender Quellensperre liefen über den Scanner oder den gemeinsamen Clientvalidator. Die mangelhaften Verhaltensweisen schlugen zuerst rot fehl.
- Der echte aktive Händlerablauf wurde am 27.11. um 09:01:14 UTC erneut über den geschützten HTTP-Dienst und gemeinsamen Client geprüft. CHF 439 Artikelpreis blieb in den passenden Kontrollfällen sichtbar. Zu niedrige Budgets blendeten ihn aus. Gesamtpreis und Lieferziel blieben offen. Ein Quellenabruf, null Modellaufrufe.
- 179/179 Tests, Typprüfung, App-Build und Chromium-Smoke bestanden. Die native Live-Abnahme bleibt ausstehend.
