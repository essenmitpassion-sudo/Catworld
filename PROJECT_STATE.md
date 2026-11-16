# PROJECT UNCHARTED – Fortsetzungsstand

Stand: 16.11.2026, Analyse des neuen Masterprompts. Aktuell maßgeblich: docs/directives/MASTER_V3.md, REQUIREMENTS.md und Nutzerkorrektur **VERSATZ ersetzen, alte Versuche nur als Erfahrung nutzen**. Nicht CURRENT.md/NEXT_TASK.md als aktuellen Auftrag missverstehen: Sie beschreiben den gesicherten Vorgänger.

## VISION

Neues kleines systemisches Strategiespiel; wenige Regeln, echte Wechselwirkungen und verständliche Entscheidungen. Neuer Name und Kern noch nicht gewählt. Keine Weiterentwicklung von VERSATZ/SOG/SIGNALBRUCH. Nutzer bat zuletzt ausdrücklich um schrittweise Analyse des neuen Prompts; diese ist jetzt der konkrete Arbeitsschritt.

## IMPLEMENTATION

Noch kein neues Produkt implementiert. src/, tests/ und bisherige scripts/ enthalten weiterhin VERSATZ. Dessen Eigenschaften gelten nicht als erfüllte Anforderungen an das neue Spiel.

Neue Dokumente: REQUIREMENTS.md (R1–R10, Einzelkriterien), docs/MASTER_V3_ANALYSIS.md (14 Abschnitte, Prioritäten und Konflikte), docs/directives/MASTER_V3.md (Originalupload). AGENTS.md wird auf aktuelle Richtung gebracht. Bestehende Node/JS/esbuild/Chromium-Werkzeuge sind verfügbar; Entscheidung über Nutzung folgt dem Konzept.

## VERIFICATION

Ausgeführt 16.11.: `npm ci --cache /workspace/Catworld/work/npm-cache`; `npm test` → 44/44; `npm run build` → 53.142 Bytes Standalone. Diese Nachweise betreffen ausschließlich die unveränderte VERSATZ-Ausgangsbasis.

Neue Spielprüfung, praktische neue UI-Partie, Timing, strategische Vielfalt, menschliche Verständlichkeit und Spielspaß: offen. Kein P0/P1/P2/P3-Gate des neuen Spiels bestanden.

Initialer Soll/Ist-Abgleich: V3 und Nutzerkorrektur verlangen Ersatz; alte AGENTS/CURRENT/NEXT fordern Fortsetzung. AGENTS wird korrigiert, historische Dateien bleiben bis zum geordneten Produktersatz als Vorgängernachweis gekennzeichnet. Matrix-/Analyseprüfung erfolgt vor dem Dokumentationscommit.

## GIT

Repository https://github.com/essenmitpassion-sudo/Catworld.git. Frischer Clone; Ausgangsbranch g0/first-cat-action und HEAD 2d4874e1810a562ed50587e46eb4faa97d518059; Arbeitsbaum vor Änderungen sauber.

Entwicklungsbranch: development/v3-continuity. Letzter vor Analyse remote bestätigter Produktstand: 2d4874e1810a562ed50587e46eb4faa97d518059. Dokumentationscommit und Push: noch ausstehend; exakten aktuellen Stand mit `git log -1` und `git ls-remote --heads origin development/v3-continuity` prüfen. Ein Commit kann seinen eigenen SHA nicht im selben Commit enthalten.

Separat gepusht und per `git ls-remote --heads origin` SHA-bestätigt:

- archive/catworld-original-2026-11-16 → 7175190acf5dec4c84bf00d1a1d22f36acb4c1d2.
- archive/versatz-before-v3-2026-11-16 → 2d4874e1810a562ed50587e46eb4faa97d518059.

Andere Prototyp-Branches erhalten. Keine nicht committete lokale Vorarbeit vorgefunden; fremde Geräte nicht geprüft. Keine Veröffentlichung oder Umbenennung vorgenommen.

## NEXT

1. Schrittweise Analyse fertig prüfen, Dokumente committen, autorisierten Push per SHA bestätigen.
2. Anschließend drei neue Kernideen gemäß R2 vergleichen: Weiterentwicklung, ungewöhnliche Systemkombination, radikal eigenes Prinzip. Selbstständig eine wählen; keine Konzeptfreigabe erforderlich.
3. Kleinsten vollständigen Micro-Run bauen: begrenzte Welt, 1–3 Aktionen, Druck, sichtbare Folgen, Sieg/Niederlage/Neustart. Alte Produktinhalte erst nach bereits bestätigter Sicherung ersetzen.
4. Tatsächlich spielen, wichtigste belegte Schwäche verbessern, testen und sichern. Menschliche Erlebnisbewertung separat offen halten.

Kein technischer projektweiter Blocker. Keine Hintergrundarbeit eingerichtet. Nicht wieder VERSATZ-Remis analysieren: Das war ein durch die Nutzerkorrektur verworfener Fortsetzungsvorschlag, keine aktuelle Aufgabe.

## R1–R10 Kurzmatrix

R1 neuer Kern OPEN; R2 neue Konzeptentscheidung OPEN; R3 Micro-Run OPEN; R4 strategische Wirkung OPEN; R5 Darstellung OPEN; R6 neue Tests/Playtests OPEN; R7 autonome Ausführung IN_PROGRESS; R8 alte Identität/Branch VERIFIED, neue Sicherung OPEN; R9 Remote-Archive VERIFIED, Ersatz IN_PROGRESS; R10 Dokumentation IMPLEMENTED, wiederholte Fortsetzung/Meilensteinabgleiche IN_PROGRESS. Einzelstatus ausschließlich in REQUIREMENTS.md.
