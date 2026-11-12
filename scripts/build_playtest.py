"""Build a curated, hash-verifiable source playtest package; never include saves."""
from pathlib import Path
import hashlib
import json
import subprocess
import zipfile

ROOT=Path(__file__).resolve().parents[1]


def build(output):
    paths=list((ROOT/'neonpaw').rglob('*.py'))
    paths+=list((ROOT/'neonpaw'/'district'/'assets').glob('*.png'))
    paths+=[ROOT/name for name in ('requirements-runtime.txt','start_afterlight_windows.bat',
            'start_afterlight.sh','launch_afterlight.py','AFTERLIGHT.md','PLAY_NOW.txt')]
    files={p.relative_to(ROOT).as_posix():p.read_bytes() for p in sorted(paths)}
    revision=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    dirty=bool(subprocess.check_output(['git','status','--porcelain'],cwd=ROOT))
    manifest={'base_commit':revision,'working_tree_dirty':dirty,
              'files':{name:hashlib.sha256(data).hexdigest() for name,data in files.items()}}
    output=Path(output);output.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as package:
        for name,data in files.items():package.writestr('AFTERLIGHT/'+name,data)
        package.writestr('AFTERLIGHT/manifest.json',json.dumps(manifest,indent=2))
    with zipfile.ZipFile(output) as package:
        assert package.testzip() is None
        for name,digest in manifest['files'].items():
            assert hashlib.sha256(package.read('AFTERLIGHT/'+name)).hexdigest()==digest
    return output


if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser()
    parser.add_argument('output',type=Path)
    print(build(parser.parse_args().output))
