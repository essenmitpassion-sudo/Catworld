# PROJECT UNCHARTED – current owner direction

Read PROJECT_STATE.md and REQUIREMENTS.md first, then docs/directives/MASTER_V3.md and docs/MASTER_V3_ANALYSIS.md. The owner explicitly rejected VERSATZ on 2026-11-16: replace it with a new game; use earlier attempts only as lessons. This overrides historical VERSATZ continuation instructions in CURRENT.md, NEXT_TASK.md and docs/PHASE_2_DIRECTIVE.md. Do not continue the old repetition investigation or treat old reports as evidence for a new game.

Current tree still contains VERSATZ product code. No new concept or product has been implemented yet. Latest immediate request: analyze the new project prompt step by step. After that, autonomously compare three new core concepts as prescribed in V3, choose one, and implement the smallest complete playable run. No ordinary approval pauses or unnecessary agents. Keep the game small; distinguish technical checks, actual browser execution and human quality judgments.

Before any destructive replacement, verify the remote archive refs. Already pushed and read back on the authorized origin https://github.com/essenmitpassion-sudo/Catworld.git:
- archive/catworld-original-2026-11-16 = 7175190acf5dec4c84bf00d1a1d22f36acb4c1d2
- archive/versatz-before-v3-2026-11-16 = 2d4874e1810a562ed50587e46eb4faa97d518059

Work on development/v3-continuity. Preserve Git history and other prototype branches; no force push or history rewrite. Commit functional increments, verify authorized non-force pushes by SHA readback, update REQUIREMENTS.md and PROJECT_STATE.md. Every requirement has an ID, concrete acceptance criterion, priority, status and actual evidence. Use OPEN / IN_PROGRESS / IMPLEMENTED / VERIFIED / BLOCKED. Never mark human enjoyment or strategic depth verified just because tests pass.

Available infrastructure: Node24, vanilla JS, esbuild, Playwright and /usr/bin/chromium. Original tests/build currently concern VERSATZ only. Choose technology to fit the new concept; keep dependencies minimal. Actual browser gameplay is required when possible. Never confuse a standalone or intercepted-origin browser test with hosted publication. No automatic Sites/audience changes.

Retain the intent of docs/STORAGE.md: bounded disposable outputs/cache, stable overwrite paths, seven-day CI artifact retention. Preserve source, unknown files, Git history, work/preview and any fixed-name recovery bundle; no broad git clean or system cache purge. Existing cleanup has a VERSATZ package-name guard; adapt it explicitly if package identity changes. Put intermediates in work/.
