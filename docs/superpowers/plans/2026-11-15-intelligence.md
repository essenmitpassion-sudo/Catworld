# Gameplay intelligence implementation plan

Goal: find the cause/limits of the initiative findings, then make tactical counterplay readable without changing rules.
Architecture: keep rules/AI/UI; add a pure tactical projection and small independently audited experiment utilities.
Spec: docs/superpowers/specs/2026-11-15-intelligence-design.md. Owner requests autonomous continuous execution.

- [x] A/B: audit complete match and initial-state symmetry, unique normalized histories, actual search depths; bounded paired experiments with alternative evaluations/openings. Write meaningful contract tests for independent reference transitions and outcome attribution before tool implementation; record all run limits and source hashes.
- [x] C: write failing tests for exact immediate-win replies, capture/transport and nonmutation. Implement src/tactics.js; compare a one-ply policy with/without the exact immediate-loss filter using paired replayable matches. This measures the usefulness of available counterplay, not human learning or perfect-play balance.
- [x] D: write browser assertions for a concrete losing preview and legal alternative, terminal previews, keyboard/accessibility and complete matches. Implement warning/explanation and show projected-state labels; retain left/right wrap and sequential motion checks. Validate all three levels and both colors.
- [x] E/F: inspect mobile/normal-motion interaction, fix the most important observed bottleneck with regression coverage, run tests/build/targeted experiments/browser, update CURRENT/NEXT_TASK, read-only final review, commit/push each verified increment and verify SHA.

## Follow-up increment: actual compound route geometry

- [x] Test literal C4/B4/D4 distances, independent Bellman successor checks, color/reflection symmetry and evaluator preference; observe failures.
- [x] Add a tiny empty-board solo-distance helper and separate research-only `route` evaluation. Keep default unchanged while testing.
- [x] Compare equal-depth policies on different formations/prefixes/colors and independent material/race opponents. Keep no change merely because it beats one incumbent policy.
- [x] If justified, update default assessment with preserved legacy comparison, replay verification and full browser matches; otherwise preserve only the research result/geometry explanation. Commit/push verified result and record the next useful action.
