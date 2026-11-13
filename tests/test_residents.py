from dataclasses import replace
import pygame
from neonpaw.district import characters, scene
from neonpaw.district.world import District
from tests.test_district_ui import app


def test_miso_walks_reverses_and_arrives_without_changing_world(app):
    powered=replace(District(),active=frozenset({'shelter'}),energy=0)
    app.runner.world=powered
    app.update(.5)
    assert app.residents.positions['miso']==(0,4)
    assert app.runner.world==powered
    app.runner.world=District()
    app.update(.25)
    assert app.residents.positions['miso']==(0,4.5)
    app.update(100)
    assert app.residents.positions['miso']==(0,5)
    app.runner.world=powered
    app.update(100)
    assert app.residents.positions['miso']==(0,1)


def test_moving_resident_hit_target_follows_sprite(app):
    app.runner.world=replace(District(),active=frozenset({'shelter'}))
    app.update(1)
    x,y=scene.project(*app.residents.positions['miso'])
    app.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,pos=(x,y-20)))
    assert app.selected_character=='miso'
    x,y=scene.project(0,5)
    assert characters.hit_test((x,y-20),app.visual,scene.project,app.residents.positions) is None


def test_help_freezes_residents_and_rewind_restores_position(app):
    powered=replace(District(),active=frozenset({'shelter'}))
    app.runner.world=powered
    app.update(.5)
    app.command('Help');app.update(2)
    assert app.residents.positions['miso']==(0,4)
    app.command('Help')
    app.before=powered;app.command('Rewind')
    assert app.residents.positions['miso']==(0,1)
    app.command('Reset')
    assert app.residents.positions['miso']==(0,5)


def test_miso_has_four_transparent_animation_poses(app):
    frames=characters.load_characters()['miso']
    assert len(frames)==4
    assert all(frame.get_flags() & pygame.SRCALPHA for pair in frames for frame in pair)
