from tests.test_recall import click, write
from tests.test_workshop_ui import app, enter
from tests.test_workshop import LOOP_PLAN


def test_enter_and_immediate_step_animate_from_new_start_not_previous_scene(app):
    enter(app)
    write(app, 'move_right()')
    click(app, 'Step')  # May arrive in the same SDL event batch as the scene switch.
    assert app.runner.world.x == 2
    assert app.visual_x == 1.0
    app.update(.03)
    assert 1 < app.visual_x < 2


def test_retry_after_success_rebases_animation_before_first_step(app):
    enter(app)
    write(app, LOOP_PLAN)
    click(app, 'Run')
    for _ in range(9): app.update(.5)
    assert app.runner.world.x == 7 and app.visual_x == 7
    click(app, 'Step')
    assert app.runner.world.x == 2 and app.visual_x == 1.0


def test_new_start_control_rebases_animation_before_same_frame_step(app):
    enter(app)
    write(app, LOOP_PLAN)
    click(app, 'Run')
    for _ in range(9): app.update(.5)
    click(app, 'Torstart')
    click(app, 'Step')
    assert app.runner.world.x == 2 and app.visual_x == 1.0
