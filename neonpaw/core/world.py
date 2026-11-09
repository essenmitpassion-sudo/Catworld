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

    @property
    def target_x(self):
        return self.second_battery_x if self.first_lit and self.second_battery_x is not None else self.battery_x


def transition(world: World, action: str) -> World:
    if action == 'collect':
        if world.powered:
            raise ValueError('Die Batterie ist bereits im Automaten. Er leuchtet!')
        if world.second_battery_x is not None:
            if world.x != world.target_x:
                goal = 'zweite Laterne' if world.first_lit else 'erste Laterne'
                raise ValueError(f'Hier ist nicht die nächste Batterie. Erreiche die {goal} am Leuchtfeld.')
            if not world.first_lit:
                return replace(world, first_lit=True)
        if world.x != world.target_x:
            raise ValueError('Hier liegt keine Batterie. Gehe zum markierten Feld; bei Bedarf Reset.')
        return replace(world, powered=True)
    if action != 'move_right':
        raise ValueError('Unbekannte Weltaktion.')
    if world.x + 1 >= world.width:
        raise ValueError('Hier endet die Gasse. Reset bringt die Katze zurück.')
    return replace(world, x=world.x + 1, moves=world.moves + 1)
