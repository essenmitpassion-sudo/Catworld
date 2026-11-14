# VEIL — Das Signalduell

An original hidden-information strategy prototype replacing the former Catworld learning game. Six agents per side; three cyclic hidden roles; public relay objectives; positional pincers; an observation-only computer opponent.

Build with Node 22+ and npm:

```sh
npm ci
npm test
npm run build
npm run simulate
npm run smoke
```

Open `dist/VEIL.html` in a modern browser. It is standalone: no runtime network, account or backend. Build output also includes static `dist/index.html`. Browser tests use installed Chromium (`/usr/bin/chromium`, override `CHROMIUM_PATH`) and fulfill the exact built HTML at a test origin because this managed environment blocks file:// navigation. No preview server is started.

Before starting, click two own agents to swap their positions. During play, choose an agent and an adjacent destination, or choose Echo and a marked enemy. Eight signal or elimination wins; all rules are available inside the game. New Duel changes the setup seed; Same Setup restarts that seed. Replay preserves historical hidden information. Reload resumes the complete authoritative action; invalid/denied storage cannot block play.

`src/engine.js` owns rules, observation projection and replay-backed state validation. `src/ai.js` consumes only observations and scores positioning, role probabilities, captures, pincers and relay denial. `src/main.js` owns UI and persistence. `scripts/simulate.mjs` creates deterministic complete-match examples, and `scripts/smoke.mjs` replays real win/loss matches through UI clicks.

Human enjoyment and repeat-play appeal are unmeasured. Initial automated results still show initiative bias and a low pincer frequency. The game is a prototype, not a claim of solved balance. See CURRENT.md for exact evidence and the next change.

The previous project is retained only in Git history, rooted at checkpoint `7175190acf5dec4c84bf00d1a1d22f36acb4c1d2`. Its game, teaching code, assets, old workflow and governance documents are removed from the current tree by the owner's explicit replacement instruction.
