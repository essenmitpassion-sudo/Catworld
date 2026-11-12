from pathlib import Path
import zipfile
import json
import hashlib
from scripts.build_playtest import build


def test_package_contains_runtime_and_assets_without_private_or_dev_files(tmp_path):
    archive=tmp_path/'afterlight.zip'
    build(archive)
    with zipfile.ZipFile(archive) as package:
        names=set(package.namelist())
        assert 'AFTERLIGHT/start_afterlight_windows.bat' in names
        assert 'AFTERLIGHT/start_afterlight.sh' in names
        assert 'AFTERLIGHT/neonpaw/district/assets/buildings.png' in names
        assert 'AFTERLIGHT/requirements-runtime.txt' in names
        assert 'AFTERLIGHT/launch_afterlight.py' in names
        assert not any('/tests/' in n or '/.git/' in n or 'drafts.json' in n or '__pycache__' in n for n in names)
        manifest=json.loads(package.read('AFTERLIGHT/manifest.json'))
        for name,sha in manifest['files'].items():
            assert hashlib.sha256(package.read('AFTERLIGHT/'+name)).hexdigest()==sha
        assert package.testzip() is None
