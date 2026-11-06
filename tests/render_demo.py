"""Bounded automated SDL recording, not a human playtest. Outputs 240 PNG frames."""
import sys
from pathlib import Path
import pygame
from neonpaw.ui.app import App


def main():
    output = Path(sys.argv[1])
    output.mkdir(parents=True, exist_ok=True)
    pygame.init()
    app = App()  # Recording must not touch personal saved drafts.

    def click(name):
        pygame.event.post(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=1,
                                             pos=app.buttons[name].center))

    def write(text, replace=False):
        if replace:
            pygame.event.post(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a, mod=pygame.KMOD_CTRL))
        pygame.event.post(pygame.event.Event(pygame.TEXTINPUT, text=text))

    for frame in range(240):
        if frame == 10:
            click('Run')
        elif frame == 40:
            write('move_right()\ncollect()', replace=True)
            click('Reset')
            click('Run')
        elif frame == 75:
            assert app.runner.world.powered
            click('Transfer')
            click('Run')
        elif frame == 100:
            assert app.runner.status == 'error'
            write('move_right()\nmove_right()\ncollect()', replace=True)
            click('Run')
        elif frame == 145:
            assert app.runner.world.powered
            click('Abruf')
        elif frame == 160:
            assert app.source == ''
            write('move_right()')
        elif frame == 170:
            write('\nmove_right()')
        elif frame == 180:
            write('\ncollect()')
        elif frame == 185:
            click('Run')
        for event in pygame.event.get():
            app.handle(event)
        app.update(.05)
        app.draw()
        pygame.image.save(app.canvas, str(output / f'{frame:04d}.png'))
    assert app.recall_active and app.runner.world.powered
    pygame.quit()
    print('PASS: 240 automated SDL frames; full episode completed. Not a human test.')


if __name__ == '__main__':
    main()
