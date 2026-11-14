"""Character identity and cached sprites; no game rules or progress mutations."""
from functools import lru_cache
import math
from pathlib import Path
import pygame

POSITIONS={'miso':(0,5),'lumi':(2,0),'pixel':(3,5)}
TRAITS={'nox':'Neugierig. Eigenwillig.', 'miso':'Gemütlich. Unbestechlich.',
        'lumi':'Mutig. Immer neugierig.', 'pixel':'Frech. Voller Ideen.'}


def dialogue(name,world,positions=None):
    if name=='miso':
        if positions is not None:
            target=(0,1) if 'shelter' in world.active else (0,5)
            if positions.get('miso')!=target:
                return 'Da wird es warm. Bin unterwegs!' if 'shelter' in world.active else 'Dann schlendere ich zurück zum Kai.'
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
    result={'portraits':{},'closeups':{},'world':{},'nox':[],'miso':[],'expressions':{},'happy_portraits':{},'happy_closeups':{}}
    try:
        atlas=pygame.image.load(folder/'characters.png').convert_alpha()
        for name,sprite in zip(('nox','miso','lumi','pixel'),crop_cells(atlas)):
            result['portraits'][name]=fit(sprite,132,144)
            result['closeups'][name]=fit(sprite,192,280)
            result['world'][name]=fit(sprite,74,84)
        poses=crop_cells(pygame.image.load(folder/'nox-poses.png').convert_alpha())
        for sprite in poses:
            frame=fit(sprite,80,90)
            result['nox'].append((frame,pygame.transform.flip(frame,True,False)))
    except (OSError,pygame.error,ValueError):
        pass
    try:
        poses=crop_cells(pygame.image.load(folder/'miso-poses.png').convert_alpha())
        for sprite in poses:
            frame=fit(sprite,80,84)
            result['miso'].append((frame,pygame.transform.flip(frame,True,False)))
    except (OSError,pygame.error,ValueError):
        pass
    try:
        poses=crop_cells(pygame.image.load(folder/'neighbour-expressions.png').convert_alpha())
        for name,index in (('lumi',0),('pixel',2)):
            result['expressions'][name]=[fit(sprite,74,84) for sprite in poses[index:index+2]]
            result['happy_portraits'][name]=fit(poses[index+1],132,144)
            result['happy_closeups'][name]=fit(poses[index+1],192,280)
    except (OSError,pygame.error,ValueError):
        pass
    return result


def expression_index(name,time,celebrating=False):
    phase=(time+(1.7 if name=='pixel' else 0))%5.2
    return int(phase<.85 if celebrating else phase>4.95)


def happy(name,world):
    return (name=='lumi' and world.cell_collected) or (name=='pixel' and 'garden' in world.active)


def pose_index(time,moving):
    if moving:return 1+int(time*6)%2
    return 3 if time%4.5>4.25 else 0


def draw(surface,name,position,time,moving=False,facing_left=False,celebrating=False):
    art=load_characters()
    if name=='miso' and not moving and pose_index(time,False)==0:
        sprite=art['world'].get(name)
    elif name in ('nox','miso') and len(art[name])==4:
        sprite=art[name][pose_index(time,moving)][int(facing_left)]
    elif name in art['expressions'] and expression_index(name,time,celebrating):
        sprite=art['expressions'][name][1]
    else:sprite=art['world'].get(name)
    if sprite is None:return False
    x,y=position
    if not moving:y-=math.sin(time*2+list(TRAITS).index(name))*1.2
    pygame.draw.ellipse(surface,(15,29,38),(x-18,y-3,36,10))
    surface.blit(sprite,sprite.get_rect(midbottom=(round(x),round(y+3))))
    return True


def hit_test(pos,visual,project,positions=None):
    locations=[('nox',(project(*visual)[0]+12,project(*visual)[1]+9))]
    locations.extend((name,(project(*tile)[0],project(*tile)[1]+8))
                     for name,tile in (POSITIONS if positions is None else positions).items())
    for name,(x,y) in locations:
        if pygame.Rect(round(x-40),round(y-88),80,99).collidepoint(pos):return name
    return None


def portrait(surface,name,world,font,positions=None):
    rect=pygame.Rect(746,452,160,274)
    pygame.draw.rect(surface,'#20363a',rect,border_radius=16)
    pygame.draw.rect(surface,'#4b605e',rect,1,border_radius=16)
    art=load_characters()
    sprite=art['happy_portraits'].get(name) if happy(name,world) else None
    if sprite is None:sprite=art['portraits'].get(name)
    if sprite:surface.blit(sprite,sprite.get_rect(midbottom=(rect.centerx,604)))
    label=font.render(name.upper(),True,'#f8c987')
    surface.blit(label,label.get_rect(center=(rect.centerx,620)))
    words=dialogue(name,world,positions).split();line='';y=642
    for word in words:
        candidate=(line+' '+word).strip()
        if font.size(candidate)[0]>136 and line:
            surface.blit(font.render(line,True,'#c2d5dc'),(758,y));y+=19;line=word
        else:line=candidate
    if line:surface.blit(font.render(line,True,'#c2d5dc'),(758,y))
    surface.blit(font.render('Nah ansehen · F2',True,'#a3cfbc'),(758,706))


