"""A fresh attempt must replay a plan, not accidentally accumulate world state."""
import os
os.environ.setdefault('SDL_VIDEODRIVER', 'dummy')
os.environ.setdefault('SDL_AUDIODRIVER', 'dummy')
import pygame
import pytest
from neonpaw.ui.app import App
from tests.test_ui import click

SOLUTION = 'move_right()\ncollect()'


@pytest.fixture
def app():
    pygame.init()
    instance = App()
    yield instance
    pygame.quit()


def attempt(app, control, steps):
    if control == 'Run':
        click(app, 'Run')
        for _ in range(steps):
            app.update(.5)
    else:
        for _ in range(steps):
            click(app, 'Step')


@pytest.mark.parametrize('control', ['Run', 'Step'])
def test_completed_intro_solution_is_repeatable(app, control):
    app.change_text(SOLUTION, len(SOLUTION))
    history = list(app.edit_histories['original'][0])
    for _ in range(2):
        attempt(app, control, 2)
        assert app.runner.status == 'done', app.runner.error
        assert app.runner.world.powered
        assert app.runner.world.x == 2 and app.runner.world.moves == 1
    assert app.source == SOLUTION and app.cursor == len(SOLUTION)
    assert app.edit_histories['original'][0] == history


@pytest.mark.parametrize('control', ['Run', 'Step'])
def test_stop_keeps_position_until_a_fresh_attempt(app, control):
    app.source = SOLUTION
    click(app, 'Step')
    click(app, 'Stop')
    app.update(5)
    assert app.runner.world.x == 2 and not app.runner.world.powered
    attempt(app, control, 2)
    assert app.runner.status == 'done', app.runner.error
    assert app.runner.world.powered and app.runner.world.moves == 1


def test_adding_collect_after_first_step_needs_no_manual_reset(app):
    click(app, 'Run')
    app.update(.5)
    app.handle(pygame.event.Event(pygame.TEXTINPUT, text='\ncollect()'))
    assert app.runner.world.x == 2  # Editing itself does not rewind the world.
    attempt(app, 'Run', 2)
    assert app.runner.world.powered and app.runner.status == 'done'
    assert app.source == SOLUTION


@pytest.mark.parametrize('control', ['Run', 'Step'])
def test_failed_intro_plan_replays_the_same_error(app, control):
    app.source = 'move_right()\nmove_right()\ncollect()'
    for _ in range(2):
        attempt(app, control, 3)
        assert app.runner.status == 'error' and app.runner.line == 3
        assert app.runner.world.x == 3 and app.runner.world.moves == 2
        assert not app.runner.world.powered


def test_paused_or_running_intro_plan_continues_instead_of_restarting(app):
    app.source = SOLUTION
    click(app, 'Step')
    assert app.runner.pc == 1 and app.runner.status == 'paused'
    click(app, 'Run')
    click(app, 'Run')
    app.update(.5)
    assert app.runner.status == 'done' and app.runner.world.powered
    assert app.runner.world.moves == 1


@pytest.mark.parametrize('source, status', [('move_rigth()', 'error'), ('', 'done')])
def test_invalid_or_empty_new_program_does_not_keep_old_success(app, source, status):
    app.source = SOLUTION
    attempt(app, 'Run', 2)
    assert app.runner.world.powered
    app.change_text(source, len(source))
    click(app, 'Run')
    assert app.runner.status == status
    assert app.runner.world.x == 1 and not app.runner.world.powered
    assert app.source == source
