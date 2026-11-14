"""Hand-drawn isometric district. Rendering never changes simulation state."""
import math
from functools import lru_cache
from pathlib import Path
import pygame
from .world import DEVICES, CROSSINGS, CELL, NAMES
from . import characters

INK = '#eee8dc'
MUTED = '#a7b7b5'
GOLD = '#f8c987'
TEAL = '#a3cfbc'
ORIGIN = (394, 270)


@lru_cache(maxsize=1)
def load_art():
    """Load/scale static assets once; missing art never prevents playing."""
    folder=Path(__file__).with_name('assets')
    result={'background':None,'sprites':{},'paving':[],'details':[],'crossing_tiles':[]}
    try:
        background=pygame.image.load(folder/'canal-night.png').convert()
        background=pygame.transform.smoothscale(background,(900,610))
        # Preserve foreground contrast while keeping the distant city luminous.
        shade=pygame.Surface((900,610),pygame.SRCALPHA)
        shade.fill((12,24,32,105));background.blit(shade,(0,0))
        result['background']=background
    except (OSError,pygame.error):
        pass
    try:
        atlas=pygame.image.load(folder/'buildings.png').convert_alpha()
        for i,name in enumerate(('workshop','garden','shelter')):
            left=i*atlas.get_width()//3;right=(i+1)*atlas.get_width()//3
            column=atlas.subsurface((left,0,right-left,atlas.get_height()))
            rect=column.get_bounding_rect(min_alpha=12)
            if not rect.width or not rect.height:continue
            sprite=column.subsurface(rect)
            ratio=min(100/sprite.get_width(),106/sprite.get_height())
            sprite=pygame.transform.smoothscale(sprite,(max(1,round(sprite.get_width()*ratio)),max(1,round(sprite.get_height()*ratio))))
            dim=sprite.copy();dim.fill((139,153,159,255),special_flags=pygame.BLEND_RGBA_MULT)
            result['sprites'][name]={True:sprite,False:dim}
    except (OSError,pygame.error):
        pass
    try:
        atlas=pygame.image.load(folder/'harbor-paving.png').convert_alpha()
        for tile in characters.crop_cells(atlas):
            result['paving'].append(pygame.transform.smoothscale(tile,(94,48)))
    except (OSError,pygame.error,ValueError):
        pass
    try:
        atlas=pygame.image.load(folder/'harbor-details.png').convert_alpha()
        for tile,size in zip(characters.crop_cells(atlas),((56,64),(34,46),(68,48),(43,40))):
            result['details'].append(characters.fit(tile,*size))
    except (OSError,pygame.error,ValueError):
        pass
    try:
        atlas=pygame.image.load(folder/'harbor-crossings.png').convert_alpha()
        result['crossing_tiles']=[pygame.transform.smoothscale(tile,(94,48))
                                  for tile in characters.crop_cells(atlas)]
    except (OSError,pygame.error,ValueError):
        pass
    return result


def project(x, y):
    return ORIGIN[0] + (x-y)*46, ORIGIN[1] + (x+y)*23


def polygon(surface, color, points, width=0):
    pygame.draw.polygon(surface, color, [(round(x),round(y)) for x,y in points], width)


def diamond(cx, cy, w=46, h=23):
    return [(cx,cy-h),(cx+w,cy),(cx,cy+h),(cx-w,cy)]


def glow(surface, pos, color, radius=48, strength=1):
    layer=pygame.Surface((radius*2,radius*2), pygame.SRCALPHA)
    rgb=pygame.Color(color)
    for r in range(radius,0,-4):
        pygame.draw.circle(layer, (*rgb[:3],int((24*(1-r/radius)+2)*strength)),(radius,radius),r)
    surface.blit(layer,(pos[0]-radius,pos[1]-radius))


