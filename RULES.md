# SOG / Regeln 0.1

**Setze einen Stein. Vier in einer Reihe gewinnen.**

5×5 Felder. Blau spielt gegen Rot. Beide beginnen mit je einem Stein auf gegenüberliegenden Feldern. Der sichtbare Start hängt vom Seed ab. Danach wird abwechselnd ein eigener Stein auf ein beliebiges freies Feld gesetzt.

Der neue Stein zieht in jeder der vier geraden Richtungen den nächsten vorhandenen Stein genau **ein Feld näher**, unabhängig von seiner Farbe. Direkt benachbarte Steine bleiben stehen. Sie verdecken weiter entfernte Steine. Diagonal wird nichts gezogen. Alle Anziehungen wirken gleichzeitig, Farben bleiben erhalten, nichts wird geschlagen.

Danach gewinnt die Farbe, die mindestens vier unmittelbar aufeinanderfolgende Steine waagrecht, senkrecht oder diagonal bildet. Dein Zug kann also Rot zum Sieg verhelfen. Bilden beide Farben gleichzeitig eine Viererreihe, gibt es ein Remis. Ebenso bei vollem Brett ohne Reihe. Jeder Zug füllt ein zusätzliches Feld: höchstens23 Züge, keine Wartetakte oder Schleifen.

Zeige am Computer auf ein freies Feld oder wähle es mit Pfeiltasten: Die Vorschau zeigt Zielorte und direkte Sieg-/Verlustfolgen. Enter setzt. Am Handy setzt ein Tippen; während Gedrückthalten ist die Vorschau sichtbar. Die reale Bewegung zeigt unmittelbar, was sich geändert hat. Reduzierte Bewegung wird respektiert.

Die KI verwendet denselben öffentlichen Zustand und dieselben legalen Übergänge. Ihre iterative Suche ist begrenzt und behauptet keine optimale Strategie. Der Seed verändert nur die sichtbare Eröffnung und deterministische Gleichstandsentscheidungen, keine Zufallswürfel während der Partie.

„Zurück“ nimmt den letzten menschlichen Zug und die eventuelle KI-Antwort zurück und bricht laufende Anzeige-/KI-Timer ab. „Neue Partie“ wechselt Seed und Startrecht. Der Verlauf ist schreibgeschützt. Gespeicherte Partien werden aus Seed, Startseite und legalen Zügen vollständig neu berechnet; beschädigte Daten beginnen eine neue Partie. Alte SIGNALBRUCH-Speicherdaten werden nicht überschrieben.
