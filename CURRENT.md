# VEIL / current handoff

Repository: https://github.com/essenmitpassion-sudo/Catworld.git. Local /workspace/work/catworld, branch strategy/veil-prototype. Owner explicitly replaced the entire former learning game with an original strategy game. Do not resume the abandoned Android prompt or CHAINCORE work here. Latest directive is docs/DEVELOPMENT_DIRECTOR.md. Single integrator, no automatic background continuation.

Baseline checkpoint 7175190acf5dec4c84bf00d1a1d22f36acb4c1d2: complete history verified in /workspace/work/catworld-before-replacement.bundle and catworld-backup.git. No old game is maintained in parallel. Default remote branch is still g0/first-cat-action; replace its contents by normal fast-forward, never force.

First playable prototype: 7×7, six agents per side, seeded hidden roles (two each), custom own setup swaps, move/capture or Echo, public role reveals, positional pincer override, three relays, 8-signal/elimination victory, 80-action cap/repetition draw, observation-only AI with three styles, complete validated local saves, exact-seed retry and historical-fog replay. The second player starts with 2 signal as a provisional initiative compensation.

Executed: 11/11 Node tests; standalone build; 48 deterministic full games (28 side-0 wins, 20 side-1, no draws; mean 17.29 actions; starter wins 34/48). Paired same-formation 24-seed initiative experiment: starter wins 36/48 at no compensation, 34/48 at +1, 31/48 at +2. No human fun or balance proof.

Actual Chromium UI: full win in 22 actions and loss in 24, setup swap/reload, action+pending-AI reload, original historical masking during replay, restart, native rules dialog, denied storage, 320/390/768/1920px and no page errors. Desktop/mobile screenshots inspected. Tests fulfill built HTML at an intercepted origin, not the hosted production site. No servers were started.

Critical design finding: 24 balanced bot games had 38 combats but zero pincers. Next high-impact experiment: closing a geometric pincer while moving captures the enclosed enemy immediately without exposing the moving role; retain the same roles rather than adding systems. Its failing fixture is staged in work/pincer-next.test.txt, outside the committed passing test suite. Implement this after securing the first playable checkpoint, then repeat rule/AI/browser checks and measure actual pincer use.

Commands: npm test; npm run build; npm run simulate; npm run smoke. Installed Chromium and Node24. npm may need --cache /workspace/work/npm-cache due unwritable default npm cache. npm install already succeeded with that path. No external art/font dependencies.

GitHub permissions were inspected through the connected app; gh auth status confirms authenticated HTTPS operations. Commit and push this milestone, verify exact remote head with ls-remote. Publish a browser link only after a real successful deployment, keeping GitHub as the primary source. No live URL exists for VEIL yet. Source push is not deployment.
