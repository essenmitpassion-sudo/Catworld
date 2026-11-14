"""Short, reversible visual fades; power and bridge rules remain immediate."""
from .world import DEVICES


class Lighting:
    def __init__(self,world):
        self.reset(world)

    def reset(self,world):
        self.levels={name:float(name in world.active) for name in DEVICES}

    def update(self,world,dt):
        step=max(0,dt)/.6
        for name,current in self.levels.items():
            target=float(name in world.active)
            self.levels[name]=(min(target,current+step) if target>current
                               else max(target,current-step))
