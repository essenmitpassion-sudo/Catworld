import os
os.environ.setdefault('SDL_VIDEODRIVER','dummy')
os.environ.setdefault('SDL_AUDIODRIVER','dummy')
import pygame
import pytest
from neonpaw.ui.app import App, INK
from tests.test_recall import write, unlock, click
from tests.test_undo import key, undo

@pytest.fixture
def app():
    pygame.init()
    a=App()
    yield a
    pygame.quit()

@pytest.mark.parametrize('size',[(1200,720),(960,600),(1600,1000)])
def test_long_line_cursor_visible_and_scaled_mouse_selects_visible_text(app,size):
    app.screen=pygame.display.set_mode(size,pygame.RESIZABLE)
    write(app,'#'+'a'*80)
    app.draw()
    assert app.horizontal_scroll > 0
    x=830+app.mono.size(app.source)[0]-app.horizontal_scroll
    assert 830 <= x <= 1160
    assert app.canvas.get_at((int(x),230))[:3] == pygame.Color(INK)[:3]
    old_offset=app.horizontal_scroll
    app.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,pos=(950*size[0]/1200,230*size[1]/720)))
    expected=int((120+old_offset)//app.mono.size(' ')[0])
    assert app.cursor==expected
    key(app,pygame.K_HOME);app.draw()
    assert app.horizontal_scroll==0 and app.cursor==0
    key(app,pygame.K_END);app.draw()
    assert app.horizontal_scroll>0


def test_undo_and_editor_switch_restore_visible_cursor(app):
    unlock(app)
    write(app,'move_right()')
    write(app,'#'+'x'*100);app.draw()
    undo(app);app.draw()
    assert app.source=='move_right()' and app.horizontal_scroll==0
    key(app,pygame.K_y,pygame.KMOD_CTRL);app.draw()
    assert app.horizontal_scroll>0
    click(app,'Abruf');app.draw()
    assert app.source=='' and app.horizontal_scroll==0
    click(app,'Abruf');app.draw()
    assert app.source.endswith('x'*100) and app.horizontal_scroll>0


def test_execution_shows_start_of_instruction_not_end_of_comment(app):
    write(app,'move_right() # '+'x'*100);app.draw()
    assert app.horizontal_scroll>0
    click(app,'Step');app.draw()
    assert app.runner.world.x==2 and app.horizontal_scroll==0
