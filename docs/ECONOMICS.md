# Wirtschaftlichkeit · Schweizer Zieltarif

Stand der offiziellen Preisprüfung: **25.11.2026**. Umsetzung des Kostenabschnitts aus dem [unveränderten Konto-/Plus-Auftrag](requirements/2026-11-25-account-plus-costs.md). Alle folgenden Ergebnisse sind **bedingte Planungsrechnungen**, keine Rechnung, Profitabilitätsabnahme oder Freigabe für Ausgaben. Es wurden keine Provideraufrufe, Kreditkäufe, Verträge, Store-Produkte oder Deployments ausgelöst.

## Ausführen und konfigurieren

```powershell
node scripts/economics.mjs
node scripts/economics.mjs --json
node scripts/economics.mjs --mau 100,1000,10000 --plus-shares 0,0.05,0.1,0.2,1 --calls 1,2,3
node scripts/economics.mjs --defaults
node scripts/economics.mjs --config economics-local.json --json
node --test tests/economics.test.mjs
```

`--defaults` gibt eine vollständige JSON-Konfiguration aus; `--config` liest eine lokale JSON-Datei mit vollständigen Werten oder einzelnen Änderungen. Keine URL wird abgerufen. `--help` erklärt die Parameter. Preise in ganzen CHF-Rappen, Kostenraten und Wechselkurs als Zahlen; `null` bedeutet bei den sechs ausdrücklich nullable Kostenpositionen **unbekannt**, nicht kostenlos. Unbekannte Felder, ungültige Werte, falscher Markt und doppelte CLI-Argumente scheiden aus. Ausgabe nach stdout, keine Dateien/Umgebung werden verändert. Fehlermeldungen geben weder Dateiinhalte noch geheime Werte aus.

Der Node-Planungsbaustein `scripts/economics.mjs` exportiert `defaultEconomics`, `economicsConfig(overrides)`, `evaluateScenario({mau,plusShare,callsPerSearch},overrides)` und `economicsReport(overrides,axes)`. Ohne Parameter entstehen27 Fälle:100/1000/10000 MAU ×5/10/20 Prozent Plus ×1/2/3 Aufrufe. Andere Anteile einschliesslich0/100 Prozent und durchschnittliche Aufrufzahlen zwischen1 und3 sind konfigurierbar. Bericht höchstens1000 Fälle.

Die Zieltarifwerte stammen wie die Serverkonfiguration aus `scripts/plan-policy.mjs`: **CHF3.90,3 kostenlose beziehungsweise25 Plus-Suchen**. Änderungen sind zentral möglich. Das ist weiterhin genau ein bezahlter Tarif, ohne eigene KI-Abos der Nutzer. Der Rechner aktiviert weder Konten noch Käufe/Entitlements. Der tatsächliche Dienst muss Kontingente, Kostenreservierung und Providergrenzen selbst durchsetzen; eine positive Rechnung ist kein Missbrauchsschutz.

Kostenlose Kontingente gelten im vorbereiteten Dienst je UTC-Kalendermonat. Für Plus zählt ausschliesslich das vertrauenswürdig bestätigte Store-Abrechnungsfenster, **kein zusätzlicher Reset am Monatsanfang**. Die Monatsrechnung nähert einen stabilen Betrieb mit einem Kontingent und einer Verlängerung je Person an; unterschiedliche Periodengrenzen, Teilmonate, Wechsel, Zahlungsprobleme und zeitliche Erstattungsbuchungen erfordern spätere reale Abstimmung. Plus erhält25 Suchen insgesamt, nicht25+3.

## Belegte Preise und tatsächlicher Zugang

