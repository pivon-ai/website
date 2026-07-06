#!/usr/bin/env python3
"""Section-by-section variant chooser for Pivon.

Serves mockups/v/ (chooser.html reads section.json to render the current
round's variants in side-by-side iframes). On POST /decide it appends the
decision to decisions.jsonl, prints it, and shuts down -- which notifies the
agent that this round is done so the next round can start.

ponytail: one-shot per round; reuse-address; 2h safety auto-exit. Stdlib only.
"""
import http.server
import socketserver
import os
import json
import threading
import datetime

PORT = 7321
ROOT = os.path.dirname(os.path.abspath(__file__))  # mockups/v/
LOG = os.path.join(ROOT, "decisions.jsonl")


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
        rec = {
            "section": str(data.get("section", "")),
            "choice": str(data.get("choice", "")),
            "note": str(data.get("note", "")).strip(),
            "ts": datetime.datetime.now().isoformat(timespec="seconds"),
        }
        with open(LOG, "a") as f:
            f.write(json.dumps(rec) + "\n")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"ok": True, **rec}).encode())
        # Single machine-readable line so the agent sees the choice in the task output on wake.
        print("PIVON_DECISION " + json.dumps(rec), flush=True)
        threading.Thread(target=self.server.shutdown, daemon=True).start()

    def log_message(self, *args):
        pass


socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print("PREVIEW_SERVER_READY http://localhost:%d/" % PORT, flush=True)
    # ponytail: safety auto-exit after 2h so a forgotten server can't linger. A decision exit
    # is distinguished by the PIVON_DECISION line printed above; a bare exit here = timeout.
    threading.Timer(7200, httpd.shutdown).start()
    httpd.serve_forever()
print("PREVIEW_SERVER_EXITED", flush=True)
