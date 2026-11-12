# Lebendiger Bezirk — kleiner spielbarer Richtungsprototyp

Owner-Befund: „super langweilig,..nicht schön“. Masterprompt §§1–18 erneut gelesen.
Goal: Code verändert eine zusammenhängende Welt; Energie entscheidet über Wege,
Gebäudefunktionen und Katzenleben. Visuell räumliche Miniaturstadt statt Teststrecke.
Ausführung inline mit executing-plans, abschliessend unabhängiger Review.

## Auswahl
A: bisherigen Gang verschönern — billig, beseitigt Aufgabencharakter nicht.
B: offener kleiner Energiebezirk — Entscheidungen/Weltwirkung mit wenigen Regeln.
C: frei programmierbare Weltregeln — grosses Potenzial, jetzt schwer vermittelbar.
Gewählt B. Kein Beleg für Spielspass bis erneuter menschlicher Rückmeldung.

## Konkreter Entwurf
8x6 isometrisch dargestellte Felder, Kanal bei x4. Start(1,3), Energie1.
Werkstatt(3,3) öffnet Brücke(4,3). Garten(2,4) lässt zweite Brücke(4,1) wachsen.
Zuflucht(1,1) lockt Katzen an. Drei Gebäude kosten je1 Energie, toggle() am Gebäude
schaltet ein/aus und gibt Energie zurück. Akku(6,2) liefert einmal2 weitere Energie.
Alle drei versorgen ist ein freiwilliges gemeinsames Ziel. Kein Timer, keine
Zwangsreihenfolge; Werkstatt- oder Gartenroute erschliessen den Akku. Code wirkt
ab aktueller Position, Zustand bleibt zwischen Programmen. Reset setzt Bezirk
zurück und erhält Code; Undo des letzten Programmstarts erleichtert Experimente.
Bekannte parameterlose Aufrufe und Schleifen, bestehender begrenzter Compiler.
Keine zusätzliche Python-Syntax, kein exec/eval, höchstens64 Aktionen.

## Architektur / Kompatibilität
Separat startbar: python -m neonpaw.district. Altes Spiel bleibt unverändert
zugänglich. District dataclass + reine transition(), Runner bekommt injizierbare
Welttransition (Default unverändert). Keine zweite Compilerimplementierung.
Eigener kleiner Editor/Renderer; eigener Code-Speicher, keine alten Saves anfassen.
Keine neuen Bibliotheken, kein Backend, kein Telemetrieupload.

## Aufgaben / Review Focus
- [x] Weltregeln RED→GREEN: Energieerhaltung, beide Zugänge, Wasser/Bounds,
      einmaliger Akku, Rücknahme, alle Gebäude, ungültiger Code,64er-Grenze.
- [x] UI: räumlicher Bezirk, warm/kühle Lichtwirkung, sichtbare Bewohner,
      klare Gerätepositionen, dezenter Bewegungs-/Lichtwechsel, kompakter Editor.
- [x] Input: Run/Step/Stop/Reset/letzter Versuch zurück, Text/Undo, Edit stoppt,
      Code sichern; keine Simulation durch Rendern, bounded frame work.
- [x] SDL-End-to-End: reale Events, Energieumverteilung, beide Routen,
      Akku/alle Gebäude, Reset/Undo/Neustart, Screenshots, volle alte Suite.
- [x] Review: keine Softlocks durch Rücknahme; Bewegung und Anzeige deckungsgleich;
      Hinweis/Text passen; Altspiel unverändert; lokale Daten geschützt.
- [x] Sicherung: Dokumentation, Commit, Bundle, Remote-SHA und Inhaltsarchiv.

Ledger: Basis 0b4241c. Neuer Prototyp ersetzt weder aktuellen Build noch Testbefund.

Abschlussledger:327 Tests, beide SDL-Smokes PASS. Review:23 District+88 Runner Tests,
442 erreichbare Zustände ohne Softlock. Speicherbefunde durch3 RED→GREEN Tests
behoben (beschädigte/zu grosse Originaldatei bewahren, Exit-Save blockiert bei Fehler).
Tracebefund als lernrelevant eingestuft und mit1 RED→GREEN Test behoben; automatische
Ausführungszeilenansicht endet bei manueller Navigation. Keine Review-Befunde offen.
Ungetestet: Windows physisch, menschlicher Spass/Lernen. Dokumentation nennt Grenzen.
