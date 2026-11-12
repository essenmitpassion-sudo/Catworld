import pygame
import pytest
from tests.test_recall import click, write
from tests.test_workshop_ui import app, enter
from tests.test_gate_condition import ADAPTIVE_PLAN


@pytest.mark.parametrize('opened', [False, True])
def test_same_code_solves_both_variants_and_shows_condition_outcome(app, opened, monkeypatch):
    enter(app)
    if opened:
        app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F11, mod=0))
    write(app, ADAPTIVE_PLAN)
    for _ in range(3): click(app, 'Step')
    rendered = []
    original = app.text
    def record(value, *args, **kwargs):
        rendered.append(value)
        return original(value, *args, **kwargs)
    monkeypatch.setattr(app, 'text', record)
    app.draw()
    assert any(f"if Z3: {'nein' if opened else 'ja'}" in text for text in rendered)
    click(app, 'Run')
    for _ in range(8): app.update(.5)
    assert app.runner.world.powered and app.source == ADAPTIVE_PLAN
    assert app.runner.status == 'done'


def test_requested_example_teaches_a_plan_that_works_for_both_starts(app):
    enter(app)
    for _ in range(3): click(app, 'Hilfe')
    example = '\n'.join(app.hint_lines())
    assert 'if not gate_open():' in example
    assert app.source == ''  # Help never inserts the example.
    write(app, example)
    for _ in range(2):
        click(app, 'Run')
        for _ in range(10): app.update(.5)
        assert app.runner.world.powered and app.runner.status == 'done'
        app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F11, mod=0))
    assert app.source == example


@pytest.mark.parametrize('edit', ['write', 'undo'])
def test_editing_invalidates_condition_feedback_from_previous_program(app, edit, monkeypatch):
    enter(app)
    write(app, 'move_right()')
    write(app, ADAPTIVE_PLAN)
    for _ in range(3): click(app, 'Step')
    assert app.runner.condition_result is not None
    if edit == 'undo':
        app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_z, mod=pygame.KMOD_CTRL))
    else:
        write(app, 'move_left()')
    rendered = []
    original = app.text
    def record(value, *args, **kwargs):
        rendered.append(value)
        return original(value, *args, **kwargs)
    monkeypatch.setattr(app, 'text', record)
    app.draw()
    assert not any(text.startswith('if Z') for text in rendered)
    assert app.runner.condition_result is None
    assert app.runner.status == 'stopped' and app.runner.world.x == 3


def test_counter_before_condition_counts_world_actions_not_internal_checks(app, monkeypatch):
    enter(app)
    write(app, 'move_right()\nif gate_open():\n    move_right()')
    click(app, 'Step')
    rendered = []
    original = app.text
    def record(value, *args, **kwargs):
        rendered.append(value)
        return original(value, *args, **kwargs)
    monkeypatch.setattr(app, 'text', record)
    app.draw()
    assert any('Aktionen: 1 · maximal 2' in text for text in rendered)
