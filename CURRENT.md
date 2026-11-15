# VERSATZ · current handoff · Phase2 · 2026-11-15

Latest owner directive docs/PHASE_2_DIRECTIVE.md, supersedes earlier phase instructions: continue existing game, compare evolution/innovation/radical ideas, implement only proven useful choice, actual UI playtests, verified commits/pushes, no concept restart. One integrator; read-only reviews only. Repository https://github.com/essenmitpassion-sudo/Catworld.git; branch rebirth/versatz; default g0/first-cat-action. Baseline34a7e57, recovery checkpoint/pre-active-rules-34a7e57. Current exact pushed tip is in git log and work/remote-receipt.json.

## Current product

RULES.md now v2. Same5×5/3 pieces/orthogonal step-capture then cyclic target-row slide. New single constraint: full move changes board or immediately wins. Carrier returns/captures remain legal; unchanged-board gate win exception preserves own-turn victory timing. No new action, figure, resource or permanent variant selector. Formation2 and default evaluator unchanged.

src/engine.js serializes version3. Browser uses versatz.v2; previous versatz.v1 state is preserved intact and only its valid settings seed a clearly announced fresh game. Old rules are not a product mode. Pure frozen controls in research/rules-v1 support reproducible historic/model comparisons without browser imports.

UI chooses first actually legal shift, disables/explains empty direction, guards synthetic clicks. Review board remains read-only, revise preserves piece, focus/hover do not choose directions. Exact preview explains capture/transport/end-square and immediate enemy win, never calls absence safe. Worker AI levels unchanged regular1/3/5 search plus exact1v1 for tactical/deep; solver automatically regenerates graph through current legality and respects real history/time. Undo/replay/save/cancel behavior retained. Standalone dist/VERSATZ.html ~53kB, no runtime network/backend.

## Evidence and limits

Independent variant comparison: docs/phase2-comparison.json,60 complete games (42 native,18 explicitly fresh-history midgames). Same legal model used by both players, search and exact tail solver; alternative evaluations, both starters. Native active14 results9 starter/4 second/1draw versus classic7/5/2; not balance proof. All6 fresh fixtures remain draws, but empty turns24→0, captures0→4 and genuine shared transports0→30. Shared-transport metric corrected under independent review with two RED→GREEN fixtures; all60 trace hashes unchanged. No human fun claim.

Resonance prototype (mixed row slides2) gives short gate races/native10 starter wins of12 decisive, fewer captures; rejected extra conditional. Opponent steering radical option rejected before implementation because two decisions per turn work against simple fast play. Only active-turn evolution shipped. Complete limited starter-win search through7 plies negative for compact/default; longer forced openings remain unknown.

docs/phase2-tactics.json and docs/endgames-v2.json contain native reachable evidence: prefix16 classic exact draw → current exact win13, finishing29 vs classic repetition34. Short tempo trap prefix24: all3 legal defenses lose next; old empty pass delays immediate loss, old best win5 vs new3. Full structural1v1 enumeration at full120-ply allowance/no prior repeats: current762win/326loss/112draw versus classic696/282/222. These are not opening win rates and include structurally possible but nonterminal-unreachable starts.

Current800 profiles docs/playtest-current.json:41draws,45.67mean plies; v1 was76/48.80. Repetition draws48→13, limit draws28 unchanged. Random action sets changed, so do not call this a human controlled study. Tactical equal-policy starter37/48 across four formations, default8/12: fairness still unresolved, no formation tuning to manufacture50/50. Deep beats tactical48/48 in this narrow matched pool, not universal strength.

38 Node tests after rule-contract/transport-metric additions; all1,200 current1v1 legality/rank/transition cases remain independently checked. Prior rule-version tests now use actual moving repetition loops; historical pass fixtures remain in explicit frozen research only. Independent reviewer verified15,311 legality transitions,40 active/classic outcomes, native witnesses, migration and separate cache imports; no important code defect. Corrected metric was the only actionable data finding.

Browser: full local21 gate, quick-opponent11 elimination, human-Jade/default15 loss, local32 repetition; three worker-level full games17/14/12; saved native tempo endgame16→29, plus actual3-ply tempo trap. Version migration preserving old bytes, invalid JSON recovery, one-legal-direction auto choice/disabled synthetic click/undo, normal left wrap and sequential step/row animation, 320/390/768/1440, read-only review and genuine keyboard flow. No runtime errors in completed runs. Automated inputs are not human playtesters. Screenshots in work; report files updated after final runs. Exact built HTML at intercepted origin, no hosted/file:// claim.

## Commands / delivery

npm test; npm run build; npm run smoke; npm run smoke:counterplay; npm run smoke:active; npm run simulate; npm run research; npm run research:endgames. Node22+, npm ci (here --cache /workspace/Catworld/work/npm-cache when needed). Optional npm run dev port3000. CI artifacts source/standalone only; remote CI readback previously Forbidden, no success claim without evidence.

Historical reports in docs/INTELLIGENCE.md refer to v1. Reproduce with research:classic, research:endgames:v1 or explicit classic tools; do not treat them as v2 results. Hosting remains old owner-private VEIL. No Site/audience changes. Projectless output path /codex/browser/... is read-only on this host; do not fabricate a chat artifact link or repeat that failed copy.

Next: finish active-turn checkpoint, then improve the most important actually observed interaction issue and verify it. Current observation to test: turn labels advance to next player during the prior player's still-running step/slide. This can make animation ownership unclear despite physically correct motion. Keep rule/formation/evaluation fixed while addressing it. No background continuation promise.
