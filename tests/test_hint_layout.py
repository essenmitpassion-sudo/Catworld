import os
os.environ.setdefault('SDL_VIDEODRIVER','dummy')
os.environ.setdefault('SDL_AUDIODRIVER','dummy')
import pygame
import pytest
from neonpaw.ui.app import App
from tests.test_recall import click

@pytest.mark.parametrize('size',[(1200,720),(960,600),(1600,1000)])
@pytest.mark.parametrize('stage',[1,2,3])
def test_help_and_complete_world_are_separate_with_resize(size,stage):
    pygame.init()
    app=App()
    app.screen=pygame.display.set_mode(size,pygame.RESIZABLE)
    app.roof_active=True; app.recall_available=True
    app.hint_level=stage
    app.draw()
    world=app.world_display_rect()
    panel=app.hint_panel_rect()
    assert not world.colliderect(panel)
    assert pygame.Rect(40,170,700,480).contains(world)
    assert world.width >= 320 and world.height >= 220
    assert abs(world.width/world.height-350/240) < .02
    assert not panel.colliderect(pygame.Rect(780,198,400,325))
    assert all(not panel.colliderect(r) for r in app.visible_buttons().values())
    # Real resized mouse click: close third hint; focus and text remain usable.
    app.hint_level=3
    r=app.buttons['Hilfe']
    app.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,
        pos=(r.centerx*size[0]/1200,r.centery*size[1]/720)))
    assert app.hint_level==0 and app.focus
    assert app.world_display_rect()==pygame.Rect(40,170,700,480)
    app.handle(pygame.event.Event(pygame.TEXTINPUT,text='#'))
    assert app.source.endswith('#')
    pygame.quit()
