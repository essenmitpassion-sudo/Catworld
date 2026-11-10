# NEONPAW – product vision v3
**Tagline:** Code your instincts. Build your city.

Cozy, intelligent 2D cyberpunk pixel-art game starring a black alley cat. Player starts with `move_right()` and over time writes reusable Python programs controlling routes, sensors, devices and eventually resilient networks. Identity: inventive underground neon, inviting rather than grimdark, clear visual cause/effect.

Two access paths: Guided (novice from zero, optional hints, short challenges) and Free (expert skip, optimization, alternate solutions). Same world rules, same script interpreter, no special fake physics or forced tutorial. All valid solutions earn progression; assist and capability profiles distinguished for optimization comparisons.

**Short loop:** see a concrete problem → write a small Python program → run/step/replay → watch the cat and city react → understand error or improvement → unlock a meaningful capability. **Long loop:** save reusable code, compose systems, test under changing constraints, build a reliable network.

**100h vision:** combinatorial depth from navigation, delivery, energy, sensors, coordination, verification/optimization. See LONG_TERM_DESIGN.md. Not a commitment to build a hundred hours of content before testing the first five minutes.

**Hard MVP limit:** one alley, a black cat, one or a few Python commands, visible execution, safe interpreter and recovery. No fleets, factory, network, multiplayer, accounts, cloud, procedural city, generative AI or elaborate story in G0.

**Truth:** technical PASS ≠ fun PASS. Novice onboarding and long-term enjoyment demand actual human testing and remain hypotheses until observed.

## Pareto-Auswertung des Owner-Masterplans — 2026-11-09
G: Bestehendes Spiel bietet selbst geschriebene Pläne, Variation, Abruf, Schleifen
und kombinierte Aktionen. Die Aufgaben bleiben bisher linear; daraus folgt noch
kein Nachweis für langfristige Motivation. M: lange Editorzeilen versteckten den
Cursor; reproduziert und korrigiert. Bedienbarkeit ist Voraussetzung fürs Experiment.
Drei Richtungen (V, Produktannahmen, keine getesteten Spielerpräferenzen):
- Evolution: kleine zusammenhängende Stromnetze mit mehreren gültigen Plänen und
  sichtbarer Ausführung. Hohe Wiederverwendung, geringe technische Kosten; Risiko linearer Rätsel.
- Innovation: begrenzte Energie zwischen verschiedenen Weltreaktionen verteilen.
  Echte Prioritäten statt größerer Zahlen; benötigt neue Weltregeln und Balance.
- Radikal: Spieler verändern lokale Weltregeln durch Programme und bauen eigene
  Herausforderungen. Große kreative Freiheit, derzeit hoher Sicherheits-/UX-Aufwand.
Entscheidung: evolutionären Kern zuerst verständlicher machen, anschließend eine
kleine echte Ressourcenentscheidung prototypisieren. Keine Stadt-/Frameworkplanung.
Nächster messbarer Nutzen: Wiederholungen einer Codezeile sichtbar machen, damit
Step/Run den Zusammenhang zwischen kurzem Programm und vielen Aktionen erklären.
Menschlichen Lerntransfer und freiwilliges Wiederholen im Spieltest prüfen;
automatisierte Tests können nur Darstellung und Wirkung belegen.

## Pareto-Entscheidung — 2026-11-10
Die geplante Energieentscheidung ist zurückgestellt: rein unterschiedlich leuchtende
Objekte wären kein belastbarer neuer Entscheidungsraum. Zuerst vorhandene Karten
weniger starr machen: move_left erlaubt Rückwege und Umwegkorrekturen mit denselben
Aufruf-/Schleifenkonzepten. Keine zusätzliche Entwurfs-/Levelverwaltung, keine neue
Python-Grammatik. Vorhandene Lösungen bleiben gültig. Mehr Spielfreiheit ist technisch
nachweisbar; subjektiver Spielwert bleibt eine zu prüfende Hypothese.
