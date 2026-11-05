TITLE = 'ERSTER PFOTENSCHRITT'
OBJECTIVE = 'Erreiche das leuchtende Feld rechts von dir.'
START_CODE = 'move_right()'
# A single scenario parameter feeds simulation, reset, battery and target rendering.
BATTERY_POSITIONS = (2, 3)
HINTS = (
    (
        ('Beobachte das Leuchtfeld und die Batterie über der Katze.',),
        ('Gehe zuerst zur Batterie. Nimm sie danach auf.',),
        ('move_right()', 'collect()'),
    ),
    (
        ('Vergleiche den Abstand zwischen Katze und Leuchtfeld.',),
        ('Wiederhole den bekannten Bewegungsschritt vor dem Aufnehmen.',),
        ('move_right()', 'move_right()', 'collect()'),
    ),
)
