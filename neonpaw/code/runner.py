"""Bounded interpreter for zero-argument world actions, not general Python."""
import ast
from difflib import get_close_matches
from neonpaw.core.world import World, transition

MAX_SOURCE = 4096
MAX_COMMANDS = 64
MAX_NODES = 320
MAX_DEPTH = 16
ACTIONS = ('move_right', 'move_left', 'collect', 'toggle')


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
    iterations = 0
    for stmt in tree.body:
        if isinstance(stmt, ast.For):
            if (not isinstance(stmt.target, ast.Name) or
                    stmt.target.id in (*ACTIONS, 'range') or stmt.orelse):
                raise ProgramError('Einfache Schleifenvariable verwenden; kein for/else.', stmt.lineno)
            call = stmt.iter
            if (not isinstance(call, ast.Call) or not isinstance(call.func, ast.Name)
                    or call.func.id != 'range' or call.keywords or not 1 <= len(call.args) <= 3):
                raise ProgramError('range() braucht ein bis drei ganze Zahlen.', stmt.lineno)
            values = []
            for arg in call.args:
                sign = 1
                if isinstance(arg, ast.UnaryOp) and isinstance(arg.op, (ast.USub, ast.UAdd)):
                    sign = -1 if isinstance(arg.op, ast.USub) else 1
                    arg = arg.operand
                if not isinstance(arg, ast.Constant) or type(arg.value) is not int or abs(arg.value) > 64:
                    raise ProgramError('range(): nur feste ganze Zahlen von -64 bis 64.', stmt.lineno)
                values.append(sign * arg.value)
            if len(values) == 3 and values[2] == 0:
                raise ProgramError('Die Schrittweite von range() darf nicht 0 sein.', stmt.lineno)
            count = len(range(*values))
            # Validate the body even for an empty range. No nesting, variable reads or effects.
            body = [parse_action(child) for child in stmt.body]
            iterations += count
            if iterations > MAX_COMMANDS or len(commands) + count * len(body) > MAX_COMMANDS:
                raise ProgramError('Maximal 64 Wiederholungen und 64 Aktionen pro Programm.', stmt.lineno)
            commands.extend(body * count)
        else:
            commands.append(parse_action(stmt))
        if len(commands) > MAX_COMMANDS:
            raise ProgramError('Maximal 64 ausgeführte Aktionen pro Programm.', stmt.lineno)
    return tuple(commands)


def parse_action(stmt):
    if isinstance(stmt, ast.For):
        raise ProgramError('Verschachtelte Schleifen sind hier noch nicht unterstützt.', stmt.lineno)
    if not (isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Call)
            and isinstance(stmt.value.func, ast.Name)):
        raise ProgramError('Hier sind nur move_right(), move_left(), collect() und toggle() ohne Argumente erlaubt.', stmt.lineno)
    name = stmt.value.func.id
    if name not in ACTIONS:
        near = get_close_matches(name, ACTIONS, n=1, cutoff=0.75)
        suggestion = f' Meintest du {near[0]}()?' if near else ' Nutze einen Befehl aus deiner Hilfe.'
        raise ProgramError(f'Unbekannter Befehl {name[:32]}.{suggestion}', stmt.lineno)
    if stmt.value.args or stmt.value.keywords:
        raise ProgramError(f'{name}() braucht hier keine Argumente zwischen den Klammern.', stmt.lineno)
    return stmt.lineno, name


class Runner:
    def __init__(self, max_steps=64, initial_world=None):
        self.initial_world = initial_world if initial_world is not None else World()
        self.max_steps = max_steps
        self.reset()

    def reset(self):
        self.world = self.initial_world
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

    @property
    def line_progress(self):
        if self.line is None or not self.commands:
            return None
        total = sum(line == self.line for line, _ in self.commands)
        if not total:
            return None
        completed = sum(line == self.line for line, _ in self.commands[:self.pc])
        return self.line, completed, total

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
