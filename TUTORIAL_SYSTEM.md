# Onboarding and tutorial — two tracks, one engine

## 0 — Entry screen
Two equally visible options: `Teach me from zero` (guided) and `I know how to code` (free). A `Not sure?` button previews one small task. Players can change mode any time. Never assume skill from demographics or phrasing.

## One-screen UI composition
- Largest zone: readable pixel-world simulation and expressive black cat with accessible indicators.
- Code pane: syntax-friendly text, highlighted executing line, error line with explanation, Run / Step / Pause / Stop / Reset.
- Small objective panel: what success looks like, not a spoiler recipe. Optional Hints and Help always reachable.
- No popups during active execution. Keyboard-only use and scalable text are planned accessibility requirements.

## Intro sequence to prototype and test
1. **First whisker (0–60s intended):** `move_right()` is already shown; player presses Run, cat moves one tile. Player edits one command to move one more tile. Demonstrates code -> world causality. Do not claim player wrote it unassisted.
2. **Find the scrap:** 2–4 sequential API calls (`move_right`, `collect`, `move_left`, `deliver` once implemented). One line is wrong; error/incorrect outcome easy to notice. No timer.
3. **Alley gets longer:** repeat actions; `for i in range(3):` is explained as compact repetition. Make length change on transfer mission to test if concept was learned.
4. **First dynamic switch:** `if sensor_clear():` or simple `if has_scrap():`; only after steps 1–3 pass. Keep expressions compatible with real Python.
5. **Open playground:** replay solved map, try faster program or explore a slight variant. Optional expert prompt to improve efficiency.

## Hint ladder
- H1: observation (`Where is the scrap after the second step?`)
- H2: concept (`This sequence repeats. Could a loop express it?`)
- H3: partial scaffold (`for i in range(3):\n    ...`)
- H4 only explicit: show one full working solution + explain, label as assisted, offer a new independent transfer task. Hints never auto-execute or auto-edit player code.

## Error copy specification
Translate error category to plain language, including relevant line; provide underlying Python term in optional detail. Examples:
- `Unknown command on line 2. Try a command in your available toolbox.`
- `Indentation on line 3: commands inside the loop need to be indented.`
- `The cat tried to move outside the map. Nothing was lost; inspect the current position.`
- `Program stopped after the safe step limit. Check whether your loop has an exit.`
No accusatory tone, no cryptic interpreter crash. Keep errors separated: syntax vs unsupported feature vs world rule vs resource exhaustion.

## Learning analytics, initially local only
Store aggregated per-mission attempts, hints requested, time to first visible action, solved without copying a solution, success on transfer variation, user replay/next-session interest. No personal profiling or analytics SaaS at MVP.

## Acceptance by novice and expert
Novice: can start without explanation, predicts effect of next code line, recovers from a mistake, independently adjusts a variant.
Expert: can bypass guided text, solve varied puzzle several ways, optionally inspect execution trace and metrics, is not forced into fake Python rules.
Automated tests verify mechanisms, not human understanding. Human validation is `NEEDS_HUMAN` until actually observed.
