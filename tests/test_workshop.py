import pytest
from neonpaw.code.runner import Runner, ProgramError, parse
from neonpaw.core.world import World, transition

OPEN_AND_POWER = ('move_right()\n' * 2 + 'toggle()\n' +
                  'move_right()\n' * 4 + 'collect()')
LOOP_PLAN = ('for _ in range(2):\n    move_right()\ntoggle()\n'
             'for _ in range(4):\n    move_right()\ncollect()')
SECURE_HOME = ('\nfor _ in range(4):\n    move_left()\ntoggle()\n'
               'for _ in range(2):\n    move_left()')


def workshop_runner():
    return Runner(initial_world=World(battery_x=7, switch_x=3, gate_x=5))


def finish(runner, source):
    runner.load(source)
    runner.run()
    for _ in range(64):
        runner.tick()


@pytest.mark.parametrize('source', [OPEN_AND_POWER, LOOP_PLAN,
    'move_left()\nmove_right()\n' + LOOP_PLAN])
def test_player_can_open_a_path_and_power_workshop_with_different_plans(source):
    runner = workshop_runner()
    finish(runner, source)
    assert runner.status == 'done', runner.error
    assert runner.world.x == 7 and runner.world.powered and runner.world.gate_open


def test_gate_stops_the_cat_on_the_error_line_without_losing_previous_moves():
    runner = workshop_runner()
    finish(runner, 'move_right()\n' * 4)
    assert runner.status == 'error' and runner.line == 4
    assert runner.world.x == 4 and runner.world.moves == 3
    assert 'Tor' in runner.error and 'toggle()' in runner.error
    assert not runner.world.powered and not runner.world.gate_open


def test_switch_toggles_twice_and_does_not_move_cat_or_supply_power():
    world = World(x=3, battery_x=7, switch_x=3, gate_x=5)
    opened = transition(world, 'toggle')
    assert opened.gate_open and opened.x == 3 and not opened.powered
    assert transition(opened, 'toggle') == world


@pytest.mark.parametrize('settings', [{}, dict(x=2, switch_x=3, gate_x=5)])
def test_toggle_at_wrong_place_or_in_old_world_is_a_game_error(settings):
    world = World(**settings)
    runner = Runner(initial_world=world)
    finish(runner, 'toggle()')
    assert runner.status == 'error' and runner.line == 1
    assert runner.world == world


@pytest.mark.parametrize('x, action', [(4, 'move_right'), (6, 'move_left')])
def test_closed_gate_blocks_from_both_directions(x, action):
    world = World(x=x, battery_x=7, switch_x=3, gate_x=5)
    with pytest.raises(ValueError, match='Tor'):
        transition(world, action)


def test_powered_workshop_can_be_left_with_gate_closed_and_cat_home():
    runner = workshop_runner()
    finish(runner, LOOP_PLAN + SECURE_HOME)
    assert runner.status == 'done', runner.error
    assert runner.world.powered and not runner.world.gate_open and runner.world.x == 1
    runner.reset()
    assert not runner.world.powered and not runner.world.gate_open
    assert runner.world == World(battery_x=7, switch_x=3, gate_x=5)


def test_step_and_stop_do_not_toggle_the_gate_a_second_time():
    runner = workshop_runner()
    runner.load(LOOP_PLAN)
    for _ in range(3):
        runner.step()
    assert runner.world.gate_open and runner.world.x == 3
    runner.run()
    runner.stop()
    runner.tick()
    assert runner.world.gate_open and runner.world.x == 3


@pytest.mark.parametrize('source', ['toggle(1)', 'toggle(open=True)',
    'for toggle in range(2):\n    toggle()',
    'for _ in range(64):\n    toggle()\n    move_right()'])
def test_toggle_keeps_argument_shadowing_and_resource_restrictions(source):
    with pytest.raises(ProgramError):
        parse(source)
