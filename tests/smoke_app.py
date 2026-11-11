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
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text='# ' + 'weiter ' * 20))
assert app.horizontal_scroll > 0
pygame.image.save(app.canvas, 'evidence/editor-long-line.png')
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_HOME, mod=0))
assert app.horizontal_scroll == 0
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_END, mod=0))
assert app.horizontal_scroll > 0
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_z, mod=pygame.KMOD_CTRL))
assert app.source == 'move_right()' and app.horizontal_scroll == 0
assert app.runner.world.x == 1
# A complete detour is a valid own plan, not a forced Reset.
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text='for _ in range(3):\n    move_right()\nfor _ in range(2):\n    move_left()\ncollect()'))
for _ in range(3):
    click('Step')
assert app.runner.world.x == 4
click('Step')
assert app.runner.world.x == 3 and app.runner.line == 4
frame(dt=.5)
pygame.image.save(app.canvas, 'evidence/backtracking-step.png')
click('Stop')
frame(dt=2)
assert app.runner.world.x == 3
click('Reset')
click('Run')
for _ in range(6):
    frame(dt=.5)
assert app.runner.world.x == 2 and app.runner.world.powered
pygame.image.save(app.canvas, 'evidence/backtracking-solved.png')
click('Reset')
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
# Replay the same successful intro plan without requiring manual Reset.
click('Run')
assert app.runner.world.x == 1 and not app.runner.world.powered
frame(dt=.5)
frame(dt=.5)
assert app.runner.world.powered and app.runner.status == 'done'
assert app.runner.world.moves == 1
pygame.image.save(app.canvas, 'evidence/restart-replayed.png')
# Goal reached is not the same as a fully successful program.
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text='move_right()\ncollect()\ncollect()'))
click('Reset'); click('Run')
for _ in range(3):
    frame(dt=.5)
assert app.runner.world.powered and app.runner.status == 'error'
pygame.image.save(app.canvas, 'evidence/goal-with-program-error.png')
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text='move_right()\ncollect()'))
click('Reset'); click('Run')
frame(dt=.5); frame(dt=.5)
assert app.runner.world.powered and not app.runner.error
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
assert app.runner.line_progress == (2,2,5)
pygame.image.save(app.canvas, 'evidence/loop-progress.png')
click('Stop')
frame(dt=2)
assert app.runner.world.x == 3
click('Run')
for _ in range(6):
    frame(dt=.5)
assert app.runner.world.powered and app.runner.world.x == 6 and app.runner.line == 3
pygame.image.save(app.canvas, 'evidence/roof-solved.png')
# Roof transfer: unchanged old plan must fail, own edit succeeds, both drafts survive.
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F8, mod=0))
assert app.roof_transfer_active and app.runner.world.battery_x == 8
assert app.source == roof_program
pygame.image.save(app.canvas, 'evidence/roof-transfer-start.png')
for attempt in range(2):
    click('Run')
    for _ in range(6):
        frame(dt=.5)
    assert app.runner.error and app.runner.world.x == 6 and not app.runner.world.powered
pygame.image.save(app.canvas, 'evidence/roof-transfer-error.png')
click('Hilfe')
assert app.source == roof_program
click('Hilfe')
assert app.source == roof_program
pygame.image.save(app.canvas, 'evidence/roof-transfer-hint.png')
# Write the correction while the optional second hint remains visible.
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text='for _ in range(7):\n    move_right()\ncollect()'))
transfer_program = app.source
click('Step')
click('Step')
assert app.runner.world.x == 3
click('Stop')
frame(dt=2)
assert app.runner.world.x == 3
click('Reset')
assert app.runner.world.x == 1 and app.source == transfer_program
click('Run')
for _ in range(8):
    frame(dt=.5)
assert app.runner.world.powered and not app.used_example
app = App(save_path=save_path)
frame()
assert app.roof_transfer_active and app.source == transfer_program
assert app.runner.status == 'idle' and not app.runner.world.powered
click('Run')
for _ in range(8):
    frame(dt=.5)
pygame.image.save(app.canvas, 'evidence/roof-transfer-solved.png')
# Two lanterns: own program, visible partial success, pause/resume and disk recovery.
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F9, mod=0))
assert app.pair_active and app.source == ''
pygame.image.save(app.canvas, 'evidence/pair-start.png')
frame(pygame.event.Event(pygame.TEXTINPUT, text='for _ in range(2):\n    move_right()\n    move_right()\n    move_right()\n    collect()'))
pair_program = app.source
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text='versehentlich ersetzt'))
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_z, mod=pygame.KMOD_CTRL))
assert app.source == pair_program
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_y, mod=pygame.KMOD_CTRL))
assert app.source == 'versehentlich ersetzt'
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_z, mod=pygame.KMOD_CTRL))
click('Laternenpaar')
assert app.source == transfer_program
click('Laternenpaar')
assert app.source == pair_program
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_s, mod=pygame.KMOD_CTRL))
for _ in range(4):
    click('Step')
