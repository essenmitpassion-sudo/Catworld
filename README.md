# VERSATZ — Ein Schritt. Alles bewegt sich.

Ein kompaktes Strategiespiel für zwei. Ziehe eine Figur ein Feld und verschiebe danach die komplette Zielreihe – einschließlich gegnerischer Figuren. Erreiche das andere Tor oder schlage alle Gegner.

Hotseat oder drei faire KI-Stufen; vollständige Zugvorschau; zweistufige Bewegung samt Randübergang; Rücknahme, Replay, Revanche und lokale Speicherung. Ohne Konto, Backend oder Laufzeit-Netzwerk.

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
npm run simulate          # 800 reproduzierbare terminale Partien
npm run smoke             # vollständige Browser-Partien und Vorschau/Animation
node scripts/balance.mjs # gezielter Formationsvergleich, 200 Partien
```

Chromium: `/usr/bin/chromium`, überschreibbar mit `CHROMIUM_PATH`. Die Browser-Suite nutzt den tatsächlich gebauten HTML-Inhalt an einem abgefangenen Test-Origin. Sie prüft keine Live-Veröffentlichung. GitHub CI baut dieselben Artefakte; der Workflow stellt HTML und Prüfdaten als Download bereit.

Regeln: [RULES.md](RULES.md). Konzeptvergleich und kritische Befunde: [docs/DECISION.md](docs/DECISION.md). Exakte Turnierdaten: [docs/playtest.json](docs/playtest.json). Einstieg für die nächste Sitzung: [CURRENT.md](CURRENT.md), danach [NEXT_TASK.md](NEXT_TASK.md).

**Forschungsprototyp:** 800 Turnierpartien plus 200 Formationsversuche beweisen keinen Spielspaß. Startvorteil bleibt abhängig von Aufstellung und Politik; auch die versetzte Voreinstellung ist nicht nachweislich ausbalanciert. Kein Startersieg innerhalb einer Suche über sieben Halbzüge ist kein Beweis gegen längere erzwungene Gewinne.

Dieses Projekt ersetzt den früheren VEIL-Prototyp und davor das Catworld-Lernspiel entsprechend dem neuen Rebirth-Auftrag. Vollständige Historie vor dem Umbau: Commit `022f7f4`, lokaler Checkpoint `checkpoint/pre-rebirth-2026-11-15` und verifiziertes Git-Bundle in `work/pre-rebirth.bundle`. Die frühere Sites-Veröffentlichung zeigt weiterhin VEIL; sie ist keine Veröffentlichung von VERSATZ.
