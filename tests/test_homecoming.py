import os
os.environ.setdefault('SDL_VIDEODRIVER','dummy')
os.environ.setdefault('SDL_AUDIODRIVER','dummy')
import pygame
from neonpaw.ui.app import App
from tests.test_recall import unlock,click,write
from tests.test_roof import ROOF_CODE
from tests.test_roof_transfer import finish,NEW_CODE
from tests.test_two_lanterns import PAIR_CODE


def test_optional_homecoming_keeps_old_success_and_rewards_complete_route(monkeypatch,tmp_path):
    pygame.init()
    a=App(save_path=tmp_path/'drafts.json')
    unlock(a);click(a,'Dach');finish(a,ROOF_CODE)
    click(a,'Dachtransfer');finish(a,NEW_CODE);click(a,'Laternenpaar')
    rendered=[];draw_text=a.text
    def record(value,*args,**kwargs):
        rendered.append(value);return draw_text(value,*args,**kwargs)
    monkeypatch.setattr(a,'text',record)
    finish(a,PAIR_CODE);a.draw()
    assert a.runner.world.powered and a.runner.world.x==7
    assert any('Heimweg' in t for t in rendered)
    assert 'NOX IST ZUHAUSE' not in rendered
    full=PAIR_CODE+'\nfor _ in range(6):\n    move_left()'
    write(a,full);click(a,'Run')
    for _ in range(14):a.update(.5)
    rendered.clear();a.draw()
    assert a.runner.world.x==1 and a.runner.world.first_lit and a.runner.world.powered
    assert 'NOX IST ZUHAUSE' in rendered
    a.save_drafts()
    restored=App(save_path=a.save_path)
    assert restored.source==full and not restored.runner.world.powered
    click(a,'Reset');rendered.clear();a.draw()
    assert 'NOX IST ZUHAUSE' not in rendered and a.source==full
    pygame.quit()
