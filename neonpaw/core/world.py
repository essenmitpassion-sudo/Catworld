"""Immutable world state; no renderer or interpreter dependencies."""
from dataclasses import dataclass, replace


@dataclass(frozen=True)
class World:
    x: int = 1
    width: int = 9
    moves: int = 0
    battery_x: int = 2
    powered: bool = False
    second_battery_x: int | None = None
    first_lit: bool = False
    second_lit: bool = False
    switch_x: int | None = None
    gate_x: int | None = None
    gate_open: bool = False
    y: int = 0
    upper_tiles: tuple[int, ...] = ()
    ladders: tuple[int, ...] = ()

    @property
    def target_x(self):
        return self.second_battery_x if self.first_lit and self.second_battery_x is not None else self.battery_x


def transition(world: World, action: str) -> World:
    if action in ('move_up', 'move_down'):
        if world.x not in world.ladders or world.x not in world.upper_tiles:
            raise ValueError('Hier ist keine Leiter. Suche die Leiter am Ende des Stegs.')
        target_y = 1 if action == 'move_up' else 0
        if world.y == target_y:
            raise ValueError('Nox ist bereits oben.' if target_y else 'Nox ist bereits unten.')
        return replace(world, y=target_y, moves=world.moves + 1)
    if world.y != 0 and action in ('toggle', 'collect'):
        raise ValueError('Schalter und Batterie liegen unten. Steige an einer Leiter zum Boden ab.')
    if action == 'toggle':
        if world.switch_x is None or world.gate_x is None:
            raise ValueError('Hier gibt es keinen Schalter. toggle() gehört zur Werkstatt.')
        if world.x != world.switch_x:
            raise ValueError('Gehe zum Schalterfeld. toggle() schaltet dort das Tor um.')
        return replace(world, gate_open=not world.gate_open)
    if action == 'collect':
        if world.powered:
            if world.second_battery_x is not None:
                raise ValueError('Beide Laternen leuchten bereits. Du kannst den Heimweg planen.')
            raise ValueError('Die Batterie ist bereits im Automaten. Er leuchtet!')
        if world.second_battery_x is not None:
            if world.x == world.battery_x and not world.first_lit:
                return replace(world, first_lit=True, powered=world.second_lit)
            if world.x == world.second_battery_x and not world.second_lit:
                return replace(world, second_lit=True, powered=world.first_lit)
            if not world.first_lit and not world.second_lit:
                raise ValueError('Hier liegt keine Batterie. Wähle eines der beiden Leuchtfelder.')
            goal = 'zweite Laterne' if world.first_lit else 'erste Laterne'
            raise ValueError(f'Hier liegt keine ungenutzte Batterie. Erreiche die {goal} am Leuchtfeld.')
        if world.x != world.target_x:
            raise ValueError('Hier liegt keine Batterie. Gehe zum markierten Feld; bei Bedarf Reset.')
        return replace(world, powered=True)
    if action not in ('move_right', 'move_left'):
        raise ValueError('Unbekannte Weltaktion.')
    step = 1 if action == 'move_right' else -1
    target = world.x + step
    if target < 0:
        raise ValueError('Hier ist der linke Rand. move_right() führt zurück auf den Weg.')
    if target >= world.width:
        raise ValueError('Hier endet die Gasse. move_left() führt zurück auf den Weg.')
    if world.y == 1 and target not in world.upper_tiles:
        raise ValueError('Hier endet der Steg. Gehe zurück oder nutze move_down() an der Leiter.')
    if world.y == 0 and target == world.gate_x and not world.gate_open:
        raise ValueError('Das Tor ist zu. toggle() wechselt am Schalter zwischen offen und zu.')
    return replace(world, x=target, moves=world.moves + 1)
