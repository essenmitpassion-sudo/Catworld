import pygame
from neonpaw.district.world import DEVICES
from tests.test_district_ui import app, write


def test_destination_cards_inspect_without_changing_world_or_code(app):
    before=app.runner.world;source=app.source
    for i,(name,tile) in enumerate(DEVICES.items()):
        app.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,pos=(100+i*306,780)))
        assert app.inspected==tile
        assert app.runner.world==before and app.source==source
    app.draw()


def test_destination_hint_tracks_live_position_without_solving_route(app):
    app.inspected=DEVICES['workshop']
    assert '2 rechts' in app.destination_hint()
    write(app,'move_right()');app.command('Step')
    assert '1 rechts' in app.destination_hint()
    app.command('Step')
    assert 'toggle()' in app.destination_hint()
    app.command('Rewind')
    assert '1 rechts' in app.destination_hint()


def test_destination_cards_respect_viewport_and_modals(app):
    app.handle(pygame.event.Event(pygame.VIDEORESIZE,size=(1600,900),w=1600,h=900))
    app.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,pos=(790,780)))
    assert app.inspected==DEVICES['shelter']
    app.command('Help')
    app.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,pos=(180,780)))
    assert app.inspected==DEVICES['shelter']
