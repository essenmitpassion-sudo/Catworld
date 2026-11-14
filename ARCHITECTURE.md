# Tatsächlicher Implementierungsstand — 2026-11-14

- `neonpaw/district/world.py`: unveränderlicher District, deterministische Aktionen,
  Stromverteilung, Akku, Brücken. `transition(world, action)` ist die aktuelle API.
- `neonpaw/code/runner.py`: gemeinsam genutzter begrenzter AST-Interpreter;
  District injiziert seine transition_fn. Kein uneingeschränktes exec/eval.
- `neonpaw/district/app.py`: Editor, Run/Step/Stop/Reset/Rewind, Ereignisse,
  proportionale Fensterdarstellung, pausierende Hilfe/Crew-Nahansicht.
- `scene.py`, `characters.py`, `residents.py`: Rendering, gecachte Originalgrafiken,
  Ausdrücke und präsentationsseitige Bewohnerbewegung ohne Änderung der Spielregeln.
- `neonpaw/ui/app.py`, `core/world.py`, `content/levels.py`: ältere geführte Fassung.
  Zwei Weltmodule bestehen tatsächlich; Zusammenführung ist kein erledigtes Feature.
- District speichert Code separat und atomar; Welt startet beim Öffnen frisch.
  Beschädigte Entwürfe werden geschützt. Geführte Progression hat eigene Speicherung.
- `scripts/build_playtest.py`: kuratiertes ZIP mit Commit, Dirty-Flag und Dateihashes.
  `launch_afterlight.py --self-test DIR`: isolierter Pakettest mit temporärem Entwurf.
  Windows-CI ist eingerichtet; ein erfolgreicher nativer Lauf muss separat belegt werden.

Der folgende frühere Architekturentwurf beschreibt auch Ziele, nicht nur implementierte APIs.

# NEONPAW – architecture v3

Start with Python 3.12+, pygame-ce, pytest, entirely offline. The system is designed for growth through **stable boundaries**, not prematurely implemented frameworks.

**World simulation is authoritative** and deterministic: `transition(world_state, action, tick, seed) -> new_world_state, events`. Presentation and scripting cannot mutate raw state directly. Progression content is separate, declarative and can vary maps, available script capabilities, objective predicates and hint tiers without new renderer logic.

**Script engine:** restricted Python AST interpretation of an explicit subset using game-specific functions; actual Python grammar/semantics for supported constructs. Never run player-supplied text via unrestricted `exec`/`eval`. AST allowlist alone is not a secure general Python sandbox; restrict types, calls, depth, steps, loop iterations, output size, input length and memory proxies. Unknown AST node rejected. Cooperative stepping with pygame event loop, safe Stop/Reset and failure display. Treat actual sandbox isolation as a separate technical security review before allowing external untrusted code.

**Minimum first split:** `core/world`, `code/runner`, `content/levels`, `ui/app`, `tests`. Only introduce `devices`, multi-agent coordinator, events, persistence, schema migrations and performance profiling as real features require them. No ECS, homemade framework, generic event bus, backend, GPU or online service for MVP.

**Future scaling:** composable world rule primitives with invariants and deterministic replay seeds; scenario content authoring by configuration; unified execution trace; capability profiles per mission; performance counters independent from animation speed; saved code versioning. Hard problems (multiple agents, scheduling, supply networks) must reuse the same world semantics, not fork engine or language implementation.

**Quality:** RED failing behavioral test, GREEN minimal implementation, REFACTOR keep tests green, UI smoke, external beginner/expert test when available, checkpoint in GitHub; no claim of human fun PASS without human test. See SYSTEMS_AND_SCALING.md and MILESTONES_AND_GATES.md.
