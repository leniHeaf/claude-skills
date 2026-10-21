"""Erzeugt die Unterseiten aus dem Shopify-Theme-Export (templates/page.*.json).

Aufruf: python3 -I build_pages.py <theme-dir> <site-dir>
"""
import html, json, os, re, sys

THEME, SITE = sys.argv[1], sys.argv[2]
BOOKING = "https://terminbuchungtaeubert.de"
DOMAIN = "https://www.taeubert-karosserie-lack.de"

# Vorlage -> Dateiname (nur Seiten mit eigenem Inhalt, keine Theme-Demo-Vorlagen)
PAGES = {
    "911": "porsche-911", "about-1": "history", "about-2": "karriere", "adrian": "q-a-adrian",
    "azubi": "azubi", "bamberg": "bamberg", "boxenstopp": "boxenstopp", "bulli-t2": "vw-bulli-t2",
    "contact": "contact", "fahrzeugaufbereitung": "fahrzeugaufbereitung", "fanny": "q-a-fanny",
    "job": "jobs", "karosserie": "karosserie", "kleinschaden": "kleinschaden", "kratzer-2": "kratzer",
    "kronach": "kronach", "lackierarbeiten": "lackierarbeiten", "lackierer-karosserie-co": "coburg",
    "landing": "meet-the-team", "leasingrueckgabe-auto-sonn": "leasingrueckgabe", "marco": "q-a-marco",
    "nec": "neustadt", "pascal": "q-a-pascal", "projekte": "porsche-gts", "reifenservice": "reifenservice",
    "roedental": "roedental", "smartrepair": "smartrepair", "sonneberg": "sonneberg", "toni": "q-a-toni",
    "unfall-gehabt-wir-kuemmer": "unfall", "unfall-oder-kratzer": "unfall-oder-kratzer",
    "unfallentstandsetzung": "unfallinstandsetzung", "was-kostet-es-ein-auto-l": "auto-lackieren-kosten",
    "who-we-are": "who-we-are",
}
# Shopify-Seiten-Handles -> Datei
HANDLES = {
    "contact": "contact", "who-we-are": "who-we-are", "jobs": "jobs", "26-09-2026-boxenstopp": "boxenstopp",
    "history": "history", "porsche-911": "porsche-911", "porsche-gts": "porsche-gts", "vw-bulli-t2": "vw-bulli-t2",
    "q-a-marco": "q-a-marco", "q-a-toni": "q-a-toni", "q-a-adrian": "q-a-adrian", "q-a-pascal": "q-a-pascal",
    "q-a-fanny": "q-a-fanny", "azubi": "azubi", "meet-the-team": "meet-the-team",
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


def blocks(sec):
    bl = sec.get("blocks") or {}
    for k in sec.get("block_order", list(bl)):
        b = bl.get(k)
        if b and not b.get("disabled"):
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
            out.append('''<section class="map"><iframe title="Täubert Karosserie und Lack Standort" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
  src="https://www.google.com/maps?q=Bettelhecker+Stra%C3%9Fe+15,+96515+Sonneberg&z=15&output=embed"></iframe></section>''')
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
  main h1, main h2, main h3, .faq summary { overflow-wrap: break-word; hyphens: auto; }
  .faq summary span { flex: 1; min-width: 0; }
  .rte p { margin-bottom: 12px; } .rte ul, .rte ol { margin: 0 0 12px 22px; } .rte li { margin-bottom: 4px; }
  .rte h2, .rte h3 { margin: 22px 0 12px; font-size: clamp(22px, 2.4vw, 30px); }
  .rte a { text-decoration: underline; }
  .rte table { border-collapse: collapse; width: 100%; margin: 12px 0; } .rte td, .rte th { border: 1px solid var(--line); padding: 8px 10px; text-align: left; }
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
  .marquee-track.slow { animation-duration: 45s; }
  .map iframe { display: block; width: 100%; height: 450px; border: 0; }
  .countdown, .promo-box, .cta-box { text-align: center; padding: 60px 20px; }
  .countdown { background: #050505; color: #fff; }
  .countdown h2 { font-size: clamp(30px, 4vw, 42px); }
  .countdown p { margin-top: 12px; }
  .cd-cards { display: flex; justify-content: center; flex-wrap: wrap; gap: 20px; margin-top: 30px; }
  .cd-card { background: #1a1a1a; border: 1px solid #ff0000; border-radius: 10px; padding: 24px 32px; min-width: 240px; }
  .cd-card b { display: block; font-family: "Archivo Black"; color: #ff0000; font-size: clamp(36px, 5vw, 54px); line-height: 1.1; }
  .promo-box { background: #000; color: #fff; }
  .promo-box .badge { display: inline-block; background: #ff0000; color: #000; font-weight: 700; padding: 6px 14px; margin-bottom: 16px; }
  .promo-box h2 { font-size: 30px; margin-bottom: 10px; }
  .progress { max-width: 420px; height: 10px; background: #4a4a4a; margin: 24px auto 10px; }
  .progress div { height: 100%; background: #ff0000; }
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
  document.querySelectorAll('.marquee-track[data-text]').forEach(t => {
    const unit = `<span>${t.dataset.text}</span>`;
    t.innerHTML = unit.repeat(8);
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
    head_links = re.search(r'(<link rel="icon".*?rel="stylesheet">)', src, re.S).group(1)
    top = re.search(r'(<a class="skip".*?</aside>)', src, re.S).group(1)
    top = top.replace('class="header transparent"', 'class="header"')
    footer = re.search(r"(<footer>.*?</footer>)", src, re.S).group(1)
    js = re.search(r"<script>(.*?)</script>", src, re.S).group(1)
    menu_js = re.search(r"(  // Menü-Drawer.*?addEventListener\('keydown'.*?\n)", js, re.S).group(1)
    img_js = re.search(r"(  // Fehlende Bilddateien.*?\n  \}\);\n)", js, re.S).group(1)
    return style, head_links, top, footer, menu_js + img_js + PAGE_JS + "  document.getElementById('year').textContent = new Date().getFullYear();\n"


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


def write_seo_files(slugs):
    urls = [f"{DOMAIN}/"] + [f"{DOMAIN}/{x}.html" for x in slugs]
    sm = "\n".join(f"  <url><loc>{u}</loc></url>" for u in urls)
    open(os.path.join(SITE, "sitemap.xml"), "w", encoding="utf-8").write(
        f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{sm}\n</urlset>\n')
    open(os.path.join(SITE, "robots.txt"), "w", encoding="utf-8").write(
        f"User-agent: *\nAllow: /\n\nSitemap: {DOMAIN}/sitemap.xml\n")
    # 301-Weiterleitungen von den alten Shopify-Adressen (/pages/<handle>), Netlify-Format
    lines = [f"/pages/{h}  /{f}.html  301" for h, f in HANDLES.items()]
    lines += [f"/pages/{x}  /{x}.html  301" for x in slugs if x not in HANDLES]
    lines += ["/collections/*  https://terminbuchungtaeubert.de  301", "/products/*  https://terminbuchungtaeubert.de  301"]
    open(os.path.join(SITE, "_redirects"), "w", encoding="utf-8").write("\n".join(dict.fromkeys(lines)) + "\n")


def main():
    style, head_links, top, footer, js = shell()
    ld = re.search(r'(<script type="application/ld\+json">.*?</script>)', open(os.path.join(SITE, "index.html"), encoding="utf-8").read(), re.S)
    ld = ld.group(1) if ld else ""
    built = []
    for tpl, slug in PAGES.items():
        d = load(os.path.join(THEME, "templates", f"page.{tpl}.json"))
        body = []
        for k in d["order"]:
            s = d["sections"][k]
            if s.get("disabled"):
                continue
            r = RENDER.get(s["type"])
            if r:
                body.append(r(s))
        body_html = first_h1(chr(10).join(b for b in body if b))
        title = first_heading(d) or slug.replace("-", " ").title()
        og = re.search(r'src="images/([^"]+)"', body_html)
        page = f"""<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)} – Täubert Karosserie &amp; Lack</title>
{seo_head(f"{title} – Täubert Karosserie & Lack", description(body_html), slug, og.group(1) if og else None)}
{head_links}
<style>{style}{EXTRA_CSS}</style>
{ld}
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
        open(os.path.join(SITE, f"{slug}.html"), "w", encoding="utf-8").write(page)
        built.append(slug)
    write_seo_files(built)
    print("\n".join(built))


main()
