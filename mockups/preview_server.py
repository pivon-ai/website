#!/usr/bin/env python3
"""Local preview server for the Pivon hero direction choice.

Serves the three live hero mockups + a chooser page. When the user clicks
"Decide" in the browser, POST /decide records the choice, prints it to stdout,
and the server shuts down -- which notifies the agent of the selection.

ponytail: single-shot decision server; 2h safety auto-exit. No deps (stdlib).
"""
import http.server
import socketserver
import os
import json
import threading

PORT = 7321
ROOT = os.path.dirname(os.path.abspath(__file__))  # the mockups/ dir
NAMES = {
    "A": "Neural Field",
    "B": "The 0 to 100 Signal Path",
    "C": "Generative Console",
}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):
        if self.path != "/decide":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", 0))
        try:
            data = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            data = {}
        choice = str(data.get("choice", "")).upper()
        note = str(data.get("note", "")).strip()
        name = NAMES.get(choice, "?")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"ok": True, "choice": choice, "name": name}).encode())
        print("\n=== USER SELECTED: %s -- %s ===" % (choice, name), flush=True)
        if note:
            print("=== NOTE: %s ===" % note, flush=True)
        # Shut down from a separate thread so this response finishes first.
        threading.Thread(target=self.server.shutdown, daemon=True).start()

    def log_message(self, *args):
        pass  # keep stdout clean for the decision line


socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print("PREVIEW_SERVER_READY http://localhost:%d/" % PORT, flush=True)
    threading.Timer(7200, httpd.shutdown).start()  # safety: exit after 2h idle
    httpd.serve_forever()
print("PREVIEW_SERVER_EXITED", flush=True)
