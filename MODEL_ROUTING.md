# CATWORLD — Verbindliche Codex-Modellwahl (Stand: 2026-11-05)

Modell und Reasoning-Effort **vor jedem Codex-Lauf** passend auswählen. Nicht automatisch das teuerste Modell. Wenn ein Modell im Konto nicht verfügbar ist, das nächstgeeignete verfügbare Modell einsetzen und protokollieren; keine angeblichen Live-Modellwechsel behaupten.

| Prompt/Arbeitspaket | Wahl | Eskalation |
| --- | --- | --- |
| **START / G0**: Repo-Check, Architektur, erster lauffähiger Slice | **GPT-6 Astra / Medium** | High NUR bei nachgewiesenem schwerem Blocker |
| Sicherheitsarchitektur, Spieler-Code-Ausführung, Sandbox/AST, Risk Review | **GPT-6 Astra / High** | Unabhängige Prüfung, kein blindes `exec` |
| Neues vertikales Gameplay-Inkrement, Systemintegration, API-Design | **GPT-6 Astra / Medium** | High bei reproduziertem Architekturkonflikt |
| Tests zu bestehender Funktion, UI-Details, Dokumentation, kleine Fixes | **GPT-5.6 Sol / Medium** | Astra Medium wenn zwei sinnvolle Versuche scheitern |
| Reine Formatierung, Logauswertung, Statuspflege | **GPT-5.6 Terra oder Luna / Low–Medium** | Sol Medium bei unklarer Entscheidung |
| Unabhängige QA, Pädagogik, Refactoring-Review | **GPT-5.6 Sol / Medium**, read-only | Astra High für begründeten Sicherheitsbefund |
| Eskalation bei mehrfacher Fehlhypothese | **GPT-6 Astra / High** | Erst RED-Repro + Logs + Fehlerhypothese vorlegen |

Eine höhere Reasoning-Stufe ist **kein Ersatz** für Zugriffsrechte, echten Code, ausführbare Tests und klare Aufgaben. High nicht pauschal aktivieren. Nutzungseinheiten und tatsächliche Verfügbarkeit im Codex-UI prüfen.

## Pflicht-Kopf jeder neuen Codex-Aufgabe

```
MODELL: GPT-6 Astra
REASONING: Medium
ZIEL: <ein überprüfbares Produktinkrement>
SCOPE: <genau die freigegebenen Dateien/Module und Gate>
QUELLE: AGENTS.md + NEXT_TASK.md + HEAD
ABNAHME: <RED/GREEN/REFACTOR + UI-Smoke + Checkpoint>
```

Für Sicherheitsaufgaben `REASONING: High` setzen, für Routinearbeiten `MODELL: GPT-5.6 Sol; REASONING: Medium`.

## Budget-/Kontextgrenze
Bei drohender Limitierung zuerst kleinsten sicheren Commit/PR sichern, `CURRENT.md`, `PROGRESS_LOG.md`, `LEARNINGS.md`, `NEXT_TASK.md` aktualisieren. Keine neuen Agenten starten und keinen neuen grossen Umbau beginnen. Falls kein Commit möglich: vollständigen Patch/Dateistatus und Blocker liefern. Eine PR ist kein Merge; ein Issue ist kein laufender Agent.
