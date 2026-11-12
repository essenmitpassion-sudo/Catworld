import pygame
from dataclasses import replace
from neonpaw.district import characters
from tests.test_district_ui import app


def test_four_distinct_characters_and_nox_movement_frames_load(app):
    art=characters.load_characters()
    assert art is characters.load_characters()
    assert set(art['portraits'])=={'nox','miso','lumi','pixel'}
    assert len(art['nox'])==4
    assert all(len(orientations)==2 for orientations in art['nox'])
    assert characters.pose_index(0,False)==0
    assert characters.pose_index(4.4,False)==3
    assert characters.pose_index(.2,True)!=characters.pose_index(.4,True)


def test_clicking_resident_selects_portrait_without_moving_or_editing(app):
    from neonpaw.district.scene import project
    x,y=project(*characters.POSITIONS['miso'])
    before=app.runner.world;source=app.source
    app.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,pos=(x,y-20)))
    assert app.selected_character=='miso'
    assert app.runner.world==before and app.source==source
    app.draw()


def test_residents_remain_visible_and_react_when_shelter_power_changes(app):
    before=characters.dialogue('miso',app.runner.world)
    powered=replace(app.runner.world,active=frozenset({'shelter'}),energy=0)
    after=characters.dialogue('miso',powered)
    assert before!=after
    assert set(characters.POSITIONS)=={'miso','lumi','pixel'}
    app.runner.world=powered;app.draw()
    app.runner.world=replace(powered,active=frozenset(),energy=1);app.draw()


def test_horizontal_facing_follows_screen_direction(app):
    app.runner.world=replace(app.runner.world,x=0)
    app.update(.02)
    assert app.facing_left
    app.runner.world=replace(app.runner.world,x=3)
    app.update(.02)
    assert not app.facing_left
