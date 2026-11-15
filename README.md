# SIGNALBRUCH

Ein kleines Strategiespiel über verzögerte Signale, autonome Siedlungen und gemeinsame Weichen. Du veränderst Wege und Zeitpunkte: Ein Signal unterwegs gehorcht noch dem alten Ziel, ein wartendes Signal kann umgeleitet oder für einen riskanten Gegenangriff übernommen werden.

Drei Aktionen: **Senden**, **Umleiten**, **Übernehmen**. Eine Partie Mensch gegen regelkonforme KI bis zum Ausfall einer Zentrale oder Remis nach 24 Netztakten. Die vollständigen Regeln stehen in [RULES.md](RULES.md) und direkt im Spiel. Automatisches Speichern, Neustart, wiederholbare Netze und ein unverändernder Verlauf sind vorhanden.

```sh
npm ci
npm test
npm run build
npm run simulate
npm run paired
npm run smoke
```

Node 22+; hier Node 24. Öffne `dist/SIGNALBRUCH.html` für die vollständig eigenständige Offlinefassung; `dist/index.html` ist der gleiche Hosting-Build. Keine Laufzeitdienste, Konten, Fonts oder externen Assets. Browserprüfungen benötigen installiertes Chromium: `/usr/bin/chromium`, alternativ `CHROMIUM_PATH`. Sie bedienen den exakten Build an einer abgefangenen Testadresse, ohne Vorschau-Server.

Spieladresse: https://veil-signal-duel.docile-eel-0528.chatgpt.site (bestehende private Site, historischer URL-Name). Den tatsächlich veröffentlichten Stand dokumentiert [CURRENT.md](CURRENT.md).

`src/engine.js` enthält den deterministischen Regelkern, Zugvalidierung, Prognosen und Rekonstruktion gespeicherter Partien. `src/ai.js` nutzt ausschliesslich denselben öffentlichen Zustand und dieselben legalen Übergänge. `src/main.js` und `src/style.css` enthalten Darstellung, Eingabe und lokale Speicherung. Simulations- und Browsernachweise werden unter `work/signalbruch-*` erzeugt; aktuelle Berichte stehen in `docs/`.

SIGNALBRUCH ersetzt das verworfene VEIL vollständig. Catworld und VEIL bleiben über Git rekonstruierbar; es gibt keinen parallelen Altspielmodus. Der aktuelle Auftrag steht in [docs/SIGNALBRUCH_MASTER.md](docs/SIGNALBRUCH_MASTER.md). Entscheidungen und Grenzen: [docs/DECISION.md](docs/DECISION.md). Technische Funktionsfähigkeit ist getestet. Menschlicher Spielspass, Wiederspielwert und die angestrebten 5–10 Minuten sind noch nicht gemessen. Die gepaarte Botsimulation zeigt weiterhin einen Startreihenfolge-Vorteil.
