# CATWORLD — Einrichtung und unabhängiger ChatGPT-Audit

## Verbindung
GitHub-App ist auf **selected repositories** eingestellt. Wenn Catworld neu erstellt wurde, muss es in der Installation explizit hinzugefügt werden. URL (bereits bekannte Installation): `https://github.com/settings/installations/161336823`. Wähle Catworld für Repositoryzugriff. Falls Schreibrechte weiterhin fehlen, prüfen, ob Contents und Issues write erteilt sind; `get_repo.permissions.push=true` bedeutet nicht, dass das Integrationstoken Schreibrechte hat.

GitHub ist die Austauschfläche, **nicht** die direkte Echtzeitsteuerung von Codex. Codex muss das Repo in seinem Environment öffnen und den Auftrag aktiv erhalten. ChatGPT kann GitHub unabhängig lesen, und nur bei bestätigtem Schreibrecht dort Issues/Dateien/Reviews aktualisieren.

## Unabhängiger Audit (ChatGPT)
1. Repo, HEAD, Branch, offene PRs/Issues, `CURRENT.md`, `NEXT_TASK.md`, letzte Commits und PR-Diff neu abrufen.
2. Versionierte Behauptungen gegen tatsächliche Dateien, Testlogs und Artefakte abgleichen. Kein `M` ohne reproduzierbaren Beleg.
3. Sicherheit, einfache Bedienung, Lernprogression, Spielbarkeit und Pareto-Scope unabhängig prüfen.
4. Maximal drei echte P0/P1-Probleme als konkrete, prüfbare Aufgaben; nicht gleichzeitig mehrere Roadmaps erzeugen.
5. Nach Fix Merge nur bei erfüllten Gates und klarer Owner-Berechtigung. Keine blind automatisierten Merges.
6. Neues Learning: Symptom, Ursache, Beleg, Gegenmassnahme, Regressionstest und betroffene Dateien.

## Wiederaufnahme bei Limit
Branch/Commit/dirty Dateien, letzte Testbefehle und Resultate, uncommitted Patch, offene P0, eine nächste konkrete Aufgabe in `CURRENT.md` festhalten. Wiederaufnahme liest diese Angaben und prüft sie zuerst gegen HEAD. Keine Statuswahrheit allein aus Chatverlauf.

## Aktueller belegter Status (2026-11-05)
- Catworld-Repository existiert, öffentlich, `main`, `size=0` laut GitHub-Repo-Metadaten.
- GitHub-Integration liest Metadaten, erster `create_file`-Versuch erhielt 403 `Resource not accessible by integration`.
- GitHub-App installation `161336823` nutzt `selected` repositories. Einmaliges Hinzufügen von Catworld ist erforderlich; danach Rechte neu prüfen.
- Kein G0-Code, keine Tests und kein Codex-Lauf dadurch bestätigt.
