# Werkstatt: zwei Wege — Implementation Plan

> Inline-Ausführung mit superpowers:executing-plans; Owner autorisiert eigenständige Entscheidungen.

**Goal:** Eine längere, zustandsunabhängige Stegroute und ein kürzerer Torweg.
**Architecture:** World ergänzt Höhe (0/1), obere Felder und Leitern als unveränderliche Daten. Kein allgemeines Grid/ECS. Runner behält seine Grenzen, UI zeichnet denselben Zustand.
**Tech Stack:** vorhandenes Python 3.12 / pygame-ce; keine neuen Abhängigkeiten.
**Spec:** PRODUCT_MASTER_PROMPT.md Abschnitte 3, 9, 16; konkreter Entwurf unten.

## Entwurf und Entscheidung
Bestehende Werkstatt bleibt identisch am Boden. Oben liegen Felder 2–6; Leitern
verbinden beide Höhen an 2 und 6. move_up()/move_down() funktionieren nur dort.
Obere Bewegung benötigt ein vorhandenes Nachbarfeld. Schalter, Batterie und Tor
liegen unten. Geschlossenes Tor blockiert unten in beiden Richtungen.
Stegplan: rechts, hoch, viermal rechts, runter, rechts, collect = 9 Aktionen.
Adaptiver Bodenplan: 8/7 Aktionen bei geschlossenem/offenem Start.
Beide Wege gewinnen; kürzeste Lösung ist keine Pflicht. Hin- und Rückweg frei
kombinierbar. Aktionszähler macht den Unterschied sichtbar.
Alternative weiterer linearer Level: wenig neue Entscheidung. Allgemeines 2D-Grid:
zu grosser Umbau. Gewählt: kleine datengetriebene Erweiterung bestehender Welt.
Spielertest bleibt unabhängig verfügbar; kein menschlicher Spassnachweis behauptet.

## Constraints und Review Focus
- Persönliche Entwürfe und Saveformat6 unverändert; alte Programme weiterhin gültig.
- Reset/Navigation/Neustart setzen Höhe und Animation zurück; Step zeigt eine Aktion.
- Keine Interaktion mit Bodenobjekten von oben; keine Bewegung ins Leere.
- Bestehende Gassen haben keine Leiter; hilfreicher Weltfehler statt Crash.
- Schalter/Tor/Steg/Katze müssen auch im verkleinerten Hinweis-Viewport erkennbar sein.
- F12 prüft beide Wege über dieselbe Weltfactory; Grenzen64 bleiben unverändert.

## Task 1 — Spielbares Routeninkrement
Files: core/world.py (Regeln), content/levels.py (Geometrie), code/runner.py
(Aktionsnamen), ui/workshop.py (Steg/Hinweise), ui/app.py (Höhenanimation).
Interfaces: World.y=0, upper_tiles=(), ladders=(); move_up/down; App.visual_y.
- [x] Tests: beide Starts mit Steg und Boden; Rand/Leiter/Objektfehler; Rückweg.
- [x] RED beobachten; Regeln und Compileraktionen implementieren.
- [x] UI-Tests für Höhe, Pause, Reset, Navigation und Save-Neustart; RED beobachten.
- [x] Darstellung/Animation/Hinweise integrieren, keine neuen Panels.
- [x] Vollsuite, SDL-Smoke mit beiden Wegen, Screenshots prüfen.
- [x] Unabhängiger Review, relevante Befunde beheben.
- [x] README/CURRENT/NEXT aktualisieren; Commit, Bundle, Remote-SHA prüfen.

## Ledger
Basis a36bc11. Schnittstellenprüfung: gemeinsame workshop_world() wird von App und
F12 verwendet; Save speichert Entwürfe statt Weltpositionen, keine Migration nötig.

Review18 PASS; zwei Textbefunde korrigiert. Owner-Steuerung: Stegexperiment sichern; nächster Fokus Bezirk und visuelle Neuausrichtung.
