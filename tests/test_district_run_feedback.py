from tests.test_district_ui import app, write


def test_run_result_compares_attempt_with_current_world(app):
    write(app,'move_right()\nmove_right()\ntoggle()');app.command('Run')
    for _ in range(3):app.update(.4)
    result=app.run_result()
    assert '(1,3) nach (3,3)' in result
    assert 'Energie 1 auf 0' in result
    assert '1 an, 0 aus' in result
    write(app,'toggle()');app.command('Step')
    assert 'Energie 0 auf 1' in app.run_result()
    assert '0 an, 1 aus' in app.run_result()
    app.command('Rewind')
    assert app.run_result() is None


def test_feedback_does_not_replace_error_or_paused_status(app):
    write(app,'move_right()\nmove_right()');app.command('Step')
    assert app.run_result() is None
    write(app,'collect()');app.command('Run');app.update(.4)
    assert app.runner.error and app.run_result() is None
