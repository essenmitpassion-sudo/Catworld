import pytest
from neonpaw.core.world import World
from neonpaw.code.runner import Runner

PAIR_CODE = 'for _ in range(2):\n    move_right()\n    move_right()\n    move_right()\n    collect()'


def pair_runner():
    return Runner(initial_world=World(battery_x=4, second_battery_x=7))


@pytest.mark.parametrize('code', [PAIR_CODE, ('move_right()\n'*3+'collect()\n')*2,
    'for _ in range(3):\n    move_right()\ncollect()\nfor _ in range(3):\n    move_right()\ncollect()'])
def test_two_lanterns_accept_alternative_programs(code):
    r = pair_runner()
    r.load(code)
    for _ in range(4): r.step()
    assert r.world.first_lit and not r.world.powered and r.world.x == 4
    for _ in range(4): r.step()
    assert r.world.powered and r.world.x == 7 and r.status == 'done'


def test_far_lantern_can_be_lit_first_then_return_to_near_one():
    r = pair_runner()
    r.load('move_right()\n'*6+'collect()\n'+'move_left()\n'*3+'collect()')
    for _ in range(7): r.step()
    assert r.world.second_lit and not r.world.first_lit and not r.world.powered
    assert r.world.target_x == 4
    for _ in range(4): r.step()
    assert r.world.first_lit and r.world.second_lit and r.world.powered
    assert r.status == 'done' and r.world.x == 4


def test_far_lantern_cannot_be_counted_twice_and_reset_clears_it():
    r = pair_runner()
    r.load('move_right()\n'*6+'collect()\ncollect()')
    r.run()
    for _ in range(8): r.tick()
    assert r.status == 'error' and r.world.second_lit and not r.world.first_lit
    assert not r.world.powered and 'erste Laterne' in r.error
    r.reset()
    assert not r.world.first_lit and not r.world.second_lit


def test_stop_reset_and_step_run_after_partial_success():
    r = pair_runner()
    r.load(PAIR_CODE)
    for _ in range(4): r.step()
    r.stop(); r.tick()
    assert r.world.first_lit and not r.world.powered
    r.reset()
    assert not r.world.first_lit and r.world.x == 1
    r.load(PAIR_CODE); r.step(); r.run()
    for _ in range(7): r.tick()
    assert r.world.powered


def test_collect_twice_at_first_lantern_explains_next_goal():
    r = pair_runner()
    r.load('move_right()\n'*3+'collect()\ncollect()')
    r.run()
    for _ in range(5): r.tick()
    assert r.world.first_lit and not r.world.powered
    assert 'zweite Laterne' in r.error
