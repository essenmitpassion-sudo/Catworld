"""Normal play launcher plus an explicit, isolated distribution self-test."""
from pathlib import Path
import argparse
import json
import os
import tempfile


def self_test(output):
    # Only this explicit CI/package mode is headless. Normal play uses the desktop.
    os.environ['SDL_VIDEODRIVER']='dummy'
    os.environ['SDL_AUDIODRIVER']='dummy'
    import pygame
    from neonpaw.district.app import DistrictApp
    from neonpaw.district.scene import load_art, project
    from neonpaw.district.characters import load_characters, POSITIONS, SHOWCASE_CARDS, SHOWCASE_CLOSE
    output=Path(output);output.mkdir(parents=True,exist_ok=True)
    report={'status':'failed','human_playtest':False}
    pygame.init()
    try:
        with tempfile.TemporaryDirectory(prefix='afterlight-check-') as folder:
            app=DistrictApp(save_path=Path(folder)/'draft.txt')
            art=load_art()
            assert art['background'] is not None and len(art['sprites'])==3 and len(art['paving'])==4 and len(art['details'])==4 and len(art['crossing_tiles'])==4
            cast=load_characters()
            assert len(cast['portraits'])==4 and len(cast['nox'])==4 and len(cast['miso'])==4 and len(cast['expressions'])==2
            x,y=project(*POSITIONS['miso'])
            app.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,pos=(x,y-20)))
            assert app.selected_character=='miso'
            app.selected_character='nox'
            code=('move_right()\nmove_right()\ntoggle()\n'
                  'for _ in range(3):\n    move_right()\nmove_up()\ncollect()\n'
                  'move_down()\nfor _ in range(4):\n    move_left()\n'
                  'move_down()\ntoggle()\nfor _ in range(3):\n    move_up()\nmove_left()\ntoggle()')
            for event in [pygame.event.Event(pygame.KEYDOWN,key=pygame.K_a,mod=pygame.KMOD_CTRL),
                          pygame.event.Event(pygame.TEXTINPUT,text=code),
                          pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,pos=app.buttons['Run'].center)]:
                pygame.event.post(event)
            for event in pygame.event.get():app.handle(event)
            # Exercise the delivered modal while a real program is running.
            before=app.runner.world
            resident_positions=dict(app.residents.positions)
            app.handle(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_F2,mod=0))
            assert app.showcase and app.runner.status=='paused'
            app.update(2)
            app.handle(pygame.event.Event(pygame.TEXTINPUT,text='must not change code'))
            app.handle(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_F6,mod=0))
            assert app.source==code and app.runner.world==before
            assert app.residents.positions==resident_positions
            app.handle(pygame.event.Event(pygame.VIDEORESIZE,size=(1600,900),w=1600,h=900))
            viewport=app.viewport()
            def click_canvas(point):
                pos=(viewport.x+point[0]*viewport.width/1440,
                     viewport.y+point[1]*viewport.height/900)
                app.handle(pygame.event.Event(pygame.MOUSEBUTTONDOWN,button=1,pos=pos))
            click_canvas(SHOWCASE_CARDS['lumi'].center)
            assert app.selected_character=='lumi'
            app.draw();pygame.image.save(app.screen,output/'packaged-crew.png')
            click_canvas(SHOWCASE_CLOSE.center)
            assert not app.showcase and app.runner.status=='paused'
            app.handle(pygame.event.Event(pygame.KEYDOWN,key=pygame.K_F5,mod=0))
            for _ in range(64):
                app.update(.4)
                if app.runner.status!='running':break
            assert app.runner.status=='done' and app.runner.world.restored,app.runner.error
            app.draw();pygame.image.save(app.canvas,output/'packaged-game.png')
            app.save()
            restored=DistrictApp(save_path=app.save_path)
            assert restored.source==code and restored.runner.status=='idle'
            assert not restored.runner.world.restored
            report.update(status='passed',assets_loaded=3,paving_tiles=4,harbor_details=4,crossing_tiles=4,characters_loaded=4,nox_poses=4,miso_poses=4,expressive_neighbours=2,actions=app.runner.executed_steps,
                          saved_draft_restored=True,crew_pause_and_resume=True,crew_resize_selection=True,renderer=pygame.display.get_driver())
    finally:
        pygame.quit()
        (output/'self-test.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    return report


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--self-test',metavar='OUTPUT_DIRECTORY')
    args=parser.parse_args()
    if args.self_test:
        self_test(args.self_test)
    else:
        from neonpaw.district.app import main as play
        play()


if __name__=='__main__':main()
