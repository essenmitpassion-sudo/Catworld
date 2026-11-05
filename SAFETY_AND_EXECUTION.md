# NEONPAW v4 — RED/GREEN, checkpoint and release gates

## Hard safety constraints
Never execute player-submitted Python unrestricted via `exec`, `eval`, shell or dynamic imports. Start with supported AST subset and tight built-in game API. Even an AST allowlist is NOT a security sandbox for truly untrusted programs: reject attribute access, imports, file/network/process APIs, uncontrolled object allocation and recursion; bound AST size/depth, operations, loops, execution steps, outputs, memory proxies and frame work. Run programming VM cooperatively; engine frame and Stop must keep responding. For public sharing or arbitrary external scripts require a separately audited OS/process sandbox and threat model. Do not falsely call parser-only validation 'secure'.

## RED -> GREEN -> REFACTOR for behavior changes
RED: behavioral test absent behavior/bug, fail for expected reason; save command, exit code, brief observed output.
GREEN: minimal change; same test green, existing regression suite green; save command, exit code.
REFACTOR: cleanup with no changed behavior; rerun tests and game smoke. No tests for pixel styling alone, but verify legibility/real interactive flow separately.
At each gate include a counterexample: bounds, invalid instruction, infinite loop, Stop, Reset, save/replay, deterministic seed. No adjusting tests to suit bug without justification.

## Definition of Done (DoD)
- Tested player-observable behavior against active task; explicit negative tests.
- Core tests pass, UI smoke actually exercised or `UI_UNVERIFIED` recorded.
- Syntax/teaching objective accurate and novice path readable.
- Start instructions checked in target environment; no uncommitted essential assets.
- New architecture is smallest required addition; no feature outside scope.
- Safe SHA, branch and PR; `CURRENT.md`, `PROGRESS_LOG.md` and `LEARNINGS.md` updated with evidence and single next action.
- Human fun/learning quality remains `NEEDS_HUMAN` until someone actually plays.

## Recovery states
`CONTINUE` = verified progress & next work within scope.
`FIX_P1` = reproducible play-blocking failure.
`STOP_P0` = possible loss of only source, secrets, destructive reset, conflicting writers, unsafe player code execution, broken restore, or stale branch overwriting newer work.
`CHECKPOINT` = budget/context/time pressure or >2 unsuccessful attempts at same bug; no new features.
`NEEDS_HUMAN` = player enjoyment/comprehension not verified (technical progress can still be committed).

## Durable checkpoint procedure
1. Capture branch, HEAD, `git status --porcelain`, untracked files (exclude secrets), task, versions, test cmd/outcome.
2. If incomplete, create isolated WIP branch and *safe* WIP commit; never label broken work production-ready.
3. Push to remote if permitted and verified, record commit and PR link. If cannot push, say LOCAL_ONLY with exact recovery and backup gap.
4. Update `CURRENT.md` with reproducible next action; append evidence to `PROGRESS_LOG.md` and decisions to `LEARNINGS.md` (do not overwrite history).
5. On resumption re-check remote HEAD, PRs and tests; do not blindly apply prior plan.

## Merge gate
Protected main preferred; no force push. PR must have tests and review status, checks required by repository policies. If no CI yet, mark `NO_CI` and add small CI as first maintenance task after G0, not use an unverified green badge. One core writer. No fake CI claims or merge from a red gate.

## Budget policy
Use bounded runs, no autonomous unlimited loops. Prioritize persistence before quota exhaustion (proactive checkpoints, not relying on last-second automation). At a checkpoint return precise next command; the next authorized Codex invocation resumes. GitHub updates never guarantee Codex execution.
