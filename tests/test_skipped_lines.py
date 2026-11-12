import pygame
import pytest
from neonpaw.code.runner import Runner
from neonpaw.core.world import World
from neonpaw.ui.app import CYAN, MUTED
from tests.test_recall import click, write
from tests.test_workshop_ui import app, enter
from tests.test_gate_condition import ADAPTIVE_PLAN


def test_only_unexecuted_separate_action_lines_are_marked_and_trace_resets():
    r = Runner(initial_world=World(gate_x=5, switch_x=3))
    r.load('if gate_open():\n    toggle()\n    move_left()\nmove_right()')
    r.step()
    assert r.skipped_lines == {2, 3}
    assert r.world.x == 2 and r.executed_steps == 1
    r.load('move_right()')
    assert r.skipped_lines == set()
    r.load('if gate_open():\n    toggle()')
    r.step()
    assert r.skipped_lines == {2}
    r.reset()
    assert r.skipped_lines == set()


def test_inline_condition_is_not_dimmed_as_if_it_had_never_been_evaluated():
    r = Runner(initial_world=World(gate_x=5, switch_x=3))
    r.load('if gate_open(): toggle()')
    r.step()
    assert r.condition_result == (1, False, False) and r.executed_steps == 0
    assert r.skipped_lines == set()


@pytest.mark.parametrize('opened', [False, True])
def test_skipped_toggle_has_a_distinct_rendered_style_without_changing_code(app, opened, monkeypatch):
    enter(app)
    if opened:
        app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F11, mod=0))
    write(app, ADAPTIVE_PLAN)
    for _ in range(3): click(app, 'Step')
    rendered = []
    original = app.text
    def record(value, pos, color='#e5eafa', font=None):
        rendered.append((value, pos, color))
        return original(value, pos, color, font)
    monkeypatch.setattr(app, 'text', record)
    app.draw()
    color = MUTED if opened else CYAN
    assert ('    toggle()', (830, 303), color) in rendered
    assert app.source == ADAPTIVE_PLAN
    assert app.runner.skipped_lines == ({4} if opened else set())


@pytest.mark.parametrize('edit', ['write', 'undo'])
def test_edit_and_undo_clear_skipped_line_history(app, edit):
    enter(app)
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F11, mod=0))
    write(app, 'move_right()')
    write(app, ADAPTIVE_PLAN)
    for _ in range(3): click(app, 'Step')
    assert app.runner.skipped_lines == {4}
    if edit == 'undo':
        app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_z, mod=pygame.KMOD_CTRL))
    else:
        write(app, 'move_left()')
    assert app.runner.skipped_lines == set()
    assert app.runner.world.x == 4 and app.runner.status == 'stopped'
