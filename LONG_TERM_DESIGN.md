# NEONPAW — Long-term Game Design, v3

## North Star
A cozy-but-clever cyberpunk programming automation game with a black alley cat as the protagonist. Player journey: **one observable command → robust autonomous city systems**. Playable with no prior knowledge of programming; legitimately challenging for practiced developers. Use real Python syntax within explicitly supported game capabilities; avoid promising full Python execution or CPython compatibility without a hardened execution boundary.

**100 hours are a design aspiration, not a shipping requirement or a mandatory grind.** Build systems with combinatorial depth; validate that players choose to return before adding breadth. A small engaging prototype outranks a vast content plan.

## Design pillars (priority)
1. **Code causes visible change.** A program changes an understandable world with readable animation and line-level execution tracing.
2. **Power from comprehension.** New programming concepts solve previously costly or brittle tasks, not just increase output numbers.
3. **Friendly entry, hard mastery.** A Guided and Free mode operate on one simulation and one canonical set of rules; help, pacing, and UI change, not game physics.
4. **Real consequences, fair recovery.** Battery, limited time windows, routes, prioritization and device contention make decisions matter; failed experiments reset quickly and never destroy the player's program.
5. **Automations that compose.** A route becomes a function; functions become reusable device control; policies become networks; networks become robust systems.
6. **Distinctive world.** Black cyberpunk cat, expressive small pixel motions, neon alleys/rooftops, approachable hacker fantasy. Original content; no game code or assets from The Farmer Was Replaced.

## Dual-mode single game
### Guided (default for beginners)
- Begin with a single clear goal and a runnable one-line example. No mandatory pre-lecture.
- Explain what happened using plain language, current line highlighting and world playback, not just abstract console text.
- Three optional hint levels: locate relevant observation → identify programming principle → partial pseudocode or incomplete example. Full solution only through explicit opt-in and marked as assisted.
- Introduce at most **one new syntax concept per early mission**; follow every introduction with (A) coached application, (B) independent variation, (C) later retrieval in another context.
- Provide a 30-second 'why this worked' recap and a next playful hook. Mistakes have no resource penalty in tutorial levels.
- Support retry, re-run, stepping, replay, glossary, code history/undo, accessible font/scaling and readable error messages.
- Give 1–3 alternate strategies and 'why' only after player solved a level, never spoil an unsolved puzzle.
### Free / Expert
- Skip introductory dialogues and gating of known language features, subject to **scenario capability constraints** and technical safety allowlist.
- Optional code golf, efficiency, reliability, constrained energy/time and randomized-input challenge variants, plus simulation profiling.
- Enable custom experiments on unlocked maps, replayable seed and comparison of different strategies.
- Switching modes preserves authored code, completed objectives, inventory and scores. Scores tagged by allowed capability set; assisted/unassisted results remain distinguishable but no shaming.

## Play progression, illustrative targets not promises
| Band | Fantasy | Concepts introduced | New systemic tension | Expert depth |
|---|---|---|---|---|
| 0–15min | Cat in alley | Calls, sequence | position, pickup | fewer commands / alternate route |
| 15–60min | Street courier | for/range, errors, basic if | obstacles, delivery | unfamiliar layout |
| 1–3h | Battery lane | variables, boolean conditions | charging and timing | reliable policy across seeded layouts |
| 3–10h | Workshop | functions, parameters, lists | deliveries, repeated tasks | route decomposition, profiling |
| 10–25h | Rooftop links | reusable modules, data structures, basic search | multiple sites & changing schedules | test suites, route planning |
| 25–50h | Autonomous district | task queues, multi-agent coordination, contracts | contention, failures and budgets | scheduling, optimization |
| 50–100h+ | City network | robust architecture, simulation, debugging | disturbances, interacting subsystems | resilient autonomous policies, custom challenges |

**Time bands are hypotheses to validate against actual players.** Never hold a player for a fixed amount of time; fast learners advance by demonstrated mastery.

## Six evergreen challenge families
1. **Navigation:** pathfinding, one-way doors, blocked alleys, changing access; simple movement early, route finding later.
2. **Collection/Delivery:** pickups, carrying capacity, deadlines, bundling and handoffs.
3. **Energy/Infrastructure:** charging queues, brownouts, repair priorities, device budgets.
4. **Sensing/Uncertainty:** stale sensor data, changing conditions, fault-tolerant checks. Keep hidden information fair and observable.
5. **Coordination:** multiple cats/drones with shared chargers, locks, collision risks and priority queues.
6. **Verification/Optimization:** replay, instrumentation, regression tests, seeded scenario suite, tradeoffs of speed vs energy vs robustness.

Each family must have at least two plausible strategy approaches. Later missions combine existing rule families instead of inflating content lists. A player should be able to recognize why the same strategy no longer works.

## Core game loop across scales
**Local 45–120 sec:** inspect objective → write/change tiny Python code → run/step → see world execute → get diagnostic feedback → adapt → celebrate unlock.
**Session 15–40 min:** complete a district objective → optimize or extend a solution → unlock an interaction with world → save reusable routine → choose next story/engineering problem.
**Long term:** construct a library of personal code, confront new constraints, investigate failures, build resilient systems, compare strategies on replayable cases.

## Progression / rewards
- Unlock **new verbs, sensors, controllable devices and scenarios**, not only numeric multipliers.
- World visibly repairs or changes: neon sign lights, alley safe passage, a friend rescued, district powered.
- Preserve player's authored scripts as collectible 'inventions'; players can reuse and improve them.
- Not every mission must be maximally efficient; first clear is enough. Optimization is an optional mastery layer.
- No idle timers to artificially extend playtime. No irreversible penalty for failed code in the first learning arc.

## Difficulty and quality gates
- Target: first visible correct action within 60 seconds for a beginner tester. Hypothesis, not claimed measured value.
- First 5–10 min: 3 mini goals with one visible payoff, plus demonstration that changing code changes behavior.
- Every new concept: one guided task, one transfer task with shifted map/data, one optional efficiency task.
- Explicitly test beginner comprehension, expert freedom and playtest enjoyment. Automated CI cannot award a FUN_PASS.
- Difficulty grows via combined known mechanics, meaningful constraints and variety; never through arbitrary punitive syntax tricks.

## Content scaling mechanics
- Define levels declaratively: tiles/devices, initial state, allowed language nodes, action APIs, objective predicate, hint tiers, scenario seeds and expected trace *properties*, rather than exact solution scripts.
- Use a small composable library of game rules, each accompanied by invariant tests; content can combine validated rules.
- First create 3 handcrafted missions; only later add seed variations, scenario editor, generator or modding. Content generation must be property-tested for solvability, fair constraints and reproducibility.
- Maintain capability profiles: `tutorial/sequence`, `tutorial/loops`, `expert/standard`, etc. All profiles share interpreter and simulation.
- Defer live economy, online leaderboards, multiplayer, account systems and AI-generated level content until proven demand.

## Expected player emotion
Curiosity → control → relief when a bug becomes obvious → satisfaction when a program works → delight when a routine automates a tedious task → pride when a complex network survives a disruption.

## Not now
No complete megacity, multiplayer, runtime agent swarm, tactical combat, inventory RPG, lore encyclopedia, production art pipeline, in-game generative AI, GPU dependency or hundred-hour content dump for MVP.
