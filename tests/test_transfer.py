import os
os.environ.setdefault('SDL_VIDEODRIVER', 'dummy')
os.environ.setdefault('SDL_AUDIODRIVER', 'dummy')
import pygame
import pytest
from neonpaw.core.world import World
from neonpaw.code.runner import Runner
from neonpaw.ui.app import App

OLD_CODE = 'move_right()\ncollect()'
NEW_CODE = 'move_right()\nmove_right()\ncollect()'


def click(app, name):
    app.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=1,
                                  pos=app.buttons[name].center))


@pytest.fixture
def app():
    pygame.init()
    instance = App()
    yield instance
    pygame.quit()


def test_runner_reset_preserves_scenario_and_world_rules():
    r = Runner(initial_world=World(battery_x=3))
    r.load(OLD_CODE)
    r.run()
    r.tick()
    r.tick()
    assert r.status == 'error' and not r.world.powered
    r.reset()
    assert r.world == World(battery_x=3)
    r.load(NEW_CODE)
    for _ in range(3):
        r.step()
    assert r.world.powered
    r.reset()
    assert r.world == World(battery_x=3)


def test_transfer_retains_authored_code_and_is_available_to_experts(app):
    before = app.source
    click(app, 'Transfer')
    assert app.source == before
    assert app.runner.world == World(battery_x=3)
    assert app.hint_level == 0
    click(app, 'Transfer')
    assert app.runner.world == World()
    assert app.source == before


def test_unchanged_old_solution_cannot_win_by_repeated_run_or_step(app):
    app.source = OLD_CODE
    click(app, 'Run')
    for _ in range(2):
        app.update(.5)
    assert app.runner.world.powered
    click(app, 'Transfer')
    assert app.source == OLD_CODE
    for _ in range(3):
        click(app, 'Run')
        app.update(.5)
        app.update(.5)
        assert not app.runner.world.powered
        assert app.runner.world.x == 2
    for _ in range(3):
        click(app, 'Step')
        click(app, 'Step')
        assert not app.runner.world.powered
    assert app.source == OLD_CODE


def test_real_edit_solves_transfer_and_reset_keeps_code(app):
    app.source = OLD_CODE
    click(app, 'Transfer')
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
    app.handle(pygame.event.Event(pygame.TEXTINPUT, text=NEW_CODE))
    click(app, 'Run')
    app.update(.5)
    click(app, 'Stop')
    app.update(10)
    assert app.runner.world.x == 2 and not app.runner.world.powered
    click(app, 'Run')
    for _ in range(3):
        app.update(.5)
    assert app.runner.world.powered and app.runner.line == 3
    click(app, 'Reset')
    assert app.runner.world == World(battery_x=3)
    assert app.source == NEW_CODE


def test_hints_are_optional_staged_and_never_edit_or_run_code(app):
    click(app, 'Transfer')
    before = app.source
    assert app.hint_level == 0 and not app.used_example
    click(app, 'Hilfe')
    assert app.hint_level == 1 and not app.used_example
    click(app, 'Hilfe')
    assert app.hint_level == 2 and not app.used_example
    click(app, 'Hilfe')  # Button explicitly says Beispiel anzeigen at this stage.
    assert app.hint_level == 3 and app.used_example
    click(app, 'Hilfe')
    assert app.hint_level == 0 and app.used_example
    click(app, 'Reset')
    assert app.used_example
    assert app.source == before and app.runner.world == World(battery_x=3)


def test_target_marker_moves_with_scenario(app):
    app.draw()
    # Bottom of outline at tile 2 / tile 3, clear of cat and battery glyph.
    old_target = (40 + (13 + 36 * 2) * 2, 170 + 220 * 2)
    new_target = (40 + (13 + 36 * 3) * 2, 170 + 220 * 2)
    cyan = pygame.Color('#65f3dd')
    assert app.canvas.get_at(old_target) == cyan
    click(app, 'Transfer')
    app.draw()
    assert app.canvas.get_at(old_target) != cyan
    assert app.canvas.get_at(new_target) == cyan


def test_step_then_run_resumes_without_restarting(app):
    click(app, 'Transfer')
    app.source = NEW_CODE
    click(app, 'Step')
    assert app.runner.world.x == 2 and app.runner.pc == 1
    click(app, 'Run')
    app.update(.5)
    assert app.runner.world.x == 3 and app.runner.pc == 2
    app.update(.5)
    assert app.runner.world.powered


def test_hints_and_switch_shortcuts_do_not_type_into_editor(app):
    original = app.source
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F3, mod=0))
    assert app.runner.world.battery_x == 3
    app.handle(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_F1, mod=0))
    assert app.hint_level == 1 and app.source == original
    click(app, 'Run')
    app.update(.5)
    # Switching cancels running/paused commands and restores the other scenario.
    click(app, 'Transfer')
    app.update(10)
    assert app.runner.world == World()