def cat(surface, pos, color='#151d2b', eyes=TEAL, scale=1, time=0):
    x,y=pos
    def rect(c, r, radius=0):
        pygame.draw.rect(surface,c,(round(x+r[0]*scale),round(y+r[1]*scale),
                                   round(r[2]*scale),round(r[3]*scale)),border_radius=radius)
    pygame.draw.ellipse(surface,'#122030',(x-12*scale,y-3*scale,26*scale,9*scale))
    pygame.draw.lines(surface,color,False,[(x-5*scale,y),(x-16*scale,y-7*scale),
                     (x-18*scale,y-(19+math.sin(time*2))*scale)],max(2,int(4*scale)))
    rect(color,(-8,-23,18,25),4)
    polygon(surface,color,[(x-11*scale,y-24*scale),(x-11*scale,y-39*scale),
            (x-3*scale,y-32*scale),(x+5*scale,y-32*scale),(x+12*scale,y-39*scale),
            (x+12*scale,y-20*scale)])
    rect('#53677b',(-8,-28,18,1))
    rect(eyes,(-7,-27,4,3));rect(eyes,(5,-27,4,3))
    rect('#c78894',(0,-22,2,2))
    rect(color,(-9,-2,6,5));rect(color,(6,-2,6,5))


def blend_building(dark,lit,level):
    """Interpolate colour on opaque copies, then restore the original silhouette."""
    result=dark.copy();result.fill((0,0,0,255),special_flags=pygame.BLEND_RGBA_MAX)
    overlay=lit.copy();overlay.fill((0,0,0,255),special_flags=pygame.BLEND_RGBA_MAX)
    overlay.set_alpha(round(level*255));result.blit(overlay,(0,0))
    mask=dark.copy();mask.fill((255,255,255),special_flags=pygame.BLEND_RGB_MAX)
    result.blit(mask,(0,0),special_flags=pygame.BLEND_RGBA_MULT)
    return result


def building(surface, name, center, active, font, time, actor=None, illumination=None):
    x,y=center; x-=15; y-=18
    light=TEAL if name=='garden' else GOLD
    level=float(active) if illumination is None else illumination
    if level:glow(surface,(x,y),light,75,level)
    states=load_art()['sprites'].get(name)
    if states:
        if level<=0:sprite=states[False]
        elif level>=1:sprite=states[True]
        else:
            sprite=blend_building(states[False],states[True],level)
        rect=sprite.get_rect(midbottom=(round(x),round(y+14)))
        if actor and rect.collidepoint(actor[0],actor[1]-18):
            sprite=sprite.copy();sprite.set_alpha(140)  # Nox remains visible behind foreground roofs.
        surface.blit(sprite,rect)
        pygame.draw.ellipse(surface,light if active else '#8aabb8',(center[0]-9,center[1]+6,18,9),0 if active else 2)
        label=font.render({'workshop':'WERKSTATT','garden':'GARTEN','shelter':'ZUFLUCHT'}[name]+(' · AN' if active else ' · AUS'),True,light if active else '#b1c1ca')
        tag=label.get_rect(midbottom=(round(x-42 if name=='garden' else x),rect.bottom+25 if name=='workshop' else rect.top-5))
        if name!='workshop':
            pygame.draw.rect(surface,'#132635',tag.inflate(12,6),border_radius=5)
            surface.blit(label,tag)
        return
    # Compact buildings occupy the back of their tile; the terminal stays in front.
    h=46 if name=='workshop' else 34
    polygon(surface,'#172939',[(x-30,y-12),(x,y+3),(x,y-h+3),(x-30,y-h-12)])
    polygon(surface,'#284657',[(x,y+3),(x+30,y-12),(x+30,y-h-12),(x,y-h+3)])
    polygon(surface,'#3c5966',[(x-30,y-h-12),(x,y-h-27),(x+30,y-h-12),(x,y-h+3)])
    for wx,wy in [(-19,-15),(-9,-10),(8,-10),(18,-15)]:
        pygame.draw.rect(surface,light if active else '#395267',(x+wx,y+wy-14,5,10),border_radius=1)
    pygame.draw.line(surface,light if active else '#506a78',(x-28,y-h-10),(x,y-h+4),2)
    if name=='garden':
        for ox,oy in [(-17,-10),(0,-17),(15,-10),(0,-3)]:
            pygame.draw.rect(surface,'#41605b',(x+ox-7,y-h+oy-4,14,7),border_radius=2)
            if active:
                for dx,dy in [(-4,-7),(4,-7),(0,-12)]:
                    pygame.draw.circle(surface,'#8acba3',(int(x+ox+dx),int(y-h+oy+dy)),5)
                pygame.draw.circle(surface,'#efd58c',(int(x+ox),int(y-h+oy-13)),2)
    elif name=='workshop':
        polygon(surface,'#19374a',[(x-18,y-h-12),(x,y-h-21),(x+19,y-h-12),(x,y-h-3)])
        for off in (-8,0,8):
            pygame.draw.line(surface,'#6da6b5' if active else '#496c7c',
                             (x+off-8,y-h-12),(x+off+3,y-h-17),1)
    else:
        pygame.draw.line(surface,'#b88878',(x-24,y-h-12),(x,y-h-24),3)
        pygame.draw.line(surface,'#b88878',(x,y-h-24),(x+25,y-h-12),3)
    # A circular connection socket marks exactly where toggle() works.
    pygame.draw.ellipse(surface,light if active else '#6d8490',(x-9,y+18,18,9),2)
    label=font.render({'workshop':'WERKSTATT','garden':'GARTEN','shelter':'ZUFLUCHT'}[name]+(' · AN' if active else ' · AUS'),True,light if active else '#b1c1ca')
    if name!='workshop':surface.blit(label,(x-label.get_width()/2,y-h-48))


