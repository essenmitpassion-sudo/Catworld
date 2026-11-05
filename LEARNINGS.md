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
