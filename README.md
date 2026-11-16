# SAUM — Die wandernden Inseln

Ein eigenständiger Strategiespiel-Vertical-Slice für PROJECT UNCHARTED V5. Führe drei bewohnte Meeresriesen durch einen Sturm. Ihre Körper tragen Familien und schützen einander: Ein Rettungsumweg verändert die Formation, Eilen verbraucht Atem, Ruhen wird zum Schutzraum.

## Spielen

`play/SAUM.html` herunterladen und im Browser öffnen. Die Datei enthält das ganze Spiel, ohne Laufzeitnetzwerk oder Installation. Alternativ lokal mit Node 22+:

```sh
npm ci
npm run build
npm run dev
```

Dann `http://localhost:3000` öffnen. Der Build liegt in `dist/SAUM.html`. Im verwalteten Testbrowser ist `file://` administrativ gesperrt; die identische Datei wurde über HTTP und danach mit offline geschaltetem Browser interaktiv geprüft.

Ziel: 12 Familien bis zur 14. Tide ins östliche Ufer bringen. Riesen wählen, Kurs ziehen oder Regler nutzen, Tempo wählen und alle drei gleichzeitig bewegen. Details im Lotsenbuch. Tastatur: 1/2/3 wählen, Pfeile lenken, G/E/R für Gleiten/Eilen/Ruhen. Leertaste ausserhalb von Buttons löst die Tide aus; fokussierte Buttons behalten ihre normale Tastaturbedienung.

## Prüfen

```sh
npm test
npm run build
npm run smoke
npm run balance
```

Zusätzliche Regressionen bei laufendem `npm run dev`: `node scripts/input.mjs`, `node scripts/layout.mjs`; Darstellung der Rettungsfolge: `node scripts/feedback.mjs`. Chromium unter `/usr/bin/chromium` wird von den Browserchecks verwendet. Rohdaten/Screenshots landen in ignoriertem `work/` und sind jederzeit reproduzierbar.

12 Regeltests, 40 deterministische Stressläufe innerhalb der Suite; vollständige Browserpartien (Sieg/Verlust/Neustart), Maus/Kursregler/Tastatur, Bewegungssperre, Offline-Interaktion und vier Fensterbreiten. 60 Strategieläufe: Navigator 12/12 Siege; ohne Eilen 10/12; blindes Eilen 5/12; geradeaus und unveränderte Befehle 0/12. Das sind begrenzte automatische Nachweise, keine menschlichen Playtests und kein Beweis für Spielspass, Balance oder langfristige Tiefe.

## Projekt und Kontinuität

Aktive Produktdirektive: `docs/directives/MASTER_V5.md`. Anforderungen: `REQUIREMENTS.md`. Tatsächlicher Stand/einzige aktive Fortsetzung: `PROJECT_STATE.md`. Feste Konzeptentscheidung: `docs/DESIGN.md`.

Catworld und KIPPWERK bleiben in unveränderter Git-Historie und den dokumentierten Archiv-Referenzen wiederherstellbar. Kein Force-Push und keine Site-Veröffentlichung.
