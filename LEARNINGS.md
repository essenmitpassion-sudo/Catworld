# NEONPAW — learnings register (append only)

Record each learning with ID, date, source, observation, cause confidence, practical change, verification, and reuse trigger. Distinguish G source observation, O owner feedback, M reproduced behavior, V inference. Do not recycle unverified assumptions as measured facts.

| ID | Source / evidence level | Observation | NEONPAW countermeasure | Test for success |
|---|---|---|---|---|
| L001 | G KNICK handoff/Issue #6 | Bot tests were mistaken for proof of enjoyable play | Automated tech pass separated from human FUN/LEARN pass | CURRENT retains NEEDS_HUMAN until real playtest |
| L002 | G KNICK handoff | Multiple writer roles and stale source/handoffs caused integration risk | Single core writer, SHA-grounded checkpoints, isolated reviewer briefs | No overlapping file ownership; clean PR |
| L003 | O prior SOUNDWEAVE discussions | Active agents != meaningful product progress | Track integrated playable capabilities only | Demo + acceptance evidence per gate |
| L004 | O prior DEEPFALL discussions | Large architecture and feature plans outpaced usable prototype | Small G0, no speculative frameworks | Real Run/Step/Stop/Reset first |
| L005 | O user | Switching Codex, ChatGPT, CMD consumed effort/allowance | GitHub artifact handoff, Desktop Commander exceptional only | ChatGPT can review GitHub PR without copying transcript |
| L006 | O user | Need novice scaffolding AND expert progression for 100h | Shared simulation, separate hint layers; long-term algorithmic constraints | Early blind novice test + expert challenge review |
| L007 | V game design | More content alone may not sustain 100h | Compose constraints and tooling, avoid grind inflation | Validate retention and strategy diversity when built |

Every future bug or scope correction gets a new entry. No duplicate listicle of all tiny fixes: log only a generalizable invariant or failure mode and how it was prevented.

### L008 — 2026-11-05 — Governance blockiert Produktentwicklung
O/M: Trotz lokalem Commit 90de7e2 und geprüftem Bundle wurde G0 wegen GitHub-403 gestoppt. Ursache: Veröffentlichbarkeit und Wiederherstellbarkeit waren fälschlich in einer P0-Regel gleichgesetzt. Gegenmassnahme: verifizierter lokaler Commit + Bundle erlauben Entwicklung; 403 nur als LOCAL_ONLY melden, ein Pushversuch pro abgeschlossenem Meilenstein. AGENTS, WORKFLOW und MILESTONES_AND_GATES dauerhaft korrigiert. Beleg: git fsck und bundle verify erfolgreich; danach G0 implementiert und getestet.

### L009 — 2026-11-05 — Veraltete Ausführungsmarkierung beim Editieren
M: Nach Run und anschliessendem Ersetzen des Codes blieb die alte Zeile aktiv und die Ansicht scrollte am Cursor vorbei. Ursache: Stop behielt die für Debugging sinnvolle Zeile auch bei Codeänderungen. Gegenmassnahme: Editoränderungen verwerfen Ausführungsmarkierung und Fehlermeldung, Stop allein behält sie. Regression: test_edit_after_execution_keeps_cursor_visible; RED 1 failed / 2 passed, danach Gesamtsuite 29 passed. Belege evidence/red-editor.txt und evidence/refactor.txt.

### L010 — 2026-11-05 — Zustandspass reicht für sichtbares Gameplay nicht
M: Nach Implementierung von collect waren Core-Tests grün, aber der neue SDL-Test zeigte unveränderte Automatenpixel (evidence/g1-red-ui.txt). Ursache: Weltzustand allein garantiert keine sichtbare Reaktion. Gegenmassnahme: bei neuen Weltaktionen die konkrete betroffene Bildregion und Reset-Rückkehr prüfen; Statusstring allein reicht nicht. GREEN: test_collect_loop_changes_machine_and_reset_restores_it und g1-smoke.txt. Menschliche Verständlichkeit bleibt davon unabhängig offen.

### L011 — 2026-11-05 — Vormachen ist kein Lernnachweis
O: Owner konnte unter Windows den vorgegebenen move_right()-Befehl mit Run ausführen, musste aber keinen Code schreiben. Ursache: die erste Aufgabe mass Bedienung und Kausalität, keine eigene Anwendung. Gegenmassnahme: bestehendes Beispiel als Einstieg behalten, danach versetzte Batterie ohne automatische Codeänderung; freiwillige Beobachtungs-/Denkhilfe und ausdrücklich angefordertes Beispiel. M: SDL-Eingabetest belegt erforderliche Änderung der alten Lösung und sichtbare Konsequenz; HUMAN_LEARNING_NEEDS_TEST bis Spieler die Änderung selbst erklären/übertragen kann.

### L012 — 2026-11-05 — Wiederholtes Run darf Transfer nicht umgehen
G/V: Der G1-Runner behält die Position zwischen vollständigen Runs; eine alte Bewegungsfolge könnte am versetzten Ziel durch Wiederholen statt Codeänderung ankommen. Gegenmassnahme nur im Transfer: jeder neue Versuch startet am Szenarioanfang, ein pausierter Step-Lauf bleibt fortsetzbar. M: test_unchanged_old_solution_cannot_win_by_repeated_run_or_step und test_step_then_run_resumes_without_restarting prüfen beide Seiten. G0/G1-Einstiegssemantik bleibt durch bestehende Tests gesichert.

