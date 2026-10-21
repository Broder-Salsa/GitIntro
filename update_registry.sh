#!/usr/bin/env bash
# Quick wrapper to run update_registry.py
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/update_registry.py" "$@"
