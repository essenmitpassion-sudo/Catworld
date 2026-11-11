"""Bounded text snapshots; loaded player text is never executed here."""
import json
import os
from pathlib import Path
import shutil
import tempfile
from uuid import uuid4
from neonpaw.code.runner import MAX_SOURCE


class DraftError(ValueError):
    pass


def validate(state):
    expected = {'version', 'scenario', 'recall_active', 'recall_available',
                'original', 'recall', 'original_example', 'recall_example'}
    if not isinstance(state, dict) or type(state.get('version')) is not int or state['version'] not in (1, 2, 3, 4, 5, 6):
        raise DraftError('Unbekannte Entwurfsversion.')
    if state['version'] >= 2:
        expected |= {'roof_active', 'roof', 'roof_example', 'roof_repetition_seen'}
    if state['version'] >= 3:
        expected |= {'roof_transfer_active', 'roof_transfer_unlocked', 'roof_transfer', 'roof_transfer_example'}
    if state['version'] >= 4:
        expected |= {'pair_active', 'pair_unlocked', 'pair', 'pair_example'}
    if state['version'] >= 5:
        expected |= {'workshop_active', 'workshop_unlocked', 'workshop', 'workshop_example'}
    if state['version'] >= 6:
        expected.add('workshop_start_open')
    if set(state) != expected:
        raise DraftError('Unbekanntes Entwurfsformat.')
    if type(state['scenario']) is not int or state['scenario'] not in (0, 1):
        raise DraftError('Ungültiges Szenario.')
    bool_keys = ('recall_active', 'recall_available', 'original_example', 'recall_example')
    if state['version'] >= 2:
        bool_keys += ('roof_active', 'roof_example', 'roof_repetition_seen')
    if state['version'] >= 3:
        bool_keys += ('roof_transfer_active', 'roof_transfer_unlocked', 'roof_transfer_example')
    if state['version'] >= 4:
        bool_keys += ('pair_active', 'pair_unlocked', 'pair_example')
    if state['version'] >= 5:
        bool_keys += ('workshop_active', 'workshop_unlocked', 'workshop_example')
    if state['version'] >= 6:
        bool_keys += ('workshop_start_open',)
    for key in bool_keys:
        if type(state[key]) is not bool:
            raise DraftError('Ungültiger Entwurfsstatus.')
    text_keys = ('original', 'recall') + (('roof',) if state['version'] >= 2 else ()) + (('roof_transfer',) if state['version'] >= 3 else ())
    if state['version'] >= 4:
        text_keys += ('pair',)
    if state['version'] >= 5:
        text_keys += ('workshop',)
    for key in text_keys:
        if not isinstance(state[key], str) or len(state[key]) > MAX_SOURCE:
            raise DraftError('Programmtext fehlt oder ist zu lang.')
        try:
            state[key].encode('utf-8')
        except UnicodeError as exc:
            raise DraftError('Programmtext enthält ungültige Unicode-Zeichen.') from exc
    if state['recall_active'] and (state['scenario'] != 1 or not state['recall_available']):
        raise DraftError('Ungültiger Abrufstatus.')
    if state.get('roof_active') and not state['recall_available']:
        raise DraftError('Ungültiger Dachwegstatus.')
    if state.get('roof_transfer_active') and not state.get('roof_transfer_unlocked'):
        raise DraftError('Dachtransfer ist noch gesperrt.')
    if state.get('roof_transfer_unlocked') and not state['recall_available']:
        raise DraftError('Ungültiger Dachtransferstatus.')
    if state.get('pair_active') and not (state.get('pair_unlocked') and state.get('roof_active')):
        raise DraftError('Ungültiger Laternenpaarstatus.')
    if state.get('pair_unlocked') and not state.get('roof_transfer_unlocked'):
        raise DraftError('Laternenpaar ist noch gesperrt.')
    if state.get('workshop_active') and not (state.get('workshop_unlocked') and state.get('pair_active')):
        raise DraftError('Ungültiger Werkstattstatus.')
    if state.get('workshop_unlocked') and not state.get('pair_unlocked'):
        raise DraftError('Werkstatt ist noch gesperrt.')
    return state


def read(path):
    try:
        with Path(path).open('rb') as stream:
            raw = stream.read(65537)
        if len(raw) > 65536:
            raise DraftError('Entwurfsdatei ist zu gross.')
        return validate(json.loads(raw.decode('utf-8')))
    except (UnicodeError, json.JSONDecodeError, RecursionError) as exc:
        raise DraftError('Entwurfsdatei ist beschädigt.') from exc


def load(path):
    path = Path(path)
    try:
        return read(path), ''
    except (DraftError, OSError) as original_error:
        try:
            return read(path.with_suffix('.bak')), 'Sicherung geladen. Letzte Änderung bitte prüfen.'
        except (DraftError, OSError):
            if isinstance(original_error, FileNotFoundError) and not path.exists():
                # A truly new installation has neither file; a broken backup is not new.
                if not path.with_suffix('.bak').exists():
                    return None, ''
            raise DraftError('Entwürfe nicht geladen. Dateien bleiben erhalten.') from original_error


def save(path, state):
    validate(state)
    encoded = json.dumps(state, ensure_ascii=False)
    if len(encoded.encode('utf-8')) > 65536:
        raise DraftError('Entwurfsdatei ist zu gross.')
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=path.parent,
                                         suffix='.tmp', delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(encoded)
            stream.flush()
            os.fsync(stream.fileno())
        if path.exists():
            try:
                read(path)
            except DraftError:
                # Preserve malformed input; never overwrite the sole recovery copy.
                os.replace(path, path.with_name(f'{path.stem}.damaged-{uuid4().hex}'))
            else:
                shutil.copy2(path, path.with_suffix('.bak'))
        os.replace(temporary, path)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def default_path():
    if os.environ.get('NEONPAW_DATA_DIR'):
        return Path(os.environ['NEONPAW_DATA_DIR']) / 'drafts.json'
    base = Path(os.environ['LOCALAPPDATA']) if os.name == 'nt' and os.environ.get('LOCALAPPDATA') else Path.home()
    return base / '.neonpaw' / 'drafts.json'
