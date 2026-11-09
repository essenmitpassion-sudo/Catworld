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

ROOF_BATTERY_X = 6
ROOF_WALK_HINTS = (
    ('Die Dachlaterne wartet am markierten Feld. Zähle die Abstände.',),
    ('Schreibe mehrere bekannte Bewegungsschritte untereinander.',),
    ('move_right()', 'move_right()', 'move_right()', 'move_right()', 'move_right()', 'collect()'),
)
ROOF_LOOP_HINTS = (
    ('Welche Aktion hast du gerade mehrfach wiederholt?',),
    ('for _ in range(2):', '    move_right()', 'Beispiel für zwei Schritte. Passe die Anzahl an deinen Weg an.'),
    ('for _ in range(5):', '    move_right()', 'collect()'),
)

ROOF_TRANSFER_X = 8
ROOF_TRANSFER_HINTS = (
    ('Vergleiche Startfeld und neues Leuchtfeld. Was hat sich verändert?',),
    ('Die Aktion bleibt gleich. Welche Zahl bestimmt ihre Wiederholung?',),
    ('for _ in range(7):', '    move_right()', 'collect()'),
)
