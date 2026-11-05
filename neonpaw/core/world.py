"""Immutable world state; no renderer or interpreter dependencies."""
from dataclasses import dataclass, replace


@dataclass(frozen=True)
class World:
    x: int = 1
    width: int = 9
    moves: int = 0


def transition(world: World, action: str) -> World:
    if action != 'move_right':
        raise ValueError('Unbekannte Weltaktion.')
    if world.x + 1 >= world.width:
        raise ValueError('Hier endet die Gasse. Reset bringt die Katze zurück.')
    return replace(world, x=world.x + 1, moves=world.moves + 1)
