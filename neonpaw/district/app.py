"""Directly playable district prototype, sharing the bounded game interpreter."""
from pathlib import Path
import shutil
import uuid
import pygame
from neonpaw.code.runner import Runner, ProgramError, MAX_SOURCE
from neonpaw.ui.drafts import default_path
from .world import District, transition, DEVICES, NAMES, CELL
from . import scene, characters
from .residents import Residents
from .lighting import Lighting

SIZE=(1440,900)


class DistrictApp:
    def __init__(self, save_path=None):
        self.screen=pygame.display.set_mode(SIZE,pygame.RESIZABLE)
        pygame.display.set_caption('NEONPAW — Afterlight')
        self.canvas=pygame.Surface(SIZE)
        self.font=pygame.font.Font(None,26)
        self.small=pygame.font.Font(None,21)
        self.title=pygame.font.SysFont('serif',40)
        self.heading=pygame.font.Font(None,32)
        self.mono=pygame.font.SysFont('monospace',19)
        self.runner=Runner(initial_world=District(),transition_fn=transition)
        self.source='move_right()'
        self.cursor=len(self.source)
        self.selected_all=False
        self.history=[];self.future=[]
        self.save_path=Path(save_path) if save_path else default_path().with_name('district-code.txt')
        self.notice='Dein Code bleibt lokal. Der Bezirk startet frisch.'
        self.storage_blocked=False
        try:
            if self.save_path.exists():
                with self.save_path.open(encoding='utf-8') as saved:
                    text=saved.read(MAX_SOURCE+1)
                if len(text)>MAX_SOURCE: raise ValueError('Entwurf zu lang')
                self.source=text;self.cursor=len(text)
        except (OSError,UnicodeError,ValueError):
            self.storage_blocked=True
            self.notice='Entwurf nicht lesbar. Vor neuem Speichern wird das Original gesichert.'
        self.dirty=False;self.pending_save=False
        self.loaded_source=None
        self.before=None
        self.visual=(1.0,3.0)
        self.residents=Residents(self.runner.world)
        self.lighting=Lighting(self.runner.world)
        self.time=0.;self.elapsed=0.
        self.alive=True;self.help=False;self.showcase=False;self.inspected=None
        self.selected_character="nox";self.facing_left=False
        self.reaction=None;self.reaction_remaining=0.
        self.scroll=0;self.hscroll=0;self.follow_execution=False
        self.destination_cards={name:pygame.Rect(24+i*306,746,288,96)
                                for i,name in enumerate(DEVICES)}
        self.buttons={
            'Run':pygame.Rect(974,645,128,44),
            'Step':pygame.Rect(1112,645,128,44),
            'Stop':pygame.Rect(1250,645,140,44),
            'Rewind':pygame.Rect(974,704,202,36),
            'Reset':pygame.Rect(1186,704,204,36),
            'Help':pygame.Rect(1262,42,128,34),
        }
        pygame.key.start_text_input()

    def text(self,value,pos,color=scene.INK,font=None):
        self.canvas.blit((font or self.font).render(value,True,color),pos)

    def save(self):
        self.pending_save=False
        temporary=self.save_path.with_name(self.save_path.name+'.tmp')
        try:
            self.save_path.parent.mkdir(parents=True,exist_ok=True)
            if self.storage_blocked and self.save_path.exists():
                backup=self.save_path.with_name(self.save_path.name+'.damaged-'+uuid.uuid4().hex)
                shutil.copy2(self.save_path,backup)
            temporary.write_text(self.source,encoding='utf-8')
            temporary.replace(self.save_path)
        except OSError:
            self.notice='Speichern fehlgeschlagen. Dein Text bleibt im Editor; Strg+S versucht es erneut.'
        else:
            self.notice='Code lokal gespeichert · Bezirk startet beim Öffnen frisch.'
            self.dirty=False;self.storage_blocked=False

    def edit(self,text,cursor):
        if len(text)>MAX_SOURCE:
            self.notice='Maximal 4096 Zeichen pro Programm.';return
        if text==self.source: return
        self.history.append((self.source,self.cursor));self.history=self.history[-64:]
        self.future.clear()
        self.source=text;self.cursor=cursor;self.selected_all=False
        self.changed()

    def changed(self):
        self.follow_execution=False
        self.runner.stop();self.runner.error='';self.runner.line=None
        self.loaded_source=None;self.elapsed=0.;self.dirty=True;self.pending_save=True

    def insert(self,text):
        if self.selected_all: self.edit(text,len(text))
        else: self.edit(self.source[:self.cursor]+text+self.source[self.cursor:],self.cursor+len(text))

    def command(self,name):
        if name=='Showcase':
            self.showcase=not self.showcase
            if self.showcase and self.runner.status=='running':self.runner.status='paused'
            self.elapsed=0.
            return
        if name=='Help':
            self.help=not self.help
            if self.help and self.runner.status=='running':self.runner.status='paused'
            self.elapsed=0.
            return
        if name=='Stop': self.runner.stop();return
        if name in ('Reset','Rewind'):
            world=District() if name=='Reset' else self.before
            if world is None: return
            self.runner=Runner(initial_world=world,transition_fn=transition)
            self.visual=(float(world.x),float(world.y))
            self.residents.reset(world)
            self.lighting.reset(world)
            self.loaded_source=None;self.elapsed=0.;self.before=None
            self.reaction=None;self.reaction_remaining=0.
            return
        if name not in ('Run','Step'): return
        self.follow_execution=True
        if self.loaded_source!=self.source or self.runner.status not in ('paused','running'):
            self.before=self.runner.world
            try: self.runner.load(self.source)
            except ProgramError: return
            self.loaded_source=self.source;self.elapsed=0.
        if name=='Run': self.runner.run()
        else:
            before=self.runner.world
            self.runner.step()
            self.observe_world(before)

    def viewport(self):
        width,height=self.screen.get_size()
        scale=min(width/SIZE[0],height/SIZE[1])
        rect=pygame.Rect(0,0,max(1,round(SIZE[0]*scale)),max(1,round(SIZE[1]*scale)))
        rect.center=(width//2,height//2)
        return rect

    def canvas_position(self,pos):
        rect=self.viewport()
        if not rect.collidepoint(pos):return None
        return ((pos[0]-rect.x)*SIZE[0]/rect.width,(pos[1]-rect.y)*SIZE[1]/rect.height)

    def handle(self,event):
        if self.showcase and event.type not in (pygame.QUIT,pygame.VIDEORESIZE):
            if event.type==pygame.KEYDOWN and event.key in (pygame.K_F2,pygame.K_ESCAPE):
                self.showcase=False
            elif event.type==pygame.MOUSEBUTTONDOWN and event.button==1:
                pos=self.canvas_position(event.pos)
                if pos is not None:
                    if characters.SHOWCASE_CLOSE.collidepoint(pos):self.showcase=False
                    for name,rect in characters.SHOWCASE_CARDS.items():
                        if rect.collidepoint(pos):self.selected_character=name
            return
        if self.help and event.type not in (pygame.QUIT,pygame.VIDEORESIZE):
            if event.type==pygame.KEYDOWN and event.key in (pygame.K_F1,pygame.K_ESCAPE):
                self.help=False
            elif event.type==pygame.MOUSEBUTTONDOWN and event.button==1:
                pos=self.canvas_position(event.pos)
                if pos is not None and self.buttons['Help'].collidepoint(pos):self.help=False
            return
        if event.type==pygame.QUIT:
            if self.dirty:self.save()
            if not self.dirty:self.alive=False
        elif event.type==pygame.VIDEORESIZE:
            self.screen=pygame.display.set_mode(event.size,pygame.RESIZABLE)
        elif event.type==pygame.MOUSEBUTTONDOWN:
            pos=self.canvas_position(event.pos)
            if pos is None:return
            mx,my=pos
            if event.button==1:
                for name,rect in self.destination_cards.items():
                    if rect.collidepoint(mx,my):
                        self.inspected=DEVICES[name] if self.inspected!=DEVICES[name] else None
                        return
                if pygame.Rect(746,452,160,274).collidepoint(mx,my):
                    self.command('Showcase');return
                for name,rect in self.buttons.items():
                    if rect.collidepoint(mx,my):self.command(name);return
                if 974<=mx<1390 and 228<=my<620:
                    self.follow_execution=False
                    lines=self.source.split('\n')
                    row=min(len(lines)-1,self.scroll+max(0,int((my-242)//26)))
                    col=max(0,min(len(lines[row]),int((mx-1015)//self.mono.size('M')[0])+self.hscroll))
                    self.cursor=sum(len(s)+1 for s in lines[:row])+col
                    self.selected_all=False
                elif 24<=mx<924 and 116<=my<726:
                    person=characters.hit_test((mx,my),self.visual,scene.project,self.residents.positions)
                    if person:
                        self.selected_character=person;return
                    candidates=[(abs(mx-scene.project(x,y)[0])/46+abs(my-scene.project(x,y)[1])/23,(x,y))
                                for x in range(8) for y in range(6)]
                    distance,position=min(candidates)
                    self.inspected=position if distance<=1 else None
        elif event.type==pygame.TEXTINPUT:
            self.insert(event.text)
        elif event.type==pygame.KEYDOWN:
            ctrl=bool(event.mod & pygame.KMOD_CTRL)
            if ctrl and event.key==pygame.K_s:self.save();return
            if ctrl and event.key==pygame.K_a:self.selected_all=True;return
            if ctrl and event.key in (pygame.K_z,pygame.K_y):
                origin,destination=(self.history,self.future) if event.key==pygame.K_z else (self.future,self.history)
                if origin:
                    destination.append((self.source,self.cursor))
                    self.source,self.cursor=origin.pop();self.selected_all=False;self.changed()
                return
            shortcuts={pygame.K_F5:'Run',pygame.K_F6:'Step',pygame.K_ESCAPE:'Stop',pygame.K_F1:'Help',pygame.K_F2:'Showcase'}
            if event.key in shortcuts:self.command(shortcuts[event.key]);return
            self.follow_execution=False
            if event.key==pygame.K_RETURN:
                line=self.source[:self.cursor].split('\n')[-1]
                indent=len(line)-len(line.lstrip(' '))
                self.insert('\n'+' '*(indent+(4 if line.rstrip().endswith(':') else 0)))
            elif event.key==pygame.K_TAB:self.insert('    ')
            elif event.key in (pygame.K_BACKSPACE,pygame.K_DELETE):
                if self.selected_all:self.edit('',0)
                elif event.key==pygame.K_BACKSPACE and self.cursor:
                    self.edit(self.source[:self.cursor-1]+self.source[self.cursor:],self.cursor-1)
                elif event.key==pygame.K_DELETE:
                    self.edit(self.source[:self.cursor]+self.source[self.cursor+1:],self.cursor)
            elif event.key in (pygame.K_LEFT,pygame.K_RIGHT):
                self.cursor=max(0,min(len(self.source),self.cursor+(1 if event.key==pygame.K_RIGHT else -1)))
                self.selected_all=False
            elif event.key in (pygame.K_UP,pygame.K_DOWN,pygame.K_HOME,pygame.K_END):
                lines=self.source.split('\n');row=self.source[:self.cursor].count('\n')
                col=len(self.source[:self.cursor].split('\n')[-1])
                if event.key==pygame.K_HOME:col=0
                elif event.key==pygame.K_END:col=len(lines[row])
                else:row=max(0,min(len(lines)-1,row+(1 if event.key==pygame.K_DOWN else -1)))
                self.cursor=sum(len(s)+1 for s in lines[:row])+min(col,len(lines[row]))
                self.selected_all=False

    def observe_world(self,before):
        event=characters.reaction(before,self.runner.world)
        if event:
            self.reaction=event;self.reaction_remaining=5.

    def update(self,dt):
        dt=max(0,dt);self.time+=dt;self.elapsed+=dt
        if not (self.help or self.showcase):self.reaction_remaining=max(0,self.reaction_remaining-dt)
        if not self.reaction_remaining:self.reaction=None
        if self.elapsed>=.38:
            before=self.runner.world
            self.runner.tick();self.elapsed=0.
            self.observe_world(before)
        if not (self.help or self.showcase):
            self.residents.update(self.runner.world,dt)
            self.lighting.update(self.runner.world,dt)
        screen_delta=(self.runner.world.x-self.visual[0])-(self.runner.world.y-self.visual[1])
        if abs(screen_delta)>.01:self.facing_left=screen_delta<0
        blend=min(1,dt/.13)
        self.visual=tuple(v+(target-v)*blend for v,target in zip(self.visual,(self.runner.world.x,self.runner.world.y)))
        if self.pending_save:self.save()

    def wrapped(self,text,rect,color=scene.MUTED,font=None):
        font=font or self.small
        x,y,w,h=rect;line=''
        for word in text.split():
            candidate=(line+' '+word).strip()
            if font.size(candidate)[0]>w and line:
                if y+font.get_height()>rect[1]+h:return
                self.text(line,(x,y),color,font);y+=font.get_linesize();line=word
            else:line=candidate
        if y+font.get_height()<=rect[1]+h:self.text(line,(x,y),color,font)

    def run_result(self):
        if self.runner.status!='done' or self.before is None:return None
        before=self.before;after=self.runner.world
        on=len(after.active-before.active);off=len(before.active-after.active)
        return (f'({before.x},{before.y}) nach ({after.x},{after.y}) · '
                f'Energie {before.energy} auf {after.energy} · '
                f'Gebäudeänderung: {on} an, {off} aus.')

    def destination_hint(self):
        if self.inspected is None:return None
        target=self.inspected;world=self.runner.world
        name=next((NAMES[n] for n,p in DEVICES.items() if p==target),f'Feld {target}')
        dx,dy=target[0]-world.x,target[1]-world.y
        if not (dx or dy):
            if world.device:return f'{name}: Du bist am Anschluss. toggle() verteilt den Strom.'
            if target==CELL and not world.cell_collected:return 'Am Akku: collect() nimmt zwei Energieeinheiten auf.'
            return f'{name}: Nox steht hier.'
        offsets=[]
        if dx:offsets.append(f'{abs(dx)} '+('rechts' if dx>0 else 'links'))
        if dy:offsets.append(f'{abs(dy)} '+('runter' if dy>0 else 'hoch'))
        return f'{name}: Abstand '+ ' · '.join(offsets)+' — Kanal und Brücken beachten.'

    def draw(self):
        c=self.canvas;world=self.runner.world
        c.fill('#0c1724')
        pygame.draw.circle(c,scene.TEAL,(47,55),17,2)
        scene.cat(c,(47,66),scale=.55,time=self.time)
        self.text('Afterlight',(79,27),scene.INK,self.title)
        self.text('D I E   K A T Z E N   A M   K A N A L',(82,79),scene.GOLD,self.small)
        self.text('Ein kleines Viertel. Deine Geschichte.',(430,49),scene.MUTED,self.small)
        scene.draw(c,world,self.visual,self.time,self.small,self.inspected,
                   facing_left=self.facing_left,selected_character=self.selected_character,residents=self.residents,lighting=self.lighting)
        self.text('Hier kann etwas Schönes wachsen.',(52,139),scene.INK,self.heading)
        self.text('Ein warmes Zuhause beginnt mit deiner Idee.',(52,174),scene.MUTED,self.small)
        # Energy and live position remain readable outside the map.
        pygame.draw.rect(c,'#263d40',(52,630,255,66),border_radius=12)
        self.text('FREIE ENERGIE',(68,641),scene.MUTED,self.small)
        for i in range(3):
            pygame.draw.rect(c,scene.GOLD if i<world.energy else '#38505a',(68+i*28,667,19,12),border_radius=3)
        self.text(f'{world.energy} / {1+2*world.cell_collected}',(163,662),scene.GOLD)
        self.text(f'NOX  ({world.x}, {world.y})',(354,668),scene.TEAL,self.small)
        # Three functional destinations; every one can be switched back off.
        captions={'workshop':'Öffnet die Kanalbrücke','garden':'Lässt einen zweiten Weg wachsen','shelter':'Gibt den Streunern ein Zuhause'}
        for i,name in enumerate(DEVICES):
            rect=self.destination_cards[name]
            pygame.draw.rect(c,'#213538',rect,border_radius=14)
            if self.inspected==DEVICES[name]:pygame.draw.rect(c,scene.GOLD,rect,2,border_radius=14)
            active=name in world.active
            pygame.draw.circle(c,scene.TEAL if active else '#566a77',(rect.x+22,rect.y+24),5)
            self.text(NAMES[name],(rect.x+36,rect.y+13),scene.INK,self.font)
            self.wrapped(captions[name],(rect.x+18,rect.y+43,253,25),font=self.small)
            pos=DEVICES[name]
            self.text(f'({pos[0]}, {pos[1]})  ·  '+('VERSORGT' if active else '1 ENERGIE'),(rect.x+18,rect.y+72),scene.TEAL if active else scene.GOLD,self.small)
        # A restrained terminal, integrated with the live-world intent.
        pygame.draw.rect(c,'#1b2c32',(950,116,466,726),border_radius=20)
        pygame.draw.rect(c,'#405353',(950,116,466,726),1,border_radius=20)
        self.text('Dein Plan',(974,139),scene.INK,self.heading)
        self.text(f'Python · nächster Lauf ab ({world.x}, {world.y})',(974,178),scene.MUTED,self.small)
        pygame.draw.line(c,'#304655',(974,211),(1390,211))
        editor=pygame.Rect(970,228,424,392)
        pygame.draw.rect(c,'#101e2c',editor,border_radius=10)
        row=self.source[:self.cursor].count('\n');col=len(self.source[:self.cursor].split('\n')[-1])
        focus_row=self.runner.line-1 if self.follow_execution and self.runner.line is not None else row
        self.scroll=max(0,min(self.scroll,focus_row));self.scroll=max(self.scroll,focus_row-13)
        charw=self.mono.size('M')[0]
        if self.follow_execution:self.hscroll=0
        else:
            self.hscroll=max(0,min(self.hscroll,col));self.hscroll=max(self.hscroll,col-28)
        old_clip=c.get_clip();c.set_clip(editor)
        for idx,line in enumerate(self.source.split('\n')[self.scroll:self.scroll+14],self.scroll):
            y=242+(idx-self.scroll)*26
            if self.selected_all or self.runner.line==idx+1:
                pygame.draw.rect(c,'#3a4550' if self.runner.error else '#234b50',(1009,y-2,380,25))
            self.text(str(idx+1),(981,y),scene.MUTED,self.small)
            color=scene.MUTED if line.lstrip().startswith('#') else scene.TEAL
            self.text(line[self.hscroll:],(1015,y),color,self.mono)
        if not self.follow_execution and int(self.time*2)%2==0:
            x=1015+(col-self.hscroll)*charw;y=242+(row-self.scroll)*26
            pygame.draw.line(c,scene.GOLD,(x,y),(x,y+21),2)
        c.set_clip(old_clip)
        labels={'Run':'Run  F5','Step':'Step  F6','Stop':'Stop  Esc','Rewind':'Versuch zurück','Reset':'Bezirk neu','Help':'Hilfe  F1'}
        for name,r in self.buttons.items():
            pygame.draw.rect(c,scene.TEAL if name=='Run' else '#30464a',r,border_radius=8)
            label=self.font.render(labels[name],True,'#10282e' if name=='Run' else scene.INK)
            c.blit(label,label.get_rect(center=r.center))
        message=self.runner.error
        if not message:
            states={'idle':'Bereit. Dein Programm bewegt Nox und verändert den Bezirk.',
                    'running':'Dein Plan läuft. Stop hält ihn jederzeit an.',
                    'paused':'Pausiert. Run setzt hier fort.',
                    'stopped':'Gestoppt. Ein neuer Run wirkt ab diesem Standort.',
                    'done':'Plan beendet. Der Bezirk bleibt so — was probierst du als Nächstes?'}
            message=self.run_result() or states[self.runner.status]
        self.wrapped(message,(974,755,412,70),'#efb3a5' if self.runner.error else scene.MUTED)
        bottom='Wähle ein Gebäude unten: Anschluss finden, eigenen Weg programmieren.'
        if world.restored: bottom='Der Bezirk lebt. Drei Gebäude versorgt — und Nox hat Nachbarn.'
        elif world.device: bottom=f'{NAMES[world.device]}: toggle() schaltet Strom ein oder holt ihn zurück.'
        elif (world.x,world.y)==CELL and not world.cell_collected: bottom='Ein alter Akku! collect() bringt zwei zusätzliche Energieeinheiten.'
        elif world.cell_collected: bottom='Mehr Energie, mehr Möglichkeiten. Welche Gebäude möchtest du verbinden?'
        if self.inspected is not None:bottom=self.destination_hint()
        self.text(bottom,(32,861),scene.GOLD if world.restored else scene.MUTED,self.small)
        self.text(self.notice,(32,883),scene.MUTED,self.small)
        characters.reaction_card(c,self.reaction,self.small)
        if self.showcase:characters.showcase(c,self.selected_character,world,self.small,self.residents.positions)
        if self.help:
            shade=pygame.Surface(SIZE,pygame.SRCALPHA);shade.fill((5,13,23,180));c.blit(shade,(0,0))
            panel=pygame.Rect(220,192,1000,506)
            pygame.draw.rect(c,'#1c3341',panel,border_radius=20)
            self.text('Kleine Befehle. Grosse Wirkung.',(260,224),scene.INK,self.title)
            lines=[
                'move_right() / move_left()   ·   x +1 / x -1',
                'move_down() / move_up()      ·   y +1 / y -1',
                'toggle()   ·   Am Gebäude: Strom einschalten oder zurückholen.',
                'collect()  ·   Auf dem Akku: zwei Energieeinheiten aufnehmen.',
                '',
                'for _ in range(2):',
                '    move_right()',
                '',
                'Jeder Run wirkt ab Nox’ Standort. Step zeigt eine Aktion.',
                'Versuch zurück stellt den Zustand vor dem letzten Programm wieder her.',
                'Bezirk neu setzt die Welt zurück. Dein Code bleibt erhalten.',
            ]
            for i,line in enumerate(lines):self.text(line,(262,295+i*29),scene.TEAL if i in (5,6) else scene.INK,self.font)
            self.text('F1 schliesst die Hilfe · Strg+A auswählen · Strg+Z/Y rückgängig/wiederholen · Strg+S sichern',
                      (262,654),scene.MUTED,self.small)
        rect=self.viewport()
        self.screen.fill('#0c1724')
        self.screen.blit(pygame.transform.smoothscale(c,rect.size),rect)
        pygame.display.flip()


def main():
    pygame.init();app=DistrictApp();clock=pygame.time.Clock()
    while app.alive:
        for event in pygame.event.get():app.handle(event)
        app.update(clock.tick(60)/1000);app.draw()
    pygame.quit()
