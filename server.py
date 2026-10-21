#!/usr/bin/env python3
"""
Git Disco - Local Classroom Server
Runs a lightweight static file server with an automatic /api/cats endpoint
that scans the cats/ directory for all student *.json files.
Zero dependencies — uses only Python 3 standard library.
"""

import http.server
import socketserver
import json
import os
import glob
import webbrowser
import sys

PORT = 8000
CATS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cats")
REGISTRY_FILE = os.path.join(CATS_DIR, "registry.json")


def scan_cats():
    """Scans all *.json files in cats/ (excluding TEMPLATE.json and registry.json) and returns list."""
    cats = []
    if not os.path.exists(CATS_DIR):
        return cats

    json_files = sorted(glob.glob(os.path.join(CATS_DIR, "*.json")))
    for path in json_files:
        filename = os.path.basename(path)
        if filename.lower() in ("template.json", "registry.json"):
            continue
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict):
                    # Ensure username matches filename base if missing
                    base_name = os.path.splitext(filename)[0]
                    if not data.get("username"):
                        data["username"] = base_name
                    cats.append(data)
        except Exception as e:
            print(f"⚠️ Error reading {filename}: {e}")

    # Write out registry.json so static offline viewing works too
    try:
        with open(REGISTRY_FILE, "w", encoding="utf-8") as rf:
            json.dump(cats, rf, indent=2)
    except Exception as e:
        print(f"⚠️ Could not update registry.json: {e}")

    return cats


class GitDiscoHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable caching during live class
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self):
        if self.path.split("?")[0] in ("/api/cats", "/api/cats/"):
            cats = scan_cats()
            payload = json.dumps(cats).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        return super().do_GET()


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    cats = scan_cats()
    print("=" * 60)
    print("  🐱 🪩  WELCOME TO THE GIT DISCO DANCE FLOOR!  🪩 🐱")
    print("=" * 60)
    print(f"  👉 Found {len(cats)} dancing cat(s) in cats/")
    for c in cats:
        print(f"     - {c.get('cat_name', 'Cat')} (@{c.get('username', '?')} - {c.get('dance_style', 'disco')})")
    print("-" * 60)
    print(f"  🌐 Server URL: http://localhost:{PORT}")
    print("  💡 Press Ctrl+C in this terminal to shut down the server.")
    print("=" * 60)

    # Allow fast restart on the port
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), GitDiscoHandler) as httpd:
        webbrowser.open(f"http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Git Disco server stopped. Keep dancing!")


if __name__ == "__main__":
    main()
