import os
os.environ.setdefault('SDL_VIDEODRIVER', 'dummy')
os.environ.setdefault('SDL_AUDIODRIVER', 'dummy')
import pygame
import pytest
from neonpaw.ui.app import App
from neonpaw.ui import drafts
from tests.test_recall import unlock, click, write
from tests.test_roof import ROOF_CODE
from tests.test_roof_transfer import finish, NEW_CODE
from tests.test_two_lanterns import PAIR_CODE

@pytest.fixture
def app(tmp_path):
    pygame.init()
    app = App(save_path=tmp_path/'drafts.json')
    unlock(app); click(app, 'Dach'); finish(app, ROOF_CODE)
    click(app, 'Dachtransfer')
    yield app
    pygame.quit()


def test_pair_unlocked_by_transfer_and_preserves_previous_editor(app):
    app.activate('Laternenpaar')
    assert not app.pair_active
    finish(app, NEW_CODE)
    app.activate('Laternenpaar')
    assert app.pair_active and app.source == ''
    assert app.runner.world.second_battery_x == 7
    write(app, PAIR_CODE)
    for _ in range(4): click(app, 'Step')
    assert app.runner.world.first_lit and not app.runner.world.powered
    click(app, 'Run')
    for _ in range(4): app.update(.5)
    assert app.runner.world.powered
    app.save_drafts()
    restored = App(save_path=app.save_path)
    assert restored.pair_active and restored.source == PAIR_CODE
    assert not restored.runner.world.first_lit and restored.runner.status == 'idle'
    restored.activate('Laternenpaar')
    assert restored.source == NEW_CODE
    restored.activate('Dachtransfer')
    assert restored.source == ROOF_CODE
    restored.activate('Laternenpaar')
    assert restored.source == PAIR_CODE


def test_partial_program_never_wins_by_repeated_run_and_hints_never_edit(app):
    finish(app, NEW_CODE); app.activate('Laternenpaar')
    partial = 'move_right()\n'*3+'collect()'
    write(app, partial)
    for _ in range(2):
        click(app, 'Run')
        for _ in range(4): app.update(.5)
        assert app.runner.world.first_lit and not app.runner.world.powered
    for _ in range(3): click(app,'Hilfe')
    assert app.source == partial
    click(app,'Stop'); app.update(4)
    assert app.runner.world.x == 4
    click(app,'Reset')
    assert not app.runner.world.first_lit and app.source == partial


@pytest.mark.parametrize('version',[1,2,3])
def test_old_save_versions_migrate_without_losing_any_program(app,version):
    finish(app,NEW_CODE)
    state=app.draft_snapshot()
    assert state['version'] == 4
    for key in ('pair_active','pair_unlocked','pair','pair_example'): state.pop(key)
    if version < 3:
        for key in ('roof_transfer_active','roof_transfer_unlocked','roof_transfer','roof_transfer_example'): state.pop(key)
    if version < 2:
        for key in ('roof_active','roof','roof_example','roof_repetition_seen'): state.pop(key)
    state['version']=version
    drafts.save(app.save_path,state)
    restored=App(save_path=app.save_path)
    after=restored.draft_snapshot()
    for key in ('original','recall','roof','roof_transfer'):
        if key in state: assert after[key] == state[key]
    assert not restored.pair_active and restored.runner.status == 'idle'


def test_every_hint_stage_renders_in_transfer_and_pair(app):
    finish(app, NEW_CODE)
    for _ in range(4):
        click(app,'Hilfe'); app.draw()
    app.activate('Laternenpaar')
    for _ in range(4):
        click(app,'Hilfe'); app.draw()
    assert app.source == ''
