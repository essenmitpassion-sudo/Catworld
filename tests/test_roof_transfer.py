import os
os.environ.setdefault('SDL_VIDEODRIVER', 'dummy')
os.environ.setdefault('SDL_AUDIODRIVER', 'dummy')
import pygame
import pytest
from neonpaw.ui.app import App
from neonpaw.ui import drafts
from tests.test_recall import click, write, unlock
from tests.test_roof import ROOF_CODE

NEW_CODE = 'for _ in range(7):\n    move_right()\ncollect()'


def finish(app, source):
    write(app, source)
    click(app, 'Run')
    for _ in range(9):
        app.update(.5)


@pytest.fixture
def app(tmp_path):
    pygame.init()
    app = App(save_path=tmp_path / 'drafts.json')
    unlock(app)
    click(app, 'Dach')
    yield app
    pygame.quit()


def enter_transfer(app):
    finish(app, ROOF_CODE)
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F8, mod=0))
    assert app.roof_transfer_active


def test_transfer_unlocks_only_after_roof_success(app):
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F8, mod=0))
    assert not app.roof_transfer_active
    enter_transfer(app)
    assert app.source == ROOF_CODE and app.runner.world.battery_x == 8
    assert not app.runner.world.powered and app.hint_level == 0


def test_old_plan_cannot_win_by_repeated_run_and_hints_do_not_edit(app):
    enter_transfer(app)
    for _ in range(2):
        finish(app, ROOF_CODE)
        assert app.runner.world.x == 6 and not app.runner.world.powered
        assert app.runner.error
    for _ in range(3):
        click(app, 'Hilfe')
    assert app.source == ROOF_CODE
    finish(app, NEW_CODE)
    assert app.runner.world.powered and app.runner.world.x == 8


def test_step_stop_reset_and_both_roof_drafts_survive_restart(app):
    enter_transfer(app)
    write(app, NEW_CODE)
    click(app, 'Step')
    click(app, 'Step')
    assert app.runner.world.x == 3
    click(app, 'Stop')
    app.update(2)
    assert app.runner.world.x == 3
    click(app, 'Reset')
    assert app.runner.world.x == 1 and app.source == NEW_CODE
    app.save_drafts()
    restored = App(save_path=app.save_path)
    assert restored.roof_transfer_active and restored.source == NEW_CODE
    assert restored.runner.status == 'idle' and restored.runner.world.battery_x == 8
    restored.activate('Dachtransfer')
    assert restored.source == ROOF_CODE and restored.runner.world.battery_x == 6
    restored.activate('Dachtransfer')
    assert restored.source == NEW_CODE
    restored.activate('Dach')
    restored.save_drafts()
    restored = App(save_path=app.save_path)
    restored.activate('Dach')
    assert restored.source == NEW_CODE and restored.runner.world.battery_x == 8


def test_transfer_state_types_and_locked_active_rejected(app):
    state = app.draft_snapshot()
    assert state['version'] == 4
    state['roof_transfer_active'] = True
    with pytest.raises(drafts.DraftError):
        drafts.validate(state)
    state['roof_transfer_active'] = False
    state['roof_transfer_unlocked'] = 1
    with pytest.raises(drafts.DraftError):
        drafts.validate(state)
