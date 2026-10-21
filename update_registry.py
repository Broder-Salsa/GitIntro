#!/usr/bin/env python3
"""
Git Disco - Cat Registry Updater
================================
Scans the `cats/` folder for individual cat configuration files (*.json),
validates them, and automagically updates both:
  - cats/registry.json (standard JSON array)
  - cats/registry.js   (window.GIT_DISCO_CATS for file:/// browser compatibility)

Usage:
  ./update_registry.py           # Run once and exit
  ./update_registry.py --watch   # Continuously watch for changes and auto-update
"""

import sys
import os
import glob
import json
import time

def find_cats_dir():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(script_dir, "cats"),
        script_dir,
        os.path.join(os.getcwd(), "cats"),
        os.getcwd()
    ]
    for c in candidates:
        if os.path.isdir(c) and os.path.isfile(os.path.join(c, "registry.json")):
            return c
    # Fallback to script_dir/cats
    return os.path.join(script_dir, "cats")

def build_registry(cats_dir, quiet=False):
    pattern = os.path.join(cats_dir, "*.json")
    json_files = sorted(glob.glob(pattern))

    cats = []
    skipped = []

    for path in json_files:
        fname = os.path.basename(path)
        if fname.lower() in ("template.json", "registry.json"):
            continue

        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if not isinstance(data, dict):
                    skipped.append((fname, "Content is not a JSON object"))
                    continue

                base = os.path.splitext(fname)[0]
                if not data.get("username"):
                    data["username"] = base

                cats.append(data)
                if not quiet:
                    cat_name = data.get("cat_name", "Unknown Cat")
                    user = data.get("username", base)
                    print(f"  🐾 Added @{user}: '{cat_name}' ({data.get('breed', 'custom')}, {data.get('dance_style', 'dance')})")

        except Exception as e:
            skipped.append((fname, str(e)))

    # Output paths
    reg_json_path = os.path.join(cats_dir, "registry.json")
    reg_js_path = os.path.join(cats_dir, "registry.js")

    # 1. Write cats/registry.json
    with open(reg_json_path, "w", encoding="utf-8") as f:
        json.dump(cats, f, indent=2)
        f.write("\n")

    # 2. Write cats/registry.js
    with open(reg_js_path, "w", encoding="utf-8") as f:
        f.write("// Automatically maintained by GitHub Actions & Git Disco\n")
        f.write("window.GIT_DISCO_CATS = " + json.dumps(cats, indent=2) + ";\n")

    if not quiet:
        print(f"\n✨ Successfully updated:")
        print(f"   📄 {os.path.relpath(reg_json_path, os.getcwd())}")
        print(f"   📄 {os.path.relpath(reg_js_path, os.getcwd())}")
        print(f"🎉 Total active cats on the dance floor: {len(cats)}")

        if skipped:
            print("\n⚠️  Skipped files:")
            for fname, reason in skipped:
                print(f"   ❌ {fname}: {reason}")

    return len(cats)

def get_dir_state(cats_dir):
    """Returns a dict of filename -> mtime for all JSON files in cats_dir."""
    pattern = os.path.join(cats_dir, "*.json")
    state = {}
    for path in glob.glob(pattern):
        fname = os.path.basename(path)
        if fname.lower() in ("template.json", "registry.json"):
            continue
        try:
            state[path] = os.path.getmtime(path)
        except OSError:
            pass
    return state

def watch_mode(cats_dir):
    print(f"👀 Watching '{cats_dir}' for changes (Press Ctrl+C to stop)...")
    build_registry(cats_dir)
    last_state = get_dir_state(cats_dir)

    try:
        while True:
            time.sleep(1.0)
            current_state = get_dir_state(cats_dir)
            if current_state != last_state:
                print(f"\n🔄 Change detected in cats/ at {time.strftime('%X')}! Updating registry...")
                build_registry(cats_dir)
                last_state = current_state
    except KeyboardInterrupt:
        print("\n👋 Watch mode stopped.")

def main():
    cats_dir = find_cats_dir()
    if not os.path.exists(cats_dir):
        print(f"❌ Error: Could not find cats directory at '{cats_dir}'.")
        sys.exit(1)

    if "--watch" in sys.argv or "-w" in sys.argv:
        watch_mode(cats_dir)
    else:
        print(f"🔍 Scanning '{cats_dir}' for cat files...")
        build_registry(cats_dir)

if __name__ == "__main__":
    main()
