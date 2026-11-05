# NEONPAW v4 — Authority, CEO oversight and execution

## Product authority
1. Owner's explicit decisions and scope boundaries.
2. `AGENTS.md` operational contract and `SAFETY_AND_EXECUTION.md` safety constraints.
3. `NEXT_TASK.md` active single deliverable, with acceptance conditions. GitHub Issue for it links back to NEXT_TASK; conflict = stop and reconcile, never assume both authoritative.
4. `PRODUCT.md`, `TUTORIAL_SYSTEM.md`, `LONG_TERM_DESIGN.md`, `SYSTEMS_AND_SCALING.md` establish direction, NOT authorization to build all future features.
5. `CURRENT.md` is a measured status report, not authority. The git HEAD, CI checks, logs, and executable game are evidence.

Never overwrite unrelated repositories, rewrite history, or auto-merge past required checks/permissions. Owner approval for major product pivots, paid services, external publication, destructive operations, code execution privileges, licensing, unsafe input execution.

## Responsibility and audit loop
- Owner: product direction, optional hands-on novice/expert playtesting, high-impact permissions.
- A0 (Codex integrator): writes core, tests and artifacts; opens PR; merges only when authorized and all gates pass; does not claim continuous background work without actual execution.
- ChatGPT (independent auditor): read git HEAD, open PRs, test/CI evidence and risks; post precise review or issue updates when permission permits; never claim to have executed Codex tasks from a GitHub comment. Avoid parallel editing of A0-owned files.
- A1 (QA/security, read-only): adversarial test cases, input budget/denial-of-service boundary review; cite file+line+reproducer.
- A2 (pedagogy/game-design, read-only): beginner comprehension, progressive disclosure, expert fast path; note human-untested issues.
- A3 (pixel art/content): isolated branch + exclusive art/content paths, only when integration criteria defined. No simultaneous writers in same path.

## Evidence-based reports
M measured: exact command, exit code, artifact, commit SHA, date/environment.
G read: exact source path, branch, SHA, citation/link.
V suspected: hypothesis/uncertainty.
O owner: direct feedback, not technical measurement.
When any PR remains open begin with `Nr. | Ein Satz | Stand | Aufgabe des Owners`; otherwise `Ergebnis | Beleg | Risiko | Nächste Aktion`. Short German; no pronoun assumptions.

## Independent reviewer challenge
ChatGPT examines: Is G0 really playable? Is actual Python syntax supported? Can an infinite loop freeze UI? Do Stop/Reset work? Is the tutorial intelligible to novices? Is complexity proportional to payoff? What do tests NOT establish? One prioritized blocker per correction; no new roadmap each review.

## Agent admission and cost control
Start A0 alone. Admit A1/A2 only when a concrete risk/outcome warrants separate review; maximum A0 + two read-only agents at once. Delegation specifies inputs (SHA, paths), exact question, no-write boundary, time/token budget if tool supports it, requested artifact, acceptance gate. Agents do not recursively spawn agents. Need actual task ID + output for 'running' claims. If not supported, A0 sequentially performs same checklist without inventing processes. Integration of reviewers' findings remains A0-owned and tested.

## Decision cadence
- Every verified incremental behavior: tests, safe commit, traceability in `PROGRESS_LOG.md` and `CURRENT.md`.
- Each closed milestone: demo or screenshot/video where available, deterministic replay, novice task test if human available, independent GitHub review.
- Every 3 milestones: evaluate what added demonstrable player value vs maintenance and usage costs. Prune speculative abstraction.
