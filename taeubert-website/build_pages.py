"""Erzeugt die Unterseiten aus dem Shopify-Theme-Export (templates/page.*.json).

Aufruf: python3 -I build_pages.py <theme-dir> <site-dir>
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from new_pages import NEW_PAGES  # noqa: E402

THEME, SITE = sys.argv[1], sys.argv[2]
BOOKING_URL = "https://terminbuchungtaeubert.de"  # externes Buchungstool
BOOKING = BOOKING_URL  # Buttons führen direkt zum Buchungstool (Einbetten wird vom Tool nicht zuverlässig erlaubt)
DOMAIN = "https://www.taeubert-karosserie-lack.de"

# Vorlage -> Dateiname (nur Seiten mit eigenem Inhalt, keine Theme-Demo-Vorlagen)
PAGES = {
    "911": "porsche-911", "about-1": "history", "about-2": "karriere", "adrian": "q-a-adrian",
    "azubi": "azubi", "bamberg": "bamberg", "boxenstopp": "boxenstopp", "bulli-t2": "vw-bulli-t2",
    "contact": "contact", "fahrzeugaufbereitung": "fahrzeugaufbereitung",
    "job": "jobs", "karosserie": "karosserie", "kleinschaden": "kleinschaden", "kratzer-2": "kratzer",
    "lackierarbeiten": "lackierarbeiten", "lackierer-karosserie-co": "coburg",
    "landing": "meet-the-team", "leasingrueckgabe-auto-sonn": "leasingrueckgabe", "marco": "q-a-marco",
    "nec": "neustadt", "pascal": "q-a-pascal", "projekte": "porsche-gts", "reifenservice": "reifenservice",
    "roedental": "roedental", "smartrepair": "smartrepair", "sonneberg": "sonneberg", "toni": "q-a-toni",
    "unfall-gehabt-wir-kuemmer": "unfall", "unfall-oder-kratzer": "unfall-oder-kratzer",
    "unfallentstandsetzung": "unfallinstandsetzung", "was-kostet-es-ein-auto-l": "auto-lackieren-kosten",
    "who-we-are": "who-we-are",
}
# Der Kronach-Text liegt im Shop auf der Sonneberg-Vorlage; die Kronach-Vorlage enthält den Rödental-Text
PAGE_ALIASES = [("sonneberg", "kronach")]
# Eigene Titel/Beschreibungen für Nicht-Leistungsseiten (sonst aus der ersten Überschrift)
PAGE_META = {
    "azubi": ("Ausbildung bei Täubert – Azubi in Sonneberg", "Ausbildung zum Fahrzeuglackierer oder Karosseriebauer bei Täubert in Sonneberg: sauberes Handwerk lernen, ernst genommen werden, mit Perspektive."),
    "karriere": ("Karriere & Jobs bei Täubert", "Jobs bei Täubert Karosserie & Lack in Sonneberg: Gesellen, Meister und Quereinsteiger – klare Abläufe, faire Bezahlung, Quartalsprämien."),
    "boxenstopp": ("Boxenstopp – Reifenwechsel-Event", "Boxenstopp bei Täubert in Sonneberg: Reifenwechsel-Event mit Aktionen und Verpflegung. Infos und Termine."),
    "q-a-marco": ("Q&A mit Marco – Team Täubert", "Marco ist seit 10 Jahren bei Täubert Karosserie & Lack. Im Gespräch über seinen Schwerpunkt, das Team und gutes Handwerk."),
}
# Seitenspezifische Textkorrekturen (alt, neu)
TEXT_FIXES = {
    "kronach": [("Lackierer Sonneberg |", "Lackierer Kronach |")],
    "sonneberg": [
        ("Täubert Karosserie &amp; Lack in Sonneberg betreut regelmäßig Kunden aus Kronach", "Täubert Karosserie &amp; Lack betreut regelmäßig Kunden aus Sonneberg"),
        ("Täubert Karosserie & Lack in Sonneberg betreut regelmäßig Kunden aus Kronach", "Täubert Karosserie & Lack betreut regelmäßig Kunden aus Sonneberg"),
        ("Kronach", "Sonneberg"),
    ],
}

# Shopify-Seiten-Handles -> Datei
HANDLES = {
    "contact": "contact", "who-we-are": "who-we-are", "jobs": "jobs", "26-09-2026-boxenstopp": "boxenstopp",
    "history": "history", "porsche-911": "porsche-911", "porsche-gts": "porsche-gts", "vw-bulli-t2": "vw-bulli-t2",
    "q-a-marco": "q-a-marco", "q-a-toni": "q-a-toni", "q-a-adrian": "q-a-adrian", "q-a-pascal": "q-a-pascal",
    "azubi": "azubi", "meet-the-team": "meet-the-team",
}


def load(path):
    t = open(path, encoding="utf-8").read()
    return json.loads(re.sub(r"^\s*/\*.*?\*/", "", t, flags=re.S))


def esc(s):
    return html.escape(s or "", quote=True)


def img_name(ref):
    """Dateiname aus der Shopify-Referenz; liegt das Bild mit anderer Endung in images/, diese nehmen."""
    if not ref:
        return ""
    name = ref.split("/")[-1]
    stem = os.path.splitext(name)[0]
    img_dir = os.path.join(SITE, "images")
    if not os.path.exists(os.path.join(img_dir, name)) and os.path.isdir(img_dir):
        for f in os.listdir(img_dir):
            if os.path.splitext(f)[0] == stem:
                return f
    return name


def link(url, label=""):
    """Shopify-Link in einen Link der statischen Seite umsetzen."""
    if not url:
        l = (label or "").lower()
        if "termin" in l:
            return BOOKING
        if "kontakt" in l:
            return "contact.html"
        return None
    if url.startswith("shopify://pages/"):
        h = url.split("/")[-1]
        return HANDLES.get(h, h) + ".html"
    if url.startswith(("shopify://collections", "shopify://products")):
        return BOOKING
    return url


def a_attrs(href):
    ext = href.startswith("http") and "terminbuchungtaeubert" not in href
    return f'href="{esc(href)}"' + (' target="_blank" rel="noopener"' if ext else "")


def button(url, label, cls="btn-dark"):
    href = link(url, label)
    if href == BOOKING:
        label = "Termin online buchen"
    if not label or not href:
        return ""
    return f'<a class="btn {cls}" {a_attrs(href)}>{esc(label)}</a>'


def has_img(ref):
    return bool(ref) and os.path.exists(os.path.join(SITE, "images", img_name(ref)))


def plain(html_text):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", html_text or ""))).strip()


def media(ref, extra=""):
    if not has_img(ref):
        return f'<div class="media{extra}"></div>'
    return f'<div class="media{extra}"><img src="images/{esc(img_name(ref))}" alt="" loading="lazy"></div>'


# Ehemalige Mitarbeitende: Blöcke, die sie nennen oder auf ihre Seite verlinken, nicht mehr ausgeben
FORMER_STAFF = ("fanny",)


def blocks(sec):
    bl = sec.get("blocks") or {}
    for k in sec.get("block_order", list(bl)):
        b = bl.get(k)
        if b and not b.get("disabled"):
            if any(n in json.dumps(b, ensure_ascii=False).lower() for n in FORMER_STAFF):
                continue
            yield b["type"], b.get("settings") or {}


SCHEME = {"scheme_2": " scheme-dark", "scheme_4": " scheme-dark", "scheme_5": " scheme-grey"}


def text_blocks(sec, btn_cls="btn-dark"):
    out, btns = [], []
    for t, s in blocks(sec):
        if t == "overline" and s.get("text"):
            out.append(f'<p class="overline">{s["text"]}</p>')
        elif t == "heading" and s.get("heading"):
            size = s.get("heading_font_size", 4)
            out.append(f'<h2 class="h-{size}">{s["heading"]}</h2>')
        elif t == "text" and s.get("text"):
            out.append(f'<div class="rte">{s["text"]}</div>')
        elif t == "button":
            b = button(s.get("button_link"), s.get("button_label"), btn_cls)
            if b:
                btns.append(b)
    if btns:
        out.append('<div class="btns">' + "".join(btns) + "</div>")
    return "\n".join(out)


def r_image_hero(sec):
    st = sec["settings"]
    h = st.get("custom_desktop_height", "650px")
    mh = st.get("custom_mobile_height", "450px")
    op = st.get("overlay_opacity", 20) / 100
    return f'''<section class="sub-hero" style="--h:{esc(h)};--mh:{esc(mh)}">
  {media(st.get("image"))}<div class="overlay" style="opacity:{op}"></div>
  <div class="sub-hero-content" style="max-width:{max(st.get("content_width", 500) + 100, 960)}px">{text_blocks(sec, "btn-light")}</div>
</section>'''


def r_rich_text(sec):
    st = sec["settings"]
    w = st.get("custom_width", 650) if st.get("content_width") == "custom-width" else 900
    al = st.get("text_alignment", "center")
    return f'''<section class="sec rich-sub{SCHEME.get(st.get("color_scheme"), "")}" style="padding:{st.get("top_padding", 50)}px 0 {st.get("bottom_padding", 50)}px">
  <div class="page-width"><div class="rich-inner" style="max-width:{w}px;text-align:{al};{"margin:0 auto" if al == "center" else ""}">{text_blocks(sec)}</div></div>
</section>'''


def r_image_with_text(sec):
    st = sec["settings"]
    pad = f'padding:{st.get("top_padding", 50)}px 0 {st.get("bottom_padding", 50)}px'
    cls = f'sec{SCHEME.get(st.get("color_scheme"), "")}'
    img = st.get("image")
    heading = next((plain(b.get("heading")) for t, b in blocks(sec) if t == "heading" and b.get("heading")), "")
    if not has_img(img):
        # Bild fehlt: Abschnitt nur mit Text statt leerer Fläche
        return f'''<section class="{cls}" style="{pad}">
  <div class="page-width"><div class="rich-inner" style="max-width:760px">{text_blocks(sec)}</div></div>
</section>'''
    mw = st.get("desktop_media_width", 50)
    right = st.get("desktop_media_position") == "right"
    ar = {"portrait-alt": "4 / 5", "portrait": "2 / 3", "square": "1 / 1", "landscape": "4 / 3"}.get(st.get("aspect_ratio"), "auto")
    pic = f'<div class="iwt-media" style="aspect-ratio:{ar}"><img src="images/{esc(img_name(img))}" alt="{esc(heading)}" loading="lazy"></div>'
    txt = f'<div class="iwt-text" style="max-width:{st.get("custom_width", 500)}px">{text_blocks(sec)}</div>'
    cols = f"{100 - mw}fr {mw}fr" if right else f"{mw}fr {100 - mw}fr"
    inner = txt + pic if right else pic + txt
    return f'''<section class="{cls}" style="{pad}">
  <div class="page-width iwt{" media-right" if right else ""}" style="--cols:{cols}">{inner}</div>
</section>'''


def r_slideshow(sec):
    st = sec["settings"]
    slides = []
    for t, s in blocks(sec):
        if t != "image":
            continue
        parts = []
        if s.get("overline"):
            parts.append(f'<p class="overline">{s["overline"]}</p>')
        if s.get("heading"):
            parts.append(f'<h2>{s["heading"]}</h2>')
        if s.get("text"):
            parts.append(f'<p>{s["text"]}</p>')
        bs = button(s.get("button_1_link"), s.get("button_1_label"), "btn-light") + button(s.get("button_2_link"), s.get("button_2_label"), "btn-light")
        if bs:
            parts.append(f'<div class="btns" style="justify-content:center">{bs}</div>')
        if not has_img(s.get("image")) and not parts:
            continue
        op = s.get("overlay_opacity", 20) / 100
        slides.append(f'<div class="slide">{media(s.get("image"))}<div class="overlay" style="opacity:{op}"></div>'
                      f'<div class="slide-content"><div style="max-width:{s.get("content_max_width", 700)}px">{"".join(parts)}</div></div></div>')
    if not slides:
        return ""
    padded = st.get("width") == "full-width-padded"
    h = st.get("custom_desktop_height", "750px")
    mh = st.get("custom_mobile_height", "650px")
    nav = ""
    if len(slides) > 1:
        nav = '''<div class="arrows"><button data-dir="-1" aria-label="Vorheriger Slide"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button><button data-dir="1" aria-label="Nächster Slide"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></button></div><div class="dots"></div>'''
    return f'''<section class="{"slides-section" if padded else ""}" style="{"padding-top:%spx;padding-bottom:%spx" % (st.get("top_padding", 0), st.get("bottom_padding", 0)) if padded else ""}">
  <div class="slider" data-interval="{st.get("time_between_slides", 6) * 1000}" style="--h:{esc(h)};--mh:{esc(mh)}">{"".join(slides)}{nav}</div>
</section>'''


def r_multi_column(sec):
    st = sec["settings"]
    cols = []
    for _, s in blocks(sec):
        img = f'<div class="mc-media">{media(s.get("image"))}</div>' if s.get("display_media", True) and has_img(s.get("image")) else ""
        b = button(s.get("button_link"), s.get("button_label"), "btn-dark")
        cols.append(f'<div class="mc-col">{img}<h3>{esc(s.get("heading", ""))}</h3><div class="rte">{s.get("text", "")}</div>{b}</div>')
    head = f'<h2 class="sec-head">{esc(st["section_header_heading"])}</h2>' if st.get("section_header_heading") else ""
    if st.get("section_header_text"):
        head += f'<div class="rte sec-sub">{st["section_header_text"]}</div>'
    n = st.get("column_count_desktop", "3")
    return f'''<section class="sec{SCHEME.get(st.get("color_scheme"), "")}" style="padding:{st.get("top_padding", 50)}px 0 {st.get("bottom_padding", 50)}px">
  <div class="page-width">{head}<div class="mc-grid" style="--n:{n}">{"".join(cols)}</div></div>
</section>'''


def r_collapsible(sec):
    st = sec["settings"]
    rows = "".join(
        f'<details{" open" if s.get("expand_by_default") else ""}><summary><span>{esc(s.get("heading", ""))}</span></summary><div class="rte">{s.get("text", "")}</div></details>'
        for _, s in blocks(sec))
    head = f'<h2 class="sec-head">{esc(st["section_header_heading"])}</h2>' if st.get("section_header_heading") else ""
    if st.get("section_header_text"):
        head += f'<div class="rte sec-sub">{st["section_header_text"]}</div>'
    return f'''<section class="sec{SCHEME.get(st.get("color_scheme"), "")}" style="padding:{st.get("top_padding", 50)}px 0 {st.get("bottom_padding", 50)}px">
  <div class="page-width"><div class="faq">{head}{rows}</div></div>
</section>'''


def r_icon_columns(sec):
    st = sec["settings"]
    cols = "".join(f'<div class="mc-col"><h3>{esc(s.get("heading", ""))}</h3><div class="rte"><p>{s.get("text", "")}</p></div></div>'
                   for _, s in blocks(sec))
    return f'''<section class="sec{SCHEME.get(st.get("color_scheme"), "")}" style="padding:{st.get("top_padding", 40)}px 0 {st.get("bottom_padding", 40)}px">
  <div class="page-width"><div class="mc-grid" style="--n:{st.get("desktop_columns_per_row", "3")}">{cols}</div></div>
</section>'''


def r_contact_form(sec):
    st = sec["settings"]
    labels = {"Name": "Name", "Email": "E-Mail", "Phone": "Telefon", "Message": "Nachricht"}
    fields, submit = [], "Senden"
    for t, s in blocks(sec):
        lab = labels.get(s.get("label"), s.get("label", ""))
        half = " half" if s.get("width") == "half-width" else ""
        if t == "text-input":
            fields.append(f'<label class="f{half}">{esc(lab)}<input name="name" required></label>')
        elif t == "email":
            fields.append(f'<label class="f{half}">{esc(lab)}<input name="email" type="email" required></label>')
        elif t == "phone":
            fields.append(f'<label class="f{half}">{esc(lab)}<input name="phone" type="tel"></label>')
        elif t == "text-area":
            fields.append(f'<label class="f{half}">{esc(lab)}<textarea name="message" rows="7" required></textarea></label>')
        elif t == "submit":
            submit = s.get("label") or submit
    head = f'<h3 class="h-5">{esc(st.get("heading", ""))}</h3>' if st.get("heading") else ""
    text = f'<div class="rte">{st["text"]}</div>' if st.get("text") else ""
    return f'''<section class="sec" style="padding:{st.get("top_padding", 60)}px 0 {st.get("bottom_padding", 60)}px">
  <div class="page-width"><div class="contact-form" style="max-width:{st.get("custom_width", 650)}px">{head}{text}
    <form class="mail-form">{"".join(fields)}<button class="btn btn-dark" type="submit">{esc(submit)}</button></form>
  </div></div>
</section>'''


def r_scrolling(sec):
    return ""  # Laufschrift auf Wunsch entfernt
    st = sec["settings"]
    txt = " ".join(re.sub("<[^>]+>", "", s.get("text", "")) for _, s in blocks(sec))
    return f'''<section class="scroll-sec" style="padding:{st.get("top_padding", 40)}px 0 {st.get("bottom_padding", 40)}px">
  <div class="marquee" aria-label="{esc(txt)}"><div class="marquee-track slow" data-text="{esc(txt)}"></div></div>
</section>'''


def r_custom_liquid(sec):
    code = sec["settings"].get("custom_liquid", "")
    if "join.com/api/widget" not in code:
        return ""
    return f'<section class="sec"><div class="page-width">{code}</div></section>'


def r_blocks(sec):
    out = []
    for t, s in blocks(sec):
        if t == "ai_gen_block_699b8cf":
            out.append('''<section class="map" id="karte">
  <div class="map-consent">
    <p><strong>Bettelhecker Straße 15, 96515 Sonneberg</strong></p>
    <p>Die Karte wird von Google Maps geladen. Dabei werden Daten an Google übertragen (siehe <a href="datenschutz.html">Datenschutz</a>).</p>
    <div class="btns" style="justify-content:center">
      <button class="btn btn-dark" type="button" data-load-map>Karte laden</button>
      <a class="btn btn-outline-dark" href="https://www.google.com/maps/search/?api=1&query=Bettelhecker+Stra%C3%9Fe+15+96515+Sonneberg" target="_blank" rel="noopener">In Google Maps öffnen</a>
    </div>
  </div>
</section>''')
        elif t == "ai_gen_block_171b48e":
            out.append(f'''<section class="countdown">
  <h2>{esc(s.get("heading"))}</h2><p>{esc(s.get("intro"))}</p>
  <div class="cd-cards">
    <div class="cd-card"><b>{s.get("booked_count", "")}</b><span>{esc(s.get("booked_label"))}</span></div>
    <div class="cd-card" data-countdown="{esc(s.get("target_date"))}"><b>–</b><span>{esc(s.get("countdown_label"))}</span></div>
  </div>
</section>''')
        elif t == "ai_gen_block_5263b44":
            out.append(f'''<section class="promo-box">
  <span class="badge">{esc(s.get("badge_text"))}</span>
  <h2>{esc(s.get("heading"))}</h2><p>{esc(s.get("message"))}</p>
  <div class="progress"><div style="width:{min(int(s.get("winners_count", 0)) * 10, 100)}%"></div></div>
  <p class="muted">{esc(s.get("progress_label"))}: {s.get("winners_count", 0)}</p>
  <p class="muted small">{esc(s.get("fineprint"))}</p>
</section>''')
        elif t == "ai_gen_block_67973b3":
            out.append(f'''<section class="cta-box">
  <h2>{esc(s.get("title"))}</h2><p>{esc(s.get("message"))}</p>
  <div class="btns" style="justify-content:center">
    <a class="btn btn-dark" href="tel:+49{s.get("phone_number", "")[1:]}">{esc(s.get("call_label"))}</a>
    <a class="btn btn-dark" href="https://wa.me/49{s.get("phone_number", "")[1:]}?text={esc(s.get("whatsapp_message", "").replace(" ", "%20"))}" target="_blank" rel="noopener">{esc(s.get("whatsapp_label"))}</a>
  </div>
</section>''')
    return "\n".join(out)


RENDER = {
    "image-hero": r_image_hero, "rich-text": r_rich_text, "image-with-text": r_image_with_text,
    "slideshow": r_slideshow, "multi-column": r_multi_column, "collapsible-content": r_collapsible,
    "icon-with-text-columns": r_icon_columns, "contact-form": r_contact_form, "scrolling-content": r_scrolling,
    "custom-liquid": r_custom_liquid, "_blocks": r_blocks,
}

OVERVIEW_CSS = ""

EXTRA_CSS = """
  /* Unterseiten */
  .sec { background: var(--white); }
  .scheme-dark { background: var(--black); color: var(--white); }
  .scheme-grey { background: var(--grey); }
  .overline { font-size: 13px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 12px; }
  .h-1 { font-size: 16px; } .h-2 { font-size: 20px; } .h-3 { font-size: clamp(24px, 2.6vw, 32px); } .h-4 { font-size: clamp(26px, 3vw, 38px); }
  .h-5 { font-size: clamp(30px, 3.6vw, 46px); } .h-6, .h-7 { font-size: clamp(34px, 4.6vw, 60px); } .h-8 { font-size: clamp(38px, 5.6vw, 76px); }
  .rte { margin-top: 14px; overflow-wrap: break-word; }
  .iwt > *, .mc-grid > * { min-width: 0; }
  .sub-hero-content, .slide-content > div { max-width: 100%; overflow-wrap: break-word; }
  .scroll-sec { overflow: hidden; }
  main h1, main h2, main h3, main .heading, .faq summary { overflow-wrap: break-word; hyphens: auto; }
  .faq summary span { flex: 1; min-width: 0; }
  .rte p { margin-bottom: 12px; } .rte ul, .rte ol { margin: 0 0 12px 22px; } .rte li { margin-bottom: 4px; }
  .rte h2, .rte h3 { margin: 22px 0 12px; font-size: clamp(22px, 2.4vw, 30px); }
  .rte a { text-decoration: underline; }
  .rte table { border-collapse: collapse; width: 100%; margin: 12px 0; } .rte td, .rte th { border: 1px solid var(--line); padding: 8px 10px; text-align: left; }
  .crumbs { display: flex; flex-wrap: wrap; gap: 8px; font-size: 14px; color: #555; padding-top: 16px; padding-bottom: 4px; }
  .crumbs a { text-decoration: underline; text-underline-offset: 3px; }
  .svc-quick { padding: 14px 0 26px; border-bottom: 1px solid var(--line); }
  .svc-quick-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px 30px; }
  .svc-quick .trust { color: var(--text); }
  .svc-quick .trust svg { color: #6b6b6b; }
  .svc-quick .btns { margin-top: 0; display: flex; flex-wrap: wrap; gap: 10px; }
  .svc-steps { padding: 70px 0; background: var(--grey); }
  .svc-steps h2 { font-size: clamp(28px, 3.2vw, 40px); margin-bottom: 30px; }
  .cat-nav { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
  .cat-nav a { padding: 9px 14px; background: var(--white); border: 1px solid var(--line); font-weight: 600; font-size: 14px; }
  .cat-nav a:hover { border-color: var(--black); }
  .cat-head { font-size: clamp(24px, 2.6vw, 32px); margin: 40px 0 16px; scroll-margin-top: 140px; }
  .svc.has-img { padding-top: 0; }
  .svc-img { display: block; aspect-ratio: 16 / 9; margin: 0 -24px 14px; overflow: hidden; background: var(--grey); }
  .svc-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s cubic-bezier(.2,.8,.2,1); }
  .svc:hover .svc-img img { transform: scale(1.04); }
  @media (max-width: 600px) { .svc.has-img { padding: 0 16px 16px; } .svc-img { margin: 0 -16px 12px; } .svc.has-img::after { top: auto; bottom: 18px; transform: none; } }
  .booking-cta { background: var(--black); color: var(--white); padding: 70px 0; text-align: center; }
  .booking-cta h2 { font-size: clamp(30px, 4vw, 46px); }
  .booking-cta p { max-width: 620px; margin: 14px auto 0; color: rgba(255,255,255,.8); }
  .booking-cta .btns { justify-content: center; }
  .booking-cta .trust { justify-content: center; margin: 18px 0 4px; }
  .callback-hint { margin-top: 10px !important; }
  .callback-hint a { text-decoration: underline; text-underline-offset: 3px; color: var(--white); }
  .btn-outline-light { background: transparent; color: var(--white); border-color: rgba(255,255,255,.6); }
  .btn-outline-light:hover { border-color: var(--white); background: var(--white); color: var(--black); }
  .finder { padding: 90px 0 30px; }
  .finder-list { list-style: none; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 48px; border-top: 1px solid var(--black); }
  .finder-list a { display: flex; align-items: baseline; gap: 18px; padding: 22px 4px; border-bottom: 1px solid var(--line); transition: padding .3s cubic-bezier(.2,.8,.2,1); }
  .finder-list a:hover { padding-left: 14px; }
  .finder-list .q { font-weight: 700; font-size: 19px; flex: 1; }
  .finder-list .to { font-size: 14px; color: #555; text-align: right; }
  .finder-list .to::after { content: " →"; color: var(--black); }
  .cat-sec { padding: 70px 0 0; scroll-margin-top: 120px; }
  .cat-sec .cat-top { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px 60px; align-items: end; margin-bottom: 32px; }
  .cat-sec h2 { font-size: clamp(30px, 3.6vw, 50px); line-height: 1.02; }
  .cat-sec .cat-top p { color: #555; font-size: 17px; max-width: 520px; }
  .tile-grid.c4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tile-grid.c4 .tile-svc { aspect-ratio: 16 / 10; }
  .tile-grid.c1 { grid-template-columns: 1fr; }
  .tile-grid.c5 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .tile-grid.c5 > * { grid-column: span 2; }
  .tile-grid.c5 > :nth-child(-n+2) { grid-column: span 3; aspect-ratio: 16 / 10; }
  .tile-grid.c1 .tile-svc { aspect-ratio: 21 / 8; }
  .tile-body h3 { font-size: clamp(18px, 1.55vw, 23px); overflow-wrap: normal; hyphens: manual; }
  .chips { list-style: none; display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
  .chips a { display: inline-block; padding: 10px 16px; border: 1px solid var(--line); font-size: 15px; transition: border-color .2s; }
  .chips a:hover { border-color: var(--black); }
  .more-svc { padding: 80px 0; }
  .more-svc h2 { font-size: clamp(28px, 3.2vw, 44px); margin-bottom: 28px; }
  .svc-layout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 70px; align-items: start; padding-top: 70px; padding-bottom: 30px; }
  .svc-article > div + div { margin-top: 56px; padding-top: 56px; border-top: 1px solid var(--line); }
  .svc-article h2 { font-size: clamp(26px, 2.8vw, 38px); margin-bottom: 18px; }
  .svc-aside { position: sticky; top: 110px; background: var(--black); color: var(--white); padding: 32px; }
  .svc-aside h2 { font-size: 22px; margin-bottom: 18px; }
  .svc-aside .trust { flex-direction: column; gap: 10px; color: rgba(255,255,255,.9); }
  .svc-aside .btns { flex-direction: column; margin-top: 24px; gap: 10px; display: flex; }
  .svc-aside .btn { width: 100%; text-align: center; }
  .svc-aside .hours { margin-top: 20px; font-size: 14px; color: rgba(255,255,255,.7); }
  @media (max-width: 990px) { .tile-grid.c5 { grid-template-columns: 1fr 1fr; } .tile-grid.c5 > * { grid-column: auto; } .tile-grid.c5 > :first-child { grid-column: 1 / -1; } .svc-layout { grid-template-columns: 1fr; gap: 40px; } .svc-aside { display: none; } }
  @media (max-width: 760px) { .finder { padding-top: 60px; } .finder-list { grid-template-columns: 1fr; } .finder-list .to { display: none; } .finder-list .q::after { content: " →"; } .cat-sec .cat-top { grid-template-columns: 1fr; } .tile-grid.c4, .tile-grid.c5 { grid-template-columns: 1fr; } .tile-grid.c5 > * { aspect-ratio: 4 / 3 !important; } .tile-grid.c1 .tile-svc { aspect-ratio: 4 / 3; } .more-svc { padding: 56px 0; } .svc-layout { padding-top: 50px; } .tile-body h3 { font-size: 19px; } .tile-grid.c4 .tile-svc { aspect-ratio: 4 / 3; } }
  .related { background: var(--grey); padding: 50px 0; }
  .related-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
  .related h2 { font-size: 18px; margin-bottom: 14px; }
  .related ul { list-style: none; display: flex; flex-wrap: wrap; gap: 10px; }
  .related a { display: inline-block; padding: 9px 14px; background: var(--white); border: 1px solid var(--line); font-size: 15px; transition: border-color .2s; }
  .related a:hover { border-color: var(--black); }
  @media (max-width: 760px) { .related-grid { grid-template-columns: 1fr; } }
  .sub-hero h1.overline { font-family: Inter, sans-serif; text-transform: uppercase; letter-spacing: .14em; font-size: 13px; font-weight: 600; line-height: 1.5; margin-bottom: 12px; }
  .sec h1.overline, .rich-sub h1.overline { font-family: Inter, sans-serif; letter-spacing: .14em; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
  .rte table.compare { margin: 18px 0 20px; font-size: 15px; }
  .compare thead th { background: var(--black); color: var(--white); font-weight: 700; border-color: var(--black); }
  .compare thead th:nth-child(2) { background: #3a3a3a; border-color: #3a3a3a; }
  .compare tbody th { font-weight: 600; background: var(--grey); width: 32%; }
  .compare td:nth-child(2) { font-weight: 600; }
  @media (max-width: 600px) { .rte table.compare { font-size: 13px; } .compare th, .compare td { padding: 7px 6px; } }
  .btns { margin-top: 22px; }
  .sub-hero { position: relative; height: var(--h); min-height: 380px; color: var(--white); display: grid; place-items: center; text-align: center; overflow: hidden; }
  .sub-hero-content { position: relative; padding: 40px 20px; }
  .sub-hero-content .btns { justify-content: center; }
  .iwt { display: grid; grid-template-columns: var(--cols); gap: 60px; align-items: center; }
  .iwt-media { position: relative; overflow: hidden; background: #2a2a2a; min-height: 320px; }
  .iwt-media img { width: 100%; height: 100%; object-fit: cover; }
  .iwt-text { width: 100%; }
  .media-right .iwt-text { justify-self: end; }
  .slider { height: var(--h); }
  .slider:not(:has(.slide.active)) .slide:first-child { opacity: 1; clip-path: none; }
  .slide-content p { margin: 14px 0; font-size: 17px; }
  .sec-head { font-size: clamp(28px, 3.4vw, 44px); margin-bottom: 30px; }
  .sec-sub { margin: -16px 0 30px; }
  .mc-grid { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: 30px; }
  .mc-media { position: relative; aspect-ratio: 4 / 5; margin-bottom: 18px; }
  .mc-col h3 { font-size: 20px; }
  .mc-col .btn { margin-top: 10px; }
  .faq { max-width: 900px; margin: 0 auto; }
  .faq details { border-bottom: 1px solid var(--line); overflow: hidden; }
  .faq summary::after { flex: none; width: 20px; text-align: center; }
  .faq summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; gap: 20px; padding: 20px 0; font-weight: 700; font-size: 18px; }
  .faq summary::-webkit-details-marker { display: none; }
  .faq summary::after { content: "+"; font-size: 24px; line-height: 1; transition: transform .2s; }
  .faq details[open] summary::after { transform: rotate(45deg); }
  .faq .rte { margin-top: 0; padding-bottom: 12px; }
  .contact-form { margin: 0 auto; }
  .mail-form { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 24px; }
  .mail-form .f { display: grid; gap: 6px; font-size: 14px; font-weight: 600; width: 100%; }
  .mail-form .f.half { width: calc(50% - 8px); }
  .mail-form input, .mail-form textarea { font: inherit; font-weight: 400; padding: 13px 14px; border: 1px solid var(--line); background: var(--white); }
  .mail-form input:focus, .mail-form textarea:focus { outline: 2px solid var(--black); outline-offset: -1px; }
  .scroll-sec .marquee { margin: 0; }
  .map iframe { display: block; width: 100%; height: 450px; border: 0; }
  .map-consent { min-height: 450px; display: grid; place-content: center; text-align: center; gap: 10px; padding: 40px 20px; background: var(--grey); }
  .map-consent p { max-width: 560px; margin: 0 auto; }
  .map-consent a { text-decoration: underline; }
  .btn-outline-dark { background: transparent; color: var(--black); border-color: var(--black); }
  .btn-outline-dark:hover { background: var(--black); color: var(--white); }
  .countdown, .promo-box, .cta-box { text-align: center; padding: 60px 20px; }
  .countdown { background: #050505; color: #fff; }
  .countdown h2 { font-size: clamp(30px, 4vw, 42px); }
  .countdown p { margin-top: 12px; }
  .cd-cards { display: flex; justify-content: center; flex-wrap: wrap; gap: 20px; margin-top: 30px; }
  .cd-card { background: #1a1a1a; border: 1px solid rgba(255,255,255,.35); border-radius: 0; padding: 24px 32px; min-width: 240px; }
  .cd-card b { display: block; font-family: "Archivo Black"; color: #fff; font-size: clamp(36px, 5vw, 54px); line-height: 1.1; }
  .promo-box { background: #000; color: #fff; }
  .promo-box .badge { display: inline-block; background: #fff; color: #000; font-weight: 700; padding: 6px 14px; margin-bottom: 16px; }
  .promo-box h2 { font-size: 30px; margin-bottom: 10px; }
  .progress { max-width: 420px; height: 10px; background: #4a4a4a; margin: 24px auto 10px; }
  .progress div { height: 100%; background: #fff; }
  .muted { color: #d1d1d1; } .small { font-size: 13px; margin-top: 6px; }
  .cta-box h2 { font-size: 28px; margin-bottom: 10px; }
  @media (max-width: 990px) {
    .iwt { grid-template-columns: 1fr; gap: 28px; }
    .iwt .iwt-media { order: -1; }
    .media-right .iwt-text { justify-self: start; }
    .mc-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 600px) {
    .sub-hero { height: var(--mh); }
    .slider { height: var(--mh); }
    .mail-form .f.half { width: 100%; }
    .map iframe { height: 300px; }
  }
"""

PAGE_JS = """
  // Slideshows
  document.querySelectorAll('.slider').forEach(sl => {
    const slides = [...sl.querySelectorAll('.slide')], dots = sl.querySelector('.dots');
    let cur = 0, timer;
    const go = i => {
      cur = (i + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle('active', j === cur));
      if (dots) [...dots.children].forEach((d, j) => d.classList.toggle('active', j === cur));
      clearInterval(timer);
      if (slides.length > 1) timer = setInterval(() => go(cur + 1), +sl.dataset.interval || 6000);
    };
    if (dots) slides.forEach((_, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', 'Slide ' + (i + 1)); b.onclick = () => go(i); dots.appendChild(b); });
    sl.querySelectorAll('.arrows button').forEach(b => b.onclick = () => go(cur + +b.dataset.dir));
    go(0);
  });

  // Laufschrift
  const runMarquees = () => document.querySelectorAll('.marquee-track[data-text]').forEach(t => startMarquee(t, `<span>${t.dataset.text}</span>`));
  runMarquees();
  if (document.fonts) document.fonts.ready.then(runMarquees);
  let mqTimer; addEventListener('resize', () => { clearTimeout(mqTimer); mqTimer = setTimeout(runMarquees, 250); });

  // Google-Karte erst nach Zustimmung laden
  document.querySelectorAll('[data-load-map]').forEach(btn => btn.addEventListener('click', () => {
    const sec = btn.closest('.map');
    sec.innerHTML = '<iframe title="Täubert Karosserie und Lack Standort" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Bettelhecker+Stra%C3%9Fe+15,+96515+Sonneberg&z=15&output=embed"></iframe>';
  }));

  // Anfragen zählen (nur wenn eine cookielose Statistik wie Plausible eingebunden ist)
  const track = (name, props) => { if (window.plausible) window.plausible(name, { props }); };
  document.addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a) return;
    const h = a.getAttribute('href') || '', page = location.pathname.split('/').pop() || 'index.html';
    if (h.startsWith('tel:')) track('Anruf', { page });
    else if (h.includes('wa.me')) track('WhatsApp', { page });
    else if (h.endsWith('termin.html') || h.includes('terminbuchungtaeubert')) track('Termin', { page });
    else if (h.endsWith('schaden-melden.html')) track('Schaden melden', { page });
  });

  // Countdown
  document.querySelectorAll('[data-countdown]').forEach(el => {
    const target = new Date(el.dataset.countdown), b = el.querySelector('b');
    const tick = () => {
      const ms = target - new Date();
      if (ms <= 0) { b.textContent = 'Vorbei'; return; }
      const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
      b.textContent = `${d}T ${h}h ${m}m`;
    };
    tick(); setInterval(tick, 30000);
  });

  // Kontaktformular -> E-Mail-Programm (statische Seite ohne Server)
  document.querySelectorAll('.mail-form').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    if (!f.checkValidity()) { f.reportValidity(); return; }
    const v = n => (f.elements[n] || {}).value || '';
    const body = `Name: ${v('name')}\\nE-Mail: ${v('email')}\\nTelefon: ${v('phone')}\\n\\n${v('message')}`;
    location.href = 'mailto:hallo@taeubert-karosserie-lack.de?subject=' + encodeURIComponent('Anfrage über die Website') + '&body=' + encodeURIComponent(body);
  }));
"""


def shell():
    src = open(os.path.join(SITE, "index.html"), encoding="utf-8").read()
    style = re.search(r"<style>(.*?)</style>", src, re.S).group(1)
    head_links = re.search(r'(<link rel="icon"[^>]*>(?:\s*<link rel="preload"[^>]*as="font"[^>]*>)*)', src, re.S).group(1)
    top = re.search(r'(<a class="skip".*?</aside>)', src, re.S).group(1)
    top = top.replace('class="header transparent"', 'class="header"')
    footer = re.search(r"(<footer>.*?</footer>)", src, re.S).group(1)
    js = re.search(r"<script>(.*?)</script>", src, re.S).group(1)
    marquee_js = re.search(r"(  // Laufschrift: zwei identische.*?\n  \})\n", js, re.S).group(1) + "\n"
    menu_js = re.search(r"(  // Menü-Drawer.*?addEventListener\('keydown'.*?\n)", js, re.S).group(1)
    img_js = re.search(r"(  // Fehlende Bilddateien.*?\n  \}\);\n)", js, re.S).group(1)
    nav_js = re.search(r"(  // Hauptnavigation: Aufklappmenüs.*?\n  \}\)\(\);\n)", js, re.S).group(1)
    status_js = re.search(r"(  // Öffnungsstatus.*?\n  \}\)\(\);\n)", js, re.S).group(1)
    return style, head_links, top, footer, menu_js + nav_js + img_js + status_js + marquee_js + PAGE_JS + "  document.getElementById('year').textContent = new Date().getFullYear();\n"


def first_heading(d):
    for k in d["order"]:
        s = d["sections"][k]
        if s.get("disabled"):
            continue
        for t, b in blocks(s):
            for key in ("heading", "title"):
                if b.get(key) and t != "overline":
                    return re.sub("<[^>]+>", "", b[key]).strip()
    return ""



# SEO für Leistungs- und Standortseiten: Titel, Beschreibung, H1 (Leistung + Ort)
SERVICES = {
    "karosserie": ("Karosserie Sonneberg & Neustadt b. Coburg", "Karosseriearbeiten",
                   "Karosseriereparatur in Sonneberg & Neustadt bei Coburg: Richtbank, präzise Vermessung, Reparatur nach Herstellervorgaben – Lack direkt im Haus."),
    "lackierarbeiten": ("Lackierarbeiten & Autolackierung Sonneberg", "Lackierarbeiten",
                        "Autolackierung in Sonneberg: digitale Farbtonmessung, staubfreie Lackierkabine, Spot Repair und Komplettlackierung – ohne sichtbaren Unterschied."),
    "unfallinstandsetzung": ("Unfallinstandsetzung Sonneberg & Coburg", "Unfallinstandsetzung",
                             "Unfallreparatur in Sonneberg & Neustadt bei Coburg: Karosserie, Lack und Abwicklung mit Versicherung und Gutachter aus einer Hand."),
    "smartrepair": ("Smart Repair Sonneberg – Dellen ohne Lackieren", "Smart Repair",
                    "Smart Repair in Sonneberg: Dellen und kleine Schäden ohne Neulackierung entfernen – Originallack bleibt, oft in wenigen Stunden erledigt."),
    "kleinschaden": ("Kleinschaden-Reparatur Sonneberg", "Kleinschaden-Reparatur",
                     "Parkschaden, Kratzer oder Delle? Kleinschaden-Reparatur in Sonneberg & Neustadt bei Coburg – schnell, günstig und mit Originallack."),
    "kratzer": ("Kratzer im Auto entfernen – Sonneberg", "Kratzer entfernen",
                "Kratzer im Lack entfernen lassen in Sonneberg: vom oberflächlichen Kratzer bis zur Tiefe – mit exakter Farbtonanpassung."),
    "leasingrueckgabe": ("Leasingrückgabe vorbereiten – Sonneberg", "Leasingrückgabe",
                         "Leasingrückgabe in Sonneberg vorbereiten: Schäden vorab günstig beseitigen und teure Nachzahlungen beim Leasinggeber vermeiden."),
    "fahrzeugaufbereitung": ("Fahrzeugaufbereitung Sonneberg", "Fahrzeugaufbereitung",
                             "Fahrzeugaufbereitung in Sonneberg: Politur, Innenraumreinigung und Lackpflege – ideal vor Verkauf oder Leasingrückgabe."),
    "reifenservice": ("Reifenservice Sonneberg & Neustadt", "Reifenservice",
                      "Reifenwechsel, Räderwechsel und Rädereinlagerung in Sonneberg & Neustadt bei Coburg – Termin online buchen."),
    "unfall": ("Unfall gehabt? Unfallreparatur Sonneberg", "Unfallreparatur",
               "Unfall gehabt? Täubert in Sonneberg kümmert sich um Reparatur, Versicherung und Gutachten – direkte Abrechnung mit der Versicherung."),
    "unfall-oder-kratzer": ("Unfall oder Kratzer – wer zahlt?", "Ratgeber Reparaturkosten",
                            "Wer übernimmt die Reparaturkosten nach Unfall oder Kratzer? Antworten zu Versicherung, Gutachter und Ersatzwagen von Täubert in Sonneberg."),
    "auto-lackieren-kosten": ("Auto lackieren: Kosten & Beispiele", "Ratgeber Lackierkosten",
                              "Was kostet es, ein Auto lackieren zu lassen? Preise und Beispiele für Teil- und Komplettlackierung von Täubert in Sonneberg."),
}
LOCATIONS = {
    "sonneberg": ("Lackierer & Karosserie Sonneberg", "Sonneberg",
                  "Ihr Lackierer und Karosseriebauer in Sonneberg: Unfallreparatur, Lackierung, Smart Repair und Versicherungsabwicklung – Bettelhecker Straße 15."),
    "neustadt": ("Lackierer & Karosserie Neustadt bei Coburg", "Neustadt bei Coburg",
                 "Lackierer nahe Neustadt bei Coburg: Unfallreparatur, Lackierung und Smart Repair bei Täubert – nur wenige Minuten entfernt in Sonneberg."),
    "coburg": ("Lackierer & Karosserie Coburg", "Coburg",
               "Karosserie und Lackierung für Autofahrer aus Coburg: Unfallreparatur, Lackierarbeiten und Abwicklung mit der Versicherung bei Täubert."),
    "roedental": ("Lackierer & Karosserie Rödental", "Rödental",
                  "Karosserie und Lackierung für Rödental: Unfallreparatur, Parkrempler und Smart Repair bei Täubert Karosserie & Lack in Sonneberg."),
    "kronach": ("Lackierer & Karosserie Kronach", "Kronach",
                "Lackierer für Kronach: Unfallreparatur, Lackierung und Smart Repair bei Täubert Karosserie & Lack in Sonneberg."),
    "bamberg": ("Lackierer & Karosserie Bamberg", "Bamberg",
                "Karosserie und Lackierung für Autofahrer aus Bamberg: Unfallreparatur, Lackierarbeiten und Smart Repair bei Täubert in Sonneberg."),
}
SERVICE_LINKS = [("karosserie", "Karosserie"), ("lackierarbeiten", "Lackierarbeiten"), ("unfallinstandsetzung", "Unfallinstandsetzung"),
                 ("smartrepair", "Smart Repair"), ("kleinschaden", "Kleinschaden"), ("kratzer", "Kratzer entfernen"),
                 ("leasingrueckgabe", "Leasingrückgabe"), ("fahrzeugaufbereitung", "Fahrzeugaufbereitung"), ("reifenservice", "Reifenservice")]
SERVICE_LINKS += [(slug, p["short"]) for slug, p in NEW_PAGES.items()]
LOCATION_LINKS = [("sonneberg", "Sonneberg"), ("neustadt", "Neustadt bei Coburg"), ("coburg", "Coburg"),
                  ("roedental", "Rödental"), ("kronach", "Kronach"), ("bamberg", "Bamberg")]


def keyword_h1(body_html, h1):
    """Keyword-H1 als Zeile über der großen Überschrift; die bisherige Überschrift bleibt optisch gleich."""
    m = re.search(r"<section.*?</section>", body_html, re.S)
    first = m.group(0)
    new = re.sub(r'<p class="overline">.*?</p>', "", first, count=1, flags=re.S)
    new = re.sub(r"<h2 class=\"([^\"]*)\">(.*?)</h2>", r'<p class="heading \1">\2</p>', new, count=1, flags=re.S)
    new = re.sub(r'(<p class="heading )', f'<h1 class="overline">{esc(h1)}</h1>\\1', new, count=1)
    if "<h1" not in new:
        new = new.replace(">", f'><h1 class="overline">{esc(h1)}</h1>', 1)
    return body_html.replace(first, new, 1)


# Kundenversprechen (vom Betrieb bestätigt)
TRUST = ["Kostenvoranschlag in 24 Stunden", "Direkte Abrechnung mit der Versicherung", "Ersatzwagen", "Hol- und Bringservice", "Alle Marken"]
CHECK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
TRUST_HTML = '<ul class="trust">' + "".join(f"<li>{CHECK}{t}</li>" for t in TRUST) + "</ul>"


def booking_cta(slug, place):
    svc = "".join(f'<li><a href="{x}.html">{esc(n)}</a></li>' for x, n in SERVICE_LINKS if x != slug)
    loc = "".join(f'<li><a href="{x}.html">{esc(n)}</a></li>' for x, n in LOCATION_LINKS if x != slug)
    return f'''<section class="booking-cta">
  <div class="page-width">
    <h2>Termin online buchen</h2>
    {TRUST_HTML}
    <p class="callback-hint">Keine Zeit zum Buchen? <a href="termin.html#rueckruf">Rückruf anfordern</a> – wir melden uns.</p>
    <p>Wählen Sie Ihren Wunschtermin direkt online – oder rufen Sie uns an. Wir schauen uns Ihr Fahrzeug an und sagen Ihnen ehrlich, was Sinn macht.</p>
    <div class="btns">
      <a class="btn btn-light" href="{BOOKING}">Termin online buchen</a>
      <a class="btn btn-outline-light" href="schaden-melden.html">Schaden per Foto melden</a>
      <a class="btn btn-outline-light" href="tel:+4936754289606">03675 4289606</a>
      <a class="btn btn-outline-light" href="https://wa.me/4936754289606" target="_blank" rel="noopener">WhatsApp</a>
    </div>
  </div>
</section>
<nav class="related" aria-label="Weitere Leistungen und Standorte">
  <div class="page-width related-grid">
    <div><h2>Weitere Leistungen</h2><ul>{svc}</ul></div>
    <div><h2>Für Kunden aus</h2><ul>{loc}</ul></div>
  </div>
</nav>'''


def faq_ld(body_html):
    qa = []
    for m in re.finditer(r"<details[^>]*><summary><span>(.*?)</span></summary><div class=\"rte\">(.*?)</div></details>", body_html, re.S):
        q, a = plain(m.group(1)), plain(m.group(2))
        if q and a:
            qa.append({"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}})
    if not qa:
        return ""
    return '<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": qa}, ensure_ascii=False) + "</script>"


def service_ld(slug, name, desc):
    data = {"@context": "https://schema.org", "@type": "Service", "name": name, "description": desc,
            "url": f"{DOMAIN}/{slug}.html", "provider": {"@type": "AutoBodyShop", "name": "Täubert Karosserie und Lack GmbH", "url": f"{DOMAIN}/"},
            "areaServed": [n for _, n in LOCATION_LINKS]}
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + "</script>"


# Inhalte, die im Shopify-Editor zusammengelaufen sind, wieder lesbar machen
FIXES = [
    ("<p>Smart RepairKlassische Lackierung1–3 Stunden Reparaturmehrere Tage Werkstattdeutlich günstigerdeutlich teurer"
     "Originallack bleibt erhaltenneuer Lackkeine Farbabweichungenmöglich<br/></p>",
     '''<table class="compare">
<thead><tr><th scope="col"></th><th scope="col">Smart Repair</th><th scope="col">Klassische Lackierung</th></tr></thead>
<tbody>
<tr><th scope="row">Dauer</th><td>1–3 Stunden Reparatur</td><td>mehrere Tage Werkstatt</td></tr>
<tr><th scope="row">Kosten</th><td>deutlich günstiger</td><td>deutlich teurer</td></tr>
<tr><th scope="row">Lack</th><td>Originallack bleibt erhalten</td><td>neuer Lack</td></tr>
<tr><th scope="row">Farbabweichungen</th><td>keine</td><td>möglich</td></tr>
</tbody>
</table>'''),
    ("<h2></h2>", ""),
    ('<p class="overline">Overline</p>', ""),
]


def apply_fixes(body_html):
    for old, new in FIXES:
        body_html = body_html.replace(old, new)
    body_html = re.sub(r"<h1>(.*?)</h1>", r"<h2>\1</h2>", body_html, flags=re.S)
    return body_html


def description(body_html):
    """Erster Fließtext der Seite, auf ~155 Zeichen gekürzt."""
    for m in re.finditer(r'<div class="rte">(.*?)</div>', body_html, re.S):
        t = plain(m.group(1))
        if len(t) > 60:
            return t if len(t) <= 155 else t[:152].rsplit(" ", 1)[0] + " …"
    return "Täubert Karosserie & Lack – Karosseriebau und KFZ-Lackiererei in Sonneberg, Neustadt bei Coburg und Coburg."


def first_h1(body_html):
    """Erste H2 der Seite zur H1 machen (eine H1 pro Seite)."""
    return re.sub(r"<h2([^>]*)>(.*?)</h2>", r"<h1\1>\2</h1>", body_html, count=1, flags=re.S)


def seo_head(title, desc, slug, image=None):
    url = f"{DOMAIN}/" if slug == "index" else f"{DOMAIN}/{slug}.html"
    og_img = f'\n<meta property="og:image" content="{DOMAIN}/images/{esc(image)}">' if image else ""
    return f'''<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="de_DE">
<meta property="og:site_name" content="Täubert Karosserie &amp; Lack">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{url}">{og_img}
<meta name="twitter:card" content="summary_large_image">'''


def fill_alts(page):
    """Leere Alt-Texte im Inhalt durch den Seitentitel ersetzen (Menü/Footer bleiben dekorativ)."""
    t = re.search(r"<title>(.*?) \| ", page)
    if not t:
        return page
    i, j = page.find("<main"), page.find("</main>")
    if i < 0 or j < 0:
        return page
    main = re.sub(r'(<img\b[^>]*?)\salt=""', lambda m: f'{m.group(1)} alt="{t.group(1)}"', page[i:j])
    main = re.sub(r'<img\b(?![^>]*\balt=)([^>]*)>', lambda m: f'<img alt="{t.group(1)}"{m.group(1)}>', main)
    return page[:i] + main + page[j:]


def sync_images(page):
    """Fehlende Bilddateien nicht anfragen (keine 404): src <-> data-missing-src je nach Vorhandensein."""
    page = fill_alts(page)
    def fix(m):
        attr, path = m.group(1), m.group(2)
        exists = os.path.exists(os.path.join(SITE, path))
        return f'{"src" if exists else "data-missing-src"}="{path}"'
    page = re.sub(r'\b(src|data-missing-src)="(images/[^"]+)"', fix, page)
    # Responsive Bilder: kleine 700px-Variante fürs Handy anbieten
    widths = {}

    def srcset(m):
        tag = re.sub(r'\s(srcset|sizes)="[^"]*"', "", m.group(0))
        src = re.search(r'\bsrc="(images/[^"]+)"', tag)
        if not src:
            return tag
        path = src.group(1)
        small = os.path.splitext(path)[0] + "-700.webp"
        if not os.path.exists(os.path.join(SITE, small)):
            return tag
        if path not in widths:
            from PIL import Image
            widths[path] = Image.open(os.path.join(SITE, path)).width
        return tag.replace(f'src="{path}"', f'src="{path}" srcset="{small} 700w, {path} {widths[path]}w" sizes="{"100vw" if 'fetchpriority="high"' in tag or "sub-hero" in tag else "(max-width: 760px) 100vw, 60vw"}"', 1)
    page = re.sub(r"<img\b[^>]*>", srcset, page)
    # og:image nur, wenn die Datei existiert
    def og(m):
        return m.group(0) if os.path.exists(os.path.join(SITE, m.group(1))) else ""
    return re.sub(r'<meta property="og:image" content="https://www\.taeubert-karosserie-lack\.de/(images/[^"]+)">\n?', og, page)


def render_new_page(slug, p):
    """Eigene Leistungsseite im Stil der übrigen Unterseiten."""
    art = "".join(f'<div><h2>{esc(h)}</h2><div class="rte">{body}</div></div>' for h, body in p["sections"])
    secs = [f'''<section class="page-width svc-layout">
  <div class="svc-article">{art}</div>
  <aside class="svc-aside" aria-label="Termin">
    <h2>{esc(p["short"])} bei Täubert</h2>
    {TRUST_HTML}
    <div class="btns"><a class="btn btn-light" href="{BOOKING}">Termin online buchen</a><a class="btn btn-outline-light" href="schaden-melden.html">Schaden per Foto melden</a><a class="btn btn-outline-light" href="tel:+4936754289606">03675 4289606</a></div>
    <p class="hours">Mo–Do 8–17 Uhr · Fr 8–14:30 Uhr<br>Bettelhecker Straße 15, Sonneberg</p>
  </aside>
</section>''']
    rows = "".join(f'<details><summary><span>{esc(q)}</span></summary><div class="rte"><p>{esc(a)}</p></div></details>' for q, a in p["faq"])
    img = FALLBACK_IMG.get(slug)
    media_html = f'<div class="media"><img src="images/{img}" alt="{esc(p["short"])}" fetchpriority="high"></div><div class="overlay" style="opacity:.5"></div>' if img else '<div class="media"></div><div class="overlay" style="opacity:0"></div>'
    return f'''<section class="sub-hero" style="--h:520px;--mh:440px">
  {media_html}
  <div class="sub-hero-content" style="max-width:960px">
    <h1 class="overline">{esc(p["title"])}</h1>
    <p class="heading h-8">{esc(p["claim"])}</p>
    <div class="rte"><p>{esc(p["lead"])}</p></div>
    <div class="btns"><a class="btn btn-light" href="{BOOKING}">Termin online buchen</a><a class="btn btn-outline-light" href="tel:+4936754289606">Anrufen</a></div>
  </div>
</section>
{chr(10).join(secs)}
<section class="sec" style="padding:60px 0">
  <div class="page-width"><div class="faq"><h2 class="sec-head">Häufige Fragen</h2>{rows}</div></div>
</section>'''


def all_services():
    """(slug, Kurzname, Beschreibung) aller Leistungsseiten."""
    out = [(slug, SERVICES[slug][1], SERVICES[slug][2]) for slug, _ in SERVICE_LINKS if slug in SERVICES]
    out += [(slug, SERVICES[slug][1], SERVICES[slug][2]) for slug in SERVICES
            if slug not in GUIDES and slug not in {s for s, *_ in out}]
    out += [(slug, p["short"], p["desc"]) for slug, p in NEW_PAGES.items()]
    return out


# Ratgeber-Seiten (keine eigene Leistung)
GUIDES = ["unfall-oder-kratzer", "auto-lackieren-kosten"]


# Leistungen, die auf der Startseite und im Footer zuerst stehen
TOP_SERVICES = ["unfallinstandsetzung", "lackierarbeiten", "karosserie", "smartrepair", "hagelschaden", "fahrzeugaufbereitung"]


# Kurze Nutzen-Sätze für die Leistungskarten (die Meta-Beschreibungen bleiben für Google)
CARD_TEXT = {
    "karosserie": "Richtbank, Vermessung, Herstellervorgaben – und danach direkt in unsere Lackierkabine.",
    "lackierarbeiten": "Farbton digital gemessen. Man sieht später nicht, wo der Schaden war.",
    "unfallinstandsetzung": "Wir regeln Gutachter und Versicherung – Sie bekommen Ihr Auto repariert zurück.",
    "smartrepair": "Dellen raus, ohne neu zu lackieren. Oft in wenigen Stunden.",
    "kleinschaden": "Parkrempler, Poller, Einkaufswagen – schnell und günstig behoben.",
    "kratzer": "Vom oberflächlichen Kratzer bis zum Metall – passend repariert.",
    "leasingrueckgabe": "Vorher reparieren statt teuer nachzahlen.",
    "fahrzeugaufbereitung": "Politur, Innenraum, Lackpflege – Ihr Auto wie frisch übergeben.",
    "reifenservice": "Reifenwechsel und Einlagerung – Termin online buchen.",
    "unfall": "Ein Anruf – wir kümmern uns um alles Weitere.",
    "hagelschaden": "Hageldellen möglichst ohne Lackieren entfernen.",
    "stossstange-reparieren": "Kratzer, Risse, Dellen – reparieren statt tauschen, wo es Sinn macht.",
    "oldtimer-restaurierung": "Entrostung und Lack im Originalfarbton – mit Respekt vor dem Original.",
    "fuhrparkservice": "Firmenwagen und Transporter schnell wieder einsatzbereit.",
    "lackaufbereitung": "Waschkratzer und Hologramme raus – maschinell poliert bis zum Tiefenglanz.",
    "keramikversiegelung": "Langzeitschutz und Glanz – Wasser perlt ab, Pflege wird leichter.",
    "innenraumaufbereitung": "Polster, Leder, Teppiche und Gerüche – wieder gern einsteigen.",
    "scheinwerfer-aufbereiten": "Vergilbt und matt? Geschliffen, poliert, versiegelt – wieder klar.",
    "unterbodenschutz": "Unterbodenwäsche, Rostbehandlung und Hohlraumversiegelung gegen Streusalz.",
    "versicherungsschaden": "Direkte Abrechnung mit der Versicherung. Sie bringen das Auto, wir den Rest.",
}


# Trennstellen für lange Komposita in den Foto-Kacheln
SHY = {"Unfallinstandsetzung": "Unfall&shy;instand&shy;setzung", "Fahrzeugaufbereitung": "Fahrzeug&shy;aufbereitung",
       "Versicherungsschaden": "Versicherungs&shy;schaden", "Karosseriearbeiten": "Karosserie&shy;arbeiten",
       "Kleinschaden-Reparatur": "Kleinschaden-<wbr>Reparatur", "Unfallreparatur": "Unfall&shy;reparatur",
       "Leasingrückgabe": "Leasing&shy;rückgabe", "Lackaufbereitung": "Lack&shy;aufbereitung", "Keramikversiegelung": "Keramik&shy;versiegelung",
       "Innenraumaufbereitung": "Innenraum&shy;aufbereitung", "Unterbodenschutz": "Unterboden&shy;schutz", "Fuhrparkservice": "Fuhrpark&shy;service", "Lackierarbeiten": "Lackier&shy;arbeiten"}


def service_tiles(items):
    """Großflächige Foto-Kacheln (Startseite)."""
    out = []
    for slug, name, desc in items:
        img = CARD_IMG.get(slug) or FALLBACK_IMG.get(slug)
        pic = f'<img src="images/{esc(img)}" alt="{esc(name)}" loading="lazy">' if img else ""
        out.append(f'<a class="tile-svc" href="{slug}.html"><span class="tile-media">{pic}</span><span class="tile-body"><h3>{SHY.get(name, esc(name))}</h3><p>{esc(CARD_TEXT.get(slug, desc))}</p><span class="tile-more">Mehr erfahren</span></span></a>')
    return "".join(out)


def service_cards(items, images=False):
    out = []
    for slug, name, desc in items:
        img = (CARD_IMG.get(slug) or FALLBACK_IMG.get(slug)) if images else None
        pic = f'<span class="svc-img"><img src="images/{esc(img)}" alt="{esc(name)}" loading="lazy"></span>' if img else ""
        out.append(f'<a class="svc{" has-img" if pic else ""}" href="{slug}.html">{pic}<h3>{esc(name)}</h3><p>{esc(CARD_TEXT.get(slug, desc))}</p><span>Mehr erfahren →</span></a>')
    return "".join(out)


CHEV = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>'
NAV_GROUPS = [
    ("Unfall?", [("unfall-was-tun.html", "Unfall – was jetzt zu tun ist"), ("schaden-melden.html", "Schaden per Foto melden"),
                 ("versicherungsschaden.html", "Abrechnung mit der Versicherung"), ("unfall-oder-kratzer.html", "Wer zahlt die Reparatur?")]),
    ("Über uns", [("who-we-are.html", "Who we are"), ("history.html", "History"), ("meet-the-team.html", "Meet the Team"),
                  ("porsche-911.html", "Projekt: Porsche 911"), ("porsche-gts.html", "Projekt: Porsche Cayenne GTS"), ("vw-bulli-t2.html", "Projekt: VW Bulli T2")]),
    ("Karriere", [("karriere.html", "Karriere bei Täubert"), ("azubi.html", "Ausbildung"), ("jobs.html", "Stellenangebote")]),
]


def nav_html():
    svcs = {s: n for s, n, _ in all_services()}
    mega = "".join(f'<div><h3>{esc(c)}</h3>' + "".join(f'<a href="{s}.html">{esc(svcs[s])}</a>' for s in slugs if s in svcs) + "</div>" for c, slugs in CATEGORIES)
    out = [f'<li class="has-sub"><button class="top" type="button" aria-expanded="false">Leistungen {CHEV}</button><div class="panel mega">{mega}<a class="all" href="leistungen.html">Alle Leistungen ansehen →</a></div></li>']
    for title, links in NAV_GROUPS:
        out.append(f'<li class="has-sub"><button class="top" type="button" aria-expanded="false">{esc(title)} {CHEV}</button><div class="panel">' + "".join(f'<a href="{h}">{esc(t)}</a>' for h, t in links) + "</div></li>")
    out.append('<li><a class="top" href="fragen.html">Fragen</a></li><li><a class="top" href="contact.html">Kontakt</a></li>')
    return "<ul>" + "".join(out) + "</ul>"


def drawer_html():
    svcs = {s: n for s, n, _ in all_services()}
    groups = "".join(f"<h3>{esc(c)}</h3>" + "".join(f'<a href="{s}.html">{esc(svcs[s])}</a>' for s in slugs if s in svcs) for c, slugs in CATEGORIES)
    out = [f'''<div class="drawer-quick">
      <a class="btn btn-dark" href="{BOOKING}">Termin online buchen</a>
      <a class="btn btn-outline-dark" href="schaden-melden.html">Schaden per Foto melden</a>
      <a class="btn btn-outline-dark" href="unfall-was-tun.html">Unfall – was jetzt tun?</a>
    </div>''',
           f'<details><summary>Leistungen</summary><div class="sub"><a href="leistungen.html"><strong>Alle Leistungen</strong></a>{groups}</div></details>']
    for title, links in NAV_GROUPS[1:]:
        out.append(f'<details><summary>{esc(title)}</summary><div class="sub">' + "".join(f'<a href="{h}">{esc(t)}</a>' for h, t in links) + "</div></details>")
    out.append('<a class="plain" href="fragen.html">Häufige Fragen</a><a class="plain" href="contact.html">Kontakt &amp; Anfahrt</a>')
    return "\n    ".join(out)


def update_index():
    """Leistungsblock, Footer-Leistungen und strukturierte Daten der Startseite aus den Leistungslisten erzeugen."""
    fp = os.path.join(SITE, "index.html")
    s = open(fp, encoding="utf-8").read()
    svcs = all_services()
    top = [x for t in TOP_SERVICES for x in svcs if x[0] == t]
    block = f'''<!-- LEISTUNGEN:START -->
  <section class="services-sec" id="leistungen">
    <div class="page-width">
      <div class="sec-intro"><p class="eyebrow">Leistungen</p><h2>Alles aus einer Hand</h2>
      <p class="lead">Karosserie, Lack und Fahrzeugpflege – in einem Betrieb, für Kunden aus Sonneberg, Neustadt bei Coburg, Coburg und Umgebung.</p></div>
      <div class="tile-grid">{service_tiles(top)}</div>
      <a class="btn btn-dark svc-more" href="leistungen.html">Alle {len(svcs)} Leistungen ansehen</a>
    </div>
  </section>
  <!-- LEISTUNGEN:END -->'''
    s = re.sub(r"<!-- LEISTUNGEN:START -->.*?<!-- LEISTUNGEN:END -->", lambda m: block, s, flags=re.S)
    s = re.sub(r"<!-- MAINNAV:START -->.*?<!-- MAINNAV:END -->", lambda m: "<!-- MAINNAV:START -->" + nav_html() + "<!-- MAINNAV:END -->", s, flags=re.S)
    s = re.sub(r"<!-- DRAWERNAV:START -->.*?<!-- DRAWERNAV:END -->", lambda m: "<!-- DRAWERNAV:START -->\n    " + drawer_html() + "\n  <!-- DRAWERNAV:END -->", s, flags=re.S)
    foot = "".join(f'<li><a href="{slug}.html">{esc(name)}</a></li>' for slug, name, _ in top)
    foot += '<li><a href="leistungen.html">Alle Leistungen</a></li>'
    s = re.sub(r"<!-- FOOTER-LEISTUNGEN:START -->.*?<!-- FOOTER-LEISTUNGEN:END -->",
               lambda m: f"<!-- FOOTER-LEISTUNGEN:START -->{foot}<!-- FOOTER-LEISTUNGEN:END -->", s, flags=re.S)
    # Firmendaten um den Leistungskatalog ergänzen
    m = re.search(r'<script type="application/ld\+json">(\{"@context": "https://schema.org", "@type": "AutoBodyShop".*?)</script>', s, re.S)
    data = json.loads(m.group(1))
    data["hasOfferCatalog"] = {"@type": "OfferCatalog", "name": "Leistungen", "itemListElement": [
        {"@type": "Offer", "itemOffered": {"@type": "Service", "name": name, "description": desc, "url": f"{DOMAIN}/{slug}.html"}}
        for slug, name, desc in svcs]}
    s = s.replace(m.group(1), json.dumps(data, ensure_ascii=False))
    open(fp, "w", encoding="utf-8").write(s)


def breadcrumb_ld(slug, name, parent=None):
    items = [("Startseite", f"{DOMAIN}/")]
    if parent:
        items.append(parent)
    items.append((name, f"{DOMAIN}/{slug}.html"))
    data = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(items)]}
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + "</script>"



# Leistungs-Kategorien für die Übersicht
CATEGORIES = [
    ("Unfall & Versicherung", ["unfall", "unfallinstandsetzung", "versicherungsschaden", "hagelschaden"]),
    ("Karosserie & Lack", ["karosserie", "lackierarbeiten", "smartrepair", "kleinschaden", "kratzer", "stossstange-reparieren"]),
    ("Aufbereitung & Pflege", ["fahrzeugaufbereitung", "lackaufbereitung", "keramikversiegelung", "innenraumaufbereitung", "scheinwerfer-aufbereiten", "unterbodenschutz"]),
    ("Service", ["reifenservice", "leasingrueckgabe", "fuhrparkservice"]),
    ("Klassiker", ["oldtimer-restaurierung"]),
]
CARD_IMG = {}  # slug -> erstes vorhandenes Bild der Leistungsseite (wird beim Bauen gefüllt)
# Bilder für Seiten ohne eigenes Foto (Karte in der Übersicht und Startbild der neuen Leistungsseiten)
FALLBACK_IMG = {
    "unfall": "hf_20260210_181354_b287ca50-bc5a-4edc-a818-d8872a4dc8c6.webp",
    "unfallinstandsetzung": "pexels-hellochemo-28960715.webp",
    "versicherungsschaden": "pexels-artempodrez-8986139.webp",
    "hagelschaden": "pexels-dante-juhasz-62201650-10880630.webp",
    "kratzer": "pexels-uiliamnornberg-24960483_2971c584-81f6-4dd4-bf60-f58213b7bd8b.webp",
    "stossstange-reparieren": "pexels-vadutskevich-13249371.webp",
    "fuhrparkservice": "T_ubert_Karosserie_und_Lack_in_Sonneberg_Fuhrparkserive.webp",
    "unterbodenschutz": "pexels-aida-shukuhi-914628252-20281832.webp",
    "lackaufbereitung": "pexels-tima-miroshnichenko-6872570.webp",
    "keramikversiegelung": "pexels-amar-11157437.webp",
    "innenraumaufbereitung": "pexels-wavyvisuals-377312923-20051451.webp",
    "scheinwerfer-aufbereiten": "ElevenLabs_image_nano-banana_Nahaufnahmen..._2026-01-13T08_52_06-2.webp",
    "oldtimer-restaurierung": "hf_20260210_174234_03b93839-672b-4ba9-b742-8e3397346ee1.webp",
}


def first_image(body_html):
    for m in re.finditer(r'src="images/([^"]+)"', body_html):
        if os.path.exists(os.path.join(SITE, "images", m.group(1))):
            return m.group(1)
    return None


def service_intro(slug, name):
    """Brotkrumen + Kurzleiste mit Versprechen und den zwei Hauptaktionen direkt unter dem Startbild."""
    return f'''<nav class="crumbs page-width" aria-label="Brotkrumen"><a href="index.html">Startseite</a><span>›</span><a href="leistungen.html">Leistungen</a><span>›</span><span aria-current="page">{esc(name)}</span></nav>
<section class="svc-quick">
  <div class="page-width svc-quick-inner">
    {TRUST_HTML}
    <div class="btns"><a class="btn btn-dark" href="{BOOKING}">Termin online buchen</a><a class="btn btn-outline-dark" href="schaden-melden.html">Schaden per Foto melden</a></div>
  </div>
</section>'''


STEPS_HTML = '''<section class="svc-steps">
  <div class="page-width">
    <h2>So läuft's ab</h2>
    <ol class="steps">
      <li><span class="num">1</span><h3>Schaden melden</h3><p>Fotos hochladen, anrufen oder per WhatsApp schreiben.</p></li>
      <li><span class="num">2</span><h3>Kostenvoranschlag in 24 Stunden</h3><p>Klare Einschätzung, was nötig ist und was es kostet.</p></li>
      <li><span class="num">3</span><h3>Reparatur – mit Ersatzwagen</h3><p>Auf Wunsch holen wir Ihr Auto ab. Mit der Versicherung rechnen wir direkt ab.</p></li>
      <li><span class="num">4</span><h3>Abholen und weiterfahren</h3><p>Geprüft und gereinigt – man sieht nicht mehr, wo der Schaden war.</p></li>
    </ol>
  </div>
</section>'''


def with_service_frame(slug, name, body_html):
    """Startbild bleibt oben; danach Brotkrumen + Kurzleiste, am Ende vor dem Buchungsblock der Ablauf."""
    m = re.search(r"<section.*?</section>", body_html, re.S)
    head, rest = body_html[:m.end()], body_html[m.end():]
    return head + service_intro(slug, name) + rest + STEPS_HTML



CAT_INTRO = {
    "Unfall & Versicherung": "Ein Ansprechpartner von der Schadensaufnahme bis zur Abrechnung mit der Versicherung. Sie bringen das Auto – wir regeln den Rest.",
    "Karosserie & Lack": "Richtbank, Lackierkabine und digitale Farbtonmessung unter einem Dach. Man sieht später nicht, wo der Schaden war.",
    "Aufbereitung & Pflege": "Vom Unterboden bis zum Dachhimmel: Lack, Innenraum, Scheinwerfer und Versiegelung – damit Ihr Fahrzeug gepflegt aussieht und lange hält.",
    "Service": "Reifen, Leasingrückgabe und Firmenfahrzeuge – unkompliziert und termingenau.",
    "Klassiker": "Restaurierung mit Geduld, Handwerk und Respekt vor dem Original.",
}
# Schnellauswahl: Anliegen des Kunden -> passende Leistung
FINDER = [
    ("Ich hatte einen Unfall", "unfall"), ("Ich habe eine Delle", "smartrepair"),
    ("Mein Lack ist zerkratzt", "kratzer"), ("Die Stoßstange ist beschädigt", "stossstange-reparieren"),
    ("Mein Auto hat Hagelschaden", "hagelschaden"), ("Mein Leasingauto geht zurück", "leasingrueckgabe"),
    ("Mein Lack ist stumpf", "lackaufbereitung"), ("Der Innenraum ist verschmutzt", "innenraumaufbereitung"),
    ("Mein Unterboden rostet", "unterbodenschutz"), ("Ich möchte neu lackieren", "lackierarbeiten"),
]


def tile_grid(items):
    n = len(items)
    cls = {4: " c4", 1: " c1", 5: " c5"}.get(n, "")
    return f'<div class="tile-grid{cls}">{service_tiles(items)}</div>'


def related_tiles(slug, title="Das könnte Sie auch interessieren", n=3):
    """Drei passende Leistungen mit Bild: zuerst aus derselben Kategorie, dann die wichtigsten."""
    svcs = {s: (s, n, d) for s, n, d in all_services()}
    same = next((slugs for _, slugs in CATEGORIES if slug in slugs), [])
    pick = []
    for x in same + TOP_SERVICES:
        if x != slug and x in svcs and x not in pick:
            pick.append(x)
    return f'''<section class="more-svc">
  <div class="page-width">
    <h2>{esc(title)}</h2>
    {tile_grid([svcs[x] for x in pick[:n]])}
  </div>
</section>'''


def render_overview():
    svcs = all_services()
    names = {s: n for s, n, _ in svcs}
    locs = "".join(f'<li><a href="{slug}.html">{esc(LOCATIONS[slug][0])}</a></li>' for slug, _ in LOCATION_LINKS)
    finder = "".join(f'<li><a href="{x}.html"><span class="q">{esc(q)}</span><span class="to">{esc(names[x])}</span></a></li>' for q, x in FINDER if x in names)
    cats = "".join(f'''<section class="cat-sec" id="kat-{i}">
  <div class="page-width">
    <div class="cat-top"><h2>{esc(c)}</h2><p>{esc(CAT_INTRO.get(c, ""))}</p></div>
    {tile_grid([x for s in slugs for x in svcs if x[0] == s])}
  </div>
</section>''' for i, (c, slugs) in enumerate(CATEGORIES))
    hero = CARD_IMG.get("lackierarbeiten") or FALLBACK_IMG["unfallinstandsetzung"]
    return f'''<section class="sub-hero" style="--h:560px;--mh:460px">
  <div class="media"><img src="images/{esc(hero)}" alt="Lackierarbeiten bei Täubert in Sonneberg" fetchpriority="high"></div><div class="overlay" style="opacity:.55"></div>
  <div class="sub-hero-content" style="max-width:960px">
    <p class="overline">Täubert Karosserie &amp; Lack · Sonneberg</p>
    <h1 class="h-8">Leistungen</h1>
    <div class="rte"><p>Unfallreparatur, Lackierung, Smart Repair und Fahrzeugpflege – für PKW, Transporter, Firmenfahrzeuge und Klassiker aller Marken. Alles aus einer Hand.</p></div>
    <div class="btns"><a class="btn btn-light" href="{BOOKING}">Termin online buchen</a><a class="btn btn-outline-light" href="schaden-melden.html">Schaden per Foto melden</a></div>
  </div>
</section>
<section class="svc-quick">
  <div class="page-width svc-quick-inner">{TRUST_HTML}</div>
</section>
<section class="finder" id="was-ist-passiert">
  <div class="page-width">
    <div class="sec-intro"><p class="eyebrow">Schnellauswahl</p><h2>Was ist passiert?</h2>
    <p class="lead">Wählen Sie Ihr Anliegen – wir zeigen Ihnen direkt die passende Leistung.</p></div>
    <ul class="finder-list">{finder}</ul>
  </div>
</section>
{cats}
<section class="sec" style="padding:90px 0 0">
  <div class="page-width">
    <div class="cat-top" style="margin-bottom:24px"><h2 class="h-4">Ratgeber</h2></div>
    <div class="svc-grid">{service_cards([(g, SERVICES[g][0], SERVICES[g][2]) for g in GUIDES])}</div>
  </div>
</section>
<section class="sec" style="padding:70px 0 90px">
  <div class="page-width"><div style="max-width:860px">
    <h2 class="h-4">Für Kunden aus der Region</h2>
    <p style="margin-top:12px;color:#555">Unsere Werkstatt liegt in der Bettelhecker Straße 15 in Sonneberg – wenige Minuten von Neustadt bei Coburg. Auf Wunsch holen wir Ihr Fahrzeug ab.</p>
    <ul class="chips">{locs}</ul>
  </div></div>
</section>'''


DAMAGE_FORM = """<section class="sub-hero" style="--h:420px;--mh:380px">
  <div class="media"></div><div class="overlay" style="opacity:0"></div>
  <div class="sub-hero-content" style="max-width:960px">
    <h1 class="overline">Schaden melden – Kostenvoranschlag per Foto</h1>
    <p class="heading h-8">Foto schicken. Einschätzung bekommen.</p>
    <div class="rte"><p>Laden Sie bis zu drei Fotos Ihres Schadens hoch. Sie erhalten innerhalb von 24 Stunden einen Kostenvoranschlag und einen Terminvorschlag.</p></div>
  </div>
</section>
<section class="sec" style="padding:60px 0">
  <div class="page-width"><div class="contact-form" style="max-width:720px">
    <form class="damage-form" name="schadensmeldung" method="POST" action="danke.html" enctype="multipart/form-data" data-netlify="true" netlify-honeypot="firma">
      <input type="hidden" name="form-name" value="schadensmeldung">
      <p class="hp"><label>Nicht ausfüllen: <input name="firma" tabindex="-1" autocomplete="off"></label></p>
      <div class="mail-form">
        <label class="f half">Name *<input name="name" autocomplete="name" required></label>
        <label class="f half">Telefon *<input name="telefon" type="tel" autocomplete="tel" required></label>
        <label class="f half">E-Mail<input name="email" type="email" autocomplete="email"></label>
        <label class="f half">Fahrzeug<input name="fahrzeug" placeholder="z. B. VW Golf, 2019"></label>
        <label class="f half">Art des Schadens
          <select name="schaden">
            <option>Unfallschaden</option><option>Parkschaden / Delle</option><option>Kratzer / Lackschaden</option>
            <option>Hagelschaden</option><option>Stoßstange</option><option>Leasingrückgabe</option><option>Sonstiges</option>
          </select>
        </label>
        <label class="f half">Wer zahlt voraussichtlich?
          <select name="kostentraeger">
            <option>Weiß ich noch nicht</option><option>Gegnerische Versicherung</option><option>Eigene Versicherung (Kasko)</option><option>Ich selbst</option>
          </select>
        </label>
        <label class="f">Fotos (bis zu 3) *
          <input name="foto1" type="file" accept="image/*" required>
          <input name="foto2" type="file" accept="image/*">
          <input name="foto3" type="file" accept="image/*">
          <small>Tipp: ein Foto aus etwa 2 m Abstand, eines aus der Nähe und eines vom ganzen Fahrzeug. Die Fotos werden vor dem Senden automatisch verkleinert.</small>
        </label>
        <label class="f">Kurze Beschreibung<textarea name="nachricht" rows="5" placeholder="Was ist passiert? Wann passt Ihnen ein Termin?"></textarea></label>
        <label class="f consent"><input type="checkbox" name="einwilligung" required><span>Ich bin einverstanden, dass meine Angaben und Fotos zur Bearbeitung der Anfrage gespeichert werden (siehe <a href="datenschutz.html">Datenschutz</a>). *</span></label>
      </div>
      <div class="btns"><button class="btn btn-dark" type="submit">Schaden senden</button></div>
      <p class="form-status" role="status"></p>
    </form>
    <div class="rte" style="margin-top:30px"><p>Lieber direkt? <a href="https://wa.me/4936754289606" target="_blank" rel="noopener">Fotos per WhatsApp schicken</a> oder anrufen: <a href="tel:+4936754289606">03675 4289606</a>.</p></div>
  </div></div>
</section>"""

THANKS = """<section class="sec" style="padding:100px 0">
  <div class="page-width"><div class="rich-inner" style="max-width:640px;margin:0 auto;text-align:center">
    <h1 class="h-6">Danke – Ihre Meldung ist da.</h1>
    <div class="rte"><p>Wir sehen uns die Fotos an und melden uns schnellstmöglich bei Ihnen. Eilt es? Rufen Sie uns an: <a href="tel:+4936754289606">03675 4289606</a>.</p></div>
    <div class="btns" style="justify-content:center"><a class="btn btn-dark" href="index.html">Zur Startseite</a><a class="btn btn-outline-dark" href="{BOOKING_URL}">Termin online buchen</a></div>
  </div></div>
</section>"""

DAMAGE_CSS = """
  .hp { position: absolute; left: -9999px; }
  .damage-form select { font: inherit; padding: 13px 14px; border: 1px solid var(--line); background: var(--white); }
  .damage-form input[type=file] { padding: 10px; background: var(--grey); border: 1px dashed #999; margin-top: 6px; }
  .damage-form small { font-weight: 400; color: #555; }
  .damage-form .consent { display: flex; gap: 10px; align-items: flex-start; font-weight: 400; }
  .damage-form .consent input { margin-top: 5px; }
  .damage-form .consent a { text-decoration: underline; }
  .form-status { margin-top: 14px; font-weight: 600; }
  .form-status.err { color: #222; }
"""

DAMAGE_JS = r"""
  // Schadensmeldung: Fotos verkleinern und an Netlify Forms senden
  document.querySelectorAll('.damage-form').forEach(form => form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const status = form.querySelector('.form-status'), btn = form.querySelector('button[type=submit]');
    const say = (t, err) => { status.textContent = t; status.classList.toggle('err', !!err); };

    btn.disabled = true; say('Fotos werden vorbereitet …');
    const shrink = file => new Promise(res => {
      if (!file || !file.size || !file.type.startsWith('image/')) return res(file);
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const s = Math.min(1, 1600 / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        c.toBlob(b => res(b ? new File([b], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }) : file), 'image/jpeg', 0.82);
      };
      img.onerror = () => { URL.revokeObjectURL(url); res(file); };
      img.src = url;
    });
    const data = new FormData(form);
    for (const k of ['foto1', 'foto2', 'foto3']) { const f = data.get(k); if (f && f.size) data.set(k, await shrink(f)); else data.delete(k); }
    say('Wird gesendet …');
    try {
      const r = await fetch('/', { method: 'POST', body: data });
      if (!r.ok) throw new Error(r.status);
      location.href = 'danke.html';
    } catch (err) {
      console.warn('Schadensmeldung konnte nicht gesendet werden:', err);
      btn.disabled = false;
      const v = n => (form.elements[n] || {}).value || '';
      const msg = `${form.dataset.title || 'Schadensmeldung'}\nName: ${v('name')}\nTelefon: ${v('telefon')}\nE-Mail: ${v('email')}\nFahrzeug: ${v('fahrzeug')}\nSchaden: ${v('schaden')}\nKosten: ${v('kostentraeger')}\n\n${v('nachricht')}`;
      say('Das Senden hat gerade nicht geklappt. Schicken Sie Ihre Angaben einfach per WhatsApp oder E-Mail – die Nachricht ist schon vorbereitet, die Fotos hängen Sie dort an.', true);
      status.insertAdjacentHTML('beforeend', '<span class="btns" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:12px">'
        + '<a class="btn btn-dark" target="_blank" rel="noopener" href="https://wa.me/4936754289606?text=' + encodeURIComponent(msg) + '">Per WhatsApp senden</a>'
        + '<a class="btn btn-outline-dark" href="mailto:hallo@taeubert-karosserie-lack.de?subject=' + encodeURIComponent('Schadensmeldung') + '&body=' + encodeURIComponent(msg) + '">Per E-Mail senden</a></span>');
    }
  }));
"""


BOOKING_PAGE = f"""<section class="sec booking-page" style="padding:50px 0 30px">
  <div class="page-width">
    <h1 class="overline">Termin buchen</h1>
    <p class="heading h-6">So unkompliziert wie möglich.</p>
    <div class="rte"><p>Drei Wege – wählen Sie den bequemsten. Lieber persönlich? Rufen Sie uns an: <a href="tel:+4936754289606">03675 4289606</a> oder schicken Sie <a href="schaden-melden.html">Fotos Ihres Schadens</a>.</p></div>
  </div>
</section>
<section class="booking-embed">
  <div class="page-width book-grid">
    <div class="book-card">
      <p class="eyebrow">Option 1 · Online</p>
      <h2>Wunschtermin selbst wählen</h2>
      <p>Leistung auswählen, freien Termin anklicken, fertig – rund um die Uhr.</p>
      <a class="btn btn-dark" href="{BOOKING_URL}">Zur Online-Terminbuchung</a>
    </div>
    <div class="book-card" id="rueckruf">
      <p class="eyebrow">Option 2 · Rückruf</p>
      <h2>Wir rufen Sie an</h2>
      <p>Name und Telefonnummer reichen – wir melden uns und machen den Termin mit Ihnen aus.</p>
      <form class="damage-form" name="rueckruf" method="POST" action="danke.html" data-netlify="true" netlify-honeypot="firma" data-title="Rückrufwunsch">
        <input type="hidden" name="form-name" value="rueckruf">
        <p class="hp"><label>Nicht ausfüllen: <input name="firma" tabindex="-1" autocomplete="off"></label></p>
        <div class="mail-form">
          <label class="f half">Name *<input name="name" autocomplete="name" required></label>
          <label class="f half">Telefon *<input name="telefon" type="tel" autocomplete="tel" required></label>
          <label class="f half">Worum geht es?
            <select name="schaden"><option>Unfallschaden</option><option>Lack / Kratzer / Delle</option><option>Reifenwechsel</option><option>Fahrzeugaufbereitung</option><option>Leasingrückgabe</option><option>Sonstiges</option></select>
          </label>
          <label class="f half">Wann erreichen wir Sie?
            <select name="nachricht"><option>Egal – so bald wie möglich</option><option>Vormittags</option><option>Mittags</option><option>Nachmittags</option></select>
          </label>
          <label class="f consent"><input type="checkbox" name="einwilligung" required><span>Ich bin einverstanden, dass meine Angaben zur Bearbeitung gespeichert werden (siehe <a href="datenschutz.html">Datenschutz</a>). *</span></label>
        </div>
        <div class="btns"><button class="btn btn-outline-dark" type="submit">Rückruf anfordern</button></div>
        <p class="form-status" role="status"></p>
      </form>
    </div>
    <div class="book-card">
      <p class="eyebrow">Option 3 · Direkt</p>
      <h2>Anrufen oder schreiben</h2>
      <p class="open-status" data-open-status></p>
      <div class="btns" style="display:flex;flex-direction:column;gap:10px;align-items:flex-start">
        <a class="btn btn-dark" href="tel:+4936754289606">03675 4289606</a>
        <a class="btn btn-outline-dark" href="https://wa.me/4936754289606" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </div>
  </div>
</section>"""

BOOKING_CSS = """
  .booking-page .heading { margin: 4px 0 6px; }
  .booking-page .rte a { text-decoration: underline; }
  .booking-embed { padding: 0 0 60px; }
  .book-grid { display: grid; grid-template-columns: 1fr 1.6fr 1fr; gap: 16px; align-items: start; }
  .book-card { background: var(--grey); padding: 26px; }
  .book-card h2 { font-size: 22px; margin-bottom: 8px; }
  .book-card > p { margin-bottom: 16px; color: #444; }
  .book-card .mail-form { margin-top: 0; }
  .book-card .eyebrow { color: #6b6b6b; font-size: 12px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 8px; }
  @media (max-width: 990px) { .book-grid { grid-template-columns: 1fr; } }
  .booking-embed iframe { display: block; width: 100%; height: 1000px; border: 1px solid var(--line); background: var(--white); }
  .booking-fallback { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; margin-top: 18px; }
  @media (max-width: 600px) { .booking-embed iframe { height: 1250px; } }
"""


UNFALL_STEPS = [
    ("Sichern", "Warnblinker an, Warnweste anziehen, Warndreieck in ausreichendem Abstand aufstellen."),
    ("Helfen", "Verletzte versorgen und den Notruf 112 wählen. Die Polizei (110) rufen, wenn jemand verletzt ist, der Unfallgegner flüchtet oder es Streit über den Hergang gibt."),
    ("Fotografieren", "Unfallstelle, Endstellung der Fahrzeuge, alle Schäden und die Kennzeichen – lieber zu viele Fotos als zu wenige."),
    ("Daten austauschen", "Name, Anschrift, Kennzeichen und Versicherung des Unfallgegners notieren. Zeugen um Namen und Telefonnummer bitten."),
    ("Nichts unterschreiben", "Kein Schuldanerkenntnis abgeben oder unterschreiben – auch wenn Sie unter Druck gesetzt werden."),
    ("Versicherung informieren", "Den Schaden zeitnah Ihrer Versicherung melden. Ist der andere schuld, dürfen Sie in der Regel einen unabhängigen Gutachter wählen."),
    ("Uns anrufen", "Wir übernehmen Gutachter, Versicherung und Reparatur – auf Wunsch mit Ersatzwagen und Hol- und Bringservice."),
]

UNFALL_PAGE = f"""<section class="sec soforthilfe" style="padding:50px 0 20px">
  <div class="page-width">
    <h1 class="overline">Unfall-Soforthilfe</h1>
    <p class="heading h-6">Unfall gehabt? Das ist jetzt zu tun.</p>
    <div class="sos-call">
      <a class="btn btn-dark" href="tel:+4936754289606">Täubert anrufen: 03675 4289606</a>
      <a class="btn btn-outline-dark" href="https://wa.me/4936754289606" target="_blank" rel="noopener">Fotos per WhatsApp</a>
      <a class="btn btn-outline-dark" href="schaden-melden.html">Schaden per Foto melden</a>
    </div>
    <p class="open-status" data-open-status></p>
  </div>
</section>
<section class="sec" style="padding:20px 0 60px">
  <div class="page-width">
    <ol class="sos-list">{"".join(f'<li><h2>{esc(t)}</h2><p>{esc(d)}</p></li>' for t, d in UNFALL_STEPS)}</ol>
    <p class="sos-note">Allgemeine Hinweise, keine Rechtsberatung. Bei Verletzten gilt immer: zuerst Notruf 112.</p>
  </div>
</section>"""

UNFALL_CSS = """
  .sos-call { display: flex; flex-wrap: wrap; gap: 10px; margin: 18px 0 14px; }
  .sos-list { list-style: none; counter-reset: sos; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
  .sos-list li { counter-increment: sos; position: relative; padding: 22px 22px 22px 70px; background: var(--grey); }
  .sos-list li::before { content: counter(sos); position: absolute; left: 22px; top: 18px; font-family: "Archivo Black"; font-size: 30px; color: var(--red); }
  .sos-list h2 { font-size: 19px; margin-bottom: 6px; }
  .sos-note { margin-top: 22px; font-size: 14px; color: #555; }
  .faq .cat-head { margin: 40px 0 6px; }
  .faq-more a { font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
"""


# Allgemeine Kundenfragen (nur bestätigte Angaben)
GENERAL_FAQ = [
    ("Termin & Kontakt", [
        ("Wie bekomme ich einen Termin?", "Am schnellsten über die Online-Terminbuchung – rund um die Uhr. Alternativ fordern Sie einen Rückruf an, rufen uns an (03675 4289606) oder schreiben per WhatsApp."),
        ("Wann habt ihr geöffnet?", "Montag bis Donnerstag 08:00–17:00 Uhr, Freitag 08:00–14:30 Uhr. Samstag und Sonntag ist geschlossen."),
        ("Wo finde ich euch?", "Täubert Karosserie und Lack GmbH, Bettelhecker Straße 15, 96515 Sonneberg. Kunden kommen auch aus Neustadt bei Coburg, Coburg, Rödental, Kronach und Bamberg."),
        ("Kann ich einfach vorbeikommen?", "Ja. Wenn Sie unsicher sind, ob sich eine Reparatur lohnt, schauen wir uns Ihr Fahrzeug an und sagen Ihnen ehrlich, was Sinn macht. Mit Termin geht es für Sie am schnellsten."),
    ]),
    ("Kosten & Kostenvoranschlag", [
        ("Wie schnell bekomme ich einen Kostenvoranschlag?", "Innerhalb von 24 Stunden. Schicken Sie uns dafür am besten ein paar Fotos über „Schaden per Foto melden“."),
        ("Was kostet meine Reparatur?", "Das hängt von Art und Größe des Schadens ab. Sie bekommen vorher einen klaren Kostenvoranschlag – ohne Überraschungen. Beispiele finden Sie im Ratgeber „Auto lackieren: Kosten & Beispiele“."),
    ]),
    ("Service rund um die Reparatur", [
        ("Bekomme ich einen Ersatzwagen?", "Ja. Sprechen Sie uns bei der Terminvereinbarung darauf an, dann steht während der Reparatur ein Ersatzwagen für Sie bereit."),
        ("Holt ihr mein Auto ab?", "Ja, mit unserem Hol- und Bringservice holen wir Ihr Fahrzeug ab und bringen es nach der Reparatur zurück."),
        ("Rechnet ihr direkt mit der Versicherung ab?", "Ja. Wir rechnen direkt mit der Versicherung ab und stimmen uns mit dem Gutachter ab."),
        ("Welche Fahrzeuge repariert ihr?", "PKW, Transporter, Firmenfahrzeuge und Oldtimer – Marke egal."),
    ]),
]
FAQ_GROUPS = [(c, slugs) for c, slugs in CATEGORIES] + [("Ratgeber", GUIDES)]


def collect_faqs(slug):
    fp = os.path.join(SITE, f"{slug}.html")
    if not os.path.exists(fp):
        return []
    s = open(fp, encoding="utf-8").read()
    out = []
    for m in re.finditer(r'<details[^>]*><summary><span>(.*?)</span></summary><div class="rte">(.*?)</div></details>', s, re.S):
        q, a = plain(m.group(1)), m.group(2).strip()
        if q and plain(a):
            out.append((q, a))
    return out


def render_faq_page():
    seen, sections, ld_items, toc = set(), [], [], []

    def block(title, anchor, qa):
        rows = []
        for q, a in qa:
            key = q.lower()
            if key in seen:
                continue
            seen.add(key)
            a_html = a if a.lstrip().startswith("<") else f"<p>{esc(a)}</p>"
            rows.append(f'<details><summary><span>{esc(q)}</span></summary><div class="rte">{a_html}</div></details>')
            ld_items.append({"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": plain(a_html)}})
        if rows:
            toc.append(f'<a href="#{anchor}">{esc(title)}</a>')
            sections.append(f'<h2 class="cat-head" id="{anchor}">{esc(title)}</h2>' + "".join(rows))

    for i, (title, qa) in enumerate(GENERAL_FAQ):
        block(title, f"allg-{i}", qa)
    svcs = {s: n for s, n, _ in all_services()}
    for i, (title, slugs) in enumerate(FAQ_GROUPS):
        qa = []
        for s in slugs:
            for q, a in collect_faqs(s):
                qa.append((q, a + f'<p class="faq-more"><a href="{s}.html">Mehr zu {esc(svcs.get(s, SERVICES.get(s, ("", s))[1]))} →</a></p>'))
        block(title, f"kat-{i}", qa)
    body = f'''<section class="sec" style="padding:50px 0 10px">
  <div class="page-width">
    <h1 class="overline">Häufige Fragen</h1>
    <p class="heading h-6">Ihre Fragen – unsere Antworten.</p>
    <div class="rte"><p>Alles zu Termin, Kosten, Versicherung, Ersatzwagen und unseren Leistungen. Ihre Frage ist nicht dabei? <a href="tel:+4936754289606">03675 4289606</a> oder <a href="https://wa.me/4936754289606" target="_blank" rel="noopener">WhatsApp</a>.</p></div>
    <nav class="cat-nav" aria-label="Themen" style="margin-top:18px">{"".join(toc)}</nav>
  </div>
</section>
<section class="sec" style="padding:10px 0 60px">
  <div class="page-width"><div class="faq">{"".join(sections)}</div></div>
</section>'''
    ld = '<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": ld_items}, ensure_ascii=False) + "</script>"
    return body, ld, len(ld_items)



def simple_page(slug, title, desc, body_html, style, head_links, top, footer, js, ld, robots=""):
    return f"""<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)} | Täubert</title>
{robots}{seo_head(title + " – Täubert Karosserie & Lack", desc, slug)}
{head_links}
<style>{style}{EXTRA_CSS}{DAMAGE_CSS}{BOOKING_CSS}{UNFALL_CSS}</style>
{ld}
{breadcrumb_ld(slug, title)}
</head>
<body>
{top}
<main id="inhalt">
{body_html}
</main>
{footer}
<script>
{js}{DAMAGE_JS}</script>
</body>
</html>
"""


def write_seo_files(slugs):
    urls = [f"{DOMAIN}/"] + [f"{DOMAIN}/{x}.html" for x in slugs]
    import datetime
    today = datetime.date.today().isoformat()
    sm = "\n".join(f"  <url><loc>{u}</loc><lastmod>{today}</lastmod></url>" for u in urls)
    open(os.path.join(SITE, "sitemap.xml"), "w", encoding="utf-8").write(
        f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{sm}\n</urlset>\n')
    open(os.path.join(SITE, "robots.txt"), "w", encoding="utf-8").write(
        f"User-agent: *\nAllow: /\n\nSitemap: {DOMAIN}/sitemap.xml\n")
    # 301-Weiterleitungen von den alten Shopify-Adressen (/pages/<handle>), Netlify-Format
    lines = [f"/pages/{h}  /{f}.html  301" for h, f in HANDLES.items()]
    lines += [f"/pages/{x}  /{x}.html  301" for x in slugs if x not in HANDLES]
    lines += ["/pages/q-a-fanny  /meet-the-team.html  301", "/q-a-fanny.html  /meet-the-team.html  301"]
    lines += ["/collections/*  /termin.html  301", "/products/*  /termin.html  301"]
    open(os.path.join(SITE, "_redirects"), "w", encoding="utf-8").write("\n".join(dict.fromkeys(lines)) + "\n")


def main():
    update_index()
    style, head_links, top, footer, js = shell()
    ld = re.search(r'(<script type="application/ld\+json">.*?</script>)', open(os.path.join(SITE, "index.html"), encoding="utf-8").read(), re.S)
    ld = ld.group(1) if ld else ""
    built = []
    for tpl, slug in list(PAGES.items()) + PAGE_ALIASES:
        d = load(os.path.join(THEME, "templates", f"page.{tpl}.json"))
        body = []
        for k in d["order"]:
            s = d["sections"][k]
            if s.get("disabled"):
                continue
            r = RENDER.get(s["type"])
            if r:
                body.append(r(s))
        body_html = apply_fixes(chr(10).join(b for b in body if b))
        for old, new in TEXT_FIXES.get(slug, []):
            body_html = body_html.replace(old, new)
        title = first_heading(d) or slug.replace("-", " ").title()
        meta = SERVICES.get(slug) or LOCATIONS.get(slug)
        extra_ld = ""
        if meta:
            seo_title, short, desc = meta
            body_html = keyword_h1(body_html, seo_title)
            if slug in SERVICES and slug not in GUIDES:
                CARD_IMG[slug] = first_image(body_html)
                body_html = with_service_frame(slug, short, body_html)
            if slug in SERVICES and slug not in GUIDES:
                body_html += related_tiles(slug, "Alle Aufbereitungen im Überblick", 5) if slug == "fahrzeugaufbereitung" else related_tiles(slug)
            body_html += booking_cta(slug, short)
            title = seo_title
            if slug in SERVICES:
                extra_ld = service_ld(slug, short, desc) + breadcrumb_ld(slug, short, ("Leistungen", f"{DOMAIN}/leistungen.html"))
            else:
                extra_ld = breadcrumb_ld(slug, short)
        else:
            body_html = first_h1(body_html)
            desc = None
            if slug in PAGE_META:
                title, desc = PAGE_META[slug]
        extra_ld += faq_ld(body_html)
        og = re.search(r'src="images/([^"]+)"', body_html)
        page = f"""<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)} | Täubert</title>
{seo_head(f"{title} – Täubert Karosserie & Lack", desc or description(body_html), slug, og.group(1) if og else None)}
{head_links}
<style>{style}{EXTRA_CSS}</style>
{ld}
{extra_ld}
</head>
<body>
{top}
<main id="inhalt">
{body_html}
</main>
{footer}
<script>
{js}</script>
</body>
</html>
"""
        open(os.path.join(SITE, f"{slug}.html"), "w", encoding="utf-8").write(sync_images(page))
        built.append(slug)
    for slug, p in NEW_PAGES.items():
        body_html = with_service_frame(slug, p["short"], render_new_page(slug, p)) + related_tiles(slug) + booking_cta(slug, p["short"])
        extra_ld = service_ld(slug, p["short"], p["desc"]) + breadcrumb_ld(slug, p["short"], ("Leistungen", f"{DOMAIN}/leistungen.html")) + faq_ld(body_html)
        page = f"""<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(p["title"])} | Täubert</title>
{seo_head(p["title"] + " – Täubert Karosserie & Lack", p["desc"], slug)}
{head_links}
<style>{style}{EXTRA_CSS}</style>
{ld}
{extra_ld}
</head>
<body>
{top}
<main id="inhalt">
{body_html}
</main>
{footer}
<script>
{js}</script>
</body>
</html>
"""
        open(os.path.join(SITE, f"{slug}.html"), "w", encoding="utf-8").write(sync_images(page))
        built.append(slug)
    ov_desc = f"Alle Leistungen von Täubert Karosserie & Lack in Sonneberg: Unfallreparatur, Lackierung, Smart Repair, Hagelschaden, Fahrzeugaufbereitung und mehr."
    page = f"""<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Leistungen – Karosserie &amp; Lack Sonneberg | Täubert</title>
{seo_head("Leistungen – Täubert Karosserie & Lack", ov_desc, "leistungen")}
{head_links}
<style>{style}{EXTRA_CSS}{OVERVIEW_CSS}</style>
{ld}
{breadcrumb_ld("leistungen", "Leistungen")}
</head>
<body>
{top}
<main id="inhalt">
{render_overview()}
{booking_cta("leistungen", "Leistungen")}
</main>
{footer}
<script>
{js}</script>
</body>
</html>
"""
    open(os.path.join(SITE, "leistungen.html"), "w", encoding="utf-8").write(sync_images(page))
    built.insert(0, "leistungen")
    open(os.path.join(SITE, "schaden-melden.html"), "w", encoding="utf-8").write(sync_images(simple_page(
        "schaden-melden", "Schaden melden",
        "Schaden per Foto melden: Fotos hochladen und eine erste Einschätzung von Täubert Karosserie & Lack in Sonneberg erhalten.",
        DAMAGE_FORM, style, head_links, top, footer, js, ld)))
    built.insert(1, "schaden-melden")
    open(os.path.join(SITE, "termin.html"), "w", encoding="utf-8").write(sync_images(simple_page(
        "termin", "Termin buchen – online, Rückruf oder Anruf",
        "Termin online buchen bei Täubert Karosserie & Lack in Sonneberg: Unfallreparatur, Lackierung, Smart Repair, Reifenservice und mehr.",
        BOOKING_PAGE, style, head_links, top, footer, js, ld)))
    built.insert(2, "termin")
    open(os.path.join(SITE, "unfall-was-tun.html"), "w", encoding="utf-8").write(sync_images(simple_page(
        "unfall-was-tun", "Unfall – was tun?",
        "Unfall gehabt? Checkliste in 7 Schritten: sichern, helfen, fotografieren, Daten austauschen – und Täubert in Sonneberg kümmert sich um den Rest.",
        UNFALL_PAGE, style, head_links, top, footer, js, ld)))
    built.insert(3, "unfall-was-tun")
    faq_body, faq_schema, faq_count = render_faq_page()
    faq_page = simple_page("fragen", "Häufige Fragen – Täubert Sonneberg",
        f"{faq_count} Antworten zu Termin, Kostenvoranschlag, Versicherung, Ersatzwagen, Unfallreparatur, Lackierung und Smart Repair bei Täubert in Sonneberg.",
        faq_body, style, head_links, top, footer, js, ld)
    faq_page = faq_page.replace("</head>", faq_schema + "\n</head>", 1)
    open(os.path.join(SITE, "fragen.html"), "w", encoding="utf-8").write(sync_images(faq_page))
    built.insert(4, "fragen")
    open(os.path.join(SITE, "danke.html"), "w", encoding="utf-8").write(simple_page(
        "danke", "Danke", "Ihre Schadensmeldung ist bei uns eingegangen.", THANKS, style, head_links, top, footer, js, ld,
        robots='<meta name="robots" content="noindex, follow">\n'))
    write_seo_files(built)
    update_index()  # erneut, jetzt mit den Bildern der gebauten Leistungsseiten
    for extra in ("index.html", "impressum.html", "datenschutz.html"):
        fp = os.path.join(SITE, extra)
        content = sync_images(open(fp, encoding="utf-8").read())
        open(fp, "w", encoding="utf-8").write(content)
    print("\n".join(built))


main()
