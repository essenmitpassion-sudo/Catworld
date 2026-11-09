"""One-screen G0/G1: real SDL controls and an original procedural pixel alley."""
import pygame
from neonpaw.code.runner import Runner, ProgramError, MAX_SOURCE
from neonpaw.content.levels import TITLE, OBJECTIVE, START_CODE, BATTERY_POSITIONS, HINTS, ROOF_BATTERY_X, ROOF_WALK_HINTS, ROOF_LOOP_HINTS, ROOF_TRANSFER_X, ROOF_TRANSFER_HINTS, PAIR_HINTS
from neonpaw.core.world import World
from neonpaw.ui import drafts

BG = '#101321'
INK = '#e5eafa'
MUTED = '#9baac5'
CYAN = '#65f3dd'
PINK = '#ff79bc'


class App:
    def __init__(self, save_path=None):
        self.screen = pygame.display.set_mode((1200, 720), pygame.RESIZABLE)
        pygame.display.set_caption('NEONPAW — Erster Pfotenschritt')
        self.canvas = pygame.Surface((1200, 720))
        self.font = pygame.font.Font(None, 26)
        self.small = pygame.font.Font(None, 22)
        self.big = pygame.font.Font(None, 58)
        self.mono = pygame.font.SysFont('monospace', 20)
        self.sign_font = pygame.font.Font(None, 19)
        self.edit_histories = {}  # Five bounded, session-local undo/redo pairs.
        self.pair_active = False
        self.pair_unlocked = False
        self.pair_return = None
        self.pair_draft = ('', 0, 0, False)
        self.roof_transfer_active = False
        self.roof_transfer_unlocked = False
        self.roof_transfer_draft = (START_CODE, len(START_CODE), 0, False)
        self.roof_active = False
        self.roof_repetition_seen = False
        self.roof_return = None
        self.roof_draft = (START_CODE, len(START_CODE), 0, False)
        self.recall_active = False
        self.recall_available = False
        self.saved_editor = None
        # Each editor snapshot retains source, cursor, hint stage and example use.
        self.recall_draft = ('', 0, 0, False)
        self.scenario = 0
        self.hint_level = 0
        self.used_example = False
        self.runner = Runner(initial_world=World(battery_x=BATTERY_POSITIONS[0]))
        self.source = START_CODE
        self.loaded_source = None
        self.cursor = len(self.source)
        self.select_all = False
        self.focus = True
        self.scroll = 0
        self.elapsed = 0.0
        self.visual_x = float(self.runner.world.x)
        self.scene_time = 0.0
        self.alive = True
        self.buttons = {name: pygame.Rect(790 + i * 95, 540, 85, 42)
                        for i, name in enumerate(('Run', 'Step', 'Stop', 'Reset'))}
        self.buttons['Transfer'] = pygame.Rect(420, 125, 320, 36)
        self.buttons['Hilfe'] = pygame.Rect(540, 75, 200, 36)
        self.buttons['Abruf'] = pygame.Rect(540, 28, 200, 36)
        self.buttons['Laternenpaar'] = pygame.Rect(420, 125, 320, 36)
        self.buttons['Dachtransfer'] = pygame.Rect(40, 75, 340, 36)
        self.buttons['Dach'] = pygame.Rect(340, 28, 190, 36)
        self.save_path = save_path
        self.storage_message = ''
        self.storage_error = False
        self._storage_blocked = False
        self._last_save_attempt = None
        if save_path is not None:
            self.restore_drafts()
        pygame.key.start_text_input()

    def draft_snapshot(self):
        visible = self.pair_return if self.pair_active else (self.source, self.cursor, self.hint_level, self.used_example)
        base = self.roof_return if self.roof_active else (self.source, self.cursor, self.hint_level, self.used_example)
        if self.recall_active:
            original, _, _, original_example = self.saved_editor
            recall, recall_example = base[0], base[3]
        else:
            original, original_example = base[0], base[3]
            recall, _, _, recall_example = self.recall_draft
        roof = self.roof_draft
        transfer = self.roof_transfer_draft
        if self.roof_active:
            current = visible
            if self.roof_transfer_active:
                transfer = current
            else:
                roof = current
        return dict(version=4, scenario=self.scenario, recall_active=self.recall_active,
                    recall_available=self.recall_available, original=original, recall=recall,
                    original_example=original_example, recall_example=recall_example,
                    roof_active=self.roof_active, roof_repetition_seen=self.roof_repetition_seen,
                    roof=roof[0], roof_example=roof[3],
                    roof_transfer_active=self.roof_transfer_active,
                    roof_transfer_unlocked=self.roof_transfer_unlocked,
                    roof_transfer=transfer[0], roof_transfer_example=transfer[3],
                    pair_active=self.pair_active, pair_unlocked=self.pair_unlocked,
                    pair=self.source if self.pair_active else self.pair_draft[0],
                    pair_example=self.used_example if self.pair_active else self.pair_draft[3])

    def restore_drafts(self):
        try:
            state, warning = drafts.load(self.save_path)
        except (drafts.DraftError, OSError):
            self.storage_error = self._storage_blocked = True
            self.storage_message = 'Laden fehlgeschlagen. Datei behalten. Strg+S sichert neuen Entwurf.'
            return
        if state is None:
            return
        self.scenario = state['scenario']
        self.recall_available = state['recall_available']
        self.recall_active = state['recall_active']
        original = (state['original'], len(state['original']), 0, state['original_example'])
        self.recall_draft = (state['recall'], len(state['recall']), 0, state['recall_example'])
        self.saved_editor = original if self.recall_active else None
        self.source, self.cursor, self.hint_level, self.used_example = self.recall_draft if self.recall_active else original
        self.roof_transfer_active = state.get('roof_transfer_active', False)
        self.roof_transfer_unlocked = state.get('roof_transfer_unlocked', False)
        transfer_source = state.get('roof_transfer', START_CODE)
        self.roof_transfer_draft = (transfer_source, len(transfer_source), 0, state.get('roof_transfer_example', False))
        self.roof_active = state.get('roof_active', False)
        self.roof_repetition_seen = state.get('roof_repetition_seen', False)
        roof_source = state.get('roof', START_CODE)
        self.roof_draft = (roof_source, len(roof_source), 0, state.get('roof_example', False))
        if self.roof_active:
            self.roof_return = (self.source, self.cursor, self.hint_level, self.used_example)
            self.source, self.cursor, self.hint_level, self.used_example = self.roof_transfer_draft if self.roof_transfer_active else self.roof_draft
        self.pair_unlocked = state.get('pair_unlocked', False)
        self.pair_active = state.get('pair_active', False)
        pair_source = state.get('pair', '')
        self.pair_draft = (pair_source, len(pair_source), 0, state.get('pair_example', False))
        if self.pair_active:
            self.pair_return = (self.source, self.cursor, self.hint_level, self.used_example)
            self.source, self.cursor, self.hint_level, self.used_example = self.pair_draft
        self.runner = Runner(initial_world=self.initial_world())
        self.storage_message = warning or 'Eigene Programme wieder da. Ausführen nur mit Run oder Step.'
        self._last_save_attempt = self.draft_snapshot()

    def save_drafts(self, force=False):
        if self.save_path is None or (self._storage_blocked and not force):
            return
        snapshot = self.draft_snapshot()
        if not force and snapshot == self._last_save_attempt:
            return
        self._last_save_attempt = snapshot
        try:
            drafts.save(self.save_path, snapshot)
        except (OSError, drafts.DraftError, UnicodeError):
            self.storage_error = True
            self.storage_message = 'Speichern fehlgeschlagen. Code bleibt offen. Strg+S versucht es erneut.'
        else:
            self.storage_error = self._storage_blocked = False
            self.storage_message = 'Deine Programme lokal gesichert. Strg+S speichert auch manuell.'

    def text(self, value, pos, color=INK, font=None):
        self.canvas.blit((font or self.font).render(value, True, color), pos)

    def initial_world(self):
        if self.pair_active:
            return World(battery_x=4, second_battery_x=7)
        roof_target = ROOF_TRANSFER_X if self.roof_transfer_active else ROOF_BATTERY_X
        return World(battery_x=roof_target if self.roof_active else BATTERY_POSITIONS[self.scenario])

    def toggle_pair(self):
        if not self.roof_active or not self.pair_unlocked:
            return
        editor = (self.source, self.cursor, self.hint_level, self.used_example)
        if self.pair_active:
            self.pair_draft = editor
            target = self.pair_return
        else:
            self.pair_return = editor
            target = self.pair_draft
        self.pair_active = not self.pair_active
        self.source, self.cursor, self.hint_level, self.used_example = target
        self.runner = Runner(initial_world=self.initial_world())
        self.loaded_source = None
        self.select_all = False
        self.scroll = 0
        self.elapsed = 0.0

    def toggle_roof(self):
        if not self.recall_available:
            return
        editor = (self.source, self.cursor, self.hint_level, self.used_example)
        if self.roof_active:
            if self.roof_transfer_active:
                self.roof_transfer_draft = editor
            else:
                self.roof_draft = editor
            self.source, self.cursor, self.hint_level, self.used_example = self.roof_return
        else:
            self.roof_return = editor
            self.source, self.cursor, self.hint_level, self.used_example = self.roof_transfer_draft if self.roof_transfer_active else self.roof_draft
        self.roof_active = not self.roof_active
        self.runner = Runner(initial_world=self.initial_world())
        self.loaded_source = None
        self.select_all = False
        self.scroll = 0
        self.elapsed = 0.0

    def toggle_roof_transfer(self):
        if not self.roof_active or not self.roof_transfer_unlocked:
            return
        editor = (self.source, self.cursor, self.hint_level, self.used_example)
        if self.roof_transfer_active:
            self.roof_transfer_draft = editor
            target = self.roof_draft
        else:
            self.roof_draft = editor
            target = self.roof_transfer_draft
        self.roof_transfer_active = not self.roof_transfer_active
        self.source, self.cursor, self.hint_level, self.used_example = target
        self.runner = Runner(initial_world=self.initial_world())
        self.loaded_source = None
        self.select_all = False
        self.scroll = 0
        self.elapsed = 0.0

    def toggle_recall(self):
        if self.scenario != 1 or not self.recall_available:
            return
        editor = (self.source, self.cursor, self.hint_level, self.used_example)
        if self.recall_active:
            self.recall_draft = editor
            self.source, self.cursor, self.hint_level, self.used_example = self.saved_editor
        else:
            self.saved_editor = editor
            self.source, self.cursor, self.hint_level, self.used_example = self.recall_draft
        self.recall_active = not self.recall_active
        self.runner.reset()
        self.loaded_source = None
        self.select_all = False
        self.scroll = 0
        self.elapsed = 0.0

    def remember_success(self):
        if self.pair_active:
            return
        if self.roof_active and self.roof_transfer_active and self.runner.world.powered:
            self.pair_unlocked = True
        if self.roof_active:
            if self.runner.world.powered and not self.roof_transfer_active and not self.roof_transfer_unlocked:
                self.roof_transfer_unlocked = True
                self.roof_transfer_draft = (self.source, self.cursor, 0, False)
            if self.runner.world.moves >= 3 and not self.roof_repetition_seen:
                self.roof_repetition_seen = True
                self.hint_level = 0  # Never swap a requested old example into a new full solution.
            return
        if self.scenario == 1 and self.runner.world.powered and not self.recall_active:
            self.recall_available = True

    def activate(self, name):
        if name == 'Laternenpaar' or (self.pair_active and name in ('Dach', 'Dachtransfer', 'Abruf', 'Transfer')):
            self.toggle_pair()
            return
        if name == 'Dachtransfer':
            self.toggle_roof_transfer()
            return
        if name == 'Dach' or (self.roof_active and name in ('Abruf', 'Transfer')):
            self.toggle_roof()
            return
        if name == 'Abruf' or (name == 'Transfer' and self.recall_active):
            self.toggle_recall()
            return
        if name == 'Transfer':
            self.scenario = 1 - self.scenario
            self.runner = Runner(initial_world=World(battery_x=BATTERY_POSITIONS[self.scenario]))
            self.loaded_source = None
            self.hint_level = 0
            self.used_example = False
        elif name == 'Hilfe':
            self.hint_level = (self.hint_level + 1) % 4
            self.used_example |= self.hint_level == 3
            return
        elif name == 'Reset':
            self.runner.reset()
            self.loaded_source = None
        elif name == 'Stop':
            self.runner.stop()
        else:
            if (self.loaded_source != self.source or
                    self.runner.status in ('idle', 'done', 'stopped', 'error')):
                # A fresh transfer attempt always starts at its scenario origin.
                # Repeated Run/Step after failure cannot accumulate movement.
                if self.scenario == 1 or self.roof_active:
                    self.runner.reset()
                try:
                    self.runner.load(self.source)
                except ProgramError:
                    return
                self.loaded_source = self.source
            if name == 'Run':
                self.runner.run()
            else:
                self.runner.step()
        self.remember_success()
        self.elapsed = 0.0

    def edited(self):
        self.runner.stop()
        self.runner.line = None
        self.runner.error = ''

    def editor_key(self):
        if self.pair_active:
            return 'pair'
        if self.roof_active:
            return 'roof_transfer' if self.roof_transfer_active else 'roof'
        return 'recall' if self.recall_active else 'original'

    def editor_state(self):
        return self.source, self.cursor, self.select_all

    def change_text(self, source, cursor, selected=False):
        if len(source) > MAX_SOURCE or source == self.source:
            return
        undo, redo = self.edit_histories.setdefault(self.editor_key(), ([], []))
        undo.append(self.editor_state())
        del undo[:-32]
        redo.clear()
        self.source, self.cursor, self.select_all = source, max(0, min(cursor, len(source))), selected
        self.edited()

    def restore_edit(self, redo=False):
        past, future = self.edit_histories.setdefault(self.editor_key(), ([], []))
        origin, destination = (future, past) if redo else (past, future)
        if not origin:
            return
        destination.append(self.editor_state())
        del destination[:-32]
        self.source, self.cursor, self.select_all = origin.pop()
        self.edited()

    def insert(self, text):
        base = '' if self.select_all else self.source
        cursor = 0 if self.select_all else min(self.cursor, len(base))
        self.change_text(base[:cursor] + text + base[cursor:], cursor + len(text))

    def visible_buttons(self):
        visible = {}
        pair_link = self.roof_active and self.pair_unlocked
        for name, rect in self.buttons.items():
            if self.pair_active and name in ('Dach', 'Dachtransfer', 'Abruf', 'Transfer'):
                continue
            if name == 'Laternenpaar' and not pair_link:
                continue
            if name == 'Transfer' and pair_link:
                continue
            if name == 'Dachtransfer' and not (self.roof_active and self.roof_transfer_unlocked):
                continue
            if name == 'Dach' and not self.recall_available:
                continue
            if name == 'Abruf' and (self.roof_active or self.scenario != 1 or not self.recall_available):
                continue
            visible[name] = rect
        return visible

    def handle(self, event):
        if event.type == pygame.QUIT:
            self.alive = False
        elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            w, h = self.screen.get_size()
            pos = event.pos[0] * 1200 / w, event.pos[1] * 720 / h
            for name, rect in self.visible_buttons().items():
                if rect.collidepoint(pos):
                    self.activate(name)
                    return
            if pygame.Rect(790, 210, 370, 310).collidepoint(pos):
                lines = self.source.split('\n')
                row = min(len(lines) - 1, max(0, int((pos[1] - 225) // 26) + self.scroll))
                col = max(0, int((pos[0] - 830) // self.mono.size(' ')[0]))
                self.cursor = sum(len(line) + 1 for line in lines[:row]) + min(col, len(lines[row]))
                self.select_all = False
                self.focus = True
        elif event.type == pygame.TEXTINPUT and self.focus:
            self.insert(event.text)
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_s and event.mod & pygame.KMOD_CTRL:
                self.save_drafts(force=True)
                return
            shortcuts = {pygame.K_F5: 'Run', pygame.K_F6: 'Step',
                         pygame.K_ESCAPE: 'Stop', pygame.K_F2: 'Reset',
                         pygame.K_F1: 'Hilfe', pygame.K_F3: 'Transfer', pygame.K_F4: 'Abruf', pygame.K_F7: 'Dach', pygame.K_F8: 'Dachtransfer', pygame.K_F9: 'Laternenpaar'}
            if event.key in shortcuts:
                self.activate(shortcuts[event.key])
                return
            if not self.focus:
                return
            if event.mod & pygame.KMOD_CTRL and event.key in (pygame.K_z, pygame.K_y):
                self.restore_edit(redo=event.key == pygame.K_y or bool(event.mod & pygame.KMOD_SHIFT))
                return
            self.cursor = min(self.cursor, len(self.source))
            if event.key == pygame.K_a and event.mod & pygame.KMOD_CTRL:
                self.select_all = True
            elif event.key in (pygame.K_RETURN, pygame.K_KP_ENTER):
                previous = self.source[:self.cursor].split('\n')[-1]
                spaces = len(previous) - len(previous.lstrip(' '))
                self.insert('\n' + ' ' * min(16, spaces + (4 if previous.rstrip().endswith(':') else 0)))
            elif event.key == pygame.K_TAB:
                if event.mod & pygame.KMOD_SHIFT:
                    start = self.source.rfind('\n', 0, self.cursor) + 1
                    count = min(4, len(self.source[start:]) - len(self.source[start:].lstrip(' ')))
                    self.change_text(self.source[:start] + self.source[start + count:], max(start, self.cursor - count))
                else:
                    self.insert('    ')
            elif event.key == pygame.K_BACKSPACE:
                if self.select_all:
                    self.insert('')
                elif self.cursor:
                    self.change_text(self.source[:self.cursor - 1] + self.source[self.cursor:], self.cursor - 1)
            elif event.key == pygame.K_DELETE:
                if self.select_all:
                    self.insert('')
                else:
                    self.change_text(self.source[:self.cursor] + self.source[self.cursor + 1:], self.cursor)
            elif event.key in (pygame.K_LEFT, pygame.K_RIGHT):
                self.cursor = max(0, min(len(self.source), self.cursor + (1 if event.key == pygame.K_RIGHT else -1)))
                self.select_all = False
            elif event.key == pygame.K_HOME:
                self.cursor = self.source.rfind('\n', 0, self.cursor) + 1
                self.select_all = False
            elif event.key == pygame.K_END:
                end = self.source.find('\n', self.cursor)
                self.cursor = len(self.source) if end == -1 else end
                self.select_all = False
            elif event.key in (pygame.K_UP, pygame.K_DOWN):
                lines = self.source.split('\n')
                row = self.source[:self.cursor].count('\n')
                col = len(self.source[:self.cursor].split('\n')[-1])
                row = max(0, min(len(lines) - 1, row + (1 if event.key == pygame.K_DOWN else -1)))
                self.cursor = sum(len(line) + 1 for line in lines[:row]) + min(col, len(lines[row]))
                self.select_all = False

    def update(self, dt):
        self.scene_time += max(0.0, dt)
        self.elapsed += dt
        if self.elapsed >= 0.45:
            self.runner.tick()  # Never catch up with an unbounded action loop.
            self.remember_success()
            self.elapsed = 0.0
        if self.runner.world.moves == 0:
            self.visual_x = float(self.runner.world.x)
        else:
            self.visual_x += (self.runner.world.x - self.visual_x) * min(1.0, max(0.0, dt) / 0.12)
        self.save_drafts()

    def alley(self):
        scene = pygame.Surface((350, 240))
        scene.fill('#171c32')
        # Distant silhouettes, warm windows, pipes and shop shutters.
        for x, y, w, h in [(0, 15, 52, 145), (58, 0, 68, 160), (133, 31, 45, 130),
                           (186, 10, 67, 151), (262, 0, 88, 161)]:
            pygame.draw.rect(scene, '#222942', (x, y, w, h))
            for wy in range(y + 16, 130, 25):
                for wx in range(x + 9, x + w - 9, 18):
                    pygame.draw.rect(scene, '#f6bc77' if (wx + wy) % 3 else '#455578', (wx, wy, 6, 9))
        pygame.draw.rect(scene, '#30394f', (0, 116, 350, 70))
        pygame.draw.rect(scene, '#1b263a', (15, 129, 73, 57))
        for y in range(132, 184, 6):
            pygame.draw.line(scene, '#42506a', (17, y), (86, y))
        # The machine and its supply cable visibly share the battery's state.
        powered = self.runner.world.powered
        glow = CYAN if powered else '#58667c'
        pygame.draw.rect(scene, '#193c42' if powered else '#171c30', (216, 120, 53, 66))
        pygame.draw.rect(scene, glow, (216, 120, 53, 66), 2)
        pygame.draw.rect(scene, '#6bf9de' if powered else '#29364b', (221, 126, 43, 13))
        label = self.sign_font.render('ON' if powered else 'OFF', False, '#102b32' if powered else MUTED)
        scene.blit(label, (230, 126))
        for item_x in (224, 238, 252):
            pygame.draw.rect(scene, '#ffc875' if powered else '#3a4054', (item_x, 146, 8, 13))
            pygame.draw.rect(scene, PINK if powered else '#484258', (item_x, 146, 8, 3))
        pygame.draw.rect(scene, '#0b1527', (225, 170, 34, 8))
        cable_x = 40 + 36 * self.runner.world.battery_x
        pygame.draw.lines(scene, CYAN if powered else '#536077', False,
                          [(cable_x, 184), (cable_x, 181), (208, 181), (208, 168), (216, 168)], 2)
        if powered:
            pygame.draw.line(scene, PINK, (213, 189), (273, 189), 2)
        pygame.draw.line(scene, '#62728b', (301, 108), (301, 180), 4)
        pygame.draw.line(scene, '#62728b', (301, 108), (333, 108), 4)
        pygame.draw.rect(scene, '#472f52', (106, 122, 90, 28))
        pygame.draw.rect(scene, PINK, (109, 125, 84, 22), 1)
        sign = self.sign_font.render('NEON / 09', False, PINK)
        scene.blit(sign, (116, 130))
        pygame.draw.line(scene, CYAN, (0, 117), (88, 117), 2)
        pygame.draw.line(scene, '#101528', (0, 83), (350, 97), 2)
        # A restored string of warm lamps makes the whole alley respond to code.
        for lx in range(24, 340, 33):
            ly = 92 + lx // 40
            pygame.draw.line(scene, '#52617b', (lx, ly - 7), (lx, ly + 3))
            if powered:
                pygame.draw.rect(scene, '#5b4749', (lx - 5, ly, 11, 11))
            pygame.draw.rect(scene, '#ffcf8a' if powered else '#34415c', (lx - 2, ly + 2, 5, 5))
        if powered:
            scene.blit(self.sign_font.render('DACHWEG >', False, '#ffc875'), (182, 45))
        if self.roof_active:
            # Same tile simulation, a different small handcrafted place above the alley.
            scene.fill('#18243c', (0, 108, 350, 78))
            pygame.draw.circle(scene, '#b7c8e2', (294, 33), 12)
            pygame.draw.circle(scene, '#222942', (289, 29), 12)
            for vx in (12, 122, 190):
                pygame.draw.rect(scene, '#45536b', (vx, 159, 20, 26))
                pygame.draw.rect(scene, '#6c7c94', (vx - 3, 157, 26, 4))
                for vy in (165, 171, 177):
                    pygame.draw.line(scene, '#253149', (vx + 4, vy), (vx + 16, vy))
            pygame.draw.line(scene, '#667994', (0, 184), (350, 184), 3)
            for rail_x in range(5, 350, 32):
                pygame.draw.line(scene, '#3d516c', (rail_x, 182), (rail_x, 173), 2)
            if self.pair_active:
                world = self.runner.world
                for index, (position, lit) in enumerate(((world.battery_x, world.first_lit), (world.second_battery_x, world.powered)), 1):
                    lx = 29 + 36 * position
                    pygame.draw.line(scene, '#7989a1', (lx, 130), (lx, 183), 3)
                    pygame.draw.rect(scene, '#46556c', (lx - 12, 119, 26, 25))
                    pygame.draw.rect(scene, '#ffe09c' if lit else '#27394d', (lx - 8, 123, 18, 17))
                    scene.blit(self.sign_font.render(str(index), False, CYAN if lit else MUTED), (lx - 3, 108))
                if world.powered:
                    pygame.draw.line(scene, CYAN, (173, 148), (281, 148), 2)
            else:
                pygame.draw.line(scene, '#7989a1', (318, 130), (318, 183), 3)
                pygame.draw.rect(scene, '#46556c', (306, 119, 26, 25))
                pygame.draw.rect(scene, '#ffe09c' if powered else '#27394d', (310, 123, 18, 17))
                if powered:
                    for start, end in [((302, 117), (294, 111)), ((336, 117), (344, 111)), ((318, 114), (318, 104))]:
                        pygame.draw.line(scene, '#ffd584', start, end, 2)
                scene.blit(self.sign_font.render('DACHLATERNE', False, CYAN if powered else MUTED), (174, 112))
        scene.fill('#273248', (0, 186, 350, 54))
        for x in range(9):
            tile_x = 13 + 36 * x
            pygame.draw.rect(scene, '#37445a', (tile_x, 192, 32, 30))
            pygame.draw.line(scene, '#46546b', (tile_x, 192), (tile_x + 31, 192))
            if self.roof_active and 1 < x <= self.runner.world.x:
                pygame.draw.line(scene, CYAN, (tile_x + 6, 217), (tile_x + 26, 217), 2)
        if self.pair_active:
            for position in (self.runner.world.battery_x, self.runner.world.second_battery_x):
                pygame.draw.rect(scene, MUTED, (13 + position * 36, 192, 32, 30), 1)
        goal = pygame.Rect(13 + self.runner.world.target_x * 36, 192, 32, 30)
        pygame.draw.rect(scene, CYAN, goal, 2)
        pygame.draw.line(scene, CYAN, (goal.x + 10, 229), (goal.x + 23, 229), 2)
        if not self.runner.world.powered:
            bx = 29 + 36 * self.runner.world.target_x
            pygame.draw.rect(scene, '#111a2c', (bx - 12, 161, 24, 16))
            pygame.draw.rect(scene, '#ffd584', (bx - 9, 164, 16, 9), 2)
            pygame.draw.rect(scene, '#ffd584', (bx + 7, 167, 3, 3))
            pygame.draw.line(scene, '#ffd584', (bx - 3, 166), (bx - 3, 171))
            pygame.draw.line(scene, '#ffd584', (bx - 5, 168), (bx - 1, 168))
        # Original cat silhouette: ear triangles, outlined head, curled tail, bright eyes.
        if self.runner.world.moves == 0:
            self.visual_x = float(self.runner.world.x)
        cx = round(29 + 36 * self.visual_x)
        moving = abs(self.runner.world.x - self.visual_x) > 0.02
        tail = 1 if int(self.scene_time * 2) % 2 else 0
        blink = self.scene_time % 3.8 > 3.65
        pygame.draw.ellipse(scene, '#111a2c', (cx - 14, 213, 31, 7))
        pygame.draw.lines(scene, '#77849d', False, [(cx - 8, 208), (cx - 18, 204), (cx - 20, 192), (cx - 16 + tail, 189 - tail)], 5)
        pygame.draw.lines(scene, '#0d1020', False, [(cx - 8, 208), (cx - 18, 204), (cx - 20, 192), (cx - 16 + tail, 189 - tail)], 3)
        pygame.draw.rect(scene, '#7a88a2', (cx - 9, 192, 20, 23))
        pygame.draw.rect(scene, '#0b1020', (cx - 8, 193, 18, 21))
        pygame.draw.polygon(scene, '#8794ad', [(cx - 11, 187), (cx - 11, 175), (cx - 3, 181), (cx + 5, 181), (cx + 12, 175), (cx + 13, 195), (cx - 11, 195)])
        pygame.draw.polygon(scene, '#090f1c', [(cx - 10, 188), (cx - 10, 177), (cx - 3, 183), (cx + 5, 183), (cx + 11, 177), (cx + 12, 194), (cx - 10, 194)])
        pygame.draw.rect(scene, CYAN, (cx - 6, 187 if blink else 186, 4, 1 if blink else 3))
        pygame.draw.rect(scene, CYAN, (cx + 5, 187 if blink else 186, 4, 1 if blink else 3))
        pygame.draw.rect(scene, PINK, (cx + 1, 191, 2, 2))
        pygame.draw.rect(scene, '#080e1b', (cx - 9, 211 if moving else 212, 6, 5))
        pygame.draw.rect(scene, '#080e1b', (cx + 6, 213 if moving else 212, 6, 5))
        if self.runner.world.powered:
            scene.blit(self.sign_font.render('mrr', False, '#ffcf8a'), (cx - 11, 155))
        if not self.runner.world.moves:
            scene.blit(self.sign_font.render('NOX', False, '#cad5ea'), (cx - 13, 151))
        viewport = self.world_display_rect()
        self.canvas.blit(pygame.transform.scale(scene, viewport.size), viewport.topleft)

    def hint_lines(self):
        if not self.hint_level:
            return ()
        hints = (ROOF_LOOP_HINTS if self.roof_repetition_seen else ROOF_WALK_HINTS) if self.roof_active else HINTS[self.scenario]
        if self.roof_active and self.roof_transfer_active:
            hints = ROOF_TRANSFER_HINTS
        if self.pair_active:
            hints = PAIR_HINTS
        return hints[self.hint_level - 1]

    def hint_panel_rect(self):
        return pygame.Rect(40, 170, 700, max(170, 70 + len(self.hint_lines()) * 28))

    def world_display_rect(self):
        if not self.hint_level:
            return pygame.Rect(40, 170, 700, 480)
        top = self.hint_panel_rect().bottom + 12
        height = 650 - top
        width = int(height * 350 / 240)
        return pygame.Rect(40 + (700 - width) // 2, top, width, height)

    def draw_hint(self):
        if self.hint_level:
            lines = self.hint_lines()
            panel = self.hint_panel_rect()
            pygame.draw.rect(self.canvas, '#182537', panel, border_radius=8)
            pygame.draw.rect(self.canvas, CYAN, panel, 1, border_radius=8)
            heading = f'OPTIONALE HILFE {self.hint_level}/3'
            if self.hint_level == 3:
                heading += ' · CODEBEISPIEL (UNTERSTÜTZT)'
            self.text(heading, (60, 188), CYAN, self.small)
            for index, line in enumerate(lines):
                self.text(line, (60, 224 + index * 28), INK,
                          self.mono if self.hint_level == 3 else self.small)
            if self.hint_level < 3:
                self.text('Weitere Hilfe nur auf deinen Klick. Dein Code bleibt unverändert.',
                          (60, panel.bottom - 24), MUTED, self.small)

    def draw(self):
        self.canvas.fill(BG)
        self.text('NEONPAW', (40, 28), CYAN, self.big)
        if not self.roof_active:
            self.text('LICHT FÜR NOX · EINE NACHT IN DER GASSE', (42, 87), MUTED, self.small)
        stage = '03 / AUS EIGENER KRAFT' if self.recall_active else ('02 / DER ZWEITE ANSCHLUSS' if self.scenario else '01 / LICHT FÜR NOX')
        if self.roof_active:
            stage = '05 / DIE FERNE LATERNE' if self.roof_transfer_active else '04 / EIN PLAN FÜR VIELE SCHRITTE'
        if self.pair_active:
            stage = '06 / ZWEI LATERNEN, EIN PLAN'
        self.text(stage,
                  (42, 135), INK, self.small)
        self.alley()
        self.text('PYTHON / DEIN EIGENES PROGRAMM' if self.scenario else 'PYTHON / DEIN ERSTER BEFEHL',
                  (790, 42), CYAN, self.small)
        world = self.runner.world
        title = 'OHNE VORLAGE' if self.recall_active else ('DEIN EIGENER WEG' if self.scenario else TITLE)
        heading = 'ABSCHNITT GESCHAFFT' if world.powered and self.recall_active else ('DIE GASSE LEUCHTET' if world.powered else title)
        if self.roof_active:
            heading = ('DÄCHER VERBUNDEN' if self.roof_transfer_active else 'DACHLATERNE GERETTET') if world.powered else ('DIE FERNE LATERNE' if self.roof_transfer_active else 'DER LANGE DACHWEG')
        if self.pair_active:
            heading = 'DER DACHWEG LEUCHTET' if world.powered else 'ZWEI LATERNEN, EIN PLAN'
        self.text(heading, (790, 82), INK)
        if world.powered:
            hint = 'Ziel erreicht — mit Codebeispiel.' if self.used_example else 'Warmlicht! Nox hat die Gasse zurück.'
            instruction = 'Weiter auf den Dachweg · F7' if self.recall_active else ('Dein eigener Plan? Selbst schreiben mit F4.' if self.scenario else 'Der zweite Anschluss wartet. Weiter mit F3.')
        elif self.recall_active:
            hint, instruction = 'Bring das Licht mit deinem eigenen Plan zurück.', 'Deine Eigenlösung wartet unter Zurück.'
        elif self.scenario:
            hint, instruction = 'Der zweite Anschluss liegt weiter rechts.', 'Ändere deinen Code. Run beginnt am Start.'
        elif world.x == world.battery_x:
            hint, instruction = 'collect() nimmt die Batterie auf.', 'Neue Zeile ergänzen, dann Reset und Run.'
        elif world.moves:
            hint, instruction = 'Batterie verpasst? Reset bringt dich zurück.', 'move_right() gehen · collect() aufnehmen'
        else:
            hint, instruction = 'Nox braucht Licht. Der Automat ist aus.', 'Run: Beobachte deinen ersten Pfotenschritt.'
        if self.roof_active:
            if world.powered:
                hint = 'Ziel erreicht — mit Codebeispiel.' if self.used_example else 'Nox leuchtet den Weg über die Dächer aus.'
                instruction = 'Nox schnurrt: Dein Plan reicht jetzt weiter!' if self.roof_transfer_active else 'Nächste Laterne · F8: Passe deinen Plan an.'
            elif self.roof_transfer_active:
                hint = 'Die nächste Laterne steht weiter rechts.'
                instruction = 'Passe deinen Plan an. Run startet am Anfang.'
            elif self.roof_repetition_seen:
                hint = 'Mehrmals derselbe Schritt. Geht das kürzer?'
                instruction = 'F1: freiwillige Hilfe zu for und range.'
            else:
                hint = 'Die Laterne wartet weit rechts. Plane den Weg.'
                instruction = 'Nutze erst die bekannten Bewegungsbefehle.'
        if self.pair_active:
            hint = 'Beide Lichter an. Nox hat einen Heimweg!' if world.powered else ('Ein Licht brennt. Das zweite wartet noch.' if world.first_lit else 'Zwei dunkle Laternen. Ein eigener Plan.')
            instruction = 'Dein Programm verbindet beide Dächer.' if world.powered else 'Bewegen und Aufnehmen passend verbinden.'
        elif self.roof_active and self.roof_transfer_active and world.powered:
            instruction = 'Zwei Laternen · F9: Verbinde die Dächer.'
        self.text(hint, (790, 118), MUTED, self.small)
        self.text(instruction, (790, 149), INK, self.small)
        state_label = 'AUTOMAT: AN' if world.powered else 'AUTOMAT: AUS · Batterie auf dem Leuchtfeld'
        if self.roof_active:
            state_label = f'DACHWEG: {min(world.moves, world.battery_x - 1)}/{world.battery_x - 1} Schritte · ' + ('LICHT AN' if world.powered else 'Licht aus')
        if self.pair_active:
            state_label = f'LATERNEN: {2 if world.powered else int(world.first_lit)}/2 AN'
        self.text(state_label,
                  (790, 174), CYAN if world.powered else MUTED, self.small)
        pygame.draw.rect(self.canvas, '#1c2335', (780, 198, 400, 325), border_radius=8)
        lines = self.source.split('\n')
        cursor_row = self.source[:self.cursor].count('\n')
        active_row = self.runner.line - 1 if self.runner.line is not None else cursor_row
        self.scroll = max(0, active_row - 9)
        self.canvas.set_clip(pygame.Rect(790, 210, 380, 306))
        for row, line in enumerate(lines[self.scroll:self.scroll + 11], self.scroll):
            y = 225 + (row - self.scroll) * 26
            if self.select_all or self.runner.line == row + 1:
                pygame.draw.rect(self.canvas, '#374563', (795, y - 2, 370, 26))
            self.text(str(row + 1), (798, y), MUTED, self.small)
            self.text(line, (830, y), CYAN, self.mono)
        if self.focus and not self.select_all:
            col = len(self.source[:self.cursor].split('\n')[-1])
            x = 830 + self.mono.size(lines[cursor_row][:col])[0]
            y = 225 + (cursor_row - self.scroll) * 26
            pygame.draw.line(self.canvas, INK, (x, y), (x, y + 21), 2)
        self.canvas.set_clip(None)
        for name, rect in self.visible_buttons().items():
            pygame.draw.rect(self.canvas, CYAN if name == 'Run' else '#303c56', rect, border_radius=5)
            caption = name
            if name == 'Laternenpaar':
                caption = 'Zur Eigenlösung · F9' if self.pair_active else 'Zwei Laternen · F9'
            elif name == 'Dachtransfer':
                caption = 'Erste Laterne · F8' if self.roof_transfer_active else 'Nächste Laterne · F8'
            elif name == 'Transfer':
                caption = 'Zurück zum Einstieg · F3' if self.scenario else ('Weiter: neuer Weg · F3' if world.powered else 'Freier Einstieg · F3')
            elif name == 'Dach':
                caption = 'Zur Gasse · F7' if self.roof_active else 'Dachweg · F7'
            elif name == 'Abruf':
                caption = 'Zur Eigenlösung · F4' if self.recall_active else 'Selbst schreiben · F4'
            elif name == 'Hilfe':
                caption = ('Hilfe · F1', 'Nächster Tipp · F1', 'Beispiel anzeigen · F1', 'Hilfe schliessen · F1')[self.hint_level]
            if name == 'Transfer' and self.recall_active:
                caption = 'Zur Eigenlösung · F3'
            if name == 'Transfer' and self.roof_active:
                caption = 'Zurück zu deinem Programm · F3'
            label = self.font.render(caption, True, BG if name == 'Run' else INK)
            self.canvas.blit(label, label.get_rect(center=rect.center))
        self.text('F5 Run  ·  F6 Step  ·  Esc Stop  ·  F2 Reset', (790, 594), MUTED, self.small)
        if self.roof_active and self.runner.commands:
            count = sum(bool(line.strip()) for line in self.source.splitlines())
            self.text(f'Aktion {self.runner.pc}/{len(self.runner.commands)} · {count} Textzeilen', (790, 614), CYAN, self.small)
        statuses = {'idle': 'Startposition. Run startet; dein Code bleibt.', 'paused': 'Step: ein Befehl. Run setzt danach fort.',
                    'running': 'Läuft … Stop hält die Katze an.', 'stopped': 'Stop: Position bleibt. Run startet Code neu.',
                    'done': 'Fertig. Run wiederholt; Reset setzt die Welt zurück.', 'error': 'Kein Problem — korrigiere deinen Code.'}
        if self.scenario or self.roof_active:
            statuses['stopped'] = 'Stop: Position bleibt. Neuer Run beginnt am Start.'
            statuses['done'] = 'Fertig. Neuer Run beginnt am Start; Code bleibt.'
        message = self.runner.error or statuses[self.runner.status]
        words, line, y = message.split(), '', 631
        for word in words:
            if self.small.size(line + word)[0] > 375:
                self.text(line, (790, y), PINK if self.runner.error else INK, self.small)
                line, y = '', y + 22
            line += word + ' '
        self.text(line, (790, y), PINK if self.runner.error else INK, self.small)
        if world.powered:
            objective = ('Nox entdeckt eine dunkle Dachlaterne. Dachweg / F7: Finde deinen nächsten Plan.'
                         if self.recall_active else 'Nox schnurrt. Dein Programm bringt das Licht zurück in die Gasse.')
        elif self.recall_active:
            objective = 'Baue dein Programm selbst. Deine Eigenlösung bleibt in dieser Sitzung erhalten.'
        elif self.scenario:
            objective = 'Versorge den Automaten. Die Batterie liegt an einem neuen Ort.'
        elif world.x == world.battery_x:
            objective = 'Erster Schritt geschafft! Nimm jetzt die Batterie mit collect() auf.'
        elif world.moves:
            objective = 'Die Batterie liegt auf dem Leuchtfeld. Reset für einen neuen Versuch.'
        else:
            objective = 'Weck den Nacht-Automaten. Der erste Schritt bringt Nox zur Batterie.'
        if self.roof_active:
            objective = ('Nox schnurrt. Die Dachlaterne brennt — dein Ablauf funktioniert!' if world.powered
                         else 'Erreiche die Batterie am Leuchtfeld und schalte die Dachlaterne ein.')
        if self.pair_active:
            objective = 'Nox schnurrt: Zwei Lichter, ein zusammenhängender Heimweg.' if world.powered else 'Aktiviere beide Laternen in einem Ablauf. Die erste allein reicht noch nicht.'
        self.text(objective, (40, 666), CYAN if world.moves else INK, self.small)
        self.draw_hint()
        if self.storage_message:
            self.text(self.storage_message, (40, 694), PINK if self.storage_error else MUTED, self.small)
        pygame.transform.scale(self.canvas, self.screen.get_size(), self.screen)
        pygame.display.flip()


def main():
    pygame.init()
    app = App(save_path=drafts.default_path())
    clock = pygame.time.Clock()
    while app.alive:
        dt = clock.tick(60) / 1000
        for event in pygame.event.get():
            app.handle(event)
        app.update(dt)
        app.draw()
    pygame.quit()


if __name__ == '__main__':
    main()