def draw(surface, world, visual, time, font, selected=None, facing_left=False, selected_character="nox", residents=None, lighting=None):
    board=pygame.Rect(24,116,900,610)
    pygame.draw.rect(surface,'#182e34',board,border_radius=22)
    background=load_art()['background']
    if background is not None:
        surface.blit(background,board)
    else:
        # Minimal readable fallback if a copied installation lacks its image assets.
        for i in range(15):
            x=54+i*58;h=35+(i*37)%75
            pygame.draw.rect(surface,'#1e3446',(x,270-h,39,h))
    # Keep title readable on every background, without hiding the district.
    title_shade=pygame.Surface((470,82),pygame.SRCALPHA)
    title_shade.fill((11,27,38,205));surface.blit(title_shade,(40,127))
    paving=load_art()['paving']
    crossing_tiles=load_art()['crossing_tiles']
    # Canal and islands are actual geometry, not a background screenshot.
    for diagonal in range(13):
        for x in range(8):
            y=diagonal-x
            if not 0<=y<6: continue
            cx,cy=project(x,y)
            water=x==4
            if water:
                polygon(surface,'#173c44',diamond(cx,cy))
                if crossing_tiles:surface.blit(crossing_tiles[0 if y%2 else 3],(cx-47,cy-24))
                for off in (() if crossing_tiles else (-9,3,12)):
                    drift=math.sin(time+off+x+y)*3
                    pygame.draw.line(surface,'#2b5c70',(cx-15+drift,cy+off),(cx+9+drift,cy+off),1)
            else:
                polygon(surface,'#172b39',[(cx-44,cy),(cx,cy+22),(cx,cy+36),(cx-44,cy+14)])
                polygon(surface,'#203747',[(cx,cy+22),(cx+44,cy),(cx+44,cy+14),(cx,cy+36)])
                polygon(surface,'#5a625e',diamond(cx,cy))
                if paving:surface.blit(paving[(x*3+y)%len(paving)],(cx-47,cy-24))
                else:polygon(surface,'#72776d',diamond(cx,cy),1)
            if not water and y==5 and x in (0,3,7):
                pygame.draw.circle(surface,'#d2b78c' if world.active else '#6c7772',
                                   (round(cx-30),round(cy+8)),2)
            if not water and x==5 and y in (0,3,5):
                # Quayside mooring posts, set at the edge of navigable tiles.
                pygame.draw.line(surface,'#344f5c',(cx-34,cy-1),(cx-34,cy-19),5)
                pygame.draw.circle(surface,'#dfb47c' if world.active else '#7d8e93',(round(cx-34),round(cy-20)),3)
                if world.active:glow(surface,(cx-34,cy-20),GOLD,27)
            device=CROSSINGS.get((x,y))
            if device in world.active:
                color='#81ac8a' if device=='garden' else '#c4a279'
                polygon(surface,color,diamond(cx,cy,43,19))
                if crossing_tiles:surface.blit(crossing_tiles[2 if device=='garden' else 1],(cx-47,cy-24))
                for off in (() if crossing_tiles else range(-25,30,10)):
                    pygame.draw.line(surface,'#4c6d67' if device=='garden' else '#6b645d',
                                     (cx+off-10,cy-6),(cx+off+10,cy+6),2)
            if selected==(x,y): polygon(surface,GOLD,diamond(cx,cy),2)
            if (x,y)==(1,3):
                polygon(surface,'#8aadae',diamond(cx,cy,14,7),1)
            name=next((key for key,pos in DEVICES.items() if pos==(x,y)),None)
            if name:
                ax,ay=project(*visual)
                building(surface,name,(cx,cy),name in world.active,font,time,(ax+12,ay+9),
                         lighting.levels[name] if lighting else None)
            if (x,y)==CELL and not world.cell_collected:
                glow(surface,(cx,cy-10),TEAL,42)
                pygame.draw.rect(surface,'#a4efda',(cx-12,cy-23,24,24),border_radius=5)
                pygame.draw.rect(surface,'#285b5a',(cx-7,cy-18,14,14),border_radius=2)
                pygame.draw.line(surface,'#b7fce5',(cx-4,cy-12),(cx+4,cy-12),2)
                pygame.draw.line(surface,'#b7fce5',(cx,cy-16),(cx,cy-8),2)
                label=font.render('AKKU +2',True,TEAL);surface.blit(label,(cx-30,cy-46))
    # Small edge ornaments share the buildings' materials; no simulation obstacles.
    details=load_art()['details']
    if len(details)==4:
        for index,tile,offset in ((0,(7,0),(26,9)),(1,(7,3),(30,12)),
                                  (3,(7,5),(36,5))):
            px,py=project(*tile);px+=offset[0];py+=offset[1]
            sprite=details[index]
            surface.blit(sprite,sprite.get_rect(midbottom=(round(px),round(py))))
            if index==1:glow(surface,(px,py-25),GOLD,30)
    # Draw the workshop sign after foreground tiles, away from Miso's terrace.
    wx,wy=project(*DEVICES['workshop'])
    label=font.render('WERKSTATT'+(' · AN' if 'workshop' in world.active else ' · AUS'),True,GOLD if 'workshop' in world.active else '#b1c1ca')
    tag=label.get_rect(midtop=(wx+112,wy-27))
    pygame.draw.rect(surface,'#132635',tag.inflate(12,6),border_radius=5)
    surface.blit(label,tag)
    if selected is not None:
        sx,sy=project(*selected)
        pygame.draw.circle(surface,GOLD,(round(sx+12),round(sy+9)),
                           round(12+math.sin(time*3)*2),2)
    # Neighbours remain inhabitants when power is reallocated, rather than vanishing.
    for name,tile in (residents.positions if residents else characters.POSITIONS).items():
        cx,cy=project(*tile)
        if 'shelter' in world.active:glow(surface,(cx,cy),GOLD,34)
        if not characters.draw(surface,name,(cx,cy+8),time,
                               bool(residents and name=="miso" and residents.moving),
                               bool(residents and name=="miso" and residents.facing_left),
                               characters.happy(name,world)):
            cat(surface,(cx,cy+8),'#b48972',scale=.7,time=time)
    if 'garden' in world.active:
        for i in range(12):
            cx,cy=project(2,4)
            px=cx+math.sin(time*.35+i*2)*65
            py=cy-35+math.cos(time*.6+i)*22
            pygame.draw.circle(surface,'#d3da94',(round(px),round(py)),1)
    cx,cy=project(*visual)
    glow(surface,(cx+12,cy+5),TEAL,32)
    moving=abs(world.x-visual[0])+abs(world.y-visual[1])>.025
    if not characters.draw(surface,'nox',(cx+12,cy+9),time,moving,facing_left):
        cat(surface,(cx+12,cy+9),time=time)
    characters.portrait(surface,selected_character,world,font,residents.positions if residents else None)
    # Coordinate / compass marks connect code directions to the isometric world.
    for text,pos in [('x +',(632,633)),('y +',(506,667))]:
        surface.blit(font.render(text,True,MUTED),pos)
    pygame.draw.line(surface,'#75949c',(596,645),(629,661),2)
    pygame.draw.line(surface,'#75949c',(596,645),(563,661),2)
    surface.blit(font.render('move_right()',True,MUTED),(616,681))
    surface.blit(font.render('move_down()',True,MUTED),(480,692))
    return board
