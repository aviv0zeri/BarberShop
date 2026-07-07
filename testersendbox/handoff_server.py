#!/usr/bin/env python3
"""Fallback static server for handoff/ when Docker is unavailable."""
from __future__ import annotations

import argparse
import http.server
import socketserver
import subprocess
import sys
from pathlib import Path


def _resolve_handoff_url(repo_root: Path, port: int) -> str:
    entry = repo_root / "scripts" / "handoff_entry.py"
    if entry.is_file():
        try:
            proc = subprocess.run(
                [sys.executable, str(entry), str(repo_root), "--url", "--port", str(port)],
                capture_output=True,
                text=True,
                timeout=10,
                check=False,
            )
            if proc.returncode == 0 and proc.stdout.strip():
                return proc.stdout.strip()
        except (OSError, subprocess.TimeoutExpired):
            pass
    return f"http://127.0.0.1:{port}/Barber%20Booking%20(Offline)%20(1).html"


def main() -> int:
    parser = argparse.ArgumentParser(description="Serve handoff/ for compare-apps")
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--port", type=int, default=5108)
    args = parser.parse_args()
    root = args.root.resolve()
    if not root.is_dir():
        raise SystemExit(f"handoff root missing: {root}")

    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=str(root), **kw)

        def end_headers(self) -> None:
            if self.path.endswith(".jsx"):
                self.send_header("Content-Type", "application/javascript; charset=utf-8")
            super().end_headers()

    with socketserver.TCPServer(("127.0.0.1", args.port), Handler) as httpd:
        repo_root = root.parent if root.name == "handoff" else root
        url = _resolve_handoff_url(repo_root, args.port)
        print(f"handoff preview → {url}", flush=True)
        httpd.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
