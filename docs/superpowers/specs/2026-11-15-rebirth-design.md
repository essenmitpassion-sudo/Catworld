# Rebirth: VERSATZ

The new owner brief supersedes the previous VEIL-specific direction. Keep the small vanilla-JS build and testing approach; replace the game rather than accumulate modes. Historical VEIL remains in Git at `022f7f4` and in the verified `work/pre-rebirth.bundle`.

## Three complete candidate cores

**VERSATZ.** 5×5, three equal pieces per side; compact research start B1/C1/D1 and B5/C5/D5. The tested shipping default is A1/B1/D1 versus B5/D5/E5 (180-degree symmetric). Move one piece one orthogonal square, capturing an enemy on entry; then slide the destination row left or right, wrapping pieces around. Own occupied squares cannot be entered; stepping itself never wraps. Win by occupying the opponent's central gate after your complete turn, or eliminating all enemies. Threefold board+turn repetition, no legal move, or 120 plies draws. The active player alone checks gate victory. No extra currency, power or tie-break score.

**NACHHALL (new alternative).** 5×5, three equal pieces each. On a turn first resolve your previously marked blast (remove any piece there), then move one piece one orthogonal empty square and mark one adjacent square. One public pending blast per side; the opponent gets one reply to evade or exploit it. Last surviving side wins; simultaneous last casualties, threefold full-state repetition, no legal action, or 100 plies draw. Counterplay: abandon the threatened square, threaten the attacker's escape, or force a sacrifice. Risk: two distinct resolution times and compulsory markers add explanation and visual bookkeeping.

**PFAND (new alternative).** 5×5, three pieces per side: one secret standard, two guards; swap their deployment secretly before play. Move one piece one orthogonal square or publicly reveal an adjacent enemy instead. A revealed guard defeats an attacking hidden piece; all other attacks capture normally. Capture the standard to win. Revealing your own standard is compulsory after your second capture. No moves, threefold full-state repetition, or 100 plies draw. Counterplay: spend tempo revealing a suspected guard, sacrifice to disclose a standard, use public information to attack. Risk: guard exception and information management threaten two-minute clarity; novelty relative to hidden-rank games is uncertain.

| Criterion | VERSATZ | NACHHALL | PFAND |
|---|---|---|---|
| Recognizable USP | Every step transports a whole row | Public future danger | Capture reveals your own objective |
| Clarity | Strong, provided final-board preview | Two timing stages | Several combat exceptions |
| Decisions/turn | Piece, destination, shift direction | Evasion and threat placement | Attack versus information |
| Depth hypothesis | Shared transport creates tactical reversals | Tempo traps | Bluff and deduction |
| Pace | Immediate interaction, compact board | Threats may encourage flight | Information turns can stall |
| Counterplay | Move enemies as well as yourself | One reply to every blast | Inspect before attacking |
| Feasibility | Very high, exact deterministic search | High | Moderate; fair belief AI needed |
| Extension without bloat | No extension required | Avoid extra blast types | Avoid extra ranks |

**Decision (agent's call): VERSATZ.** Smallest ruleset, strongest immediately visible consequence. VEIL's known initiative concern and multiple subsystems make it a weaker fit to this new minimalism brief. Originality is a design hypothesis, not an exhaustive novelty claim. Reconsider only if reproducible tests expose a broken core.

## Architecture and feel

Use existing Node24/esbuild/vanilla JS; no framework migration. Pure rules and immutable match history, alpha-beta opponent in a module worker, UI with persistent piece elements. Choose piece → choose highlighted neighboring square → inspect both slide directions → explicitly commit. Preview shows every affected piece and capture, gate victory only after shifting. Animate the step and then the row separately, including a wrapping copy. Three AI levels: one-ply heuristic, depth 3, iterative depth 5 with bounded nodes. Search obeys actual repetition and ply draws. Local hotseat uses the same rule engine. Undo restores exact snapshots; AI mode undoes to the previous human decision.

## Proof and limits

First validate literal rule fixtures plus an independently expressed reference transition. Then seeded random/heuristic/search tournaments, rotated and reflected starts, role-swapped pairings, bounded forced-opening search, repetition and timeout metrics. Browser clicks must complete hotseat and AI matches, verify preview versus committed board, reload/undo/rematch, keyboard, and mobile layout. No claim of human fun or solved balance. Preserve existing owner-private hosted VEIL unless an intentional matching release is published; GitHub and standalone VERSATZ are the requested deliverables.

## Evidence-driven adjustment

The compact deployment yielded 64/64 starter wins in the follow-up depth3 paired batch; the offset deployment yielded 19/64. Choose offset as the provisional default, retain compact as an explicit research setup, and do not call either balanced. Revanche switches initiative. Exact results are in docs/balance-exploration.json. No extra victory route or score compensation is added.
