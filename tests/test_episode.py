import os
os.environ.setdefault('SDL_VIDEODRIVER', 'dummy')
os.environ.setdefault('SDL_AUDIODRIVER', 'dummy')
import pygame
import pytest
from neonpaw.code.runner import Runner, ProgramError
from neonpaw.ui.app import App
from tests.test_recall import click, write, unlock, SOLUTION


@pytest.mark.parametrize('source, expected', [
    ('move_rigth()', 'Meintest du move_right()?'),
    ('collect(1)', 'keine Argumente'),
    ('move_right(x=1)', 'keine Argumente'),
    ('dance()', 'Unbekannter Befehl'),
])
def test_friendly_error_keeps_whole_program_unexecuted(source, expected):
    runner = Runner()
    with pytest.raises(ProgramError, match=expected.replace('?', r'\?').replace('(', r'\(').replace(')', r'\)')):
        runner.load('move_right()\n' + source)
    assert runner.world.x == 1 and runner.line == 2


def test_walk_animation_is_bounded_and_reset_snaps_to_start():
    pygame.init()
    app = App()
    click(app, 'Step')
    assert app.runner.world.x == 2
    app.update(.03)
    assert 1 < app.visual_x < 2
    app.update(.5)
    assert app.visual_x == 2
    assert app.runner.world.moves == 1
    click(app, 'Reset')
    app.draw()
    assert app.visual_x == 1
    pygame.quit()


def test_power_changes_alley_beyond_machine_and_reset_restores_it():
    pygame.init()
    app = App()
    lights = pygame.Rect(40, 355, 700, 45)
    app.draw()
    dark = pygame.image.tobytes(app.canvas.subsurface(lights), 'RGB')
    write(app, 'move_right()\ncollect()')
    click(app, 'Run')
    app.update(.5)
    app.update(.5)
    app.draw()
    assert pygame.image.tobytes(app.canvas.subsurface(lights), 'RGB') != dark
    click(app, 'Reset')
    app.draw()
    assert pygame.image.tobytes(app.canvas.subsurface(lights), 'RGB') == dark
    pygame.quit()


def test_complete_episode_shows_finish_and_honest_preview(monkeypatch):
    pygame.init()
    app = App()
    unlock(app)
    click(app, 'Abruf')
    write(app, SOLUTION)
    click(app, 'Run')
    for _ in range(3):
        app.update(.5)
    rendered = []
    original = app.text
    def record(value, *args, **kwargs):
        rendered.append(value)
        return original(value, *args, **kwargs)
    monkeypatch.setattr(app, 'text', record)
    app.draw()
    assert 'ABSCHNITT GESCHAFFT' in rendered
    assert any('Wiederholungen' in line for line in rendered)
    assert app.source == SOLUTION
    assert app.runner.world.powered
    pygame.quit()


def test_typo_is_fixed_by_real_editor_input_not_auto_replacement():
    pygame.init()
    app = App()
    write(app, 'move_rigth()')
    click(app, 'Run')
    assert 'Meintest du' in app.runner.error
    assert app.source == 'move_rigth()' and app.runner.world.x == 1
    write(app, 'move_right()')
    click(app, 'Run')
    app.update(.5)
    assert app.runner.world.x == 2 and not app.runner.error
    pygame.quit()
