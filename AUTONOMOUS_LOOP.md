# CATWORLD — autonomer Entwicklungszyklus (nicht blockierend)

**Ziel:** Codex entwickelt eigenständig. ChatGPT prüft unabhängig über GitHub. Owner spielt gelegentlich und entscheidet über Richtungswechsel. Keine manuelle Prompt-Übergabe nach jedem kleinen Commit.

## Ein Arbeitszyklus
1. **Orientieren (kurz):** `git status`, aktuellen Branch/HEAD, `NEXT_TASK.md`, `CURRENT.md` und relevante Reviews lesen. Git-Stand vor Dokumentenstand.
2. **Ein nützliches Inkrement:** kleinster spürbarer Spiel-/Lernfortschritt. Eigene bessere Lösungen zulässig; keine Scope-Explosion.
3. **Belegen:** ein gezielter RED-Verhaltenstest, GREEN, Refactor und SDL/UI-Smoke bei sichtbaren Änderungen. Kein bürokratischer RED für reine Texte.
4. **Sichern:** Commit und Push (falls möglich), kurzer `CURRENT.md`-Stand mit Belegen und einer nächsten Aktion. Bei Pushfehler lokal sichern; weiterarbeiten, solange sicher.
5. **Lernen:** nur wiederholbare Fehlerursachen/Designentscheidungen in `LEARNINGS.md` festhalten. Keine Test-Erfolg-Fiktion und keine Doppelprotokolle.
6. **Weiter:** nächstes kleines autorisiertes Inkrement selbst wählen, nicht auf Mikro-OK warten. Menschliches Lernen/Spass bis zum echten Test als offen kennzeichnen.

## Automatisierung — klein anfangen
- **Codex Thread-/Projekt-Automation (einzurichten im Codex-Produkt, nicht durch diese Datei):** bestehende Aufgabe und Repo auf einem sinnvollen Zeitplan fortsetzen. Nur ein Writer, niemals mehrere parallele Fortsetzungsläufe. Befunde aus GitHub beim Start lesen.
- **GitHub CI (später nach Verifikation):** pytest und vorhandener SDL-Offscreen-Smoke bei Push/PR; kein KI-Lauf für triviale CI und keine Auto-Merges.
- **ChatGPT Review:** bei Owner-Anfrage oder separat aktivierter zeitgesteuerter Prüfung. Review als Issue oder unabhängiges Dokument; schreibt nicht während Codex gleichzeitig dieselbe Datei bearbeitet.
- **Nutzungslimit:** pro Durchlauf ein klarer begrenzter Batch; bei instabilen Tests oder sinkendem Budget sichern und Ursache festhalten. Keine unendliche Feature-Schleife.
- **Cloud-Umgebung:** veröffentlichte wiederverwendbare Codex-Cloud-Umgebung bevorzugen; Desktop Commander nur für lokale Windows-Spieltests.

## Qualitätsstufen
- TECH_PASS: automatisierte Tests und technischer UI-Smoke bestanden.
- PLAYER_NEEDS_TEST: ein Mensch muss noch Verständlichkeit/Spass prüfen.
- PLAYER_FEEDBACK: echtes Feedback, konkrete Beobachtung, nächster kleiner Fix.
- STOP: drohender Datenverlust, destruktive unautorisierte Aktion, tatsächliche Codeausführungsgefahr.
- DEGRADED: GitHub/PR/CI zeitweise nicht verfügbar; lokal sicher weiterarbeiten.

## Produktpriorität 2026-11-05
G0 abgeschlossen. Batterie und Transferaufgabe technisch implementiert; 53 Tests laut Codex-Log. Nächste kleine Lernaufgabe: bekannte Befehlsfolge aus einem *temporär leeren Editor* selbst aufbauen, bestehende Eigenlösung erhalten. Kein neues Framework, kein agent swarm. Siehe `NEXT_TASK.md` und aktuellen HEAD.

## Nicht behaupten
GitHub-Commit ≠ laufende Codex-Automation. Dokumentiertes pytest-PASS ≠ unabhängiger Test oder menschlicher Spielspass. ChatGPT Review in GitHub ≠ sofortiger Codex-Empfang. Eine Automation gilt erst als aktiv, wenn im Codex-Produkt ein bestätigter Task/Zeitplan vorliegt.
