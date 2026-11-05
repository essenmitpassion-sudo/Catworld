# NEONPAW — verifiable progress journal (append-only)

Initial entry 2026-11-05: **G** Design package v4 created; no new repository or game code verified. No tests run. Never label docs as shipped product.

For every meaningful change append:

```
Date/time UTC:
Scope / task ID:
Branch and before/after HEAD:
RED: command + expected fail + observed fail or N/A with reason
GREEN: command + exit code + evidence
REFACTOR: command + exit code + evidence
UI smoke: real observed interaction / UI_UNVERIFIED
Known FAIL / OPEN:
Git commit / PR:
Agent contribution (if any): task ID, read-only finding, integration proof
Learning ID added to LEARNINGS.md:
One next action:
```

The journal records history; CURRENT.md is a short current snapshot, and actual git/test state outranks both.
