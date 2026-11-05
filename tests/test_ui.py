import os
os.environ.setdefault('SDL_VIDEODRIVER', 'dummy')
os.environ.setdefault('SDL_AUDIODRIVER', 'dummy')
import pygame
from neonpaw.ui.app import App


def click(app, name):
    app.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=1,
                                  pos=app.buttons[name].center))


def test_actual_buttons_render_and_editor_recovery(tmp_path):
    pygame.init()
    app = App()
    app.draw()
    before = pygame.image.tobytes(app.canvas, 'RGB')
    click(app, 'Run')
    app.update(0.6)
    app.draw()
    assert app.runner.world.x == 2
    assert app.runner.line == 1
    assert before != pygame.image.tobytes(app.canvas, 'RGB')
    click(app, 'Reset')
    assert app.runner.world.x == 1
    app.source = 'move_right()\nmove_right()'
    click(app, 'Step')
    assert app.runner.world.x == 2
    assert app.runner.status == 'paused'
    click(app, 'Run')
    click(app, 'Stop')
    app.update(10)
    assert app.runner.world.x == 2
    click(app, 'Reset')
    assert app.source == 'move_right()\nmove_right()'
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
    app.handle(pygame.event.Event(pygame.TEXTINPUT, text='bad()'))
    click(app, 'Run')
    assert app.runner.status == 'error'
    assert 'Zeile 1' in app.runner.error
    assert app.runner.world.x == 1
    app.draw()
    pygame.image.save(app.canvas, str(tmp_path / 'error.png'))
    pygame.quit()


def test_reset_cancels_scheduled_actions():
    pygame.init()
    app = App()
    app.source = 'move_right()\nmove_right()'
    click(app, 'Run')
    click(app, 'Reset')
    app.update(5)
    assert app.runner.world.x == 1
    assert app.runner.status == 'idle'
    pygame.quit()


def test_edit_after_execution_keeps_cursor_visible():
    pygame.init()
    app = App()
    click(app, 'Run')
    app.update(.5)
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
    app.handle(pygame.event.Event(pygame.TEXTINPUT, text='# note\n' * 20 + 'move_right()'))
    app.draw()
    assert app.runner.line is None
    assert app.scroll >= 11
    pygame.quit()


def test_collect_loop_changes_machine_and_reset_restores_it():
    pygame.init()
    app = App()
    initial_code = app.source
    app.draw()
    machine = pygame.Rect(470, 400, 120, 145)
    dark = pygame.image.tobytes(app.canvas.subsurface(machine), 'RGB')
    click(app, 'Run')
    app.update(.5)
    assert app.runner.world.x == 2
    assert app.source == initial_code  # Tutorial never writes the answer.
    app.handle(pygame.event.Event(pygame.TEXTINPUT, text='\ncollect()'))
    click(app, 'Reset')
    click(app, 'Run')
    app.update(.5)
    assert not app.runner.world.powered
    app.update(.5)
    assert app.runner.world.powered
    assert app.runner.line == 2
    app.draw()
    lit = pygame.image.tobytes(app.canvas.subsurface(machine), 'RGB')
    assert lit != dark  # Visible world response, not merely a status string.
    click(app, 'Reset')
    app.draw()
    assert not app.runner.world.powered
    assert pygame.image.tobytes(app.canvas.subsurface(machine), 'RGB') == dark
    assert app.source == 'move_right()\ncollect()'
    pygame.quit()