def reaction(before,after):
    """Respond to real world changes; rendering and selection have no side effects."""
    if after.restored and not before.restored:
        return 'nox','Licht. Nachbarn. Unser Viertel lebt!'
    if after.cell_collected and not before.cell_collected:
        return 'lumi','Du hast den Akku gefunden! Was wecken wir als Nächstes?'
    for device,name,on,off in (
        ('shelter','miso','Ein warmes Zuhause. Genau mein Ding.','Dann warte ich wieder am Kai.'),
        ('garden','pixel','Eine Brücke aus Pflanzen! Das eröffnet neue Wege.','Die Ranken ruhen. Zeit für einen anderen Plan.'),
        ('workshop','nox','Die Brücke ist offen. Was liegt wohl drüben?','Brücke zu. Unser nächster Weg gehört uns.'),
    ):
        if (device in before.active)!=(device in after.active):
            return name,on if device in after.active else off
    return None


def reaction_card(surface,event,font):
    """A non-modal reply above the map, leaving controls and selected portrait intact."""
    if event is None:return
    name,message=event
    panel=pygame.Rect(530,128,378,100)
    pygame.draw.rect(surface,'#243d40',panel,border_radius=12)
    pygame.draw.rect(surface,'#91b2a2',panel,1,border_radius=12)
    sprite=load_characters()['world'].get(name)
    if sprite:surface.blit(sprite,sprite.get_rect(midbottom=(568,215)))
    surface.blit(font.render(name.upper(),True,'#f8c987'),(608,140))
    line='';y=164
    for word in message.split():
        candidate=(line+' '+word).strip()
        if font.size(candidate)[0]>282 and line:
            surface.blit(font.render(line,True,'#dfede9'),(608,y));y+=19;line=word
        else:line=candidate
    if line:surface.blit(font.render(line,True,'#dfede9'),(608,y))


SHOWCASE_CLOSE=pygame.Rect(810,132,92,34)
SHOWCASE_CARDS={name:pygame.Rect(44+i*216,206,204,470)
                for i,name in enumerate(TRAITS)}
ACCENTS={'nox':'#a3cfbc','miso':'#f8c987','lumi':'#b9e5bf','pixel':'#c6b0f0'}


def showcase(surface,selected,world,font,positions=None):
    """Original approved artwork at readable scale; simulation is paused by app."""
    panel=pygame.Rect(24,116,900,610)
    pygame.draw.rect(surface,'#101f30',panel,border_radius=22)
    surface.blit(font.render('DIE KATZEN VOM KANAL',True,'#f8c987'),(48,140))
    surface.blit(font.render('Vier Persönlichkeiten. Ein Viertel voller Möglichkeiten.',True,'#a8bfcc'),(48,173))
    pygame.draw.rect(surface,'#294454',SHOWCASE_CLOSE,border_radius=8)
    surface.blit(font.render('Zurück',True,'#e0ebef'),(831,140))
    art=load_characters()
    for name,rect in SHOWCASE_CARDS.items():
        accent=ACCENTS[name]
        pygame.draw.rect(surface,'#203446' if name==selected else '#182a3a',rect,border_radius=18)
        pygame.draw.rect(surface,accent if name==selected else '#30495c',rect,2 if name==selected else 1,border_radius=18)
        pygame.draw.circle(surface,'#2a4050',(rect.centerx,350),87)
        sprite=art['happy_closeups'].get(name) if happy(name,world) else None
        if sprite is None:sprite=art['closeups'].get(name)
        if sprite:surface.blit(sprite,sprite.get_rect(midbottom=(rect.centerx,470)))
        label=font.render(name.upper(),True,accent)
        surface.blit(label,label.get_rect(center=(rect.centerx,501)))
        y=525
        for phrase in TRAITS[name].split('. '):
            label=font.render(phrase,True,'#b8ccd7')
            surface.blit(label,label.get_rect(center=(rect.centerx,y)));y+=20
        words=dialogue(name,world,positions).split();line='';y=581
        for word in words:
            candidate=(line+' '+word).strip()
            if font.size(candidate)[0]>180 and line:
                surface.blit(font.render(line,True,'#e0ebef'),(rect.x+12,y));y+=20;line=word
            else:line=candidate
        if line:surface.blit(font.render(line,True,'#e0ebef'),(rect.x+12,y))
    surface.blit(font.render('Katze anklicken zum Auswählen · F2 / Esc zurück · Programm pausiert',True,'#9bb8c6'),(48,697))
