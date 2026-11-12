import pytest
from neonpaw.code.runner import Runner, ProgramError, parse
from neonpaw.core.world import World

ADAPTIVE_PLAN = ('for _ in range(2):\n    move_right()\n'
                 'if not gate_open():\n    toggle()\n'
                 'for _ in range(4):\n    move_right()\ncollect()')


def runner(opened=False, max_steps=64):
    return Runner(initial_world=World(battery_x=7, switch_x=3, gate_x=5, gate_open=opened), max_steps=max_steps)


def run(r, source):
    r.load(source)
    r.run()
    for _ in range(128): r.tick()


@pytest.mark.parametrize('opened, actions', [(False, 8), (True, 7)])
def test_identical_own_plan_adapts_to_both_gate_states(opened, actions):
    r = runner(opened)
    run(r, ADAPTIVE_PLAN)
    assert r.status == 'done', r.error
    assert r.world.powered and r.world.x == 7
    assert r.executed_steps == actions


def test_condition_reads_live_world_after_toggle_not_world_at_load():
    r = runner()
    run(r, 'move_right()\nmove_right()\ntoggle()\nif gate_open():\n    toggle()')
    assert r.status == 'done' and not r.world.gate_open
    assert r.executed_steps == 4


def test_step_skips_false_branch_then_executes_at_most_one_world_action():
    r = runner(True)
    r.load(ADAPTIVE_PLAN)
    r.step(); r.step()
    assert r.world.x == 3
    r.step()
    assert r.world.x == 4 and r.world.gate_open and r.executed_steps == 3
    assert r.condition_result == (3, True, False)
    assert r.line_progress == (6, 1, 4)
    r.stop(); r.tick()
    assert r.world.x == 4
    r.reset()
    assert r.world.x == 1 and r.world.gate_open
    assert r.executed_steps == 0 and r.condition_result is None


def test_false_last_branch_finishes_without_an_action_or_fake_progress():
    r = runner()
    r.load('if gate_open():\n    toggle()')
    r.step()
    assert r.status == 'done' and r.world.x == 1 and not r.world.gate_open
    assert r.executed_steps == 0 and r.line_progress is None
    assert r.line == 1 and r.condition_result == (1, False, False)


def test_error_in_taken_branch_points_to_actual_action_line():
    r = runner(True)
    run(r, 'if gate_open():\n    toggle()')
    assert r.status == 'error' and r.line == 2 and 'Schalter' in r.error
    assert r.world.gate_open and r.executed_steps == 0


def test_sensor_without_gate_fails_on_condition_line():
    r = Runner()
    run(r, 'if not gate_open():\n    move_right()')
    assert r.status == 'error' and r.line == 1 and 'Tor' in r.error
    assert r.world == World()


@pytest.mark.parametrize('body', ['import os', 'toggle(1)', 'unknown()',
    'for _ in range(1):\n        move_right()', 'if gate_open():\n        toggle()'])
def test_even_unreached_branch_is_validated(body):
    with pytest.raises(ProgramError): parse('if gate_open():\n    ' + body)


@pytest.mark.parametrize('source', ['if True:\n    toggle()',
    'if gate_open(1):\n    toggle()', 'if gate_open(value=1):\n    toggle()',
    'if not not gate_open():\n    toggle()',
    'if world.gate_open():\n    toggle()',
    'if gate_open() or True:\n    toggle()',
    'if gate_open():\n    toggle()\nelse:\n    move_left()',
    'for gate_open in range(1):\n    move_right()',
    'for _ in range(2):\n    if gate_open():\n        toggle()'])
def test_condition_does_not_expand_into_general_python(source):
    with pytest.raises(ProgramError): parse(source)


def test_limits_count_real_actions_and_reject_oversized_branch_before_running():
    r = runner(True, max_steps=2)
    run(r, 'if not gate_open():\n    toggle()\nmove_right()\nmove_right()')
    assert r.status == 'done' and r.executed_steps == 2 and r.world.x == 3
    r = runner(True, max_steps=1)
    run(r, 'if not gate_open():\n    toggle()\nmove_right()\nmove_right()')
    assert r.status == 'error' and r.executed_steps == 1 and r.world.x == 2
    with pytest.raises(ProgramError):
        parse('if gate_open():\n' + '    toggle()\n' * 65)