### L013 — 2026-11-06 — Handoff kennt lokale Arbeit nicht
M: Remote-Handoff 6358fd8 meldete den Abrufschritt als noch nicht auf GitHub belegt; lokal lagen Implementierung, fünf neue Tests und RED/GREEN-Logs uncommitted vor. Erst 58 Tests erneut ausgeführt, dann vor Fetch in 0469ae8 committed und Git-Bundle geprüft. Anschliessend den reinen Dokumentationszweig konfliktfrei integriert; keine Doppelimplementierung. Gegenmassnahme: vor Remote-Synchronisation immer lokale Änderungen und eigene Commits sichern, Handoff als Beobachtung des Remote behandeln. UI-Smoke schliesst die tatsächliche lokale Restarbeit ab.

### L014 — 2026-11-06 — Editorwechsel-Sicherheit ist keine dauerhafte Speicherung
G/M: Der Abrufschritt bewahrte zwei Texte nur im Speicher. Ein Spielneustart konnte diese eigene Arbeit verlieren. Gegenmassnahme: begrenzte lokale Text-Snapshots mit atomarem Ersatz, vorheriger gültiger Fassung und expliziter Fehlermeldung. Kein automatisches Ausführen beim Laden. Regressionsbelege: test_restart_restores_both_drafts_without_running, test_failed_replace_keeps_previous_program und SDL-Smoke mit erneutem App-Start. Ungültige Unicode-Zeichen separat reproduziert und vor Renderer/Schreiben abgewiesen.

### L015 — 2026-11-06 — Technische Bausteine ergeben noch keinen Spielabschnitt
G/O: Bewegung, Batterie, Transfer und Abruf waren vorhanden, aber Owner verlangte einen zusammenhängenden, motivierenden Abschnitt. Gegenmassnahme: gemeinsames Weltziel „Licht für Nox“, kurze Übergänge, animierte Reaktion ohne Eingriff in die Weltregeln, sichtbare Lampenkette und klarer Abschluss mit ausdrücklich zukünftigem Ausblick. M: test_power_changes_alley_beyond_machine_and_reset_restores_it sowie vollständiger SDL-/Video-Durchlauf prüfen Weltreaktion und Reihenfolge. Ob daraus mehr Freude/Neugier entsteht, bleibt V bis zum Menschentest; keine FUN_PASS-Aussage.

## 2026-11-06 — Dachweg-Integration
- Ein API-403 beweist keinen fehlgeschlagenen GitHub-Lauf: Die öffentliche Actions-Webseite lieferte hier Commit-Zuordnung und erfolgreichen Abschluss, ohne neuen Dienst oder Zugangsdaten.
- Beim Freischalten einer Vorschau müssen auch bestehende Abschlussmeldungen nachgezogen werden. Der alte Text bezeichnete den fertigen Dachweg weiter als Vorschau; korrigiert und Übergang samt Rückkehr zur Eigenlösung geprüft.

## 2026-11-09 — P0 vor Validierung
Der Cloud-Ausfall unterbrach ein grünes, aber noch nicht committetes Paket.
134 bestandene Tests bedeuteten keine externe Sicherung. Die Dateien waren nach
Wiederverbindung erhalten; Vollarchiv und Checkpoint wurden vor erneutem Testen
angelegt und extern verifiziert. Gegenmaßnahme: kleine Pakete unmittelbar sichern,
auch wenn der erweiterte UI-Smoke noch offen ist (klar als Checkpoint benennen).
Ein fehlender Executor ist kein Beweis für verlorene Dateien; nicht neu aufsetzen
oder Funktionen erneut implementieren, bevor der bestehende Workspace geprüft ist.

## 2026-11-09 — Kombination statt neuer Syntax
Zwei gleich lange Abschnitte machen Bewegung+Aufnehmen zu einem wiederholbaren
Ablauf. Ausgeschriebene Befehle und zwei getrennte Schleifen bleiben gültig; keine
Lösungsform erzwingen. Ein eigener breiter Textersatz beschädigte die alte
Hinweislisten-Auswahl; SDL fand den Fehler, gezielter Renderingtest sichert ihn ab.

## 2026-11-09 — Unsichtbar muss auch unklickbar sein
Separat gepflegte Sichtbarkeitsbedingungen ließen verborgene Navigation aktiv.
Gemeinsame Button-Auswahl beseitigt diese Divergenz; Regression prüft tatsächliche
Mausereignisse. Mehrere identische Rückwege brachten keinen zusätzlichen Nutzen;
ein sichtbarer Rückweg reicht, vorhandene Tastenkürzel bleiben kompatibel.

## 2026-11-09 — Textzustände statt Command-Framework
Die fünf vorhandenen Entwurfsidentitäten reichen für getrennte Undo/Redo-Stacks.
Nur tatsächliche Textänderungen erzeugen History; abgewiesene Eingaben und leeres
Undo stoppen kein laufendes Programm. Erfolgreiches Undo stoppt es. Beide Stacks
sind auf 32 begrenzt, Texte auf 4096 Zeichen. Autosave ersetzt keine Undo-Historie;
der wiederhergestellte Text wird gespeichert, History bleibt bewusst sitzungslokal.

## 2026-11-09 — Hinweise und Ursache/Wirkung gleichzeitig zeigen
Ein Overlay versteckte die Welt gerade beim Nachdenken über sie. Zwei getrennte
Bereiche in derselben linken Spalte lösen das ohne neues Fenster oder Bibliothek.
Welt wird proportional kleiner, Text und Controls bleiben gleich groß. Geometrie,
Resize-Hit-Test und Fokus sind testbar; menschliche Lesbarkeit ist damit nicht bewiesen.

## 2026-11-09 — Darstellung und Eingabe teilen denselben Ausschnitt
Horizontales Scrollen ohne Anpassung der Mauskoordinaten würde falsche Textstellen
bearbeiten. Beide verwenden denselben Offset; Undo auf kurze Zeilen muss diesen
zusätzlich auf die neue Zeilenbreite begrenzen. Ausführung zeigt den Anweisungsanfang.
