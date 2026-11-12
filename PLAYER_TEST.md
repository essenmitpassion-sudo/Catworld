# Erster Spielertest — 10 Minuten

Status: bisheriger Testaufbau. Owner-Feedback zum bisherigen Stand: „super langweilig,..nicht schön“.
Keine beobachtete Testsitzung mit Gerät/Spieldauer dokumentiert.
Der neue Richtungsprototyp und sein Testauftrag stehen in [AFTERLIGHT.md](AFTERLIGHT.md).
Spielstand des Builds: 51dffbd (282 automatisierte Tests und SDL-Smoke bestanden).
Ziel: Prüfen, ob der Einstieg verstanden wird und freiwillige Neugier entsteht.
Keine neue Mechanik ist Voraussetzung für diesen Test.

## Start

[Testbuild als ZIP herunterladen](https://github.com/essenmitpassion-sudo/Catworld/archive/a36bc1160ce5ab8a922b7b033cc41ad17a50d13a.zip),
vollständig entpacken. Python 3.12 oder neuer ist erforderlich.
Der erste Start installiert die Abhängigkeiten mit Internetzugang.

Windows: `player_test_windows.bat` doppelklicken. Das Spiel verwendet einen eigenen
Ordner `player-test-data` neben dem Starter. Bestehende persönliche Spielstände
werden nicht geladen oder überschrieben. Wiederholte Starts erhalten diesen
Test-Spielstand. Für einen weiteren frischen Teilnehmer den Testordner vorher
umbenennen und aufbewahren.

Linux/macOS im entpackten Projektordner (grafischer Desktop erforderlich):

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
NEONPAW_DATA_DIR="$PWD/player-test-data" .venv/bin/python -m neonpaw
```

Windows-Start wurde hier nicht auf Windows ausgeführt. Ein Startfehler zählt als
Zugangsproblem des Produkts; bitte die Fehlermeldung festhalten.

## Für die spielende Person

Spiele zehn Minuten und versuche, Nox Licht in die Gasse bringen zu lassen.
Nutze die Hinweise im Spiel, wenn du sie brauchst. Du darfst experimentieren,
Fehler machen oder jederzeit aufhören. Es gibt keine vorgegebene Codeantwort.
Sprich nach Möglichkeit aus, was du erwartest und was dich überrascht.

Danach genügen diese drei Antworten:

1. Wo warst du zum ersten Mal unsicher oder festgefahren?
2. Was wolltest du nach dem ersten Erfolg selbst ausprobieren — falls überhaupt?
3. Würdest du jetzt freiwillig weiterspielen? Warum oder warum nicht?

## Für die beobachtende Person — erst nach dem Spielen lesen

Nicht vorführen, welche Befehle einzugeben sind. Nicht zum Weiterspielen drängen.
Bei einer Frage zunächst notieren, was unklar war; Hilfe darf jederzeit gegeben
werden, muss aber als Hilfe im Ergebnis stehen. Kein Abbruch ist ein Versagen
der Testperson.

Notiere Zeit bis zur ersten eigenen Änderung und ersten sichtbaren Wirkung,
erste Blockade, genutzte Hilfestufe und wörtliche Aussagen. Unterscheide Beobachtung
von Interpretation. Nach dem ersten Erfolg kurz fragen, was der Code bewirkt hat.
Wenn die Person von selbst weitergeht: Kann sie den Plan an das veränderte Ziel
anpassen? Eine korrekte Erklärung und eigene Anpassung liefern einen ersten
Transferhinweis; ein erfolgreicher Run allein liefert ihn nicht.

| Beobachtung | Ergebnis (leer bis tatsächlich beobachtet) |
| --- | --- |
| Datum, Betriebssystem, Build-Commit | |
| Programmiererfahrung (freiwillig) | |
| Start ohne Unterstützung möglich? | |
| Erste eigene Änderung / sichtbare Wirkung nach … | |
| Erste Blockade und benötigte Hilfe | |
| Eigene Erklärung der Codewirkung | |
| Anpassung beim veränderten Ziel / Hilfe dabei | |
| Freiwilliges Experiment oder Weiterspielen | |
| Wörtliches Feedback | |

Keine personenbezogenen Daten nötig. Keine automatische Telemetrie oder Übertragung.
Feedback kann direkt im Chat gegeben werden.

## Entscheidung nach dem Test

Zuerst den frühesten reproduzierbaren Zugangs- oder Verständnisfehler beheben.
Falls der Ablauf verstanden wird, aber kein eigener Experimentierwunsch entsteht,
Spielentscheidung und Weltwirkung verbessern; weitere Lektionen sind dann keine
belegte Lösung. Erst danach die vorgeschlagene zweite Route bewerten.
Ein einzelner Test liefert Hinweise, keine allgemeine Aussage über Spielspass
oder Lernerfolg. Danach möglichst mit weiteren unerfahrenen Personen prüfen.

Bezug zum Masterprompt: Abschnitte 3 (Game First), 5 (Verstehen), 10 (Einstieg),
14 (echtes Spielen) und 15–18 (Priorisierung und kritische Weiterentwicklung).
