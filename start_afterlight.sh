#!/usr/bin/env sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
export NEONPAW_DATA_DIR="${NEONPAW_DATA_DIR:-$PWD/afterlight-data}"
if [ ! -x .venv/bin/python ]; then
    python3 -m venv .venv
fi
.venv/bin/python -c 'import sys; sys.exit(0 if sys.version_info >= (3, 12) else "Python 3.12 oder neuer erforderlich.")'
if ! .venv/bin/python -c 'import pygame' >/dev/null 2>&1; then
    .venv/bin/python -m pip install -r requirements-runtime.txt
fi
exec .venv/bin/python launch_afterlight.py
