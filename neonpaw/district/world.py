"""Deterministic district rules. Energy is movable, never a consumable grind."""
from dataclasses import dataclass, replace

DEVICES = {'workshop': (3, 3), 'garden': (2, 4), 'shelter': (1, 1)}
NAMES = {'workshop': 'Werkstatt', 'garden': 'Dachgarten', 'shelter': 'Katzenzuflucht'}
CROSSINGS = {(4, 3): 'workshop', (4, 1): 'garden'}
CELL = (6, 2)
STEPS = {'move_right': (1, 0), 'move_left': (-1, 0),
         'move_up': (0, -1), 'move_down': (0, 1)}


@dataclass(frozen=True)
class District:
    x: int = 1
    y: int = 3
    energy: int = 1
    active: frozenset[str] = frozenset()
    cell_collected: bool = False
    moves: int = 0

    @property
    def restored(self):
        return len(self.active) == len(DEVICES)

    @property
    def device(self):
        return next((name for name, pos in DEVICES.items() if pos == (self.x, self.y)), None)


def walkable(world, x, y):
    if not (0 <= x < 8 and 0 <= y < 6):
        return False
    return x != 4 or CROSSINGS.get((x, y)) in world.active


def transition(world, action):
    if action in STEPS:
        dx, dy = STEPS[action]
        x, y = world.x + dx, world.y + dy
        if not (0 <= x < 8 and 0 <= y < 6):
            raise ValueError('Hier endet der Bezirk. Wähle eine andere Richtung.')
        if not walkable(world, x, y):
            raise ValueError('Der Kanal ist nicht begehbar. Werkstatt oder Garten öffnen einen Übergang.')
        return replace(world, x=x, y=y, moves=world.moves+1)
    if action == 'toggle':
        device = world.device
        if device is None:
            raise ValueError('Stelle Nox auf das Anschlussfeld eines Gebäudes.')
        if device in world.active:
            return replace(world, active=world.active - {device}, energy=world.energy+1)
        if not world.energy:
            raise ValueError('Keine freie Energie. Schalte ein anderes Gebäude aus oder finde den Akku.')
        return replace(world, active=world.active | {device}, energy=world.energy-1)
    if action == 'collect':
        if (world.x, world.y) != CELL:
            raise ValueError('Der Akku liegt auf der anderen Kanalseite bei (6, 2).')
        if world.cell_collected:
            raise ValueError('Diesen Akku hast du bereits eingesammelt.')
        return replace(world, energy=world.energy+2, cell_collected=True)
    raise ValueError('Dieser Befehl gehört nicht zum Bezirk.')
