# Torzustand lesen und bedingt handeln

Owner: autonome Fortsetzung bis verfügbarer Grenze, sichern nach jedem Paket.
Masterplan: Systemverständnis, echte Bedingungen, Transfer und sichere Ausführung.
Basis 3018555. Python/pygame behalten; kein allgemeiner Interpreter.

## Kleiner Sprachumfang
`if gate_open():` und `if not gate_open():` nur auf oberster Ebene. Körper enthält
parameterlose Weltaktionen. Kein else/elif, kein geschachteltes if/for, keine Variablen
oder beliebigen Aufrufe. Unterstützte Konstrukte folgen ihrer Python-Bedeutung.
Sensor wird erst beim Erreichen der Bedingung gegen die aktuelle Welt gelesen.
Ohne Tor verständlicher Weltfehler. Kein exec/eval. AST/Input-Grenzen bleiben.

## Plan und Prüffokus
- [x] Tests zuerst: identischer Plan löst beide Starts; Lesen nach toggle verwendet
  neuen Zustand; falscher Zweig bleibt ohne Wirkung; Step höchstens eine Aktion;
  Stop/Reset; Fehlerzeile; verbotene Ausdrücke und Zweigkörper werden auch dann
  abgelehnt, wenn der Zweig später nicht betreten würde; maximal 64 Weltaktionen.
- [x] `GateCheck` als begrenzte Vorwärtssprung-Instruktion im vorhandenen Runner.
  PC zählt Instruktionen, `executed_steps` zählt echte Aktionen. Zeilenfortschritt
  zählt keine übersprungenen Aktionen. Maximal 64 Aktionen statisch, Laufzeitlimit
  anhand tatsächlich ausgeführter Aktionen, keine Rücksprünge.
- [x] F1 erklärt optional Sensor/Bedingung; ein Beispielplan funktioniert mit
  beiden F11-Starts. UI zeigt letzte geprüfte Bedingung. Eigenen Text nie ersetzen.
- [x] Suite, SDL für beide Starts und sichere Heimkehr; Review; Commit/Bundle/Push.

Nicht behaupten: allgemeines Python, bereits erwiesenes Lernen oder beliebige
Sicherheit für fremden Code. Bedingungen sind die nächste kleine Sprachstufe.

Nachweise: Core RED9/UI RED3; Reviewkorrekturen RED2+1; Suite265 PASS, SDL PASS.
Review: Important veralteter if-Befund nach Edit/Undo behoben, Minor falscher
Aktionszähler ebenfalls behoben (Verständnisrelevanz). Keine Sicherheitsbefunde.
Commit/Bundle/Push folgen als Sicherung dieses geprüften Pakets.
