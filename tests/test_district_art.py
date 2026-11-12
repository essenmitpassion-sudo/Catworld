import os
os.environ.setdefault('SDL_VIDEODRIVER','dummy')
import pygame
from neonpaw.district import scene


def test_art_is_loaded_once_with_three_transparent_sprites():
    pygame.init();pygame.display.set_mode((64,64))
    art=scene.load_art()
    assert art is scene.load_art()
    assert art['background'].get_size()==(900,610)
    assert set(art['sprites'])=={'workshop','garden','shelter'}
    for states in art['sprites'].values():
        assert set(states)=={False,True}
        assert states[True].get_flags() & pygame.SRCALPHA
        assert states[True].get_width()<=100 and states[True].get_height()<=106
    pygame.quit()
