import pytest
from dataclasses import replace
from neonpaw.district.world import District, transition, DEVICES
from neonpaw.code.runner import Runner, ProgramError


def execute(code, world=None):
    runner = Runner(initial_world=world or District(), transition_fn=transition)
    runner.load(code); runner.run()
    for _ in range(65): runner.tick()
    return runner


def path(world, *actions):
    for action in actions: world = transition(world, action)
    return world


def test_energy_can_be_reallocated_instead_of_permanently_spent():
    world = replace(District(), x=1, y=1)
    lit = transition(world, 'toggle')
    assert lit.active == frozenset({'shelter'}) and lit.energy == 0
    assert transition(lit, 'toggle') == world
    with pytest.raises(ValueError, match='Energie'):
        transition(replace(lit, x=3, y=3), 'toggle')


@pytest.mark.parametrize('device,position,crossing', [
    ('workshop', (3,3), (3,3)), ('garden',(2,4),(3,1)),
])
def test_each_powered_device_opens_a_different_crossing(device, position, crossing):
    world = replace(District(), x=position[0], y=position[1])
    world = transition(world, 'toggle')
    assert device in world.active
    before = replace(world, x=crossing[0], y=crossing[1])
    assert transition(before, 'move_right').x == 4
    with pytest.raises(ValueError, match='Kanal'):
        transition(replace(before, active=frozenset()), 'move_right')


def test_complete_route_obtains_energy_then_powers_all_three_buildings():
    code = ('move_right()\nmove_right()\ntoggle()\n'
            'for _ in range(3):\n    move_right()\nmove_up()\ncollect()\n'
            'move_down()\nfor _ in range(3):\n    move_left()\n'
            'move_left()\nmove_down()\ntoggle()\n'
            'for _ in range(3):\n    move_up()\nmove_left()\ntoggle()')
    result = execute(code)
    assert result.status == 'done', result.error
    assert result.world.restored and result.world.energy == 0
    assert result.world.active == frozenset(DEVICES)
    assert result.world.cell_collected


def test_cell_is_single_use_and_balance_is_conserved():
    world = replace(District(), x=6,y=2)
    collected = transition(world, 'collect')
    assert collected.energy == 3
    with pytest.raises(ValueError, match='bereits'): transition(collected,'collect')
    for device, position in DEVICES.items():
        collected = transition(replace(collected,x=position[0],y=position[1]),'toggle')
        assert collected.energy + len(collected.active) == 3


@pytest.mark.parametrize('x,y,action', [(0,0,'move_left'),(0,0,'move_up'),
                                      (7,5,'move_right'),(7,5,'move_down'),(3,2,'move_right')])
def test_world_edges_and_water_reject_movement(x,y,action):
    with pytest.raises(ValueError): transition(replace(District(),x=x,y=y), action)


@pytest.mark.parametrize('source', ['import os', 'while True: move_right()', 'move_right(2)',
                                   'for _ in range(65):\n    move_right()'])
def test_existing_compiler_keeps_security_and_work_limits(source):
    with pytest.raises(ProgramError): execute(source)


def test_gate_sensor_is_a_readable_error_in_a_world_without_gate():
    result=execute('if gate_open():\n    move_right()')
    assert result.status=='error' and 'Tor' in result.error


def test_error_preserves_completed_actions_and_reset_restores_initial_world():
    result=execute('move_right()\ncollect()')
    assert result.status=='error' and result.world.x==2
    result.reset()
    assert result.world==District()
