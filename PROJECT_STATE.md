# PROJECT UNCHARTED V5 · SAUM
16.11.2026. Einzige aktive Direktive docs/directives/MASTER_V5.md (vollständiger Upload unverändert). V1–V4/Catworld/KIPPWERK historisch ersetzt. DESIGN.md ist Konzeptentscheidung, kein weiterer Aufgabenplan.

## VISION
SAUM – Die wandernden Inseln. Lotse dreier bewohnter Meeresriesen. Körper transportieren Familien und geben einander Schutz; Ruhe, Formation und Rettungsumwege verändern dieselbe Situation. Nautischer Kupferstich lebender Garteninseln auf hellem Papier.

## IMPLEMENTATION
IN_PROGRESS: 14-Tiden-Lauf, neue Regeln und organische Welt. Browser/Standalone, vorhandenes esbuild/Node/Playwright. Kein Laufzeitnetzwerk und keine Metaökonomie.

## VERIFICATION
V4-Baseline hier ausgeführt: npm ci und 9/9 Tests bestanden. Kein SAUM-Nachweis daraus. Start: npm run build && npm run dev (3000). npm test; npm run smoke; npm run balance. Menschliche Playtests/Faszination/Langzeitmotivation offen.

## GIT
/workspace/Catworld, development/uncharted. Ausgang/Remote 09ef38f26b5b457651f805f8bded324c2f126472, zusätzlicher lokaler archive/kippwerk-v4-2026-11-16 auf diesem SHA. Initialer Checkout leer/unborn work, keine lokale Arbeit; Remote sicher geladen. GitHub ls-remote und gefetchte Archivbäume geprüft: archive/catworld-final-v4-2026-11-16 und Tag archive/catworld-v4-baseline-2026-11-16 = e7c16bf83b803c973c5d0b053b06c657d0b32c2a; archive/catworld-original-2026-11-16 = 7175190acf5dec4c84bf00d1a1d22f36acb4c1d2. Gemeldetes /workspace/work/catworld-pre-v4.bundle nicht vorhanden, kein neuer Prüfnachweis behauptet. Keine unnötige zweite Catworld-Archivierung. Keine fremden Geräte geprüft. Hosting unverändert.

## NEXT · einzige aktive Arbeitsfolge
- [ ] T1 engine.js: Atem/Schutz/Fahrtweg/Rettung/Lieferung/Endzustand/Seed-Fixtures zuerst rot, Regeln implementieren, Suite grün.
- [ ] T2 scene.js organische Welt; main.js Maus/Touch/Tastatur, Vorschau, echte Bewegung, Regeln, Enden/Neustart; Build und vollständige Browserpartie.
- [ ] T3 adversariale Stichprobe mehrerer Seekarten, wichtigste belegte Schwäche korrigieren; Desktop/320/390/768, Screenshots ansehen, Anforderungen aktualisieren, Diff/Tests/Commit/Push/SHA-Rücklesen.
Review-Fokus: Atemmangel ohne Blockade; kreuzende Fahrwege ohne Tunneln; Familien nie duplizieren; Vorschau ohne Mutation; Neustart/doppelte Eingabe während Animation sicher.
Methodik writing-plans/executing-plans inline und gezielte TDD. Nutzer autorisiert Eigenentscheidung und verlangt keine unnötige Agentenorganisation: Autorenreview statt Delegation und keine zusätzlichen Planfreigaben. Hier zugleich Fortschrittsledger, keine zweite Roadmap.
