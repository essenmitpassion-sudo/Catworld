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

    @property
    def target_x(self):
        return self.second_battery_x if self.first_lit and self.second_battery_x is not None else self.battery_x


def transition(world: World, action: str) -> World:
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
    return replace(world, x=target, moves=world.moves + 1)
