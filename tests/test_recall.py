import os
os.environ.setdefault('SDL_VIDEODRIVER', 'dummy')
os.environ.setdefault('SDL_AUDIODRIVER', 'dummy')
import pygame
import pytest
from neonpaw.ui.app import App
from neonpaw.core.world import World

SOLUTION = '# Mein eigener Weg\nmove_right()\nmove_right()\ncollect()'


def click(app, name):
    app.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=1,
                                  pos=app.buttons[name].center))


def write(app, text):
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
    app.handle(pygame.event.Event(pygame.TEXTINPUT, text=text))


@pytest.fixture
def app():
    pygame.init()
    instance = App()
    yield instance
    pygame.quit()


def unlock(app):
    click(app, 'Transfer')
    write(app, SOLUTION)
    for _ in range(3):
        click(app, 'Step')
    assert app.runner.world.powered


def test_recall_is_optional_and_only_unlocked_after_transfer(app):
    original = app.source
    click(app, 'Abruf')
    assert app.source == original and not app.recall_active
    unlock(app)
    assert app.source == SOLUTION and not app.recall_active
    click(app, 'Abruf')
    assert app.recall_active and app.source == '' and app.cursor == 0
    assert app.runner.world == World(battery_x=3)
    click(app, 'Run')
    app.update(1)
    assert not app.runner.world.powered


def test_both_drafts_survive_return_and_reset(app):
    unlock(app)
    original_cursor = app.cursor
    click(app, 'Abruf')
    write(app, 'move_right()\n')
    click(app, 'Reset')
    assert app.source == 'move_right()\n'
    click(app, 'Abruf')
    assert app.source == SOLUTION and app.cursor == original_cursor
    click(app, 'Abruf')
    assert app.source == 'move_right()\n'
    click(app, 'Transfer')  # Return to protected original, no accidental discard.
    assert not app.recall_active and app.source == SOLUTION
    assert app.scenario == 1


def test_written_recall_solution_works_with_same_controls(app):
    unlock(app)
    click(app, 'Abruf')
    write(app, SOLUTION)
    click(app, 'Step')
    assert app.runner.world.x == 2
    click(app, 'Stop')
    app.update(5)
    assert app.runner.world.x == 2 and not app.runner.world.powered
    click(app, 'Run')
    for _ in range(3):
        app.update(.5)
    assert app.runner.world.powered
    app.draw()
    click(app, 'Reset')
    assert app.runner.world == World(battery_x=3)
    assert app.source == SOLUTION


def test_hints_never_overwrite_original_or_recall_draft(app):
    unlock(app)
    click(app, 'Abruf')
    for _ in range(3):
        click(app, 'Hilfe')
    assert app.used_example and app.source == ''
    click(app, 'Abruf')
    assert app.source == SOLUTION and not app.used_example
    click(app, 'Abruf')
    assert app.used_example and app.source == ''
    click(app, 'Reset')
    assert app.used_example


def test_return_cancels_pending_recall_execution(app):
    unlock(app)
    click(app, 'Abruf')
    write(app, SOLUTION)
    click(app, 'Run')
    app.update(.5)
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F4, mod=0))
    app.update(5)
    assert not app.recall_active and app.source == SOLUTION
    assert app.runner.world == World(battery_x=3)
