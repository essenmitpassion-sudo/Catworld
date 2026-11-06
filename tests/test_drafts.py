import json
import pytest
from neonpaw.ui.drafts import load, save, DraftError


def document(text='move_right()'):
    return dict(version=1, scenario=1, recall_active=False, recall_available=True,
                original=text, recall='', original_example=False, recall_example=False)


def test_roundtrip_unicode_and_backup(tmp_path):
    path = tmp_path / 'drafts.json'
    save(path, document('# Eigene Lösung\nmove_right()'))
    assert load(path)[0]['original'].startswith('# Eigene Lösung')
    save(path, document('collect()'))
    assert load(path)[0]['original'] == 'collect()'
    assert load(path.with_suffix('.bak'))[0]['original'].startswith('# Eigene Lösung')


def test_corrupt_file_uses_backup_and_is_preserved_on_save(tmp_path):
    path = tmp_path / 'drafts.json'
    save(path, document('first'))
    save(path, document('second'))
    path.write_text('{broken', encoding='utf-8')
    restored, warning = load(path)
    assert restored['original'] == 'first' and warning
    assert path.read_text() == '{broken'
    save(path, restored)
    assert load(path)[0] == restored
    assert next(tmp_path.glob('drafts.damaged-*')).read_text() == '{broken'


def test_invalid_without_backup_is_not_silently_replaced(tmp_path):
    path = tmp_path / 'drafts.json'
    path.write_text('not json')
    with pytest.raises(DraftError):
        load(path)
    assert path.read_text() == 'not json'


@pytest.mark.parametrize('change', [dict(version=99), dict(scenario=999),
    dict(original='x' * 4097), dict(recall_active=True, recall_available=False),
    dict(original=['not text']), dict(version=True), dict(recall_example='yes')])
def test_invalid_snapshot_rejected_before_writing(tmp_path, change):
    path = tmp_path / 'drafts.json'
    state = document()
    state.update(change)
    with pytest.raises(DraftError):
        save(path, state)
    assert not path.exists()


def test_oversized_file_is_bounded(tmp_path):
    path = tmp_path / 'drafts.json'
    path.write_bytes(b' ' * 65537)
    with pytest.raises(DraftError):
        load(path)


def test_failed_replace_keeps_previous_program(tmp_path, monkeypatch):
    from neonpaw.ui import drafts
    path = tmp_path / 'drafts.json'
    save(path, document('first'))
    def denied(*args):
        raise PermissionError('read only')
    monkeypatch.setattr(drafts.os, 'replace', denied)
    with pytest.raises(OSError):
        save(path, document('second'))
    assert load(path)[0]['original'] == 'first'
    assert not list(tmp_path.glob('*.tmp'))


def test_invalid_unicode_does_not_reach_renderer_or_disk(tmp_path):
    with pytest.raises(DraftError):
        save(tmp_path / 'drafts.json', document('\ud800'))


def test_storage_location_can_be_selected_for_portable_build(tmp_path, monkeypatch):
    from neonpaw.ui.drafts import default_path
    monkeypatch.setenv('NEONPAW_DATA_DIR', str(tmp_path))
    assert default_path() == tmp_path / 'drafts.json'
