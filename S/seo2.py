# SEO-Nachbearbeitung aller Seiten (läuft nach der Generierung)
import re, os, json, glob, html as H, struct
R = '/home/user/claude-skills'
BASE = 'https://www.b3de.de'
def webp_size(p):
    try:
        b = open(p, 'rb').read(64)
        if b[12:16] == b'VP8X': return 1 + int.from_bytes(b[24:27], 'little'), 1 + int.from_bytes(b[27:30], 'little')
        if b[12:16] == b'VP8 ': w, h = struct.unpack('<HH', b[26:30]); return w & 0x3fff, h & 0x3fff
        if b[12:16] == b'VP8L':
            v = int.from_bytes(b[21:25], 'little'); return (v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1
    except Exception: pass
    return None
strip = lambda t: H.unescape(re.sub(r'<[^>]+>', '', t)).strip()
n_faq = n_img = 0
for f in sorted(glob.glob(os.path.join(R, '*.html'))):
    name = os.path.basename(f); s = open(f, encoding='utf-8').read(); o = s
    # 1 Testvarianten nicht indexieren
    if name.startswith('startseite-'):
        s = s.replace('<meta name="robots" content="index, follow, max-image-preview:large">', '<meta name="robots" content="noindex, follow">')
    # 2 FAQPage aus <details>
    if 'faq__item' in s and '"FAQPage"' not in s:
        qa = re.findall(r'<details class="faq__item"[^>]*>\s*<summary><span>(.*?)</span>.*?<div class="faq__body">(.*?)</div>\s*</details>', s, re.S)
        if qa:
            ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": strip(re.sub(r'^\d+\s+', '', q)), "acceptedAnswer": {"@type": "Answer", "text": strip(a)}} for q, a in qa]}
            s = s.replace('  <!-- /SEO -->', '  <script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>\n  <!-- /SEO -->', 1); n_faq += 1
    # 3 Bildmaße gegen Layout-Sprünge
    def dims(m):
        global n_img
        tag = m.group(0)
        if 'width=' in tag: return tag
        src = re.search(r'src="([^"]+)"', tag)
        if not src or not src.group(1).endswith('.webp'): return tag
        wh = webp_size(os.path.join(R, src.group(1)))
        if not wh: return tag
        n_img += 1
        return tag.replace('<img ', f'<img width="{wh[0]}" height="{wh[1]}" ', 1)
    s = re.sub(r'<img\b[^>]*>', dims, s)
    # 4 Manifest, x-default, Apple-Icon
    if 'rel="manifest"' not in s and '<!-- /SEO -->' in s:
        canon = re.search(r'<link rel="canonical" href="([^"]+)"', s)
        extra = '  <link rel="manifest" href="site.webmanifest">\n  <link rel="apple-touch-icon" href="assets/brand/b3de.svg">\n'
        if canon: extra += f'  <link rel="alternate" hreflang="x-default" href="{canon.group(1)}">\n'
        s = s.replace('  <!-- /SEO -->', extra + '  <!-- /SEO -->', 1)
    if s != o: open(f, 'w', encoding='utf-8').write(s)
json.dump({"name": "B3DE – Agentur für Branding und Marketing", "short_name": "B3DE", "lang": "de", "start_url": "/", "display": "standalone",
           "background_color": "#f2f2f2", "theme_color": "#0a0a0a", "icons": [{"src": "assets/brand/b3de.svg", "sizes": "any", "type": "image/svg+xml"}]},
          open(os.path.join(R, 'site.webmanifest'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('seo2: faq', n_faq, 'img', n_img)
