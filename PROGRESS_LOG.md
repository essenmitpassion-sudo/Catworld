# NEONPAW — verifiable progress journal (append-only)

Initial entry 2026-11-05: **G** Design package v4 created; no new repository or game code verified. No tests run. Never label docs as shipped product.

For every meaningful change append:

```
Date/time UTC:
Scope / task ID:
Branch and before/after HEAD:
RED: command + expected fail + observed fail or N/A with reason
GREEN: command + exit code + evidence
REFACTOR: command + exit code + evidence
UI smoke: real observed interaction / UI_UNVERIFIED
Known FAIL / OPEN:
Git commit / PR:
Agent contribution (if any): task ID, read-only finding, integration proof
Learning ID added to LEARNINGS.md:
One next action:
```

The journal records history; CURRENT.md is a short current snapshot, and actual git/test state outranks both.

## 2026-11-05 — Startpaket / Zugriffssicherung
M: 25 Owner-Dokumente eingelesen, Paketcommit 09cb0f4 auf g0/first-cat-action. Git-Lesen Exit 0 ohne Refs; Push Exit 128 / HTTP 403. Kein G0-Code, RED/GREEN/REFACTOR NOT_RUN, UI_UNVERIFIED, NEEDS_HUMAN. LOCAL_ONLY; kein PR erstellt. Nächste Aktion: nach Schreibfreigabe denselben Branch pushen und Remote-SHA prüfen. Keine Subagenten gestartet.

## 2026-11-05 — G0 lokales Gameplay und erfolgreiche Veröffentlichung
O: Governance korrigiert: geprüftes lokales Backup erlaubt Entwicklung trotz 403.
M: Ausgangspunkt 90de7e2 und Bundle intakt; git fsck Exit 0. Implementierungscheckpoint ffd2d7f, finale Implementierung 118eaba auf g0/first-cat-action.
RED: `.venv/bin/python -m pytest -q` Exit 2 wegen fehlendem world-Modul (evidence/red.txt); UI analog Exit 2. Diese Initialläufe waren Collection-Fehler, keine durchgelaufenen Verhaltenstests.
GREEN: 26 Core-Tests, anschliessend 28 mit UI, Exit 0 (green-core.txt / green-ui.txt).
Echter Regression-RED: Editoränderung behielt alte Ausführungszeile, 1 failed / 2 passed, Exit 1 (red-editor.txt).
Fix/REFACTOR: gemeinsame Edit-Invalidierung und gecachter Schild-Font; Gesamtsuite 29 passed, Exit 0 (refactor.txt).
Clean install: frische venv + pip install -r requirements.txt Exit 0; dort 29 passed, Exit 0 (clean-install.txt / clean-tests.txt).
UI: echte SDL-Eventqueue, Textinput, Buttons, Rendering, Quit mit offscreen-Treiber PASS (smoke.txt); Vorher/Nachher/Fehler-Screenshots. Kein physischer Desktop oder Human-Test. App-Einstieg mit Quit nach 1 s separat Exit 0.
GitHub: einmaliger neuer Pushversuch nach G0 erfolgreich; git ls-remote bestätigt 118eaba. GitHub-API gh pr list / repo view Forbidden; kein PR erstellt, offene PRs UNKNOWN. Default ist aktuell der erste Branch g0/first-cat-action, kein Merge.
Modelle/Agenten: ein Integrator, keine Subagenten, kein behaupteter Modellwechsel.
Learning: L008 Governance, L009 Editor-Markierung.
OPEN: NEEDS_HUMAN, Windows ungetestet, unabhängiger Audit offen, NO_CI.
Nächste einzige Aufgabe: G0-Abnahme gemäss NEXT_TASK.
