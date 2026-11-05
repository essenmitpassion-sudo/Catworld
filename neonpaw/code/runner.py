"""Bounded interpreter for zero-argument move_right/collect calls, not general Python."""
import ast
from neonpaw.core.world import World, transition

MAX_SOURCE = 4096
MAX_COMMANDS = 64
MAX_NODES = 320
MAX_DEPTH = 16


class ProgramError(ValueError):
    def __init__(self, message, line=None):
        self.line = line
        super().__init__(f'Zeile {line}: {message}' if line else message)


def parse(source: str) -> tuple[tuple[int, str], ...]:
    if len(source) > MAX_SOURCE:
        raise ProgramError('Dein Programm ist zu lang (maximal 4096 Zeichen).')
    try:
        tree = ast.parse(source)
    except (SyntaxError, ValueError, RecursionError) as exc:
        raise ProgramError('Python-Syntax prüfen: Klammern und Einrückung.',
                           getattr(exc, 'lineno', None)) from None
    stack = [(tree, 0)]
    count = 0
    while stack:
        node, depth = stack.pop()
        count += 1
        if count > MAX_NODES or depth > MAX_DEPTH:
            raise ProgramError('Das Programm ist zu komplex.', getattr(node, 'lineno', None))
        stack.extend((child, depth + 1) for child in ast.iter_child_nodes(node))
    if len(tree.body) > MAX_COMMANDS:
        raise ProgramError('Maximal 64 Befehle pro Programm.')
    commands = []
    for stmt in tree.body:
        if not (isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Call)
                and isinstance(stmt.value.func, ast.Name)
                and stmt.value.func.id in ('move_right', 'collect')
                and not stmt.value.args and not stmt.value.keywords):
            raise ProgramError('Erlaubt: move_right() und collect(), jeweils ohne Argumente.', stmt.lineno)
        commands.append((stmt.lineno, stmt.value.func.id))
    return tuple(commands)


class Runner:
    def __init__(self, max_steps=64):
        self.max_steps = max_steps
        self.reset()

    def reset(self):
        self.world = World()
        self.commands = ()
        self.pc = 0
        self.line = None
        self.error = ''
        self.status = 'idle'

    def load(self, source):
        self.commands = ()
        self.pc = 0
        self.line = None
        self.error = ''
        self.status = 'idle'
        try:
            self.commands = parse(source)
        except ProgramError as exc:
            self.line = exc.line
            self.error = str(exc)
            self.status = 'error'
            raise
        self.status = 'paused'

    def run(self):
        if self.status == 'paused':
            self.status = 'running' if self.commands else 'done'

    def stop(self):
        self.status = 'stopped'

    def tick(self):
        if self.status == 'running':
            self._advance()

    def step(self):
        if self.status not in ('paused', 'running'):
            return
        self.status = 'paused'
        self._advance()

    def _advance(self):
        if self.pc >= len(self.commands):
            self.status = 'done'
            return
        self.line, action = self.commands[self.pc]
        if self.pc >= self.max_steps:
            self.error = f'Zeile {self.line}: Sicheres Schrittlimit erreicht.'
            self.status = 'error'
            return
        try:
            self.world = transition(self.world, action)
        except ValueError as exc:
            self.error = f'Zeile {self.line}: {exc}'
            self.status = 'error'
            return
        self.pc += 1
        if self.pc == len(self.commands):
            self.status = 'done'
