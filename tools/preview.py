"""Preview the public static site on loopback with correct ES-module MIME types."""
import argparse
import functools
import mimetypes
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=8000)
parser.add_argument('--with-project-prefix', action='store_true')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
directory = root if args.with_project_prefix else root / 'docs'
mimetypes.add_type('text/javascript', '.mjs')
handler = functools.partial(SimpleHTTPRequestHandler, directory=str(directory))
with ThreadingHTTPServer(('127.0.0.1', args.port), handler) as server:
    print(f'Preview: http://127.0.0.1:{args.port}/' + ('docs/' if args.with_project_prefix else ''), flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
