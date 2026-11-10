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

## 2026-11-05 — Startpaket / Zugriffssicherung
M: 25 Owner-Dokumente eingelesen, Paketcommit 09cb0f4 auf g0/first-cat-action. Git-Lesen Exit 0 ohne Refs; Push Exit 128 / HTTP 403. Kein G0-Code, RED/GREEN/REFACTOR NOT_RUN, UI_UNVERIFIED, NEEDS_HUMAN. LOCAL_ONLY; kein PR erstellt. Nächste Aktion: nach Schreibfreigabe denselben Branch pushen und Remote-SHA prüfen. Keine Subagenten gestartet.

## 2026-11-05 — G0 lokales Gameplay und erfolgreiche Veröffentlichung
O: Governance korrigiert: geprüftes lokales Backup erlaubt Entwicklung trotz 403.
M: Ausgangspunkt 90de7e2 und Bundle intakt; git fsck Exit 0. Implementierungscheckpoint ffd2d7f, finale Implementierung 118eaba auf g0/first-cat-action.
RED: `.venv/bin/python -m pytest -q` Exit 2 wegen fehlendem world-Modul (evidence/red.txt); UI analog Exit 2. Diese Initialläufe waren Collection-Fehler, keine durchgelaufenen Verhaltenstests.
GREEN: 26 Core-Tests, anschliessend 28 mit UI, Exit 0 (green-core.txt / green-ui.txt).
Echter Regression-RED: Editoränderung behielt alte Ausführungszeile, 1 failed / 2 passed, Exit 1 (red-editor.txt).
Fix/REFACTOR: gemeinsame Edit-Invalidierung und gecachter Schild-Font; Gesamtsuite 29 passed, Exit 0 (refactor.txt).
Clean install: frische venv + pip install -r requirements.txt Exit 0; dort 29 passed, Exit 0 (clean-install.txt / clean-tests.txt).
UI: echte SDL-Eventqueue, Textinput, Buttons, Rendering, Quit mit offscreen-Treiber PASS (smoke.txt); Vorher/Nachher/Fehler-Screenshots. Kein physischer Desktop oder Human-Test. App-Einstieg mit Quit nach 1 s separat Exit 0.
GitHub: einmaliger neuer Pushversuch nach G0 erfolgreich; git ls-remote bestätigt 118eaba. GitHub-API gh pr list / repo view Forbidden; kein PR erstellt, offene PRs UNKNOWN. Default ist aktuell der erste Branch g0/first-cat-action, kein Merge.
Modelle/Agenten: ein Integrator, keine Subagenten, kein behaupteter Modellwechsel.
Learning: L008 Governance, L009 Editor-Markierung.
OPEN: NEEDS_HUMAN, Windows ungetestet, unabhängiger Audit offen, NO_CI.
Nächste einzige Aufgabe: G0-Abnahme gemäss NEXT_TASK.

## 2026-11-05 — G0-Abschluss vor G1
M: Fast-forward 9315cdf -> e566cea bei sauberem Arbeitsverzeichnis. ChatGPT-Review vom Remote geprüft. AST-Grenzen, Weltimmutabilität, Stop/Reset und L009 stimmen mit Code überein; keine technische Blockade reproduziert. Statusmeldungen präzisiert, keine unnötige Architekturarbeit.
M: 29 Tests grün und SDL-Offscreen-Smoke Exit 0; evidence/g0-closure-tests.txt und g0-closure-smoke.txt. Nur Textänderung, RED hierfür N/A. G0_TECH_CLOSED; Human-/Windows-Test bleiben offen. Gemäss Owner/AGENTS ist der kleine collect-Schritt nun aktiv. Dieser Abschluss wird separat vor G1 committed.

