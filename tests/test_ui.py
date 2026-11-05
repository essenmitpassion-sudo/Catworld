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
