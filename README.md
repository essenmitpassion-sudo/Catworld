# CATWORLD / NEONPAW — Licht für Nox

Nox sitzt vor einem dunklen Nacht-Automaten. Dein Programm bringt das Licht zurück.
Ein kurzer Abschnitt: beobachten, selbst ergänzen, den zweiten Anschluss lösen und
den eigenen Plan ohne Vorlage schreiben.
`move_right()` bewegt die Katze genau ein Feld nach rechts.
`collect()` nimmt die Batterie auf dem Leuchtfeld auf und schaltet den verbundenen Automaten ein.

![Licht für Nox — Abschnitt abgeschlossen](evidence/recall-solved.png)

## Start (Python 3.12 oder neuer)

Windows: Python von python.org installieren (Python zum PATH hinzufügen),
diesen Projektordner entpacken und `start_windows.bat` doppelklicken.
Beim ersten Start werden pygame-ce und Testwerkzeuge installiert (Internet nötig).
Danach läuft das Spiel offline. Der Windows-Start ist dokumentiert, aber hier
nicht auf Windows ausgeführt worden.

Linux / macOS, Terminal im Projektordner:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m neonpaw
```

Ein grafischer Desktop ist für das Spielfenster nötig. In der Cloud wurde die
SDL-Oberfläche offscreen gerendert und über ihre Ereigniswarteschlange geprüft.

## Diesen Abschnitt ausprobieren

1. Run drücken und Nox beim ersten Schritt beobachten.
2. Eigenen Code für die Batterie ergänzen. Der Automat und die Lampenkette reagieren.
3. **Weiter / F3:** den zweiten Anschluss mit einer selbst geänderten Folge versorgen.
4. **Selbst schreiben / F4:** aus leerem Editor einen eigenen Plan bauen.
5. **Dachweg / F7:** die weiter entfernte Dachlaterne erreichen. Erst bekannte Schritte
   ausprobieren; nach erlebter Wiederholung bietet F1 freiwillige Hilfe zu `for`/`range`.
   Schreibe deinen Plan selbst. Zurück / F7 erhält deinen bisherigen Entwurf.

Hilfen bleiben freiwillig. Tippfehler wie `move_rigth()` geben einen konkreten Hinweis,
ändern den Text aber nicht. Nox bewegt sich animiert, blinzelt und reagiert auf Erfolg;
die Simulation bleibt unabhängig von diesen Darstellungsdetails.

## Spielen

- **Run / F5:** führt deinen Code aus, ein Befehl alle 0,45 Sekunden.
- **Step / F6:** führt genau einen Befehl aus; unterbricht laufenden Run.
- **Stop / Esc:** verwirft die laufende Ausführung, Position und Code bleiben.
- **Reset / F2:** setzt das aktuelle Szenario und die Ausführung zurück; dein Code bleibt erhalten.
- **Hilfe / F1:** optional Beobachtung → Denkhinweis → ausdrücklich angefordertes Codebeispiel.
- **Weiter / Freier Einstieg / F3:** wechselt zwischen Einstieg und Transfer; Code bleibt erhalten.
- Klicke ins Codefeld. Pfeile, Home/End, Enter, Backspace/Delete und Strg+A funktionieren.
- Im **Einstieg** beginnt ein neuer Run nach Ende oder Stop den Code wieder von vorn,
  an der aktuellen Position. Reset bringt die Katze zum Start zurück.
- In der **Transferaufgabe** beginnt jeder neue Versuch (Run oder Step nach Ende, Stop,
  Fehler oder Editieren) am Szenariostart. Step pausiert nach einem Befehl; Run setzt
  einen pausierten Versuch fort. Unveränderter Code gewinnt nicht durch mehrfache Runs.
- Ein Edit stoppt die Ausführung. Der nächste Run prüft den gesamten neuen Code.

Ziel: Strom für die Gasse. Starte mit dem vorgegebenen `move_right()`. Auf dem
Leuchtfeld erklärt das Spiel den nächsten Befehl. Ergänze selbst eine zweite Zeile:

```python
move_right()
collect()
```

Drücke **Reset**, dann **Run**, um das ganze Programm ab Start auszuführen.
Die Batterie verschwindet; Kabel und Automat leuchten. Step zeigt den Unterschied
zwischen Bewegen und Aufnehmen einzeln. Ein collect am falschen Ort oder nach dem
Aufnehmen erklärt den Fehler; Reset stellt Batterie und Automaten wieder her.
Am Ende der Gasse bleibt die Bewegung sicher begrenzt.

Die unterstützte Python-Teilmenge umfasst parameterlose `move_right()`- und `collect()`-Aufrufe, Kommentare,
Leerzeilen und Python-Anweisungssequenzen sowie begrenzte `for name in range(...)`-Schleifen.
`range` akzeptiert ein bis drei ganzzahlige Literale von -64 bis 64; Schrittweite null
ist ungültig. Höchstens 64 Schleifendurchläufe insgesamt und 64 ausgeführte Aktionen.
Keine Verschachtelung, Variablenverwendung oder weiteren Python-Funktionen.
Step führt auch in Schleifen genau eine Aktion aus; Run setzt pausierte Versuche fort.
Enter übernimmt die Einrückung, Tab/Shift+Tab rückt ein/aus. Kein vollständiger Python-Interpreter.

## Vom Vormachen zum eigenen Programm

Der erste vorgegebene Befehl zeigt nur die Bedienung. Nach dem Batterie-Erfolg führt
**Weiter: neuer Weg** zu einer Batterie, die ein Feld weiter liegt. Dein bisheriger
Code reist mit; er wird nicht automatisch angepasst. Beobachte das Ziel und ändere
selbst die Befehlsfolge. Erfahrene Spieler können mit **Freier Einstieg** sofort
zur Transferaufgabe wechseln. Beide Szenarien verwenden dieselbe Simulation.

Hilfe erscheint ausschliesslich auf Klick. Nach zwei Tipps steht auf dem Button
**Beispiel anzeigen**. Erst dieser weitere Klick zeigt Code, ohne ihn einzusetzen
oder auszuführen. Solche Versuche werden als „mit Codebeispiel“ gekennzeichnet;
Reset löscht diese Kennzeichnung nicht. Sie ist nur eine Sitzungsanzeige, kein
Lernnachweis oder dauerhaftes Profil.

## Selbst aufbauen — ohne Vorlage

Nach einem erfolgreichen Transfer erscheint **Selbst schreiben / F4**.
Der bekannte Auftrag startet mit leerem Editor. Schreibe die Folge selbst;
die drei Hilfestufen bleiben optional. Deine bisherige Eigenlösung wartet unter
**Zur Eigenlösung / F4** (auch F3). Auch ein unfertiger Abrufentwurf bleibt beim
Zurückwechseln erhalten. Reset setzt nur die Welt zurück, nicht deinen Text.

Beim Wechsel innerhalb der Sitzung bleiben beide Texte, Cursor und Hilfestatus
erhalten. Beide Texte sowie der getrennte Dachweg-Entwurf und verwendete Beispiele werden zusätzlich
lokal gespeichert und nach einem Spielneustart wiederhergestellt. Die Welt startet
am Anfang; geladener Code läuft erst nach Run oder Step.
Ein leeres Programm schaltet den Automaten nicht ein. Erfolg zeigt die Weltreaktion,
beweist aber nicht, dass der Spieler die Reihenfolge selbst verstanden hat.

## Eigene Programme bleiben erhalten

Das Spiel speichert geänderte Entwürfe automatisch. **Strg+S** speichert zusätzlich
manuell oder versucht es nach einem Schreibfehler erneut. Die Meldung unten zeigt,
ob das Speichern funktioniert hat. Bei Speicherfehlern bleibt der Code im Editor;
vor dem Schliessen die Meldung beachten.

Standardort: Windows `%LOCALAPPDATA%\.neonpaw\drafts.json`, Linux/macOS
`~/.neonpaw/drafts.json`. Die letzte gültige Fassung liegt daneben als `drafts.bak`.
Bei beschädigter Hauptdatei wird eine gültige Sicherung geladen und dies angezeigt.
Ohne gültige Sicherung bleibt die Datei unangetastet; **Strg+S** speichert auf
Wunsch einen neuen Entwurf und erhält die beschädigte Datei als `drafts.damaged-*`.
Kein Cloud-Upload, keine Ausführung geladener Texte, keine Speicherung von Weltpositionen.

Für portable oder eingeschränkte Umgebungen kann `NEONPAW_DATA_DIR` auf einen
beschreibbaren Ordner gesetzt werden. Tests/Smoke verwenden ausschliesslich temporäre
Dateien und überschreiben keine persönlichen Programme.

## Nachweise

```sh
.venv/bin/python -m pytest -q
SDL_VIDEODRIVER=offscreen SDL_AUDIODRIVER=dummy .venv/bin/python -m tests.smoke_app
```

Windows-Tests: `.venv\Scripts\python.exe -m pytest -q`.
RED/GREEN/Refactor-Ausgaben und Bilder stehen in `evidence/`.
Automatisierte Prüfungen sind kein menschlicher Bedienbarkeits- oder Spielspassnachweis.
Siehe `CURRENT.md`, `SAFETY_AND_EXECUTION.md` und `G0_SECURITY.md`.

Langfristige Vorgaben: `PRODUCT.md`, `LONG_TERM_DESIGN.md`, `TUTORIAL_SYSTEM.md`.
G0 ist technisch abgeschlossen; dieser Build verbindet Batterie, Transfer und Abruf zu einem kleinen Abschnitt mit sichtbarem Abschluss. Keine Stadt-, Flotten- oder Cloud-Spielsysteme.
