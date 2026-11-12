"""Compare player-authored plans using the same bounded, offline game runner."""
from dataclasses import dataclass
from neonpaw.code.runner import Runner, ProgramError, MAX_COMMANDS
from neonpaw.content.levels import workshop_world


@dataclass(frozen=True)
class CheckResult:
    start_open: bool
    success: bool
    actions: int
    line: int | None
    message: str


def check_workshop(source):
    results = []
    for start_open in (False, True):
        runner = Runner(initial_world=workshop_world(start_open))
        try:
            runner.load(source)
        except ProgramError:
            pass  # Runner retains the validated, readable error and its line.
        else:
            runner.run()
            for _ in range(MAX_COMMANDS + 1):
                if runner.status != 'running':
                    break
                runner.tick()
        success = runner.status == 'done' and runner.world.powered
        message = runner.error
        if not success and not message:
            message = ('Programm beendet; die Werkstatt hat noch keinen Strom.'
                       if runner.status == 'done' else 'Prüfung am sicheren Schrittlimit angehalten.')
        results.append(CheckResult(start_open, success, runner.executed_steps,
                                   runner.line if runner.error else None, message))
    return tuple(results)
