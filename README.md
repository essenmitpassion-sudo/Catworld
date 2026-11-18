# Universal Deal Intelligence

Mit UDI kannst du die Samsung 990 PRO 2 TB ohne Kühlkörper live bei DQ Solutions prüfen. Für bekannte konkrete Katalogprodukte wird keine KI-Suche benötigt. Gib beispielsweise «Samsung 990 PRO 2 TB» oder «Samsung 990 PRO 2 TB bis CHF 500» ein. Preis, Lagerstatus und Herstellernummer werden von der konkreten Produktseite gelesen. Nicht belegte Kosten bleiben offen. Händlervergleich, Deal Passport und gespeicherte Suchwünsche ergänzen diesen Ablauf.

Die Suche berücksichtigt Budget und Zustand aus dem Kaufwunsch oder den aufklappbaren Kaufkriterien. Bekannte Kosten oberhalb des Budgets führen zum Ausschluss. Solange Gebühren offen sind, bleibt die Budgetpassung unbestätigt. Mit «Nur Angebote mit bestätigten Gesamtkosten» lassen sich solche Treffer ausblenden. Dieselben Kriterien gelten im Katalogvergleich und im Deal Passport.

Mit «Suche speichern» bleibt der Auftrag samt Budget, Zustand und Gebrauchtoption in der Watchlist dieses Browsers. «Erneut prüfen» führt den gespeicherten Auftrag mit seinen Kriterien neu aus. Die Watchlist umfasst bis zu 20 Suchaufträge. Speicherfehler werden angezeigt, bestehende Daten bleiben bei Lesefehlern erhalten. In Browsern mit Web Locks werden Änderungen an den gespeicherten Suchen zwischen Tabs serialisiert.

## Lokal starten

Node.js 24 und für den Browsertest Chromium, Chrome oder Edge.

```sh
npm ci
npm test
npm run build
npm run dev
```

Öffne [UDI im Browser](http://127.0.0.1:4173). Mit `npm run smoke` prüfst du die gebaute App in einem isolierten Chromium-Profil. Bei einem abweichenden Installationspfad setze `UDI_BROWSER` auf die Browserdatei.

`npm run live` prüft die echte Suche im Browser und öffnet den Direktlink bis zur passenden Händlerseite. Der Test braucht Internetzugang. Er führt keine Bestellung aus und verwendet keine KI-API.

## Optionale Websuche

Der lokale Server verwendet Vercel AI Gateway für die Suche nach konkreten Schweizer Händler- und Inseratsseiten. Setze serverseitig `AI_GATEWAY_API_KEY` und `UDI_SEARCH_MODEL` mit einer im Gateway verfügbaren Modell-ID aus `openai/`, `anthropic/` oder `google/`. Starte den Server danach neu. Die Aktivierung kann Gebühren auslösen. Setze das gewünschte Budget im Gateway und übermittle den Schlüssel über die lokale Umgebung oder einen Secret Store.

Ohne KI-Konfiguration bleiben die Live-Prüfung bekannter Katalogprodukte und die Watchlist nutzbar. Breite Web- und Gebrauchtmarktsuchen erfordern den Gateway-Zugang. Frei formulierte Suchen können eine Rückfrage zur Gebrauchtoption auslösen. Im Browser unterstütztes Diktat füllt das Suchfeld, der Nutzer prüft den Text und sendet ihn selbst. Je nach Browser verarbeitet dessen Spracherkennungsdienst Audio ausserhalb von UDI.

Die Suchansicht zeigt höchstens drei Angebote aus einer frischen Detailseitenprüfung. Noch offene Gesamtkosten bleiben gekennzeichnet. Für Suchergebnisse und Radar gilt eine gemeinsame Frischegrenze von fünf Minuten. Für Kaufempfehlungen müssen ausserdem vollständige Angebotsbeobachtungen vorliegen.

Der lokale Prüfer verwendet standardmässig `dq-solutions.ch`. Mit `UDI_VERIFY_DOMAINS` kann die Quellenliste angepasst werden. Die Adapter unterstützen zusätzlich `ricardo.ch` und `tutti.ch`. Eine Freigabe setzt die Prüfung der aktuellen Nutzungs- und Abrufbedingungen für den jeweiligen Betrieb voraus. Der Prüfer ruft ausschliesslich konkrete Adressen aus der serverseitigen Suche oder dem Katalog ab. Er folgt keinen Weiterleitungen, validiert und bindet öffentliche DNS-Adressen, begrenzt Zeit und Antwortgrösse und wertet eindeutige Schema.org-Angebotsdaten aus. DQ-Abrufe werden mindestens zehn Sekunden auseinandergehalten. Wiederholte identische Prüfungen innerhalb dieser Pause nutzen das vorherige Ergebnis mit unverändertem Prüfzeitpunkt. Zugriffssperren und fehlende Belege führen zum Ausschluss. Abgerufene Texte werden nicht gespeichert.

Prüfergebnisse werden lokal in `.udi/checks.json` mit URL, Prüfzeit, HTTP-Status und extrahierten Fakten gespeichert. Das Journal umfasst höchstens 200 Scans mit jeweils drei Prüfungen. Suchtexte und Schlüssel sind darin nicht enthalten. Gleichzeitige Schreibvorgänge laufen serialisiert mit atomarem Dateiaustausch. Sichere dieses Verzeichnis für eine Wiederherstellung des Einzelbetriebs.

Der Suchserver lauscht lokal auf `127.0.0.1` und begrenzt externe Suchanfragen auf sechs Suchläufe pro Minute. Ein Suchlauf prüft höchstens drei Detailseiten mit jeweils 2,5 Sekunden Zeitlimit. Für öffentlichen Mehrbenutzerbetrieb braucht es Authentifizierung und gemeinsam durchgesetzte Anfrage- und Budgetlimits.

## Angebotsdaten

Der Katalog enthält drei redaktionell zugeordnete Produktseiten. Die DQ-Seite wird beim Suchauftrag live geprüft. Der mitgelieferte Datensatz für vollständige Angebotsbeobachtungen ist leer. Kaufempfehlungen erfordern weiterhin vollständige, frische Daten und einen Vergleich mit passenden Alternativen.

`public/observations.json` ist die vertrauenswürdige Publikationsgrenze für freigegebene, nachvollziehbare Beobachtungen. Jede Zeile beschreibt genau eine Anbieter-URL und Variante mit `mpn`, `seller`, `url`, `finalUrl`, `checkedAt` in UTC mit Z, `currency` als CHF, `stock` als `in-stock` oder `out-of-stock`, `delivery` und den Kostenfeldern `price`, `shipping`, `taxes`, `imports`, `fees` in Rappen. Ein bereits enthaltener oder nachweislich entfallender Zuschlag zählt als 0. Unbekannte Beträge bleiben null. Der Import muss die Identität der Zielseite, Verkäufer, Preisumfang und Datenherkunft unabhängig belegen und eine spätere Abweichung oder einen fehlgeschlagenen Linkcheck publizieren können.

Das Frontend nutzt für Beobachtungen und Websuche nur seine eigene Origin. Die Watchlist speichert Produktnummern lokal. Es gibt keine Konten, Tracking-Einbindungen oder automatisierten Nachrichten.
