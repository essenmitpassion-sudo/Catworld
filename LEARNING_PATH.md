# Implementiert vs. geplant — 2026-11-14

AFTERLIGHT bietet Aufrufe, Reihenfolge, begrenzte for/range-Schleifen, Run/Step,
Fehlerfeedback und reversible Versuche. Lernanlass: Energie priorisieren, Wege
planen, Akku holen und Strom neu verteilen. Keine vorgeschriebene einzige Lösung.
Die geführte Fassung enthält zusätzlich gestufte Hilfen, Abruf-/Transferaufgaben
und einen begrenzten gate_open()-Bedingungskontext. Kein allgemeines Python.
Variablen, eigene Funktionen, Container und die unten skizzierten späten Systeme
sind Zukunftsplanung. Abschluss und grüne Tests beweisen keinen Lerntransfer.
Menschlicher Test: nächste Aktion vorhersagen, eigene Route bauen, Fehler erklären,
Prinzip auf anderen Weg übertragen. Beobachtung und Spielerantworten erst nach
wirklichem Test erfassen; keine erfundenen Ergebnisse.

# NEONPAW – competency map v3

Learning is not measured only by finishing a mission. For each concept the player must (1) observe, (2) practice, (3) transfer to a changed problem, optionally (4) optimize. Player-written code is retained and reusable.

| Concept | Game situation | Accessible guided objective | Free/expert opportunity | Evidence of learning |
|---|---|---|---|---|
| Calls / ordering | first alley | cat moves, collects | shortest legal route | predicts next line, fixes wrong order |
| for / range | longer corridor | repeat walking | code length vs ticks | handles new route length |
| if / booleans | sensor gate | avoid blocked tile | robust branching under seed changes | solves altered obstacle |
| Variables | battery & scrap | track state | reliable threshold controller | explains changing value |
| Functions / parameters | repeat delivery | own reusable routine | abstraction vs specialized route | transfers function to new level |
| Lists / dictionaries | multiple terminals | maintain queue | dynamic routing | applies data structure instead of hardcoding |
| Debugging/tests | intermittent fault | step, inspect trace, replay | scripted regression tests | fixes a fresh failing test |
| Graphs/pathfinding | roofs | choose a route | minimize energy/time | compare two paths |
| Scheduling/coordination | drones & power | handle shared charger | robust multi-actor policy | deterministic seeded incident suite |
| Architecture | city infrastructure | compose tested routines | modular solutions, simulation harness | independent failure isolation |

Guided mode uses one new syntax concept per early mission, H1-H4 optional hints and slow stepping. Free mode skips explanations and allows early use of known constructs within scenario capability and security constraints. Both share save, goals and transition semantics; switching is reversible.

For detailed curriculum and mode/UI behavior see TUTORIAL_SYSTEM.md. For future arcs, read LONG_TERM_DESIGN.md. The hour bands are exploratory, not promises.
