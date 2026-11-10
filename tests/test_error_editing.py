import os
os.environ.setdefault('SDL_VIDEODRIVER','dummy')
os.environ.setdefault('SDL_AUDIODRIVER','dummy')
import pygame
from neonpaw.ui.app import App
from tests.test_recall import write,click
from tests.test_undo import key


def test_cursor_navigation_after_error_is_not_locked_to_execution_line():
    pygame.init();a=App()
    source='oops()\n'+'# note\n'*20
    write(a,source);click(a,'Run');a.draw()
    error=a.runner.error
    assert a.scroll==0 and error
    key(a,pygame.K_HOME);a.draw()
    assert a.scroll>0 and a.source==source
    assert a.runner.error==error and a.runner.status=='error'
    pygame.quit()


def test_click_after_error_restores_caret_and_next_run_follows_error_again():
    pygame.init();a=App()
    write(a,'oops()\n# '+ 'x'*80);click(a,'Run');a.draw()
    a.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,pos=(850,257)))
    key(a,pygame.K_END);a.draw()
    assert a.horizontal_scroll>0
    assert a.runner.error and a.runner.line==1
    click(a,'Run');a.draw()
    assert a.horizontal_scroll==0 and a.runner.line==1
    pygame.quit()
