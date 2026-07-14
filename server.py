from __future__ import annotations

import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from portfolio_data import PORTFOLIO


BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATE_DIR = BASE_DIR / "templates"
DESKTOP_BG = "/static/img/opening-ghibli.png"
MOBILE_BG = "/static/img/opening-ghibli-mobile.png"


def pick_background(user_agent: str) -> str:
    agent = (user_agent or "").lower()
    mobile_markers = ("android", "iphone", "ipad", "ipod", "mobile", "mobi")
    return MOBILE_BG if any(marker in agent for marker in mobile_markers) else DESKTOP_BG


class PortfolioHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def do_GET(self):
        route = urlparse(self.path).path
        if route == "/api/profile.json":
            self._serve_json(PORTFOLIO)
            return
        if route in ("/", "/index.html"):
            self._serve_template()
            return
        elif route.startswith("/static/"):
            self.path = route
        else:
            self._serve_template()
            return
        return super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _serve_json(self, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _serve_template(self):
        template = (BASE_DIR / "templates" / "index.html").read_text(encoding="utf-8")
        bg_url = pick_background(self.headers.get("User-Agent", ""))
        html = template.replace("{{SCENE_BG_URL}}", bg_url)
        body = html.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        return


def main():
    host = "127.0.0.1"
    port = 8000
    server = ThreadingHTTPServer((host, port), PortfolioHandler)
    print(f"Portfolio site running at http://{host}:{port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