## 2026-11-05 — G1-Minislice: Batterie -> Neon-Automat
M: G0 vor Implementierung separat abgeschlossen in 442cddc. G1-Code 24d644e auf demselben autorisierten Branch. Genau eine neue Aktion; kein Framework/Agent hinzugefügt.
RED: tests/test_collect.py 6 failed / 7 passed, Exit 1 (g1-red.txt); Negativfälle bereits durch G0-Abweisung grün. GREEN Gesamtsuite 42 passed. UI-RED 1 failed / 3 passed, Exit 1 wegen unverändertem Automatenbild; GREEN 43 passed. Refactor: Parserlokale von lines auf commands umbenannt, weiterhin 43 grün. Interne Parserausgabe jetzt (Zeile, Aktionsname), bestehender Sequenztest entsprechend angepasst; Endnutzerverhalten unverändert.
Zusätzliche Grenzcharakterisierung 64 akzeptiert / 65 abgewiesen war sofort grün; kein Produktfix dafür. Final: 45 passed, Exit 0, g1-final-tests.txt. Bestehende G0-Tests bleiben enthalten. Separat installierte venv ebenfalls 45 grün, pip check ohne gebrochene Anforderungen.
UI: echte SDL-Events und offscreen-Renderer: Bewegung, Codeänderung, Step, Stop, Reset, collect, Automatenbeleuchtung, Welt-/Syntaxfehler, Quit. Exit 0 (g1-smoke.txt). Screenshots visuell geprüft; kein Human-Pass. Windows-Start weiterhin nicht auf Windows ausgeführt.
Review-Befunde umgesetzt: nur schmale neue Aktion mit Negativtests; Statussemantik klarer; L009-Test erhalten; alte aktive Statusangaben ersetzt. Learning L010 ergänzt. GitHub PR-API Forbidden; kein PR behauptet. Push nach Checkpoint separat prüfen.
Nächste einzige Aufgabe: Befehlsfolge auf Batterie ein Feld weiter übertragen.

## 2026-11-05 — Lerntransfer statt reinem Run-Erfolg
O: erster Windows-G0-Test war Bedienerfolg, kein eigenes Schreiben. M: sauberer Fast-forward 7bad76c -> 5c67e51, Review G1 gelesen; Aufgabe fehlte im Code.
Implementierung 207ed14: Szenario-Position 2/3, gemeinsame Simulation/Renderer; Weiter bzw. direkter Freier Einstieg mit erhaltenem Code. Transfer-Neustart verhindert Gewinn durch wiederholtes Run/Step bei unverändertem Code, pausierter Step setzt korrekt fort. Drei freiwillige Hilfen, Code nur nach expliziter Beispielanforderung, keine Codeinjektion. Unterstützung bleibt über Reset sichtbar.
RED: sechs neue Tests fehlgeschlagen (fehlender Runner-Parameter/Transfer-Button), Exit 1, evidence/transfer-red.txt. GREEN: 51 passed, Exit 0. Zwei weitere Charakterisierungstests für Fortsetzen/Shortcuts sofort grün. Refactor: Hilfedarstellung aus draw extrahiert; komplette Suite 53 passed, Exit 0 (transfer-refactor.txt). Alle bisherigen G0/G1-Tests erhalten.
UI: SDL-Eventqueue mit Button-Klicks und Textinput, alte Lösung wiederholt erfolglos, geänderte Folge erfolgreich, Hilfestufen/Reset/Szenariowechsel/Fehler/Quit geprüft, Exit 0 (transfer-smoke.txt). Screenshots visuell kontrolliert. Nur offscreen; menschliches Verständnis und Spass offen.
Learnings L011 (Bedienung != Lernen) und L012 (Run-Akkumulation umgeht Transfer) direkt ergänzt. Keine neuen Abhängigkeiten oder Agenten. gh pr list weiterhin Forbidden, kein PR erstellt. Git-Push nach Checkpoint separat bestätigen.
Nächste einzelne Aufgabe: unabhängiger Abruf derselben Befehle, ohne neue Syntax und ohne bestehenden Code zu verlieren.