assert app.runner.world.first_lit and not app.runner.world.powered
pygame.image.save(app.canvas, 'evidence/pair-first.png')
click('Stop')
frame(dt=2)
assert app.runner.world.x == 4
click('Reset')
assert not app.runner.world.first_lit and app.source == pair_program
for _ in range(4):
    click('Step')
click('Run')
for _ in range(4):
    frame(dt=.5)
assert app.runner.world.powered
pygame.image.save(app.canvas, 'evidence/pair-solved.png')
# Optional homecoming extends the authored plan; it never replaces it automatically.
pair_program += '\nfor _ in range(6):\n    move_left()'
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text=pair_program))
click('Run')
for _ in range(14):
    frame(dt=.5)
assert app.homecoming_complete() and app.runner.world.first_lit
pygame.image.save(app.canvas, 'evidence/homecoming.png')
# A different player route: far lantern first, then near lantern, then home.
pair_program = 'for _ in range(6):\n    move_right()\ncollect()\nfor _ in range(3):\n    move_left()\ncollect()\nfor _ in range(3):\n    move_left()'
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text=pair_program))
click('Run')
for _ in range(7):
    frame(dt=.5)
assert app.runner.world.second_lit and not app.runner.world.first_lit
assert not app.runner.world.powered
pygame.image.save(app.canvas, 'evidence/far-lantern-first.png')
for _ in range(7):
    frame(dt=.5)
assert app.homecoming_complete()
# Workshop: a new world interaction, not another longer walking route.
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F10, mod=0))
assert app.workshop_active and app.source == ''
pygame.image.save(app.canvas, 'evidence/workshop-start.png')
frame(pygame.event.Event(pygame.TEXTINPUT, text='move_right()\n'*4))
for _ in range(4): click('Step')
assert app.runner.status == 'error' and app.runner.world.x == 4
pygame.image.save(app.canvas, 'evidence/workshop-blocked.png')
workshop_code = 'for _ in range(2):\n    move_right()\ntoggle()\nfor _ in range(4):\n    move_right()\ncollect()'
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text=workshop_code))
for _ in range(3): click('Step')
assert app.runner.world.gate_open and app.runner.world.x == 3
frame(dt=.5)
pygame.image.save(app.canvas, 'evidence/workshop-open.png')
click('Stop'); frame(dt=2)
assert app.runner.world.gate_open and app.runner.world.x == 3
click('Run')
for _ in range(8): frame(dt=.5)
assert app.runner.world.powered and app.runner.status == 'done'
assert not app.workshop_secured()
workshop_code += '\nfor _ in range(4):\n    move_left()\ntoggle()\nfor _ in range(2):\n    move_left()'
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text=workshop_code))
click('Run')
for _ in range(15): frame(dt=.5)
assert app.workshop_secured()
pygame.image.save(app.canvas, 'evidence/workshop-secured.png')
for _ in range(3): click('Hilfe')
assert app.source == workshop_code and app.used_example
pygame.image.save(app.canvas, 'evidence/workshop-hint.png')
app = App(save_path=save_path)
frame()
assert app.workshop_active and app.source == workshop_code and app.used_example
assert app.runner.status == 'idle' and not app.runner.world.gate_open
click('Werkstatt')
assert app.source == pair_program and not app.workshop_active
click('Werkstatt')
assert app.source == workshop_code
click('Werkstatt')
app = App(save_path=save_path)
frame()
assert app.pair_active and app.source == pair_program
assert app.runner.status == 'idle' and not app.runner.world.first_lit
click('Laternenpaar')
assert app.source == transfer_program
click('Dachtransfer')
assert app.source == roof_program and app.runner.world.battery_x == 6
click('Dachtransfer')
assert app.source == transfer_program
click('Dachtransfer')
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
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
frame(pygame.event.Event(pygame.TEXTINPUT, text='oops()\n' + '# eigener Plan\n' * 20))
click('Run')
assert app.runner.error and app.scroll == 0
frame(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_HOME, mod=0))
assert app.scroll > 0 and app.runner.error
first_visible = app.scroll
frame(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=1, pos=(850,212)))
assert app.source[:app.cursor].count('\n') == first_visible
pygame.image.save(app.canvas, 'evidence/error-editor-focus.png')
frame(pygame.event.Event(pygame.QUIT))
assert not app.alive
print('PASS: SDL queue -> long-line undo -> backtracking/Stop/Reset -> own typo correction -> editor -> Run/Step/Stop/Reset -> collect -> late-error correction -> transfer -> unchanged-code refusal -> user edit -> power -> blank recall -> draft restoration -> recall solution -> roof repetition -> optional loop -> Step/Stop -> roof success -> roof transfer refusal -> own loop correction -> transfer restart -> undo/redo across editor switch -> two lanterns partial/complete -> optional homecoming -> far-first alternative -> pair restart -> all drafts restored -> disk save/restart -> optional hints -> reset -> errors -> editor focus recovery -> quit')
print('Video driver:', pygame.display.get_driver())
print('PASS: workshop gate error -> own toggle plan -> Stop/Run -> power -> optional secure home -> hints -> six drafts saved/restored')
print('Physical desktop interaction / human usability: NOT_TESTED')
pygame.quit()
storage.cleanup()
