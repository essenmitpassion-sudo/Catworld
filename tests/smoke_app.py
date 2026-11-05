"""Exercise the real SDL event queue and renderer; no physical-display claim.
Run from the repository: SDL_VIDEODRIVER=offscreen SDL_AUDIODRIVER=dummy
    .venv/bin/python -m tests.smoke_app
"""
import pygame
from neonpaw.ui.app import App

pygame.init()
app = App()

def frame(event=None, dt=0):
    if event:
        pygame.event.post(event)
    for item in pygame.event.get():
        app.handle(item)
    app.update(dt)
    app.draw()


def click(name):
    frame(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=1,
                            pos=app.buttons[name].center))

frame()
assert app.runner.world.x == 1
click('Run')
frame(dt=.5)
assert app.runner.world.x == 2
pygame.image.save(app.canvas, 'evidence/g0-after.png')
click('Reset')
pygame.image.save(app.canvas, 'evidence/g0-before.png')
assert app.runner.world.x == 1
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text='move_right()\nmove_right()'))
click('Step')
assert app.runner.world.x == 2
click('Run')
click('Stop')
frame(dt=2)
assert app.runner.world.x == 2
click('Reset')
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text='import os'))
click('Run')
assert app.runner.status == 'error' and app.runner.world.x == 1
pygame.image.save(app.canvas, 'evidence/g0-error.png')
frame(pygame.event.Event(pygame.QUIT))
assert not app.alive
print('PASS: SDL queue -> editor -> Run/Step/Stop/Reset -> rendering -> error -> quit')
print('Video driver:', pygame.display.get_driver())
print('Physical desktop interaction / human usability: NOT_TESTED')
pygame.quit()
