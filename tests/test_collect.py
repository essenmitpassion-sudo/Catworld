import pytest
from neonpaw.core.world import World, transition
from neonpaw.code.runner import Runner, ProgramError


def test_collect_powers_machine_atomically_without_moving():
    start = World()
    at_battery = transition(start, 'move_right')
    powered = transition(at_battery, 'collect')
    assert powered.powered
    assert not at_battery.powered
    assert (powered.x, powered.moves) == (2, 1)
    assert powered == transition(at_battery, 'collect')


def test_collect_wrong_tile_does_not_consume_battery():
    with pytest.raises(ValueError, match='Batterie'):
        transition(World(), 'collect')


def test_battery_cannot_be_collected_twice():
    powered = transition(transition(World(), 'move_right'), 'collect')
    with pytest.raises(ValueError, match='bereits'):
        transition(powered, 'collect')


def test_runner_mixed_actions_line_numbers_stop_and_reset():
    r = Runner()
    r.load('# Strom\nmove_right()\ncollect()')
    r.step()
    assert r.line == 2 and not r.world.powered
    r.run()
    r.stop()
    r.tick()
    assert not r.world.powered
    r.load('collect()')
    r.step()
    assert r.world.powered and r.status == 'done'
    r.reset()
    assert r.world == World() and not r.world.powered


def test_run_sequence_and_budget_apply_to_collect():
    r = Runner(max_steps=1)
    r.load('move_right()\ncollect()')
    r.run()
    r.tick()
    r.tick()
    assert r.status == 'error' and not r.world.powered
    assert 'Schrittlimit' in r.error
    r.reset()
    r.max_steps = 64
    r.load('move_right()\ncollect()')
    r.run()
    r.tick()
    r.tick()
    assert r.world.powered and r.line == 2 and r.status == 'done'


@pytest.mark.parametrize('source', ['collect(1)', 'collect(x=1)', 'collect.__call__()',
                                    'collect(*[])', 'collect(**{})', 'x=collect()',
                                    'collect()\nimport os'])
def test_collect_cannot_expand_python_permissions(source):
    r = Runner()
    with pytest.raises(ProgramError):
        r.load(source)
    r.tick()
    assert r.world == World() and r.status == 'error'


def test_collect_world_error_is_recoverable():
    r = Runner()
    r.load('collect()')
    r.step()
    assert r.status == 'error' and r.line == 1
    assert 'Batterie' in r.error
    r.reset()
    assert r.world == World() and not r.error


def test_documented_64_command_boundary_is_accepted():
    r = Runner()
    r.load('move_right()\ncollect()\n' * 32)
    assert len(r.commands) == 64


def test_65_commands_are_rejected_before_any_action():
    r = Runner()
    with pytest.raises(ProgramError):
        r.load('move_right()\ncollect()\n' * 32 + 'collect()')
    assert r.world == World() and r.status == 'error'
