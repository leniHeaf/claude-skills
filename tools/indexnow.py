"""Meldet alle Seiten aus der sitemap.xml per IndexNow an Bing & Co.

Nach jedem Upload auf den Server ausführen:  python3 tools/indexnow.py
Voraussetzung: Die Website ist unter der Domain aus der Sitemap erreichbar
und die Schlüsseldatei (<KEY>.txt) liegt im Wurzelverzeichnis.
"""
import json, re, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KEY = next(p.stem for p in ROOT.glob('*.txt') if re.fullmatch(r'[0-9a-f]{32}', p.stem))
urls = re.findall(r'<loc>(.*?)</loc>', (ROOT / 'sitemap.xml').read_text(encoding='utf-8'))
host = re.match(r'https?://([^/]+)', urls[0]).group(1)
body = json.dumps({'host': host, 'key': KEY, 'keyLocation': f'https://{host}/{KEY}.txt', 'urlList': urls}).encode()
req = urllib.request.Request('https://api.indexnow.org/indexnow', data=body, headers={'Content-Type': 'application/json; charset=utf-8'})
with urllib.request.urlopen(req) as r:
    print(r.status, f'{len(urls)} URLs gemeldet')
