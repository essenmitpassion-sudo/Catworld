# Reproduzierbarer Multi-KI-Vergleich · 27.11.2026

Stand der Basis `88ce701` auf `development/udi`. Der Offline-Lauf verwendet die zwölf Fälle der [vorab festgelegten Qualitätsbasis](2026-11-27-multi-ai-quality-baseline.md). Die Produktseiten, Suchtreffer und Modellantworten sind synthetisch. Die verwendeten Katalog-URLs geben keine Auskunft über den heutigen Bestand oder Preis.

```powershell
node scripts/multi-ai-benchmark.mjs
node --test tests/multi-ai-benchmark.test.mjs
```

Der erste Befehl liefert JSON mit Eingabe, Entscheidung, Quellenprüfungen, offenen Aussagen, einzelnen Aufrufen und lokal gemessener Latenz pro Fall. Eine Abweichung von den erwarteten Antworten oder Aufrufgrenzen setzt den Exitcode auf 1. Node v24.13.0 erzeugte den Quellen-Hash `58d4a911fdeca96e3faef4c81338f65f881e3566202ee21e4e60b5c9869b0be6` für die Momentaufnahme vom 27.11.2026, 12:00 UTC. Laufzeitwerte variieren bei Wiederholung.

## Vergleichsbedingungen

Beide Varianten beginnen mit denselben Eingaben, denselben simulierten Suchtreffern und derselben eingefrorenen Quellenlage. Die gemeinsame Obergrenze für die Modellaufrufe eines Falls liegt bei 3’000 simulierten USD-Millionsteln und zehn Sekunden. Jeder versuchte Aufruf beansprucht davon 1’500 USD-Millionstel, einschliesslich des simulierten 503. Diese Rechenwerte dienen der Prüfung der Budgetlogik. Die Testkennungen `openai/fixture-primary` und `google/fixture-second` stehen für Ersatzantworten. Es gab null externe Aufrufe und null tatsächliche Ausgaben.

Der reguläre UDI-Suchkern nutzt den Katalog und prüft die synthetischen Händlerseiten im bestehenden Seitenparser. Das Ergebnis durchläuft den Dienstvertrag bis zur vom Client akzeptierten Antwort. In den Fällen 9 und 11 erhält die simulierte Gegenprüfung nur die strittige Aussage und den passenden Auszug aus derselben Momentaufnahme. Die festgelegte Antwort hält die unbewiesene Aussage zurück. Die Auswertung vergleicht die akzeptierten Antworten anhand unabhängig festgelegter Fallregeln. Sie prüft korrekte Variante, Direktlink und Händler, Aktualität, Lagerstatus, Artikelpreis, Gesamtpreis und offene Kosten. Ein sinnvoller Rückfrageschritt oder das Zurückhalten eines ungeeigneten Treffers zählt als erwartetes Fallresultat. Eine zusätzlich gelöste Suche oder verhinderte Fehlentscheidung zählt höchstens einmal je Fall.

## Beobachteter Lauf

| Messgrösse für Fälle 1–11 | Einzelmodell | Mit Gegenprüfung |
|---|---:|---:|
| Erwartete Fallresultate | 11/11 | 11/11 |
| Harte Verstösse oder unbelegte Angebotsfakten | 0 | 0 |
| Simulierte Modellaufrufe | 7 | 9 |
| Simulierte Gesamtkosten in USD-Millionsteln | 10’500 | 13’500 |
| Simulierte Kosten je Fall mit erwartetem Resultat in USD-Millionsteln | 955 | 1’227 |
| Lokale Gesamtlatenz dieses Laufs in ms | 27,055 | 9,972 |

Die Zeiten messen ausschliesslich den lokalen Lauf mit geladenen Modulen und synthetischen Antworten. Die Einzelmodell-Variante lief zuerst. Die Zahlen tragen keine Aussage zur Providerlatenz. Die zwei zusätzlichen Modellaufrufe verbesserten null Fälle. Die P2-Schwelle von zwei zusätzlich gelösten Fällen oder verhinderten Fehlentscheidungen bleibt unerreicht.

| Fall | Ergebnis im Clientvertrag |
|---|---|
| 1–2 | Richtige Varianten und Direktlinks mit offenen Gesamtkosten. Null Modellaufrufe. |
| 3–5 | Die beiden ausdrücklich gesuchten 1-TB-Varianten schliessen den 2-TB-Link vor dem Quellencheck aus. Die flexible Wahl lässt den 2-TB-Teilbeleg zu. |
| 6–7 | Der Kostenfilter weist bei zwei geeigneten Teilbelegen auf den offenen Endpreis hin. Bei Artikelpreisen oberhalb des Budgets zeigt er keinen dieser Treffer als Kostenlücke an. |
| 8 | Die Auswahl des Beschaffungsumfangs erscheint vor dem ersten Modellaufruf. Nach der Auswahl wird die zu teure PC-Alternative ausgefiltert. Ein geeigneter Beschaffungsweg bleibt offen. |
| 9 | Der freie zweite NVMe-Steckplatz bleibt offen. Die Händlerangaben zum belegten Steckplatz bestätigen die Behauptung im Suchtreffer nicht. Der derzeitige Clientvertrag kann die Identität dieses generischen Inserats ohne belegte Herstellernummer nicht bestätigen. |
| 10–11 | Der ausverkaufte Kingston bleibt ausgefiltert. Beim Samsung entscheidet die MPN auf der Angebotsseite, wodurch die Kühlkörpervariante unbestätigt bleibt. |
| 12 | In beiden Varianten folgt auf einen 503 genau ein zulässiger Ersatzversuch. Nach Budgeterschöpfung und nach Abbruch bleibt es beim ersten Versuch. Das JSON protokolliert diese Zusatzläufe mitsamt den angesetzten Fehlerkosten. |

Der Test speist als Gegenprobe absichtlich eine falsche Variante, einen falschen Preis, einen nicht gestützten Bestand und eine fremde Direkt-URL in dieselbe Bewertungsfunktion ein. Diese bewertet den Fall als unbrauchbar. Regressionssuite, Typprüfung, Build und Chromium-Smoke liefen im gemeinsamen Arbeitsstand.

## Offene Live-Abnahme

Im Arbeitsstand gab es keine konfigurierten Gateway-, UDI-Suchmodell- oder Budgetvariablen und keine bereitgestellten OpenAI-, Anthropic-, Gemini- oder Google-API-Zugangsdaten. Ein lokal ausführbares Ollama-Kommando war ebenfalls nicht verfügbar. Die freigegebene UDI-Route, Datenschutzprüfung und Abrechnung bleiben offen. [Vorbedingungen und dokumentierte Zugänge](2026-11-27-multi-ai-routing.md#vor-dem-geschützten-live-pilot)

Für die Live-Abnahme braucht es einen freigegebenen UDI-Testdienst, bestätigte Modellversionen und Abrechnungswege zweier Anbieter sowie eine vorab genehmigte Ausgabenobergrenze. Der stärkste freigegebene Einzelmodell-Vergleich muss unter identischem Kosten- und Zeitrahmen dieselben relevanten Quellen und Belegauszüge erhalten. Der Lauf erfasst Provider- und Suchtoolverbrauch samt Fehlläufen, tatsächliche Kosten pro brauchbarem Fall und die gemessene Ende-zu-Ende-Latenz. Die Prüffälle für native Android- und iOS-Abläufe bleiben im [Abnahmeplan](../../PLAN.md#universal-multi-ai-collaboration--27112026).
