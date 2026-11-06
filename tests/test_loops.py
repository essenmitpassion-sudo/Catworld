import pytest
from neonpaw.code.runner import Runner, ProgramError, parse
from neonpaw.core.world import World


@pytest.mark.parametrize('arguments, expected', [
    ('5', 5), ('0', 0), ('-3', 0), ('2, 6', 4), ('6, 1, -2', 3),
    ('1, 6, 2', 3), ('4, 1', 0), ('-3, 0', 3), ('64', 64),
])
def test_supported_range_matches_python(arguments, expected):
    commands = parse(f'for step in range({arguments}):\n    move_right()')
    assert commands == ((2, 'move_right'),) * expected


def test_loop_body_order_and_following_action():
    assert parse('for i in range(2):\n move_right()\n collect()\nmove_right()') == (
        (2, 'move_right'), (3, 'collect'), (2, 'move_right'), (3, 'collect'), (4, 'move_right'))


def test_loop_steps_stop_resume_and_reset():
    r = Runner(initial_world=World(battery_x=6))
    source = 'for _ in range(5):\n    move_right()\ncollect()'
    r.load(source)
    r.step()
    assert (r.world.x, r.pc, r.line) == (2, 1, 2)
    r.run()
    r.tick()
    r.stop()
    r.tick()
    assert r.world.x == 3 and r.pc == 2
    r.reset()
    assert r.world == World(battery_x=6)
    r.load(source)
    r.run()
    for _ in range(6):
        r.tick()
    assert r.world.powered and r.world.x == 6 and r.line == 3


def test_runtime_budget_still_applies_to_expanded_loop():
    r = Runner(max_steps=2)
    r.load('for i in range(5):\n move_right()')
    r.run()
    for _ in range(3):
        r.tick()
    assert r.status == 'error' and r.world.x == 3
    assert 'Schrittlimit' in r.error


@pytest.mark.parametrize('source', [
    'for i in range(65):\n move_right()',
    'for i in range(64):\n move_right()\nmove_right()',
    'for i in range(33):\n move_right()\n move_right()',
    'for i in range(0, 1, 0):\n move_right()',
    'for i in range(999999999999999999999):\n move_right()',
    'for i in range(True):\n move_right()', 'for i in range(2.0):\n move_right()',
    'for i in range(1+2):\n move_right()', 'for i in range():\n move_right()',
    'for i in range(1,2,3,4):\n move_right()', 'for i in range(stop=2):\n move_right()',
    'for i in range(*[2]):\n move_right()', 'for i in range(x):\n move_right()',
    'for i in [1,2]:\n move_right()', 'for a,b in range(2):\n move_right()',
    'for i in range(2):\n for j in range(2):\n  move_right()',
    'for i in range(2):\n move_right()\nelse:\n collect()',
    'for i in range(0):\n import os', 'for i in range(0):\n bad()',
    'for i in range(2):\n break', 'for i in range(2):\n continue',
    'for move_right in range(2):\n move_right()',
    'for collect in range(2):\n move_right()', 'for range in range(2):\n move_right()',
    'for i in range(2):\n move_right(i)', 'while True:\n move_right()',
])
def test_invalid_or_unsafe_loop_rejected_before_any_action(source):
    r = Runner()
    with pytest.raises(ProgramError):
        r.load('move_right()\n' + source)
    r.tick()
    assert r.world == World() and r.status == 'error'


def test_global_iteration_budget_includes_multiple_loops():
    with pytest.raises(ProgramError):
        parse('for i in range(33):\n move_right()\nfor j in range(33):\n move_right()')


def test_empty_loop_has_no_world_effect_and_valid_following_call_runs():
    r = Runner()
    r.load('for i in range(-1):\n move_right()\nmove_right()')
    r.step()
    assert r.world.x == 2 and r.line == 3 and r.status == 'done'
