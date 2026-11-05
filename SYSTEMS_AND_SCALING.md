# Scalable system design without premature complexity

## Architecture invariant
A single deterministic simulation owns truth; display, Python program adapter, tutorial and scenario files are clients. `world = transition(world, action, tick)` makes action outcomes testable and replayable. World is **not** tied to pixel renderer, frame rate, platform, player skill mode or future fleet count.

## Minimum modular contracts
- `domain/` pure state transitions: positions, tiles, energy, inventory, devices, events; event messages describe results.
- `scripting/` restricted Python AST interpreter: capability profiles, budgeted/cooperative execution, mapping allowed calls to actions; no direct access to display or OS.
- `content/` declarative missions and objective evaluators, canonical deterministic seeds.
- `presentation/` pygame-ce rendering, camera, editor, traces, overlays, animation, sound.
- `persistence/` serialized player code, progress, schema version; only introduced once needed.
- `tests/` unit rules, interpreter denial tests, replay determinism, scenarios, UI smoke; later profiling.

Avoid creating every module before needed. Introduce a boundary when a second real feature needs it. A minimal split into world/runner/ui/content is enough initially.

## Python execution safety – design gate
An AST allowlist is *not* a general secure Python sandbox. Treat it only as a narrowly scoped interpreter over explicit supported syntax and game APIs. No `exec`, `eval`, reflection, imports, attributes, unrestricted calls, I/O, exception escapes, dynamic code or arbitrary modules in initial version. Validate source length, AST node count/depth, numeric/string/container sizes, time/tick budget, loop iteration count, recursion/call depth. Interpreter steps must cooperate with the UI event loop. A hostile-input test suite and a threat model are mandatory before calling it safe. No untrusted external scripts loaded without safeguards.

## Growth triggers
- Multiple devices: introduce entity IDs and resource arbitration only when a real mission needs two actors; single actor remains supported.
- Persistent missions: add schema version/migrations only when saving authored code/progress.
- Async event queues: only when a real interaction demands timed world events; preserve deterministic ordering.
- Scenario generator: only after handcrafted missions and a solver/checker prove a valid rule grammar; every seed reproducible.
- Profiling: record deterministic simulation ticks, action counts, energy, wait, failures; avoid benchmarks tied to animation frame rate.
- Editor ergonomics: upgrade incrementally as learning needs demand; never make a bespoke full IDE MVP.

## Stability invariants
All actions obey a consistent tick/energy model; world transition determinism for given state/action/seed; objective success based on state, not exact solution; Stop and Reset always recover; replay preserves same result; content data versioned; existing completed levels remain loadable or explicitly migrated.

## Performance budgets
Specify as targets and measure on representative hardware before reporting: basic simulation step should be fast enough to render smoothly, 60 FPS rendering as aspiration not promise, large-step fast-forward performed off frame-limited display, no unbounded loops or allocations, no GPU dependency. A headless stress suite should support hundreds/thousands of simulated actions efficiently before pursuing thousands of independent actors.

## Risks and mitigations
- Interpreter is unsafe/unresponsive → narrow feature set, denial tests, step budgets, independent security review.
- Tutorial patronizes expert → skip mode and optional optimization, no forced hand-holding.
- Beginner overwhelmed → one new concept, short feedback, recall/transfer, hints.
- 100h becomes grind → depth by interacting systems and high-value challenge families, no numerical inflation.
- Complex future plan distorts MVP → lock G0 scope and record future ideas as nonbinding.
- Multiagent merge conflicts → exclusive ownership, one integrator, independent read-only specialists.
