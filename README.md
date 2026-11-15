# VERSATZ — Ein Schritt. Alles bewegt sich.

Ein kompaktes Strategiespiel für zwei. Ziehe eine Figur ein Feld und verschiebe danach die komplette Zielreihe – einschließlich gegnerischer Figuren. Erreiche das andere Tor oder schlage alle Gegner.

Hotseat oder drei faire KI-Stufen; vollständige Zugvorschau mit konkreter sofortiger Gewinnantwort; zweistufige Bewegung samt Randübergang; Rücknahme, Replay, Revanche und lokale Speicherung. Ohne Konto, Backend oder Laufzeit-Netzwerk.

## Starten

Node 22+:

```sh
npm ci
npm test
npm run build
```

Danach `dist/VERSATZ.html` herunterladen und im Browser öffnen. Die Datei enthält auch den KI-Worker und funktioniert ohne Server. Alternativ `npm run dev` und `http://localhost:3000` öffnen; `PORT` ändert den Port.

Wähle Figur → markiertes Nachbarfeld → Verschieberichtung. Das Brett zeigt das vollständige Ergebnis, bevor du „Zug ausführen“ drückst. Oben ist Jade, unten Elfenbein. Du kannst deine Seite und das Startrecht wählen. „Zu zweit“ gibt beide Seiten auf demselben Gerät frei. Revanche wechselt das Startrecht. Seite/Modus/Aufstellung/Startrecht wechseln beginnt eine neue Partie.

## Nachweise

```sh
npm run simulate          # 800 aktuelle Profile → docs/playtest-current.json
npm run smoke             # vollständige Browser-Partien und Vorschau/Animation
node scripts/balance.mjs # historischer Formationsvergleich, 200 Partien
npm run research        # 68 kontrollierte Horizont-/Bewertungs-/Gegenspielpartien
npm run benchmark       # identische Suchtiefe und begrenztes Budget vergleichen
npm run smoke:counterplay # konkrete Taktiken, Tastatur und alle KI-Stufen
```

Chromium: `/usr/bin/chromium`, überschreibbar mit `CHROMIUM_PATH`. Die Browser-Suite nutzt den tatsächlich gebauten HTML-Inhalt an einem abgefangenen Test-Origin. Sie prüft keine Live-Veröffentlichung. GitHub CI baut dieselben Artefakte; der Workflow stellt HTML und Prüfdaten als Download bereit.

Regeln: [RULES.md](RULES.md). Konzeptvergleich und kritische Befunde: [docs/DECISION.md](docs/DECISION.md). Exakte Turnierdaten: [docs/playtest.json](docs/playtest.json). Einstieg für die nächste Sitzung: [CURRENT.md](CURRENT.md), danach [NEXT_TASK.md](NEXT_TASK.md).

**Forschungsprototyp:** 800 Turnierpartien plus 200 Formationsversuche beweisen keinen Spielspaß. Startvorteil bleibt abhängig von Aufstellung und Politik; auch die versetzte Voreinstellung ist nicht nachweislich ausbalanciert. Kein Startersieg innerhalb einer Suche über sieben Halbzüge ist kein Beweis gegen längere erzwungene Gewinne.

Dieses Projekt ersetzt den früheren VEIL-Prototyp und davor das Catworld-Lernspiel entsprechend dem neuen Rebirth-Auftrag. Vollständige Historie vor dem Umbau: Commit `022f7f4`, lokaler Checkpoint `checkpoint/pre-rebirth-2026-11-15` und verifiziertes Git-Bundle in `work/pre-rebirth.bundle`. Die frühere Sites-Veröffentlichung zeigt weiterhin VEIL; sie ist keine Veröffentlichung von VERSATZ.

Die Folgeuntersuchung erklärt, weshalb eine neue Formation allein keine belegte Balancekorrektur wäre: Suchhorizont und gleich bewertete Zugalternativen kehren die Bot-Ergebnisse um. [docs/INTELLIGENCE.md](docs/INTELLIGENCE.md) dokumentiert Ursachen, Produktänderungen und Grenzen. Die alte 1.000-Partien-Evidenz gehört zum Stand `d46be8b`; neue Berichte nennen Baseline und Hashes ausdrücklich.


Taktisch und Weitblick berechnen Eins-gegen-eins-Endspiele jetzt vollständig unter den vorhandenen Wiederholungs- und Zuglimitregeln. Zwei früher bis Halbzug74 pendelnde Beispielpartien enden bei korrektem Gegenspiel bereits bei33. Das löst keine Mehrfigurenstellung und beweist keine Eröffnungsbalance. `npm run research:endgames` reproduziert die kontrollierten Fortsetzungen; [docs/endgames.json](docs/endgames.json) enthält ihre vollständigen Historien. Aktuelle800-Profil-Ergebnisse: [docs/playtest-current.json](docs/playtest-current.json). Die optional getestete geometrische Wegbewertung wurde wegen des negativen Tiefen-Gegenbefunds nicht zum Standard gemacht.
