# AFTERLIGHT — ein kleiner lebendiger Bezirk

Separat spielbarer Richtungsprototyp nach dem Owner-Feedback „langweilig, nicht
schön“. Bestehendes NEONPAW bleibt über seinen bisherigen Starter zugänglich.
Dieser Prototyp prüft eine andere Spielidee; er ist noch kein fertiges Spiel.

## Spielen

[ZIP herunterladen](https://github.com/essenmitpassion-sudo/Catworld/archive/refs/heads/codex/masterplan-run-consistency.zip),
entpacken, unter Windows **start_afterlight_windows.bat** doppelklicken.
Python 3.12+ erforderlich; Abhängigkeiten werden beim ersten Start installiert.
Der Windows-Starter wurde hier nicht auf Windows ausgeführt.

Linux/macOS mit grafischem Desktop, im Projektordner:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
NEONPAW_DATA_DIR="$PWD/afterlight-data" .venv/bin/python -m neonpaw.district
```

Du hast eine Energieeinheit und drei dunkle Gebäude. Erkunde den Bezirk und
entscheide selbst, wo das Licht zuerst angeht. Gebäudekarten zeigen Position
und Wirkung; Klick auf ein Feld zeigt dessen Information. F1 erklärt die Befehle.
Keine Lektionen müssen vorher freigeschaltet werden.

## Was anders spielt

- Eine zusammenhängende isometrische Karte mit einem Kanal und zwei Übergängen.
- Werkstattstrom öffnet die Brücke; Gartenstrom lässt einen zweiten Weg wachsen.
- Strom in der Zuflucht bringt Katzen in den Bezirk.
- `toggle()` am Anschluss verteilt Energie um: Abschalten gibt sie zurück.
- Ein Akku auf der anderen Seite liefert einmal zwei zusätzliche Einheiten.
- Du wählst Reihenfolge und Wege. Alle drei Gebäude zu versorgen ist ein gemeinsames
  Ziel; es gibt keine Pflicht zur kürzesten Lösung oder einen Timer.

**Run arbeitet ab Nox’ aktuellem Standort weiter.** Die Welt bleibt zwischen
Programmen erhalten. Step führt höchstens eine Aktion aus; Stop hält an.
„Versuch zurück“ stellt die Welt vor dem letzten Programmstart wieder her.
„Bezirk neu“ setzt die ganze Welt zurück. Beide erhalten deinen Code.
In der isometrischen Ansicht erhöhen rechts/links die x-Koordinate und
unten/oben die y-Koordinate; die kleine Kompassanzeige zeigt die Bildschirmrichtung.

Unterstützt: vier Bewegungsbefehle, `toggle()`, `collect()` und begrenzte
`for ... in range(...)`-Schleifen. Maximal64 Aktionen, kein allgemeines Python.
Der geteilte Interpreter erklärt `gate_open()` hier als nicht anwendbar, da der
Bezirk keine Tor-Sensorregel besitzt. Keine Datei-/Netzwerk-/Prozessaktionen im Code.

Nur der eigene Programmtext wird lokal gespeichert, beim Windows-Starter unter
`afterlight-data/district-code.txt`. Die Welt startet beim Öffnen frisch.
Alte Entwürfe bleiben unberührt. Kein Upload, keine Telemetrie.

## Nächster Spielertest

Spiele fünf bis zehn Minuten ohne vorgezeigte Lösung. Danach:

1. War dir klar, was du selbst verändern kannst?
2. Welche Entscheidung oder Überraschung war interessant — falls eine?
3. Hast du freiwillig eine andere Energieverteilung oder Route probiert?
4. Wirkt diese räumliche Darstellung ansprechender? Was stört konkret?

Technische Tests und SDL-Ablauf sind Belege für Funktion, nicht für Freude oder
Lernerfolg. Das negative Owner-Feedback zum bisherigen Build bleibt gültig;
dieser Prototyp ist eine überprüfbare Antwort darauf, keine behauptete Widerlegung.
