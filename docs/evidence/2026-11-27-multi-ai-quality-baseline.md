# Qualitätsvergleich für die Multi-KI-Suche · 27.11.2026

Ausgangscommit 126a893. Der Vergleich misst den Zusatznutzen einer gezielten Gegenprüfung gegenüber demselben Hauptmodell. Die Testfälle bleiben ab diesem Checkpoint fest. Reale Preis-, Bestands- und Versandfakten werden für den jeweiligen Lauf aus zulässigen Quellen festgehalten.

| Fall | Eingabe beziehungsweise Zustand | Entscheidender Nachweis |
|---|---|---|
| 1 | Ich suche eine Samsung 990 PRO 2 TB ohne Kühlkörper bis CHF 500. | Richtige MPN MZ-V9P2T0BW und aktuelle Schweizer Direktlinks. Budgeteignung bleibt ohne Endpreis offen. Null KI-Aufrufe. |
| 2 | I need a portable 1 TB USB-C SSD. | Schwarze T7 Shield MU-PE1T0S/EU als bestätigte Katalogvariante. Null KI-Aufrufe. |
| 3 | Samsung 990 PRO 1 TB. | Ein 2-TB-Angebot fällt heraus, auch wenn sein Suchtreffertitel 1 TB nennt. |
| 4 | I need a Samsung 990 PRO with 1000 GB. | Gleiche Kapazitätsprüfung mit anderer Einheit und Sprache. |
| 5 | Samsung 990 PRO mit 1 TB oder 2 TB. | Bei passendem Quellenbeleg ist ein korrekt bezeichneter 2-TB-Treffer zulässig. |
| 6 | Samsung 990 PRO 2 TB · Kostenfilter aktiv. | Passende Teilbelege ohne verifizierten Endpreis bleiben ausgefiltert. Der Grund ist nachvollziehbar. |
| 7 | Samsung 990 PRO 2 TB under CHF 200 · Kostenfilter aktiv. | Wenn der Artikelpreis bereits über der Grenze liegt, erscheint der Treffer auch als Kostenlücke nicht. |
| 8 | Mehr Speicher für meinen PC bis CHF 200. | Ohne Angaben zum Anschluss beginnt der Ablauf mit der kompakten Auswahl. Alternative Beschaffungswege nach bestätigter Auswahl bleiben preis- und kompatibilitätsgebunden. |
| 9 | I need a used desktop PC under CHF 400 with room for a second NVMe drive. | Unklare Steckplätze oder widersprüchliche Inseratsdaten als offen kennzeichnen. Ein belegter passender Weg zählt als Erfolg. |
| 10 | Kingston NV3 2 TB, new. | Eine gefundene Variante braucht einen aktuellen CH-Direktbeleg. Ohne glaubwürdigen Beleg bleibt das Ergebnis leer oder unbestätigt. |
| 11 | I need an NVMe SSD MZ-V9P2T0CW with a heatsink. | Ein Snippet darf die falsche MPN MZ-V9P2T0BW auf der Händlerseite nicht überstimmen. |
| 12 | Suche nach «mechanische Tastatur, ISO-CH» mit simuliertem 503. | Der erlaubte und budgetierte Ausweichpfad bleibt auf einen weiteren Aufruf begrenzt. Budgetmangel oder Abbruch beendet die Ausführung. |

Vor dem bezahlten Pilot Modellversion, Quellenstand, Zeit- und Ausgabenbudget festhalten. Beide Varianten erhalten dieselben Eingaben, dieselben Quellenregeln und für den Paarvergleich denselben Quellenstand. Der Vergleich umfasst den gesamten Suchvertrag bis zum angezeigten Ergebnis. Bei Fall 12 wird Ausfallsicherheit separat von Antwortqualität gewertet. Je Fall Eingabe, Ergebnis und unabhängigen Beleg, Aufrufzahl, Kosten inklusive Fehlläufen und Latenz festhalten. Eine zusätzlich gelöste Suche oder verhinderte Fehlentscheidung zählt höchstens einmal. Der [Abnahmeplan](../../PLAN.md#universal-multi-ai-collaboration--27112026) verlangt mindestens zwei solche Verbesserungen bei null harten Regelverletzungen.

## Vorher und nachher im lokalen Suchkern

Die Gegenprobe für Fälle 3–5 verwendet dasselbe synthetische Modellergebnis. Es trägt den Titel «Samsung 990 PRO 1 TB ohne Kühlkörper» und verlinkt auf die bekannte Schweizer DQ-Seite der 2-TB-Variante. Die lokale Quellen-Testantwort enthält deren richtige MPN. Vor der Korrektur erschien für die 1-TB-Suche ein Teilbeleg mit dem falschen Titel. Der gezielte Regressionstest schlug fehl.

Nach der Korrektur führen beide ausdrücklich unpassenden Kapazitätsangaben zu null Treffern und null Händlerprüfungen. Die vorgegebene Wahl zwischen 1 TB und 2 TB erlaubt genau eine Detailprüfung. Der Teilbeleg zeigt die Katalogbezeichnung und MPN der 2-TB-Variante sowie offene Gesamtkosten. Die Schutzregel gilt für bekannte Kataloglinks bei ausdrücklich genannter Modellreihe und abweichender Kapazität. Das vollständige Abgleichen beliebiger technischer Anforderungen mit neuen Produkten bleibt Teil der offenen Qualitätsabnahme.

192 Tests, Typprüfung, Build und Chromium-Smoke bestanden. Der Modell- und Quelleninhalt dieser Gegenprobe ist synthetisch. Ein erneuter echter Abruf von DQ und MIXEL um 13:43:26 UTC bestätigte im geschützten lokalen Pilot die drei [Endpreisfilter-Fälle](2026-11-27-endprice-filter.md) mit zwei, null beziehungsweise einem sonst passenden Teilbeleg. Ein realer Modellvergleich erfordert die freigegebenen Anbieter- und Datenwege.
