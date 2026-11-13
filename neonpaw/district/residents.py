"""Presentation-only resident motion; never changes the player's simulation."""
from .characters import POSITIONS


class Residents:
    def __init__(self, world):
        self.reset(world)

    def reset(self, world):
        self.positions=dict(POSITIONS)
        self.positions['miso']=(0,1 if 'shelter' in world.active else 5)
        self.moving=False
        self.facing_left=False

    def update(self, world, dt):
        target=1 if 'shelter' in world.active else 5
        y=self.positions['miso'][1]
        distance=target-y
        step=min(abs(distance),max(0,dt)*2)
        if distance:self.facing_left=distance>0
        y+=step if distance>0 else -step
        self.positions['miso']=(0,y)
        self.moving=abs(target-y)>.001
