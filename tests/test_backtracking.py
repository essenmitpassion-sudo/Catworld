import os
os.environ.setdefault('SDL_VIDEODRIVER','dummy')
os.environ.setdefault('SDL_AUDIODRIVER','dummy')
import pygame
import pytest
from neonpaw.core.world import World,transition
from neonpaw.code.runner import Runner,ProgramError
from neonpaw.ui.app import App
from tests.test_recall import write,click,unlock


def test_overshoot_can_be_corrected_in_one_program():
    r=Runner(initial_world=World(battery_x=3))
    r.load('for _ in range(3):\n    move_right()\nmove_left()\ncollect()')
    r.run()
    for _ in range(5):r.tick()
    assert r.world.x==3 and r.world.moves==4 and r.world.powered


def test_left_boundary_and_stop_reset():
    r=Runner()
    r.load('move_left()\nmove_left()');r.step()
    assert r.world.x==0
    r.stop();r.tick()
    assert r.world.x==0
    r.reset();assert r.world.x==1
    r.load('move_left()\nmove_left()');r.run();r.tick();r.tick()
    assert r.status=='error' and r.world.x==0 and 'linke' in r.error


@pytest.mark.parametrize('source', ['move_left(1)','move_left(x=1)','for move_left in range(2):\n    move_right()', 'for _ in range(64):\n    move_left()\n    move_right()'])
def test_new_action_preserves_allowlist_and_budgets(source):
    with pytest.raises(ProgramError):Runner().load(source)


def test_left_then_right_is_position_reversible():
    w=World(x=4,battery_x=6)
    result=transition(transition(w,'move_left'),'move_right')
    assert result.x==w.x and result.moves==2 and not result.powered


def test_ui_shows_backtrack_hint_without_editing_program(monkeypatch):
    pygame.init()
    app=App();unlock(app);click(app,'Dach')
    source='for _ in range(6):\n    move_right()'
    write(app,source);click(app,'Run')
    for _ in range(6):app.update(.5)
    rendered=[];original=app.text
    def record(value,*args,**kwargs):
        rendered.append(value);return original(value,*args,**kwargs)
    monkeypatch.setattr(app,'text',record)
    app.draw()
    assert any('move_left()' in text for text in rendered)
    assert app.source==source
    write(app,source+'\nmove_left()\ncollect()');click(app,'Run')
    for _ in range(8):app.update(.5)
    assert app.runner.world.powered and app.runner.world.x==6
    pygame.quit()
