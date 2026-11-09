# CURRENT — 2026-11-09 — Undo/Redo und beobachtbare Hilfen

Ziel: kleines Cyberpunk-Python-Lernspiel. Ein Integrator, keine neue Engine.
Branch g0/first-cat-action. Ausgangspunkt 7818cedda43270c86fce959984c1f22753a6e0ea.
Extern bestätigter Undo-Checkpoint ddcb0e2b2047a4ba5bc9c935a076129b714644c6.
Folgender Abschlusscommit enthält Hilfelayout und Übergabe; SHA mit git log -1 prüfen.

## Fertig
Bestehende Aufgaben bis Zwei-Laternen-Abschnitt unverändert spielbar. Sichere
begrenzte AST-Teilmenge, fünf gespeicherte Entwürfe, Speicherformat 4 mit Migration 1–3.
- Undo Strg+Z, Redo Strg+Y/Strg+Shift+Z: fünf getrennte Sitzungshistorien, maximal
  32 Zustände je Stack, maximal 4096 Zeichen je Text. Cursor und Auswahl werden
  restauriert; neue Änderung verwirft Redo. Abgewiesene/unveränderte Eingaben oder
  leere History sind No-ops. Erfolgreiches Undo stoppt laufende Ausführung.
- Autosave speichert den wiederhergestellten Text. Neustart erhält Texte, nicht
  History; kein Speicherformatwechsel. Einstieg/Transfer teilen wie zuvor einen
  Entwurf und damit eine History; die vier anderen Entwürfe sind unabhängig.
- Hilfe überdeckt die Welt nicht mehr: Hinweise oben links, vollständige Welt
  proportional darunter. Codefeld/Buttons unverändert. Schließen stellt große
  Weltansicht wieder her. Welt ist während Hilfe kleiner; menschliche Lesbarkeit offen.

## Nachweise
Undo RED 12 failed/1 passed, GREEN 161; Hilfelayout RED 9, finale GREEN 170.
Belege evidence/undo-*.txt und hint-layout-*.txt. Volle Regression inklusive
Schleifenlimits, Speicherschäden, Szenariowechsel; SDL-Smoke mit echten Events,
Undo/Redo, Wechsel, Speichern, Neustart, Run/Stop/Reset und beiden Laternen.
Layouttests 960×600, 1200×720, 1600×1000; Mausklick-Skalierung/Fokus geprüft.
Screenshot der Hilfe visuell geprüft. Kein menschlicher Lern-/Spaßnachweis,
kein nativer Windows-/DPI-Test oder unabhängiger Security-Audit.

## Nächste Priorität / Wiederaufnahme
Genau eine nächste Produktaufgabe: horizontales Nachführen des Codefelds, damit
Cursor und bearbeiteter Text bei langen Zeilen sichtbar bleiben. Reproduzierbar:
Renderer clippt auf 380 Pixel, Cursor-x wächst mit Zeilenlänge ohne horizontalen Offset.
Erster Befehl: `cd /workspace/Catworld && git status --short --branch && git log -5 --oneline`
1. Arbeit/Backups sichern, Remote/Reviews vergleichen. Undo nicht erneut entwickeln.
2. NEXT_TASK.md: RED für langen Text und sichtbaren Cursor; minimal korrigieren.
3. Volle Tests/SDL, Commit, Bundle verify, Push und Remote-SHA prüfen.
Recovery-Archive unverändert erhalten; /workspace/Catworld-undo.bundle geprüft.
Nur Test-CI, kein Entwicklungsscheduler. Tatsächlicher Git-Status gilt vor Dokumenten.

## Gemerkte Produktleitlinie — 2026-11-09
O: Neuer langfristiger Masterprompt auf Wunsch „MERKE DIR“ vollständig und unverändert
in PRODUCT_MASTER_PROMPT.md gespeichert, über AGENTS.md bei Wiederaufnahme auffindbar.
Nur Dokumentation; keine neue Implementierung oder Änderung der nächsten Editoraufgabe.

## 2026-11-09 — Horizontales Nachführen
Ausgangspunkt cb1023a sauber, Remote ohne Neuerungen. Lange Zeilen halten Cursor
sichtbar; Mauspositionierung berücksichtigt Offset, Zeilennummern bleiben fest.
Home/End, Undo/Redo, Editorwechsel und ausführbare Zeilen getestet. RED 5, GREEN 175,
voller SDL-Smoke PASS (evidence/horizontal-*.txt), Screenshot geprüft.
Eigener Randfehler beim Undo auf kurze Zeile im Test gefunden und korrigiert.
Nächster einzelner Batch: beobachtbare Ausführungsanzahl derselben Codezeile bei
Schleifen, aus vorhandenen geprüften Befehlen abgeleitet. Keine neue Python-Syntax.

## 2026-11-09 — Beobachtbare Schleifen
Editor-Checkpoint 5d5237da73622c09705f1aacdb57fc9014e00098 extern bestätigt.
Zusätzlich zeigt die Oberfläche bei mehrfach ausgeführten Zeilen deren tatsächlichen
Fortschritt (z.B. Zeile 2: 2/5 Aktionen ausgeführt). Aus vorhandener commands/pc-Liste
abgeleitet, keine zweite Simulation, keine Syntaxänderung. Fehlgeschlagene Aktionen
zählen nicht. RED 3, GREEN 178; kompletter SDL-Smoke und Screenshot geprüft.
Belege evidence/line-progress-*.txt. Kein menschlicher Lernnachweis.
Nächste konkrete Produktaufgabe: kleine Energieentscheidung mit einem Akku und zwei
Verbrauchern untersuchen, unterschiedliche sichtbare Folgen statt längerer Zahlenfolge.
Wiederaufnahme: `cd /workspace/Catworld && git status --short --branch && git log -5 --oneline`.
Keine absichtlich offene WIP-Arbeit; tatsächlichen Status zuerst prüfen.
