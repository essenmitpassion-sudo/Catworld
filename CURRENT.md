# VERSATZ · Current handoff · 2026-11-15

Active owner instruction: docs/NEXT_DEVELOPMENT_DIRECTIVE.md (continue autonomously; no restart; investigate balance causes, improve actual counterplay and game feel). Latest increment starts at d46be8b and leaves RULES.md unchanged. It supersedes VEIL-specific direction. Repo https://github.com/essenmitpassion-sudo/Catworld.git; branch rebirth/versatz; authorized default remote g0/first-cat-action. Read git log and work/remote-receipt.json for exact pushed tip. Pre-rebirth checkpoint022f7f4 and verified full bundles remain in work/.

## Product

5×5, three equal pieces, step/capture then chosen cyclic destination-row shift; own-turn final-board gate/elimination win. Threefold repetition, no move or120 plies draw. Formation2 remains provisional default, NOT established balanced. Hotseat or embedded worker AI with1/3/5-ply limits; undo, replay, validated save/reload, standalone HTML.

New: exact immediate winning reply in preview with concrete move/gate; capture/transport/end-square explanation; projected-board accessible labels; projected board read-only and explicit “Anderes Feld” preserving source; direction changes only on activation, not focus/hover. Mobile390×844px keeps board/confirm jointly visible on review; longer reply cards trigger necessary scroll. Absence of immediate win warning is explicitly not safety.

AI now removes equivalent sibling successor boards after ordering. Same parent history/next ply/repetition key ensures equivalent future rules. No transposition table. Complete depth4 values match frozen baseline16/16;25,600→21,853 visited nodes. At2k-node budget2/16 deeper completed searches, no regressions. Measured milliseconds did not improve; no wall-clock claim.

Pure rules src/engine.js; AI src/ai.js; exact tactical projection src/tactics.js; worker src/worker.js; UI src/main.js/style.css. Build embeds all modules/worker in dist/VERSATZ.html (~45kB), also dist/index.html. Node22+, esbuild. Optional npm run dev port3000; no runtime server/network required. npm ci here may need --cache /workspace/Catworld/work/npm-cache.

## Evidence

23 Node tests. Existing full browser matches: hotseat21 gate; human-Ivory AI11 elimination; human-Jade/default15 gate loss; local32 repetition. Additional full worker matches: quick17 Ivory win; tactical14 Jade win; deep12 Jade win. Both are automated real UI clicks, not human playtesters. Preview danger and legal alternate direction, actual loss, exact undo, another-piece gate win, capture+transport, read-only review, revise preserving source, genuine keyboard Tab/Enter, mobile fit and all old normal-motion left-wrap/step-before-shift checks. No runtime errors in final runs. Exact built artifact served at intercepted origin, not a live hosted/file:// claim. docs/browser-results.json and docs/counterplay-browser.json; screenshots work/ visually inspected.

68 controlled follow-up baseline games in docs/intelligence.json: full histories independently checked by coordinate oracle; source hashes and actual depths, distinct traces up to rotation/reflection, alternative evaluations and seeded opening prefixes. Frozen legacy AI in scripts/lib/baseline-ai-v1.mjs from d46be8b avoids conflating current improvements with baseline causes. All starts180°+color symmetric; no rule/gate/attribution bug found. Compact depth3 starter wins both, depth4 second wins both; offset opposite pattern. Same evaluator/different tied choice after ply4 changes subsequent self-play outcome (docs/tie-audit.json). This is horizon/tie sensitivity, not solved fairness.

Immediate-loss avoidance proxy wins11, loses4, draws1 versus identical unfiltered ranking; avoidable immediate blunders0vs11. Both filtered/raw still lose0:8 againstdepth3. No human learning/fun inference. Different four-ply openings yield5/8 draws: looping remains a priority. Seven-ply exhaustive horizon yields no forced starter win for both compact/offset; at9 plies both separate250k-node budgets exhaust, result UNKNOWN.

Concrete reachable tactics in docs/tactical-cases.json: one move captures+transports another enemy, same step/different direction determines immediate reply loss, another transported own piece wins, forced3-ply tactic verified for all14 independently enumerated replies. docs/INTELLIGENCE.md explains causes/limits/alternatives. Old800+200 games in playtest/balance-exploration belong to d46be8b, not a claim about every subsequent AI revision.

Independent read-only review re-audited68 transcripts,104 immediate wins,18 fixed-depth baseline/pruned comparisons. Found Important projected-click ambiguity; now fixed under browser RED→GREEN. Focus/hover silently changing direction also reproduced/fixed. Minor timing caution accepted; no speedup claimed.

## Commands and delivery

npm test; npm run build; npm run smoke; npm run smoke:counterplay; npm run research (68 baseline controlled games); npm run benchmark; npm run tactics; node scripts/tie-audit.mjs. Standard CI runs unit/build/800 simulation/both browser suites and uploads HTML/evidence. GitHub CI readback previously returned Forbidden; do not claim remote CI green without actual evidence. Native git non-force pushes are authorized and must be read back.

Historical owner-private Sites project remains VEIL, not VERSATZ. No new Site/audience change. Requested projectless /codex/browser/... output path is read-only on this host; do not retry or fabricate chat download. Use repository source/CI artifact and local dist.

No live background continuation is promised. Next active action: NEXT_TASK.md.
