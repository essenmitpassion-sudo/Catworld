# CURRENT — 2026-11-12 — Planvergleich gesichert

Branch codex/masterplan-run-consistency. Basis e43f8d5 extern bestätigt.
Letzten Commit und Remote mit git log / git ls-remote prüfen.

## Tatsächlich spielbar
Werkstatt mit Schalter/Tor; zwei wählbare Startzustände; eigener sechster Entwurf.
Begrenztes gate_open()/if und optionale Hilfen. Übersprungene Aktionszeilen grau,
Trace nach Edit/Undo/Reset verworfen. Simulation und Animation starten gemeinsam.
Neu F12: derselbe eigene Code wird auf zwei getrennten Welten geprüft. Erfolg nur
bei versorgter Werkstatt UND fehlerfrei beendetem Programm. Aktuelle Welt und Code
bleiben erhalten, laufende Ausführung pausiert. Ergebnisse bei Edit/Undo/Run/Step/
Reset/Navigation verworfen. Keine Freischaltungen oder Save-Änderungen durch Vergleich.
App und Vergleich benutzen dieselbe Werkstatt-Startfactory. Keine neue Syntax/Welt.

## Qualität
282 Tests PASS; vollständiger SDL-Offscreen-Smoke PASS einschließlich Vergleich,
Pause/Fortsetzen, beide Startzustände, Fehlerfälle, Undo und gespeicherte Programme.
RED8 für Vergleich; unabhängiger Review8 Tests PASS, keine relevanten Befunde.
Screenshots geprüft. Belege evidence/plan-check-*.txt/png. Menschlicher Spielspass,
Lerntransfer und Windows/DPI nicht validiert; technische Tests beweisen diese nicht.

## Sicherung und Wiederaufnahme
Alle fertigen Pakete seit 69604d1 einzeln committed und gepusht; Remote-SHAs jeweils
bestätigt. Vollständige Git-Bundles unter /workspace/work/catworld-*.bundle geprüft.
Dieses Paket ebenfalls vor Fortsetzung committen und als Bundle plus Inhaltsarchiv
sichern; externen SHA abschliessend prüfen. Keine WIP-Arbeit bewusst zurücklassen.

Nächste Priorität: echten räumlichen Entscheidungsraum prüfen. Ein optionaler
oberer Weg könnte das Tor umgehen: mehr Bewegung, aber ohne Schalterbedingung;
der adaptive Torweg bleibt kürzer. Erst Aufwand/Nutzen und vorhandene Regeln
prüfen, kein pauschaler 2D-/Engine-Umbau und keine bloss kosmetische Alternative.
Sinnvoll klein halten, mehrere gültige Lösungen und sichtbare Folgen nachweisen.
Owner verlangt Fortsetzung ohne Mikrofreigaben und Checkpoints bis tatsächliche
Grenze; kein Scheduler und keine Arbeit nach Sitzungsende behaupten.
Start: git status --short --branch && git log -5 --oneline, dann NEXT_TASK.md.
