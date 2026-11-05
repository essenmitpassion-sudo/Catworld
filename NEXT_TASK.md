# ACTIVE TASK: G0 ONLY — First visible cat action

Build the smallest **working** Neonpaw 2D pixel-art prototype: visible black alley cat in a tiny readable neon alley, embedded editor with `move_right()`, Run / Step / Stop / Reset, highlighting executing line, clear errors, reproducible reset and secure narrow interpreter. Press Run and see the cat take exactly one tile step. On invalid commands, do not crash. Show a tiny clear goal; the first successful movement is rewarding.

**Do not implement the long-term roadmap!** Long-term documents are design constraints, not a feature queue. No fleets, energy networks, factories, procedural maps, chapter select, subscriptions, extra agents, cloud, AI code completion or overbuilt renderer. Limit new modules to `core`, `code`, `content`, `ui`, `tests` as needed.

## G0 red-green-refactor evidence
1. Inspect actual source/branch/dirty status and baseline. If new repo, initialize clean.
2. RED test: moving one tile / boundary refusal, unknown AST or call denied, Stop/Reset, budget. Capture failing test output from missing implementation.
3. GREEN: world transition, bounded/cooperative interpreter and pygame-ce UI. Confirm actual executable frame with editor, cat and action.
4. REFACTOR smallest cleanup, all tests re-run, record concrete command and exit code.
5. UI end-to-end smoke by actual app interaction where supported; if unavailable explicitly `UI_UNVERIFIED`, not fake PASS.
6. Commit to branch, update CURRENT with branch/SHA/dirty/test evidence, open PR and state one NEXT task only when G0 done. If nearly out of context/credits, checkpoint rather than expand.

Acceptance: visible correct one-step movement, beginner-readable objective, no unrestricted script execution, reset/stop safe, tests green, source recoverable, startup instructions accurate. Human usability remains NEEDS_HUMAN until owner or another person observes.