## 2026-11-06 — Wiederaufnahme ohne Datenverlust; Abruf abgeschlossen
M: Lokal e32eed0 plus uncommitteter Abruf-Schritt, 58 Tests frisch bestanden. Rettung vor Fetch: 0469ae8 und geprüftes Catworld-resume-2026-11-06.bundle. Remote 6358fd8 enthielt nur Handoff; konfliktfreie lokale Integration 4a03027. Kein PR-Merge oder Force-Push. Keine Doppelimplementierung.
M: Gestarteter Batch hatte 5 RED-Fehler, danach 58 GREEN. Vollständige erneute Suite 58 passed / Exit 0 (recall-final-tests.txt). SDL-Smoke nun auch Abruf, echte Eingabe, Rückkehr zu beiden Entwürfen, Stop/Reset/Hilfen, erfolgreiche Weltreaktion und Quit; Exit 0 (recall-smoke.txt). Screenshot visuell geprüft, Human-/Windows-Test der aktuellen Version offen.
M: Keine verfügbare Thread-Automationsfunktion; keine tägliche Automation und kein Scheduler eingerichtet. Ein Integrator, keine Subagenten. gh pr list weiter Forbidden; kein PR behauptet. Learning L013 zur lokal/remote unterschiedlichen Evidenz ergänzt.
Spielschritt: freiwilliges Schreiben aus leerem Editor nach Transfer-Erfolg; Eigenlösung und Abrufentwurf samt Hilfestatus innerhalb Sitzung erhalten. Noch keine dauerhafte Speicherung. Nächste einzelne Aufgabe: diese Texte über Neustarts erhalten, ohne Auto-Ausführung.

## 2026-11-06 — Zweiter begrenzter Batch: eigene Programme über Neustarts
M: Nach gesichertem/publiziertem Abrufabschluss a15b644 den konkreten Verlustfall Spielschliessen adressiert. Implementierung 95032c5. Ein kleines ui/drafts-Modul, keine Abhängigkeit oder generische Spielstandengine.
RED: fehlendes Speichermodul -> Collectionfehler Exit 2 (drafts-red.txt); fehlende UI-Integration -> 3 Fehler Exit 1 (drafts-ui-red.txt). Unicode-Repro 1 failed/16 passed; portabler Speicherort 1 failed/13 passed. GREEN final 76 passed, Exit 0 (drafts-final-tests.txt). Temporäre Testdateien, keine persönlichen Daten committed.
SDL: Einstieg/Transfer/Abruf, echte Texteingaben, Wechsel und Wiederherstellung beider Texte nach App-Neustart, weiterhin idle bis Run/Step, Fehler und Quit, Exit 0 (drafts-smoke.txt). App-Modul-Einstieg mit temp-Datenordner separat gestartet, gültige Datei erzeugt und per SDL-QUIT beendet, Exit 0. Screenshot visuell geprüft. Windows/Spielspass/Lernen weiterhin offen.
Speichern: max 65536 Bytes, 4096 Zeichen je Text, feste Typen/Version, Unicodeprüfung, atomarer Ersatz, vorherige Fassung als Backup. Korrupte Originale erhalten; Schreibfehler sichtbar und erneut per Strg+S versuchbar. Tests belegen keine Ausführung geladener Texte. Learning L014.
Sicherung: 95032c5 und geprüftes Catworld-drafts-checkpoint.bundle vor Abschlussdokumentation. Nächste einzelne Aufgabe: gezielte Tippfehlerdiagnose statt neuer Sprachfeatures. Keine Automation/Agenten/PR-Merges eingerichtet.

