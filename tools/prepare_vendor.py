"""Fetch pinned, checksum-verified browser libraries for Pages or local preview."""
import hashlib
import io
import tarfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGES = [
    ('pdfjs-dist', '4.10.38', '1011b38553532d7078c59f26b15a471f8dae00f101b60e2add9b8511737a1ce0', {'build/pdf.mjs', 'build/pdf.worker.mjs', 'LICENSE'}, ('standard_fonts/', 'cmaps/')),
    ('katex', '0.16.22', 'e9e0d167db3175481cbadaff38e8d90b130f6a3ddb451a47e43c577fd511f365', {'dist/katex.min.js', 'dist/katex.min.css', 'LICENSE'}, ('dist/fonts/',)),
]

for name, version, expected, exact, prefixes in PACKAGES:
    url = f'https://registry.npmjs.org/{name}/-/{name}-{version}.tgz'
    with urllib.request.urlopen(url, timeout=60) as response:
        data = response.read()
    if hashlib.sha256(data).hexdigest() != expected:
        raise SystemExit(f'Archive checksum mismatch: {name}')
    target = ROOT / 'docs/vendor' / name
    with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as archive:
        for entry in archive:
            relative = entry.name.removeprefix('package/')
            if not entry.isfile() or not (relative in exact or relative.startswith(prefixes)):
                continue
            dest = target / relative
            if not dest.resolve().is_relative_to(target.resolve()):
                raise SystemExit('Archive path is outside vendor directory')
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(archive.extractfile(entry).read())
    print(f'Prepared {name} {version}; archive SHA-256 verified')
