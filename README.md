# Universal Deal Intelligence

Mit UDI kannst du die Samsung 990 PRO 2 TB ohne Kühlkörper suchen, die bekannten Schweizer Händlerseiten vergleichen, den Deal Passport öffnen und das Produkt im eigenen Browser beobachten.

## Lokal starten

Node.js 24 und für den Browsertest Chromium, Chrome oder Edge.

```sh
npm ci
npm test
npm run build
npm run dev
```

Öffne [UDI im Browser](http://127.0.0.1:4173). Mit `npm run smoke` prüfst du die gebaute App in einem isolierten Chromium-Profil. Bei einem abweichenden Installationspfad setze `UDI_BROWSER` auf die Browserdatei.

## Optionale Websuche

Der lokale Server verwendet Vercel AI Gateway für die Suche nach konkreten Schweizer Händler- und Inseratsseiten. Setze serverseitig `AI_GATEWAY_API_KEY` und `UDI_SEARCH_MODEL` mit einer im Gateway verfügbaren Modell-ID aus `openai/`, `anthropic/` oder `google/`. Starte den Server danach neu. Die Aktivierung kann Gebühren auslösen. Setze das gewünschte Budget im Gateway und übermittle den Schlüssel über die lokale Umgebung oder einen Secret Store.

Ohne Konfiguration bleiben der lokale Katalog und die Watchlist nutzbar. Frei formulierte Suchen können eine Rückfrage zur Gebrauchtoption auslösen. Im Browser unterstütztes Diktat füllt das Suchfeld, der Nutzer prüft den Text und sendet ihn selbst. Je nach Browser verarbeitet dessen Spracherkennungsdienst Audio ausserhalb von UDI.

Die Suche gibt unbestätigte Fundstellen ohne Preis- oder Bestandswerte aus. Für Empfehlungen gelten weiterhin die Angebotsbeobachtungen. Der Suchserver lauscht lokal auf `127.0.0.1` und begrenzt externe Anfragen auf sechs Suchläufe pro Minute und zwei gleichzeitig. Für öffentlichen Mehrbenutzerbetrieb braucht es Authentifizierung und gemeinsam durchgesetzte Anfrage- und Budgetlimits.

## Angebotsdaten

Der Katalog enthält zwei redaktionell zugeordnete Produktseiten. Aktuelle Angebote setzen zulässige Beobachtungen voraus. Der mitgelieferte Datensatz ist leer. Die App zeigt in diesem Zustand weder aktuelle Preise noch Kaufempfehlungen.

`public/observations.json` ist die vertrauenswürdige Publikationsgrenze für freigegebene, nachvollziehbare Beobachtungen. Jede Zeile beschreibt genau eine Anbieter-URL und Variante mit `mpn`, `seller`, `url`, `finalUrl`, `checkedAt` in UTC mit Z, `currency` als CHF, `stock` als `in-stock` oder `out-of-stock`, `delivery` und den Kostenfeldern `price`, `shipping`, `taxes`, `imports`, `fees` in Rappen. Ein bereits enthaltener oder nachweislich entfallender Zuschlag zählt als 0. Unbekannte Beträge bleiben null. Der Import muss die Identität der Zielseite, Verkäufer, Preisumfang und Datenherkunft unabhängig belegen und eine spätere Abweichung oder einen fehlgeschlagenen Linkcheck publizieren können.

Das Frontend nutzt für Beobachtungen und Websuche nur seine eigene Origin. Die Watchlist speichert Produktnummern lokal. Es gibt keine Konten, Tracking-Einbindungen oder automatisierten Nachrichten.