## 2026-11-06 — Licht für Nox: vorhandene Lernschritte als Spielabschnitt
M: Ausgangspunkt 31993c9 sauber, Bundle geprüft, 76 Tests grün, kein neuer Remote-Code. O: CEO-Push verlangt Weltziel, Charakter, sichtbare Konsequenzen und einen zusammenhängenden Abschnitt.
M: Umsetzung d5081fd. Animierte Bewegung rein in der Präsentation, Nox-Blinzeln/Schwanz und Erfolgsreaktion; Lampenkette reagiert neben dem Automaten, Reset stellt zurück. Gemeinsames Ziel/Übergänge und Abschluss nach Abruf, Dachweg-/Wiederholungs-Vorschau ehrlich als Zukunft. Tippfehler/Argumentfehler getrennt erklärt, kein Auto-Fix und keine erweiterten Ausführungsrechte.
RED 8 failed / Exit 1 (episode-red.txt), GREEN/Refactor 84 passed / Exit 0 (episode-refactor.txt). Refactor: Aktionsnamen zentral zusammengefasst; keine neue Abhängigkeit oder Speicherformatänderung. SDL-Gesamtdurchlauf inkl. Tippfehlerkorrektur, Transfer, Abruf, Speicherung/erneutem Start und Fehlerpfaden Exit 0 (episode-smoke.txt). 240 deterministisch angesteuerte SDL-Frames mit Ergebnisassertions (episode-demo.txt); Video ist automatisierte Demonstration, kein Human-Test.
Selbstkritik: vorherige Technik zeigte vor allem einzelne Übungen; technische Tests allein rechtfertigten kein Urteil „fühlt sich wie ein Spiel an“. Jetzt sind Zusammenhang und Darstellung technisch belegt, aber Freude/Neugier bleiben menschlich offen. Learning L015.
M: REST-PR-Abfrage Forbidden, keine PR erstellt/kein Bestand behauptet. d5081fd und Bundle vor Artefaktarbeit gesichert. Nächste einzelne Aufgabe: längerer Weg + eng begrenzte Wiederholung, keine gesamte Stadt.

## 2026-11-09 — P0 Workspace-Recovery und Dachtransfer-Abschluss
M: Bestehende Umgebung wieder erreichbar. Uncommittete Dachtransfer-Arbeit erhalten:
3 geänderte Quelldateien, neuer Test und RED/GREEN-Protokolle. Vor Tests Vollarchiv
mit 3078 per SHA-256 geprüften Dateien, Commit 7d4675c, Bundle verify erfolgreich.
Fetch: Remote db0ea246; kein Integrationskonflikt. Push 7d4675c und Remote-SHA bestätigt.
Erst danach 134 Tests erneut grün und bisheriger SDL-Smoke erfolgreich.
Fortsetzung: SDL-Smoke um neuen Dachtransfer erweitert (F8, falscher Plan zweimal,
optionale Hinweise, eigene Korrektur, Step/Stop/Reset, Neustart, vier Entwürfe), PASS.
Sichtprüfung Erfolgsbild bestanden. Menschliches Verständnis/Spielspaß nicht geprüft.
Dauerhafte Checkpoint-Regel in AGENTS/Loop; CURRENT/NEXT_TASK aktualisiert.

## 2026-11-09 — Zwei Laternen
Weltlogik RED 6, GREEN 140; checkpoint d7c3f9f gepusht und verifiziert.
UI/Persistenz RED 5, GREEN 146 einschließlich zusätzlichem Hinweis-Renderingtest.
SDL-Smoke: beide dunklen Ziele, erste Aktivierung, Stop/Reset, Step→Run, kompletter
Erfolg, Neustart und erhaltene frühere Entwürfe. Kein Menschentest.

## 2026-11-09 — Navigationsqualität nach zwei Laternen
Spielbarer Checkpoint e880e51 extern bestätigt. Drei Schwächen geprüft: redundante
Navigation/Titelüberdeckung, fehlendes Undo, Weltverdeckung durch Hinweise.
Erste korrigiert: sichtbare Controls gemeinsam für Renderer und Maus-Hit-Test;
Paarabschnitt hat einen Rückweg. Zwei RED-Tests, 148 GREEN und kompletter SDL-Smoke.
README und Sicherheits-/Speicherdokumentation aktualisiert. Keine Sprach-/Budgeterweiterung.

