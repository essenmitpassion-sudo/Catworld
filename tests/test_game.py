import pytest
from neonpaw.core.world import World, transition
from neonpaw.code.runner import Runner, ProgramError, parse


def test_one_tile_and_deterministic_replay():
    initial = World()
    first = transition(initial, 'move_right')
    assert first.x == initial.x + 1
    assert initial.x == 1
    assert first == transition(initial, 'move_right')


def test_boundary_refusal():
    with pytest.raises(ValueError, match='Gasse'):
        transition(World(x=8), 'move_right')


def test_run_cooperates_one_command_per_tick():
    r = Runner()
    r.load('move_right()\nmove_right()')
    r.run()
    assert r.world.x == 1
    r.tick()
    assert (r.world.x, r.line, r.status) == (2, 1, 'running')
    r.tick()
    assert (r.world.x, r.line, r.status) == (3, 2, 'done')


def test_step_stop_and_reset():
    r = Runner()
    r.load('move_right()\nmove_right()')
    r.step()
    assert (r.world.x, r.status) == (2, 'paused')
    r.run()
    r.stop()
    for _ in range(5):
        r.tick()
    assert (r.world.x, r.status) == (2, 'stopped')
    r.reset()
    assert (r.world, r.line, r.status, r.pc) == (World(), None, 'idle', 0)


@pytest.mark.parametrize('source', [
    'import os', '__import__("os")', 'move_right(1)', 'move_right(x=1)',
    'move_right.__call__()', 'x = 1', 'while True: move_right()',
    'for x in range(1 + 2): move_right()', '[move_right() for x in range(3)]',
    'print("hello")', 'lambda: move_right()', 'move_right(*[])',
    'def f():\n pass', '1 + 2', 'move_right()\nopen("secret")',
])
def test_unknown_syntax_denied_before_execution(source):
    r = Runner()
    with pytest.raises(ProgramError):
        r.load(source)
    assert r.world == World()
    assert r.status == 'error'
    r.tick()
    assert r.world == World()


def test_syntax_error_has_line():
    with pytest.raises(ProgramError) as exc:
        parse('\nmove_right(')
    assert exc.value.line == 2


@pytest.mark.parametrize('source', ['x' * 4097, 'move_right()\n' * 65, '(' * 300 + '1' + ')' * 300])
def test_input_budgets(source):
    with pytest.raises(ProgramError):
        parse(source)


def test_runtime_budget():
    r = Runner(max_steps=1)
    r.load('move_right()\nmove_right()')
    r.run()
    r.tick()
    r.tick()
    assert (r.world.x, r.status) == (2, 'error')
    assert 'Schrittlimit' in r.error


def test_world_error_and_recovery():
    r = Runner()
    r.load('move_right()\n' * 9)
    r.run()
    for _ in range(9):
        r.tick()
    assert r.world.x == 8
    assert r.status == 'error'
    assert r.line == 8
    r.reset()
    assert not r.error
    assert r.world == World()


def test_comments_empty_and_python_statement_sequence():
    assert parse('# Kommentar\n') == ()
    assert parse('# hi\nmove_right(); move_right()') == ((2, 'move_right'), (2, 'move_right'))
    r = Runner()
    r.load('')
    r.run()
    r.tick()
    assert r.status == 'done'
    assert r.world == World()
