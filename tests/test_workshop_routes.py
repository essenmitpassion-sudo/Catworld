from dataclasses import replace
import pytest
from neonpaw.core.world import World, transition
from neonpaw.content.levels import workshop_world
from neonpaw.code.runner import Runner
from neonpaw.code.checks import check_workshop
from tests.test_workshop import finish
from tests.test_gate_condition import ADAPTIVE_PLAN

BRIDGE_PLAN = ('move_right()\nmove_up()\nfor _ in range(4):\n'
               '    move_right()\nmove_down()\nmove_right()\ncollect()')
BRIDGE_HOME = ('\nmove_left()\nmove_up()\nfor _ in range(4):\n'
               '    move_left()\nmove_down()\nmove_left()')


@pytest.mark.parametrize('start_open', [False, True])
def test_two_routes_power_same_workshop_with_distinct_action_costs(start_open):
    bridge = Runner(initial_world=workshop_world(start_open))
    finish(bridge, BRIDGE_PLAN)
    assert bridge.status == 'done', bridge.error
    assert bridge.world.powered and (bridge.world.x, bridge.world.y) == (7, 0)
    assert bridge.world.gate_open == start_open
    assert bridge.executed_steps == 9
    ground = Runner(initial_world=workshop_world(start_open))
    finish(ground, ADAPTIVE_PLAN)
    assert ground.status == 'done' and ground.world.powered
    assert ground.executed_steps == (7 if start_open else 8)


def test_bridge_allows_return_over_closed_gate_and_reset():
    runner = Runner(initial_world=workshop_world())
    finish(runner, BRIDGE_PLAN + BRIDGE_HOME)
    assert runner.status == 'done', runner.error
    assert runner.world.powered and not runner.world.gate_open
    assert (runner.world.x, runner.world.y) == (1, 0)
    runner.reset()
    assert runner.world == workshop_world()


def test_plan_comparison_accepts_both_bridge_starts():
    assert [(r.success, r.actions) for r in check_workshop(BRIDGE_PLAN)] == [(True, 9), (True, 9)]


@pytest.mark.parametrize('world,action', [
    (World(), 'move_up'), (workshop_world(), 'move_up'),
    (replace(workshop_world(), x=2), 'move_down'),
])
def test_no_climbing_without_ladder_or_beyond_floor(world, action):
    with pytest.raises(ValueError, match='Leiter|oben|unten'):
        transition(world, action)


@pytest.mark.parametrize('x,action', [(2, 'move_left'), (6, 'move_right'),
                                       (3, 'move_down'), (2, 'move_up')])
def test_upper_path_has_real_edges_and_climbing_limits(x, action):
    world = replace(workshop_world(), x=x, y=1)
    with pytest.raises(ValueError): transition(world, action)


@pytest.mark.parametrize('action,x', [('toggle', 3), ('collect', 3)])
def test_upper_path_cannot_interact_with_objects_on_ground(action, x):
    world = replace(workshop_world(), x=x, y=1, battery_x=x)
    with pytest.raises(ValueError, match='unten|Boden'): transition(world, action)


def test_closed_gate_blocks_ground_but_not_upper_path_in_both_directions():
    for x, action in [(4, 'move_right'), (6, 'move_left')]:
        ground = replace(workshop_world(), x=x)
        with pytest.raises(ValueError, match='Tor'): transition(ground, action)
        upper = replace(ground, y=1)
        result = transition(upper, action)
        assert result.x == 5 and result.y == 1 and not result.gate_open
