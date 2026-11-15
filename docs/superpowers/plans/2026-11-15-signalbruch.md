# SIGNALBRUCH implementation plan

Execute inline under the user's standing autonomous instruction. One writer. Spec: ../specs/2026-11-15-signalbruch.md.

- [x] Write failing timing/legality fixtures: buffered send, relay dwell/reroute, takeover/seal, simultaneous influence/HQ results, autonomous emission, expiry, alternating action order, deterministic maps and replay-backed validation.
- [x] Implement data-driven pure network engine, forecast and legal-action AI; simulate whole games with distinct policies and paired initiative.
- [x] Replace the old role/board UI with a readable node map, physical packet progress, three contextual actions, receipt log and immediate input feedback. Keep save/restart/replay.
- [x] Verify complete actual UI win/loss and each action type, reload across network ticks, preview uncertainty labels, narrow screens, reduced motion and denied storage; inspect screenshots.
- [x] Fix the largest measured P0/P1 failure, rerun relevant checks, commit and verify authorized GitHub/Sites source; publish the matching private build; update CURRENT/NEXT_TASK and restoration artifacts. State remaining human-fun/duration uncertainty.

Publication 61a9d4b is confirmed by native deployment success and version source readback. GitHub CI passed. Default-branch push was rejected because independent VERSATZ work advanced it; preserved that work and verified a separate strategy/signalbruch-prototype source branch instead. Final metadata/recovery receipts are recorded in ignored work/ files to avoid self-referential commit hashes.
