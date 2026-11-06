"""Exercise the real SDL event queue and renderer; no physical-display claim.
Run from the repository: SDL_VIDEODRIVER=offscreen SDL_AUDIODRIVER=dummy
    .venv/bin/python -m tests.smoke_app
"""
import pygame
from pathlib import Path
from tempfile import TemporaryDirectory
from neonpaw.ui.app import App

pygame.init()
storage = TemporaryDirectory(prefix='neonpaw-smoke-')
save_path = Path(storage.name) / 'drafts.json'
app = App(save_path=save_path)

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
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text='move_rigth()'))
click('Run')
assert 'Meintest du move_right()?' in app.runner.error
assert app.source == 'move_rigth()' and app.runner.world.x == 1
pygame.image.save(app.canvas, 'evidence/episode-typo.png')
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text='move_right()'))
click('Reset')
click('Run')
frame(dt=.5)
assert app.runner.world.x == 2
pygame.image.save(app.canvas, 'evidence/current-after.png')
click('Reset')
pygame.image.save(app.canvas, 'evidence/current-before.png')
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
frame(pygame.event.Event(pygame.TEXTINPUT, text='move_right()\ncollect()'))
click('Run')
frame(dt=.5)
assert not app.runner.world.powered
pygame.image.save(app.canvas, 'evidence/g1-battery.png')
frame(dt=.5)
assert app.runner.world.powered and app.runner.line == 2
pygame.image.save(app.canvas, 'evidence/g1-powered.png')
# Transfer preserves authored code; unchanged programs cannot accumulate movement.
old_code = app.source
click('Transfer')
assert app.source == old_code and app.runner.world.battery_x == 3
assert app.hint_level == 0
pygame.image.save(app.canvas, 'evidence/transfer-start.png')
for _ in range(2):
    click('Run')
    frame(dt=.5)
    frame(dt=.5)
    assert not app.runner.world.powered and app.runner.world.x == 2
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text='move_right()\nmove_right()\ncollect()'))
click('Run')
for _ in range(3):
    frame(dt=.5)
assert app.runner.world.powered and not app.used_example
pygame.image.save(app.canvas, 'evidence/transfer-solved.png')
# A voluntary recall attempt starts blank without destroying either draft.
original_program = app.source
click('Abruf')
assert app.recall_active and app.source == ''
pygame.image.save(app.canvas, 'evidence/recall-empty.png')
click('Run')
frame(dt=.5)
assert not app.runner.world.powered
frame(pygame.event.Event(pygame.TEXTINPUT, text='move_right()'))
click('Abruf')
assert app.source == original_program and not app.recall_active
click('Abruf')
assert app.source == 'move_right()'
frame(pygame.event.Event(pygame.TEXTINPUT, text='\nmove_right()\ncollect()'))
click('Step')
assert app.runner.world.x == 2
click('Stop')
frame(dt=2)
assert not app.runner.world.powered
click('Run')
for _ in range(3):
    frame(dt=.5)
assert app.runner.world.powered
pygame.image.save(app.canvas, 'evidence/recall-solved.png')
# Rooftop: experience repetition first; write a loop without automatic solution insertion.
protected_program = app.source
click('Dach')
assert app.roof_active and app.runner.world.battery_x == 6
assert not app.roof_repetition_seen
pygame.image.save(app.canvas, 'evidence/roof-start.png')
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text='move_right()\n' * 3))
click('Run')
for _ in range(3):
    frame(dt=.5)
assert app.roof_repetition_seen and not app.runner.world.powered
pygame.image.save(app.canvas, 'evidence/roof-repetition.png')
click('Hilfe')
click('Hilfe')
assert app.source == 'move_right()\n' * 3
pygame.image.save(app.canvas, 'evidence/roof-hint.png')
click('Hilfe')
click('Hilfe')
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text='for _ in range(5):\n    move_right()\ncollect()'))
roof_program = app.source
click('Step')
click('Step')
assert app.runner.world.x == 3 and app.runner.line == 2
click('Stop')
frame(dt=2)
assert app.runner.world.x == 3
click('Run')
for _ in range(6):
    frame(dt=.5)
assert app.runner.world.powered and app.runner.world.x == 6 and app.runner.line == 3
pygame.image.save(app.canvas, 'evidence/roof-solved.png')
app = App(save_path=save_path)
frame()
assert app.roof_active and app.source == roof_program and app.runner.status == 'idle'
assert app.runner.world.battery_x == 6 and not app.runner.world.powered
click('Dach')
assert app.source == protected_program and app.recall_active

# Recreate the real app with the saved file: texts return, world never autoruns.
app = App(save_path=save_path)
frame()
assert app.recall_active and app.source == original_program
assert app.runner.status == 'idle' and not app.runner.world.powered
pygame.image.save(app.canvas, 'evidence/drafts-restored.png')
click('Abruf')
assert app.source == original_program
click('Abruf')

click('Reset')
assert app.source == original_program and not app.runner.world.powered
for _ in range(3):
    click('Hilfe')
assert app.used_example and app.source == original_program
click('Abruf')
assert app.source == original_program and not app.used_example

click('Reset')
assert app.runner.world.battery_x == 3 and not app.runner.world.powered
preserved = app.source
for level in (1, 2, 3):
    click('Hilfe')
    assert app.hint_level == level and app.source == preserved
    pygame.image.save(app.canvas, f'evidence/transfer-hint-{level}.png')
assert app.used_example
click('Hilfe')
click('Transfer')
assert app.runner.world.battery_x == 2

click('Reset')
assert not app.runner.world.powered and app.runner.world.x == 1
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text='collect()'))
click('Step')
assert app.runner.status == 'error' and 'Batterie' in app.runner.error
pygame.image.save(app.canvas, 'evidence/g1-world-error.png')
click('Reset')
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text='import os'))
click('Run')
assert app.runner.status == 'error' and app.runner.world.x == 1
pygame.image.save(app.canvas, 'evidence/current-error.png')
frame(pygame.event.Event(pygame.QUIT))
assert not app.alive
print('PASS: SDL queue -> own typo correction -> editor -> Run/Step/Stop/Reset -> collect -> transfer -> unchanged-code refusal -> user edit -> power -> blank recall -> draft restoration -> recall solution -> roof repetition -> optional loop -> Step/Stop -> roof success -> all drafts restored -> disk save/restart -> optional hints -> reset -> errors -> quit')
print('Video driver:', pygame.display.get_driver())
print('Physical desktop interaction / human usability: NOT_TESTED')
pygame.quit()
storage.cleanup()
