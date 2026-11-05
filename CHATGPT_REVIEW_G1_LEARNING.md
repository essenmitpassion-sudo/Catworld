# Unabhängiger Agent-Check – 2026-11-05 – Lerntransfer nach G1

**Status: NON-BLOCKING REVIEW / kein neues Entwicklungs-Gate.**

## Aktuell direkt aus GitHub gelesen (G)
- `CURRENT.md`: G0 technisch abgeschlossen, G1 `collect()` + beleuchteter Automat implementiert, laut Codex 45 pytest-PASS und SDL-Offscreen-Smoke.
- `neonpaw/code/runner.py`: erlaubt derzeit ausschliesslich parameterlose `move_right()` und `collect()`, validiert AST vor Ausführung, limitiert Schritte/Quelllänge.
- `NEXT_TASK.md`: kleine Transferaufgabe, Batterie genau ein Feld weiter; keine Schleifen, keine neue Engine.
- Die 45 Tests sind **Codex-eigene Messungen**, von ChatGPT hier nicht erneut ausgeführt.
- Aktuell kein PR gefunden. Branch `g0/first-cat-action` vorhanden.

## Owner-Test (O)
Owner hat G0 unter Windows ausgeführt; der einzige erste Handlungsschritt war, bei vorgegebenem `move_right()` auf Run zu drücken. Ergebnis: Bewegung nachvollziehbar, aber Spieler musste noch **keinen eigenen Code schreiben**. Keine Behauptung eines bestandenen Lerntests.

## Produktentscheidung (P1, klein)
**Erster Erfolg → eigene Änderung → Transfer ohne Lösung.**
- G1 bleibt spielbar. Nach dem ersten Erfolg eine Variante freischalten, bei der das Batteriefeld **ein Feld weiter** entfernt liegt. Die Katze muss einen zusätzlichen `move_right()`-Aufruf erhalten.
- Die Lösung darf **nicht direkt im Missionshinweis stehen**. Hilfen dreistufig und optional: 1) Ziel beobachten, 2) „Wiederhole den bekannten Bewegungsschritt“, 3) Codebeispiel nur auf ausdrücklichen Wunsch.
- Für Experten ein sofortiger „Überspringen/Free Mode“-Weg; langfristig gleiche Simulation, keine separate Spiel-Engine.
- Nach korrekter Lösung sichtbares Ergebnis (Strom/Automat), aber keine reinen Zahlen-/Popup-Belohnungen.
- Lernziel: Spieler versteht **Befehlsreihenfolge**, kann einen bekannten Befehl selbst ergänzen und wendet ihn auf einer leicht abgewandelten Karte an.
- Fehlerfälle: `collect()` am falschen Feld, zweimal collect, zu viele Bewegungen, Reset, Step und Stop. Alte G0/G1-Szenarien dürfen nicht regressieren.
- Architektur: Level-Konfiguration/Objective/Rendering zeigen denselben Batteriestandort an, keine zweite Ziel-Logik. Ein Szenario-Parameter genügt – kein Level-Framework.

## Codex-Handlungsregel
Aktuellen Git-HEAD und Tests zuerst prüfen. Wenn diese Transferaufgabe **bereits implementiert** ist, nicht erneut bauen: einfach Belege sichern und zur nächsten kleinsten sinnvollen Lernmechanik übergehen. Sonst genau diesen kompakten Schritt nach Red–Green–Refactor umsetzen. Keine neuen Agenten. Keine Menschentest-Warteschleife. Nur ehrliche Kennzeichnung `HUMAN_LEARNING_NEEDS_TEST`.

## Abnahme
1. Ein Anfänger kann die zweite Aufgabe nur durch **eigene Textänderung** abschliessen.
2. Zu Beginn wird die vollständige Lösung **nicht vorgegeben**.
3. Dieselbe Engine steuert beide Szenarien; Simulation und Pixelziel stimmen überein.
4. Relevante Verhaltens-/UI-Tests und SDL-Smoke durchlaufen.
5. Codex dokumentiert Commit, echte Testergebnisse, offene menschliche Lernabnahme und den nächsten sinnvollen Spielschritt.

**Produktregel:** Ein grüner Test belegt Ausführbarkeit, aber keinen Lernerfolg. Der erste echte „Aha“-Moment muss aus einer selbst geschriebenen Änderung entstehen. Bei fehlender menschlicher Rückmeldung nach technischem Abschluss selbstständig in kleinem Umfang fortsetzen.