## 2026-11-09 — Undo/Redo
RED 12 failed/1 passed, danach 161 GREEN. Fünf getrennte begrenzte Historien,
Textersatz/Löschen/Einrückung/mehrzeilige Eingabe/Cursor/Auswahl/Autosave getestet.
SDL: echte Tastenereignisse, Undo/Redo, Editorwechsel, Neustart, Run/Stop/Reset PASS.

## 2026-11-09 — Hilfe ohne Weltüberdeckung
Undo-Checkpoint ddcb0e2 vor Layoutarbeit gepusht und Remote-SHA verifiziert;
Bundle geprüft. Hilfelayout RED 9 (drei Hilfestufen × drei Fenstergrößen), GREEN 170.
Welt proportional vollständig unter Hilfe; Code/Buttons bleiben fest. Resize-Klicks,
Fokus und Rückkehr zur vollen Welt geprüft. Voller SDL-Smoke PASS, Screenshot geprüft.
Nächste einzelne Priorität aus Codeanalyse: horizontales Nachführen langer Editorzeilen.

## 2026-11-09 — Editor-Nachführung
RED 5, GREEN 175; langer Text, Home/End, skalierte Mausklicks, Undo/Redo,
Editorwechsel und Step durch kommentierte Zeile geprüft. Voller SDL-Smoke PASS.
Masterplan nach Nutzen/Risiko ausgewertet, drei Richtungen in PRODUCT.md festgehalten.

## 2026-11-09 — Schleifen sichtbar verstehen
Nach extern gesichertem Editorbatch 5d5237d: vorhandene Befehlsliste liefert
Zeilenfortschritt. Drei RED-Tests, danach 178 GREEN und vollständiger SDL-Smoke.
Anzeige und Screenshot bei 2/5 geprüft, Stop/Reset und erfolglose Aktionen enthalten.
Nächste Produktpriorität: kleine Ressourcenentscheidung, keine weitere Syntax.

## 2026-11-10 — Rückwärtsbewegung
RED 5 failed/3 passed → 186 GREEN. Vorhandene Parserformen/Budgets erhalten,
neuer Aktionsname gegen Shadowing/Argumente geprüft; Grenzen links/rechts und
Stop/Reset getestet. SDL: kompletter Umweg mit zwei Schleifen, sichtbare Rückbewegung,
collect-Erfolg und vollständige Regression. Produktwahl in PRODUCT.md dokumentiert.

## 2026-11-10 — Freiwilliger Heimweg
Rückweg-Commit 86aed28 vor Folgearbeit extern bestätigt. Bestehende Laternenaufgabe
um freiwilligen Heimweg ergänzt, keine neue Speicherung oder Sondermission.
RED 1, GREEN 187, SDL vollständiger Plan mit 2 Lichtern + Rückweg + Neustart PASS;
Screenshot geprüft. Technische Wirkung belegt, menschliche Motivation offen.

## 2026-11-10 — Nach einem Fehler wieder im Plan navigieren
Nach extern gesichertem Heimweg fc994d1 zwei RED-Fälle reproduziert: vertikaler und
horizontaler Ausschnitt folgten trotz Navigation weiterhin der Fehlerzeile.
Anzeigeabsicht getrennt: Run/Step folgt Ausführung, Cursor/Klick folgt Editor.
189 GREEN und vollständiger SDL-Smoke inklusive Fokuswechsel; Fehlertext bleibt.

## 2026-11-10 — Lernnachweis vorbereiten
Kurzer Spieltestablauf ohne Musterlösung in README ergänzt. Keine erhobenen
menschlichen Ergebnisse; technische Nachweise bleiben 189 Tests plus SDL-Smoke.

## 2026-11-10 — Eigene Reihenfolge beim Laternenpaar
Reihenfolgensperre ohne modellierte Weltabhängigkeit entfernt. Nahe/ferne Laterne
zuerst sind gültig; beide Lichtzustände separat gerendert, beide Batterien sichtbar.
RED 2, GREEN 191, SDL alternative Route plus Heimkehr/Neustart PASS. Alte erfolgreiche
Programme unverändert gültig; nur bisher absichtlich abgewiesene Alternative zugelassen.
