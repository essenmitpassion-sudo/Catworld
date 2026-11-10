import os
os.environ.setdefault('SDL_VIDEODRIVER','dummy')
os.environ.setdefault('SDL_AUDIODRIVER','dummy')
import pygame
import pytest
from neonpaw.ui.app import App
from neonpaw.code.runner import Runner,MAX_SOURCE
from tests.test_recall import write,click

@pytest.mark.parametrize('size',[(1200,720),(960,600),(1600,1000)])
@pytest.mark.parametrize('y,offset',[(212,0),(518,10)])
def test_editor_padding_click_stays_within_displayed_lines(size,y,offset):
    pygame.init();a=App();a.screen=pygame.display.set_mode(size,pygame.RESIZABLE)
    write(a,'# observe\n'*20+('move_right()\nmove_left()\n'*30))
    click(a,'Step') if size==(1200,720) else a.activate('Step')
    a.draw();first=a.scroll
    assert first>0
    a.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,pos=(850*size[0]/1200,y*size[1]/720)))
    assert a.source[:a.cursor].count('\n')==first+offset
    pygame.quit()


def test_maximum_source_and_action_budget_remain_cooperative():
    code='for _ in range(32):\n    move_right()\n    move_left()'
    code='#'*(MAX_SOURCE-len(code)-1)+'\n'+code
    assert len(code)==MAX_SOURCE
    r=Runner();r.load(code);r.run()
    for _ in range(32):r.tick()
    assert r.pc==32 and r.world.x==1
    r.stop();r.tick()
    assert r.pc==32
    r.reset();r.load(code);r.run()
    for _ in range(64):r.tick()
    assert r.status=='done' and r.pc==64 and r.world.x==1
