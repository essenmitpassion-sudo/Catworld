"""Character identity and cached sprites; no game rules or progress mutations."""
from functools import lru_cache
from pathlib import Path
import pygame

POSITIONS={'miso':(0,5),'lumi':(2,0),'pixel':(3,5)}
TRAITS={'nox':'Neugierig. Eigenwillig.', 'miso':'Gemütlich. Unbestechlich.',
        'lumi':'Mutig. Immer neugierig.', 'pixel':'Frech. Voller Ideen.'}


def dialogue(name,world):
    if name=='miso':
        return 'Warm. Gut. Ich bleibe.' if 'shelter' in world.active else 'Ein warmes Dach wäre schon was.'
    if name=='lumi':
        return 'Da drüben gibt es noch mehr!' if world.cell_collected else 'Was wohl hinter dem Kanal liegt?'
    if name=='pixel':
        return 'Eine Pflanzenbrücke? Ziemlich cool.' if 'garden' in world.active else 'Aus dem alten Viertel lässt sich was machen.'
    return 'Unser Viertel. Unsere Regeln.' if world.restored else 'Mal sehen, was wir hier wecken.'


def crop_cells(atlas):
    cells=[]
    for index in range(4):
        col,row=index%2,index//2
        left=col*atlas.get_width()//2;top=row*atlas.get_height()//2
        right=(col+1)*atlas.get_width()//2;bottom=(row+1)*atlas.get_height()//2
        cell=atlas.subsurface((left,top,right-left,bottom-top))
        rect=cell.get_bounding_rect(min_alpha=12)
        if not rect.width or not rect.height:raise ValueError('Empty character sprite')
        cells.append(cell.subsurface(rect).copy())
    return cells


def fit(sprite,w,h):
    ratio=min(w/sprite.get_width(),h/sprite.get_height())
    return pygame.transform.smoothscale(sprite,(max(1,round(sprite.get_width()*ratio)),max(1,round(sprite.get_height()*ratio))))


@lru_cache(maxsize=1)
def load_characters():
    folder=Path(__file__).with_name('assets')
    result={'portraits':{},'world':{},'nox':[]}
    try:
        atlas=pygame.image.load(folder/'characters.png').convert_alpha()
        for name,sprite in zip(('nox','miso','lumi','pixel'),crop_cells(atlas)):
            result['portraits'][name]=fit(sprite,132,144)
            result['world'][name]=fit(sprite,58,66)
        poses=crop_cells(pygame.image.load(folder/'nox-poses.png').convert_alpha())
        for sprite in poses:
            frame=fit(sprite,64,72)
            result['nox'].append((frame,pygame.transform.flip(frame,True,False)))
    except (OSError,pygame.error,ValueError):
        pass
    return result


def pose_index(time,moving):
    if moving:return 1+int(time*6)%2
    return 3 if time%4.5>4.25 else 0


def draw(surface,name,position,time,moving=False,facing_left=False):
    art=load_characters()
    if name=='nox' and len(art['nox'])==4:
        sprite=art['nox'][pose_index(time,moving)][int(facing_left)]
    else:sprite=art['world'].get(name)
    if sprite is None:return False
    x,y=position
    pygame.draw.ellipse(surface,(15,29,38),(x-18,y-3,36,10))
    surface.blit(sprite,sprite.get_rect(midbottom=(round(x),round(y+3))))
    return True


def hit_test(pos,visual,project):
    locations=[('nox',(project(*visual)[0]+12,project(*visual)[1]+9))]
    locations.extend((name,project(*tile)) for name,tile in POSITIONS.items())
    for name,(x,y) in locations:
        if pygame.Rect(round(x-30),round(y-65),60,72).collidepoint(pos):return name
    return None


def portrait(surface,name,world,font):
    rect=pygame.Rect(746,452,160,252)
    pygame.draw.rect(surface,'#142c3a',rect,border_radius=16)
    pygame.draw.rect(surface,'#355562',rect,1,border_radius=16)
    sprite=load_characters()['portraits'].get(name)
    if sprite:surface.blit(sprite,sprite.get_rect(midbottom=(rect.centerx,604)))
    label=font.render(name.upper(),True,'#f8c987')
    surface.blit(label,label.get_rect(center=(rect.centerx,620)))
    words=dialogue(name,world).split();line='';y=642
    for word in words:
        candidate=(line+' '+word).strip()
        if font.size(candidate)[0]>136 and line:
            surface.blit(font.render(line,True,'#c2d5dc'),(758,y));y+=19;line=word
        else:line=candidate
    if line:surface.blit(font.render(line,True,'#c2d5dc'),(758,y))
