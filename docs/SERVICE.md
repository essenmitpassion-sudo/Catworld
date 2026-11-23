# Gemeinsamer Angebotsdienst · Vertrag v1

Stand: Client implementiert, kein erreichbarer geschützter Dienst konfiguriert. Android und iOS benutzen `createDealClient` aus derselben Codebasis. Die App enthält weder Endpunkt noch Token, Schlüssel oder Testangebote. Der lokale Node-Prüfserver und dessen Host-/Origin-Schutz bleiben unverändert; er ist kein bereitgestellter nativer Dienst.

Selbstprüfung vom23.11.: `scripts/serve.mjs` implementiert den lokalen Pfad `/api/discovery`, jedoch weder `/api/v1/search` noch eine persönliche Anmeldung/Tokenprüfung. Es fehlen daher **Serverimplementierung und Zugriff**, nicht bloss eine URL-Einstellung. Der vorhandene Such-/Prüfkern kann wiederverwendet werden; Versionierung/Antwortvertrag, Authentifizierung, Zugriffstrennung und Quoten benötigen vor der nativen Live-Anbindung eine eigene Abnahme. Hostingfreigabe allein ist noch kein funktionierender Angebotsdienst. Native Anmeldung und geschützte Tokenablage sind ebenfalls nicht durch den Token-Callback erledigt.

## Integration

Der Betreiber muss einen geprüften öffentlichen HTTPS-Origin und exakt `https://<freigegebener-host>/api/v1/search` bereitstellen. Keine Benutzerinfo, Query, Fragmente, IP-/lokale Ziele oder Umleitungen. `approvedOrigin` muss unabhängig ausdrücklich passen. Es gibt keine automatische Wiederholung oder HTTP-Ausweichverbindung. Die native CSP bleibt bis zur tatsächlichen Dienstabnahme bei `connect-src 'none'`; eine beliebige URL aus einem Suchwunsch wird niemals zum Dienstziel.

`createDealClient({endpoint, approvedOrigin, getAccessToken})` erhält das kurzlebige persönliche Token ausschliesslich zur Laufzeit. Der Callback erhält ein Abbruchsignal und darf später eine geprüfte Anmeldung/geschützte native Tokenablage anbinden. Kein Token wird von diesem Client gespeichert, protokolliert, in die URL oder in den JSON-Body geschrieben. Sichere Anmeldung und Tokenablage sind noch zu implementieren; ein Callback ist kein Nachweis dafür. Eine unbekannte native Brücke bleibt auch mit konfiguriertem Client gesperrt.

## Anfrage und Antwort

Typen: `src/deal-types.d.ts`, automatisch geprüft mit `npm run typecheck`. POST mit `Authorization: Bearer <persönliches kurzlebiges Token>`, `Content-Type: application/json` und `Accept: application/vnd.udi.deals.v1+json`. Keine Cookies. JSON-Body enthält `schemaVersion:1`, eine zufällige 32-stellige Hex-`requestId`, `query`, `marketId:'CH'`, `deliveryCountry:'CH'`, `currency:'CHF'` und optionale bisherige Kriterien `scope`, `maxPrice`, `condition`, `completeCostsOnly`.

Erfolgsantwort: `schemaVersion:1`, dieselbe `requestId`, `dataMode:'live'`, `kind:'results'` oder `'clarification'`, derselbe Markt-/Liefer-/Währungskontext und genau die angewandten Kriterien `{maxTotal,condition,completeCostsOnly}`. Bei Ergebnissen zusätzlich `completedAt`, optional `sourceMode:'catalog'|'web'` und maximal drei `items`. Angebotsform und nullable Kosten stehen im Typvertrag; Identität/Quelle und konkrete URL müssen mit dem Check übereinstimmen. Nur aktuelle aktive HTTP200-Belege mit passenden Varianten werden akzeptiert. Kosten werden aus Ganzzahl-Rappen neu berechnet; unbekannte Kosten bleiben null, widersprüchliche Endpreise scheiden aus. Frische maximal fünf Minuten, keine Zukunftsbelege. Veraltete/doppelte Angebote bleiben nicht aktiv. Lieferung wird nie aus der Suchregion ergänzt.

Antworten nur als JSON, maximal64KiB auch bei Streaming; Timeout standardmässig10s einschliesslich Tokenbezug und Body. Suchabbruch stoppt Abruf/Leser, späte Tokens lösen keinen Abruf aus. HTTP401: Anmeldung abgelaufen;403: fehlendes Zugriffsrecht;429: ausgelastet;408/504: Timeout; andere Dienstfehler: nicht erreichbar. Rohtexte/HTML/Fehlerdetails und darin enthaltene mögliche Geheimnisse gelangen nicht zur Oberfläche.

## Tests und fehlender Zugang

Synthetische Testantworten stehen nur in Tests, mit eindeutigem Testtitel und `dataMode:'test'`. Der Standardclient weist sie ab. Nur ein ausdrücklich für Tests erstellter Client mit `allowTestData:true` gibt `testData:true` zurück. Die UI zeigt dafür eine Testkennzeichnung statt «Aktuell geprüft», keine behauptete echte Prüfzeit und keine Anbieter-/Passport-Aktion. Kein Demo-Endpunkt oder Testdatensatz wird in die native App eingebaut.

Für die tatsächliche Anbindung fehlen: freigegebener HTTPS-Endpunkt, Betreiberzugriff zum zugehörigen UDI-Dienst/Projekt, zulässige App-Origins (`https://localhost` für Android, `capacitor://localhost` für iOS), unterstütztes Anmeldeverfahren und persönliche Testnutzerrechte. Der Betreiber muss Zugriffstrennung, Quoten und reale Quellenprüfung anbieten. Erst dann sichere native Anmeldung/Tokenablage, eng begrenzte CSP und den Live-Ablauf auf beiden Plattformen abnehmen. Kein Hostingzugriff, keine externen Zugangsdaten und keine Bereitstellung werden für die Clientprüfung vorausgesetzt oder vorgetäuscht.
