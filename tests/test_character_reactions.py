from dataclasses import replace
from neonpaw.district import characters
from neonpaw.district.world import District
from tests.test_district_ui import app, write


def test_reactions_follow_meaningful_changes_not_movement():
    before=District()
    assert characters.reaction(before,replace(before,x=2)) is None
    shelter=replace(before,active=frozenset({'shelter'}),energy=0)
    assert characters.reaction(before,shelter)[0]=='miso'
    assert characters.reaction(shelter,before)[0]=='miso'
    assert characters.reaction(before,replace(before,cell_collected=True,energy=3))[0]=='lumi'
    garden=replace(before,active=frozenset({'garden'}),energy=0)
    assert characters.reaction(before,garden)[0]=='pixel'
    full=replace(garden,active=frozenset({'shelter','workshop','garden'}))
    assert characters.reaction(garden,full)[0]=='nox'
    assert characters.reaction(full,full) is None


def test_step_reaction_keeps_chosen_portrait_and_code(app):
    app.runner.world=replace(app.runner.world,x=1,y=1)
    app.selected_character='lumi'
    write(app,'toggle()');app.command('Step')
    assert app.reaction[0]=='miso'
    assert app.selected_character=='lumi' and app.source=='toggle()'
    app.draw()
    app.update(6)
    assert app.reaction is None and 'shelter' in app.runner.world.active


def test_run_reacts_on_execution_and_rewind_clears_it(app):
    app.runner.world=replace(app.runner.world,x=2,y=4)
    write(app,'toggle()');app.command('Run')
    assert app.reaction is None
    app.update(.4)
    assert app.reaction[0]=='pixel'
    app.command('Rewind')
    assert app.reaction is None and not app.runner.world.active
    app.command('Step');assert app.reaction[0]=='pixel'
    app.command('Reset');assert app.reaction is None


def test_help_keeps_reply_available_until_player_returns(app):
    app.runner.world=replace(app.runner.world,x=1,y=1)
    write(app,'toggle()');app.command('Step')
    reply=app.reaction
    app.command('Help');app.update(10)
    assert app.reaction==reply
    app.command('Help');app.update(6)
    assert app.reaction is None
