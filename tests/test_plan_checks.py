import pygame
import pytest
from tests.test_gate_condition import ADAPTIVE_PLAN
from tests.test_workshop import LOOP_PLAN
from tests.test_recall import click, write
from tests.test_workshop_ui import app, enter


def checks(source):
    from neonpaw.code.checks import check_workshop
    return check_workshop(source)


def test_check_distinguishes_one_state_solution_from_robust_solution():
    ordinary = checks(LOOP_PLAN)
    assert [(r.start_open, r.success) for r in ordinary] == [(False, True), (True, False)]
    assert ordinary[1].line == 5 and 'Tor' in ordinary[1].message
    adaptive = checks(ADAPTIVE_PLAN)
    assert [r.success for r in adaptive] == [True, True]
    assert [r.actions for r in adaptive] == [8, 7]


@pytest.mark.parametrize('source', ['', 'import os', ADAPTIVE_PLAN + '\ncollect()'])
def test_empty_invalid_and_late_error_programs_are_not_certified_as_success(source):
    result = checks(source)
    assert len(result) == 2 and not any(r.success for r in result)
    assert all(r.message for r in result)


def test_comparison_is_deterministic_and_keeps_the_current_attempt_and_code(app):
    enter(app)
    write(app, ADAPTIVE_PLAN)
    click(app, 'Run'); app.update(.5)
    before = app.runner.world
    snapshot = app.draft_snapshot()
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F12, mod=0))
    assert getattr(app, 'plan_results', None) is not None
    assert all(r.success for r in app.plan_results)
    assert app.runner.world == before and app.runner.status == 'paused'
    assert app.source == ADAPTIVE_PLAN and app.draft_snapshot() == snapshot
    app.update(5)
    assert app.runner.world == before
    app.draw()
    assert app.world_display_rect().top > 170
    click(app, 'Run')
    for _ in range(8): app.update(.5)
    assert app.runner.world.powered and app.plan_results is None


@pytest.mark.parametrize('edit', ['write', 'undo'])
def test_comparison_never_survives_a_different_program(app, edit):
    enter(app)
    write(app, LOOP_PLAN); write(app, ADAPTIVE_PLAN)
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F12, mod=0))
    assert getattr(app, 'plan_results', None)
    if edit == 'undo':
        app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_z, mod=pygame.KMOD_CTRL))
    else:
        write(app, 'move_right()')
    assert app.plan_results is None


def test_comparison_control_and_help_do_not_leak_outside_workshop(app):
    assert 'Pruefen' not in app.visible_buttons()
    before = app.runner.world
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F12, mod=0))
    assert app.runner.world == before
    enter(app)
    write(app, LOOP_PLAN)
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F12, mod=0))
    assert getattr(app, 'plan_results', None)
    click(app, 'Hilfe')
    assert app.plan_results is None and app.hint_level == 1
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F12, mod=0))
    assert app.hint_level == 0
    click(app, 'Werkstatt')
    assert app.plan_results is None and 'Pruefen' not in app.visible_buttons()
