# Implementierungsplan · KIPPWERK (V4)
Verbindliche Quelle: docs/DESIGN.md und docs/directives/MASTER_V4.md. Aktuelle nächste Arbeit nur PROJECT_STATE.md. Dieser Plan beschreibt den einmaligen Bau, keine zweite Roadmap. Ausführung durch einen Integrator gemäß autonomem Nutzerauftrag.

Architektur: src/engine.js reine Regeln, src/main.js DOM/SVG-Eingaben, src/style.css, src/index.html. scripts/build.mjs erzeugt offline HTML mit esbuild; scripts/serve.mjs liefert den Build. tests/engine.test.js handgerechnete Regeln; scripts/smoke.mjs echte Chromium-Partien; scripts/balance.mjs reproduzierbare Policies. Keine Runtime-Pakete.

Review-Fokus: doppelte/schnelle Eingaben und Animationsende; Grenzausgänge und simultaner Abschluss; Preview ohne Zustandsmutation; ungültiger Seed/Speicherverweigerung; 320px Touch und Tastaturfokus.

1. [ ] Regelkern. API createGame(seed), edit(state,index,kind), advance(state), forecast(state), resolve(board,feeds). Erst Tests für 4→2+2, Kette, Rand/Feuer, 2 Eingriffe, Determinismus, Sieg/Verlust und Nichtmutation; npm test muss rot sein. Dann Implementierung und grüne Suite.
2. [ ] Vollständige Partie. Echte UI mit 25 Feldbuttons, zwei Aktionen, Rücknahme, Preview, Flut, Ergebnis/Restart. Offlinebuild. Browser-Smoketest vorher rot wegen fehlendem Spiel; dann Klickpartie bis beide Enden, Neustart, Console-Errors, Preview-Gleichheit.
3. [ ] P1 Verbesserung. Policies auf Seeds vergleichen; größte konkrete Schwäche eingrenzen. Änderung erst nach Test/Experiment; Vorher/Nachher dokumentieren. Keine Erweiterung um Inhalte.
4. [ ] P2/P3 Lesbarkeit und Robustheit. Screenshots tatsächlich ansehen; Desktop/Mobil/Touch/Tastatur/reduced motion, Offline-Artefakt, Eingabegrenzen. Spiel-/Status-/Matrixabgleich, Diffcheck, funktionierende Commits und non-force Push mit SHA-Readback.
