import pygame
from tests.test_district_ui import app
from neonpaw.district import characters


def test_showcase_pauses_program_and_preserves_draft(app):
    app.command('Run');world=app.runner.world;source=app.source
    app.handle(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_F2,mod=0))
    assert app.showcase and app.runner.status=='paused'
    app.update(2)
    app.handle(pygame.event.Event(pygame.TEXTINPUT,text='lost'))
    assert app.runner.world==world and app.source==source
    app.handle(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_ESCAPE,mod=0))
    assert not app.showcase and app.runner.status=='paused'


def test_showcase_selects_cast_and_can_close_after_resize(app):
    app.handle(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_F2,mod=0))
    app.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,pos=(620,360)))
    assert app.selected_character=='lumi'
    app.draw()
    app.handle(pygame.event.Event(pygame.VIDEORESIZE,size=(1600,900),w=1600,h=900))
    app.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,pos=(940,149)))
    assert not app.showcase


def test_larger_character_ears_remain_clickable(app):
    from neonpaw.district.scene import project
    x,y=project(0,5)
    assert characters.hit_test((x,y-70),app.visual,project)=='miso'
