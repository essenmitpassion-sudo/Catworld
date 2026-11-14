"""Real SDL event queue smoke for the separately playable district.
Run with SDL_VIDEODRIVER=offscreen from an output folder. No human-play claim.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
import pygame
from neonpaw.district.app import DistrictApp

pygame.init()
with TemporaryDirectory() as temporary:
    app=DistrictApp(save_path=Path(temporary)/'district.txt')
    def frame(event=None,dt=0):
        if event:pygame.event.post(event)
        for queued in pygame.event.get():app.handle(queued)
        app.update(dt);app.draw()
    def click(name):
        r=app.buttons[name]
        frame(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,
            pos=(r.centerx*app.screen.get_width()/1440,r.centery*app.screen.get_height()/900)))
    def write(source):
        frame(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_a,mod=pygame.KMOD_CTRL))
        frame(pygame.event.Event(pygame.TEXTINPUT,text=source))
    def run(source):
        write(source);click('Run')
        for _ in range(64):
            if app.runner.status!='running':break
            frame(dt=.4)
        assert app.runner.status=='done',app.runner.error
    frame()
    from neonpaw.district import characters, scene
    for name,tile in characters.POSITIONS.items():
        cx,cy=scene.project(*tile)
        before=app.runner.world
        frame(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,pos=(cx,cy-20)))
        assert app.selected_character==name and app.runner.world==before
    pygame.image.save(app.canvas,'district-neighbour.png')
    app.selected_character='nox'
    pygame.image.save(app.canvas,'district-start.png')
    # Optional destination aid preserves code and marks the live target.
    original=app.source
    frame(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,
                            pos=app.destination_cards['shelter'].center))
    assert app.inspected==(1,1) and app.source==original
    assert '2 hoch' in app.destination_hint()
    # The first meaningful choice can be the shelter, then energy can be recovered.
    run('move_up()\nmove_up()\ntoggle()')
    assert app.runner.world.active==frozenset({'shelter'}) and app.runner.world.energy==0
    assert app.reaction[0]=='miso'
    pygame.image.save(app.canvas,'district-reaction-miso.png')
    frame(dt=2)
    assert app.residents.positions['miso']==(0,1)
    pygame.image.save(app.canvas,'district-shelter.png')
    run('toggle()')
    assert not app.runner.world.active and app.runner.world.energy==1
    frame(dt=2)
    assert app.residents.positions['miso']==(0,5)
    # Garden route works without using the workshop.
    run('move_right()\nfor _ in range(3):\n    move_down()\ntoggle()')
    assert app.runner.world.active==frozenset({'garden'})
    run('move_right()\nfor _ in range(3):\n    move_up()\nfor _ in range(3):\n    move_right()\nmove_down()\ncollect()')
    assert app.runner.world.cell_collected and app.runner.world.energy==2
    pygame.image.save(app.canvas,'district-garden-route.png')
    run('move_up()\nfor _ in range(3):\n    move_left()\nmove_down()\nmove_down()\ntoggle()')
    assert app.runner.world.active==frozenset({'garden','workshop'})
    run('move_left()\nmove_left()\nmove_up()\nmove_up()\ntoggle()')
    assert app.runner.world.restored and app.runner.world.energy==0
    assert app.reaction[0]=='nox'
    pygame.image.save(app.canvas,'district-reaction-nox.png')
    frame(dt=.1);pygame.image.save(app.canvas,'district-restored.png')
    # Rewind undoes the whole last attempt, including power distribution.
    click('Rewind')
    assert app.reaction is None
    assert app.runner.world.active==frozenset({'garden','workshop'})
    click('Run')
    for _ in range(6):frame(dt=.4)
    assert app.runner.world.restored
    click('Help');pygame.image.save(app.canvas,'district-help.png')
    frame(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_ESCAPE,mod=0))
    assert not app.help
    # Reset preserves text. Paused step resumes; editing stops, wrong code is bounded.
    source=app.source;click('Reset')
    assert app.source==source and app.runner.world.energy==1
    write('move_right()\nmove_right()\ntoggle()')
    click('Step');assert app.runner.world.x==2
    click('Run');frame(dt=.4);frame(dt=.4)
    assert 'workshop' in app.runner.world.active
    write('move_right()\nmove_right()');click('Run');frame(dt=.4)
    click('Stop');before=app.runner.world;frame(dt=5)
    assert app.runner.world==before
    click('Rewind');assert app.runner.world.x==3
    write('import os');click('Run')
    assert app.runner.status=='error' and app.runner.world.x==3
    write('# '+'long '*100);frame()
    assert app.hscroll>0
    frame(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_z,mod=pygame.KMOD_CTRL))
    assert app.source=='import os'
    frame(pygame.event.Event(pygame.VIDEORESIZE,size=(1152,720),w=1152,h=720))
    click('Reset');click('Help')
    assert app.help and app.runner.world.x==1
    frame(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_F1,mod=0))
    run('move_right()')
    app.save();saved=app.source
    app=DistrictApp(save_path=app.save_path);frame()
    assert app.source==saved and app.runner.world.x==1 and app.runner.status=='idle'
    frame(pygame.event.Event(pygame.QUIT))
    assert not app.alive
print('PASS: real SDL events -> shelter / recover energy -> garden crossing -> battery -> three buildings -> rewind -> retry -> help -> reset -> Step/Run/Stop -> invalid code -> long editor/Undo -> resize -> saved draft/restart -> quit')
print('Rendering: offscreen; human enjoyment and physical Windows interaction: NOT_TESTED')
pygame.quit()
