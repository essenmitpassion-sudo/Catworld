import os
os.environ.setdefault('SDL_VIDEODRIVER', 'dummy')
os.environ.setdefault('SDL_AUDIODRIVER', 'dummy')
import pygame
import pytest
from neonpaw.ui.app import App
from neonpaw.core.world import World
from tests.test_recall import click, write, unlock, SOLUTION
from tests.test_drafts import document
from neonpaw.ui.drafts import save

ROOF_CODE = 'for _ in range(5):\n    move_right()\ncollect()'


@pytest.fixture
def app():
    pygame.init()
    app = App()
    unlock(app)
    yield app
    pygame.quit()


def test_roof_preserves_old_program_and_has_longer_goal(app):
    original = app.source
    click(app, 'Dach')
    assert app.roof_active and app.runner.world.battery_x == 6
    assert not app.roof_repetition_seen
    assert 'for ' not in app.source
    write(app, 'move_right()\n' * 3)
    click(app, 'Run')
    for _ in range(3):
        app.update(.5)
    assert app.roof_repetition_seen and not app.runner.world.powered
    click(app, 'Dach')
    assert app.source == original and not app.roof_active
    click(app, 'Dach')
    assert app.source == 'move_right()\n' * 3


def test_roof_loops_controls_and_visible_progress(app):
    click(app, 'Dach')
    app.draw()
    dark = pygame.image.tobytes(app.canvas, 'RGB')
    write(app, ROOF_CODE)
    click(app, 'Step')
    click(app, 'Step')
    assert app.runner.world.x == 3 and app.runner.line == 2
    click(app, 'Stop')
    app.update(5)
    assert app.runner.world.x == 3
    click(app, 'Run')
    for _ in range(6):
        app.update(.5)
    assert app.runner.world.powered and app.runner.pc == 6
    assert app.runner.line == 3
    app.draw()
    assert pygame.image.tobytes(app.canvas, 'RGB') != dark
    click(app, 'Reset')
    assert app.runner.world == World(battery_x=6)
    assert app.source == ROOF_CODE


def test_repeated_lines_are_a_valid_alternative(app):
    click(app, 'Dach')
    write(app, 'move_right()\n' * 5 + 'collect()')
    click(app, 'Run')
    for _ in range(6):
        app.update(.5)
    assert app.runner.world.powered


def test_roof_hints_never_insert_solution(app):
    click(app, 'Dach')
    original = app.source
    for _ in range(3):
        click(app, 'Hilfe')
    assert app.source == original
    write(app, 'move_right()\n' * 3)
    click(app, 'Run')
    for _ in range(3):
        app.update(.5)
    assert app.roof_repetition_seen and app.hint_level == 0
    original = app.source
    for _ in range(3):
        click(app, 'Hilfe')
    assert app.source == original and app.used_example


def test_existing_v1_drafts_and_all_three_texts_survive(tmp_path):
    pygame.init()
    path = tmp_path / 'drafts.json'
    state = document(SOLUTION)
    state['recall'] = '# Mein Abruf'
    save(path, state)
    app = App(save_path=path)
    assert app.source == SOLUTION
    click(app, 'Dach')
    write(app, ROOF_CODE)
    app.update(.5)
    restored = App(save_path=path)
    assert restored.roof_active and restored.source == ROOF_CODE
    assert restored.runner.status == 'idle'
    click(restored, 'Dach')
    assert restored.source == SOLUTION
    click(restored, 'Abruf')
    assert restored.source == '# Mein Abruf'
    pygame.quit()


def test_enter_and_tab_support_python_indentation(app):
    write(app, 'for _ in range(5):')
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_RETURN, mod=0))
    assert app.source.endswith(':\n    ')
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_TAB, mod=pygame.KMOD_SHIFT))
    assert app.source.endswith(':\n')
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_TAB, mod=0))
    assert app.source.endswith(':\n    ')
