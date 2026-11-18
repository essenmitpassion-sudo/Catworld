# Universal Deal Intelligence

Mit UDI kannst du die Samsung 990 PRO 2 TB ohne Kühlkörper suchen, die bekannten Schweizer Händlerseiten vergleichen, den Deal Passport öffnen und das Produkt im eigenen Browser beobachten.

## Lokal starten

Node.js 24 und für den Browsertest Chromium, Chrome oder Edge.

```sh
npm test
npm run build
npm run dev
```

Öffne [UDI im Browser](http://127.0.0.1:4173). Mit `npm run smoke` prüfst du die gebaute App in einem isolierten Chromium-Profil. Bei einem abweichenden Installationspfad setze `UDI_BROWSER` auf die Browserdatei.

## Angebotsdaten

Der Katalog enthält zwei redaktionell zugeordnete Produktseiten. Aktuelle Angebote setzen zulässige Beobachtungen voraus. Der mitgelieferte Datensatz ist leer. Die App zeigt in diesem Zustand weder aktuelle Preise noch Kaufempfehlungen.

`public/observations.json` ist die vertrauenswürdige Publikationsgrenze für freigegebene, nachvollziehbare Beobachtungen. Jede Zeile beschreibt genau eine Anbieter-URL und Variante mit `mpn`, `seller`, `url`, `finalUrl`, `checkedAt` in UTC mit Z, `currency` als CHF, `stock` als `in-stock` oder `out-of-stock`, `delivery` und den Kostenfeldern `price`, `shipping`, `taxes`, `imports`, `fees` in Rappen. Ein bereits enthaltener oder nachweislich entfallender Zuschlag zählt als 0. Unbekannte Beträge bleiben null. Der Import muss die Identität der Zielseite, Verkäufer, Preisumfang und Datenherkunft unabhängig belegen und eine spätere Abweichung oder einen fehlgeschlagenen Linkcheck publizieren können.

Das Frontend ruft nur seine eigene Beobachtungsdatei ab. Die Watchlist speichert Produktnummern lokal. Es gibt keine Konten, Tracking-Einbindungen oder automatisierten Nachrichten.
