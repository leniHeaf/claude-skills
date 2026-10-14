# 404-Seite
P404 = '\n'.join([
 hero2('Seite nicht', 'gefunden', '404', 'Diese Seite gibt es nicht (mehr). Vielleicht hilft einer dieser Wege weiter:', '<a class="mx-btn" href="index.html">Zur Startseite</a>'),
 f'    <section class="mo-lsec">{shead(1, "Beliebte Ziele")}<div class="mo-caps">' + ''.join(f'<div class="mo-caps__col"><p class="mo-label">({k+1:02d}) {t}</p>' + ''.join(f'<a href="{u}">{n}</a>' for n, u in xs) + '</div>' for k, (t, xs) in enumerate([
   ('Studio', [('Case Studies', 'work.html'), ('Leistungen', 'leistungen.html'), ('Methode', 'methode.html'), ('Über uns', 'ueber-uns.html')]),
   ('Wissen', [('Marken-Wiki', 'academy.html'), ('Glossar A–Z', 'academy.html#a-z'), ('Strategie-eBook', 'buch.html')]),
   ('Kontakt', [('Projekt anfragen', 'kontakt.html'), ('Karriere', 'jobs.html')])])) + '</div></section>',
])
page('404.html', 'mx mx-legacy mx-pages3', P404)
_s = open('404.html', encoding='utf-8').read()
_s = re.sub(r'  <!-- SEO -->.*?<!-- /SEO -->\n', '  <title>Seite nicht gefunden | B3DE</title>\n  <meta name="robots" content="noindex, follow">\n  <link rel="icon" href="assets/brand/b3de.svg" type="image/svg+xml">\n', _s, flags=re.S)
if '<title>' not in _s: _s = _s.replace('<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Seite nicht gefunden | B3DE</title>\n  <meta name="robots" content="noindex, follow">\n  <link rel="icon" href="assets/brand/b3de.svg" type="image/svg+xml">', 1)
open('404.html', 'w', encoding='utf-8').write(_s)
