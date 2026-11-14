from dataclasses import replace
import pytest
from tests.test_district_ui import app
from neonpaw.district.world import District


def test_light_fades_and_reverses_without_changing_power_rules(app):
    powered=replace(District(),active=frozenset({'workshop'}),energy=0)
    app.runner.world=powered;app.update(.15)
    assert app.lighting.levels['workshop']==pytest.approx(.25)
    assert app.runner.world==powered
    app.runner.world=District();app.update(.06)
    assert app.lighting.levels['workshop']==pytest.approx(.15)
    app.update(10)
    assert app.lighting.levels['workshop']==0
    app.runner.world=powered;app.update(10)
    assert app.lighting.levels['workshop']==1


def test_light_pauses_with_inspection_and_resets_to_restored_world(app):
    powered=replace(District(),active=frozenset({'shelter'}))
    app.runner.world=powered;app.update(.15)
    app.command('Showcase');app.update(2)
    assert app.lighting.levels['shelter']==pytest.approx(.25)
    app.command('Showcase');app.command('Help');app.update(2)
    assert app.lighting.levels['shelter']==pytest.approx(.25)
    app.command('Help');app.before=powered;app.command('Rewind')
    assert app.lighting.levels['shelter']==1
    app.command('Reset')
    assert all(value==0 for value in app.lighting.levels.values())
