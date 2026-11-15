# SOG

Ein gesetzter Stein zieht die nächsten Steine in vier Richtungen näher – auch gegnerische. Vier in einer Reihe gewinnen. Ein kompaktes Duell mit einer einzigen Aktion und sichtbaren gemeinsamen Folgen.

Der Nutzer hat SIGNALBRUCH wegen zu vieler Informationen und unverständlichem Einstieg verworfen und ausdrücklich einen neuen Kern im Catworld-Repository beauftragt. SOG ersetzt dieses Spiel. Der Master bleibt unter docs/SIGNALBRUCH_MASTER.md als allgemeiner Qualitätsauftrag erhalten; sein Netzprinzip ist eine verworfene Hypothese. [Entscheidungen und Grenzen](docs/DECISION.md), [Regeln](RULES.md), [aktueller Stand](CURRENT.md).

```sh
npm ci
npm test
npm run build
npm run simulate
npm run paired
npm run smoke
```

Node 22+, hier 24. Die Standalone-Datei `dist/SOG.html` funktioniert ohne Laufzeitdienste oder externe Assets. `dist/index.html` ist derselbe Hosting-Build. Browserprüfungen verwenden vorhandenes Chromium (`/usr/bin/chromium`, überschreibbar mit `CHROMIUM_PATH`) und bedienen den exakten Build an einer abgefangenen Testadresse. Kein Vorschau-Server erforderlich.

Reiner deterministischer Regelkern `src/engine.js`, öffentliche begrenzte KI `src/ai.js`, Darstellung/Eingabe/Speicher `src/main.js`. Keine neuen Abhängigkeiten. Die Oberfläche beginnt direkt mit dem Brett; Hilfe bleibt optional. Atomare Speicherung, abbrechbare Animation/KI, Rückgängig, Neustart und schreibgeschützter Verlauf sind vorhanden.

Spieladresse bleibt https://veil-signal-duel.docile-eel-0528.chatgpt.site (private bestehende Site, historischer URL-Name). Den tatsächlich veröffentlichten Commit dokumentiert CURRENT.md. Quell-Branch `strategy/sog-prototype`; die unabhängig weiterentwickelte VERSATZ-Standardbranch bleibt erhalten.

Technische Funktion wird durch Regeltests, vollständige Simulationen und Browserbedienung geprüft. Startbalance, menschlicher Spielspass, Partiedauer und langfristiger Wiederspielwert sind offen. Keine Weltneuheitsbehauptung: Bewegung und Reihenbildung haben bekannte Vorbilder, siehe Designentscheidung. Alte Spiele und Berichte bleiben über Git rekonstruierbar.
