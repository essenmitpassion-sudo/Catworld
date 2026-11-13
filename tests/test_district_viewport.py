import pygame
import pytest
from tests.test_district_ui import app
from neonpaw.district import scene


@pytest.mark.parametrize('size',[(1600,900),(900,1000)])
def test_resize_preserves_proportions_and_clicks(app,size):
    app.handle(pygame.event.Event(pygame.VIDEORESIZE,size=size,w=size[0],h=size[1]))
    rect=app.viewport()
    assert abs(rect.width/rect.height-1.6)<.003
    assert rect.center==(size[0]//2,size[1]//2)
    def click(point):
        pos=(rect.x+point[0]*rect.width/1440,rect.y+point[1]*rect.height/900)
        app.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,pos=pos))
    x,y=scene.project(0,5);click((x,y-20))
    assert app.selected_character=='miso'
    click(app.buttons['Help'].center);assert app.help
    click(app.buttons['Help'].center);assert not app.help
    click(app.buttons['Run'].center);assert app.runner.status=='running'
    app.draw()
    assert app.screen.get_at((0,0))[:3]==(12,23,36)


def test_letterbox_click_does_not_change_selection(app):
    app.handle(pygame.event.Event(pygame.VIDEORESIZE,size=(2000,900),w=2000,h=900))
    app.inspected=(2,2)
    app.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,pos=(10,400)))
    assert app.inspected==(2,2)
