import pygame
from tests.test_recall import click, write
from tests.test_workshop_ui import app, enter
from tests.test_workshop_routes import BRIDGE_PLAN, BRIDGE_HOME
from neonpaw.ui.app import App
from neonpaw.ui import workshop


def climb(app):
    enter(app)
    write(app, BRIDGE_PLAN)
    click(app, 'Step'); app.update(.12)
    click(app, 'Step')
    assert app.runner.world.y == 1


def test_step_animates_height_and_reset_returns_both_coordinates(app):
    climb(app)
    assert app.visual_y == 0
    app.update(.03)
    assert 0 < app.visual_y < 1
    click(app, 'Stop'); app.update(.12)
    assert app.visual_y == 1 and app.runner.world.y == 1
    app.draw()
    click(app, 'Reset')
    assert app.visual_y == 0 and app.visual_x == 1
    assert app.runner.world.y == 0 and app.source == BRIDGE_PLAN


def test_save_and_navigation_keep_bridge_program_but_restart_on_ground(app):
    climb(app)
    app.update(.12); app.save_drafts()
    restored = App(save_path=app.save_path)
    assert restored.source == BRIDGE_PLAN and restored.runner.status == 'idle'
    assert restored.runner.world.y == 0 and restored.visual_y == 0
    click(app, 'Werkstatt')
    assert app.runner.world.y == 0 and app.visual_y == 0
    click(app, 'Werkstatt')
    assert app.source == BRIDGE_PLAN and app.runner.world.y == 0


def test_bridge_and_return_can_secure_workshop_without_touching_switch(app):
    enter(app); write(app, BRIDGE_PLAN + BRIDGE_HOME)
    click(app, 'Run')
    for _ in range(20): app.update(.5)
    assert app.workshop_secured()
    click(app, 'Step')
    assert (app.visual_x, app.visual_y) == (1, 0)
    assert (app.runner.world.x, app.runner.world.y) == (2, 0)


def test_route_guidance_teaches_ladders_without_forcing_switch_solution(app):
    enter(app)
    text = ' '.join(workshop.guidance(app.runner.world, False))
    assert 'Steg' in text
    write(app, 'move_right()'); click(app, 'Step')
    assert 'move_up()' in ' '.join(workshop.guidance(app.runner.world, False))
    write(app, BRIDGE_PLAN)
    click(app, 'Step'); click(app, 'Step')
    assert 'move_down()' in ' '.join(workshop.guidance(app.runner.world, False))
    for _ in range(3): click(app, 'Hilfe'); app.draw()
    assert app.world_display_rect().height > 0
