"""Workshop presentation only: actions and state live in core.world."""
import pygame

UPPER_OFFSET = 110

ADAPTIVE_EXAMPLE = (
    'for _ in range(2):', '    move_right()',
    'if not gate_open():', '    toggle()',
    'for _ in range(4):', '    move_right()', 'collect()',
)

HINTS = (
    ('Unten liegt das Tor, oben führt ein längerer Steg vorbei.',
     'An Leitern: move_up() hinauf, move_down() hinunter. Du wählst den Weg.'),
    ('toggle() schaltet am Schalter um; gate_open() liest den Torzustand.',
     'if not gate_open(): führt eingerückte Befehle nur bei geschlossenem Tor aus.'),
    ADAPTIVE_EXAMPLE,
)

OPEN_HINTS = (
    ('Das Tor ist schon am Anfang offen.',
     'Was würde dein bisheriger Schalterbefehl jetzt verändern?'),
    ('gate_open() fragt: Ist das Tor gerade offen?',
     'if not gate_open(): schaltet nur dann, wenn das Tor noch zu ist.'),
    ADAPTIVE_EXAMPLE,
)


def guidance(world, secured, start_open=False):
    if secured:
        return 'Dein Plan versorgt und sichert die Werkstatt.', 'Probiere auf Wunsch einen anderen Ablauf.'
    if world.powered:
        return 'Die Werkstatt hat Strom. Dein Weg funktioniert!', ('Freiwillig: Tor schliessen und heimkehren.' if world.gate_open else 'Freiwillig: Finde deinen Weg nach Hause.')
    if world.y == 1:
        return 'Nox geht über das Tor hinweg.', 'Am Stegende: move_down() zum Boden.'
    if world.x in world.ladders:
        return 'Hier führt eine Leiter zum Steg.', 'move_up() zum Steg. Oder unten weitergehen.'
    if start_open and not world.gate_open:
        return 'Das anfangs offene Tor ist jetzt geschlossen.', 'Prüfe, was toggle() in deinem Plan bewirkt.'
    if world.x == world.switch_x:
        return 'Nox steht am Schalter. toggle() schaltet um.', 'Beobachte das Tor mit Step.'
    if world.gate_open:
        return 'Das Tor ist offen. Der Weg ist jetzt frei.', 'Erreiche die Batterie und nutze collect().'
    return 'Torweg oder längerer Steg: Du wählst.', 'Schalter oder Leiter? F1 hilft auf Wunsch.'


def comparison_lines(results, font):
    lines = []
    for result in results:
        start = 'offen' if result.start_open else 'zu'
        outcome = 'VERSORGT' if result.success else 'PRÜFEN'
        lines.append(f'Starttor {start}: {outcome} · {result.actions} Aktionen')
        detail = result.message or 'Das Programm erreicht das Ziel ohne Ausführungsfehler.'
        current = ''
        for word in detail.split():
            candidate = f'{current} {word}'.strip()
            if current and font.size(candidate)[0] > 650:
                lines.append(current)
                current = word
            else:
                current = candidate
        if current:
            lines.append(current)
    lines.append('Geprüft wurde dein Text. Die aktuelle Spielwelt bleibt erhalten.')
    return tuple(lines)


def draw_devices(scene, world, font):
    scene.fill('#182b36', (0, 108, 350, 78))
    for x in world.upper_tiles:
        tile_x = 13 + 36 * x
        pygame.draw.rect(scene, '#344957', (tile_x, 192 - UPPER_OFFSET, 32, 30))
        pygame.draw.line(scene, '#8eb4c6', (tile_x, 192 - UPPER_OFFSET),
                         (tile_x + 31, 192 - UPPER_OFFSET), 2)
    for x in world.ladders:
        lx = 29 + 36 * x
        for side in (-10, 10):
            pygame.draw.line(scene, '#8eb4c6', (lx + side, 112), (lx + side, 214), 2)
        for y in range(116, 214, 12):
            pygame.draw.line(scene, '#8eb4c6', (lx - 10, y), (lx + 10, y), 2)
    scene.blit(font.render('STEG', False, '#b4d5df'), (165, 57))
    switch = 29 + 36 * world.switch_x
    gate = 29 + 36 * world.gate_x
    machine = 29 + 36 * world.battery_x
    color = '#65f3dd' if world.gate_open else '#ffb86c'
    pygame.draw.lines(scene, color, False,
                      [(switch, 172), (switch, 139), (gate, 139), (gate, 152)], 2)
    pygame.draw.rect(scene, '#41546b', (switch - 12, 160, 25, 25))
    pygame.draw.circle(scene, '#0e1726', (switch, 174), 5)
    pygame.draw.line(scene, color, (switch, 174),
                     (switch + (8 if world.gate_open else -8), 158), 4)
    scene.blit(font.render('SCHALTER', False, color), (switch - 35, 116))
    pygame.draw.rect(scene, color, (switch - 16, 192, 32, 30), 2)
    pygame.draw.line(scene, '#8693a6', (gate - 18, 149), (gate - 18, 222), 3)
    pygame.draw.line(scene, '#8693a6', (gate + 18, 149), (gate + 18, 222), 3)
    pygame.draw.rect(scene, color, (gate - 18, 146, 37, 7))
    if not world.gate_open:
        for gx in range(gate - 12, gate + 15, 8):
            pygame.draw.line(scene, '#ffb86c', (gx, 154), (gx, 220), 3)
        pygame.draw.line(scene, color, (gate - 16, 201), (gate + 16, 201), 3)
    scene.blit(font.render('OFFEN' if world.gate_open else 'ZU', False, color), (gate - 20, 119))
    glow = '#65f3dd' if world.powered else '#657587'
    pygame.draw.rect(scene, '#102131', (machine - 27, 124, 56, 58))
    pygame.draw.rect(scene, glow, (machine - 27, 124, 56, 58), 2)
    pygame.draw.rect(scene, '#ffcf8a' if world.powered else '#34415c', (machine - 21, 133, 44, 17))
    scene.blit(font.render('WERKSTATT', False, glow), (machine - 41, 105))
    home = 65
    pygame.draw.lines(scene, '#8794ad', False,
                      [(home - 10, 175), (home - 10, 164), (home, 155), (home + 10, 164), (home + 10, 175)], 2)
    scene.blit(font.render('HEIM', False, '#8794ad'), (home - 17, 140))
