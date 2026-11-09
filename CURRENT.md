# CURRENT — 2026-11-09 — P0-Rettung und Dachtransfer

Ziel: Cyberpunk-Spiel mit selbst geschriebenem Python; ein Integrator.
Branch: g0/first-cat-action. Extern verifizierter Rettungscommit:
7d4675c2d1f48e32b132088c0590e17241fdec9c (auf db0ea246 aufgebaut).
Nachfolgender Abschlusscommit ergänzt SDL-Nachweise und diese Übergabe; SHA mit git log -1 prüfen.

## Bestandsaufnahme
- TECH_PASS: Einstieg, Batterie/Automat, Transfer, Abruf ohne Vorlage, animierte Pixelkatze, Dachweg mit for/range; sichere AST-Teilmenge und Aktionsbudgets. Run/Step/Stop/Reset.
- TECH_PASS: geretteter Dachtransfer (F8 nach Dach-Erfolg): Ziel von 6 auf 8, unveränderter eigener Plan, neue Zahl selbst schreiben; falscher Plan gewinnt nicht durch wiederholtes Run. Freiwillige Hinweise, sichtbare Laterne. Vier separate Entwürfe in Schema 3; Schema 1/2 weiter lesbar.
- M: 134 Tests nach externer Rettung erneut bestanden (evidence/recovery-tests.txt). Vollständiger SDL-Offscreen-Smoke erweitert: F8, zweimal falscher Plan, eigene Korrektur, Step/Stop/Reset, Neustart, beide Dachentwürfe und Rückkehr. evidence/roof-transfer-smoke.txt. Erfolgsbild visuell geprüft.
- Nicht verifiziert: menschlicher Lernwert/Spielspaß, nativer Windows-/DPI-Test, unabhängiger Sicherheits-Audit. Keine aktuell reproduzierten Testfehler. UI-Zustand wird beim Neustart zurückgesetzt, Programme laufen nie automatisch.
- Geplant, nicht implementiert: mehrere Laternen in einem Programm verbinden (Bewegen und Aufnehmen sinnvoll kombinieren), keine neue Python-Syntax. Vor Ausbau kurze Produktprüfung anhand des bestehenden Spiels.

## Rettung / Infrastruktur
Bestehende Umgebung wieder erreichbar, kein Workspaceersatz durch den Agenten.
Alle sechs geänderten/neuen Dateien gefunden. Vollarchiv einschließlich Git,
untracked und ignored: /workspace/Catworld-recovery-2026-11-09.tar.gz;
3078 Dateien per SHA-256 gegen Original verglichen. Bundle gleichen Namens .bundle
geprüft. GitHub-Remote vor Rettung db0ea246, Push auf 7d4675c bestätigt.
Cloud-Startfehler war beobachtet, Ursache unbekannt; Shell/Mount/Dateien jetzt erreichbar.
Sandbox konnte Proxy nicht erreichen; genehmigter äußerer Netzwerkaufruf erfolgreich.
Keine Datenlöschung, Resets, anderen Projekte, Dienste oder Scheduler verändert.
Nur Test-CI; kein kontinuierlicher Codex-Entwicklungsscheduler.

## Wiederaufnahme
Erster Befehl: `cd /workspace/Catworld && git status --short --branch && git log -5 --oneline`
1. Lokalen Stand/Backups sichern, Fetch und Remote/Reviews vergleichen; Dachtransfer nicht erneut entwickeln.
2. `.venv/bin/python -m pytest -q` und `SDL_VIDEODRIVER=offscreen SDL_AUDIODRIVER=dummy .venv/bin/python -m tests.smoke_app` bei Codeänderungen reproduzieren.
3. Als nächsten Produktbatch mehrere Laternen in einem Ablauf untersuchen; vorher den aktuellen Stand extern sichern. Bei Limit zuerst Checkpoint statt Feature.
Alle zum Abschluss gehörenden Änderungen werden committed; keine absichtlich zurückgelassene WIP-Arbeit. Tatsächlicher git status gilt vor dieser Aussage. Das Rettungsarchiv bleibt zusätzlich unverändert erhalten.

## 2026-11-09 — Zwei Laternen implementiert
Ausgangspunkt f5beee9, Weltlogik d7c3f9f extern verifiziert. Neues Gameplay: nach
Dachtransfer F9, leerer separater Editor, Laternen auf Feld 4 und 7. Erste Aktivierung
ist Teilerfolg; zweite verbindet beide Lichter. Mehrere gültige Programme ohne neue
Syntax. Schema 4 erhält alle fünf Texte; Migration von 1–3 getestet.
146 Tests grün, voller SDL-Smoke einschließlich beider Laternen und Neustart.
Belege evidence/two-lanterns-*.txt. Eigener Hinweislisten-Fehler im SDL-Smoke erkannt,
korrigiert und durch Renderingtest abgesichert. Menschliches Lernen bleibt offen.
Nächster Batch: redundante Rückkehrbuttons und verdeckten Titel im Paarabschnitt
beseitigen; sichtbare und klickbare Buttons aus derselben Auswahl ableiten.
