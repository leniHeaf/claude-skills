# Projektliste + Projektseiten im asymmetrischen Raster (nach Hochburg-Aufbau)
def _rail(label):
    return f'<span class="hb-rail" aria-hidden="true"><span>{label}</span><i></i></span>'

def _cap(p, s):
    t = plain(p["title"].replace("<br>", " "))
    sub = t if t.strip().lower() != short(p).strip().lower() else plain(IND_OF[s]) if plain(IND_OF[s]) not in ('—', '') else 'Case Study'
    return f'<span class="hb-card__cap"><b>{esc(short(p))}</b><span>{sub}</span></span>'

def _media(p):
    h = hero(p)
    if h: return f'<img src="{h[0]}" alt="{h[1]}" loading="lazy" decoding="async">'
    return f'<span class="hb-ph"><b>{esc(short(p))}</b><span>(Bilder folgen)</span></span>'

# Raster-Muster: Spalte (1–4), Breite (1|2), Versatz in Zeilen-Einheiten
PATTERN = [(1, 1, 0), (4, 1, 0), (2, 2, 1), (1, 2, 0), (3, 1, 0), (4, 1, 2), (2, 1, 0), (3, 2, 1), (1, 1, 0)]
def _cards(slugs):
    out = []
    for k, s in enumerate(slugs):
        p = by[s]; col, span, off = PATTERN[k % len(PATTERN)]
        cat = plain(IND_OF[s]).split(' ')[0]
        out.append(f'<a class="hb-card hb-card--{"l" if span == 2 else "s"}" href="projekt-{s}.html" data-cat="{cat}" style="--c:{col};--s:{span};--o:{off}" data-r>'
                   f'<span class="hb-card__img">{_media(p)}<span class="hb-card__arr" aria-hidden="true">→</span></span>{_cap(p, s)}</a>')
    return ''.join(out)

cats_hb = []
for s in ORDER:
    c = plain(IND_OF[s]).split(' ')[0]
    if c not in cats_hb and c not in ('—', '-', ''): cats_hb.append(c)
pills_hb = '<button type="button" data-cat="alle" aria-pressed="true">Alle Projekte</button>' + ''.join(f'<button type="button" data-cat="{c}" aria-pressed="false">{c}</button>' for c in cats_hb)

WORK_HB = f'''    <section class="hb-hero" aria-label="Projekte">
      {_rail('Projekte')}
      <p class="hb-kicker">/ Marken und Projekte</p>
      <h1 class="hb-h1">Gestaltet von B3DE.</h1>
      <div class="mo-pills hb-pills" role="group" aria-label="Branche filtern">{pills_hb}</div>
    </section>
    <section class="hb-grid-wrap" aria-label="Alle Projekte">
      <div class="hb-grid" data-works>{_cards(ORDER)}</div>
    </section>
    <section class="hb-ready" aria-label="Kontakt">
      {_rail('Kontakt')}
      <p class="hb-kicker">/ Bereit für B3DE?</p>
      <h2 class="hb-h1">Lasst uns gemeinsam<br>Marken bauen.</h2>
      <a class="hb-btn" href="kontakt.html">Projekt starten <span aria-hidden="true">→</span></a>
    </section>'''
page('work.html', 'mx mx-hb mx-work-page', WORK_HB)

for i, s in enumerate(ORDER):
    p = by[s]; h = hero(p); nm = short(p)
    facts = dict(p['facts'])
    year = facts.get('Jahr', '2026')
    branche = plain(IND_OF[s])
    info = ''.join(f'<div><b>{k}</b><span>{v}</span></div>' for k, v in [('Kunde', facts.get('Kunde', nm)), ('Branche', branche), ('Leistungen', p['tags'] if p['tags'] != 'Projekt' else facts.get('Leistungen', 'Branding'))])
    desc = p['desc'] or 'Die ausführliche Projektbeschreibung folgt in Kürze.'
    proc = PROC.get(s, '')
    cols = f'<p>{desc}</p>' + (f'<p>{proc}</p>' if proc else '')
    ext = f'<a class="hb-btn hb-btn--o" href="{p["ext"][0]}" target="_blank" rel="noopener">{p["ext"][1]} ansehen ↗</a>' if p['ext'] else ''
    n = 1
    out = [f'''    <section class="hb-phero" aria-label="{esc(nm)}">
      <a class="hb-back" href="work.html"><span aria-hidden="true">←</span> Zurück</a>
      <p class="hb-kicker hb-kicker--caps">{esc(nm)} <span aria-hidden="true">—</span> {year}</p>
      <h1 class="hb-h1">{p["title"]}</h1>
    </section>
    <section class="hb-sec hb-lead" data-n="{n:02d}" aria-label="Titelbild">
      {_rail(plain(p['tags']).split(' · ')[0].upper() if p['tags'] != 'Projekt' else 'PROJEKT')}
      <figure class="hb-bleed">{_media(p).replace('loading="lazy"', 'fetchpriority="high"')}</figure>
    </section>''']
    n += 1
    out.append(f'''    <section class="hb-sec hb-info" data-n="{n:02d}" aria-label="Infos">
      {_rail('Infos')}
      <div class="hb-info__facts">{info}</div>
      <div class="hb-info__text">{cols}{f'<div class="hb-info__ext">{ext}</div>' if ext else ''}</div>
    </section>''')
    for si, (lab, txt, media) in enumerate(p['sections']):
        n += 1
        imgs = []
        for kind, items in media:
            for a, b in items:
                if ok(a): imgs.append((a, b))
        lay = ['hb-f--r', 'hb-f--l', 'hb-f--c'][si % 3]
        figs = ''.join(f'<figure class="hb-f {lay if len(imgs) == 1 else ("hb-f--a" if k == 0 else "hb-f--b")}" data-r><img src="{a}" alt="{b}" loading="lazy" decoding="async"></figure>' for k, (a, b) in enumerate(imgs))
        out.append(f'''    <section class="hb-sec hb-chap" data-n="{n:02d}" aria-label="{plain(lab)}">
      {_rail(plain(lab).upper())}
      <div class="hb-chap__txt"><h2>{lab}</h2><p>{txt}</p></div>
      <div class="hb-chap__media hb-chap__media--{len(imgs)}">{figs}</div>
    </section>''')
    if not p['sections']:
        n += 1
        out.append(f'''    <section class="hb-sec hb-chap" data-n="{n:02d}" aria-label="Bilder folgen">
      {_rail('BILDER')}
      <div class="hb-chap__txt"><h2>Bilder folgen</h2><p>Die ausführliche Case Study mit Fotos und Anwendungen ist in Arbeit.</p></div>
    </section>''')
    others = [x for x in ORDER if x != s]
    others = (others[i:] + others[:i])[:3]
    more = ''.join(f'<a class="hb-more__c" href="projekt-{x}.html"><span class="hb-more__img">{_media(by[x])}</span><b>{esc(short(by[x]))}</b><span>{plain(by[x]["title"].replace("<br>", " "))}</span></a>' for x in others)
    out.append(f'''    <section class="hb-more" aria-label="Weitere Projekte">
      {_rail('Weitere Projekte')}
      <div class="hb-more__grid">{more}</div>
    </section>''')
    page(f'projekt-{s}.html', 'mx mx-hb mx-project', '\n'.join(out))
print('hb ok')
