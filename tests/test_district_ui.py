import os
os.environ.setdefault('SDL_VIDEODRIVER','dummy')
os.environ.setdefault('SDL_AUDIODRIVER','dummy')
import pygame
import pytest
from neonpaw.district.app import DistrictApp


@pytest.fixture
def app(tmp_path):
    pygame.init()
    a=DistrictApp(save_path=tmp_path/'district.txt')
    yield a
    pygame.quit()


def write(app, text):
    app.handle(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_a,mod=pygame.KMOD_CTRL))
    app.handle(pygame.event.Event(pygame.TEXTINPUT,text=text))


def test_programs_continue_from_live_world_and_rewind_restores_attempt(app):
    write(app,'move_right()');app.command('Run');app.update(.5)
    assert app.runner.world.x==2
    app.command('Run');app.update(.5)
    assert app.runner.world.x==3
    app.command('Rewind')
    assert app.runner.world.x==2 and app.source=='move_right()'
    app.command('Reset')
    assert app.runner.world.x==1 and app.source=='move_right()'


def test_edit_stops_execution_and_keyboard_undo_restores_source(app):
    write(app,'move_right()\nmove_right()');app.command('Run');app.update(.5)
    write(app,'toggle()');app.update(1)
    assert app.runner.world.x==2 and app.runner.status=='stopped'
    app.handle(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_z,mod=pygame.KMOD_CTRL))
    assert app.source=='move_right()\nmove_right()'


def test_saved_code_returns_without_autorun_and_reset_keeps_it(app):
    write(app,'move_right()\n# mein Plan');app.save()
    restored=DistrictApp(save_path=app.save_path)
    assert restored.source==app.source and restored.runner.status=='idle'
    assert restored.runner.world.x==1
    restored.command('Reset')
    assert restored.source==app.source


def test_resize_click_targets_and_optional_help_keep_code(app):
    write(app,'toggle()')
    app.screen=pygame.display.set_mode((1000,625))
    rect=app.buttons['Help']
    app.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,
        pos=(rect.centerx*1000/1440,rect.centery*625/900)))
    assert app.help and app.source=='toggle()'
    app.draw()


def test_save_failure_is_visible_and_keeps_text(app):
    write(app,'# behalten')
    app.save_path=app.save_path.parent  # a directory cannot be replaced by a draft file
    app.save()
    assert 'Speichern' in app.notice and app.source=='# behalten'


def test_invalid_source_never_moves_cat(app):
    write(app,'import os');app.command('Run');app.update(.5)
    assert app.runner.status=='error' and app.runner.world.x==1


def test_help_pauses_world_and_blocks_hidden_editor_controls(app):
    write(app,'move_right()\nmove_right()');app.command('Run')
    app.command('Help');app.update(1)
    assert app.runner.world.x==1 and app.runner.status=='paused'
    app.handle(pygame.event.Event(pygame.TEXTINPUT,text='oops'))
    app.handle(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_F5,mod=0))
    app.update(1)
    assert app.runner.world.x==1 and app.source=='move_right()\nmove_right()'
    app.handle(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_ESCAPE,mod=0))
    assert not app.help


def test_corrupt_original_is_backed_up_before_first_edit_save(app):
    original=b'\xff\xfe broken original'
    app.save_path.write_bytes(original)
    restored=DistrictApp(save_path=app.save_path)
    write(restored,'# neuer Text');restored.update(.01)
    backups=list(app.save_path.parent.glob('district.txt.damaged-*'))
    assert len(backups)==1 and backups[0].read_bytes()==original
    assert app.save_path.read_text()=='# neuer Text'


def test_failed_exit_save_keeps_editor_open_and_does_not_retry_each_frame(app):
    write(app,'# ungesichert');app.save_path=app.save_path.parent
    app.handle(pygame.event.Event(pygame.QUIT))
    assert app.alive and app.dirty and app.source=='# ungesichert'
    assert not app.pending_save
    app.update(.5)
    assert app.alive


def test_oversize_draft_is_preserved_before_replacement(app):
    original='x'*5000
    app.save_path.write_text(original)
    restored=DistrictApp(save_path=app.save_path)
    assert restored.source=='move_right()'
    write(restored,'move_left()');restored.save()
    assert next(app.save_path.parent.glob('district.txt.damaged-*')).read_text()==original


def test_execution_reveals_error_line_until_player_moves_cursor(app):
    write(app,'collect()\n'+'# mein Plan\n'*25)
    app.draw();assert app.scroll>0
    app.command('Run');app.update(.5);app.draw()
    assert app.runner.status=='error' and app.scroll==0
    app.handle(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_END,mod=0));app.draw()
    assert app.scroll>0
