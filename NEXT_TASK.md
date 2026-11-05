# Aktive Aufgabe: G1-Minislice — Strom für die Gasse

G0 technisch abgeschlossen (CURRENT und evidence/g0-closure-*), Human-Test offen.
Owner und neue AGENTS autorisieren den nächsten kleinen Schritt.

Eine neue Aktion: `collect()` nimmt die Batterie auf dem markierten Feld auf und
schaltet den angeschlossenen Neon-Automaten unmittelbar ein. Kein zusätzlicher
use-/deliver-Befehl, keine Inventarengine. Batterie weg, Automat hell, klares Feedback.
Falsches Feld und erneutes Aufnehmen melden Weltfehler ohne Zustandsänderung.
Reset stellt Batterie, Automaten und Startposition wieder her; Code bleibt erhalten.
Der erste move_right()-Einstieg bleibt; collect wird danach als nächstes Werkzeug erklärt,
aber niemals automatisch in den Spielercode geschrieben.

Tests zuerst: Zustand, Fehler, Parser-Negativfälle, Stop/Reset, Schritte/Budget,
UI-Ereignisse und sichtbare Automatenreaktion. Danach gesamter Regressionstest und SDL-Smoke.
Keine weiteren G1/G2-Systeme in diesem Inkrement.
