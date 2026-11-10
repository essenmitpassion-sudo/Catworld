# Konsistente neue Versuche — Implementation Plan

> Umsetzung: superpowers:executing-plans, ein Integrator. Der Owner hat mit
> PRODUCT_MASTER_PROMPT.md §15/18 eigenständige kleine Verbesserungen autorisiert.

**Goal:** Ein funktionierendes Einstiegsprogramm funktioniert bei erneutem Run
oder Step wieder, ohne manuelles Reset. Pausierte Ausführung wird fortgesetzt.

**Architecture:** Die bestehende Erkennung neuer Versuche in `App.activate(name)`
setzt die Welt für alle Szenarien zurück. Runner und Interpreter bleiben gleich.
**Tech Stack:** Python 3.12+, pygame-ce 2.5.7, pytest 8.4.2.
**Spec:** `PRODUCT_MASTER_PROMPT.md` §10, §14, §18; bisheriges `NEXT_TASK.md`.

## Entscheidung und Grenzen
Die heutige Ausnahme im Einstieg entfernen. Alternativen: Reset weiterhin vom
Spieler verlangen (unnötige Bedienhürde) oder jeden Run zurücksetzen (zerstört
Step→Run). Keine neue Syntax, Save-Migration oder allgemeine Runner-Überarbeitung.
Code, Cursor, Undo und Welt nach Stop bleiben erhalten; erst ein neuer Versuch
setzt die Welt zurück. Reset ist weiterhin sofort verfügbar.

## Review Focus
Wiederholen nach Erfolg, Neustart nach Stop, Editieren nach erstem Schritt,
erneutes Ausführen nach Weltfehler, Fortsetzen eines pausierten Programms.
Zusätzlich: Syntaxfehler, leere Programme und wiederholtes Run während Ausführung.

## Task 1: Wiederholbare Einstiegsprogramme
Dateien: `tests/test_restart.py`, `neonpaw/ui/app.py`, `tests/smoke_app.py`,
`README.md`. Schnittstelle: `App.activate(name)`, über echte SDL-Ereignisse prüfen.

- [x] Baseline: `python -m pytest -q` → 199 PASS; Remote-SHA entspricht 7175190.
- [x] Tests: `move_right(); collect()` zweimal ausführen → beide Male Licht an,
  x=2, moves=1. Nach Stop Welt behalten, nächster Versuch wieder x=1.
  Editor-Ergänzung ohne Reset funktioniert; Wiederholung eines Fehlers bleibt
  derselbe Fehler am selben Ort. Step→Run und Run→Run setzen korrekt fort.
- [x] RED: `.venv/bin/python -m pytest tests/test_restart.py -q`.
- [x] In `App.activate(name)` neue Versuche unabhängig vom Szenario zurücksetzen;
  Einstiegshinweis und Statusmeldungen dieser Regel anpassen.
- [x] GREEN: gesamte Suite, dann SDL-Offscreen-Smoke einschließlich erneutem
  Run über Ereigniswarteschlange und sichtbarem Zustand. README aktualisieren.
- [x] Review, Commit, Bundle erstellen/prüfen und Branch pushen; Remote-SHA prüfen.

## Task 2: Masterplan vermerken
- [x] Upload und `PRODUCT_MASTER_PROMPT.md` bytegleich per SHA-256 bestätigt.
- [x] Bestandsaufnahme, drei Richtungen, Auswahl, Lern-/Architekturpfad und
  priorisierte Roadmap in `MASTERPLAN_STATUS.md` festhalten; Annahmen kennzeichnen.
- [x] `AGENTS.md`, `CURRENT.md`, `NEXT_TASK.md` mit knappem Handoff aktualisieren.

## Arbeitsprotokoll
Keine neue Produktfreigabe nötig: Owner verlangt ausdrücklich autonome Entscheidungen
ohne Mikrofreigaben. Ein begrenztes Paket auf separatem Branch, kein Merge.
Ausgangsstand als vollständiges geprüftes Git-Bundle in /workspace/work gesichert.

Ergebnisse: 9 RED / 1 Fortsetzungs-Guard PASS; nach Fix 209 PASS; voller SDL-Smoke PASS.
Unabhängiger Read-only-Code-Review: keine Critical/Important-Befunde; falschen
Methodennamen im Plan zu App.activate korrigiert. Menschentests/Windows bleiben offen.

Checkpoint: 827bfe2a7558f0c36d6ab8dc0ee005a7467c7460 committed, Bundle geprüft,
auf origin/codex/masterplan-run-consistency gepusht und Remote-SHA bestätigt.
Task 1 und Task 2 abgeschlossen; dieses Protokoll ergänzt den bestätigten Checkpoint.
