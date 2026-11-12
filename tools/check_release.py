"""Reject private artifacts and malformed source metadata before deployment."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
papers = json.loads((ROOT / 'docs/papers.json').read_text(encoding='utf-8'))
assert len(papers) == 5
for p in papers:
    assert set(p) == {'id','title','doi','kind','pages','year','version','read_pages','printed_start','authors','venue','metadata_source','metadata_checked'}
    assert p['authors'] and p['venue'] and p['doi'].startswith('10.')
assert 'data-edition="public"' in (ROOT / 'docs/index.html').read_text(encoding='utf-8')
assert (ROOT / 'docs/about.html').is_file()
assert (ROOT / 'docs/vendor/pdfjs-dist/LICENSE').is_file()
assert (ROOT / 'docs/vendor/katex/LICENSE').is_file()
for p in ROOT.rglob('*'):
    if not p.is_file() or '.git' in p.parts:
        continue
    assert p.suffix.lower() != '.pdf', f'PDF cannot be published: {p.name}'
    assert p.name not in {'sources.json','HANDOFF.md','MODEL_HANDOFF.md'}, f'Private artifact: {p.name}'
    if p.suffix in {'.js','.mjs','.json','.html','.md','.yml','.py','.bib'} and p.name != 'check_release.py':
        text = p.read_text(encoding='utf-8')
        if 'vendor' in p.parts:
            text = text.replace('/home/web_user', '[upstream virtual filesystem]')
        assert not re.search(r'(?i)(?:(?<![A-Za-z])[CDE]:[\\/][A-Za-z0-9_\\]|/Users/|/home/|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_)',text), f'Private marker in {p.name}'
print('Public source and citation checks passed; no article PDFs or private manifests')
