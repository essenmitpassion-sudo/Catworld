import pygame
import pytest
from neonpaw.ui.app import App
from neonpaw.ui import drafts
from tests.test_recall import click, write
from tests.test_workshop_ui import app, enter
from tests.test_workshop import LOOP_PLAN, SECURE_HOME

OPEN_START_PLAN = 'for _ in range(6):\n    move_right()\ncollect()'


def vary(app):
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F11, mod=0))


def run(app, source):
    write(app, source)
    click(app, 'Run')
    for _ in range(20): app.update(.5)


def test_transfer_changes_start_state_without_editing_player_program(app):
    enter(app)
    write(app, LOOP_PLAN)
    history = list(app.edit_histories['workshop'][0])
    vary(app)
    assert app.runner.world.gate_open and app.runner.world.x == 1
    assert app.source == LOOP_PLAN and app.cursor == len(LOOP_PLAN)
    assert app.edit_histories['workshop'][0] == history
    assert app.runner.status == 'idle'
    for _ in range(2):
        click(app, 'Run')
        for _ in range(8): app.update(.5)
        assert app.runner.status == 'error' and app.runner.world.x == 4
        assert not app.runner.world.gate_open and not app.runner.world.powered
    run(app, OPEN_START_PLAN)
    assert app.runner.status == 'done' and app.runner.world.powered


def test_transfer_reset_restarts_the_selected_world_and_can_secure_it(app):
    enter(app)
    vary(app)
    run(app, LOOP_PLAN)
    assert not app.runner.world.gate_open
    click(app, 'Reset')
    assert app.runner.world.gate_open and app.runner.world.x == 1
    run(app, OPEN_START_PLAN + SECURE_HOME)
    assert app.workshop_secured()
    vary(app)
    assert not app.runner.world.gate_open and not app.runner.world.powered
    assert app.runner.status == 'idle'


def test_selected_start_survives_navigation_and_restart_without_autorun(app):
    enter(app)
    vary(app)
    write(app, OPEN_START_PLAN)
    app.save_drafts()
    restored = App(save_path=app.save_path)
    assert restored.runner.world.gate_open and restored.runner.status == 'idle'
    assert restored.source == OPEN_START_PLAN
    click(restored, 'Werkstatt'); click(restored, 'Werkstatt')
    assert restored.runner.world.gate_open and restored.source == OPEN_START_PLAN


def test_start_control_is_inactive_outside_workshop(app):
    assert 'Torstart' not in app.visible_buttons()
    before = app.runner.world
    vary(app)
    assert app.runner.world == before


def test_optional_example_solves_selected_variant_without_replacing_text(app):
    enter(app)
    vary(app)
    for _ in range(3): click(app, 'Hilfe')
    assert app.source == '' and app.used_example
    example = '\n'.join(app.hint_lines())
    run(app, example)
    assert app.runner.world.powered and app.runner.status == 'done'


def test_v5_saves_default_to_closed_start_and_reject_invalid_new_field(app):
    enter(app)
    state = app.draft_snapshot()
    state.pop('workshop_start_open', None)
    state['version'] = 5
    drafts.save(app.save_path, state)
    restored = App(save_path=app.save_path)
    assert not restored.runner.world.gate_open
    current = restored.draft_snapshot()
    current['workshop_start_open'] = 'yes'
    with pytest.raises(drafts.DraftError): drafts.save(app.save_path, current)
