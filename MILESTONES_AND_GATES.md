# Roadmap, gates, stop rules

## G0 — executable foundation, first action
- One screen, cat, editable line `move_right()`, Run, visible action, Stop/Reset, clear error on invalid code; one tiny goal.
- Red Green Refactor with test evidence; UI smoke; GitHub commit/PR; source recoverable.
- Fail if code can touch OS, block UI, crash on simple invalid input, or movement and animation disagree.

## G1 — first loop with scrap
- Sequential move/collect/deliver actions, success predicate, three short maps and visible world state change.
- Human novice test once accessible; green tests alone do not mean learning proved.

## G2 — repetition makes sense
- `for/range` in restricted interpreter, loop stepping/highlight, dynamic altered route; hints scaffold; beginner independently transfers concept.

## G3 — adaptive world
- Conditional sensor, initial variable concept, one obstacle/energy variation. Keep syntax introduced one at a time. Deterministic replay.

## G4 — persistent code ownership
- Save/loading authored solutions, named routines/functions, minimal chapter selection, free-mode toggle; prove old save compatibility.

## G5 — first genuine emergent automation
- Two systems interact (e.g., battery charge + delivery deadline); one mission offers at least two meaningful approaches.

## G6+ — expansion only on evidence
- Functions, lists, multisite routing, fleets/queues/failures, deterministic randomized seeds, simulation & profiling. Branch only after prototype passes novice/expert playtests and architecture/load tests.

## Per-gate approval checklist
1. RED: relevant failing behavior test with command and failure cause; no artificial test rewriting to pass.
2. GREEN: minimum implementation; expected behavior correct, denial and edge cases checked.
3. REFACTOR: simplify while retaining all green tests.
4. PLAY: actual interactive end-to-end run, record steps or demo; human learning/fun explicitly unverified unless tested.
5. SAVE: current branch, SHA, test command/output, uncommitted/untracked status and simple restore instructions.
6. REVIEW: independent ChatGPT look at diff and concrete tests, prioritized issues; no claim ChatGPT approved unless review happened.
7. PROMOTE: only after integrator handles review, merge with permitted workflow; no force pushes.

## Decision gates
- Two unsuccessful iterations of same bug → stop, root-cause analysis and minimal reproduction.
- Context/tool quota risk → immediate safe checkpoint, handoff and no new features.
- No source visible on GitHub → source recovery P0; no feature work until secured.
- Repeated tester confusion → redesign onboarding before new chapters.
- Large content proposal without evidence → reject or park in BACKLOG.

## Metrics
Early: time to first action, 1st mission finish, independent transfer, hint reliance, error recovery, voluntary replay. Mid: number of authored reusable solutions, share of strategies that actually differ, success with altered map. Late: system robustness under seeded incidents, runtime ticks/energy, alternate solutions and repeat engagement. All metrics stay hypotheses until collected.
