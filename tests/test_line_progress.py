from neonpaw.code.runner import Runner
from neonpaw.core.world import World


def test_step_run_and_stop_show_actual_repeated_line_execution():
    r=Runner(initial_world=World(battery_x=6))
    r.load('for _ in range(5):\n    move_right()\ncollect()')
    assert r.line_progress is None
    r.step()
    assert r.line_progress==(2,1,5)
    r.step();r.stop();r.tick()
    assert r.line_progress==(2,2,5)
    r.reset()
    assert r.line_progress is None
    r.load('for _ in range(5):\n    move_right()\ncollect()');r.run()
    for _ in range(5):r.tick()
    assert r.line_progress==(2,5,5)
    r.tick()
    assert r.line_progress==(3,1,1) and r.world.powered


def test_failed_action_is_not_counted_as_executed():
    r=Runner()
    r.load('for _ in range(3):\n    collect()');r.step()
    assert r.status=='error' and r.line_progress==(2,0,3)


def test_each_body_line_has_its_own_count():
    r=Runner(initial_world=World(battery_x=4,second_battery_x=7))
    r.load('for _ in range(2):\n    move_right()\n    move_right()\n    move_right()\n    collect()')
    for _ in range(4):r.step()
    assert r.line_progress==(5,1,2)
    r.step()
    assert r.line_progress==(2,2,2)