| Position | Offizielle Dokumentation, geprüft25.11.2026 | Verwendung und Grenze |
|---|---|---|
| Perplexity Search über bestehenden Gateway-Weg | [Vercel-Websuche](https://vercel.com/docs/ai-gateway/models-and-providers/web-search): USD5/1000 Requests. [Perplexity-Preise](https://docs.perplexity.ai/docs/getting-started/pricing): erfolgreiche Requests, auch leere Resultate; keine zusätzlichen Search-Tokenkosten. | USD0.005 je Suchrequest. Jeder modellierte Request enthält eine Query. Es ist die Search API, weder Sonar-/Agent-Suche noch Fast Search. Kein Rabatt für mehrere Queries angenommen. |
| Sprachmodell | [OpenAI GPT-5.4 mini](https://developers.openai.com/api/docs/models/gpt-5.4-mini), bestätigt im [Gateway-Modellverzeichnis](https://vercel.com/ai-gateway/models/openai/gpt-5.4-mini): USD0.75/M Input- und USD4.50/M Output-Token. | Konfigurierbarer Preisanker, **keine Umstellung des tatsächlich verwendeten Modells**. Kein Cache-/Batchrabatt. Output umfasst gegebenenfalls berechnete Reasoning-Token. Andere Modelle, Provider, regionale Verarbeitung oder Zusatzdienste können mehr kosten. |
| Gateway | [Vercel-Preise](https://vercel.com/docs/ai-gateway/pricing): kein Tokenaufschlag; Zahlungsgebühren und gewählte Zusatzleistungen können anfallen. | Keine kostenlose Dauernutzung/Trialguthaben angerechnet. Tatsächliche Zahlungs-/FX-Gebühren und Providersteuern bleiben standardmässig offen. |
| Apple-Abonnement | [Standardbedingungen](https://developer.apple.com/app-store/subscriptions/): erstes bezahltes Jahr70 Prozent Erlös vor relevanten Steuern, danach85 Prozent. [Small Business](https://developer.apple.com/app-store/small-business-program/) unter Voraussetzungen85 Prozent ab Beginn. | Konservativer Standard **30 Prozent Storegebühr**.15 Prozent nur als explizite alternative Annahme nach geprüftem Konto/Vertrag; keine Teilnahme behauptet. |
| Google-Play-Abonnement | [Servicegebühren](https://support.google.com/googleplay/android-developer/answer/112622): für automatisch verlängerte Abos in den übrigen Märkten15 Prozent bis zur dort angekündigten weltweiten Umstellung. | CH gehört in dieser gelesenen Tabelle zu den übrigen Märkten. Für ein reines Android-Szenario `storeFeeRate:0.15`; kein universeller Auslandstarif. Ein Plattformmix muss als begründete gewichtete Annahme konfiguriert werden. |
| RevenueCat | [Preise/FAQ](https://www.revenuecat.com/pricing): ab USD2500 monatlichem Trackingumsatz1 Prozent **des gesamten** Trackingumsatzes vor Storeabzug; Beispiel USD2500→USD25. | Konservative Basis: CHF-Bruttoumsatz inklusive MwSt. und vor Erstattungen, über den angenommenen FX-Kurs in USD umgerechnet. Exakte MTR-Abgrenzung/Abrechnungsperiode später mit Vertrag abstimmen. Keine kostenfreie Freigrenze vom Umsatz abgezogen. |
| Hosting | [Vercel Pro](https://vercel.com/pricing): Ausgangspreis USD20/Monat, zusätzliche Nutzung/Steuern möglich. | **Planungsoption**, kein autorisiertes oder zugeordnetes UDI-Projekt. USD20 Grundbetrag, tatsächlicher zusätzlicher Verbrauch unbekannt. Bei späterer Angabe `hostingUsageMonthlyChf` nur den Zusatzbetrag nach tatsächlich anwendbaren Inklusivleistungen einsetzen. Kein Pro-Guthaben zusätzlich vom festen Grundbetrag abgezogen. |
| Schweizer Umsatzsteuer | [ESTV](https://www.estv.admin.ch/en/vat-rates-switzerland): Normalsatz8.1 Prozent. | Inklusive Steuer angenommener Storezielpreis wird durch1.081 geteilt. Tatsächliche Storeerlöse, Rundungen und Steuerabrechnung sind noch nicht geprüft; keine Rechts-/Steuerfreigabe. |

Der heutige Suchkern besitzt den Gateway-Adapter für genau eine Suchzeichenfolge und maximal384 Modell-Output-Token, einen getrennten zugelassenen Seitenprüfer und den DQ-Katalogweg. Die Preisanker beweisen weder einen konfigurierten API-Zugang noch die Qualität/Quellenrechte für beliebige Wünsche. Suchindexergebnisse ersetzen keine aktuelle zulässige Angebotsprüfung. DQ liefert bisher nur begrenzte öffentliche Teilbelege; andere Händler-/Gebrauchtquellen, vollständige Kosten und skalierbare Weitergaberechte sind separat offen, siehe [Quellen](SOURCES.md) und [Dienst](SERVICE.md). Die Rechnung enthält ausdrücklich keinen erfundenen kommerziellen Feedpreis. Benötigte Feed-/Lizenzgebühren müssen später unter `otherMonthlyChf` oder im tatsächlich passenden Tarif erfasst werden.

## Annahmen und Formeln

| Konfiguration | Standard | Bedeutung |
|---|---:|---|
| `usdToChf` |0.90 | Bewusst gesetzter Stress-/Planungskurs, **kein abgerufener aktueller Wechselkurs**. Operative Anbieterrechnung und Umrechnungsgebühren später ersetzen. |
| `inputTokens` / `outputTokens` |2000/384 | Geschätzter Verbrauch **pro Aufrufpaket**, nicht gemessen. Tool-Schema und Prompt sind mitzuzählen. Jeder der1–3 externen Suchrequests erhält konservativ auch einen Modellaufruf. Zusätzliche Erklärungs-/Antwortmodelle nur bei entsprechend erhöhten Werten/Aufrufen. |
| `attemptMultiplier` |1.15 |15 Prozent zusätzliche providerberechnete Arbeit pro abgearbeiteter Kontingentsuche für Fehler/erneute Versuche. Reine Annahme, keine automatische Wiederholung implementiert. Kostenverursachende Fehlläufe können anfallen, obwohl Nutzerkontingente nicht als erfolgreiche Suche verbraucht werden. |
| `safetyMarginRate` |0.25 |25 Prozent Reserve auf Provider- und Hosting-/sonstige Betriebskosten. Kein Umsatzbonus und keine Garantie, dass offene Kosten dadurch gedeckt wären. |
| `refundRate` |0.02 |2 Prozent Umsatzreserve vor Storeabzug; keine Rückerstattungsstatistik vorhanden. Bereits angefallene Storegebühren werden konservativ nicht zurückgebucht, API-Verbrauch bleibt vollständig. |
| `paymentFeeRate` / `paymentFeeRappen` |0/0 | Keine **zusätzliche** separate Kundenzahlungsgebühr neben Store Billing angenommen. RevenueCat ist keine Zahlungsabwicklung; keine Stripe-/externe Zahlung hinzugefügt. Abweichende echte Gebühren konfigurieren. |
| Monatsnutzung |100 Prozent | Alle MAU schöpfen ihr jeweiliges3-/25-Kontingent aus; keine erhoffte Nichtnutzung, kein Cachehit, keine Provision oder Werbeeinnahme. Plus-Anzahl=`floor(MAU×Anteil)`, Rest kostenlos. |

Ein Aufrufpaket kostet vor FX/Reserven:

```text
USD/Paket = 5/1000 + (2000 ×0.75 +384 ×4.50)/1000000 =0.008228
CHF/Suche = USD/Paket ×Aufrufe ×1.15 ×0.90 ×1.25
Suchen = Plus-Nutzer ×25 + kostenlose Nutzer ×3
Umsatz ohne MwSt. = Plus-Nutzer ×3.90 /1.081
Storegebühr = Umsatz ohne MwSt. ×Storegebührensatz
Erstattungsreserve = Umsatz ohne MwSt. ×0.02
Modellergebnis = Umsatz ohne MwSt. − sämtliche eingetragenen Kosten/Reserven
```

Wenn angegeben, erhöhen `providerPaymentFeeRate` und `providerTaxRate` die Providerkosten multiplikativ. `refundFeeRappen` erfasst zusätzliche Gebühren je erwarteter Erstattung. Die drei CHF-Monatsfelder ergänzen den Grundhost; die Kostenreserve gilt auch darauf. Output-Token, FX, Raten und Inklusivleistungen werden nicht als gemessene Rechnungsdaten ausgegeben.

Standardmässig **unbekannt** bleiben `providerPaymentFeeRate`, `providerTaxRate`, `refundFeeRappen`, `hostingUsageMonthlyChf`, `authAndDatabaseMonthlyChf` und `otherMonthlyChf`. Letzteres umfasst beispielsweise Authentifizierungs-/Mailgrundkosten, Entwicklerprogramme/Registrierung, Quellenlizenzen, Domain-/Backup-/Monitoringaufwand, Support, Akquisition und weitere tatsächliche Betriebspositionen, soweit nicht schon anders erfasst. Keine Position doppelt eintragen. Auch mit quantifizierten Kosten ist menschliche Arbeit/Qualität nicht automatisch abgegolten. Unbekannte Werte sind im JSON unter `unpricedCosts` aufgelistet. `modeledCostsChf`/`modeledOperatingResultChf` lassen sie ausdrücklich aus; `completeCostsChf`/`completeOperatingResultChf` bleiben dann **null**. `viability` ist immer `unconfirmed`, auch nach vollständig gesetzten Planannahmen.

## Reproduzierte Standardszenarien

Alle CHF-Angaben gerundet, mit15 Prozent zusätzlicher Arbeit und25 Prozent Reserve; offene Zusatzkosten **nicht enthalten**. Providerkosten pro kostenloser/Plus-Suche sind gleich, kostenloser Monatsverbrauch3 statt25. Es handelt sich um erwartete Kosten je vollständig genutztem Kontingent, keinen garantierten Kostenhöchstbetrag.

| Aufrufe je Suche | CHF je Suche | CHF je kostenlosem Konto/Monat | CHF je Plus-Konto API/Monat | Plus-Beitrag vor Hosting, bei voller RevenueCat-Rate |
|---:|---:|---:|---:|---:|
|1 |0.0106 |0.0319 |0.2661 |2.148 |
|2 |0.0213 |0.0639 |0.5322 |1.882 |
|3 |0.0319 |0.0958 |0.7984 |1.616 |

Der Beitrag berücksichtigt Steuerabzug,30 Prozent Store,2 Prozent Erstattungsreserve und konservativ1 Prozent RevenueCat auch unter dessen tatsächlicher Schwelle. Er ist kein Ertrag nach kostenlosen Nutzern oder Hosting. Bei15 Prozent Store erhöht sich dieser Beitrag um rund CHF0.541 je zahlender Person; eine entsprechende Berechtigung/Plattformverteilung muss belegt werden.

| MAU | Plus-Anteil | Modellergebnis1 Aufruf |2 Aufrufe |3 Aufrufe |
|---:|---:|---:|---:|---:|
|100 |5 Prozent |−14.60 |−18.96 |−23.33 |
|100 |10 Prozent |−3.50 |−9.04 |−14.57 |
|100 |20 Prozent |18.69 |10.81 |2.93 |
|1000 |5 Prozent |56.52 |12.88 |−30.77 |
|1000 |10 Prozent |167.47 |112.12 |56.77 |
|1000 |20 Prozent |389.38 |310.61 |231.84 |
|10000 |5 Prozent |767.70 |331.25 |−105.19 |
|10000 |10 Prozent |1838.25 |1284.71 |731.17 |
|10000 |20 Prozent |4018.34 |3230.61 |2442.88 |

Die enthaltene Hostingannahme beträgt CHF18 plus25 Prozent Reserve=CHF22.50/Monat. RevenueCat ist in diesen Ergebnissen erst bei tatsächlich erreichtem Schwellenumsatz abgezogen. Höhere absolute Nutzerzahlen garantieren bei negativem variablem Mischbeitrag keinen Gewinn.

## Tragfähigkeit, Schwellen und nächste Messung

Das JSON führt die Schwellen je Szenario. `standalonePlusUsersForFixedCosts` ist die aufgerundete Zahl allein zahlender Nutzer für die **eingetragenen** fixen Kosten. `sufficientMauForFixedCosts` berücksichtigt dagegen den gesamten kostenlosen Anteil. Es ist eine konservativ ausreichende Nutzerzahl, **kein exaktes Minimum**: bis zu eine durch Abrunden fehlende Plus-Person wird zusätzlich gepuffert. Beide Schwellen reservieren RevenueCat immer voll und unterschätzen deshalb nicht dessen Gebührensprung.

| Plus-Anteil | Genügende MAU bei1 Aufruf |2 Aufrufen |3 Aufrufen |
|---:|---:|---:|---:|
|5 Prozent |321 |732 |keine positive Mischmarge |
|10 Prozent |133 |188 |322 |
|20 Prozent |62 |76 |99 |

`minimumPlusShareAtMau` zeigt den erforderlichen kontinuierlichen Plus-Anteil bei der jeweiligen MAU-Zahl; ganze Nutzer und weitere Kosten später zusätzlich prüfen. `maxAffordablePlusSearchesAtMix` und `maxAffordableFreeSearchesAtMix` berechnen jeweils die maximal tragbare Zahl, wenn das **andere** Kontingent, der Nutzeranteil und die eingetragenen Fixkosten bestehen bleiben. `null` bedeutet keine positive Skalierungslösung beziehungsweise keinen Nenner/keine betreffende Kohorte;0 bedeutet kein finanzierbares Kontingent. Das sind Diagnosewerte, keine automatische Änderung oder zusätzlich angebotenen Tarife.

**Entscheidung:** CHF3.90 erscheint unter diesen expliziten Annahmen bei ausreichendem Plus-Anteil wirtschaftlich möglich, ist aber **nicht abgenommen**. Bei5 Prozent Plus und3 Aufrufen deckt das Modell schon seine eingetragenen Kosten nicht; mehr Nutzer allein lösen das nicht. Zuerst einen Aufruf je Suche anstreben und tatsächliche Erfolgsqualität prüfen. Wenn mehrere Aufrufe nötig sind, aus den ausgegebenen Kontingentgrenzen eine niedrigere Plus-/Free-Nutzung oder einen höheren erforderlichen Plus-Anteil ableiten und erst nach Nutzungsbeleg die konfigurierbaren Zielwerte entscheiden. Kein unbegrenztes Kontingent oder stiller Preiswechsel.

Nächste wertvolle Messung: begrenzter autorisierter vollständiger Suchlauf mit Input-/Output-Tokenzahl, tatsächlich berechneten Requests inklusive Fehlern, zulässigen Quellenprüfungen, nutzbaren Ergebnissen und Infrastrukturverbrauch. Nur aggregierte Kosten je Lauf speichern, keine dauerhaften sensiblen Promptinhalte. Echte Storeprodukte/-provisionen, RevenueCat-Abgrenzung, FX-/Kreditgebühren, Refunds und Betriebskosten danach gegen reale Konten/Rechnungen prüfen. Vor bezahltem Betrieb serverseitige atomare Kontingente, Kostenreservierung und harte Providerobergrenzen belegen; keine unbegrenzte automatische Kreditaufladung. Android-/iOS-Käufe, Anmeldungen und Geräteflüsse sind durch diese Offline-Rechnung **nicht geprüft**.

## Implementierung und Nachweisgrenze

Nur Node-Baustein/CLI, gezielte Fachtests und dieses Dokument; keine App-/Netzwerk-/Storeintegration. Reine Zahlenrechnung statt zusätzlicher Datenbank oder Tabelle gewählt, damit Eingaben, unvollständige Kosten und Grenzfälle wiederholbar geprüft werden. Tests zuerst ohne Modul fehlgeschlagen (`ERR_MODULE_NOT_FOUND`), danach überprüfbare Rechnungen für volle kostenlose Kohorte,1–3 Aufrufe, Fehleraufschlag/FX/Reserve, separate Store-/Erstattungsgebühren, RevenueCat-Schwelle, unbekannte Kosten, Verlustfälle, nötige Nutzerzahl, ungültige Konfiguration und Offline-CLI. Vollständige Projekt-/Browserprüfung und Sicherung bleiben Aufgabe der abschliessenden Integration; dieser Baustein behauptet keine native Abnahme.

## Ausgabenbegrenzung im lokalen Dienst

`scripts/provider-budget.mjs` reserviert vor jedem optionalen Gateway-Aufruf einen konfigurierten Höchstbetrag. Mehrere Prozesse auf demselben Betreiber-Datenträger teilen sich eine SQLite-Datei. Monatsschlüssel laufen nach UTC. Fehler, Abbrüche und leere Antworten bleiben in dieser konservativen Ausgabenschätzung enthalten. Automatische Anbieterwiederholungen sind deaktiviert. Die Datei speichert ausschliesslich den Monat und die Summe der Reservierungen.

Der lokale Entwicklungsdienst benötigt `AI_GATEWAY_API_KEY`, `UDI_SEARCH_MODEL`, den absoluten Pfad `UDI_BUDGET_DB` in einem geschützten vorhandenen Betreiberverzeichnis und die beiden positiven ganzzahligen Geldbeträge `UDI_BUDGET_MONTH_USD_MICROS` und `UDI_BUDGET_REQUEST_USD_MICROS` in Millionsteln eines US-Dollars. Ohne gültige Konfiguration bleibt der Katalogweg verfügbar. Die Reservierung je Anfrage muss anhand des gewählten Modells und aller beim Anbieter möglichen Tool-Aufrufe belegt werden. Der externe Gateway-Token- und Suchverbrauch bleibt separat zu messen. Für reale Ausgaben gilt zusätzlich ein bestätigtes Anbieterlimit inklusive anderer Aufrufer und automatischer Guthabenaufladung. Unabhängige Dateisysteme teilen keine gemeinsame Obergrenze.
