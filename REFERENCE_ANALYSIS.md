# The Farmer Was Replaced – mechanische Analyse (kein Source-Clone)

## Grundlagen und Quellen (Stand 2026-11-05)
- Wiki, First Program: https://thefarmerwasreplaced.wiki.gg/wiki/First_Program – schrittweise freigeschaltete Sprachfunktionen, Ausführungsvisualisierung, einfacher Editor, Autocomplete.
- Wiki, Available Functions: https://thefarmerwasreplaced.wiki.gg/wiki/Available_functions – Bewegung, Sensoren, Weltmanipulation, Timing, mehrere Drohnen.
- Wiki, Differences from Python: https://thefarmerwasreplaced.wiki.gg/wiki/Differences_from_python – eigene Python-ähnliche Sprache; nicht identisch mit Python.
- Wiki, External editor: https://thefarmerwasreplaced.wiki.gg/wiki/External_editor – Code-Dateien/.py und externes Bearbeiten, aber kein echter Python-Interpreter.

Diese öffentlich dokumentierten Konzepte dienen als Vergleichsobjekte. Keine extrahierten Assets, proprietären Skripte, Quelltext-Übernahmen, kopierten Level oder identischen Progressionsbäume.

## Nutzbare Designprinzipien
1. **Sichtbare Kausalität:** Pro ausgeführter Anweisung Animation + Zeilenmarkierung + Zustand/Feedback. Spieler sieht *warum* etwas passiert.
2. **Progressive Offenlegung:** Genau ein neues Sprachkonzept je früher Lernschritt. Keine 15 Buttons im Startbildschirm.
3. **Wiederholung als Motivation:** Erst eine kurze Route manuell lösen; dann ähnliche Route mit Wiederholungen, sodass Schleifen offensichtlich nützlich sind.
4. **Feedback statt Vorlesung:** Echte Python-Fehler in einfachem Deutsch erläutern, ohne die Lösung ungefragt zu liefern.
5. **Simulation statt Zeitdruck:** Spiel läuft in diskreten Schritten; Code kann pausiert, beschleunigt oder abgebrochen werden.
6. **Spätere Tiefe:** Sensoren, echte Zustände, Wegplanung, begrenzte Ressourcen, mehrere Helfer nur nach gesichertem Lernfortschritt.

## Was wir bewusst anders machen
- Eigene visuelle Identität: Katze in Neon-Gassen, Mini-Aufträge für eine unabhängige Katzengemeinschaft, statt Drohne auf Acker.
- **Echtes Python** als syntaktische und semantische Referenz für die ausdrücklich unterstützte Teilmenge; echtes Python-Einrückungsmodell, Boolean, range und später `def`.
- Keine versteckte Belohnung durch passiven Grind. Neue Optionen nach nachgewiesenem Anwenden des Konzepts.
- Transferaufgaben mit veränderten Karten und nicht bloß kopiertem Code.
- Optionaler Vergleich zweier Lösungen; funktionierende Lösung zählt, Effizienz ist Zusatzherausforderung.

## Konkretes Beispiel für die didaktische Differenzierung
Episode A: Ein Schritt mit `move_right()` und direkte visuelle Reaktion.
Episode B: Derselbe Befehl mehrfach plus `collect()` in einer einfachen Route.
Episode C: Längere Route; Spieler kann mit `for _ in range(3): move_right()` vereinfachen.
Episode D: Ein Sensor liest den nächsten Block; `if` erzeugt eine echte Entscheidung.

Vor jedem weiteren Ausbau prüfen: Könnte ein Anfänger die Änderung ohne lange Erklärung begreifen? Macht sie sichtbaren Spielspaß? Wurde das Konzept in einer neuen Situation angewandt?
