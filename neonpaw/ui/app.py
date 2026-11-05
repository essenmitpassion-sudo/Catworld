"""One-screen G0: real SDL controls and an original procedural pixel alley."""
import pygame
from neonpaw.code.runner import Runner, ProgramError, MAX_SOURCE
from neonpaw.content.levels import TITLE, OBJECTIVE, START_CODE, GOAL_X

BG = '#101321'
INK = '#e5eafa'
MUTED = '#9baac5'
CYAN = '#65f3dd'
PINK = '#ff79bc'


class App:
    def __init__(self):
        self.screen = pygame.display.set_mode((1200, 720), pygame.RESIZABLE)
        pygame.display.set_caption('NEONPAW — Erster Pfotenschritt')
        self.canvas = pygame.Surface((1200, 720))
        self.font = pygame.font.Font(None, 26)
        self.small = pygame.font.Font(None, 22)
        self.big = pygame.font.Font(None, 58)
        self.mono = pygame.font.SysFont('monospace', 20)
        self.sign_font = pygame.font.Font(None, 19)
        self.runner = Runner()
        self.source = START_CODE
        self.loaded_source = None
        self.cursor = len(self.source)
        self.select_all = False
        self.focus = True
        self.scroll = 0
        self.elapsed = 0.0
        self.alive = True
        self.buttons = {name: pygame.Rect(790 + i * 95, 540, 85, 42)
                        for i, name in enumerate(('Run', 'Step', 'Stop', 'Reset'))}
        pygame.key.start_text_input()

    def text(self, value, pos, color=INK, font=None):
        self.canvas.blit((font or self.font).render(value, True, color), pos)

    def activate(self, name):
        if name == 'Reset':
            self.runner.reset()
            self.loaded_source = None
        elif name == 'Stop':
            self.runner.stop()
        else:
            if (self.loaded_source != self.source or
                    self.runner.status in ('idle', 'done', 'stopped', 'error')):
                try:
                    self.runner.load(self.source)
                except ProgramError:
                    return
                self.loaded_source = self.source
            if name == 'Run':
                self.runner.run()
            else:
                self.runner.step()
        self.elapsed = 0.0

    def edited(self):
        self.runner.stop()
        self.runner.line = None
        self.runner.error = ''

    def insert(self, text):
        base = '' if self.select_all else self.source
        cursor = 0 if self.select_all else min(self.cursor, len(base))
        if len(base) + len(text) <= MAX_SOURCE:
            self.source = base[:cursor] + text + base[cursor:]
            self.cursor = cursor + len(text)
            self.select_all = False
            self.edited()

    def handle(self, event):
        if event.type == pygame.QUIT:
            self.alive = False
        elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            w, h = self.screen.get_size()
            pos = event.pos[0] * 1200 / w, event.pos[1] * 720 / h
            for name, rect in self.buttons.items():
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
            shortcuts = {pygame.K_F5: 'Run', pygame.K_F6: 'Step',
                         pygame.K_ESCAPE: 'Stop', pygame.K_F2: 'Reset'}
            if event.key in shortcuts:
                self.activate(shortcuts[event.key])
                return
            if not self.focus:
                return
            self.cursor = min(self.cursor, len(self.source))
            if event.key == pygame.K_a and event.mod & pygame.KMOD_CTRL:
                self.select_all = True
            elif event.key in (pygame.K_RETURN, pygame.K_KP_ENTER):
                self.insert('\n')
            elif event.key == pygame.K_BACKSPACE:
                if self.select_all:
                    self.insert('')
                elif self.cursor:
                    self.source = self.source[:self.cursor - 1] + self.source[self.cursor:]
                    self.cursor -= 1
                    self.edited()
            elif event.key == pygame.K_DELETE:
                if self.select_all:
                    self.insert('')
                else:
                    self.source = self.source[:self.cursor] + self.source[self.cursor + 1:]
                    self.edited()
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
        self.elapsed += dt
        if self.elapsed >= 0.45:
            self.runner.tick()  # Never catch up with an unbounded action loop.
            self.elapsed = 0.0

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
        pygame.draw.rect(scene, '#171c30', (218, 123, 49, 63))
        pygame.draw.rect(scene, '#58667c', (216, 120, 53, 4))
        pygame.draw.line(scene, '#62728b', (301, 108), (301, 180), 4)
        pygame.draw.line(scene, '#62728b', (301, 108), (333, 108), 4)
        pygame.draw.rect(scene, '#472f52', (106, 122, 90, 28))
        pygame.draw.rect(scene, PINK, (109, 125, 84, 22), 1)
        sign = self.sign_font.render('NEON / 09', False, PINK)
        scene.blit(sign, (116, 130))
        pygame.draw.line(scene, CYAN, (0, 117), (88, 117), 2)
        pygame.draw.line(scene, '#101528', (0, 83), (350, 97), 2)
        scene.fill('#273248', (0, 186, 350, 54))
        for x in range(9):
            tile_x = 13 + 36 * x
            pygame.draw.rect(scene, '#37445a', (tile_x, 192, 32, 30))
            pygame.draw.line(scene, '#46546b', (tile_x, 192), (tile_x + 31, 192))
        goal = pygame.Rect(13 + GOAL_X * 36, 192, 32, 30)
        pygame.draw.rect(scene, CYAN, goal, 2)
        pygame.draw.line(scene, CYAN, (goal.x + 10, 229), (goal.x + 23, 229), 2)
        # Original cat silhouette: ear triangles, outlined head, curled tail, bright eyes.
        cx = 29 + 36 * self.runner.world.x
        pygame.draw.ellipse(scene, '#111a2c', (cx - 14, 213, 31, 7))
        pygame.draw.lines(scene, '#77849d', False, [(cx - 8, 208), (cx - 18, 204), (cx - 20, 192), (cx - 16, 189)], 5)
        pygame.draw.lines(scene, '#0d1020', False, [(cx - 8, 208), (cx - 18, 204), (cx - 20, 192), (cx - 16, 189)], 3)
        pygame.draw.rect(scene, '#7a88a2', (cx - 9, 192, 20, 23))
        pygame.draw.rect(scene, '#0b1020', (cx - 8, 193, 18, 21))
        pygame.draw.polygon(scene, '#8794ad', [(cx - 11, 187), (cx - 11, 175), (cx - 3, 181), (cx + 5, 181), (cx + 12, 175), (cx + 13, 195), (cx - 11, 195)])
        pygame.draw.polygon(scene, '#090f1c', [(cx - 10, 188), (cx - 10, 177), (cx - 3, 183), (cx + 5, 183), (cx + 11, 177), (cx + 12, 194), (cx - 10, 194)])
        pygame.draw.rect(scene, CYAN, (cx - 6, 186, 4, 3))
        pygame.draw.rect(scene, CYAN, (cx + 5, 186, 4, 3))
        pygame.draw.rect(scene, PINK, (cx + 1, 191, 2, 2))
        pygame.draw.rect(scene, '#080e1b', (cx - 9, 212, 6, 5))
        pygame.draw.rect(scene, '#080e1b', (cx + 6, 212, 6, 5))
        self.canvas.blit(pygame.transform.scale(scene, (700, 480)), (40, 170))

    def draw(self):
        self.canvas.fill(BG)
        self.text('NEONPAW', (40, 28), CYAN, self.big)
        self.text('KLEINE PFOTEN. ECHTER CODE.', (42, 87), MUTED, self.small)
        self.text('01 / DIE GASSE ERWACHT', (42, 135), INK, self.small)
        self.alley()
        self.text('PYTHON / DEIN ERSTER BEFEHL', (790, 42), CYAN, self.small)
        self.text(TITLE, (790, 82), INK)
        self.text('Ein Befehl. Ein Feld nach rechts.', (790, 118), MUTED, self.small)
        self.text('Drücke Run und beobachte die Katze.', (790, 149), INK, self.small)
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
        for name, rect in self.buttons.items():
            pygame.draw.rect(self.canvas, CYAN if name == 'Run' else '#303c56', rect, border_radius=5)
            label = self.font.render(name, True, BG if name == 'Run' else INK)
            self.canvas.blit(label, label.get_rect(center=rect.center))
        self.text('F5 Run  ·  F6 Step  ·  Esc Stop  ·  F2 Reset', (790, 594), MUTED, self.small)
        statuses = {'idle': 'Startposition. Run startet; dein Code bleibt.', 'paused': 'Step: ein Befehl. Run setzt danach fort.',
                    'running': 'Läuft … Stop hält die Katze an.', 'stopped': 'Stop: Position bleibt. Run startet Code neu.',
                    'done': 'Fertig. Run wiederholt; Reset setzt die Welt zurück.', 'error': 'Kein Problem — korrigiere deinen Code.'}
        message = self.runner.error or statuses[self.runner.status]
        words, line, y = message.split(), '', 631
        for word in words:
            if self.small.size(line + word)[0] > 375:
                self.text(line, (790, y), PINK if self.runner.error else INK, self.small)
                line, y = '', y + 22
            line += word + ' '
        self.text(line, (790, y), PINK if self.runner.error else INK, self.small)
        success = self.runner.world.moves > 0
        self.text('Erster Schritt geschafft! Dein Code bewegt die Welt.' if success else OBJECTIVE,
                  (40, 666), CYAN if success else INK, self.small)
        pygame.transform.scale(self.canvas, self.screen.get_size(), self.screen)
        pygame.display.flip()


def main():
    pygame.init()
    app = App()
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
