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
    from neonpaw.district.characters import load_characters, POSITIONS
    output=Path(output);output.mkdir(parents=True,exist_ok=True)
    report={'status':'failed','human_playtest':False}
    pygame.init()
    try:
        with tempfile.TemporaryDirectory(prefix='afterlight-check-') as folder:
            app=DistrictApp(save_path=Path(folder)/'draft.txt')
            art=load_art()
            assert art['background'] is not None and len(art['sprites'])==3
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
            for _ in range(64):
                app.update(.4)
                if app.runner.status!='running':break
            assert app.runner.status=='done' and app.runner.world.restored,app.runner.error
            app.draw();pygame.image.save(app.canvas,output/'packaged-game.png')
            app.save()
            restored=DistrictApp(save_path=app.save_path)
            assert restored.source==code and restored.runner.status=='idle'
            assert not restored.runner.world.restored
            report.update(status='passed',assets_loaded=3,characters_loaded=4,nox_poses=4,miso_poses=4,expressive_neighbours=2,actions=app.runner.executed_steps,
                          saved_draft_restored=True,renderer=pygame.display.get_driver())
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
