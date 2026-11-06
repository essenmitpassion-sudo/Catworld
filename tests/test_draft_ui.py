import os
os.environ.setdefault('SDL_VIDEODRIVER', 'dummy')
os.environ.setdefault('SDL_AUDIODRIVER', 'dummy')
import pygame
from neonpaw.ui.app import App
from tests.test_recall import click, write, unlock, SOLUTION


def test_restart_restores_both_drafts_without_running(tmp_path):
    pygame.init()
    path = tmp_path / 'drafts.json'
    app = App(save_path=path)
    unlock(app)
    click(app, 'Abruf')
    write(app, 'collect() # eigener Versuch')
    app.update(.5)
    restarted = App(save_path=path)
    assert restarted.recall_active
    assert restarted.source == 'collect() # eigener Versuch'
    assert restarted.runner.status == 'idle' and not restarted.runner.world.powered
    click(restarted, 'Abruf')
    assert restarted.source == SOLUTION
    pygame.quit()


def test_broken_file_preserved_until_explicit_save(tmp_path):
    pygame.init()
    path = tmp_path / 'drafts.json'
    path.write_text('broken')
    app = App(save_path=path)
    write(app, 'move_right() # neu')
    app.update(1)
    assert path.read_text() == 'broken'
    assert app.storage_error
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_s, mod=pygame.KMOD_CTRL))
    assert not app.storage_error
    assert next(tmp_path.glob('drafts.damaged-*')).read_text() == 'broken'
    restarted = App(save_path=path)
    assert restarted.source == 'move_right() # neu'
    pygame.quit()


def test_save_failure_is_visible_and_does_not_break_game(tmp_path):
    pygame.init()
    parent = tmp_path / 'not-a-directory'
    parent.write_text('preserve')
    app = App(save_path=parent / 'drafts.json')
    write(app, 'move_right()')
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_s, mod=pygame.KMOD_CTRL))
    assert app.storage_error
    click(app, 'Run')
    app.update(.5)
    app.draw()
    assert app.runner.world.x == 2
    assert parent.read_text() == 'preserve'
    pygame.quit()


def test_restored_text_never_executes_automatically(tmp_path):
    from neonpaw.ui.drafts import save
    from tests.test_drafts import document
    pygame.init()
    marker = tmp_path / 'must-not-exist'
    source = f'__import__("pathlib").Path({str(marker)!r}).write_text("oops")'
    path = tmp_path / 'drafts.json'
    save(path, document(source))
    app = App(save_path=path)
    app.update(5)
    assert app.source == source and app.runner.status == 'idle'
    assert not marker.exists()
    click(app, 'Run')
    assert app.runner.status == 'error' and not marker.exists()
    pygame.quit()
