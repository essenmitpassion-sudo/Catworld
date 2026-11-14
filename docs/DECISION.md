# VERSATZ · Entscheidung und Red-Team, 15. November 2026

Die neue Rebirth-Anweisung ersetzt die frühere VEIL-spezifische Richtung. Vergleich und minimale vollständige Regeln für VERSATZ, NACHHALL und PFAND stehen im Design: `docs/superpowers/specs/2026-11-15-rebirth-design.md`. VERSATZ gewinnt die Auswahl wegen seiner kleinsten Regelmenge und einer unmittelbar sichtbaren Wechselwirkung. Keine Behauptung einer weltweiten Neuheit.

## Was die Verschiebung tatsächlich bewirkt

Ein horizontaler Schritt mit entgegengesetztem Versatz kann die eigene Figur am Ausgangsort belassen, während andere Figuren weiterwandern. Ein vertikaler Schritt verändert die Formation der neuen Reihe. Ein Gegner kann auf eine andere Angriffslinie oder sogar über den Rand transportiert werden. Direkte Schläge passieren vor dem Verschieben; auf dem Tor zwischenzulanden reicht nicht. Auch eine zweite eigene Figur kann durch den Versatz den Sieg erreichen. Das sind Konsequenzen derselben Kernregel, keine Zusatzfähigkeiten.

Beide Seiten sehen alles; Verteidigung kann einen Angriff durch Transport auflösen. Das Verschieben ist eine Bijektion innerhalb der Reihe und verursacht selbst keine Kollisionen/Schläge. Das am Ende des eigenen Zuges geprüfte Tor verhindert ein unbeabsichtigtes Gewinnen des Gegners während deiner Animation. Dreifache Wiederholung und 120 Halbzüge verhindern endloses Schieben. Der Eliminationsweg erzeugt Gegenwert zu reinen Torsprints und bleibt erhalten; weitere Siegbedingungen würden die Erklärung verlängern.

## Tatsächliche Evidenz

- 12 Node-Tests: wörtliche Grenzfälle, illegale/nichtmutierende Züge, Siegzeitpunkt, Wiederholung, Zuglimit, vollständige Rücknahme/Rekonstruktion, manipulierte Saves, unabhängiges Koordinaten-Orakel plus Rotation/Spiegelung, KI-Gewinn/Abwehr/Budget/Determinismus und vollständige Partien.
- 800 Turnierpartien; Seed, Formation, Startseite, Stilpaarung, Ergebnis und Trace-Hash pro Spiel in `playtest.json`. Bei verschiedenen Gegnern werden beide Farbzuweisungen UND beide Startrechte gespielt. 76 Remis (48 Wiederholung, 28 Limit), keine Sackgasse. 48,76 Halbzüge im gemischten Pool; diese Mischung ist keine typische menschliche Spielzeit.
- Zufällige Baseline: 320 Partien, 63,15 Halbzüge im Mittel, 47 Remis. Gleich starke taktische Gegner: 48 Partien, 24,21 Halbzüge, 34 Starter-/14 Nachziehersiege.
- Taktisch gegen Ein-Halbzug-KI: 64/64 Siege für Taktisch. Weitblick gegen Taktisch: 48/48 für Weitblick. Das belegt relative Stärke in dieser Stichprobe, keine allgemeine Spielstärke.
- Rennen gegen materialbetonte Politik: 28/64 Rennsiege, 36/64 Materialsiege. Keine der beiden einfachen Politiken ist überall überlegen. Taktisch gegen Rennen erzeugt dagegen 11/48 Remis: Stalls bleiben ein ernstzunehmendes Risiko.
- Vollständige beschränkte Eröffnungssuche: kein erzwungener Startersieg innerhalb von sieben Halbzügen aus kompakter Startstellung, 36.186 Suchknoten über Horizonte 1/3/5/7. Längere Gewinnfolgen sind ausdrücklich ungeklärt.
- 160 Zufallskontrollspiele mit automatisch alternierender Richtung: 66,07 Halbzüge, 18 Remis; nur 6,54 statt 13,28 legale Aktionen pro Zug im frei wählbaren Zufallspool. Der Zwang vereinfacht die Bedienung, reduziert aber Kontrolle und beschleunigt hier nicht. Keine Aussage zur starken KI unter automatischer Richtung; freie Wahl bleibt.

## Wichtigste Korrektur: Startformation

Folgeversuch mit je 64 depth3-Partien: kompakt 64 Starter-/0 Nachziehersiege, versetzt 19/45. Drei zusätzliche Formen wurden mit jeweils 24 Partien geprüft; Starter gewann 9, 5 bzw. 24 davon. Das beseitigt den Mythos, eine symmetrische Anordnung garantiere faire Initiative.

Versetzt wird der vorläufige Standard, weil der kompakte 100%-Effekt aus dieser Stichprobe reduziert wird. **19/64 ist ebenfalls keine Balance.** Es gibt keine künstliche Signalwährung. Revanche wechselt das Startrecht; das kompensiert nicht nachweislich jede einzelne Partie. Größere Suchhorizonte und menschliche Gegenstrategien müssen diesen Befund erst bestätigen. Vollständige Rohdaten: `balance-exploration.json`; reproduzieren mit `node scripts/balance.mjs`.

## Bedienung und unabhängige Prüfung

Vier vollständige tatsächliche Browser-Click-Matches: Hotseat 21 Halbzüge/Tor, menschliche Seite Elfenbein gegen KI 11/Elimination, menschliche Seite Jade auf neuer Standardformation gegen starke KI 15/Tor-Niederlage, Hotseat 32/Wiederholungsremis. Die menschlichen Seiten wurden automatisiert über echte UI-Eingaben gespielt; keine menschlichen Testpersonen und keine Belege für Spielspaß.

Vorschau wird pro Zug gegen das exakte vollständige Ergebnis einschließlich aller transportierten Gegner geprüft. Zusätzlich Rücknahme, Reload, Revanche mit Startwechsel, verweigerter Speicher, Regeln-Dialog und Layouts 320/390/768/1440px. Keine Runtime-Fehler. Die exakte Standalone-Datei wird am abgefangenen Test-Origin ausgeliefert; kein authentifizierter Hosted-Test und kein file://-Test behauptet.

Ein unabhängiger read-only Reviewer fand keine wichtigen Fehler an Regeln, Save-Rekonstruktion, Suche oder KI-Abbruch. Er verglich depth3 mit erschöpfendem Minimax an 31 erreichbaren Positionen. Zwei Animationsprobleme wurden gefunden: linker Wrap-Klon startete zu weit innen, und die Reihe bewegte sich vor Abschluss des Schritts. Wegen der zentralen visuellen Verständlichkeit wurden beide korrigiert. Gezielte Browser-Regressionen mit normaler Bewegung wurden jeweils rot beobachtet und danach grün. Die reduzierte Animation allein hätte diese Fehler nicht erkannt.

## Offene Produktfragen

Initiative ist nicht gelöst. Kein Beweis für langfristige Tiefe, Originalität gegenüber jedem existierenden Spiel oder freiwillige Wiederholung. Bots können Evaluation statt guter Strategie optimieren. Besonders Remis durch defensives Ausweichen und automatische Captures versus Torrennen sollten Menschen prüfen. Nächste sinnvolle Arbeit ist ein kurzer menschlicher Erstpartietest und eine tiefere gepaarte Untersuchung der Standardformation, kein zusätzliches System.
