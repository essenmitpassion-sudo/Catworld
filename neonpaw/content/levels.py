from neonpaw.core.world import World


def workshop_world(start_open=False):
    """Shared starting rules for playing and checking a workshop plan."""
    return World(battery_x=7, switch_x=3, gate_x=5, gate_open=start_open,
                 upper_tiles=(2, 3, 4, 5, 6), ladders=(2, 6))


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

PAIR_HINTS = (
    ('Wo musst du anhalten, damit beide Laternen leuchten?',),
    ('Nach jeder Strecke kommt collect(). Welche Teilfolge wiederholt sich?',),
    ('for _ in range(2):', '    move_right()', '    move_right()', '    move_right()', '    collect()'),
)
