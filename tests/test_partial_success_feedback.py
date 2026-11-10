import os
os.environ.setdefault('SDL_VIDEODRIVER','dummy')
os.environ.setdefault('SDL_AUDIODRIVER','dummy')
import pygame
from neonpaw.ui.app import App
from tests.test_recall import write,click


def test_goal_then_error_is_not_presented_as_clean_program_success(monkeypatch):
    pygame.init();a=App()
    write(a,'move_right()\ncollect()\ncollect()');click(a,'Run')
    for _ in range(3):a.update(.5)
    assert a.runner.world.powered and a.runner.status=='error'
    rendered=[];original=a.text
    def record(value,*args,**kwargs):
        rendered.append(value);return original(value,*args,**kwargs)
    monkeypatch.setattr(a,'text',record);a.draw()
    assert 'LICHT AN · PROGRAMM PRÜFEN' in rendered
    assert 'DIE GASSE LEUCHTET' not in rendered
    assert a.runner.error and a.source.endswith('collect()\ncollect()')
    write(a,'move_right()\ncollect()');click(a,'Reset');click(a,'Run')
    for _ in range(2):a.update(.5)
    rendered.clear();a.draw()
    assert 'DIE GASSE LEUCHTET' in rendered and not a.runner.error
    pygame.quit()
