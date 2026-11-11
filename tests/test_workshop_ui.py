import os
os.environ.setdefault('SDL_VIDEODRIVER', 'dummy')
os.environ.setdefault('SDL_AUDIODRIVER', 'dummy')
import pygame
import pytest
from neonpaw.ui.app import App
from neonpaw.ui import drafts
from tests.test_recall import click, write, unlock
from tests.test_roof import ROOF_CODE
from tests.test_roof_transfer import finish, NEW_CODE
from tests.test_two_lanterns import PAIR_CODE
from tests.test_workshop import LOOP_PLAN, SECURE_HOME


@pytest.fixture
def app(tmp_path):
    pygame.init()
    instance = App(save_path=tmp_path / 'drafts.json')
    unlock(instance)
    click(instance, 'Dach')
    finish(instance, ROOF_CODE)
    click(instance, 'Dachtransfer')
    finish(instance, NEW_CODE)
    click(instance, 'Laternenpaar')
    yield instance
    pygame.quit()


def enter(app):
    finish(app, PAIR_CODE)
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F10, mod=0))
    assert getattr(app, 'workshop_active', False)


def test_workshop_unlocks_after_pair_and_preserves_own_solution(app):
    assert 'Werkstatt' not in app.visible_buttons()
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F10, mod=0))
    assert app.pair_active and not getattr(app, 'workshop_active', False)
    enter(app)
    assert app.source == '' and app.runner.world.gate_x == 5
    assert app.runner.world.switch_x == 3 and app.runner.world.battery_x == 7
    assert set(app.visible_buttons()) == {'Run', 'Step', 'Stop', 'Reset', 'Hilfe', 'Werkstatt'}
    assert app.editor_key() == 'workshop'
    write(app, LOOP_PLAN)
    click(app, 'Werkstatt')
    assert app.source == PAIR_CODE and not app.workshop_active
    click(app, 'Werkstatt')
    assert app.source == LOOP_PLAN


def test_workshop_controls_error_recovery_and_world_response(app):
    enter(app)
    write(app, 'move_right()\n' * 4)
    for _ in range(4): click(app, 'Step')
    assert app.runner.status == 'error' and app.runner.line == 4
    assert app.runner.world.x == 4
    write(app, LOOP_PLAN)
    for _ in range(3): click(app, 'Step')
    assert app.runner.world.gate_open and app.runner.world.x == 3
    click(app, 'Stop'); app.update(2)
    assert app.runner.world.x == 3 and app.runner.world.gate_open
    finish(app, LOOP_PLAN)
    assert app.runner.world.powered and app.runner.status == 'done'
    assert not app.workshop_secured()
    finish(app, LOOP_PLAN + SECURE_HOME)
    for _ in range(12): app.update(.5)
    assert app.workshop_secured()
    click(app, 'Reset')
    assert not app.runner.world.powered and not app.runner.world.gate_open
    assert app.source == LOOP_PLAN + SECURE_HOME


def test_all_six_programs_survive_save_while_workshop_active(app):
    enter(app)
    before = app.draft_snapshot()
    write(app, LOOP_PLAN)
    click(app, 'Step')
    app.save_drafts()
    restored = App(save_path=app.save_path)
    assert restored.workshop_active and restored.workshop_unlocked
    assert restored.source == LOOP_PLAN and restored.runner.status == 'idle'
    assert restored.runner.world.x == 1 and not restored.runner.world.gate_open
    for key in ('original', 'recall', 'roof', 'roof_transfer', 'pair'):
        assert restored.draft_snapshot()[key] == before[key]
    click(restored, 'Werkstatt'); assert restored.source == PAIR_CODE
    click(restored, 'Laternenpaar'); assert restored.source == NEW_CODE
    click(restored, 'Dachtransfer'); assert restored.source == ROOF_CODE
    click(restored, 'Laternenpaar'); click(restored, 'Werkstatt')
    assert restored.source == LOOP_PLAN


def test_workshop_hints_and_undo_stay_in_their_own_editor(app):
    enter(app)
    write(app, LOOP_PLAN); write(app, 'toggle()')
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_z, mod=pygame.KMOD_CTRL))
    assert app.source == LOOP_PLAN
    for _ in range(3): click(app, 'Hilfe'); app.draw()
    assert app.used_example and app.source == LOOP_PLAN
    assert app.world_display_rect().height > 0
    click(app, 'Werkstatt')
    assert not app.used_example and app.source == PAIR_CODE
    click(app, 'Werkstatt')
    assert app.used_example
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_y, mod=pygame.KMOD_CTRL))
    assert app.source == 'toggle()'


def test_gate_and_switch_visibly_change_when_player_uses_toggle(app):
    enter(app)
    app.draw()
    gate = pygame.Rect(438, 462, 40, 100)
    closed = pygame.image.tobytes(app.canvas.subsurface(gate), 'RGB')
    write(app, 'move_right()\nmove_right()\ntoggle()')
    for _ in range(3): click(app, 'Step')
    app.draw()
    assert pygame.image.tobytes(app.canvas.subsurface(gate), 'RGB') != closed


def test_v4_save_loads_without_inventing_workshop_progress(app):
    state = app.draft_snapshot()
    for key in ('workshop_active', 'workshop_unlocked', 'workshop', 'workshop_example'):
        state.pop(key, None)
    state['version'] = 4
    drafts.save(app.save_path, state)
    restored = App(save_path=app.save_path)
    assert hasattr(restored, 'workshop_unlocked')
    assert not restored.workshop_unlocked and not restored.workshop_active
    assert restored.source == state['pair']


def test_inconsistent_workshop_flags_rejected_without_overwriting_save(app):
    enter(app)
    app.save_drafts()
    before = app.save_path.read_bytes()
    state = app.draft_snapshot()
    state['pair_active'] = False
    with pytest.raises(drafts.DraftError): drafts.save(app.save_path, state)
    assert app.save_path.read_bytes() == before
