# VERSATZ — Ein Schritt. Alles bewegt sich.

Ein kompaktes Strategiespiel für zwei: Ziehe eine Figur ein Feld und verschiebe die komplette Zielreihe – einschließlich gegnerischer Figuren. Erreiche das andere Tor oder schlage alle Gegner.

**Regeln v2:** Jeder vollständige Zug verändert das Brett oder gewinnt sofort. Reines Stehenbleiben durch Gegenverschiebung ist kein Zug. Andere Figuren mitzunehmen, während deine Figur zurückkehrt, bleibt erlaubt. Dadurch entstehen echte Tempo-Fallen.

Hotseat oder drei faire KI-Stufen; vollständige Zugvorschau mit konkreten sofortigen Gewinnantworten; räumlich getrennte Schritt-/Reihenanimation; Rücknahme, Replay, Revanche und lokale Speicherung. Ohne Konto, Backend oder Laufzeit-Netzwerk.

## Starten

Node22+:

```sh
npm ci
npm test
npm run build
```

`dist/VERSATZ.html` lässt sich anschließend als einzelne Datei im Browser öffnen. Sie enthält auch den KI-Worker. Alternativ `npm run dev`, dann `http://localhost:3000`; `PORT` ändert den Port.

Figur → markiertes Nachbarfeld → Versatz prüfen → bestätigen. Nicht erlaubte Leerzug-Richtungen sind erklärt und deaktiviert; die erste legale Richtung ist vorausgewählt. Das Vorschau-Brett ist schreibgeschützt. „Anderes Feld“ behält deine Figur bei. Fehlende sofortige Gewinnwarnung bedeutet keine Sicherheit gegen spätere Drohungen.

Elfenbein startet unten, Jade oben. Farbe/Startrecht/Aufstellung sind wählbar; Wechsel startet eine neue Partie. „Zu zweit“ erlaubt beide Seiten auf einem Gerät. Revanche wechselt das Startrecht. Alte v1-Spielstände bleiben in ihrer bisherigen lokalen Ablage erhalten und werden unter den geänderten Regeln nicht still weitergespielt.

## Prüfen

```sh
npm test
npm run build
npm run smoke
npm run smoke:counterplay
npm run smoke:active
npm run simulate          # 800 aktuelle Profile
npm run research          # 60 kontrollierte Regelmodell-Vergleiche
npm run research:endgames # exakte Tempo-Beweise v1/v2
```

Chromium: `/usr/bin/chromium`, über `CHROMIUM_PATH` überschreibbar. Browserprüfungen bedienen den tatsächlich gebauten HTML-Inhalt an einem abgefangenen Test-Origin; sie behaupten keine Live-Veröffentlichung. CI erzeugt dieselbe Standalone-Datei und stellt Prüfdaten als Artefakt bereit.

Regeln: [RULES.md](RULES.md). Aktuelle Entscheidung und Grenzen: [docs/PHASE_2.md](docs/PHASE_2.md). Fortsetzung: [CURRENT.md](CURRENT.md), [NEXT_TASK.md](NEXT_TASK.md).

**Forschungsprototyp:** Die neue Tempo-Regel erzeugt belegte taktische Gewinne, aber keine nachgewiesene Eröffnungsbalance oder menschlichen Spielspaß. Die bisherige kompakte Starterserie und die versetzte19/64-Serie gehören zu v1 und spezifischen Suchpolitiken. Historische Forschung bleibt getrennt reproduzierbar (`research:classic`, `research:endgames:v1`, `research:routes`); `research/rules-v1` ist reiner wissenschaftlicher Kontrollcode ohne Produktmodus.

Dieses Projekt ersetzt VEIL und davor das Catworld-Lernspiel. Geschichte vor den aktiven Zügen: Commit34a7e57 und Checkpoint `checkpoint/pre-active-rules-34a7e57`. Vollständige Git-Historie bleibt erhalten. Die frühere Sites-Veröffentlichung zeigt weiterhin VEIL; VERSATZ wird hier als Repository/Standalone gepflegt.
