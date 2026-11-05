# NEONPAW — GitHub hand-in-hand protocol

## Codex to ChatGPT
A0 publishes small branch/PR with tests, changed files, demo evidence if available, CURRENT status, and narrowly scoped unresolved risks. On actual run completion, GitHub artifacts become accessible to ChatGPT. No claim that a GitHub comment independently launches another Codex run.

## ChatGPT to Codex
ChatGPT independently fetches real branch/PR diffs, check results and source when available. It can use GitHub review/comments/issues for actionable feedback, updating NEXT_TASK only if the state is synchronized and no A0 writer conflicts. Codex reads them at next explicitly triggered run. Do not create competing parallel assignments or overwrite A0's unstaged work.

## Review order
1. Source-of-truth SHA + relevant PR + changes.
2. Safety, recoverability, functional acceptance, negative cases.
3. Learning quality, tutorial pacing, player experience, extensibility.
4. Pareto: value delivered per integration and maintenance burden.
5. One blocker / one prioritized next slice.

## PR template
- Intent and user-visible gain
- Before / after SHA, scope guard
- RED fail and GREEN pass evidence, regression/refactor tests
- UI smoke evidence; explicit manual-untested note
- Security/input budget tests
- Progress and learning entries
- Risks, open issues, next test
- Independent QA verdict and reviewer source

## Codex invocation reality
Cloud IDE/CLI orchestration needs a user-initiated task or configured approved automation. GitHub is an asynchronous mailbox, not a guaranteed push channel. Before automating triggers, validate device/network/credentials/repo protection and prevent cascading agent calls, usage churn and unauthorized merges. Avoid Desktop Commander for routine handoff.
