import os
os.environ.setdefault('SDL_VIDEODRIVER','dummy')
os.environ.setdefault('SDL_AUDIODRIVER','dummy')
import pygame
import pytest
from neonpaw.ui.app import App
from tests.test_recall import unlock, click, write
from tests.test_roof import ROOF_CODE
from tests.test_roof_transfer import finish, NEW_CODE


def key(app,code,mod=0):
    app.handle(pygame.event.Event(pygame.KEYDOWN,key=code,mod=mod))


def undo(app): key(app,pygame.K_z,pygame.KMOD_CTRL)


@pytest.fixture
def app(tmp_path):
    pygame.init()
    a=App(save_path=tmp_path/'drafts.json')
    unlock(a); click(a,'Dach'); finish(a,ROOF_CODE)
    click(a,'Dachtransfer'); finish(a,NEW_CODE); click(a,'Dach')
    yield a
    pygame.quit()


def enter(app,editor):
    if editor == 'recall': click(app,'Abruf')
    if editor in ('roof','transfer','pair'):
        click(app,'Dach')
        if editor == 'roof': click(app,'Dachtransfer')
        if editor == 'pair': click(app,'Laternenpaar')


@pytest.mark.parametrize('editor',['original','recall','roof','transfer','pair'])
def test_replace_undo_and_editor_isolation(app,editor):
    enter(app,editor)
    write(app,'# my '+editor+'\nmove_right()')
    original=app.source
    write(app,'oops')
    undo(app)
    assert app.source == original and app.select_all
    key(app,pygame.K_y,pygame.KMOD_CTRL)
    assert app.source == 'oops'
    undo(app)
    # Leave and return without losing this editor's own history.
    switch={'original':'Transfer','recall':'Abruf','roof':'Dach','transfer':'Dach','pair':'Laternenpaar'}[editor]
    click(app,switch)
    if editor != 'original': write(app,'# other editor')
    click(app,switch)
    key(app,pygame.K_z,pygame.KMOD_CTRL|pygame.KMOD_SHIFT)
    assert app.source == 'oops'
    undo(app)
    app.update(.1)
    restored=App(save_path=app.save_path)
    assert restored.source == original and restored.runner.status == 'idle'


@pytest.mark.parametrize('code,mod',[(pygame.K_BACKSPACE,0),(pygame.K_DELETE,0),(pygame.K_TAB,0),(pygame.K_TAB,pygame.KMOD_SHIFT),(pygame.K_RETURN,0)])
def test_edit_operations_restore_cursor_and_text(app,code,mod):
    write(app,'    move_right()\ncollect()')
    app.cursor=5; app.select_all=False
    before=(app.source,app.cursor,app.select_all)
    key(app,code,mod)
    assert app.source != before[0]
    undo(app)
    assert (app.source,app.cursor,app.select_all) == before


def test_undo_stops_running_program_and_autosaves(app):
    write(app,'move_right()'); write(app,'move_right()\n'*6)
    click(app,'Run'); app.update(.5)
    x=app.runner.world.x
    undo(app); app.update(5)
    assert app.runner.status == 'stopped' and app.runner.world.x == x
    assert app.source == 'move_right()'
    assert App(save_path=app.save_path).source == 'move_right()'


def test_history_bound_rejected_input_noop_and_redo_branch(app):
    for _ in range(50): app.insert('a')
    after=app.source
    for _ in range(40): undo(app)
    assert app.source == after[:-32]
    before=(app.source,app.cursor,app.select_all,app.runner.status)
    undo(app)
    assert (app.source,app.cursor,app.select_all,app.runner.status)==before
    app.insert('x')
    source=app.source
    key(app,pygame.K_y,pygame.KMOD_CTRL)
    assert app.source==source
    app.insert('x'*5000)
    undo(app)
    assert app.source==before[0]


def test_empty_history_does_not_stop_or_change_any_state(tmp_path):
    pygame.init()
    a=App(save_path=tmp_path/'new.json')
    click(a,'Run')
    before=(a.source,a.cursor,a.select_all,a.runner.status)
    undo(a)
    assert (a.source,a.cursor,a.select_all,a.runner.status)==before
    pygame.quit()
