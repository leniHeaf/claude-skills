"""Erzeugt die Unterseiten aus dem Shopify-Theme-Export (templates/page.*.json).

Aufruf: python3 -I build_pages.py <theme-dir> <site-dir>
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from new_pages import NEW_PAGES, RATGEBER  # noqa: E402
from community_pages import COMMUNITY, COMMUNITY_CSS  # noqa: E402
from image_names import IMAGE_NAMES  # noqa: E402
from text_spacing import fix_spacing  # noqa: E402


def img_new(fn):
    """Alter Bildname (aus Theme/Quelltexten) -> sprechender Dateiname in images/."""
    base, ext = os.path.splitext(fn)
    if base.endswith("-700") and base[:-4] in IMAGE_NAMES:
        return IMAGE_NAMES[base[:-4]] + "-700" + ext
    return IMAGE_NAMES[base] + ext if base in IMAGE_NAMES else fn


def rename_img_refs(page):
    return re.sub(r'images/([^"\'\s)<>,]+)', lambda m: "images/" + img_new(m.group(1)), page)

THEME, SITE = sys.argv[1], sys.argv[2]
BOOKING_URL = "https://terminbuchungtaeubert.de"  # externes Buchungstool
BOOKING = "termin.html#wunschtermin"  # eigenes Wunschtermin-Formular (das externe Buchungstool ist nicht erreichbar)
DOMAIN = "https://www.taeubert-karosserie-lack.de"

# Vorlage -> Dateiname (nur Seiten mit eigenem Inhalt, keine Theme-Demo-Vorlagen)
PAGES = {
    "911": "porsche-911", "about-1": "history", "about-2": "karriere", "adrian": "q-a-adrian",
    "azubi": "azubi", "bamberg": "bamberg", "bulli-t2": "vw-bulli-t2",
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

# Weitere alte Shopify-Adressen (SEO-Seiten mit langen Handles) -> neue Seite
OLD_SHOPIFY_PAGES = {
    "job": "jobs", "karosserie-lackierer-sonneberg-taubert-karosserie-lack": "sonneberg", "karosseriearbeiten": "karosserie",
    "kleine-delle-im-auto": "smartrepair", "kratzer-im-auto": "unfall", "lackierer-bamberg-karosserie-unfallreparatur": "bamberg",
    "lackierer-coburg-karosserie-lack-taubert": "coburg", "lackierer-kronach-unfallreparatur-lackierung": "kronach",
    "lackierer-neustadt-bei-coburg-karosserie-taubert": "neustadt", "unfall-kratzer": "kratzer", "unfallenstandsetzung": "unfall",
}

# Shopify-Seiten-Handles -> Datei
HANDLES = {
    "contact": "contact", "who-we-are": "who-we-are", "jobs": "jobs", "26-09-2026-boxenstopp": "events", "boxenstopp": "events",
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
    if stem in IMAGE_NAMES:   # umbenannte Fotos: unter dem neuen Namen suchen
        stem = IMAGE_NAMES[stem]
        name = stem + os.path.splitext(name)[1]
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
        label = "Termin anfragen"
    if not label or not href:
        return ""
    return f'<a class="btn {cls}" {a_attrs(href)}>{esc(label)}</a>'


def has_img(ref):
    return bool(ref) and os.path.exists(os.path.join(SITE, "images", img_new(img_name(ref))))


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
    """JOIN-Stellenwidget: lädt erst nach Klick (vorher keine Verbindung zu join.com)."""
    code = sec["settings"].get("custom_liquid", "")
    m = re.search(r'src="(https://join\.com/api/widget/[^"]+)"', code)
    if not m:
        return ""
    return f'''<section class="sec"><div class="page-width"><div id="join-widget"></div>
  <div class="ext-consent" data-ext="join" data-src="{esc(m.group(1))}">
    <p class="eyebrow">Hinweis zum Datenschutz</p>
    <p>Unsere aktuellen Stellenangebote werden über den Dienst JOIN (JOIN Solutions AG, Schweiz) angezeigt. Erst wenn Sie sie laden, wird eine Verbindung zu join.com aufgebaut und Ihre IP-Adresse übertragen. Mehr in der <a href="datenschutz.html#join">Datenschutzerklärung</a>.</p>
    <div class="btns"><button type="button" class="btn btn-dark" data-ext-load>Stellenangebote laden</button><a class="btn btn-outline-dark" href="jobs.html#bewerbung">Direkt bewerben</a></div>
    <label class="ext-remember"><input type="checkbox" data-ext-remember> Auf diesem Gerät merken</label>
  </div></div></section>'''


def r_blocks(sec):
    out = []
    for t, s in blocks(sec):
        if t == "ai_gen_block_699b8cf":
            out.append('''<section class="map" id="karte">
  <div class="map-consent">
    <p><strong>An der Lehmgrube 3, 96515 Sonneberg</strong></p>
    <p>Die Karte wird von Google Maps geladen. Dabei werden Daten an Google übertragen (siehe <a href="datenschutz.html">Datenschutz</a>).</p>
    <div class="btns" style="justify-content:center">
      <button class="btn btn-dark" type="button" data-load-map>Karte laden</button>
      <a class="btn btn-outline-dark" href="https://www.google.com/maps/search/?api=1&query=An+der+Lehmgrube+3+96515+Sonneberg" target="_blank" rel="noopener">In Google Maps öffnen</a>
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
  .todo { background: #fff3b0; padding: 0 4px; }
  .legal-page h2 { font-size: 20px; margin: 32px 0 10px; }
  .ext-consent { background: var(--grey); border: 1px solid var(--line); padding: 32px; max-width: 760px; }
  .ext-consent p:not(.eyebrow) { color: #444; margin-bottom: 18px; }
  .ext-consent a:not(.btn) { text-decoration: underline; text-underline-offset: 3px; }
  .ext-consent .btns { display: flex; flex-wrap: wrap; gap: 10px; }
  .ext-remember { display: flex; gap: 8px; align-items: center; margin-top: 14px; font-size: 14px; color: #555; }
  .ext-consent[hidden] { display: none; }
  .kc-gate { margin: 40px auto 80px; text-align: left; }
  .legal-note { font-size: 13px; color: #555; padding-top: 24px; padding-bottom: 24px; }
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
  .svc-area { font-size: 14px; color: #555; margin-top: 6px; }
  .svc-area a { color: var(--black); text-decoration: underline; text-underline-offset: 3px; }
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
  @media (min-width: 991px) { .tile-grid.m2 > :first-child, .tile-grid.m1 > :first-child, .tile-grid.m1 > :last-child { grid-column: span 2; aspect-ratio: auto; } }
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
  .svc-aside h2 { font-size: 20px; margin-bottom: 18px; }
  .svc-aside .aside-kicker { font-family: var(--f-mono); font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: rgba(255,255,255,.6); margin-bottom: 8px; overflow-wrap: anywhere; }
  @media (min-width: 991px) { .svc-layout ~ * .svc-quick .trust, body:has(.svc-aside) .svc-quick .trust { display: none; } body:has(.svc-aside) .svc-quick-inner { justify-content: flex-start; } }
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
  .cd-card b { display: block; font-family: var(--f-display); color: #fff; font-size: clamp(36px, 5vw, 54px); line-height: 1.1; }
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

  /* Leistungsseiten: Einleitung als ruhiger, großer Auftakt */
  .svc-lead { padding: 96px 0 80px !important; }
  .svc-lead .rich-inner { max-width: 820px !important; margin: 0 auto; text-align: center !important; }
  .svc-lead .eyebrow { justify-content: center; }
  .svc-lead .rte p:first-child { font-family: var(--f-display); font-size: clamp(24px, 2.6vw, 34px); line-height: 1.22; color: var(--black); margin-bottom: 24px; }
  .svc-lead .rte p { font-size: 17px; color: #555; max-width: 680px; margin-left: auto; margin-right: auto; }
  .iwt-media[style*="aspect-ratio:auto"] { min-height: 0; background: none; }
  .iwt-media[style*="aspect-ratio:auto"] img { display: block; height: auto; }
  .svc-steps + .sec .faq, .svc-steps ~ .sec .faq { padding-top: 10px; }
  @media (max-width: 760px) { .svc-lead { padding: 60px 0 50px !important; } .svc-lead .rte p { font-size: 16px; } }
"""

PAGE_JS = """
  // Externe Inhalte (JOIN) erst nach Klick laden
  document.querySelectorAll('[data-ext="join"]').forEach(box => {
    const load = () => { const sc = document.createElement('script'); sc.src = box.dataset.src; sc.defer = true; sc.setAttribute('data-mount-in', '#join-widget'); document.body.appendChild(sc); box.hidden = true; };
    let ok = false; try { ok = localStorage.getItem('consent_join') === '1'; } catch (e) {}
    if (ok) return load();
    box.querySelector('[data-ext-load]').addEventListener('click', () => { if (box.querySelector('[data-ext-remember]').checked) { try { localStorage.setItem('consent_join', '1'); } catch (e) {} } load(); });
  });

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
    sec.innerHTML = '<iframe title="Täubert Karosserie und Lack Standort" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=An+der+Lehmgrube+3,+96515+Sonneberg&z=15&output=embed"></iframe>';
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
    scroll_js = re.search(r"(  // Header beim Scrollen schlanker.*?\n  \}\)\(\);\n)", js, re.S).group(1)
    cookie_js = re.search(r"(  // Cookie-Banner.*?\n  \}\)\(\);\n)", js, re.S).group(1)
    return style, head_links, top, footer, menu_js + nav_js + img_js + status_js + scroll_js + marquee_js + PAGE_JS + cookie_js + "  document.getElementById('year').textContent = new Date().getFullYear();\n"


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
                      "Reifenwechsel, Räderwechsel und Rädereinlagerung in Sonneberg & Neustadt bei Coburg – Termin anfragen."),
    "unfall": ("Unfall gehabt? Unfallreparatur Sonneberg", "Unfallreparatur",
               "Unfall gehabt? Täubert in Sonneberg kümmert sich um Reparatur, Versicherung und Gutachten – direkte Abrechnung mit der Versicherung."),
    "unfall-oder-kratzer": ("Unfall oder Kratzer – wer zahlt?", "Ratgeber Reparaturkosten",
                            "Wer übernimmt die Reparaturkosten nach Unfall oder Kratzer? Antworten zu Versicherung, Gutachter und Ersatzwagen von Täubert in Sonneberg."),
    "auto-lackieren-kosten": ("Auto lackieren: Kosten & Beispiele", "Ratgeber Lackierkosten",
                              "Was kostet es, ein Auto lackieren zu lassen? Preise und Beispiele für Teil- und Komplettlackierung von Täubert in Sonneberg."),
}
LOCATIONS = {
    "sonneberg": ("Lackierer & Karosserie Sonneberg – Unfallreparatur", "Sonneberg",
                  "Ihr Lackierer und Karosseriebauer in Sonneberg: Unfallreparatur, Lackierung, Smart Repair und Versicherungsabwicklung – An der Lehmgrube 3."),
    "neustadt": ("Lackierer & Karosserie Neustadt bei Coburg", "Neustadt bei Coburg",
                 "Lackierer nahe Neustadt bei Coburg: Unfallreparatur, Lackierung und Smart Repair bei Täubert – nur wenige Minuten entfernt in Sonneberg."),
    "coburg": ("Lackierer & Karosserie Coburg – Unfallreparatur", "Coburg",
               "Lackierer & Karosserie für Coburg: Unfallreparatur, Lackierarbeiten, Smart Repair und Aufbereitung – Kostenvoranschlag in 24 h, Ersatzwagen, Hol- und Bringservice."),
    "roedental": ("Lackierer & Karosserie Rödental", "Rödental",
                  "Karosserie und Lackierung für Rödental: Unfallreparatur, Parkrempler und Smart Repair bei Täubert Karosserie & Lack in Sonneberg."),
    "kronach": ("Lackierer & Karosserie Kronach – Unfallreparatur", "Kronach",
                "Lackierer & Karosserie für Kronach: Unfallreparatur, Lackierung, Smart Repair und Aufbereitung – mit Hol- und Bringservice, Ersatzwagen und direkter Abrechnung mit der Versicherung."),
    "bamberg": ("Lackierer & Karosserie Bamberg", "Bamberg",
                "Karosserie und Lackierung für Autofahrer aus Bamberg: Unfallreparatur, Lackierarbeiten und Smart Repair bei Täubert in Sonneberg."),
}
SERVICE_LINKS = [("karosserie", "Karosserie"), ("lackierarbeiten", "Lackierarbeiten"), ("unfallinstandsetzung", "Unfallinstandsetzung"),
                 ("smartrepair", "Smart Repair"), ("kleinschaden", "Kleinschaden"), ("kratzer", "Kratzer entfernen"),
                 ("leasingrueckgabe", "Leasingrückgabe"), ("fahrzeugaufbereitung", "Fahrzeugaufbereitung"), ("reifenservice", "Reifenservice")]
SERVICE_LINKS += [(slug, p["short"]) for slug, p in NEW_PAGES.items() if slug not in dict(SERVICE_LINKS)]
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
TRUST_OTHER = ["Kostenvoranschlag in 24 Stunden", "Ersatzwagen", "Hol- und Bringservice", "Schlüsselabgabe auch nach Feierabend", "Alle Marken"]


def trust_for(slug):
    """Bei Pflege, Reifen, HU usw. ist die Versicherungsabrechnung kein Thema."""
    if any(slug in slugs for _, slugs in CATEGORIES) and svc_kind(slug) != "damage":
        return '<ul class="trust">' + "".join(f"<li>{CHECK}{t}</li>" for t in TRUST_OTHER) + "</ul>"
    return TRUST_HTML


def booking_cta(slug, place):
    in_cat = any(slug in slugs for _, slugs in CATEGORIES)
    cta2 = second_cta(slug, place, "outline-light") if in_cat else '<a class="btn btn-outline-light" href="schaden-melden.html">Schaden per Foto melden</a>'
    svc = "".join(f'<li><a href="{x}.html">{esc(n)}</a></li>' for x, n in SERVICE_LINKS if x != slug)
    loc = "".join(f'<li><a href="{x}.html">{esc(n)}</a></li>' for x, n in LOCATION_LINKS if x != slug)
    return f'''<section class="booking-cta">
  <div class="page-width">
    <h2>Termin anfragen</h2>
    {trust_for(slug)}
    <p class="callback-hint">Keine Zeit zum Buchen? <a href="termin.html#rueckruf">Rückruf anfordern</a> – wir melden uns.</p>
    <p>Wählen Sie Ihren Wunschtermin direkt online – oder rufen Sie uns an. Wir schauen uns Ihr Fahrzeug an und sagen Ihnen ehrlich, was Sinn macht.</p>
    <div class="btns">
      <a class="btn btn-light" href="{BOOKING}">Termin anfragen</a>
      {cta2}
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
            "url": f"{DOMAIN}/{slug}.html", "provider": {"@type": "AutoBodyShop", "name": "Täubert Karosserie & Lack GmbH", "url": f"{DOMAIN}/"},
            "areaServed": [n for _, n in LOCATION_LINKS]}
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + "</script>"


# Inhalte, die im Shopify-Editor zusammengelaufen sind, wieder lesbar machen
FIXES = [
    ("03675 4289606  I  hallo@taeubert-karosserie-lack.de", "03675 4289606 · hallo@taeubert-karosserie-lack.de"),
    ("TÄUBERT befindet sich im nähe des Zentrums in Sonneberg.", "Täubert befindet sich in der Nähe des Sonneberger Zentrums."),
    ("Bettelheckerstraße 15 </p>", "An der Lehmgrube 3</p>"),   # Werkstatt-Adresse (Theme-Texte)
    ("Bettelhecker Straße 15", "An der Lehmgrube 3"),
    ("Täubert Karosserie und Lack GmbH", "Täubert Karosserie &amp; Lack GmbH"),
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
    page = fix_spacing(rename_img_refs(fill_alts(page)))   # fehlende Leerzeichen nach Satzzeichen ergänzen
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


def render_new_page(slug, p, aside_title=None):
    """Eigene Leistungsseite im Stil der übrigen Unterseiten."""
    art = "".join(f'<div><h2>{esc(h)}</h2><div class="rte">{body}</div></div>' for h, body in p["sections"])
    secs = [f'''<section class="page-width svc-layout">
  <div class="svc-article">{art}</div>
  <aside class="svc-aside" aria-label="Termin">
    <p class="aside-kicker">{esc(p["short"])}</p>
    <h2>{esc(aside_title or "Ihr Termin bei Täubert")}</h2>
    {trust_for(slug)}
    <div class="btns"><a class="btn btn-light" href="{BOOKING}">Termin anfragen</a>{second_cta(slug, p["short"], "outline-light")}<a class="btn btn-outline-light" href="tel:+4936754289606">03675 4289606</a></div>
    <p class="hours">Mo–Do 8–17 Uhr · Fr 8–14:30 Uhr<br>An der Lehmgrube 3, Sonneberg</p>
  </aside>
</section>''']
    rows = "".join(f'<details><summary><span>{esc(q)}</span></summary><div class="rte"><p>{a if "<a " in a else esc(a)}</p></div></details>' for q, a in p["faq"])
    img = FALLBACK_IMG.get(slug)
    media_html = f'<div class="media"><img src="images/{img}" alt="{esc(p["short"])}" fetchpriority="high"></div><div class="overlay" style="opacity:.5"></div>' if img else '<div class="media"></div><div class="overlay" style="opacity:0"></div>'
    return f'''<section class="sub-hero" style="--h:520px;--mh:440px">
  {media_html}
  <div class="sub-hero-content" style="max-width:960px">
    <h1 class="overline">{esc(p["title"])}</h1>
    <p class="heading h-8">{esc(p["claim"])}</p>
    <div class="rte"><p>{esc(p["lead"])}</p></div>
    <div class="btns"><a class="btn btn-light" href="{BOOKING}">Termin anfragen</a><a class="btn btn-outline-light" href="tel:+4936754289606">Anrufen</a></div>
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
    out += [(slug, p["short"], p["desc"]) for slug, p in NEW_PAGES.items() if slug not in {s for s, *_ in out}]
    return out


# Ratgeber-Seiten (keine eigene Leistung)
GUIDES = ["unfall-oder-kratzer", "auto-lackieren-kosten"] + list(RATGEBER)


LEGAL_NOTE = '<p class="legal-note page-width">Hinweis: Diese Informationen sind allgemeiner Natur, ohne Gewähr und keine Rechts- oder Versicherungsberatung. Maßgeblich sind Ihr Versicherungsvertrag und der Einzelfall.</p>'


def guide_meta(g):
    """(Titel, Kurzname, Beschreibung) eines Ratgebers – aus dem Shop oder aus RATGEBER."""
    if g in SERVICES:
        return SERVICES[g][0], SERVICES[g][1], SERVICES[g][2]
    return RATGEBER[g]["title"], RATGEBER[g]["short"], RATGEBER[g]["desc"]


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
    "reifenservice": "Reifenwechsel und Einlagerung – Termin anfragen.",
    "unfall": "Ein Anruf – wir kümmern uns um alles Weitere.",
    "hagelschaden": "Hageldellen möglichst ohne Lackieren entfernen.",
    "stossstange-reparieren": "Kratzer, Risse, Dellen – reparieren statt tauschen, wo es Sinn macht.",
    "oldtimer-restaurierung": "Entrostung und Lack im Originalfarbton – mit Respekt vor dem Original.",
    "fuhrparkservice": "Firmenwagen und Transporter schnell wieder einsatzbereit.",
    "lackaufbereitung": "Waschkratzer und Hologramme raus – maschinell poliert bis zum Tiefenglanz.",
    "keramikversiegelung": "Langzeitschutz und Glanz – Wasser perlt ab, Pflege wird leichter.",
    "innenraumaufbereitung": "Polster, Leder, Teppiche und Gerüche – wieder gern einsteigen.",
    "scheinwerfer-aufbereiten": "Vergilbt und matt? Geschliffen, poliert, versiegelt – wieder klar.",
    "unterbodenschutz": "Unterbodenwäsche, Rostbehandlung und Mike Sanders Versiegelung gegen Streusalz.",
    "hu-au": "Vorab-Check, Mängel direkt beheben, Prüfung organisieren – Plakette ohne Stress.",
    "reifen-kaufen": "Beratung, Bestellung, Montage und Wuchten – alles aus einer Hand.",
    "felgenreparatur": "Bordsteinschäden und Kratzer an Alufelgen – wie neu lackiert.",
    "lackstift": "Nach Farbcode exakt angemischt – für Steinschläge und kleine Kratzer.",
    "versicherungsschaden": "Direkte Abrechnung mit der Versicherung. Sie bringen das Auto, wir den Rest.",
}


# Trennstellen für lange Komposita in den Foto-Kacheln
SHY = {"Unfallinstandsetzung": "Unfall&shy;instand&shy;setzung", "Fahrzeugaufbereitung": "Fahrzeug&shy;aufbereitung",
       "Versicherungsschaden": "Versicherungs&shy;schaden", "Karosseriearbeiten": "Karosserie&shy;arbeiten",
       "Kleinschaden-Reparatur": "Kleinschaden-<wbr>Reparatur", "Unfallreparatur": "Unfall&shy;reparatur",
       "Leasingrückgabe": "Leasing&shy;rückgabe", "Lackaufbereitung": "Lack&shy;aufbereitung", "Keramikversiegelung": "Keramik&shy;versiegelung",
       "Innenraumaufbereitung": "Innenraum&shy;aufbereitung", "Unterbodenschutz": "Unterboden&shy;schutz", "Felgenreparatur": "Felgen&shy;reparatur", "Fuhrparkservice": "Fuhrpark&shy;service", "Lackierarbeiten": "Lackier&shy;arbeiten"}


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
    ("Unfall?", [("unfall-was-tun.html", "Unfall – was jetzt zu tun ist"), ("schaden-melden.html", "Schaden per Foto melden"), ("ratgeber.html", "Ratgeber & Tipps"),
                 ("versicherungsschaden.html", "Abrechnung mit der Versicherung"), ("unfall-oder-kratzer.html", "Wer zahlt die Reparatur?")]),
    ("Über uns", [("who-we-are.html", "Who we are"), ("history.html", "History"), ("meet-the-team.html", "Meet the Team & Q&A"),
                  ("porsche-911.html", "Projekt: Porsche 911"), ("porsche-gts.html", "Projekt: Porsche Cayenne GTS"), ("vw-bulli-t2.html", "Projekt: VW Bulli T2")]),
    ("Club", [("club.html", "Täubert Club"), ("events.html", "Täubert Events"), ("partner.html", "Partner: Autohäuser & Firmen"), ("gutscheine.html", "Gutscheine")]),
    ("Karriere", [("karriere.html", "Karriere bei Täubert"), ("azubi.html", "Ausbildung"), ("jobs.html", "Stellenangebote"), ("jobs.html#bewerbung", "Direkt bewerben")]),
]


def nav_html():
    svcs = {s: n for s, n, _ in all_services()}
    mega = "".join(f'<div><h3>{esc(c)}</h3>' + "".join(f'<a href="{s}.html">{esc(svcs[s])}</a>' for s in slugs if s in svcs) + "</div>" for c, slugs in CATEGORIES)
    out = [f'<li class="has-sub"><button class="top" type="button" aria-expanded="false">Leistungen {CHEV}</button><div class="panel mega">{mega}<a class="all" href="leistungen.html">Alle Leistungen ansehen →</a><a class="all" href="konfigurator.html">Lack-Konfigurator →</a></div></li>']
    for title, links in NAV_GROUPS:
        out.append(f'<li class="has-sub"><button class="top" type="button" aria-expanded="false">{esc(title)} {CHEV}</button><div class="panel">' + "".join(f'<a href="{h}">{esc(t)}</a>' for h, t in links) + "</div></li>")
    out.append('<li><a class="top" href="fragen.html">Fragen</a></li><li><a class="top" href="contact.html">Kontakt</a></li>')
    return "<ul>" + "".join(out) + "</ul>"


def drawer_html():
    svcs = {s: n for s, n, _ in all_services()}
    groups = "".join(f"<h3>{esc(c)}</h3>" + "".join(f'<a href="{s}.html">{esc(svcs[s])}</a>' for s in slugs if s in svcs) for c, slugs in CATEGORIES)
    out = [f'''<div class="drawer-quick">
      <a class="btn btn-dark" href="{BOOKING}">Termin anfragen</a>
      <a class="btn btn-outline-dark" href="schaden-melden.html">Schaden per Foto melden</a>
      <a class="btn btn-outline-dark" href="unfall-was-tun.html">Unfall – was jetzt tun?</a>
    </div>''',
           f'<details><summary>Leistungen</summary><div class="sub"><a href="leistungen.html"><strong>Alle Leistungen</strong></a>{groups}</div></details>']
    for title, links in NAV_GROUPS[1:]:
        out.append(f'<details><summary>{esc(title)}</summary><div class="sub">' + "".join(f'<a href="{h}">{esc(t)}</a>' for h, t in links) + "</div></details>")
    out.append('<a class="plain" href="konfigurator.html">Lack-Konfigurator</a><a class="plain" href="fragen.html">Häufige Fragen</a><a class="plain" href="contact.html">Kontakt &amp; Anfahrt</a>')
    return "\n    ".join(out)


# Rundum-Service: das zentrale Versprechen (Startseite und Leistungsübersicht)
CARE = [
    ("Wir holen Ihr Auto ab", "Hol- und Bringservice im Umkreis von 30 km – Sie müssen nicht einmal in die Werkstatt kommen."),
    ("Sie bleiben mobil", "Ein Ersatzwagen für die Dauer der Reparatur – auch mit Hund, nach Absprache."),
    ("Klarheit in 24 Stunden", "Ihr Kostenvoranschlag: verständlich, verbindlich, ohne Überraschungen."),
    ("Kein Papierkram", "Wir rechnen direkt mit der Versicherung ab und stimmen uns mit dem Gutachter ab."),
    ("Handwerk ohne Kompromisse", "Richtbank, digitale Farbtonmessung und eigene Lackierkabine – für ein Ergebnis wie ab Werk."),
    ("Gereinigt zurück", "Geprüft, gereinigt und auf Wunsch wieder vor Ihre Tür gebracht."),
]


def care_html():
    items = "".join(f'<li><span class="n">{i + 1:02d}</span><h3>{esc(h)}</h3><p>{esc(t)}</p></li>' for i, (h, t) in enumerate(CARE))
    return f'''<section class="care" id="service">
    <div class="page-width">
      <div class="sec-intro"><p class="eyebrow">Rundum-Service</p><h2>Sie lehnen sich zurück. Wir erledigen den Rest.</h2>
      <p class="lead">Ob Parkrempler, Unfall, Lack oder Aufbereitung: Sie haben einen Ansprechpartner, und wir kümmern uns um alles – in höchster Qualität und ohne Aufwand für Sie.</p></div>
      <ol class="care-grid">{items}</ol>
      <div class="btns"><a class="btn btn-light" href="{BOOKING}">Termin anfragen</a><a class="btn btn-outline-light" href="termin.html#rueckruf">Rückruf anfordern</a></div>
    </div>
  </section>'''


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
    opts = "".join(f"<option>{esc(n)}</option>" for _, n, _ in svcs)
    bookbar = f'''<form class="bookbar" action="termin.html" method="get" aria-label="Termin anfragen">
      <label><span>Leistung</span><select name="leistung"><option value="">Bitte wählen</option>{opts}</select></label>
      <label><span>Wunschtermin</span><input type="date" name="datum"></label>
      <button class="btn btn-dark" type="submit">Termin anfragen</button>
    </form>
    <p class="bookbar-alt">Oder <a href="termin.html#rueckruf">Rückruf anfordern</a> · <a href="schaden-melden.html">Schaden per Foto melden</a></p>'''
    s = re.sub(r"<!-- BOOKBAR:START -->.*?<!-- BOOKBAR:END -->", lambda m: "<!-- BOOKBAR:START -->" + bookbar + "<!-- BOOKBAR:END -->", s, flags=re.S)
    s = re.sub(r"<!-- SERVICE:START -->.*?<!-- SERVICE:END -->", lambda m: "<!-- SERVICE:START -->\n  " + care_html() + "\n  <!-- SERVICE:END -->", s, flags=re.S)
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
    ("Karosserie & Lack", ["karosserie", "lackierarbeiten", "smartrepair", "kleinschaden", "kratzer", "stossstange-reparieren", "lackstift"]),
    ("Aufbereitung & Pflege", ["fahrzeugaufbereitung", "lackaufbereitung", "keramikversiegelung", "innenraumaufbereitung", "scheinwerfer-aufbereiten", "unterbodenschutz"]),
    ("Räder & Reifen", ["reifenservice", "reifen-kaufen", "felgenreparatur"]),
    ("Service", ["hu-au", "leasingrueckgabe", "fuhrparkservice"]),
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
    "hu-au": "pexels-enis-yavuz-3516387-5260115.webp",
    "reifen-kaufen": "pexels-borta-2790256-30787396.webp",
    "felgenreparatur": "pexels-austin-briones-2158818052-36202185.webp",
    "lackstift": "Zwischenueberschrifthinzufuegen.webp",
    "lackaufbereitung": "pexels-tima-miroshnichenko-6872570.webp",
    "keramikversiegelung": "pexels-amar-11157437.webp",
    "innenraumaufbereitung": "pexels-wavyvisuals-377312923-20051451.webp",
    "scheinwerfer-aufbereiten": "ElevenLabs_image_nano-banana_Nahaufnahmen..._2026-01-13T08_52_06-2.webp",
    "unfall-oder-kratzer": "pexels-uiliamnornberg-24960483_2971c584-81f6-4dd4-bf60-f58213b7bd8b.webp",
    "auto-lackieren-kosten": "pexels-markusspiske-1729999.webp",
    "oldtimer-restaurierung": "hf_20260210_174234_03b93839-672b-4ba9-b742-8e3397346ee1.webp",
}


def first_image(body_html):
    for m in re.finditer(r'src="images/([^"]+)"', body_html):
        if os.path.exists(os.path.join(SITE, "images", img_new(m.group(1)))):
            return m.group(1)
    return None


def service_intro(slug, name):
    """Brotkrumen + Kurzleiste mit Versprechen und den zwei Hauptaktionen direkt unter dem Startbild."""
    return f'''<nav class="crumbs page-width" aria-label="Brotkrumen"><a href="index.html">Startseite</a><span>›</span><a href="leistungen.html">Leistungen</a><span>›</span><span aria-current="page">{esc(name)}</span></nav>
<p class="svc-area page-width">{esc(name)} für Kunden aus <a href="sonneberg.html">Sonneberg</a>, <a href="coburg.html">Coburg</a>, <a href="kronach.html">Kronach</a>, <a href="neustadt.html">Neustadt bei Coburg</a> und Umgebung – mit Hol- und Bringservice.</p>
<section class="svc-quick">
  <div class="page-width svc-quick-inner">
    {trust_for(slug)}
    <div class="btns"><a class="btn btn-dark" href="{BOOKING}">Termin anfragen</a>{second_cta(slug, name)}</div>
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


def svc_kind(slug):
    """damage = Unfall/Karosserie/Lack, care = Aufbereitung & Pflege, classic = Oldtimer, sonst service."""
    cat = next((c for c, slugs in CATEGORIES if slug in slugs), "")
    if cat in ("Unfall & Versicherung", "Karosserie & Lack") or slug in ("unfall", "leasingrueckgabe"):
        return "damage"
    return {"Aufbereitung & Pflege": "care", "Klassiker": "classic"}.get(cat, "service")


def second_cta(slug, name, style="outline-dark"):
    if svc_kind(slug) == "damage":
        return f'<a class="btn btn-{style}" href="schaden-melden.html">Schaden per Foto melden</a>'
    from urllib.parse import quote
    return f'<a class="btn btn-{style}" href="termin.html?leistung={quote(name)}#wunschtermin">Wunschtermin anfragen</a>'


def _steps(items):
    lis = "".join(f'<li><span class="num">{i + 1}</span><h3>{esc(h)}</h3><p>{esc(t)}</p></li>' for i, (h, t) in enumerate(items))
    return f'''<section class="svc-steps">
  <div class="page-width">
    <h2>So läuft's ab</h2>
    <ol class="steps">{lis}</ol>
  </div>
</section>'''


STEPS_BY_KIND = {
    "care": [("Termin wählen", "Online buchen, anrufen oder per WhatsApp – wir beraten Sie, welche Pflege zu Ihrem Fahrzeug passt."),
             ("Bringen oder abholen lassen", "Im Umkreis von 30 km holen wir Ihr Auto ab. Auf Wunsch bekommen Sie einen Ersatzwagen."),
             ("Aufbereitung in Ruhe", "Gründlich, Schritt für Schritt und mit Produkten, die zu Lack und Material passen."),
             ("Glänzend zurück", "Gemeinsame Übergabe mit Pflegetipps – auf Wunsch bringen wir Ihr Auto vor die Tür.")],
    "service": [("Termin anfragen", "Online, telefonisch oder per WhatsApp – zu einer Zeit, die Ihnen passt."),
                ("Auto bringen oder abholen lassen", "Schlüssel auch nach Feierabend abgeben – oder wir holen das Auto im Umkreis von 30 km ab."),
                ("Wir erledigen alles", "Sie müssen nicht warten. Wenn mehr zu tun ist als besprochen, rufen wir Sie vorher an."),
                ("Weiterfahren", "Bezahlen per EC-Karte, Kreditkarte, Rechnung oder bar – und los.")],
    "classic": [("Kennenlernen", "Wir sehen uns Ihr Fahrzeug gemeinsam an und sprechen über Ihre Wünsche."),
                ("Bestandsaufnahme & Plan", "Was ist nötig, was ist möglich – und in welcher Reihenfolge."),
                ("Restaurierung", "Mit Geduld und Handwerk, jeder größere Schritt wird mit Ihnen abgestimmt."),
                ("Übergabe", "Ihr Klassiker – bereit für die nächste Ausfahrt.")],
}


def steps_for(slug):
    kind = svc_kind(slug)
    return STEPS_HTML if kind == "damage" else _steps(STEPS_BY_KIND[kind])


# Einheitliche Ansprache mit "Sie" (einige Shopify-Texte duzen)
DU_SIE = [
    ("wo du danach hingehst.", "wo Sie danach hingehen."), ("bekommst du keine schnelle", "bekommen Sie keine schnelle"),
    ("dass du später nicht mehr siehst", "dass Sie später nicht mehr sehen"), ("Sicherheitsstruktur deines Autos", "Sicherheitsstruktur Ihres Autos"),
    ("Musst du auch nicht.", "Müssen Sie auch nicht."), ("Du bringst das Auto.", "Sie bringen das Auto."),
    ("lackieren wir dein Fahrzeug", "lackieren wir Ihr Fahrzeug"), ("Du siehst später nicht", "Sie sehen später nicht"),
    ("Du bist unsicher, ob sich eine Reparatur lohnt?<br/>Dann komm vorbei.", "Sie sind unsicher, ob sich eine Reparatur lohnt?<br/>Dann kommen Sie vorbei."),
    ("Wir schauen uns dein Fahrzeug an", "Wir schauen uns Ihr Fahrzeug an"), ("sagen dir ehrlich", "sagen Ihnen ehrlich"), ("sagen dir offen", "sagen Ihnen offen"),
    ("– deine Karosserie-Werkstatt", "– Ihre Karosserie-Werkstatt"), ("– deine Werkstatt", "– Ihre Werkstatt"), ("– dein Reifenservice", "– Ihr Reifenservice"),
    ("bekommst du professionelle", "bekommen Sie professionelle"), ("Du erkennst keinen Unterschied mehr.", "Sie erkennen keinen Unterschied mehr."),
    ("exakt deinem Fahrzeug an", "exakt Ihrem Fahrzeug an"), ("ist dein Fahrzeug schneller wieder einsatzbereit, als du denkst", "ist Ihr Fahrzeug schneller wieder einsatzbereit, als Sie denken"),
    ("dass dein Auto einmal", "dass Ihr Auto einmal"),
    ("Du bist unsicher, ob sich eine Lackierung lohnt?<br/>Komm kurz vorbei", "Sie sind unsicher, ob sich eine Lackierung lohnt?<br/>Kommen Sie kurz vorbei"),
    ("und geben dir sofort", "und geben Ihnen sofort"), ("als du denkst", "als Sie denken"), ("Das bedeutet für dich:", "Das bedeutet für Sie:"),
    ("Oft ist dein Auto", "Oft ist Ihr Auto"), ("exakt an dein Fahrzeug an", "exakt an Ihr Fahrzeug an"),
    ("Du musst keinen Termin machen.<br/>Komm einfach kurz vorbei – wir begutachten dein Fahrzeug kostenlos und sagen dir sofort",
     "Sie müssen keinen Termin machen.<br/>Kommen Sie einfach kurz vorbei – wir begutachten Ihr Fahrzeug kostenlos und sagen Ihnen sofort"),
    ("Wir reinigen dein Fahrzeug nicht einfach", "Wir reinigen Ihr Fahrzeug nicht einfach"), ("Du steigst ein und merkst sofort", "Sie steigen ein und merken sofort"),
    ("Dann sagen wir dir das ehrlich.", "Dann sagen wir Ihnen das ehrlich."), ("ohne dass du eine zweite Werkstatt suchen musst", "ohne dass Sie eine zweite Werkstatt suchen müssen"),
    ("Du bist dir unsicher, ob sich eine Aufbereitung lohnt?<br/>Komm kurz vorbei.", "Sie sind unsicher, ob sich eine Aufbereitung lohnt?<br/>Kommen Sie kurz vorbei."),
    ("Wir wechseln. Du fährst weiter.", "Wir wechseln. Sie fahren weiter."), ("bekommst du schnellen", "bekommen Sie schnellen"),
    ("dass dein Fahrzeug sicher", "dass Ihr Fahrzeug sicher"), ("Du gibst das Auto ab", "Sie geben das Auto ab"), ("Wir lagern deine Reifen", "Wir lagern Ihre Reifen"),
    ("stehen deine Räder bei deinem Termin", "stehen Ihre Räder bei Ihrem Termin"), ("sagen wir dir ehrlich", "sagen wir Ihnen ehrlich"),
    ("– du kannst jederzeit", "– Sie können jederzeit"), ("Melde dich frühzeitig – dann bist du rechtzeitig", "Melden Sie sich frühzeitig – dann sind Sie rechtzeitig"),
    ("Komm einfach vorbei", "Kommen Sie einfach vorbei"), ("Komm kurz vorbei", "Kommen Sie kurz vorbei"), ("Melde dich bei uns", "Melden Sie sich bei uns"),
]

# FAQ für Leistungsseiten aus dem Shop, die noch keine Fragen hatten
SERVICE_FAQ = {
    "karosserie": [
        ("Lohnt sich die Reparatur noch?", "Das entscheidet sich am Fahrzeug. Wir begutachten den Schaden, erstellen innerhalb von 24 Stunden einen Kostenvoranschlag und sagen Ihnen ehrlich, ob sich die Reparatur lohnt."),
        ("Werden Sensoren und Assistenzsysteme berücksichtigt?", "Ja. Wir reparieren nach Herstellervorgaben – dazu gehört, dass Sensoren, Kameras und Assistenzsysteme im Reparaturbereich berücksichtigt und geprüft werden."),
        ("Rechnen Sie direkt mit der Versicherung ab?", "Ja. Wir rechnen direkt mit der Versicherung ab und stimmen uns bei Bedarf mit dem Gutachter ab."),
        ("Bekomme ich einen Ersatzwagen?", "Ja, für die Dauer der Reparatur. Auf Wunsch holen wir Ihr Fahrzeug auch ab und bringen es zurück."),
        ("Reparieren Sie auch Elektro- und Hybridfahrzeuge?", "Ja. Karosserie- und Unfallreparaturen führen wir auch an Elektro- und Hybridautos durch – nach Herstellervorgaben."),
    ],
    "lackierarbeiten": [
        ("Sieht man den Unterschied zum Originallack?", "Unser Anspruch ist: nein. Wir messen den Farbton digital, mischen den Lack passend an und lackieren in der staubfreien Lackierkabine. Wo nötig, werden angrenzende Flächen beilackiert, damit der Übergang unsichtbar bleibt."),
        ("Teillackierung oder Komplettlackierung?", "Meist reicht es, die beschädigten Teile zu lackieren. Was das kostet, zeigt unser Ratgeber <a href=\"auto-lackieren-kosten.html\">Auto lackieren: Kosten &amp; Beispiele</a>."),
        ("Wie lange dauert eine Lackierung?", "Das hängt vom Umfang ab. Kleine Spot Repairs gehen oft schnell, Teillackierungen dauern meist einige Tage. Den genauen Zeitrahmen nennen wir Ihnen mit dem Kostenvoranschlag."),
        ("Wann sollte ich mit einem Lackschaden kommen?", "Möglichst bald. Liegt das Blech frei, kann Rost entstehen – dann wird die Reparatur aufwendiger."),
    ],
    "kleinschaden": [
        ("Was zählt als Kleinschaden?", "Typisch sind Parkrempler, Kratzer, kleine Dellen, Schrammen an der Stoßstange oder Steinschläge – Schäden, bei denen keine tragenden Teile betroffen sind."),
        ("Soll ich den Kleinschaden über die Versicherung abrechnen?", "Bei kleinen Schäden ist Selbstzahlen oft günstiger, weil sonst eine Rückstufung droht. Wir beraten Sie gern – mehr im Ratgeber <a href=\"unfall-oder-kratzer.html\">Unfall oder Kratzer – wer zahlt?</a>"),
        ("Muss das Teil neu lackiert werden?", "Nicht immer. Viele Dellen lassen sich per <a href=\"smartrepair.html\">Smart Repair</a> ohne Lackieren entfernen; kleine Lackschäden reparieren wir punktuell per Spot Repair."),
    ],
    "fahrzeugaufbereitung": [
        ("Was ist der Unterschied zur Waschanlage?", "Eine Aufbereitung reinigt nicht nur, sie bearbeitet: Lack wird dekontaminiert und poliert, der Innenraum tiefengereinigt. Das Ergebnis geht weit über eine Wäsche hinaus."),
        ("Kann ich nur innen oder nur außen buchen?", "Ja. Sie können zum Beispiel nur die <a href=\"innenraumaufbereitung.html\">Innenraumaufbereitung</a> oder nur die <a href=\"lackaufbereitung.html\">Lackaufbereitung</a> buchen – oder beides kombinieren."),
        ("Lohnt sich eine Aufbereitung vor dem Verkauf?", "Häufig ja. Ein gepflegtes Fahrzeug macht einen besseren ersten Eindruck und lässt sich leichter und oft zu einem besseren Preis verkaufen."),
    ],
    "reifenservice": [
        ("Lagern Sie meine Reifen ein?", "Ja. Wir lagern Ihre Reifen oder Kompletträder fachgerecht ein – zum nächsten Wechsel stehen sie bereit."),
        ("Wann sollte ich die Reifen wechseln?", "Als Faustregel gilt „von O bis O“: Winterreifen von Oktober bis Ostern. Entscheidend ist aber das Wetter – bei Glätte, Schnee oder Matsch sind Winterreifen Pflicht."),
        ("Brauche ich einen Termin?", "Ja, am einfachsten online. Gerade zum Saisonwechsel sind Termine schnell vergeben – buchen Sie frühzeitig."),
    ],
}


def faq_section(qa):
    rows = "".join(f'<details><summary><span>{esc(q)}</span></summary><div class="rte"><p>{a}</p></div></details>' for q, a in qa)
    return f'''<section class="sec" style="padding:70px 0">
  <div class="page-width"><div class="faq"><h2 class="sec-head">Häufige Fragen</h2>{rows}</div></div>
</section>'''


def tidy_service(slug, body_html):
    """Sie-Ansprache, weniger wiederholte Buchungsbuttons im Fließtext, fehlende FAQ ergänzen."""
    for old, new in DU_SIE:
        body_html = body_html.replace(old, new)
    m = re.search(r"<section.*?</section>", body_html, re.S)
    head, rest = body_html[:m.end()], body_html[m.end():]
    rest = re.sub(r'<a class="btn [^"]*" href="' + re.escape(BOOKING) + r'"[^>]*>Termin anfragen</a>', "", rest)
    rest = re.sub(r'<div class="btns">\s*</div>', "", rest)
    if slug in SERVICE_FAQ:
        rest += faq_section(SERVICE_FAQ[slug])
    return head + rest


# Eigene Inhalte je Ort (gegen doppelte Inhalte, für lokale Suche)
CITY = {
    "sonneberg": {"time": "mitten in Sonneberg", "places": ["Sonneberg", "Föritztal", "Neuhaus-Schierschnitz", "Judenbach", "Steinach", "Lauscha", "Schalkau"],
        "text": "Unsere Werkstatt liegt in der An der Lehmgrube 3 – für Sonneberger nur ein paar Minuten. Karosserie, Lack und Aufbereitung passieren hier unter einem Dach.",
        "faq": [("Wo genau finde ich Ihre Werkstatt in Sonneberg?", "In der An der Lehmgrube 3, 96515 Sonneberg. Geöffnet Montag bis Donnerstag 08:00–17:00 Uhr und Freitag 08:00–14:30 Uhr."),
                ("Kann ich in Sonneberg einfach ohne Termin vorbeikommen?", "Ja, für eine erste Einschätzung gern. Für die Reparatur vereinbaren wir einen Termin – am schnellsten online."),
                ("Holen Sie mein Auto in Sonneberg auch zu Hause ab?", "Ja, mit unserem Hol- und Bringservice holen wir Ihr Fahrzeug ab und bringen es nach der Reparatur zurück.")]},
    "neustadt": {"time": "etwa 10 Minuten", "places": ["Neustadt bei Coburg", "Wildenheid", "Fürth am Berg", "Ebersdorf bei Coburg", "Sonnefeld"],
        "text": "Von Neustadt bei Coburg sind Sie in rund zehn Minuten bei uns in Sonneberg – oder Sie lassen sich das Fahren ganz sparen: Wir holen Ihr Auto ab.",
        "faq": [("Wie weit ist es von Neustadt bei Coburg zu Ihnen?", "Je nach Verkehr etwa zehn Minuten – unsere Werkstatt liegt in der An der Lehmgrube 3 in Sonneberg."),
                ("Holen Sie mein Auto in Neustadt bei Coburg ab?", "Ja, mit unserem Hol- und Bringservice. Geben Sie es einfach bei der Buchung an.")]},
    "coburg": {"time": "etwa 25 Minuten", "places": ["Coburg", "Rödental", "Dörfles-Esbach", "Ahorn", "Lautertal", "Untersiemau", "Meeder"],
        "text": "Von Coburg aus sind Sie in rund 25 Minuten bei uns. Noch bequemer: Wir holen Ihr Auto in Coburg ab, Sie fahren solange mit dem Ersatzwagen – und bekommen Ihr Fahrzeug repariert und gereinigt zurück.",
        "faq": [("Lohnt sich der Weg von Coburg nach Sonneberg?", "Ja – und oft müssen Sie ihn gar nicht selbst fahren. Mit unserem Hol- und Bringservice holen wir Ihr Auto ab, und Sie bleiben mit dem Ersatzwagen mobil."),
                ("Darf ich als Coburger nach einem Unfall eine Werkstatt in Sonneberg wählen?", "Ja. Bei einem Haftpflichtschaden können Sie die Werkstatt grundsätzlich frei wählen – wir rechnen direkt mit der Versicherung ab."),
                ("Muss ich für den Kostenvoranschlag extra aus Coburg kommen?", "Nein. Schicken Sie uns Fotos über „Schaden per Foto melden“ oder per WhatsApp – Sie erhalten den Kostenvoranschlag innerhalb von 24 Stunden.")]},
    "kronach": {"time": "etwa 35 Minuten", "places": ["Kronach", "Küps", "Mitwitz", "Stockheim", "Pressig", "Steinbach am Wald", "Wilhelmsthal"],
        "text": "Von Kronach brauchen Sie rund 35 Minuten bis zu uns nach Sonneberg. Damit sich der Weg für Sie nicht wie ein Weg anfühlt, holen wir Ihr Auto auf Wunsch ab und bringen es repariert zurück.",
        "faq": [("Wie weit ist es von Kronach zu Ihnen?", "Je nach Strecke und Verkehr etwa 35 Minuten bis in die An der Lehmgrube 3 in Sonneberg – und Kronach liegt in unserem Hol- und Bringservice-Gebiet."),
                ("Holen Sie mein Auto in Kronach ab?", "Ja, mit unserem Hol- und Bringservice holen wir Ihr Fahrzeug im Raum Kronach ab und bringen es nach der Reparatur zurück – sprechen Sie uns bei der Buchung darauf an."),
                ("Muss ich für den Kostenvoranschlag extra herfahren?", "Nein. Fotos über „Schaden per Foto melden“ oder WhatsApp genügen – Sie bekommen den Kostenvoranschlag innerhalb von 24 Stunden."),
                ("Bekomme ich als Kunde aus Kronach einen Ersatzwagen?", "Ja. Damit Sie mobil bleiben, stellen wir Ihnen für die Dauer der Reparatur einen Ersatzwagen – auch mit Hund, nach Absprache.")]},
    "roedental": {"time": "etwa 20 Minuten", "places": ["Rödental", "Oeslau", "Einberg", "Mönchröden", "Neustadt bei Coburg"],
        "text": "Von Rödental sind Sie in rund 20 Minuten bei uns in Sonneberg – oder wir holen Ihr Auto mit dem Hol- und Bringservice ab.",
        "faq": [("Wie weit ist es von Rödental zu Ihnen?", "Je nach Verkehr etwa 20 Minuten bis in die An der Lehmgrube 3 in Sonneberg.")]},
    "bamberg": {"time": "etwa eine Stunde", "places": ["Bamberg", "Lichtenfels", "Bad Staffelstein", "Ebensfeld"],
        "text": "Von Bamberg sind es über die A73 rund eine Stunde. Viele Kunden schicken uns zuerst Fotos und bekommen innerhalb von 24 Stunden einen Kostenvoranschlag – so wissen Sie vorher genau, woran Sie sind.",
        "faq": [("Lohnt sich der Weg von Bamberg?", "Gerade bei größeren Reparaturen, Lackierungen oder Klassikern ja. Schicken Sie uns vorab Fotos – Sie bekommen den Kostenvoranschlag in 24 Stunden.")]},
}

# Kronach: komplett eigener Text statt der Sonneberg-Vorlage
KRONACH_BODY = [
    ("Unfall oder Lackschaden im Raum Kronach?", "<p>Ob Parkrempler in der Kronacher Innenstadt, Wildunfall im Frankenwald oder Steinschlag auf der B173: Ein Schaden kommt immer ungelegen. Bei Täubert bekommen Sie Karosserie, Lack und Versicherungsabwicklung aus einer Hand – mit Ersatzwagen und Hol- und Bringservice.</p>"),
    ("Was wir für Kunden aus Kronach übernehmen", "<ul><li>Unfallinstandsetzung nach Herstellervorgaben</li><li>Lackierung mit digitaler Farbtonmessung in der eigenen Lackierkabine</li><li>Smart Repair für Dellen und Parkschäden</li><li>Wildschaden und Hagelschaden – Abstimmung mit der Teilkasko</li><li>Fahrzeugaufbereitung, Unterbodenschutz und Leasingrückgabe</li></ul>"),
    ("Wildunfall – was die Versicherung zahlt", "<p>Wildunfälle mit Haarwild wie Reh oder Wildschwein sind in der Regel über die Teilkasko versichert. Wichtig: Polizei oder Jagdpächter informieren und eine Wildunfallbescheinigung geben lassen. Den Rest stimmen wir mit Ihrer Versicherung ab. Mehr in der Checkliste <a href=\"unfall-was-tun.html\">Unfall – was jetzt zu tun ist</a>.</p>"),
]


def city_block(slug):
    c = CITY.get(slug)
    if not c:
        return ""
    name = LOCATIONS[slug][1]
    places = ", ".join(c["places"])
    return f'''<section class="city">
  <div class="page-width city-inner">
    <div class="city-text"><p class="eyebrow">Für Kunden aus {esc(name)}</p><h2>So einfach geht's aus {esc(name)}</h2><p>{esc(c["text"])}</p>
    <p class="city-places">Wir sind für Sie da in {esc(places)} und Umgebung.</p></div>
    <ul class="city-facts">
      <li><strong>{esc(c["time"])}</strong><span>bis zu unserer Werkstatt</span></li>
      {'<li><strong>Hol &amp; Bring</strong><span>im Umkreis von 30 km</span></li>' if slug != "bamberg" else '<li><strong>Fotos</strong><span>Einschätzung ohne Anfahrt</span></li>'}
      <li><strong>24 h</strong><span>Kostenvoranschlag per Foto</span></li>
      <li><strong>Ersatzwagen</strong><span>Mobil während der Reparatur</span></li>
    </ul>
  </div>
</section>'''


def city_faq(slug):
    c = CITY.get(slug)
    return faq_section([(q, esc(a)) for q, a in c["faq"]]) if c else ""


def city_ld(slug):
    name = LOCATIONS[slug][1]
    data = {"@context": "https://schema.org", "@type": "AutoBodyShop", "name": "Täubert Karosserie & Lack GmbH", "url": f"{DOMAIN}/{slug}.html",
            "telephone": "+49 3675 4289606", "address": {"@type": "PostalAddress", "streetAddress": "An der Lehmgrube 3", "postalCode": "96515", "addressLocality": "Sonneberg", "addressCountry": "DE"},
            "areaServed": [{"@type": "City", "name": n} for n in CITY.get(slug, {}).get("places", [name])]}
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + "</script>"


CITY_CSS = """
  .city { padding: 110px 0; border-bottom: 1px solid var(--line); }
  .city-inner { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 64px; align-items: start; }
  .city h2 { font-size: clamp(30px, 3.4vw, 50px); line-height: 1.02; margin-bottom: 18px; }
  .city-text > p:not(.eyebrow) { color: #555; font-size: 17px; max-width: 560px; }
  .city-places { margin-top: 14px; font-size: 15px !important; }
  .city-facts { list-style: none; display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--black); }
  .city-facts li { padding: 24px 16px 24px 0; border-bottom: 1px solid var(--line); }
  .city-facts strong { display: block; font-family: var(--f-display); font-weight: 400; text-transform: uppercase; font-size: clamp(18px, 1.6vw, 24px); }
  .city-facts span { display: block; margin-top: 6px; font-size: 14px; color: #555; }
  @media (max-width: 760px) { .city { padding: 64px 0; } .city-inner { grid-template-columns: 1fr; gap: 32px; } }
"""


VISIT_HEADS = ("Kommen Sie einfach vorbei", "Jetzt Termin sichern", "Einfach vorbeikommen")


def with_service_frame(slug, name, body_html):
    """Einheitlicher Aufbau jeder Leistungsseite:
    Startbild → Brotkrumen + Kurzleiste → Einleitung (groß) → Inhalt → Ablauf → Häufige Fragen.
    Doppelte Ablauf- und „Kommen Sie vorbei“-Blöcke fallen weg (der Buchungsblock am Ende deckt das ab)."""
    m = re.search(r"<section.*?</section>", body_html, re.S)
    head, rest = body_html[:m.end()], body_html[m.end():]
    secs = re.findall(r"<section\b.*?</section>", rest, re.S)
    faq = [x for x in secs if 'class="faq"' in x]
    out = []
    for i, x in enumerate(secs):
        if x in faq:
            continue
        if 'rich-sub' in x and any(h in x for h in VISIT_HEADS):
            continue
        if i == 0 and 'rich-sub' in x and "<h2" not in x:   # Einleitungstext ohne Überschrift
            x = x.replace('class="sec rich-sub', 'class="sec rich-sub svc-lead', 1)
            x = x.replace('<div class="rte">', f'<p class="eyebrow">{esc(name)} bei Täubert</p><div class="rte">', 1)
            x = re.sub(r"(?:<br/?>\s*)+", " ", x)   # Shopify-Zeilenumbrüche: ruhiger Fließtext
            x = re.sub(r'\n?<div class="btns">.*?</div>', "", x, count=1, flags=re.S)   # Knöpfe stehen direkt darüber schon
        x = x.replace('<a class="btn btn-dark" href="contact.html">Kontakt aufnehmen</a>', f'<a class="btn btn-dark" href="{BOOKING}">Termin anfragen</a>')
        out.append(x)
    own_steps = re.search(r"<h2[^>]*>[^<]*(Wie läuft|So läuft)[^<]*ab", rest)
    return head + service_intro(slug, name) + "\n".join(out) + ("" if own_steps else steps_for(slug)) + "\n".join(faq)



CAT_INTRO = {
    "Unfall & Versicherung": "Ein Ansprechpartner von der Schadensaufnahme bis zur Abrechnung mit der Versicherung. Sie bringen das Auto – wir regeln den Rest.",
    "Karosserie & Lack": "Richtbank, Lackierkabine und digitale Farbtonmessung unter einem Dach. Man sieht später nicht, wo der Schaden war.",
    "Aufbereitung & Pflege": "Vom Unterboden bis zum Dachhimmel: Lack, Innenraum, Scheinwerfer und Versiegelung – damit Ihr Fahrzeug gepflegt aussieht und lange hält.",
    "Räder & Reifen": "Neue Reifen bestellen, wechseln und einlagern – und beschädigte Felgen reparieren.",
    "Service": "HU/AU, Leasingrückgabe und Firmenfahrzeuge – unkompliziert und termingenau.",
    "Klassiker": "Restaurierung mit Geduld, Handwerk und Respekt vor dem Original.",
}
# Schnellauswahl: Anliegen des Kunden -> passende Leistung
FINDER = [
    ("Ich hatte einen Unfall", "unfall"), ("Ich habe eine Delle", "smartrepair"),
    ("Mein Lack ist zerkratzt", "kratzer"), ("Die Stoßstange ist beschädigt", "stossstange-reparieren"),
    ("Mein Auto hat Hagelschaden", "hagelschaden"), ("Mein Leasingauto geht zurück", "leasingrueckgabe"),
    ("Mein Lack ist stumpf", "lackaufbereitung"), ("Der Innenraum ist verschmutzt", "innenraumaufbereitung"),
    ("Mein Unterboden rostet", "unterbodenschutz"), ("Ich möchte neu lackieren", "lackierarbeiten"),
    ("Mein Auto muss zum TÜV", "hu-au"), ("Ich brauche neue Reifen", "reifen-kaufen"),
    ("Meine Felge ist beschädigt", "felgenreparatur"), ("Ich brauche einen Lackstift", "lackstift"),
]


def tile_grid(items):
    n = len(items)
    cls = {4: " c4", 1: " c1", 5: " c5"}.get(n, " m2" if n > 5 and n % 3 == 2 else " m1" if n > 5 and n % 3 == 1 else "")
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
    <div class="btns"><a class="btn btn-light" href="{BOOKING}">Termin anfragen</a><a class="btn btn-outline-light" href="schaden-melden.html">Schaden per Foto melden</a></div>
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
{care_html()}
<section class="sec" style="padding:90px 0 0">
  <div class="page-width">
    <div class="cat-top" style="margin-bottom:24px"><h2 class="h-4">Ratgeber</h2></div>
    <div class="svc-grid">{service_cards([(g, guide_meta(g)[0], guide_meta(g)[2]) for g in GUIDES])}</div>
  </div>
</section>
<section class="sec" style="padding:70px 0 90px">
  <div class="page-width"><div style="max-width:860px">
    <h2 class="h-4">Für Kunden aus der Region</h2>
    <p style="margin-top:12px;color:#555">Unsere Werkstatt liegt in der An der Lehmgrube 3 in Sonneberg – wenige Minuten von Neustadt bei Coburg. Auf Wunsch holen wir Ihr Fahrzeug ab.</p>
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
    <form class="damage-form" name="schadensmeldung" method="POST" action="formular.php" enctype="multipart/form-data">
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
        <label class="f consent"><input type="checkbox" name="ersatzwagen" value="ja"><span>Ich brauche einen Ersatzwagen</span></label>
        <label class="f consent"><input type="checkbox" name="holservice" value="ja"><span>Hol- und Bringservice gewünscht</span></label>
        <label class="f consent"><input type="checkbox" name="einwilligung" required><span>Ich bin einverstanden, dass meine Angaben und Fotos zur Bearbeitung der Anfrage gespeichert werden (siehe <a href="datenschutz.html">Datenschutz</a>). *</span></label>
      </div>
      <div class="btns"><button class="btn btn-dark" type="submit">Schaden senden</button></div>
      <p class="form-status" role="status"></p>
    </form>
    <div class="rte" style="margin-top:30px"><p>Lieber direkt? <a href="https://wa.me/4936754289606" target="_blank" rel="noopener">Fotos per WhatsApp schicken</a> oder anrufen: <a href="tel:+4936754289606">03675 4289606</a>.</p></div>
  </div></div>
</section>"""

THANKS = f"""<section class="sec" style="padding:100px 0">
  <div class="page-width"><div class="rich-inner" style="max-width:640px;margin:0 auto;text-align:center">
    <h1 class="h-6">Danke – Ihre Meldung ist da.</h1>
    <div class="rte"><p>Wir sehen uns die Fotos an und melden uns schnellstmöglich bei Ihnen. Eilt es? Rufen Sie uns an: <a href="tel:+4936754289606">03675 4289606</a>.</p></div>
    <div class="btns" style="justify-content:center"><a class="btn btn-dark" href="index.html">Zur Startseite</a><a class="btn btn-outline-dark" href="{BOOKING_URL}">Termin anfragen</a></div>
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
  // Formulare: Fotos verkleinern und an formular.php (IONOS) senden
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
      const r = await fetch(form.getAttribute('action'), { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      const res = await r.json().catch(() => ({}));
      if (!r.ok || !res.ok) throw new Error(res.message || r.status);
      location.href = form.dataset.thanks || 'danke.html';
    } catch (err) {
      console.warn('Schadensmeldung konnte nicht gesendet werden:', err);
      btn.disabled = false;
      const v = n => (form.elements[n] || {}).value || '';
      const skip = ['form-name', 'firma', 'einwilligung'];
      const lines = [...form.elements].filter(el => el.name && !skip.includes(el.name) && el.type !== 'file' && el.type !== 'submit' && (el.type !== 'checkbox' || el.checked) && el.value)
        .map(el => (el.closest('label') ? el.closest('label').textContent.split('\n')[0].replace('*', '').trim() : el.name) + ': ' + (el.type === 'checkbox' ? 'ja' : el.value));
      const msg = `${form.dataset.title || 'Schadensmeldung'}\n` + lines.join('\n');
      say('Das Senden hat gerade nicht geklappt. Schicken Sie Ihre Angaben einfach per WhatsApp oder E-Mail – die Nachricht ist schon vorbereitet, Fotos oder Unterlagen hängen Sie dort an.', true);
      status.insertAdjacentHTML('beforeend', '<span class="btns" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:12px">'
        + '<a class="btn btn-dark" target="_blank" rel="noopener" href="https://wa.me/4936754289606?text=' + encodeURIComponent(msg) + '">Per WhatsApp senden</a>'
        + '<a class="btn btn-outline-dark" href="mailto:hallo@taeubert-karosserie-lack.de?subject=' + encodeURIComponent(form.dataset.title || 'Schadensmeldung') + '&body=' + encodeURIComponent(msg) + '">Per E-Mail senden</a></span>');
    }
  }));
"""


BOOKING_PAGE = f"""<section class="sec booking-page" style="padding:50px 0 30px">
  <div class="page-width">
    <h1 class="overline">Termin anfragen</h1>
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
      <a class="btn btn-dark" href="{BOOKING_URL}">Wunschtermin anfragen</a>
      <p class="book-note">Lieber ohne externes Buchungstool? <a href="#wunschtermin">Wunschtermin direkt hier anfragen ↓</a></p>
    </div>
    <div class="book-card" id="rueckruf">
      <p class="eyebrow">Option 2 · Rückruf</p>
      <h2>Wir rufen Sie an</h2>
      <p>Name und Telefonnummer reichen – wir melden uns und machen den Termin mit Ihnen aus.</p>
      <form class="damage-form" name="rueckruf" method="POST" action="formular.php" data-title="Rückrufwunsch">
        <input type="hidden" name="form-name" value="rueckruf">
        <p class="hp"><label>Nicht ausfüllen: <input name="firma" tabindex="-1" autocomplete="off"></label></p>
        <div class="mail-form">
          <label class="f half">Name *<input name="name" autocomplete="name" required></label>
          <label class="f half">Telefon *<input name="telefon" type="tel" autocomplete="tel" required></label>
          <label class="f half">Worum geht es?
            <select name="schaden"><option>Unfallschaden</option><option>Lack / Kratzer / Delle</option><option>Reifenwechsel / neue Reifen</option><option>HU/AU (TÜV)</option><option>Felgenreparatur</option><option>Lackstift</option><option>Fahrzeugaufbereitung</option><option>Leasingrückgabe</option><option>Sonstiges</option></select>
          </label>
          <label class="f half">Wann erreichen wir Sie?
            <select name="nachricht"><option>Egal – so bald wie möglich</option><option>Vormittags</option><option>Mittags</option><option>Nachmittags</option></select>
          </label>
          <label class="f consent"><input type="checkbox" name="ersatzwagen" value="ja"><span>Ich brauche einen Ersatzwagen</span></label>
          <label class="f consent"><input type="checkbox" name="holservice" value="ja"><span>Hol- und Bringservice gewünscht</span></label>
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
</section>
<section class="wish" id="wunschtermin">
  <div class="page-width wish-inner">
    <div class="wish-text">
      <p class="eyebrow">Wunschtermin</p>
      <h2>Termin direkt hier anfragen.</h2>
      <p>Datum und Tageszeit wählen, Leistung angeben – wir bestätigen Ihren Termin persönlich per Telefon oder E-Mail, meist noch am selben Werktag.</p>
      <ul class="apply-steps"><li><strong>01</strong> Wunschtermin wählen</li><li><strong>02</strong> Wir bestätigen persönlich</li><li><strong>03</strong> Auto bringen – oder abholen lassen</li></ul>
      <p class="wish-hours">Mo–Do 08:00–17:00 Uhr · Fr 08:00–14:30 Uhr</p>
    </div>
    <form class="damage-form" name="wunschtermin" method="POST" action="formular.php" data-title="Wunschtermin" data-thanks="danke-termin.html">
      <input type="hidden" name="form-name" value="wunschtermin">
      <p class="hp"><label>Nicht ausfüllen: <input name="firma" tabindex="-1" autocomplete="off"></label></p>
      <div class="mail-form">
        <label class="f">Leistung *
          <select name="leistung" id="wish-service" required><option value="">Bitte wählen</option>{"".join(f"<option>{esc(n)}</option>" for _, n, _ in all_services())}<option>Lackierung (Konfigurator)</option><option>Sonstiges</option></select>
        </label>
        <label class="f half">Wunschdatum *<input name="datum" id="wish-date" type="date" required></label>
        <label class="f half">Tageszeit
          <select name="tageszeit"><option>Egal</option><option>Vormittags (08–12 Uhr)</option><option>Nachmittags (12–17 Uhr)</option></select>
        </label>
        <label class="f half">Ausweichdatum <small>(optional)</small><input name="ausweichdatum" id="wish-date2" type="date"></label>
        <label class="f half">Fahrzeug<input name="fahrzeug" placeholder="z. B. VW Golf 7"></label>
        <label class="f half">Name *<input name="name" autocomplete="name" required></label>
        <label class="f half">Telefon *<input name="telefon" type="tel" autocomplete="tel" required></label>
        <label class="f">E-Mail<input name="email" type="email" autocomplete="email"></label>
        <label class="f">Anmerkung<textarea name="nachricht" id="wish-note" rows="3" placeholder="Was soll gemacht werden?"></textarea></label>
        <label class="f consent"><input type="checkbox" name="ersatzwagen" value="ja"><span>Ich brauche einen Ersatzwagen</span></label>
        <label class="f consent"><input type="checkbox" name="holservice" value="ja"><span>Hol- und Bringservice gewünscht (bis 30 km)</span></label>
        <label class="f consent"><input type="checkbox" name="einwilligung" required><span>Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Terminanfrage gespeichert werden (siehe <a href="datenschutz.html">Datenschutz</a>). *</span></label>
      </div>
      <button class="btn btn-dark" type="submit">Wunschtermin anfragen</button>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>"""

WISH_JS = r"""
  // Wunschtermin: frühestens morgen, nur Werktage, Vorbelegung aus dem Link (z. B. vom Konfigurator)
  (function () {
    var d1 = document.getElementById('wish-date'); if (!d1) return;
    var d2 = document.getElementById('wish-date2'), t = new Date(); t.setDate(t.getDate() + 1);
    var min = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
    [d1, d2].forEach(function (d) { d.min = min; d.addEventListener('input', function () {
      var day = d.value ? new Date(d.value + 'T12:00').getDay() : 1;
      d.setCustomValidity(day === 0 || day === 6 ? 'Samstag und Sonntag ist geschlossen – bitte einen Werktag wählen.' : '');
    }); });
    var q = new URLSearchParams(location.search), sel = document.getElementById('wish-service');
    if (q.get('leistung')) { var want = q.get('leistung').toLowerCase(), o = [].find.call(sel.options, function (x) { return x.text.toLowerCase() === want; }) || [].find.call(sel.options, function (x) { return x.text.toLowerCase().indexOf(want) === 0; }); if (o) sel.value = o.text; }
    if (q.get('notiz')) document.getElementById('wish-note').value = q.get('notiz');
    if (q.get('datum') && q.get('datum') >= min) { d1.value = q.get('datum'); d1.dispatchEvent(new Event('input')); }
    if (q.get('leistung') || q.get('datum')) document.getElementById('wunschtermin').scrollIntoView();
  })();
"""

BOOKING_CSS = """
  .wish { padding: 100px 0; background: var(--grey); scroll-margin-top: 120px; }
  .wish-inner { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 64px; align-items: start; }
  .wish h2 { font-size: clamp(32px, 3.8vw, 54px); line-height: 1.02; margin-bottom: 18px; }
  .wish-text > p { color: #555; font-size: 17px; max-width: 480px; }
  .wish .apply-steps { list-style: none; margin: 28px 0; border-top: 1px solid var(--black); max-width: 420px; }
  .wish .apply-steps li { padding: 16px 0; border-bottom: 1px solid var(--line); font-weight: 600; }
  .wish .apply-steps strong { font-size: 12px; letter-spacing: .2em; color: #6b6b6b; margin-right: 14px; }
  .wish-hours { font-size: 15px !important; }
  .wish form { background: var(--white); padding: 36px; min-width: 0; }
  .wish form .btn { margin-top: 18px; }
  .wish .f { min-width: 0; } .wish select, .wish input { width: 100%; max-width: 100%; }
  .wish input[type=checkbox] { width: auto; }
  @media (max-width: 900px) { .wish { padding: 64px 0; } .wish-inner { grid-template-columns: minmax(0, 1fr); gap: 36px; } .wish form { padding: 22px 16px; } }
  .book-note { font-size: 14px; color: #555; margin-top: 14px; }
  .book-note a { text-decoration: underline; text-underline-offset: 3px; color: var(--black); }
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
    <p class="sos-112-hint"><strong>Gibt es Verletzte?</strong> Dann zuerst: Notruf 112 wählen.</p>
    <div class="sos-call">
      <a class="btn btn-dark sos-112" href="tel:112">Notruf 112 wählen</a>
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
  .sos-112-hint { margin: 6px 0 18px; font-size: 17px; }
  .sos-call .sos-112 { background: #fff !important; color: #000 !important; border: 2px solid #000 !important; font-weight: 600; }
  .sos-call { display: flex; flex-wrap: wrap; gap: 10px; margin: 18px 0 14px; }
  .sos-list { list-style: none; counter-reset: sos; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
  .sos-list li { counter-increment: sos; position: relative; padding: 22px 22px 22px 70px; background: var(--grey); }
  .sos-list li::before { content: counter(sos); position: absolute; left: 22px; top: 18px; font-family: var(--f-display); font-size: 30px; color: var(--red); }
  .sos-list h2 { font-size: 19px; margin-bottom: 6px; }
  .sos-note { margin-top: 22px; font-size: 14px; color: #555; }
  .faq .cat-head { margin: 40px 0 6px; }
  .faq-more a { font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
"""


# Allgemeine Kundenfragen (nur bestätigte Angaben)
GENERAL_FAQ = [
    ("Termin & Kontakt", [
        ("Wie bekomme ich einen Termin?", "Am schnellsten über die <a href=\"https://terminbuchungtaeubert.de\">Online-Terminbuchung</a> – rund um die Uhr. Alternativ <a href=\"termin.html#rueckruf\">fordern Sie einen Rückruf an</a>, rufen uns an (03675 4289606) oder schreiben per WhatsApp."),
        ("Wann haben Sie geöffnet?", "Montag bis Donnerstag 08:00–17:00 Uhr, Freitag 08:00–14:30 Uhr. Samstag und Sonntag ist geschlossen."),
        ("Wo finde ich Sie?", "Täubert Karosserie &amp; Lack GmbH, An der Lehmgrube 3, 96515 Sonneberg. Kunden kommen auch aus Neustadt bei Coburg, Coburg, Rödental, Kronach und Bamberg. <a href=\"contact.html\">Anfahrt &amp; Kontakt</a>"),
        ("Kann ich einfach vorbeikommen?", "Ja. Wenn Sie unsicher sind, ob sich eine Reparatur lohnt, schauen wir uns Ihr Fahrzeug an und sagen Ihnen ehrlich, was Sinn macht. Mit Termin geht es für Sie am schnellsten."),
        ("Kann ich den Schaden per Foto oder WhatsApp schicken?", "Ja. Über <a href=\"schaden-melden.html\">Schaden per Foto melden</a> laden Sie ein paar Bilder hoch – oder schicken sie per WhatsApp an 03675 4289606. Wir melden uns mit einer ersten Einschätzung."),
        ("Welche Fotos brauchen Sie für eine Einschätzung?", "Am besten drei bis vier: eine Gesamtansicht des Fahrzeugs, den Schaden aus etwa zwei Metern und ein bis zwei Nahaufnahmen von schräg, damit Dellen sichtbar werden. Ein Foto vom Fahrzeugschein hilft bei der Teilebestellung."),
        ("Kann ich mein Auto nach Feierabend abgeben oder abholen?", "Ja. Sprechen Sie uns einfach an – dann vereinbaren wir die Schlüsselübergabe auch außerhalb der Öffnungszeiten."),
        ("Was soll ich zum Termin mitbringen?", "Fahrzeugschein, Fahrzeugschlüssel und – bei Versicherungsschäden – die Schadennummer, den Unfallbericht oder die Daten des Unfallgegners sowie ein vorhandenes Gutachten."),
    ]),
    ("Kosten & Kostenvoranschlag", [
        ("Wie schnell bekomme ich einen Kostenvoranschlag?", "Innerhalb von 24 Stunden. Schicken Sie uns dafür am besten ein paar Fotos über „Schaden per Foto melden“."),
        ("Kostet die Begutachtung etwas?", "Nein. Wir schauen uns den Schaden kostenlos an und geben Ihnen eine ehrliche Einschätzung, was nötig ist."),
        ("Was kostet meine Reparatur?", "Das hängt von Art und Größe des Schadens ab. Sie bekommen vorher einen klaren Kostenvoranschlag – ohne Überraschungen. Beispiele finden Sie im Ratgeber <a href=\"auto-lackieren-kosten.html\">Auto lackieren: Kosten &amp; Beispiele</a>."),
        ("Wie kann ich bezahlen?", "Mit EC-Karte, Kreditkarte, bar oder per Überweisung auf Rechnung. Bei Versicherungsschäden rechnen wir direkt mit der Versicherung ab."),
        ("Wird es am Ende teurer als besprochen?", "Grundlage ist der Kostenvoranschlag. Stellen wir bei der Reparatur einen versteckten Schaden fest, sprechen wir das vorher mit Ihnen ab – es wird nichts ohne Ihre Zustimmung gemacht."),
        ("Reparieren oder Teil tauschen – was ist günstiger?", "Oft ist Reparieren günstiger, etwa bei Dellen per Smart Repair oder bei Kunststoff-Stoßfängern. Ist ein Teil stark beschädigt, kann Tauschen sinnvoller sein. Wir rechnen beides ehrlich durch."),
    ]),
    ("Service rund um die Reparatur", [
        ("Rechnen Sie direkt mit der Versicherung ab?", "Ja. Wir rechnen direkt mit der Versicherung ab und stimmen uns mit dem Gutachter ab."),
        ("Welche Fahrzeuge reparieren Sie?", "PKW, Transporter, Firmenfahrzeuge, Elektro- und Hybridautos sowie Oldtimer – Marke egal."),
        ("Reparieren Sie auch Elektro- und Hybridautos?", "Ja. Unfallreparatur, Karosserie- und Lackarbeiten führen wir auch an Elektro- und Hybridfahrzeugen durch – nach Herstellervorgaben."),
        ("Wie erfahre ich, wann mein Auto fertig ist?", "Mit dem Kostenvoranschlag nennen wir Ihnen einen realistischen Zeitrahmen. Sobald Ihr Fahrzeug fertig ist, melden wir uns bei Ihnen."),
        ("Wird mein Auto nach der Reparatur gereinigt?", "Ja. Sie bekommen Ihr Fahrzeug geprüft und gereinigt zurück."),
        ("Kann ich mehrere Leistungen in einem Termin erledigen?", "Ja. Unfallreparatur, Lack, HU/AU, Reifen, Aufbereitung oder Unterbodenschutz – alles unter einem Dach. Sagen Sie uns bei der Buchung, was gemacht werden soll, dann planen wir es zusammen ein."),
        ("Wie erfahre ich, wie weit mein Auto ist?", "Rufen Sie uns an (03675 4289606) oder schreiben Sie per WhatsApp – wir geben Ihnen jederzeit Bescheid."),
        ("Arbeiten Sie auch für Firmenkunden?", "Ja. Firmenwagen, Transporter und ganze Flotten betreuen wir mit abgestimmten Terminen – mehr beim <a href=\"fuhrparkservice.html\">Fuhrparkservice</a>."),
        ("Welche Leistungen bieten Sie insgesamt an?", "Unfallreparatur, Karosserie, Lackierung, Smart Repair, Kratzer und Kleinschäden, Hagelschaden, HU/AU, Reifen und Felgenreparatur, Lackstifte, Fahrzeugaufbereitung, Keramikversiegelung, Unterbodenschutz inklusive Mike Sanders Versiegelung, Leasingrückgabe, Fuhrparkservice und Oldtimer-Restaurierung. <a href=\"leistungen.html\">Alle Leistungen ansehen</a>"),
    ]),
    ("Ersatzwagen & Hol- und Bringservice", [
        ("Bekomme ich einen Ersatzwagen?", "Ja. Damit Sie während der Reparatur mobil bleiben, stellen wir Ihnen einen Ersatzwagen zur Verfügung."),
        ("Wie buche ich den Ersatzwagen?", "Ganz einfach: Geben Sie bei der <a href=\"https://terminbuchungtaeubert.de\">Online-Terminbuchung</a> an, dass Sie einen Ersatzwagen brauchen, kreuzen Sie es beim <a href=\"termin.html#rueckruf\">Rückruf</a> oder bei der <a href=\"schaden-melden.html\">Schadensmeldung</a> an – oder sagen Sie es uns am Telefon: 03675 4289606."),
        ("Wie früh sollte ich den Ersatzwagen anfragen?", "Am besten direkt bei der Terminvereinbarung. Dann planen wir das Fahrzeug fest für Ihren Reparaturtermin ein."),
        ("Wer zahlt den Ersatzwagen?", "Hatten Sie einen unverschuldeten Unfall, übernimmt in der Regel die Versicherung des Unfallgegners die Kosten für ein Ersatzfahrzeug. In allen anderen Fällen nennen wir Ihnen die Konditionen vorab – ohne Überraschungen."),
        ("Darf mein Hund mit in den Ersatzwagen?", "Ja, nach Absprache. Geben Sie es bei der Buchung oder am Telefon an – dann planen wir ein passendes Fahrzeug für Sie und Ihren Hund ein."),
        ("Was brauche ich, um den Ersatzwagen abzuholen?", "Bitte bringen Sie Ihren gültigen Führerschein und Ihren Personalausweis mit."),
        ("Wie lange kann ich den Ersatzwagen nutzen?", "Für die Dauer der Reparatur. Sobald Ihr Auto fertig ist, tauschen Sie einfach zurück."),
        ("Holen Sie mein Auto ab?", "Ja. Mit unserem Hol- und Bringservice holen wir Ihr Fahrzeug ab und bringen es nach der Reparatur zurück – geben Sie den Wunsch bei der Buchung, beim Rückruf oder am Telefon an."),
        ("Wie weit reicht der Hol- und Bringservice?", "Im Umkreis von rund 30 km um unsere Werkstatt in Sonneberg – zum Beispiel Neustadt bei Coburg, Coburg, Rödental und Kronach. Sie wohnen weiter weg? Sprechen Sie uns an."),
        ("Gilt der Hol- und Bringservice auch für Aufbereitung und Reifen?", "Sprechen Sie uns an – wir finden eine Lösung, die zu Ihrem Termin passt."),
    ]),
    ("Nach dem Unfall", [
        ("Was muss ich direkt nach einem Unfall tun?", "Unfallstelle sichern, bei Verletzten den Notruf 112 wählen, Fotos machen und die Daten des Unfallgegners notieren. Die ganze Checkliste: <a href=\"unfall-was-tun.html\">Unfall – was jetzt zu tun ist</a>. Danach rufen Sie uns an – wir kümmern uns um alles Weitere."),
        ("Mein Auto ist nicht mehr fahrbereit – was nun?", "Rufen Sie uns an: 03675 4289606. Wir besprechen mit Ihnen, wie Ihr Fahrzeug zu uns kommt, und kümmern uns um alles Weitere."),
        ("Muss ich den Unfall meiner Versicherung melden?", "Ja, Versicherungen verlangen in der Regel eine Meldung innerhalb einer Woche – auch wenn Sie nicht schuld sind. Bei kleinen, selbst verursachten Schäden kann es trotzdem günstiger sein, selbst zu zahlen; das besprechen wir gern mit Ihnen."),
        ("Steht mir ein Mietwagen oder Nutzungsausfall zu?", "Wenn Sie unverschuldet einen Unfall hatten, haben Sie in der Regel Anspruch auf einen Mietwagen oder eine Nutzungsausfallentschädigung durch die gegnerische Versicherung. Unabhängig davon stellen wir Ihnen auf Wunsch einen Ersatzwagen."),
        ("Was ist eine Wertminderung?", "Ein Unfallwagen ist beim Verkauf oft weniger wert, auch wenn er perfekt repariert ist. Diese sogenannte merkantile Wertminderung ermittelt bei unverschuldeten Unfällen der Gutachter, und die gegnerische Versicherung ersetzt sie in der Regel."),
        ("Was passiert bei einem Totalschaden?", "Liegen die Reparaturkosten deutlich über dem Wert des Fahrzeugs, spricht man von einem wirtschaftlichen Totalschaden. Wir besprechen mit Ihnen und dem Gutachter, ob eine Reparatur trotzdem möglich und sinnvoll ist."),
    ]),
]
# Fragen, die auf der Leistungsseite verständlich sind, auf der Sammelseite aber Kontext brauchen
FAQ_RENAME = {
    "Sieht man danach noch etwas?": "Sieht man nach Smart Repair noch etwas?",
    "Wie teuer ist das?": "Was kostet Smart Repair?",
    "Muss ich das der Versicherung melden?": "Muss ich eine Delle der Versicherung melden?",
    "Kann ein Kratzer rosten?": "Kann ein Kratzer im Lack rosten?",
    "Lohnt sich das bei älteren Autos?": "Lohnt sich Kratzer entfernen bei älteren Autos?",
    "Muss ich einen Termin machen?": "Brauche ich für eine Kratzer-Reparatur einen Termin?",
    "Muss wirklich alles repariert werden?": "Muss vor der Leasingrückgabe alles repariert werden?",
    "Lohnt sich das bei jedem Leasingfahrzeug?": "Lohnt sich die Reparatur vor der Leasingrückgabe immer?",
    "Bekomme ich eine Einschätzung vorab?": "Bekomme ich vor der Leasingrückgabe eine Einschätzung?",
    "Sieht man die Lackierung später?": "Sieht man eine Teillackierung später?",
    "Lohnt sich das bei älteren Fahrzeugen?": "Lohnt sich eine Lackierung bei älteren Fahrzeugen?",
    "Sieht man die Lackierung danach?": "Sieht man die Lackierung an der Stoßstange danach?",
    "Wie lange dauert die Reparatur?": "Wie lange dauert eine Unfallreparatur?",
    "Muss ich die Reparatur vorstrecken?": "Muss ich etwas vorstrecken?",
    "Brauche ich einen Termin?": "Brauche ich für den Reifenwechsel einen Termin?",
    "Wie lange hält das Ergebnis?": "Wie lange hält eine Lackpolitur?",
}
FAQ_GROUPS = [(c, slugs) for c, slugs in CATEGORIES] + [("Ratgeber", GUIDES)]
# Zusätzliche Fragen, die in einer Kategorie der Sammelseite vor den Fragen der Leistungsseiten stehen
CAT_EXTRA = {
    "Unfall & Versicherung": [
        ("Welche Versicherung zahlt meinen Schaden?", "<ul><li><strong>Unfallgegner schuld:</strong> dessen Kfz-Haftpflichtversicherung.</li><li><strong>Selbst verursacht:</strong> Ihre Vollkasko – sofern vorhanden.</li><li><strong>Hagel, Sturm, Wildunfall, Glas:</strong> in der Regel Ihre Teilkasko.</li><li><strong>Vandalismus, Fahrerflucht:</strong> meist Ihre Vollkasko.</li></ul><p>Wir helfen Ihnen bei der Einordnung – mehr im Ratgeber <a href=\"unfall-oder-kratzer.html\">Unfall oder Kratzer – wer zahlt?</a></p>"),
        ("Was bedeutet direkte Abrechnung mit der Versicherung?", "Wir stellen die Rechnung direkt an die Versicherung und stimmen uns mit ihr und dem Gutachter ab. Sie müssen sich um den Papierkram nicht kümmern; je nach Fall zahlen Sie nur eine vereinbarte Selbstbeteiligung."),
        ("Was ist die Selbstbeteiligung?", "Der Betrag, den Sie bei einem Kaskoschaden laut Vertrag selbst tragen. Bei einem unverschuldeten Haftpflichtschaden fällt keine Selbstbeteiligung an."),
        ("Werde ich nach dem Schaden hochgestuft?", "Bei Schäden über Ihre Haftpflicht oder Vollkasko wird Ihr Schadenfreiheitsrabatt in der Regel zurückgestuft – bei der Teilkasko nicht. Bei kleinen Schäden rechnen wir gern mit Ihnen durch, ob Selbstzahlen günstiger ist."),
        ("Was ist eine Werkstattbindung?", "Manche Kasko-Tarife sind günstiger, weil die Versicherung die Werkstatt vorgibt. Schauen Sie in Ihren Vertrag oder fragen Sie uns – wir klären das mit Ihnen."),
        ("Wer bezahlt den Gutachter?", "Bei einem unverschuldeten Unfall in der Regel die Versicherung des Unfallgegners. Bei Kaskoschäden beauftragt meist Ihre eigene Versicherung einen Gutachter."),
        ("Was brauche ich für die Versicherung?", "Ihre Versicherungsnummer bzw. die Schadennummer, Datum und Ort des Unfalls, Fotos sowie – falls vorhanden – Daten des Unfallgegners und Zeugen. Den Rest stimmen wir mit der Versicherung ab."),
        ("Kann ich mir den Schaden auszahlen lassen?", "Bei Haftpflichtschäden ist eine Auszahlung nach Gutachten (fiktive Abrechnung) grundsätzlich möglich, allerdings ohne Mehrwertsteuer. Wir empfehlen die fachgerechte Reparatur – gerade wegen Sicherheit und Wiederverkaufswert."),
    ],
    "Aufbereitung & Pflege": [
        ("Was kostet eine Fahrzeugaufbereitung?", "Das hängt von Fahrzeuggröße, Zustand und gewünschtem Umfang ab. Wir schauen uns Ihr Auto an und nennen Ihnen vorab einen festen Preis."),
        ("Wie lange dauert eine Aufbereitung?", "Je nach Umfang wenige Stunden bis mehrere Tage – eine Komplettaufbereitung mit mehrstufiger Politur und Versiegelung braucht naturgemäß länger. Den Abholzeitpunkt nennen wir Ihnen beim Termin."),
        ("Welche Aufbereitungen bieten Sie an?", "<ul><li><a href=\"fahrzeugaufbereitung.html\">Komplettaufbereitung</a> innen und außen</li><li><a href=\"lackaufbereitung.html\">Lackaufbereitung &amp; Politur</a></li><li><a href=\"keramikversiegelung.html\">Keramik-, Sealant- und Wachsversiegelung</a></li><li><a href=\"innenraumaufbereitung.html\">Innenraumaufbereitung</a> inkl. Geruchsbehandlung</li><li><a href=\"scheinwerfer-aufbereiten.html\">Scheinwerfer aufbereiten</a></li><li><a href=\"unterbodenschutz.html\">Unterbodenwäsche, Unterbodenschutz und Hohlraumversiegelung</a></li></ul>"),
        ("Was soll ich vor der Aufbereitung ausräumen?", "Bitte nehmen Sie persönliche Gegenstände, Kindersitze und Wertsachen aus dem Fahrzeug. So kommen wir an alle Stellen heran."),
        ("Wie oft sollte ich mein Auto aufbereiten lassen?", "Eine gründliche Aufbereitung ein- bis zweimal im Jahr hält Lack und Innenraum in Form – ideal im Frühjahr nach dem Streusalz und im Herbst vor dem Winter."),
        ("Lohnt sich eine Aufbereitung vor der Leasingrückgabe?", "Oft ja. Gebrauchsspuren, die sich wegpolieren oder reinigen lassen, werden dann nicht als Schaden berechnet. Mehr dazu bei der <a href=\"leasingrueckgabe.html\">Leasingrückgabe</a>."),
        ("Entfernen Sie auch Tierhaare?", "Ja, Tierhaarentfernung gehört zur Innenraumaufbereitung – ebenso die Behandlung von Gerüchen."),
        ("Kann ich Aufbereitung und Reparatur kombinieren?", "Ja. Karosserie, Smart Repair, Lackierung und Aufbereitung gibt es bei uns unter einem Dach – Sie bringen das Auto einmal und bekommen alles erledigt."),
    ],
}


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
            q = FAQ_RENAME.get(q, q)
            key = q.lower().replace("rechnet ihr", "rechnen sie")
            if key in seen:
                continue
            seen.add(key)
            a_html = a if a.lstrip().startswith("<") else f"<p>{a}</p>" if "<a " in a else f"<p>{esc(a)}</p>"
            rows.append(f'<details><summary><span>{esc(q)}</span></summary><div class="rte">{a_html}</div></details>')
            ld_items.append({"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": plain(a_html)}})
        if rows:
            toc.append(f'<a href="#{anchor}">{esc(title)}</a>')
            sections.append(f'<h2 class="cat-head" id="{anchor}">{esc(title)}</h2>' + "".join(rows))

    for i, (title, qa) in enumerate(GENERAL_FAQ):
        block(title, f"allg-{i}", qa)
    svcs = {s: n for s, n, _ in all_services()}
    for i, (title, slugs) in enumerate(FAQ_GROUPS):
        qa = list(CAT_EXTRA.get(title, []))
        for s in slugs:
            for q, a in collect_faqs(s):
                qa.append((q, a + f'<p class="faq-more"><a href="{s}.html">Mehr zu {esc(svcs.get(s) or guide_meta(s)[1])} →</a></p>'))
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



# Lack-Konfigurator: eigener Konfigurator nach dem Vorbild der früheren Base44-App, komplett auf dem eigenen Server.
# Fahrzeuge, Schritte und Ansichten liegen in images/konfigurator/daten/ (fahrzeuge.json + je Fahrzeug eine .js-Datei),
# die Bilder in images/konfigurator/. Anfragen gehen über formular.php per E-Mail. Einfärbung per Canvas (Karosserie blau/magenta, Sitze warm).
KONFIG_TYPES = ["Alle", "Pkw", "Motorrad", "Mofa/Roller", "Transporter", "Nutzfahrzeug", "Amphibienfahrzeug", "Kabinenroller", "Kleinstwagen"]


def konfig_page():
    types = "".join(f'<button type="button" class="kc-type{" on" if i == 0 else ""}" data-type="{esc(t)}" aria-pressed="{"true" if i == 0 else "false"}">{esc(t)}</button>' for i, t in enumerate(KONFIG_TYPES))
    return f'''<section class="kc" id="kc">
  <div class="kc-home" id="kc-home">
    <div class="page-width">
      <div class="kc-hero"><h1>Customize</h1><p>Wählen Sie Ihr Modell und gestalten Sie es nach Ihren Wünschen</p></div>
      <div class="kc-types" role="group" aria-label="Fahrzeugart">{types}</div>
      <p class="kc-count" id="kc-count"></p>
      <div class="kc-spin" id="kc-loading" role="status" aria-label="Modelle werden geladen"><span></span></div>
      <div class="kc-grid" id="kc-grid"></div>
      <div class="kc-empty" id="kc-empty" hidden><p>Keine Modelle in dieser Kategorie</p></div>
      <script type="application/json" id="kc-data">{open(os.path.join(SITE, "images", "konfigurator", "daten", "fahrzeuge.json"), encoding="utf-8").read().replace("</", "<\\/")}</script>
    </div>
  </div>
  <div class="kc-conf" id="kc-conf" hidden>
    <div class="kc-left">
      <div class="kc-top"><a href="konfigurator.html" id="kc-back" class="kc-link">← Zurück</a><span class="kc-tools"><button type="button" id="kc-share" class="kc-link kc-light">↗ Teilen</button><button type="button" id="kc-reset" class="kc-link kc-light">↺ Reset</button></span></div>
      <div class="kc-stage"><div class="kc-side"><img class="kc-logo" src="images/Taeubert_Logo.png" alt="Täubert"><div class="kc-thumbs" id="kc-thumbs" role="group" aria-label="Ansichten"></div></div>
        <div class="kc-view"><div class="kc-canvas"><canvas id="kc-canvas" role="img" aria-label=""></canvas><div class="kc-spin kc-spin-over" id="kc-imgload"><span></span></div><figure class="kc-detail" id="kc-detail" hidden><div class="kc-detail-art" id="kc-detail-art"></div><figcaption><small id="kc-detail-step"></small><span id="kc-detail-name"></span></figcaption></figure></div></div></div>
      <div class="kc-info"><p class="kc-brand" id="kc-brand"></p><p class="kc-model" id="kc-model"></p><p class="kc-era" id="kc-era"></p><p class="kc-pricehint">Preis individuell – nach Ihrer Konfiguration</p></div>
    </div>
    <div class="kc-right">
      <div class="kc-head">
        <div class="kc-headrow"><h2 id="kc-opt-name"></h2><span class="kc-price">Individuell</span></div>
        <p id="kc-opt-desc"></p>
      </div>
      <div class="kc-stepnav"><button type="button" id="kc-prev" class="kc-link">‹ Zurück</button><div class="kc-stepbox"><span id="kc-step-name"></span><small id="kc-step-num"></small></div><button type="button" id="kc-next" class="kc-nextbtn">Weiter ›</button></div>
      <div class="kc-body">
        <div id="kc-options"></div>
        <div class="kc-summary" id="kc-summary" hidden>
          <h3 class="kc-label">Ihre Konfiguration</h3>
          <div id="kc-sum-list"></div>
          <p class="kc-note"><strong>Hinweis:</strong> Das Fahrzeug muss von Ihnen angeliefert werden – oder wir holen es im Umkreis von 30 km ab. Die Konfiguration dient als Grundlage für Ihr individuelles, unverbindliches Angebot – den Preis erstellen wir passend zu Fahrzeug und Zustand.</p>
          <form class="kc-form" id="kc-form" action="formular.php" method="POST">
            <h3 class="kc-label">Kontaktinformationen</h3>
            <p class="hp"><label>Nicht ausfüllen: <input name="firma" tabindex="-1" autocomplete="off"></label></p>
            <label>Name *<input name="name" autocomplete="name" required></label>
            <label>E-Mail *<input name="email" type="email" autocomplete="email" required></label>
            <label>Telefon<input name="phone" type="tel" autocomplete="tel"></label>
            <label>Nachricht<textarea name="message" rows="3"></textarea></label>
            <label class="kc-consent"><input type="checkbox" name="einwilligung" required><span>Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage gespeichert werden (siehe <a href="datenschutz.html">Datenschutz</a>). *</span></label>
            <button type="submit" class="kc-btn kc-send">➤ Anfrage senden</button>
            <p class="kc-status" id="kc-status" role="status" aria-live="polite"></p>
          </form>
          <div class="kc-done" id="kc-done" hidden><span>✓</span><h3>Anfrage gesendet</h3><p>Vielen Dank für Ihre Konfiguration. Wir melden uns in Kürze bei Ihnen.</p><div class="kc-done-btns"><a class="kc-btn" href="termin.html?leistung=Lackierung#wunschtermin">Beratungstermin anfragen</a><a class="kc-link" href="konfigurator.html">Weitere Modelle ansehen</a></div></div>
        </div>
      </div>
    </div>
  </div>
</section>'''


KONFIG_CSS = """
  /* Detailansicht: gewählte Felge, Lenkrad, Sitz, Radio … als Zeichnung im Bild */
  .kc-detail { position: absolute; right: 0; bottom: 0; z-index: 3; width: clamp(150px, 30%, 260px); margin: 0; background: rgba(255,255,255,.94); border: 1px solid #e2e2e0; box-shadow: 0 10px 30px rgba(0,0,0,.08); padding: 14px 14px 12px; }
  .kc-detail[hidden] { display: none; }
  .kc-detail-art svg { display: block; width: 100%; height: auto; max-height: 190px; }
  .kc-detail figcaption { margin-top: 10px; border-top: 1px solid #ececec; padding-top: 8px; }
  .kc-detail small { display: block; font-size: 10px; letter-spacing: .15em; text-transform: uppercase; color: #737373; }
  .kc-detail span { display: block; font-size: 13px; color: #171717; line-height: 1.3; }
  .kc-detail.swap .kc-detail-art { animation: kcDetailIn .28s cubic-bezier(.2,.7,.2,1); }
  @keyframes kcDetailIn { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .kc-detail.swap .kc-detail-art { animation: none; } }
  @media (max-width: 899px) { .kc-detail { width: 42%; max-width: 170px; padding: 8px 8px 6px; } .kc-detail-art svg { max-height: 78px; } .kc-detail figcaption { margin-top: 4px; padding-top: 4px; } .kc-detail small { font-size: 8px; } .kc-detail span { font-size: 11px; } }
  .kc-row.has-art { display: flex; align-items: center; gap: 12px; }
  .kc-row .kc-row-art { flex: 0 0 52px; width: 52px; height: 40px; display: flex; align-items: center; justify-content: center; }
  .kc-row .kc-row-art svg { max-width: 100%; max-height: 100%; }
  .kc-head .kc-opt-note, .kc-opt-note { margin-top: 10px; font-size: 12px !important; line-height: 1.5; color: #737373; border-left: 2px solid #d4d4d4; padding-left: 10px; }
  .kc-opt-note[hidden] { display: none; }

  .kc-conf .kc-left { background: #efefed; }
  .kc-conf .kc-thumbs, .kc-conf .kc-side { background: transparent; }

  .kc { background: #fff; color: #171717; }
  .kc-home { padding: 72px 0 96px; }
  .kc-hero { text-align: center; margin-bottom: 40px; }
  .kc-hero h1 { font-family: var(--f-display); font-weight: 400; font-size: clamp(30px, 5vw, 60px); letter-spacing: .15em; text-transform: uppercase; line-height: 1.1; }
  .kc-hero p { margin: 14px auto 0; max-width: 28rem; font-size: 14px; color: #737373; letter-spacing: .02em; }
  .kc-types { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; }
  .kc-type { font: inherit; font-size: 11px; letter-spacing: .15em; text-transform: uppercase; padding: 8px 16px; border: 1px solid #e5e5e5; border-radius: 2px; background: #fff; color: #737373; cursor: pointer; transition: all .15s; }
  .kc-type:hover { border-color: #a3a3a3; color: #171717; }
  .kc-type.on { background: #171717; border-color: #171717; color: #fff; }
  .kc-count { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: #737373; margin-bottom: 32px; min-height: 1em; }
  .kc-spin { display: flex; align-items: center; justify-content: center; padding: 120px 0; }
  .kc-spin[hidden] { display: none; }
  .kc-spin span { width: 24px; height: 24px; border: 2px solid #e5e5e5; border-top-color: #262626; border-radius: 50%; animation: kcspin .8s linear infinite; }
  @keyframes kcspin { to { transform: rotate(360deg); } }
  .kc-grid { display: block; }
  .kc-brandsec { margin-bottom: 96px; }
  .kc-brandsec header { padding: 0 0 56px 56px; }
  .kc-brandsec h2 { font-family: var(--f-display); font-weight: 400; font-size: clamp(34px, 4.4vw, 62px); letter-spacing: .18em; text-transform: uppercase; line-height: 1.05; overflow-wrap: anywhere; }
  .kc-brandsec header p { font-family: var(--f-display); font-size: clamp(20px, 2vw, 28px); color: #222; margin-top: 18px; letter-spacing: -.01em; }
  .kc-bgrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid #111; border-left: 1px solid #111; }
  .kc-card { display: block; color: inherit; padding: 22px 22px 28px; border-right: 1px solid #111; border-bottom: 1px solid #111; }
  .kc-card-img { display: block; position: relative; aspect-ratio: 5 / 4; background: #dcdcdc; overflow: hidden; }
  .kc-card-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .9s cubic-bezier(.2,.8,.2,1); }
  .kc-card:hover .kc-card-img img { transform: scale(1.04); }
  .kc-card-text { display: block; padding: 22px 4px 0; }
  .kc-card-name { display: block; font-family: var(--f-display); font-weight: 400; font-size: 20px; letter-spacing: .1em; text-transform: uppercase; }
  .kc-card-name em { font-style: normal; font-family: var(--f-display); text-transform: none; letter-spacing: 0; font-size: 19px; margin-left: 6px; color: #333; }
  .kc-card-meta { display: block; margin-top: 8px; font-family: var(--f-display); font-size: 15px; color: #555; }
  .kc-card-go { display: table; margin-top: 16px; font-size: 10px; letter-spacing: .25em; text-transform: uppercase; border-bottom: 1px solid #171717; padding-bottom: 2px; transition: border-color .2s; }
  .kc-card:hover .kc-card-go { border-color: #a3a3a3; }
  .kc-empty { text-align: center; padding: 120px 0; color: #737373; font-size: 14px; }
  .kc-conf { display: flex; min-height: calc(100svh - var(--announce-h) - var(--hdr-h)); }
  .kc-conf[hidden], .kc-home[hidden], .kc-fallback[hidden] { display: none; }
  .kc-left { width: 60%; background: #fafafa; display: flex; flex-direction: column; }
  .kc-top { display: flex; justify-content: space-between; align-items: center; padding: 24px; }
  .kc-link { font: inherit; font-size: 11px; letter-spacing: .15em; text-transform: uppercase; color: #737373; background: none; border: 0; cursor: pointer; padding: 6px 0; transition: color .2s; }
  .kc-link:hover { color: #171717; }
  .kc-link:disabled { opacity: .35; cursor: default; }
  .kc-light { color: #666; font-size: 10px; }
  .kc-stage { flex: 1; display: flex; min-height: 0; }
  .kc-thumbs { flex: none; display: flex; flex-direction: column; gap: 8px; padding: 16px; border-right: 1px solid #f0f0f0; overflow-y: auto; }
  .kc-thumbs:empty { display: none; }
  .kc-thumb { width: 80px; height: 80px; padding: 0; border: 2px solid #e5e5e5; border-radius: 2px; overflow: hidden; background: #fff; cursor: pointer; transition: border-color .2s; flex: none; }
  .kc-thumb:hover { border-color: #a3a3a3; }
  .kc-thumb.on { border-color: #171717; }
  .kc-thumb img { width: 100%; height: 100%; object-fit: contain; background: #f2f2f0; }
  .kc-view { flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 32px 32px; }
  .kc-canvas { position: relative; width: 100%; max-width: 576px; height: 400px; }
  .kc-canvas canvas { width: 100%; height: 100%; object-fit: contain; }
  .kc-spin-over { position: absolute; inset: 0; padding: 0; background: rgba(250,250,250,.8); }
  .kc-info { padding: 24px; border-top: 1px solid rgba(229,229,229,.6); background: rgba(255,255,255,.5); }
  .kc-brand { font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: #737373; }
  .kc-model { font-family: var(--f-display); font-size: clamp(22px, 2.2vw, 32px); letter-spacing: .04em; text-transform: uppercase; font-weight: 400; margin-top: 4px; }
  .kc-era { font-family: var(--f-display); font-size: 16px; color: #555; margin-top: 4px; }
  .kc-era:empty { display: none; }
  .kc-pricehint { font-size: 11px; letter-spacing: .15em; text-transform: uppercase; color: #737373; margin-top: 10px; }
  .kc-price span { font-family: var(--f-display); font-size: 16px; }
  .kc-right { width: 40%; border-left: 1px solid #f0f0f0; display: flex; flex-direction: column; position: sticky; top: calc(var(--announce-h) + var(--hdr-h)); height: calc(100svh - var(--announce-h) - var(--hdr-h)); align-self: flex-start; }
  .kc-tools { display: flex; gap: 20px; }
  .kc-tabs { display: flex; overflow-x: auto; scrollbar-width: none; border-bottom: 1px solid #f0f0f0; }
  .kc-tab { font: inherit; flex: none; font-size: 11px; letter-spacing: .15em; text-transform: uppercase; color: #737373; background: none; border: 0; padding: 16px 12px 14px; cursor: pointer; transition: color .2s; }
  .kc-tab:first-child { padding-left: 24px; }
  .kc-tab:hover, .kc-tab.on { color: #171717; }
  .kc-tab.on { font-weight: 600; }
  .kc-progress { height: 1px; background: #f0f0f0; }
  .kc-progress span { display: block; height: 1px; background: #171717; width: 0; transition: width .4s cubic-bezier(.2,.8,.2,1); }
  .kc-head { padding: 24px; border-bottom: 1px solid #f0f0f0; }
  .kc-step { display: flex; justify-content: space-between; font-size: 12px; letter-spacing: .15em; text-transform: uppercase; color: #737373; }
  .kc-head h2 { font-family: var(--f-display); text-transform: none; font-size: 26px; font-weight: 400; letter-spacing: -.01em; margin-top: 14px; }
  .kc-head p { font-size: 12px; color: #737373; line-height: 1.6; margin-top: 8px; }
  .kc-head h2:empty, .kc-head p:empty { display: none; }
  .kc-body { flex: 1; overflow-y: auto; padding: 24px; }
  .kc-swatches { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; }
  .kc-sw { font: inherit; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 8px; border: 0; border-radius: 2px; background: none; cursor: pointer; transition: background .15s; min-width: 0; }
  .kc-sw:hover { background: #fafafa; }
  .kc-sw.on { background: #f5f5f5; box-shadow: 0 0 0 1px #171717; }
  .kc-sw i { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #e5e5e5; box-shadow: 0 1px 2px rgba(0,0,0,.08); display: flex; align-items: center; justify-content: center; font-style: normal; font-size: 15px; transition: transform .15s; }
  .kc-sw:hover i { transform: scale(1.05); }
  .kc-sw span { font-size: 10px; line-height: 1.2; color: #525252; text-align: center; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .kc-opts { display: grid; gap: 8px; }
  .kc-opt { font: inherit; text-align: left; width: 100%; display: flex; gap: 12px; justify-content: space-between; align-items: flex-start; padding: 16px; border: 1px solid #e5e5e5; border-radius: 2px; background: #fff; cursor: pointer; transition: border-color .2s, background .2s; }
  .kc-opt:hover { border-color: #a3a3a3; }
  .kc-opt.on { border-color: #171717; background: #fafafa; }
  .kc-opt strong { display: block; font-size: 14px; font-weight: 500; letter-spacing: .02em; }
  .kc-opt small { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 12px; color: #737373; margin-top: 4px; line-height: 1.5; }
  .kc-opt b { flex: none; width: 20px; height: 20px; border-radius: 50%; border: 1px solid #d4d4d4; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #fff; }
  .kc-opt.on b { background: #171717; border-color: #171717; }
  .kc-nav { padding: 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
  .kc-btn { font: inherit; font-size: 11px; letter-spacing: .15em; text-transform: uppercase; background: #171717; color: #fff; border: 0; border-radius: 2px; padding: 0 24px; height: 40px; cursor: pointer; transition: background .2s; }
  .kc-btn:hover { background: #262626; }
  .kc-btn:disabled { opacity: .6; cursor: default; }
  .kc-label { font-family: Inter, sans-serif; font-size: 12px; font-weight: 400; letter-spacing: .2em; text-transform: uppercase; color: #737373; margin-bottom: 16px; }
  .kc-row { padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
  .kc-row small { display: block; font-size: 10px; letter-spacing: .15em; text-transform: uppercase; color: #737373; }
  .kc-row span { font-size: 14px; color: #262626; }
  .kc-note { margin: 32px 0; background: #fafafa; border: 1px solid #f0f0f0; padding: 16px; font-size: 12px; color: #737373; line-height: 1.6; border-radius: 2px; }
  .kc-note strong { color: #404040; font-weight: 600; }
  .kc-form label { display: block; font-size: 12px; color: #737373; margin-bottom: 12px; }
  .kc-form input:not([type=checkbox]), .kc-form textarea { display: block; width: 100%; margin-top: 4px; padding: 9px 12px; border: 1px solid #e5e5e5; border-radius: 2px; font: inherit; font-size: 14px; color: #171717; resize: none; }
  .kc-form input:focus, .kc-form textarea:focus { outline: none; border-color: #171717; box-shadow: 0 0 0 1px #171717; }
  .kc-consent { display: flex !important; gap: 8px; align-items: flex-start; line-height: 1.5; }
  .kc-consent input { margin-top: 3px; }
  .kc-consent a { text-decoration: underline; }
  .kc-send { width: 100%; height: 48px; font-size: 12px; margin-top: 6px; }
  .kc-status { font-size: 13px; margin-top: 12px; }
  .kc-status .kc-alt { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
  .kc-status .kc-alt a { border: 1px solid #171717; padding: 8px 12px; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; }
  .kc-done { text-align: center; padding: 64px 0; }
  .kc-done span { display: inline-flex; width: 64px; height: 64px; border-radius: 50%; background: #171717; color: #fff; align-items: center; justify-content: center; font-size: 26px; }
  .kc-done h3 { font-family: Inter, sans-serif; text-transform: none; font-size: 18px; font-weight: 500; margin: 16px 0 8px; }
  .kc-done p { font-size: 14px; color: #737373; max-width: 24rem; margin: 0 auto; }
  .kc-done-btns { display: flex; flex-direction: column; align-items: center; gap: 14px; margin-top: 28px; }
  .kc-done-btns .kc-btn { display: inline-flex; align-items: center; }
  .kc-fallback iframe { display: block; width: 100%; height: calc(100svh - var(--announce-h) - var(--hdr-h)); min-height: 620px; border: 0; }
  @media (max-width: 990px) {
    .kc-bgrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .kc-brandsec header { padding: 0 0 36px 8px; }
    .kc-brandsec { margin-bottom: 64px; }
    .kc-conf { flex-direction: column; min-height: 0; }
    .kc-left, .kc-right { width: 100%; }
    .kc-left { position: sticky; top: calc(var(--announce-h) + 70px); z-index: 2; }
    .kc-top { padding: 4px 16px; }
    .kc-stage { flex-direction: column-reverse; }
    .kc-thumbs { flex-direction: row; border-right: 0; padding: 4px 16px 8px; overflow-x: auto; gap: 6px; }
    .kc-thumb { width: 44px; height: 44px; border-width: 1px; }
    .kc-view { padding: 0 16px 6px; }
    .kc-canvas { height: 24svh; }
    .kc-info { display: none; }
    .kc-right { position: static; height: auto; border-left: 0; }
    .kc-head, .kc-body, .kc-nav { padding-left: 16px; padding-right: 16px; }
    .kc-head { padding-top: 14px; padding-bottom: 14px; } .kc-head h2 { margin-top: 6px; font-size: 20px; }
    .kc-tab:first-child { padding-left: 16px; } .kc-tab { padding: 12px 10px 10px; }
    .kc-nav { position: sticky; bottom: 0; background: #fff; z-index: 3; padding-top: 12px; padding-bottom: 12px; }
  }
  @media (max-width: 760px) { .kc-nav { bottom: calc(61px + env(safe-area-inset-bottom)); } .kc-fallback iframe { height: calc(100svh - var(--announce-h) - 70px - 61px); min-height: 520px; } }
  @media (max-width: 600px) {
    .kc-home { padding: 40px 0 64px; }
    .kc-types { flex-wrap: nowrap; overflow-x: auto; margin: 0 -16px 24px; padding: 0 16px 4px; scrollbar-width: none; }
    .kc-type { flex: none; font-size: 10px; padding: 8px 12px; }
    .kc-bgrid { grid-template-columns: 1fr; }
    .kc-card { padding: 16px 16px 22px; }
    .kc-card-name { font-size: 17px; }
    .kc-swatches { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }
"""

KONFIG_CSS += """
  /* ===== Konfiguration im Aufbau des Banyan-Konfigurators ===== */
  @font-face { font-family: "Michroma"; font-weight: 400; font-display: swap; src: url(fonts/michroma-latin-400-normal.woff2) format("woff2"); }
  .kc-conf { --f-wide: "Michroma", var(--f-display); min-height: calc(100svh - var(--announce-h) - var(--hdr-h)); background: #fff; }
  .kc-left { width: auto; flex: 1; background: #f3f3f3; position: relative; }
  .kc-top { position: absolute; z-index: 2; top: 0; left: 136px; right: 0; padding: 18px 24px; }
  .kc-stage { flex: 1; display: flex; height: calc(100svh - var(--announce-h) - var(--hdr-h)); min-height: 560px; }
  .kc-side { flex: none; width: 136px; background: #fff; display: flex; flex-direction: column; align-items: center; padding: 18px 0; gap: 18px; overflow-y: auto; }
  .kc-logo { width: 72px; height: auto; }
  .kc-side .kc-thumbs { border: 0; padding: 0; gap: 12px; }
  .kc-side .kc-thumb { width: 100px; height: 100px; border: 1px solid transparent; border-radius: 0; background: #f3f3f3; }
  .kc-side .kc-thumb.on { border-color: #111; }
  .kc-view { padding: 48px 24px 24px; }
  .kc-canvas { max-width: none; width: 100%; height: 100%; }
  .kc-info { position: absolute; z-index: 2; top: 14px; left: calc(68px + 50%); transform: translateX(-50%); width: max-content; max-width: 50%; text-align: center; background: none; border: 0; padding: 0; }
  .kc-info .kc-brand { font-family: var(--f-wide); font-size: 9px; letter-spacing: .14em; }
  .kc-info .kc-model { font-family: var(--f-wide) !important; font-size: 13px !important; letter-spacing: .08em !important; margin-top: 4px; }
  .kc-info .kc-era, .kc-info .kc-pricehint { display: none; }
  .kc-right { width: 440px; flex: none; border-left: 0; padding: 0 20px; background: #fff; }
  .kc-head { padding: 20px 0 0; border: 0; }
  .kc-headrow { display: flex; align-items: center; min-height: 72px; border-bottom: 1px solid #d8d8d8; }
  .kc-headrow h2 { flex: 1; margin: 0; font-family: var(--f-wide) !important; font-size: 17px !important; letter-spacing: .08em !important; text-transform: uppercase; line-height: 1.3 !important; padding-right: 16px; }
  .kc-price { flex: none; align-self: stretch; display: flex; align-items: center; padding-left: 18px; border-left: 1px solid #d8d8d8; font-family: var(--f-wide); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
  .kc-head p { font-size: 15px; line-height: 1.7; color: #777; margin: 22px 0 0; min-height: 76px; text-align: justify; hyphens: auto; }
  .kc-stepnav { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 26px 0 18px; border-bottom: 1px solid #d8d8d8; }
  .kc-stepnav .kc-link { justify-self: start; font-family: var(--f-wide) !important; font-size: 10px; letter-spacing: .1em; color: #111; }
  .kc-stepnav .kc-link:disabled { color: #bbb; opacity: 1; }
  .kc-stepbox { text-align: center; }
  .kc-stepbox span { display: block; font-family: var(--f-wide); font-size: 14px; letter-spacing: .1em; text-transform: uppercase; }
  .kc-stepbox small { display: block; margin-top: 6px; font-family: var(--f-wide); font-size: 10px; letter-spacing: .1em; color: #777; text-transform: uppercase; }
  .kc-nextbtn { justify-self: end; font: inherit; font-family: var(--f-wide); font-size: 10px; letter-spacing: .1em; text-transform: uppercase; background: #fff; color: #111; border: 0; border-radius: 2px; padding: 9px 14px; cursor: pointer; transition: background .2s; }
  .kc-nextbtn:hover { background: #eee; }
  .kc-nextbtn[hidden] { display: none; }
  .kc-body { padding: 22px 0 32px; }
  .kc-swatches { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px 6px; }
  .kc-sw { padding: 0; gap: 10px; }
  .kc-sw:hover, .kc-sw.on { background: none; box-shadow: none; }
  .kc-sw i { width: 58px; height: 58px; border: 0; box-shadow: 0 2px 6px rgba(0,0,0,.18); background: radial-gradient(circle at 32% 28%, rgba(255,255,255,.75), rgba(255,255,255,0) 38%), radial-gradient(circle at 70% 78%, rgba(0,0,0,.28), rgba(0,0,0,0) 62%), var(--c); outline: 1px solid transparent; outline-offset: 4px; transition: outline-color .2s, transform .2s; }
  .kc-sw.on i { outline-color: #111; }
  .kc-sw span { font-size: 15px; line-height: 1.2; color: #333; white-space: normal; overflow: visible; }
  .kc-opts { grid-template-columns: 1fr; gap: 10px; }
  .kc-opt { padding: 16px 18px; border-color: #d8d8d8; border-radius: 0; }
  .kc-opt strong { font-family: var(--f-wide); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; font-weight: 400; }
  .kc-opt small { display: none; }
  @media (max-width: 990px) {
    .kc-left { position: sticky; top: calc(var(--announce-h) + 70px); z-index: 4; }
    .kc-conf.is-summary .kc-left { position: static; }
    .kc-stage { height: auto; min-height: 0; flex-direction: column-reverse; }
    .kc-side { width: auto; flex-direction: row; padding: 8px 16px; overflow-x: auto; }
    .kc-logo { display: none; }
    .kc-side .kc-thumbs { flex-direction: row; }
    .kc-side .kc-thumb { width: 52px; height: 52px; }
    .kc-top { left: 0; padding: 8px 16px; }
    .kc-view { padding: 36px 16px 8px; }
    .kc-canvas { height: 26svh; }
    .kc-info { display: none; }
    .kc-right { width: 100%; padding: 0 16px; }
    .kc-head p { min-height: 0; text-align: left; }
    .kc-sw i { width: 48px; height: 48px; }
    .kc-sw span { font-size: 13px; }
  }
"""


KONFIG_JS = r"""
<script type="module">
  // Lack-Konfigurator (eigener Server, keine Drittanbieter)
  const root = document.getElementById('kc');
  const $ = id => document.getElementById(id);
  const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Alle Fahrzeuge, Farben und Bilder liegen auf dem eigenen Server (js/konfigurator/, images/konfigurator/)
  const DATA = 'images/konfigurator/daten/';

  // ---- Bild einfärben (TintedImage.jsx) ----
  const dataUrlCache = new Map();
  async function fetchAsDataUrl(url) {
    return url;   // eigene Bilder (gleiche Domain): kein Proxy nötig
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255; const max = Math.max(r, g, b), min = Math.min(r, g, b); let h = 0, s = 0; const l = (max + min) / 2;
    if (max !== min) { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break; case g: h = ((b - r) / d + 2) * 60; break; default: h = ((r - g) / d + 4) * 60; } }
    return { h, s, l };
  }
  function hslToRgb(h, s, l) {
    h /= 360; if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
    const hue2rgb = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    return { r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255), g: Math.round(hue2rgb(p, q, h) * 255), b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255) };
  }
  const hexToHsl = hex => { const c = hex.replace('#', ''); return rgbToHsl(parseInt(c.substr(0, 2), 16), parseInt(c.substr(2, 2), 16), parseInt(c.substr(4, 2), 16)); };
  function blurMask(m, w, h, r) {   // weiche Übergänge statt Pixelblöcken (Box-Blur, horizontal + vertikal)
    if (r < 1) return m;
    const t = new Float32Array(m.length), n = 2 * r + 1;
    for (let y = 0; y < h; y++) { let acc = 0; const o = y * w;
      for (let x = -r; x <= r; x++) acc += m[o + Math.min(w - 1, Math.max(0, x))];
      for (let x = 0; x < w; x++) { t[o + x] = acc / n; acc += m[o + Math.min(w - 1, x + r + 1)] - m[o + Math.max(0, x - r)]; } }
    for (let x = 0; x < w; x++) { let acc = 0;
      for (let y = -r; y <= r; y++) acc += t[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (let y = 0; y < h; y++) { m[y * w + x] = acc / n; acc += t[Math.min(h - 1, y + r + 1) * w + x] - t[Math.max(0, y - r) * w + x]; } }
    return m;
  }
  function applyTint(imageData, tintHex, seatTintHex, interiorView) {   // Karosserie (blau/magenta) und Sitze/Polster (warme Töne) umfärben
    const data = imageData.data, w = imageData.width, h = imageData.height, N = w * h;
    const bodyTint = tintHex ? hexToHsl(tintHex) : null, seatTint = seatTintHex ? hexToHsl(seatTintHex) : null;
    const bw = new Float32Array(N), sw = new Float32Array(N), L = new Float32Array(N);
    for (let p = 0, i = 0; p < N; p++, i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], sat = Math.max(r, g, b) - Math.min(r, g, b), px = rgbToHsl(r, g, b), hue = px.h;
      L[p] = px.l;
      if (bodyTint) {
        const mag = hue >= 260 && hue <= 345, sMin = mag ? 5 : 15, satWeight = sat <= sMin ? 0 : Math.min((sat - sMin) / (mag ? 22 : 40), 1), hueMin = 150, hueMax = 340, f = 15;   // Magenta-Kanten empfindlich (kein rosa Saum), Blautöne wie Glas vorsichtig   // auch halbtransparente Kantenpixel (kein Farbsaum)
        let hw;
        if (hue >= hueMin + f && hue <= hueMax - f) hw = 1;
        else if (hue >= hueMin - f && hue < hueMin + f) hw = (hue - (hueMin - f)) / (2 * f);
        else if (hue > hueMax - f && hue <= hueMax + f) hw = (hueMax + f - hue) / (2 * f);
        else hw = 0;
        const lMax = mag ? 0.97 : 0.93, lWeight = px.l > lMax ? 0 : Math.min((lMax - px.l) / (mag ? 0.06 : 0.08), 1);
        bw[p] = Math.min(satWeight, hw, lWeight);
      }
      if (seatTint) {
        let hw = 0;
        if (hue >= 300 || hue <= 120) { const edge = Math.min(hue >= 300 ? 360 - hue : 999, hue <= 120 ? hue : 999); hw = edge < 25 ? edge / 25 : 1; }
        // nur deutlich farbige Flächen (Sitze, Polster) – kein Dachhimmel, keine hellen Kunststoffe, kein Chrom
        const satWeight = sat <= 22 ? 0 : Math.min((sat - 22) / 30, 1);
        const lWeight = px.l > 0.8 ? 0 : px.l > 0.68 ? (0.8 - px.l) / 0.12 : Math.min(px.l / 0.12, 1);
        const yy = (p / w) | 0, yF = yy < h * 0.48 ? 0 : Math.min(1, (yy - h * 0.48) / (h * 0.08));   // Polster liegen in der unteren Bildhälfte
        sw[p] = Math.min(hw, satWeight, lWeight, yF) * 0.92;
      }
    }
    // Keine farbigen Polster im Bild (z. B. schwarze Sitze): dunkle, wenig gesättigte Polsterflächen im unteren Bildteil einfärben
    let darkSeats = false;
    if (seatTint && interiorView) {
      let tot = 0; const y0 = Math.floor(h * 0.5) * w; for (let p = y0; p < N; p++) if (bw[p] < 0.05) tot += sw[p];
      if (tot < (N - y0) * 0.03) {
        darkSeats = true;
        for (let p = 0, i = 0; p < N; p++, i += 4) {
          const y = (p / w) | 0; if (y < h * 0.5 || bw[p] > 0.05) { sw[p] = 0; continue; }
          const r = data[i], g = data[i + 1], b = data[i + 2], sat = Math.max(r, g, b) - Math.min(r, g, b), l = L[p];
          const sW = sat > 46 ? 0 : sat > 30 ? (46 - sat) / 16 : 1;
          const lW = l < 0.05 ? 0 : l < 0.09 ? (l - 0.05) / 0.04 : l > 0.62 ? 0 : l > 0.5 ? (0.62 - l) / 0.12 : 1;
          const yW = Math.min(1, (y - h * 0.5) / (h * 0.1));
          sw[p] = Math.min(sW, lW, yW) * 0.85;
        }
      }
    }
    const rad = Math.max(1, Math.round(Math.max(w, h) / 450));
    if (bodyTint) { const raw = bw.slice(); blurMask(bw, w, h, rad); for (let p = 0; p < N; p++) if (raw[p] > bw[p]) bw[p] = raw[p]; }   // Glättung nur verstärkend: Kanten bleiben voll eingefärbt
    if (seatTint) blurMask(sw, w, h, rad);
    const bodyScale = bodyTint && (bodyTint.l > 0.7 || bodyTint.l < 0.25) ? 0.3 : 0.45;
    for (let p = 0, i = 0; p < N; p++, i += 4) {
      const wB = bodyTint ? bw[p] : 0, wS = seatTint ? sw[p] * (1 - wB) : 0;
      if (wB > 0.01) {
        const c = hslToRgb(bodyTint.h, bodyTint.s, Math.max(0.02, Math.min(0.98, bodyTint.l + (L[p] - 0.5) * bodyScale)));
        data[i] = Math.round(data[i] * (1 - wB) + c.r * wB); data[i + 1] = Math.round(data[i + 1] * (1 - wB) + c.g * wB); data[i + 2] = Math.round(data[i + 2] * (1 - wB) + c.b * wB);
      }
      if (wS > 0.01) {
        const newL = darkSeats ? Math.max(0.04, Math.min(0.85, seatTint.l * (0.55 + L[p] * 1.25))) : Math.max(0.02, Math.min(0.92, L[p] * (seatTint.l / 0.4))), newS = Math.max(seatTint.s * 0.7, Math.min(seatTint.s + 0.1, 0.85));
        const c = hslToRgb(seatTint.h, newS, newL);
        data[i] = Math.round(data[i] * (1 - wS) + c.r * wS); data[i + 1] = Math.round(data[i + 1] * (1 - wS) + c.g * wS); data[i + 2] = Math.round(data[i + 2] * (1 - wS) + c.b * wS);
      }
    }
  }
  // Vorschaubilder ebenfalls in der gewählten Farbe (wie bei Banyan)
  let thumbJob = 0;
  async function tintThumbs(g, paintColor, seatColor, hasInterior) {
    const my = ++thumbJob;
    for (let i = 0; i < g.length; i++) {
      const v = g[i], isExterior = v.view_type !== 'interior', body = paintColor, seat = (!hasInterior || !isExterior) ? seatColor : undefined;
      if (!body && !seat) continue;
      const url = await fetchAsDataUrl(v.url); if (my !== thumbJob) return;
      const im = new Image();
      await new Promise(res => { im.onload = res; im.onerror = res; im.src = url; });
      if (my !== thumbJob || !im.naturalWidth) continue;
      const c = document.createElement('canvas'), sc = 200 / Math.max(im.naturalWidth, im.naturalHeight);
      c.width = Math.round(im.naturalWidth * sc); c.height = Math.round(im.naturalHeight * sc);
      const x = c.getContext('2d'); x.drawImage(im, 0, 0, c.width, c.height);
      try { const d = x.getImageData(0, 0, c.width, c.height); applyTint(d, body, seat, !isExterior && !/motorrad|mofa|roller/i.test(vehicle.vehicle_type || '')); x.putImageData(d, 0, 0); } catch (e) { continue; }
      const el = $('kc-thumbs').querySelector(`[data-view="${i}"] img`); if (el) el.src = c.toDataURL('image/jpeg', 0.85);
    }
  }
  let tintJob = 0;
  async function tintedImage(src, tintHex, seatTintHex, interiorView, maxSize = (window.innerWidth < 900 ? 1400 : 2400)) {
    const my = ++tintJob, canvas = $('kc-canvas'), spin = $('kc-imgload');
    spin.hidden = false;
    const imgUrl = await fetchAsDataUrl(src);
    if (my !== tintJob) return;
    const img = new Image();
    img.onload = () => {
      if (my !== tintJob) return;
      const ctx = canvas.getContext('2d'); let w = img.naturalWidth, h = img.naturalHeight;
      if (w > maxSize || h > maxSize) { const scale = maxSize / Math.max(w, h); w = Math.round(w * scale); h = Math.round(h * scale); }
      canvas.width = w; canvas.height = h; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(img, 0, 0, w, h);
      if (tintHex || seatTintHex) {
        try {
          const imageData = ctx.getImageData(0, 0, w, h);
          applyTint(imageData, tintHex, seatTintHex, interiorView);
          ctx.putImageData(imageData, 0, 0);
        } catch (e) { console.warn('Canvas recolor failed:', e.message); }
      }
      spin.hidden = true;
    };
    img.onerror = () => { if (my === tintJob) spin.hidden = true; };
    img.src = imgUrl;
  }

  // ---- Übersicht (Home.jsx) ----
  let vehicles = [], activeType = 'Alle';
  function renderHome() {   // Übersicht im Banyan-Stil: je Marke ein Abschnitt mit Raster
    const list = activeType === 'Alle' ? vehicles : vehicles.filter(v => v.vehicle_type === activeType);
    $('kc-count').textContent = list.length + ' ' + (list.length === 1 ? 'Modell' : 'Modelle');
    $('kc-empty').hidden = list.length > 0;
    const brands = new Map();
    list.forEach(v => { if (!brands.has(v.brand)) brands.set(v.brand, []); brands.get(v.brand).push(v); });
    const order = [...brands.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'de'));
    const years = vs => { const y = vs.flatMap(v => (v.era || '').match(/\d{4}/g) || []).map(Number); return y.length ? [Math.min(...y), Math.max(...y)] : null; };
    $('kc-grid').innerHTML = order.map(([brand, vs]) => {
      const y = years(vs), n = vs.length;
      const sub = (y ? (y[0] === y[1] ? `Klassiker aus ${y[0]}` : `Klassiker von ${y[0]} bis ${y[1]}`) + ' · ' : '') + n + (n === 1 ? ' Konfigurator' : ' Konfiguratoren');
      return `<section class="kc-brandsec"><header><h2>${esc(brand)}</h2><p>${esc(sub)}</p></header><div class="kc-bgrid">` + vs.map(v => `<a class="kc-card" href="?modell=${esc(v.id)}" data-id="${esc(v.id)}">
      <span class="kc-card-img"><img src="${esc(v.thumb || v.image_url)}" alt="${esc(v.brand + ' ' + v.model_name)}" loading="lazy"></span>
      <span class="kc-card-text"><span class="kc-card-name">${esc(v.model_name)}${v.variant ? ` <em>${esc(v.variant)}</em>` : ''}</span>
      <span class="kc-card-meta">${esc([v.era, v.vehicle_type].filter(Boolean).join(' · '))}</span>
      <span class="kc-card-go">Konfigurieren</span></span></a>`).join('') + '</div></section>';
    }).join('');
  }
  document.querySelectorAll('.kc-type').forEach(b => b.addEventListener('click', () => {
    activeType = b.dataset.type;
    document.querySelectorAll('.kc-type').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    renderHome();
  }));
  $('kc-grid').addEventListener('click', e => {
    const a = e.target.closest('.kc-card'); if (!a) return; e.preventDefault();
    history.pushState({}, '', '?modell=' + a.dataset.id); route();
  });

  // ---- Detailansicht: zeigt Felgen, Lenkrad, Sitze, Radio, Lenker, Auspuff, Verdeck, Fahrwerk, Zubehör, Unterboden als Zeichnung ----
  const KD = (() => {
    let uidN = 0;
    const hx = h => { h = String(h || '#777').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16) || 0); };
    const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
    const mix = (a, b, t) => { const A = hx(a), B = hx(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
    const sh = (c, t) => t < 0 ? mix(c, '#000000', -t) : mix(c, '#ffffff', t);
    const lum = c => { const [r, g, b] = hx(c); return (r * 299 + g * 587 + b * 114) / 1000; };
    const f = n => (+n).toFixed(2);
    const P = (r, a) => { const t = (a - 90) * Math.PI / 180; return f(r * Math.cos(t)) + ' ' + f(r * Math.sin(t)); };
    const rot = (a, pts) => { const t = a * Math.PI / 180, c = Math.cos(t), s = Math.sin(t); return pts.map(([x, y]) => f(x * c - y * s) + ',' + f(x * s + y * c)).join(' '); };
    const spoke = (a, r1, r2, w1, w2) => rot(a, [[-w1, -r1], [-w2, -r2], [w2, -r2], [w1, -r1]]);
    const svg = (vb, body) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
    const lg = (id, stops, x2 = 1, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
    function base(u) {
      return lg(u + 'ch', [[0, '#fdfdfd'], [.3, '#a3a8ad'], [.48, '#f1f3f4'], [.7, '#74797e'], [1, '#dfe2e4']]) +
        lg(u + 'al', [[0, '#eceef0'], [.45, '#b4b9bd'], [.6, '#d6d9dc'], [1, '#8f949a']]) +
        lg(u + 'bk', [[0, '#48484b'], [.35, '#151516'], [.7, '#0c0c0d'], [1, '#2c2c2e']]) +
        lg(u + 'go', [[0, '#efe2b4'], [.4, '#b59c5c'], [.6, '#dcc78f'], [1, '#8a733d']]) +
        lg(u + 'gl', [[0, '#dfe7ec'], [.5, '#9fb0bb'], [1, '#6f808c']], 0, 1) +
        `<radialGradient id="${u}ty"><stop offset=".55" stop-color="#2f2f30"/><stop offset=".82" stop-color="#1b1b1c"/><stop offset="1" stop-color="#0a0a0a"/></radialGradient>` +
        `<filter id="${u}sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#000" flood-opacity=".28"/></filter>`;
    }
    const mat = (u, id, c, vertical = true) => lg(u + id, [[0, sh(c, .22)], [.45, c], [1, sh(c, -.42)]], vertical ? 0 : 1, 1);
    const stitchCol = c => lum(c) > 120 ? sh(c, -.35) : sh(c, .45);

    // ---------- Felgen und Räder ----------
    function brake(u, R) {
      return `<circle r="${f(R * .8)}" fill="url(#${u}disc)"/><circle r="${f(R * .8)}" fill="none" stroke="#4c4f53" stroke-width="1"/><circle r="${f(R * .36)}" fill="#2a2b2d"/>` +
        `<path d="M${P(R * .84, 105)} A${f(R * .84)} ${f(R * .84)} 0 0 1 ${P(R * .84, 155)} L${P(R * .6, 152)} A${f(R * .6)} ${f(R * .6)} 0 0 0 ${P(R * .6, 108)} Z" fill="#303033"/>`;
    }
    function lugs(u, n, r, sz, off = 0) { let s = ''; for (let i = 0; i < n; i++) s += `<circle transform="translate(${P(r, i * 360 / n + off).replace(' ', ',')})" r="${sz}" fill="url(#${u}ch)" stroke="#555" stroke-width=".5"/>`; return s; }
    function wheel(name, moto) {
      const u = 'kd' + (++uidN), nm = name.toLowerCase();
      const inch = +((nm.match(/(\d\d)"/) || [])[1] || 0);
      const off = /beadlock|wolf/.test(nm);
      let R = inch === 15 ? 55 : inch === 16 ? 61 : inch === 17 ? 67 : /sport schwarz/.test(nm) ? 67 : 59;
      if (off) R = 54;
      if (moto) R = /alu/.test(nm) ? 76 : 82;
      let s = `<defs>${base(u)}${lg(u + 'disc', [[0, '#9da1a5'], [.5, '#6c7074'], [1, '#8b8f93']])}${lg(u + 'st', [[0, '#b9bec3'], [.5, '#868c92'], [1, '#a4a9ae']])}</defs><g filter="url(#${u}sh)">`;
      s += `<circle r="97" fill="url(#${u}ty)"/>`;
      if (off) for (let i = 0; i < 40; i++) s += `<rect x="-4.6" y="-101" width="9.2" height="8" rx="1.6" fill="#1c1c1d" transform="rotate(${i * 9})"/>`;
      s += `<circle r="${f((97 + R) / 2)}" fill="none" stroke="#fff" stroke-opacity=".05" stroke-width="${f(97 - R - 8)}"/>`;
      s += `<path d="M${P(90, 300)} A90 90 0 0 1 ${P(90, 345)}" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="3" stroke-linecap="round"/>`;
      if (moto && !/alu/.test(nm)) {   // Speichenrad
        const chrome = /chrom/.test(nm), sc = chrome ? '#e3e6e8' : '#8f9398';
        s += `<circle r="${R}" fill="none" stroke="url(#${u}${chrome ? 'ch' : 'al'})" stroke-width="7"/><circle r="${R - 4}" fill="none" stroke="#3a3b3d" stroke-width="1"/>`;
        for (let i = 0; i < 36; i++) { const a = i * 10, b = a + (i % 2 ? 32 : -32); s += `<line x1="${P(i % 4 < 2 ? 11 : 15, a).split(' ')[0]}" y1="${P(i % 4 < 2 ? 11 : 15, a).split(' ')[1]}" x2="${P(R - 4, b).split(' ')[0]}" y2="${P(R - 4, b).split(' ')[1]}" stroke="${sc}" stroke-width="1.05"/>`; }
        s += `<circle r="17" fill="url(#${u}${chrome ? 'ch' : 'al'})"/><circle r="11" fill="none" stroke="#666" stroke-width="1"/><circle r="5" fill="#2a2a2c"/>`;
        return svg('-106 -106 212 212', s + '</g>');
      }
      if (moto) {   // Alu-Guss
        s += `<circle r="${R}" fill="#18181a"/>`;
        s += `<circle r="${f(R * .74)}" fill="url(#${u}disc)"/>`;
        for (let i = 0; i < 18; i++) s += `<circle transform="translate(${P(R * .62, i * 20).replace(' ', ',')})" r="2.2" fill="#2c2d2f"/>`;
        s += `<circle r="${f(R * .4)}" fill="#2a2b2d"/>`;
        for (let i = 0; i < 6; i++) s += `<polygon points="${spoke(i * 60 + 30, 14, R - 3, 6, 4)}" fill="url(#${u}al)" stroke="#7d8287" stroke-width=".6"/>`;
        s += `<circle r="${R - 2}" fill="none" stroke="url(#${u}al)" stroke-width="6"/><circle r="17" fill="url(#${u}al)"/><circle r="7" fill="#2a2a2c"/>`;
        return svg('-106 -106 212 212', s + '</g>');
      }
      s += `<circle r="${R}" fill="#141416"/>`;
      if (/fuchs/.test(nm)) {
        const black = /schwarz/.test(nm), pol = /poliert/.test(nm);
        s += `<circle r="${R - 1}" fill="url(#${u}ch)"/><circle r="${R - 4}" fill="url(#${u}${black ? 'bk' : pol ? 'ch' : 'al'})"/>`;
        for (let i = 0; i < 5; i++) {
          const a = i * 72 + 36;
          s += `<path d="M${P(R * .5, a)} Q${P(R * .7, a - 15)} ${P(R * .87, a - 17)} A${f(R * .87)} ${f(R * .87)} 0 0 1 ${P(R * .87, a + 17)} Q${P(R * .7, a + 15)} ${P(R * .5, a)} Z" fill="#2b2c2f" stroke="${black ? '#cfd3d6' : '#55585c'}" stroke-width="${black ? 1.3 : .8}" stroke-linejoin="round"/>`;
          if (!black && !pol) { const b = i * 72; s += `<path d="M${P(R * .36, b - 17)} L${P(R * .78, b - 12)} Q${P(R * .87, b)} ${P(R * .78, b + 12)} L${P(R * .36, b + 17)} Q${P(R * .3, b)} ${P(R * .36, b - 17)} Z" fill="#19191b"/>`; }
        }
        s += `<circle r="${f(R * .3)}" fill="url(#${u}${black ? 'bk' : pol ? 'ch' : 'al'})" stroke="${black ? '#bfc3c6' : '#8a8f94'}" stroke-width=".8"/>` + lugs(u, 5, R * .2, 3, 36) + `<circle r="${f(R * .11)}" fill="url(#${u}ch)"/>`;
      } else if (/bbs/.test(nm)) {
        s += `<circle r="${R - 1}" fill="url(#${u}ch)"/><circle r="${R - 10}" fill="#18181a"/>` + brake(u, R - 10);
        for (let i = 0; i < 40; i++) s += `<circle transform="translate(${P(R - 5.5, i * 9).replace(' ', ',')})" r="1.1" fill="#7c8186"/>`;
        let dk = '', lt = '';
        for (let i = 0; i < 15; i++) for (const d of [-1, 1]) {
          const a = i * 24, p1 = P(R * .34, a - 13 * d).split(' '), p2 = P(R - 10, a + 13 * d).split(' ');
          dk += `<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}" stroke="#6b5a2e" stroke-width="5.4" stroke-linecap="round"/>`;
          lt += `<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}" stroke="${d > 0 ? '#e2cf93' : '#c8b170'}" stroke-width="3.4" stroke-linecap="round"/>`;
        }
        s += dk + lt + `<circle r="${f(R * .35)}" fill="url(#${u}go)" stroke="#6b5a2e" stroke-width="1"/><circle r="${f(R * .2)}" fill="url(#${u}ch)"/><polygon points="${rot(0, Array.from({ length: 6 }, (_, k) => [Math.cos(k * Math.PI / 3) * R * .1, Math.sin(k * Math.PI / 3) * R * .1]))}" fill="url(#${u}al)" stroke="#666" stroke-width=".6"/>`;
      } else if (/sport schwarz/.test(nm)) {
        s += brake(u, R - 5);
        for (let i = 0; i < 5; i++) for (const d of [-8, 8]) s += `<polygon points="${spoke(i * 72 + d, R * .28, R - 6, 4.6, 3.4)}" fill="url(#${u}bk)" stroke="#4a4a4d" stroke-width=".7"/>`;
        s += `<circle r="${R - 5}" fill="none" stroke="#121213" stroke-width="5"/><circle r="${R - 1.5}" fill="none" stroke="url(#${u}ch)" stroke-width="3"/>`;
        s += `<circle r="${f(R * .32)}" fill="url(#${u}bk)" stroke="#444" stroke-width=".8"/>` + lugs(u, 5, R * .19, 2.6, 36) + `<circle r="${f(R * .09)}" fill="#202022" stroke="#555" stroke-width=".6"/>`;
      } else if (/minilite/.test(nm)) {
        s += `<circle r="${R - 1}" fill="url(#${u}al)"/><circle r="${R - 5}" fill="url(#${u}st)"/>`;
        for (let i = 0; i < 8; i++) { const a = i * 45 + 22.5; s += `<path d="M${P(R * .44, a - 10)} L${P(R * .83, a - 15)} A${f(R * .83)} ${f(R * .83)} 0 0 1 ${P(R * .83, a + 15)} L${P(R * .44, a + 10)} A${f(R * .44)} ${f(R * .44)} 0 0 0 ${P(R * .44, a - 10)} Z" fill="#242527" stroke="#242527" stroke-width="5" stroke-linejoin="round"/>`; }
        s += `<circle r="${f(R * .33)}" fill="url(#${u}al)" stroke="#7d8287" stroke-width=".8"/>` + lugs(u, 4, R * .2, 2.8, 45) + `<circle r="${f(R * .1)}" fill="url(#${u}ch)"/>`;
      } else if (/wolf/.test(nm)) {
        const black = /schwarz/.test(nm);
        s += `<circle r="${R - 1}" fill="${black ? 'url(#' + u + 'bk)' : 'url(#' + u + 'st)'}"/><circle r="${R - 6}" fill="none" stroke="${black ? '#2e2e30' : '#7a8086'}" stroke-width="2"/>`;
        for (let i = 0; i < 6; i++) s += `<circle transform="translate(${P(R * .66, i * 60 + 30).replace(' ', ',')})" r="${f(R * .1)}" fill="#141416"/>`;
        s += `<circle r="${f(R * .44)}" fill="${black ? '#232325' : '#9aa0a6'}" stroke="${black ? '#3a3a3c' : '#6e747a'}" stroke-width="1.4"/>` + lugs(u, 5, R * .28, 3.2) + `<circle r="${f(R * .14)}" fill="${black ? '#151516' : '#5d6268'}"/>`;
      } else if (/beadlock/.test(nm)) {
        s += brake(u, R - 8);
        for (let i = 0; i < 6; i++) s += `<polygon points="${spoke(i * 60, R * .3, R - 8, 8, 6.5)}" fill="url(#${u}bk)" stroke="#3c3c3f" stroke-width=".8"/>`;
        s += `<circle r="${R - 4.5}" fill="none" stroke="#262628" stroke-width="9"/>` + lugs(u, 24, R - 4.5, 1.8) + `<circle r="${R}" fill="none" stroke="#3a3a3c" stroke-width="1"/>`;
        s += `<circle r="${f(R * .34)}" fill="url(#${u}bk)" stroke="#444" stroke-width="1"/>` + lugs(u, 6, R * .22, 2.6, 30) + `<circle r="${f(R * .1)}" fill="#2a2a2c"/>`;
      } else {   // Serienfelge: Stahlfelge mit Radkappe
        s += `<circle r="${R - 1}" fill="url(#${u}al)"/><circle r="${R - 5}" fill="#bfc3c7"/>`;
        for (let i = 0; i < 8; i++) s += `<rect x="-3.4" y="${f(-R * .8)}" width="6.8" height="${f(R * .17)}" rx="3.4" fill="#262729" transform="rotate(${i * 45 + 22.5})"/>`;
        s += `<circle r="${f(R * .6)}" fill="none" stroke="#9ca1a6" stroke-width="1.6"/><circle r="${f(R * .52)}" fill="url(#${u}ch)" stroke="#8a8f94" stroke-width=".8"/>`;
        s += `<circle r="${f(R * .42)}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1"/><circle r="${f(R * .2)}" fill="url(#${u}al)"/>`;
      }
      return svg('-106 -106 212 212', s + '</g>');
    }

    // ---------- Lenkrad ----------
    function steering(name) {
      const u = 'kd' + (++uidN), nm = name.toLowerCase();
      const type = /holz\s*&\s*leder/.test(nm) ? 'mix' : /nardi|holz/.test(nm) ? 'wood' : /momo/.test(nm) ? 'momo' : /leder/.test(nm) ? 'leder' : 'orig';
      let s = `<defs>${base(u)}${lg(u + 'wd', [[0, '#b06c37'], [.35, '#7c4220'], [.6, '#a0602f'], [1, '#5e3017']])}</defs><g filter="url(#${u}sh)">`;
      const wood = (r, w) => { let g = `<circle r="${r}" fill="none" stroke="url(#${u}wd)" stroke-width="${w}"/>`; const tones = ['#9a5a2c', '#6b3a1b', '#b37440', '#5a2e15', '#8d4f25'];
        for (let k = 0; k < 5; k++) g += `<circle r="${f(r - w / 2 + 1.5 + k * (w - 3) / 4)}" fill="none" stroke="${tones[k]}" stroke-opacity=".55" stroke-width=".9" stroke-dasharray="${38 + k * 7} ${5 + k * 2} ${17 + k * 3} ${9 - k}" transform="rotate(${k * 37})"/>`;
        return g + `<circle r="${f(r + w / 2)}" fill="none" stroke="#3a1d0c" stroke-width=".8"/><circle r="${f(r - w / 2)}" fill="none" stroke="#3a1d0c" stroke-width=".8"/>`; };
      const leather = (r, w, a1 = 0, a2 = 360) => { const full = a2 - a1 >= 360;
        const arc = full ? `<circle r="${r}" fill="none" stroke="#1c1c1d" stroke-width="${w}"/>` : `<path d="M${P(r, a1)} A${r} ${r} 0 0 1 ${P(r, a2)}" fill="none" stroke="#1c1c1d" stroke-width="${w}" stroke-linecap="butt"/>`;
        const st = full ? `<circle r="${f(r - w / 2 + 2.2)}" fill="none" stroke="#8a8a8a" stroke-width=".8" stroke-dasharray="2 2.2"/>` : `<path d="M${P(r - w / 2 + 2.2, a1 + 1)} A${r} ${r} 0 0 1 ${P(r - w / 2 + 2.2, a2 - 1)}" fill="none" stroke="#8a8a8a" stroke-width=".8" stroke-dasharray="2 2.2"/>`;
        return arc + st; };
      const gloss = r => `<path d="M${P(r, 215)} A${r} ${r} 0 0 1 ${P(r, 300)}" fill="none" stroke="#fff" stroke-opacity=".32" stroke-width="2.4" stroke-linecap="round"/>`;
      if (type === 'orig') {
        s += `<circle r="84" fill="none" stroke="#141415" stroke-width="7.5"/><circle r="85.8" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="1"/>`;
        for (const a of [118, 242]) s += `<polygon points="${spoke(a, 18, 82, 3.4, 2.4)}" fill="url(#${u}ch)" stroke="#777" stroke-width=".5"/>`;
        s += `<circle r="52" fill="none" stroke="url(#${u}ch)" stroke-width="2.6"/><circle r="24" fill="#161617"/><circle r="24" fill="none" stroke="url(#${u}ch)" stroke-width="2"/><circle r="13" fill="url(#${u}bk)"/>` + gloss(84);
      } else {
        const sp = type === 'momo' || type === 'leder' ? 'bk' : 'al';
        for (const a of [90, 180, 270]) {
          s += `<polygon points="${spoke(a, 20, 76, type === 'leder' ? 14 : 9.5, type === 'leder' ? 10 : 6.2)}" fill="url(#${u}${sp})" stroke="${sp === 'al' ? '#80858a' : '#333'}" stroke-width=".7" stroke-linejoin="round"/>`;
          if (type === 'wood' || type === 'mix') for (const [r1, h] of [[30, 16], [52, 14]]) s += `<rect x="-2.6" y="${-r1 - h}" width="5.2" height="${h}" rx="2.6" fill="#1b1b1c" transform="rotate(${a})"/>`;
          if (type === 'momo') for (const r1 of [36, 54]) s += `<circle transform="rotate(${a}) translate(0,${-r1})" r="4" fill="#0b0b0c" stroke="#3a3a3c" stroke-width=".6"/>`;
          if (type === 'leder') s += `<polyline points="${rot(a, [[-10, -24], [-7, -72]])}" fill="none" stroke="#7a7a7a" stroke-width=".7" stroke-dasharray="2 2"/><polyline points="${rot(a, [[10, -24], [7, -72]])}" fill="none" stroke="#7a7a7a" stroke-width=".7" stroke-dasharray="2 2"/>`;
        }
        if (type === 'wood') s += wood(80, 13) + gloss(81);
        if (type === 'momo') s += leather(80, 15) + gloss(83);
        if (type === 'leder') s += leather(80, 16) + gloss(84);
        if (type === 'mix') s += wood(80, 14) + leather(80, 16, 235, 305) + leather(80, 16, 55, 125) + gloss(81);
        for (const a of [90, 180, 270]) for (const d of [-4, 4]) s += `<circle transform="translate(${P(80, a + d).replace(' ', ',')})" r="1.3" fill="url(#${u}ch)"/>`;
        s += `<circle r="25" fill="#171718"/><circle r="25" fill="none" stroke="url(#${u}${sp === 'al' ? 'al' : 'ch'})" stroke-width="1.6"/><circle r="18" fill="url(#${u}bk)"/>`;
      }
      return svg('-104 -104 208 208', s + '</g>');
    }

    // ---------- Sitze (Frontansicht), Farbe aus Interieur ----------
    function seat(style, color) {
      const u = 'kd' + (++uidN), c = color || '#2a2a2a', st = stitchCol(c), nm = (style || '').toLowerCase();
      const type = /recaro|schale/.test(nm) && !/leicht/.test(nm) ? 'recaro' : /leicht|gfk/.test(nm) ? 'shell' : /komfort/.test(nm) ? 'comfort' : 'sport';
      let s = `<defs>${base(u)}${mat(u, 'm', c)}${mat(u, 'b', sh(c, -.18))}${mat(u, 'p', sh(c, .06), false)}` +
        `<pattern id="${u}cf" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#2b2c2e"/><rect width="3" height="6" fill="#323336"/></pattern></defs><g filter="url(#${u}sh)">`;
      const pleatsH = (x, y, w, h, n) => { let g = ''; for (let i = 1; i < n; i++) g += `<line x1="${x + 3}" x2="${x + w - 3}" y1="${f(y + i * h / n)}" y2="${f(y + i * h / n)}" stroke="${sh(c, -.45)}" stroke-opacity=".55" stroke-width="1.4"/>`; return g; };
      const pleatsV = (x, y, w, h, n) => { let g = ''; for (let i = 1; i < n; i++) g += `<line y1="${y + 3}" y2="${y + h - 3}" x1="${f(x + i * w / n)}" x2="${f(x + i * w / n)}" stroke="${sh(c, -.45)}" stroke-opacity=".55" stroke-width="1.4"/>`; return g; };
      const stitch = d => `<path d="${d}" fill="none" stroke="${st}" stroke-width=".9" stroke-dasharray="2.4 2" stroke-opacity=".9"/>`;
      if (type === 'sport') {
        s += `<rect x="88" y="42" width="4" height="14" fill="url(#${u}ch)"/><rect x="108" y="42" width="4" height="14" fill="url(#${u}ch)"/>`;
        s += `<rect x="70" y="10" width="60" height="36" rx="15" fill="url(#${u}m)"/>` + stitch('M76,16 Q100,12 124,16');
        s += `<path d="M58,54 Q58,50 64,50 L136,50 Q142,50 142,54 L150,150 Q151,162 140,162 L60,162 Q49,162 50,150 Z" fill="url(#${u}b)"/>`;
        s += `<rect x="72" y="56" width="56" height="100" rx="9" fill="url(#${u}m)"/>` + pleatsH(72, 56, 56, 100, 8) + stitch('M75,60 L75,152 M125,60 L125,152');
        s += `<path d="M40,166 L160,166 Q170,167 167,178 L160,208 Q158,216 148,216 L52,216 Q42,216 40,208 L33,178 Q30,167 40,166 Z" fill="url(#${u}b)"/>`;
        s += `<path d="M66,170 L134,170 L138,210 L62,210 Z" fill="url(#${u}m)"/>` + pleatsV(64, 170, 72, 40, 6);
      } else if (type === 'recaro') {
        s += `<path d="M66,22 Q66,6 100,6 Q134,6 134,22 L136,46 Q150,48 156,60 L162,150 Q163,164 150,164 L50,164 Q37,164 38,150 L44,60 Q50,48 64,46 Z" fill="url(#${u}b)"/>`;
        s += `<path d="M80,18 Q80,12 100,12 Q120,12 120,18 L121,40 L79,40 Z" fill="url(#${u}m)"/>`;
        s += `<path d="M74,58 L126,58 L130,156 L70,156 Z" fill="url(#${u}m)"/>` + pleatsH(72, 70, 56, 86, 7);
        s += `<rect x="78" y="46" width="11" height="5" rx="2.5" fill="#0d0d0e"/><rect x="111" y="46" width="11" height="5" rx="2.5" fill="#0d0d0e"/>`;
        s += `<path d="M44,62 Q56,66 66,100 L68,150 L52,156 Q42,150 42,138 Z" fill="${sh(c, -.08)}" opacity=".9"/><path d="M156,62 Q144,66 134,100 L132,150 L148,156 Q158,150 158,138 Z" fill="${sh(c, -.08)}" opacity=".9"/>`;
        s += stitch('M72,60 L68,154 M128,60 L132,154');
        s += `<path d="M34,168 L166,168 Q174,170 171,182 L162,210 Q159,218 149,218 L51,218 Q41,218 38,210 L29,182 Q26,170 34,168 Z" fill="url(#${u}b)"/>`;
        s += `<path d="M70,172 L130,172 L134,212 L66,212 Z" fill="url(#${u}m)"/><rect x="94" y="196" width="12" height="5" rx="2.5" fill="#0d0d0e"/>`;
      } else if (type === 'comfort') {
        s += `<rect x="86" y="44" width="5" height="14" fill="url(#${u}ch)"/><rect x="109" y="44" width="5" height="14" fill="url(#${u}ch)"/>`;
        s += `<rect x="62" y="8" width="76" height="40" rx="18" fill="url(#${u}m)"/>`;
        s += `<path d="M48,58 Q48,50 58,50 L142,50 Q152,50 152,58 L156,154 Q156,164 146,164 L54,164 Q44,164 44,154 Z" fill="url(#${u}m)"/>`;
        for (let i = 0; i < 5; i++) s += `<rect x="${64 + i * 15}" y="58" width="13" height="98" rx="6.5" fill="url(#${u}p)" stroke="${sh(c, -.4)}" stroke-opacity=".5" stroke-width="1"/>`;
        s += stitch('M54,56 L50,158 M146,56 L150,158');
        s += `<path d="M36,166 L164,166 Q176,168 172,182 L164,212 Q162,220 150,220 L50,220 Q38,220 36,212 L28,182 Q24,168 36,166 Z" fill="url(#${u}m)"/>`;
        for (let i = 0; i < 5; i++) s += `<rect x="${60 + i * 16.5}" y="172" width="14" height="42" rx="7" fill="url(#${u}p)" stroke="${sh(c, -.4)}" stroke-opacity=".5" stroke-width="1"/>`;
      } else {   // Leichtbau-Schale (GFK)
        s += `<path d="M66,22 Q66,4 100,4 Q134,4 134,22 L136,44 Q150,46 156,58 L162,152 Q163,166 150,166 L50,166 Q37,166 38,152 L44,58 Q50,46 64,44 Z" fill="url(#${u}cf)" stroke="#1a1a1b" stroke-width="1.2"/>`;
        s += `<path d="M34,168 L166,168 Q174,170 171,182 L162,210 Q159,220 149,220 L51,220 Q41,220 38,210 L29,182 Q26,170 34,168 Z" fill="url(#${u}cf)" stroke="#1a1a1b" stroke-width="1.2"/>`;
        s += `<rect x="78" y="46" width="12" height="6" rx="3" fill="#0b0b0c"/><rect x="110" y="46" width="12" height="6" rx="3" fill="#0b0b0c"/><rect x="93" y="200" width="14" height="6" rx="3" fill="#0b0b0c"/>`;
        s += `<path d="M80,14 Q80,10 100,10 Q120,10 120,14 L120,36 L80,36 Z" fill="url(#${u}m)"/>`;
        s += `<path d="M72,58 L128,58 L131,154 L69,154 Z" fill="url(#${u}m)"/>` + stitch('M75,61 L72,151 M125,61 L128,151');
        s += `<path d="M64,174 L136,174 L139,196 L61,196 Z" fill="url(#${u}m)"/>`;
        s += `<path d="M50,60 L46,150" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>`;
      }
      return svg('0 0 200 226', s + '</g>');
    }

    // ---------- Sitzkonfiguration (Bus, Draufsicht) ----------
    function seating(name, color) {
      const u = 'kd' + (++uidN), c = color || '#3a3a3a';
      let s = `<defs>${base(u)}${mat(u, 'm', c)}</defs><g filter="url(#${u}sh)"><rect x="14" y="16" width="252" height="108" rx="26" fill="#ecebe8" stroke="#bdbbb6" stroke-width="2"/>`;
      s += `<rect x="18" y="22" width="36" height="96" rx="18" fill="#d9d7d2"/>`;
      const seatT = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="url(#${u}m)"/><rect x="${x + (w > h ? 0 : w - 7)}" y="${y + (w > h ? h - 7 : 0)}" width="${w > h ? w : 7}" height="${w > h ? 7 : h}" rx="3.5" fill="${sh(c, -.3)}"/>`;
      s += seatT(64, 28, 30, 34) + seatT(64, 78, 30, 34);
      if (/bank/i.test(name)) { s += `<rect x="118" y="26" width="24" height="88" rx="6" fill="url(#${u}m)"/><rect x="118" y="26" width="7" height="88" rx="3.5" fill="${sh(c, -.3)}"/>`; s += `<rect x="208" y="26" width="24" height="88" rx="6" fill="url(#${u}m)"/><rect x="225" y="26" width="7" height="88" rx="3.5" fill="${sh(c, -.3)}"/><rect x="156" y="52" width="38" height="36" rx="4" fill="#cfcdc8"/>`; }
      else s += seatT(130, 28, 30, 34) + seatT(130, 78, 30, 34) + seatT(196, 28, 30, 34) + seatT(196, 78, 30, 34);
      return svg('0 0 280 140', s + '</g>');
    }

    // ---------- Radio ----------
    function radio(name, dash) {
      const u = 'kd' + (++uidN), nm = name.toLowerCase(), d = dash || '#3a3a3a';
      let s = `<defs>${base(u)}${mat(u, 'd', d)}${lg(u + 'gw', [[0, '#211d16'], [1, '#0f0d0a']], 0, 1)}</defs><g filter="url(#${u}sh)"><rect x="6" y="10" width="268" height="116" rx="14" fill="url(#${u}d)"/>`;
      if (/ohne/.test(nm)) {
        s += `<rect x="54" y="40" width="172" height="54" rx="5" fill="${sh(d, -.12)}" stroke="url(#${u}ch)" stroke-width="2.5"/>` + `<circle cx="66" cy="67" r="3" fill="url(#${u}ch)"/><circle cx="214" cy="67" r="3" fill="url(#${u}ch)"/>`;
        for (let i = 0; i < 9; i++) s += `<rect x="${92 + i * 11}" y="56" width="4" height="22" rx="2" fill="${sh(d, -.4)}"/>`;
        return svg('0 0 280 136', s + '</g>');
      }
      const dark = /europa/.test(nm);
      s += `<rect x="30" y="30" width="220" height="76" rx="7" fill="${dark ? '#19191b' : 'url(#' + u + 'ch)'}" stroke="${dark ? 'url(#' + u + 'ch)' : '#8a8f94'}" stroke-width="${dark ? 2.5 : 1}"/>`;
      s += `<rect x="76" y="38" width="128" height="28" rx="3" fill="url(#${u}gw)" stroke="#555" stroke-width=".8"/>`;
      for (let i = 0; i <= 20; i++) s += `<line x1="${82 + i * 5.8}" x2="${82 + i * 5.8}" y1="${i % 5 ? 56 : 52}" y2="60" stroke="#e8dcbf" stroke-width=".7"/>`;
      [88, 92, 96, 100, 104, 108].forEach((t, i) => { s += `<text x="${82 + i * 23.2}" y="48.5" font-size="6.2" font-family="Helvetica,Arial,sans-serif" fill="#e8dcbf" text-anchor="middle">${t}</text>`; });
      s += `<line x1="141" x2="141" y1="40" y2="64" stroke="#e7a548" stroke-width="1.4"/>`;
      for (const x of [52, 228]) s += `<circle cx="${x}" cy="62" r="14" fill="${dark ? '#202022' : 'url(#' + u + 'al)'}" stroke="#555" stroke-width=".8"/><circle cx="${x}" cy="62" r="11" fill="none" stroke="${dark ? '#8a8f94' : '#777'}" stroke-width="1.6" stroke-dasharray="1 1.4"/><circle cx="${x}" cy="62" r="5" fill="url(#${u}ch)"/>`;
      for (let i = 0; i < 5; i++) s += `<rect x="${82 + i * 24}" y="74" width="20" height="22" rx="2.5" fill="${dark ? '#262628' : '#efe8d6'}" stroke="${dark ? '#555' : '#a79f8b'}" stroke-width=".8"/><rect x="${82 + i * 24}" y="74" width="20" height="5" rx="2" fill="${dark ? 'url(#' + u + 'ch)' : '#fffaf0'}"/>`;
      if (dark) s += `<circle cx="214" cy="40" r="2" fill="#5fa3d6"/>`;
      return svg('0 0 280 136', s + '</g>');
    }

    // ---------- Motorrad: Lenker, Auspuff, Sitzbank ----------
    function bars(name) {
      const u = 'kd' + (++uidN), nm = name.toLowerCase();
      const path = /superbike/.test(nm) ? 'M28,84 Q60,80 100,76 L180,76 Q220,80 252,84' : /cruiser/.test(nm) ? 'M120,74 L114,40 Q110,22 84,22 Q50,24 30,42 M160,74 L166,40 Q170,22 196,22 Q230,24 250,42' : /ace/.test(nm) ? 'M30,104 Q70,100 104,80 L120,72 L160,72 L176,80 Q210,100 250,104' : 'M30,62 Q66,52 104,64 L120,70 L160,70 L176,64 Q214,52 250,62';
      const ends = /superbike/.test(nm) ? [[28, 84], [252, 84]] : /cruiser/.test(nm) ? [[30, 42], [250, 42]] : /ace/.test(nm) ? [[30, 104], [250, 104]] : [[30, 62], [250, 62]];
      let s = `<defs>${base(u)}</defs><g filter="url(#${u}sh)">`;
      s += `<rect x="112" y="70" width="56" height="12" rx="4" fill="url(#${u}al)"/><rect x="116" y="82" width="10" height="30" fill="url(#${u}ch)"/><rect x="154" y="82" width="10" height="30" fill="url(#${u}ch)"/>`;
      s += `<circle cx="140" cy="118" r="20" fill="url(#${u}ch)"/><circle cx="140" cy="118" r="14" fill="#e9eef0" stroke="#999" stroke-width="1"/>`;
      s += `<path d="${path}" fill="none" stroke="#5b6066" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/><path d="${path}" fill="none" stroke="url(#${u}ch)" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>`;
      if (/cruiser/.test(nm)) s += `<rect x="112" y="66" width="56" height="12" rx="4" fill="url(#${u}al)"/>`;
      for (const [x, y] of ends) { const dx = x < 140 ? -1 : 1; s += `<rect x="${x - (dx < 0 ? 4 : 18)}" y="${y - 6}" width="22" height="12" rx="6" fill="#161617" transform="rotate(${dx * 4} ${x} ${y})"/>`; s += `<path d="M${x - dx * 22},${y + 4} q${dx * 14},10 ${dx * 30},6" fill="none" stroke="url(#${u}al)" stroke-width="3" stroke-linecap="round"/>`; }
      return svg('0 0 280 144', s + '</g>');
    }
    function exhaust(name) {
      const u = 'kd' + (++uidN), nm = name.toLowerCase(), chrome = !/serie/.test(nm);
      const m = chrome ? 'ch' : 'sat';
      let s = `<defs>${base(u)}${lg(u + 'sat', [[0, '#c9ccd0'], [.45, '#8c9196'], [.6, '#aeb2b6'], [1, '#6b7075']], 0, 1)}${lg(u + 'v', [[0, '#fdfdfd'], [.3, '#a3a8ad'], [.5, '#f1f3f4'], [.75, '#74797e'], [1, '#c8ccd0']], 0, 1)}</defs><g filter="url(#${u}sh)">`;
      s += `<rect x="14" y="20" width="64" height="58" rx="8" fill="#4a4c50"/>`;
      for (let i = 0; i < 6; i++) s += `<rect x="18" y="${24 + i * 9}" width="56" height="5" rx="2" fill="#6a6d72"/>`;
      const g = chrome ? 'v' : 'sat';
      if (/megaphon/.test(nm)) {
        s += `<path d="M60,72 Q66,96 96,96 L120,96" fill="none" stroke="url(#${u}${g})" stroke-width="11" stroke-linecap="round"/>`;
        s += `<path d="M118,90 L260,76 L260,116 L118,102 Z" fill="url(#${u}v)" stroke="#777" stroke-width=".8"/><ellipse cx="260" cy="96" rx="6" ry="20" fill="#1a1a1b" stroke="url(#${u}ch)" stroke-width="2"/>`;
      } else if (/sport/.test(nm)) {
        s += `<path d="M60,72 Q66,98 100,96 L140,90" fill="none" stroke="url(#${u}v)" stroke-width="11" stroke-linecap="round"/>`;
        s += `<g transform="rotate(-8 190 84)"><rect x="132" y="70" width="112" height="28" rx="14" fill="url(#${u}v)" stroke="#777" stroke-width=".8"/><ellipse cx="244" cy="84" rx="5" ry="10" fill="#222"/><rect x="146" y="70" width="3" height="28" fill="#fff" opacity=".5"/></g>`;
      } else {
        s += `<path d="M60,72 Q66,100 100,100 L130,100" fill="none" stroke="url(#${u}sat)" stroke-width="11" stroke-linecap="round"/>`;
        s += `<path d="M124,90 L140,86 L236,86 Q250,86 254,100 Q250,114 236,114 L140,114 L124,110 Z" fill="url(#${u}sat)" stroke="#666" stroke-width=".8"/><rect x="252" y="96" width="14" height="8" rx="2" fill="url(#${u}sat)"/>`;
      }
      s += `<line x1="150" y1="60" x2="160" y2="${/sport/.test(nm) ? 76 : 86}" stroke="#333" stroke-width="3"/>`;
      return svg('0 0 280 136', s + '</g>');
    }
    function saddle(name, color, small) {
      const u = 'kd' + (++uidN), c = color || '#222', nm = name.toLowerCase();
      let s = `<defs>${base(u)}${mat(u, 'm', c)}<clipPath id="${u}c"><path id="${u}p" d="M22,74 Q30,50 72,46 L150,40 Q176,38 192,30 Q216,20 238,32 Q246,42 234,54 L202,64 Q140,74 42,82 Q20,84 22,74 Z"/></clipPath></defs><g filter="url(#${u}sh)" ${small ? 'transform="translate(40 10) scale(.75)"' : ''}>`;
      s += `<path d="M30,84 L230,58" stroke="#3a3b3d" stroke-width="7" stroke-linecap="round"/><path d="M40,84 L44,100 M208,62 L214,84" stroke="url(#${u}al)" stroke-width="5"/>`;
      s += `<path d="M22,74 Q30,50 72,46 L150,40 Q176,38 192,30 Q216,20 238,32 Q246,42 234,54 L202,64 Q140,74 42,82 Q20,84 22,74 Z" fill="url(#${u}m)"/>`;
      if (/geriffelt/.test(nm)) { s += `<g clip-path="url(#${u}c)">`; for (let x = 40; x < 240; x += 8) s += `<line x1="${x}" y1="20" x2="${x + 4}" y2="90" stroke="${sh(c, .22)}" stroke-width="2.2"/><line x1="${x + 3}" y1="20" x2="${x + 7}" y2="90" stroke="${sh(c, -.5)}" stroke-width="1"/>`; s += '</g>'; }
      if (/braun|stepp/.test(nm) || /braun/.test(nm)) s += `<path d="M34,70 Q42,56 74,53 L150,47 Q176,45 194,37 Q214,29 230,37" fill="none" stroke="${stitchCol(c)}" stroke-width="1" stroke-dasharray="2.6 2.2"/>`;
      s += `<path d="M40,60 Q60,52 100,50" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="3" stroke-linecap="round"/>`;
      return svg('0 0 260 112', s + '</g>');
    }

    // ---------- Fahrzeug-Silhouetten: Verdeck, Fahrwerk, Zubehör ----------
    function wheelSide(u, cx, cy, r) { return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#1b1b1c"/><circle cx="${cx}" cy="${cy}" r="${f(r * .55)}" fill="url(#${u}al)"/><circle cx="${cx}" cy="${cy}" r="${f(r * .2)}" fill="#555"/>`; }
    function softtop(name, topColor, paint) {
      const u = 'kd' + (++uidN), p = paint || '#8a8f94', t = topColor || '#1f1d1c';
      let s = `<defs>${base(u)}${mat(u, 'p', p)}${mat(u, 't', t)}</defs><g filter="url(#${u}sh)">`;
      s += `<path d="M140,38 Q146,30 162,30 L206,30 Q226,32 240,54 L250,70 L136,66 Z" fill="url(#${u}t)"/>`;
      s += `<path d="M150,62 L153,40 Q156,36 164,36 L196,36 L200,62 Z" fill="url(#${u}gl)" opacity=".85"/><line x1="216" y1="34" x2="230" y2="66" stroke="${sh(t, -.35)}" stroke-width="1.2"/><line x1="204" y1="31" x2="214" y2="66" stroke="${sh(t, -.35)}" stroke-width="1"/>`;
      s += `<line x1="122" y1="66" x2="142" y2="36" stroke="url(#${u}ch)" stroke-width="3" stroke-linecap="round"/>`;
      s += `<path d="M16,98 L16,86 Q18,76 34,74 L96,68 Q110,66 122,66 L200,66 Q220,66 238,70 L272,78 Q286,82 286,94 L286,98 Q286,102 282,102 L252,102 A24,24 0 0 0 204,102 L98,102 A24,24 0 0 0 50,102 L20,102 Q16,102 16,98 Z" fill="url(#${u}p)"/>`;
      s += `<path d="M24,84 L276,86" stroke="#fff" stroke-opacity=".25" stroke-width="1.5"/><line x1="130" y1="70" x2="128" y2="100" stroke="${sh(p, -.4)}" stroke-width="1"/><circle cx="26" cy="82" r="6" fill="url(#${u}ch)"/><rect x="12" y="94" width="20" height="5" rx="2.5" fill="url(#${u}ch)"/><rect x="270" y="94" width="20" height="5" rx="2.5" fill="url(#${u}ch)"/>`;
      s += wheelSide(u, 74, 104, 21) + wheelSide(u, 228, 104, 21);
      return svg('0 0 300 132', s + '</g>');
    }
    function offroad(fahrwerk, zubehoer, paint, top) {
      const u = 'kd' + (++uidN), p = paint || '#5d6448', fw = (fahrwerk || '').toLowerCase(), z = (zubehoer || '').toLowerCase();
      const L = /4"/.test(fw) ? 16 : /2"/.test(fw) ? 8 : 0, r = 22 + L / 4, cy = 154 - r;
      let s = `<defs>${base(u)}${mat(u, 'p', p)}</defs><g filter="url(#${u}sh)"><line x1="10" y1="154" x2="290" y2="154" stroke="#cfcdc8" stroke-width="2"/>`;
      for (const x of [78, 226]) s += `<rect x="${x - 4}" y="${cy - 36 - L}" width="8" height="${36 + L}" fill="#4a4c50"/><rect x="${x - 2}" y="${cy - 34 - L}" width="4" height="${30 + L}" fill="url(#${u}ch)"/>`;
      s += `<g transform="translate(0 ${-L})">`;
      if (/expedition/.test(z)) {
        s += `<rect x="94" y="28" width="156" height="5" rx="2" fill="#2a2a2c"/>`; for (let x = 100; x < 250; x += 16) s += `<rect x="${x}" y="22" width="3" height="8" fill="#2a2a2c"/>`;
        s += `<rect x="96" y="18" width="150" height="4" rx="2" fill="#2a2a2c"/><rect x="200" y="6" width="18" height="16" rx="2" fill="#5b6146"/><rect x="220" y="6" width="18" height="16" rx="2" fill="#5b6146"/><rect x="100" y="10" width="60" height="7" rx="2" fill="#1d1d1e"/>`;
        for (let i = 0; i < 7; i++) s += `<circle cx="${105 + i * 8.3}" cy="13.5" r="2.3" fill="#f4f6f7"/>`;
      }
      s += `<path d="M28,124 L28,80 Q28,74 34,74 L70,74 L88,42 Q90,38 96,38 L244,38 Q252,38 254,46 L260,74 L270,76 Q278,78 278,86 L278,124 Q278,128 274,128 L254,128 A28,28 0 0 0 198,128 L106,128 A28,28 0 0 0 50,128 L32,128 Q28,128 28,124 Z" fill="url(#${u}p)"/>`;
      s += `<path d="M96,44 L140,44 L140,72 L78,72 Z M148,44 L196,44 L196,72 L148,72 Z M204,44 L246,44 L252,72 L204,72 Z" fill="url(#${u}gl)" opacity=".9"/>`;
      if (top) s += `<defs>${mat(u, 't', top)}</defs><path d="M144,36 L244,36 Q253,36 255,45 L261,75 L144,75 Z" fill="url(#${u}t)"/><path d="M158,46 L192,46 L192,64 L158,64 Z M206,46 L240,46 L244,64 L206,64 Z" fill="url(#${u}gl)" opacity=".75"/><path d="M199,38 L199,74 M146,40 L258,40" stroke="${sh(top, -.35)}" stroke-width="1"/>`;
      s += `<line x1="144" y1="76" x2="144" y2="126" stroke="${sh(p, -.4)}" stroke-width="1"/><line x1="200" y1="76" x2="200" y2="126" stroke="${sh(p, -.4)}" stroke-width="1"/><circle cx="34" cy="90" r="7" fill="url(#${u}ch)"/><rect x="20" y="112" width="16" height="12" rx="2" fill="#222"/><rect x="272" y="112" width="14" height="12" rx="2" fill="#222"/>`;
      if (/expedition/.test(z)) s += `<path d="M66,96 L70,80 L84,46 L90,32" fill="none" stroke="#1d1d1e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><rect x="12" y="110" width="14" height="14" rx="3" fill="#333"/><circle cx="19" cy="117" r="4" fill="url(#${u}al)"/>`;
      if (/urban/.test(z)) {
        s += `<rect x="104" y="128" width="96" height="6" rx="2" fill="url(#${u}al)"/><path d="M38,84 h-6 M38,90 h-6 M38,96 h-6" stroke="#222" stroke-width="1.4"/><circle cx="34" cy="90" r="8" fill="none" stroke="#222" stroke-width="1.6"/>`;
        s += `<path d="M24,128 L16,104 Q14,96 22,94 L26,94" fill="none" stroke="url(#${u}ch)" stroke-width="4" stroke-linecap="round"/><path d="M20,112 L28,112" stroke="url(#${u}ch)" stroke-width="3"/>`;
      }
      s += '</g>' + wheelSide(u, 78, cy, r) + wheelSide(u, 226, cy, r);
      for (const x of [78, 226]) for (let i = 0; i < 16; i++) s += `<rect x="${x - 2}" y="${cy - r - 1.5}" width="4" height="4" fill="#111" transform="rotate(${i * 22.5} ${x} ${cy})"/>`;
      if (L) s += `<text x="292" y="${cy - 30}" font-size="9" font-family="Helvetica,Arial,sans-serif" fill="#737373" text-anchor="end">+${L / 4}"</text>`;
      return svg('0 0 300 160', s + '</g>');
    }

    // ---------- Unterboden ----------
    function underbody(name) {
      const u = 'kd' + (++uidN), nm = name.toLowerCase();
      const state = /sanders/.test(nm) ? 'wax' : /schutz/.test(nm) && !/kein/.test(nm) ? 'coat' : /wäsche|prüf/.test(nm) ? 'clean' : 'raw';
      const metal = state === 'raw' ? '#7d7b74' : '#9aa0a5';
      let s = `<defs>${base(u)}${mat(u, 'm', metal)}${mat(u, 'r', sh(metal, -.12))}` +
        `<pattern id="${u}stp" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#1c1c1d"/><circle cx="1.5" cy="1.5" r="1" fill="#2e2e30"/><circle cx="3.8" cy="3.6" r=".8" fill="#141415"/></pattern>` +
        lg(u + 'wx', [[0, '#e0b25a'], [.5, '#a8741f'], [1, '#c8923a']], 0, 1) + `</defs><g filter="url(#${u}sh)">`;
      s += `<rect x="14" y="16" width="252" height="96" rx="8" fill="url(#${u}m)"/>`;
      for (let i = 0; i < 4; i++) s += `<rect x="24" y="${26 + i * 21}" width="232" height="11" rx="5.5" fill="url(#${u}r)"/><rect x="24" y="${26 + i * 21}" width="232" height="3" rx="1.5" fill="#fff" opacity=".18"/>`;
      if (state === 'raw') [[48, 30, 9], [96, 74, 7], [150, 46, 11], [200, 92, 8], [232, 38, 6], [70, 96, 6], [180, 64, 5]].forEach(([x, y, r]) => { s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#8a4a20" opacity=".72"/><circle cx="${x + 2}" cy="${y - 1}" r="${f(r * .55)}" fill="#6b3414" opacity=".7"/>`; });
      if (state === 'clean') s += `<ellipse cx="160" cy="62" rx="70" ry="34" fill="#fff" opacity=".22"/><circle cx="236" cy="38" r="15" fill="#1f1f1f"/><path d="M229,38 l5,5 l9,-10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      if (state === 'coat') s += `<rect x="14" y="16" width="252" height="96" rx="8" fill="url(#${u}stp)"/>` + Array.from({ length: 4 }, (_, i) => `<rect x="24" y="${26 + i * 21}" width="232" height="11" rx="5.5" fill="#000" opacity=".25"/><rect x="24" y="${26 + i * 21}" width="232" height="2" rx="1" fill="#fff" opacity=".08"/>`).join('');
      if (state === 'wax') { s += `<rect x="14" y="16" width="252" height="96" rx="8" fill="url(#${u}wx)" opacity=".62"/><path d="M30,22 Q120,30 250,22" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none" stroke-linecap="round"/>`; [60, 132, 204].forEach(x => { s += `<path d="M${x},112 q-3,8 0,12 q3,-4 0,-12 Z" fill="#b8822c" opacity=".85"/>`; }); }
      return svg('0 0 280 132', s + '</g>');
    }

    // Auswahl → Zeichnung (null = keine Detailansicht, z. B. Lackfarbe)
    function detail(stepName, optName, ctx) {
      const n = (stepName || '').toLowerCase(), o = optName || '';
      if (/felge|räder|rad$/.test(n) && !/lenkrad/.test(n)) return wheel(o, ctx.moto);
      if (/lenkrad/.test(n)) return steering(o);
      if (/sitzkonfig/.test(n)) return seating(o, ctx.seat);
      if (/sitzbank/.test(n) || (/^sitz$/.test(n) && ctx.moto)) return saddle(o, ctx.colorOf(o) || ctx.seat, /^sitz$/.test(n));
      if (/^sitze$|^sitz$/.test(n)) return seat(o, ctx.seat);
      if (/interieur|innenausstattung/.test(n)) return ctx.moto ? saddle(o, ctx.colorOf(o)) : seat(ctx.seatStyle, ctx.colorOf(o) || ctx.seat);
      if (/radio/.test(n)) return radio(o, ctx.dash);
      if (/lenker/.test(n)) return bars(o);
      if (/auspuff/.test(n)) return exhaust(o);
      if (/verdeck/.test(n)) return ctx.offroad ? offroad(ctx.sel('fahrwerk|reifen'), ctx.sel('zubeh'), ctx.paint, ctx.colorOf(o)) : softtop(o, ctx.colorOf(o), ctx.paint);
      if (/fahrwerk|reifen/.test(n)) return offroad(o, ctx.sel('zubeh'), ctx.paint, ctx.colorOf(ctx.sel('verdeck')));
      if (/zubeh/.test(n)) return offroad(ctx.sel('fahrwerk|reifen'), o, ctx.paint, ctx.colorOf(ctx.sel('verdeck')));
      if (/unterboden/.test(n)) return underbody(o);
      return null;
    }
    return { detail };
  })();

  // ---- Konfiguration (Configurator.jsx) ----
  let vehicle = null, currentStep = 0, selections = {}, selectedView = 0;
  const interiorKeywords = ['interieur', 'sitz', 'lenkrad', 'radio', 'innenraum'];
  const steps = () => vehicle.configurator_steps || [];
  const gallery = () => vehicle.gallery_images?.length ? vehicle.gallery_images : [{ url: vehicle.image_url, label: 'Front 3/4', view_type: 'exterior' }];
  const isLight = hex => { if (!hex) return true; const c = hex.replace('#', ''); return (parseInt(c.substr(0, 2), 16) * 299 + parseInt(c.substr(2, 2), 16) * 587 + parseInt(c.substr(4, 2), 16) * 114) / 1000 > 140; };
  function defaults() { selections = {}; steps().forEach(s => { if (s.options?.length > 0) selections[s.step_name] = s.options[0].name; }); }
  function viewForStep() {   // Innenraum-Schritte zeigen die Innenansicht
    const step = steps()[currentStep]; if (!step) return;
    const g = gallery(), isInterior = interiorKeywords.some(k => step.step_name?.toLowerCase().includes(k));
    const idx = isInterior ? g.findIndex(x => x.view_type === 'interior') : g.findIndex(x => x.view_type !== 'interior');
    selectedView = idx >= 0 ? idx : 0;
  }
  function paint() {
    const g = gallery(), active = g[selectedView] || g[0], isExterior = active?.view_type !== 'interior', hasInterior = g.some(x => x.view_type === 'interior');
    const paintStep = steps().find(s => s.options?.every(o => o.color_hex) && !/sitz|interieur|seat|innenausstattung/i.test(s.step_name || ''));
    const paintColor = paintStep?.options?.find(o => o.name === selections[paintStep.step_name])?.color_hex;
    const seatStep = steps().find(s => /sitz|interieur|seat|innenausstattung/i.test(s.step_name || '') && s.options?.some(o => o.color_hex));
    const seatColor = seatStep?.options?.find(o => o.name === selections[seatStep?.step_name])?.color_hex;
    $('kc-canvas').setAttribute('aria-label', `${vehicle.brand} ${vehicle.model_name}`);
    $('kc-thumbs').innerHTML = g.map((im, i) => `<button type="button" class="kc-thumb${selectedView === i ? ' on' : ''}" data-view="${i}" aria-pressed="${selectedView === i}"><img src="${esc(im.url)}" alt="${esc(im.label || 'Ansicht ' + (i + 1))}"></button>`).join('');
    // Lackfarbe auch im Innenraum (lackierte Türbleche usw. tragen dieselbe Platzhalterfarbe)
    tintedImage(active.url, paintColor, (!hasInterior || !isExterior) ? seatColor : undefined, !isExterior && !/motorrad|mofa|roller/i.test(vehicle.vehicle_type || ''));
    tintThumbs(g, paintColor, seatColor, hasInterior);
    updateDetail();
  }
  function detailCtx() {   // Zusammenhang für die Zeichnungen: Lack, Interieurfarbe, gewählte Sitzform
    const st = steps(), selOf = re => { const x = st.find(s => re.test(s.step_name || '')); return x ? selections[x.step_name] : ''; };
    const hexOf = (re, name) => { for (const s of st) if (!re || re.test(s.step_name || '')) { const o = s.options?.find(x => x.name === name && x.color_hex); if (o) return o.color_hex; } return ''; };
    const paintStep = st.find(s => s.options?.every(o => o.color_hex) && !/sitz|interieur|seat|innenausstattung|verdeck/i.test(s.step_name || ''));
    const paintColor = paintStep ? hexOf(null, selections[paintStep.step_name]) : '';
    const seatStep = st.find(s => /interieur|innenausstattung|sitzbank|^sitz$/i.test(s.step_name || '') && s.options?.some(o => o.color_hex));
    return { moto: /motorrad|mofa|roller/i.test(vehicle.vehicle_type || ''), offroad: /gelände/i.test(vehicle.category || '') || st.some(s => /fahrwerk/i.test(s.step_name || '')), paint: paintColor, dash: paintColor, seat: seatStep ? hexOf(null, selections[seatStep.step_name]) : '#2a2a2a',
      seatStyle: selOf(/^sitze$/i), colorOf: name => hexOf(null, name), sel: k => selOf(new RegExp(k, 'i')) };
  }
  function updateDetail() {
    const step = steps()[currentStep], box = $('kc-detail');
    const art = step ? KD.detail(step.step_name, selections[step.step_name], detailCtx()) : null;
    if (!art) { box.hidden = true; return; }
    const key = step.step_name + '|' + selections[step.step_name];
    if (box.dataset.key !== key) { box.classList.remove('swap'); void box.offsetWidth; box.classList.add('swap'); box.dataset.key = key; }
    $('kc-detail-art').innerHTML = art; $('kc-detail-step').textContent = 'Detail · ' + step.step_name; $('kc-detail-name').textContent = selections[step.step_name] || '';
    box.hidden = false;
  }
  function render() {
    const s = steps(), isSummary = currentStep >= s.length, step = s[currentStep];
    $('kc-conf').classList.toggle('is-summary', isSummary);
    $('kc-summary').hidden = !isSummary; $('kc-options').hidden = isSummary; $('kc-next').hidden = isSummary;
    saveUrl();
    $('kc-prev').disabled = currentStep === 0;
    if (isSummary) {
      $('kc-step-name').textContent = 'Zusammenfassung'; $('kc-step-num').textContent = `Schritt ${s.length + 1}/${s.length + 1}`;
      $('kc-opt-name').textContent = `${vehicle.brand} ${vehicle.model_name}`; $('kc-opt-desc').textContent = 'Prüfen Sie Ihre Auswahl und senden Sie uns die Konfiguration – wir melden uns mit Ihrem individuellen Angebot.';
      $('kc-sum-list').innerHTML = s.map(st => { const o = st.options.find(x => x.name === selections[st.step_name]); if (!o) return ''; const art = KD.detail(st.step_name, o.name, detailCtx()); return art ? `<div class="kc-row has-art"><i class="kc-row-art">${art}</i><div><small>${esc(st.step_name)}</small><span>${esc(o.name)}</span></div></div>` : `<div class="kc-row"><small>${esc(st.step_name)}</small><span>${esc(o.name)}</span></div>`; }).join('') +
        '<div class="kc-row kc-price"><small>Preis</small><span>Individuelles Angebot</span></div>';
      return;
    }
    $('kc-step-name').textContent = step.step_name; $('kc-step-num').textContent = `Schritt ${currentStep + 1}/${s.length}`;
    const sel = step.options?.find(o => o.name === selections[step.step_name]);
    $('kc-opt-name').textContent = sel?.name || ''; $('kc-opt-desc').textContent = sel?.description || '';
    // Schritte ohne Darstellung im Bild (Felgen, Lenkrad, Sitzform, Radio, Unterboden …) ehrlich kennzeichnen
    const visual = step.options?.every(o => o.color_hex);
    let note = $('kc-opt-note'); if (!note) { note = document.createElement('p'); note.id = 'kc-opt-note'; note.className = 'kc-opt-note'; $('kc-opt-desc').after(note); }
    note.hidden = !!visual;
    note.textContent = visual ? '' : 'Die Detailansicht im Bild zeigt Ihre Auswahl. Die genaue Ausführung stimmen wir passend zu Ihrem Fahrzeug mit Ihnen ab – Muster zeigen wir Ihnen gern bei uns in der Werkstatt.';
    $('kc-next').textContent = currentStep === s.length - 1 ? 'Abschluss ›' : 'Weiter ›';
    const isColorStep = step.options?.every(o => o.color_hex);
    $('kc-options').innerHTML = isColorStep
      ? '<div class="kc-swatches">' + step.options.map(o => { const on = selections[step.step_name] === o.name;
          return `<button type="button" class="kc-sw${on ? ' on' : ''}" data-opt="${esc(o.name)}" title="${esc(o.name)}" aria-pressed="${on}"><i style="--c:${esc(o.color_hex)};color:${isLight(o.color_hex) ? '#000' : '#fff'}"></i><span>${esc(o.name)}</span></button>`; }).join('') + '</div>'
      : '<div class="kc-opts">' + step.options.map(o => { const on = selections[step.step_name] === o.name;
          return `<button type="button" class="kc-opt${on ? ' on' : ''}" data-opt="${esc(o.name)}" aria-pressed="${on}"><span><strong>${esc(o.name)}</strong>${o.description ? `<small>${esc(o.description)}</small>` : ''}</span><b>${on ? '✓' : ''}</b></button>`; }).join('') + '</div>';
  }
  $('kc-options').addEventListener('click', e => {
    const b = e.target.closest('[data-opt]'); if (!b) return;
    selections[steps()[currentStep].step_name] = b.dataset.opt; render(); paint();
  });
  // Auswahl im Link speichern, damit Konfigurationen geteilt werden können
  function saveUrl() {
    if (!vehicle) return;
    const idx = steps().map(st => Math.max(0, st.options.findIndex(o => o.name === selections[st.step_name])));
    try { history.replaceState({}, '', `?modell=${encodeURIComponent(vehicle.id)}&wahl=${idx.join('-')}`); } catch (e) {}
  }
  function loadUrl() {
    const w = new URLSearchParams(location.search).get('wahl'); if (!w) return;
    w.split('-').map(Number).forEach((n, i) => { const st = steps()[i]; if (st && st.options[n]) selections[st.step_name] = st.options[n].name; });
  }
  $('kc-share').addEventListener('click', async () => {
    const url = location.href, b = $('kc-share');
    if (navigator.share) { try { await navigator.share({ title: `${vehicle.brand} ${vehicle.model_name} – meine Konfiguration`, url }); } catch (e) {} return; }
    try { await navigator.clipboard.writeText(url); b.textContent = '✓ Link kopiert'; setTimeout(() => { b.textContent = '↗ Teilen'; }, 2000); } catch (e) { prompt('Link kopieren:', url); }
  });
  $('kc-thumbs').addEventListener('click', e => { const b = e.target.closest('.kc-thumb'); if (b) { selectedView = +b.dataset.view; paint(); } });
  $('kc-prev').addEventListener('click', () => { currentStep = Math.max(0, currentStep - 1); viewForStep(); render(); paint(); });
  $('kc-next').addEventListener('click', () => { currentStep++; viewForStep(); render(); paint(); });
  $('kc-reset').addEventListener('click', () => { defaults(); currentStep = 0; viewForStep(); render(); paint(); });
  $('kc-back').addEventListener('click', e => { e.preventDefault(); history.pushState({}, '', 'konfigurator.html'); route(); });
  $('kc-form').addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target; if (!f.checkValidity()) { f.reportValidity(); return; }
    const btn = f.querySelector('.kc-send'), status = $('kc-status'); btn.disabled = true; status.textContent = 'Wird gesendet …';
    const name = `${vehicle.brand} ${vehicle.model_name} ${vehicle.variant || ''}`.trim();
    try {
      const fd = new FormData();
      fd.append('form-name', 'konfigurator'); fd.append('firma', f.firma.value);
      fd.append('name', f.name.value); fd.append('email', f.email.value); fd.append('telefon', f.phone.value);
      fd.append('fahrzeug', name); fd.append('einwilligung', f.einwilligung.checked ? 'ja' : '');
      fd.append('nachricht', steps().map(st => `${st.step_name}: ${selections[st.step_name] || '–'}`).join('\n') + `\n\nLink zur Konfiguration: ${location.href}` + (f.message.value ? `\n\n${f.message.value}` : ''));
      const r = await fetch(f.getAttribute('action'), { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.message || 'Senden fehlgeschlagen');
      f.hidden = true; $('kc-done').hidden = false; document.querySelector('.kc-note').hidden = true;
    } catch (err) {
      btn.disabled = false;
      const t = `Konfiguration: ${name}\n` + steps().map(s => `${s.step_name}: ${selections[s.step_name] || ''}`).join('\n') + `\nName: ${f.name.value}\nE-Mail: ${f.email.value}\nTelefon: ${f.phone.value}\n${f.message.value}`;
      status.innerHTML = 'Das Senden hat gerade nicht geklappt. Schicken Sie Ihre Konfiguration einfach so:<span class="kc-alt"><a target="_blank" rel="noopener" href="https://wa.me/4936754289606?text=' + encodeURIComponent(t) + '">WhatsApp</a><a href="mailto:hallo@taeubert-karosserie-lack.de?subject=' + encodeURIComponent('Konfiguration ' + name) + '&body=' + encodeURIComponent(t) + '">E-Mail</a></span>';
    }
  });

  async function openVehicle(id) {
    $('kc-home').hidden = true; $('kc-conf').hidden = false; window.scrollTo(0, 0);
    vehicle = null;
    if (vehicles.some(v => v.id === id)) vehicle = await loadVehicle(id);
    if (!vehicle) { history.replaceState({}, '', 'konfigurator.html'); return route(); }
    // Interieur-, Sitz- und Verdeck-Optionen ohne Farbwert: Farbe aus dem Namen ableiten, damit sich das Bild sichtbar ändert
    const NAME_COLORS = [[/cognac/i, '#8b4a26'], [/tobacco|tabak/i, '#6e4b2e'], [/burgund|bordeaux|weinrot/i, '#5c2230'], [/braun|brown|mokka/i, '#6a4429'],
      [/beige|creme|cream|sand|natur/i, '#cdb894'], [/cork|kork/i, '#a8855a'], [/palomino/i, '#b07a45'], [/khaki/i, '#8a8458'], [/grau|grey|gray|anthrazit/i, '#5f5f5f'], [/blau|blue/i, '#2c3e5a'], [/gr(ü|ue)n|green/i, '#2f4a3a'],
      [/rot\b|red/i, '#7e2a2a'], [/wei(ß|ss)|white/i, '#e6e2d9'], [/schwarz|black|geriffelt/i, '#1f1d1c']];
    if (vehicle) vehicle = { ...vehicle, configurator_steps: (vehicle.configurator_steps || []).map(st => {
      if (!/interieur|sitzbank|^sitz$|verdeck|innenausstattung/i.test(st.step_name || '') || st.options?.every(o => o.color_hex)) return st;
      const opts = st.options.map(o => { if (o.color_hex) return o; const m = NAME_COLORS.find(([re]) => re.test(o.name || '')); return m ? { ...o, color_hex: m[1] } : o; });
      return opts.every(o => o.color_hex) ? { ...st, options: opts } : st;
    }) };
    // Zusätzlicher Schritt nur auf der Website: Unterboden (nicht bei Motorrad und Mofa/Roller)
    const ohneUnterboden = ['Motorrad', 'Mofa/Roller'];
    if (!ohneUnterboden.includes(vehicle.vehicle_type) && !(vehicle.configurator_steps || []).some(st => /unterboden/i.test(st.step_name || ''))) {
      vehicle = { ...vehicle, configurator_steps: [...(vehicle.configurator_steps || []), { step_name: 'Unterboden', options: [
        { name: 'Kein Unterbodenschutz', description: 'Der Unterboden bleibt, wie er ist.' },
        { name: 'Unterbodenwäsche & Prüfung', description: 'Gründliche Reinigung von Salz und Schmutz, Prüfung auf Rost auf der Hebebühne.' },
        { name: 'Unterbodenschutz', description: 'Roststellen behandeln und eine neue Schutzschicht auftragen.' },
        { name: 'Mike Sanders Versiegelung', description: 'Hohlraum- und Unterbodenkonservierung mit Mike-Sanders-Fett – bleibt elastisch, ideal für Klassiker.' },
      ] }] };
    }
    $('kc-brand').textContent = vehicle.brand; $('kc-model').textContent = `${vehicle.model_name} ${vehicle.variant ? '| ' + vehicle.variant : ''}`;
    $('kc-era').textContent = [vehicle.era, vehicle.vehicle_type].filter(Boolean).join(' · ');
    $('kc-form').hidden = false; $('kc-form').reset(); $('kc-done').hidden = true; document.querySelector('.kc-note').hidden = false; $('kc-status').textContent = '';
    defaults(); loadUrl(); currentStep = 0; viewForStep(); render(); paint();
  }
  function route() {
    const id = new URLSearchParams(location.search).get('modell');
    if (id) openVehicle(id); else { $('kc-conf').hidden = true; $('kc-home').hidden = false; }
  }
  window.addEventListener('popstate', route);

  // Fahrzeugdaten als Skriptdatei laden (funktioniert auf jedem Server und auch lokal ohne Server)
  function loadVehicle(id) {
    return new Promise(res => {
      const sc = document.createElement('script'); let done = false;
      window.__kc = d => { done = true; res(d); };
      sc.src = DATA + encodeURIComponent(id) + '.js';
      sc.onload = () => { if (!done) res(null); }; sc.onerror = () => res(null);
      document.head.appendChild(sc);
    });
  }
  function start() {
    try { vehicles = JSON.parse($('kc-data').textContent); } catch (e) { console.warn('Fahrzeugliste fehlt', e); vehicles = []; }
    $('kc-loading').hidden = true;
    if (!vehicles.length) { $('kc-empty').innerHTML = '<p>Die Modelle konnten gerade nicht geladen werden. Bitte laden Sie die Seite neu oder rufen Sie uns an: <a href="tel:+4936754289606">03675 4289606</a>.</p>'; $('kc-empty').hidden = false; return; }
    renderHome(); route();
  }
  start();
</script>
"""


# Bewerbung direkt über die Website (Netlify Forms), zusätzlich zur JOIN-Stellenliste
JOB_OPTIONS = ["Ausbildung Fahrzeuglackierer/in (m/w/d)", "Ausbildung Karosserie- und Fahrzeugbaumechaniker/in (m/w/d)",
               "Fachkraft Lackierung (m/w/d)", "Fachkraft Karosserie (m/w/d)", "Quereinstieg (m/w/d)", "Praktikum", "Initiativbewerbung", "Andere Stelle aus der Liste"]
APPLY_FORM = f"""<section class="apply" id="bewerbung">
  <div class="page-width apply-inner">
    <div class="apply-text">
      <p class="eyebrow">Direkt bewerben</p>
      <h2>In zwei Minuten beworben.</h2>
      <p>Kein Anschreiben nötig. Name, Telefonnummer und die Stelle reichen – Lebenslauf und Zeugnisse können Sie anhängen, müssen aber nicht. Wir melden uns persönlich bei Ihnen.</p>
      <ul class="apply-steps"><li><strong>01</strong> Formular ausfüllen</li><li><strong>02</strong> Wir rufen Sie an</li><li><strong>03</strong> Kennenlernen in der Werkstatt</li></ul>
      <p class="apply-alt">Lieber per WhatsApp? <a href="https://wa.me/4936754289606?text={'Hallo, ich möchte mich bei Täubert bewerben.'.replace(' ', '%20')}" target="_blank" rel="noopener">Hier schreiben</a> · oder anrufen: <a href="tel:+4936754289606">03675 4289606</a></p>
    </div>
    <form class="damage-form" name="bewerbung" method="POST" action="formular.php" enctype="multipart/form-data" data-title="Bewerbung" data-thanks="danke-bewerbung.html">
      <input type="hidden" name="form-name" value="bewerbung">
      <p class="hp"><label>Nicht ausfüllen: <input name="firma" tabindex="-1" autocomplete="off"></label></p>
      <div class="mail-form">
        <label class="f half">Vor- und Nachname *<input name="name" autocomplete="name" required></label>
        <label class="f half">Telefon *<input name="telefon" type="tel" autocomplete="tel" required></label>
        <label class="f half">E-Mail<input name="email" type="email" autocomplete="email"></label>
        <label class="f half">Stelle *
          <select name="stelle" required>{"".join(f"<option>{o}</option>" for o in JOB_OPTIONS)}</select>
        </label>
        <label class="f half">Frühester Start<input name="start" placeholder="z. B. sofort oder 01.08."></label>
        <label class="f half">Führerschein Klasse B?
          <select name="fuehrerschein"><option>Ja</option><option>Nein</option><option>In Arbeit</option></select>
        </label>
        <label class="f">Lebenslauf <small>(optional, PDF oder Foto)</small><input name="lebenslauf" type="file" accept=".pdf,image/*"></label>
        <label class="f">Zeugnisse / weitere Unterlagen <small>(optional)</small><input name="unterlagen" type="file" accept=".pdf,image/*"></label>
        <label class="f">Kurz zu Ihnen <small>(optional)</small><textarea name="nachricht" rows="4" placeholder="Erfahrung, Wunsch-Arbeitszeit, was Sie an Fahrzeugen begeistert …"></textarea></label>
        <label class="f consent"><input type="checkbox" name="einwilligung" required><span>Ich bin einverstanden, dass meine Angaben und Unterlagen zur Bearbeitung meiner Bewerbung gespeichert werden (siehe <a href="datenschutz.html">Datenschutz</a>). *</span></label>
      </div>
      <button class="btn btn-dark" type="submit">Bewerbung absenden</button>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>"""
APPLY_CTA = """<section class="apply-cta">
  <div class="page-width apply-cta-inner">
    <div><p class="eyebrow">#TeamTäubert</p><h2>Bereit? Bewerben Sie sich direkt hier.</h2><p>Ohne Anschreiben, in zwei Minuten – wir melden uns persönlich.</p></div>
    <div class="btns"><a class="btn btn-light" href="jobs.html#bewerbung">Jetzt bewerben</a><a class="btn btn-outline-light" href="jobs.html">Alle Stellen ansehen</a></div>
  </div>
</section>"""
APPLY_CSS = """
  .apply { padding: 110px 0; background: var(--grey); scroll-margin-top: 120px; }
  .apply-inner { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 64px; align-items: start; }
  .apply h2 { font-size: clamp(32px, 3.8vw, 54px); line-height: 1.02; margin-bottom: 18px; }
  .apply-text > p { color: #555; font-size: 17px; max-width: 480px; }
  .apply-steps { list-style: none; margin: 28px 0; border-top: 1px solid var(--black); max-width: 420px; }
  .apply-steps li { padding: 16px 0; border-bottom: 1px solid var(--line); font-weight: 600; }
  .apply-steps strong { font-size: 12px; letter-spacing: .2em; color: #6b6b6b; margin-right: 14px; }
  .apply-alt a { color: var(--black); text-decoration: underline; text-underline-offset: 3px; white-space: nowrap; }
  .apply form .btn { margin-top: 18px; }
  .apply form { background: var(--white); padding: 36px; min-width: 0; }
  .apply .f { min-width: 0; } .apply select { width: 100%; max-width: 100%; }
  .apply-cta { background: #000; color: #fff; padding: 90px 0; }
  .apply-cta-inner { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 30px; }
  .apply-cta .eyebrow { color: rgba(255,255,255,.6); }
  .apply-cta h2 { font-size: clamp(28px, 3.4vw, 48px); line-height: 1.02; max-width: 720px; }
  .apply-cta p:not(.eyebrow) { color: rgba(255,255,255,.7); margin-top: 12px; }
  .apply-cta .btns { display: flex; flex-wrap: wrap; gap: 12px; }
  @media (max-width: 900px) { .apply { padding: 64px 0; } .apply-inner { grid-template-columns: minmax(0, 1fr); gap: 36px; } .apply input, .apply select, .apply textarea { max-width: 100%; min-width: 0; } .apply form { padding: 22px 16px; } .apply-cta { padding: 64px 0; } }
"""
THANKS_TERM = f"""<section class="sec" style="padding:100px 0">
  <div class="page-width"><div class="rich-inner" style="max-width:640px;margin:0 auto;text-align:center">
    <h1 class="h-6">Danke – Ihre Terminanfrage ist da.</h1>
    <div class="rte"><p>Wir prüfen Ihren Wunschtermin und bestätigen ihn persönlich per Telefon oder E-Mail – meist noch am selben Werktag. Eilt es? <a href="tel:+4936754289606">03675 4289606</a>.</p></div>
    <div class="btns" style="justify-content:center"><a class="btn btn-dark" href="index.html">Zur Startseite</a><a class="btn btn-outline-dark" href="fragen.html">Häufige Fragen</a></div>
  </div></div>
</section>"""
THANKS_APPLY = f"""<section class="sec" style="padding:100px 0">
  <div class="page-width"><div class="rich-inner" style="max-width:640px;margin:0 auto;text-align:center">
    <h1 class="h-6">Danke für Ihre Bewerbung!</h1>
    <div class="rte"><p>Wir haben Ihre Angaben erhalten und melden uns persönlich bei Ihnen – meist innerhalb weniger Tage. Fragen? Rufen Sie uns an: <a href="tel:+4936754289606">03675 4289606</a>.</p></div>
    <div class="btns" style="justify-content:center"><a class="btn btn-dark" href="index.html">Zur Startseite</a><a class="btn btn-outline-dark" href="meet-the-team.html">Das Team kennenlernen</a></div>
  </div></div>
</section>"""


def render_community(slug, p):
    f = p["form"]
    perks = "".join(f'<li><span class="n">{i + 1:02d}</span><h3>{esc(h)}</h3><p>{esc(t)}</p></li>' for i, (h, t) in enumerate(p["perks"]))
    steps = "".join(f"<li><strong>{n}</strong> {esc(t)}</li>" for n, t in p["steps"])
    rows = "".join(f'<details><summary><span>{esc(q)}</span></summary><div class="rte"><p>{esc(a)}</p></div></details>' for q, a in p["faq"])
    others = "".join(f'<a href="{s}.html">{esc(o["nav"])}</a>' for s, o in COMMUNITY.items() if s != slug)
    return f'''<section class="cm-hero">
  <img src="images/{p["img"]}" alt="" fetchpriority="high">
  <div class="page-width">
    <p class="eyebrow">{esc(p["eyebrow"])}</p>
    <h1>{esc(p["title"])}</h1>
    <p class="claim">{esc(p["claim"])}</p>
    <p class="lead">{esc(p["lead"])}</p>
    <div class="btns"><a class="btn btn-light" href="#anmelden">{esc(f["button"])}</a><a class="btn btn-outline-light" href="tel:+4936754289606">03675 4289606</a></div>
  </div>
</section>
<section class="cm-perks">
  <div class="page-width">
    <div class="sec-intro"><p class="eyebrow">{esc(p["nav"])}</p><h2>Das erwartet Sie.</h2></div>
    <ol>{perks}</ol>
    <div class="cm-links">{others}<a href="konfigurator.html">Lack-Konfigurator</a></div>
  </div>
</section>
<section class="apply" id="anmelden">
  <div class="page-width apply-inner">
    <div class="apply-text">
      <p class="eyebrow">{esc(p["nav"])}</p>
      <h2>{esc(f["headline"])}</h2>
      <p>{esc(p["lead"])}</p>
      <ul class="apply-steps">{steps}</ul>
      <p class="apply-alt">Lieber persönlich? <a href="tel:+4936754289606">03675 4289606</a> · <a href="mailto:hallo@taeubert-karosserie-lack.de">hallo@taeubert-karosserie-lack.de</a></p>
    </div>
    <form class="damage-form" name="{f["name"]}" method="POST" action="formular.php" data-title="{esc(p["title"])}" data-thanks="danke-anfrage.html">
      <input type="hidden" name="form-name" value="{f["name"]}">
      <p class="hp"><label>Nicht ausfüllen: <input name="firma" tabindex="-1" autocomplete="off"></label></p>
      <div class="mail-form">
        <label class="f half">Vor- und Nachname *<input name="name" autocomplete="name" required></label>
        <label class="f half">Telefon *<input name="telefon" type="tel" autocomplete="tel" required></label>
        {f["fields"]}
        <label class="f">Nachricht <small>(optional)</small><textarea name="nachricht" rows="3"></textarea></label>
        <label class="f consent"><input type="checkbox" name="einwilligung" required><span>{f["consent"]}</span></label>
      </div>
      <button class="btn btn-dark" type="submit">{esc(f["button"])}</button>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>
<section class="sec" style="padding:60px 0">
  <div class="page-width"><div class="faq"><h2 class="sec-head">Häufige Fragen</h2>{rows}</div></div>
</section>'''


THANKS_REQ = """<section class="sec" style="padding:100px 0">
  <div class="page-width"><div class="rich-inner" style="max-width:640px;margin:0 auto;text-align:center">
    <h1 class="h-6">Danke – wir haben Ihre Anfrage!</h1>
    <div class="rte"><p>Wir melden uns persönlich bei Ihnen. Fragen? Rufen Sie uns an: <a href="tel:+4936754289606">03675 4289606</a>.</p></div>
    <div class="btns" style="justify-content:center"><a class="btn btn-dark" href="index.html">Zur Startseite</a><a class="btn btn-outline-dark" href="leistungen.html">Leistungen ansehen</a></div>
  </div></div>
</section>"""


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
{js}{DAMAGE_JS}{WISH_JS}</script>
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
    # .htaccess für IONOS (Apache): HTTPS + www, 301 von den alten Shopify-Adressen, Sicherheit und Cache
    red = [(f"pages/{h}", f"{f}.html") for h, f in HANDLES.items()]
    red += [(f"pages/{h}", f"{f}.html") for h, f in OLD_SHOPIFY_PAGES.items()]
    red += [("blogs/news", "ratgeber.html")]
    red += [(f"pages/{x}", f"{x}.html") for x in slugs if x not in HANDLES]
    red += [("pages/q-a-fanny", "meet-the-team.html"), ("q-a-fanny.html", "meet-the-team.html")]
    rules = "\n".join(f"RewriteRule ^{re.escape(a)}/?$ /{b} [R=301,L]" for a, b in dict(red).items())
    host = DOMAIN.split("//")[1]
    ht = f"""# IONOS / Apache – erzeugt von build_pages.py
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /index.html

<IfModule mod_rewrite.c>
RewriteEngine On
# Immer HTTPS und mit www
RewriteCond %{{HTTPS}} off [OR]
RewriteCond %{{HTTP_HOST}} !^{re.escape(host)}$ [NC]
RewriteRule ^(.*)$ https://{host}/$1 [R=301,L]
# Alte Shopify-Adressen
{rules}
RewriteRule ^(collections|products)(/.*)?$ /termin.html [R=301,L]
# Interne Dateien nicht ausliefern
RewriteRule (^|/)(build_pages|new_pages)\.py$ - [F,L]
RewriteRule ^images/BILDER\.md$ - [F,L]
</IfModule>

<IfModule mod_headers.c>
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Strict-Transport-Security "max-age=31536000"
<FilesMatch "\.(woff2)$">
Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
<FilesMatch "\.(webp|jpg|jpeg|png|svg)$">
Header set Cache-Control "public, max-age=2592000"
</FilesMatch>
<FilesMatch "\.(html)$">
Header set Cache-Control "public, max-age=600"
</FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml application/xml text/plain
</IfModule>

AddType font/woff2 .woff2
AddType image/webp .webp
AddDefaultCharset utf-8
"""
    open(os.path.join(SITE, ".htaccess"), "w", encoding="utf-8").write(ht)
    for alt in ("_redirects", "netlify.toml"):   # Netlify-Dateien werden bei IONOS nicht gebraucht
        if os.path.exists(os.path.join(SITE, alt)):
            os.remove(os.path.join(SITE, alt))


TEAM_QA = {"Q&amp;A TONI": ("q-a-toni", "Toni"), "Q&amp;A Marco": ("q-a-marco", "Marco"),
           "Q&amp;A Pascal": ("q-a-pascal", "Pascal"), "Q&amp;A Adrian": ("q-a-adrian", "Adrian")}
TEAM_QA_CSS = """
  .mc-col a.mc-media { display: block; }
  .mc-col h3 a { color: inherit; text-decoration: none; }
  .mc-col h3 a:hover { text-decoration: underline; text-underline-offset: 4px; }
  .mc-more { margin-top: 14px; font-family: var(--f-mono); font-size: 11px; letter-spacing: .18em; text-transform: uppercase; }
  .mc-more a { color: inherit; border-bottom: 1px solid currentColor; padding-bottom: 3px; text-decoration: none; }
"""


def link_team_cards(page):
    """Meet the Team: Karten zu den Mitarbeiter-Interviews verlinken (Bild, Name, „Zum Interview →“)."""
    def col(m):
        c = m.group(0)
        for h, (slug, name) in TEAM_QA.items():
            if f"<h3>{h}</h3>" in c:
                c = c.replace('<div class="mc-media">', f'<a class="mc-media" href="{slug}.html" aria-label="Interview mit {name} lesen">', 1)
                c = c.replace('</div></div><h3>', '</div></a><h3>', 1)
                c = c.replace(f"<h3>{h}</h3>", f'<h3><a href="{slug}.html">{h}</a></h3>', 1)
                c = c.replace('alt="MEET THE TEAM"', f'alt="{name} – Team Täubert"', 1)
                c = c[:-6] + f'<p class="mc-more"><a href="{slug}.html">Zum Interview →</a></p></div>'
        return c
    page = re.sub(r'<div class="mc-col">.*?</div></div>(?=<div class="mc-col">|</div></div>\s*</section>)', col, page, flags=re.S)
    return page.replace("</style>", TEAM_QA_CSS + "</style>", 1)


def main():
    update_index()
    style, head_links, top, footer, js = shell()
    ld = re.search(r'(<script type="application/ld\+json">.*?</script>)', open(os.path.join(SITE, "index.html"), encoding="utf-8").read(), re.S)
    ld = ld.group(1) if ld else ""
    built = []
    for tpl, slug in list(PAGES.items()) + PAGE_ALIASES:
        if slug in NEW_PAGES:  # eigene Seite ersetzt die Shopify-Vorlage
            continue
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
                body_html = tidy_service(slug, body_html)
                body_html = with_service_frame(slug, short, body_html)
            if slug in SERVICES and slug not in GUIDES:
                body_html += related_tiles(slug, "Alle Aufbereitungen im Überblick", 5) if slug == "fahrzeugaufbereitung" else related_tiles(slug)
            if slug in LOCATIONS:
                m = re.search(r"<section.*?</section>", body_html, re.S)
                head, rest = body_html[:m.end()], body_html[m.end():]
                if slug == "kronach":
                    head = f'''<section class="sub-hero" style="--h:560px;--mh:460px">
  <div class="media"><img src="images/pexels-artempodrez-8986139.webp" alt="Unfallreparatur für Kunden aus Kronach" fetchpriority="high"></div><div class="overlay" style="opacity:.55"></div>
  <div class="sub-hero-content" style="max-width:960px">
    <h1 class="overline">{esc(seo_title)}</h1>
    <p class="heading h-8">Für Kronach. Mit Abholservice.</p>
    <div class="rte"><p>Unfallreparatur, Lackierung und Smart Repair – wir holen Ihr Auto im Raum Kronach ab und bringen es repariert zurück.</p></div>
    <div class="btns"><a class="btn btn-light" href="{BOOKING}">Termin anfragen</a><a class="btn btn-outline-light" href="schaden-melden.html">Schaden per Foto melden</a></div>
  </div>
</section>'''
                    rest = "".join(f'<section class="sec{" scheme-grey" if i % 2 else ""}" style="padding:80px 0"><div class="page-width"><div class="rich-inner" style="max-width:760px"><h2 class="h-4">{esc(h)}</h2><div class="rte">{b}</div></div></div></section>' for i, (h, b) in enumerate(KRONACH_BODY))
                    rest += f'<section class="more-svc"><div class="page-width"><h2>Unsere Leistungen für Kronach</h2>{tile_grid([x for t in TOP_SERVICES for x in all_services() if x[0] == t])}</div></section>'
                body_html = head + city_block(slug) + rest + city_faq(slug)
            if slug in GUIDES:
                body_html += LEGAL_NOTE
            body_html += booking_cta(slug, short)
            title = seo_title
            if slug in SERVICES:
                extra_ld = service_ld(slug, short, desc) + breadcrumb_ld(slug, short, ("Leistungen", f"{DOMAIN}/leistungen.html"))
            else:
                extra_ld = breadcrumb_ld(slug, short) + city_ld(slug)
        else:
            body_html = first_h1(body_html)
            desc = None
            if slug in PAGE_META:
                title, desc = PAGE_META[slug]
        if slug == "jobs":
            body_html += APPLY_FORM
        elif slug in ("karriere", "azubi"):
            body_html += APPLY_CTA
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
<style>{style}{EXTRA_CSS}{CITY_CSS}</style>
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
        if slug in ("jobs", "karriere", "azubi"):
            page = page.replace("</style>", DAMAGE_CSS + APPLY_CSS + "</style>", 1)
            if slug == "jobs":
                page = page.replace("</script>\n</body>", DAMAGE_JS + "</script>\n</body>", 1)
        if slug == "meet-the-team":
            page = link_team_cards(page)
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
<style>{style}{EXTRA_CSS}{CITY_CSS}</style>
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
    for slug, p in COMMUNITY.items():
        body_html = render_community(slug, p)
        page = simple_page(slug, p["title"], p["desc"], body_html, style, head_links, top, footer, js, ld)
        page = page.replace("</style>", APPLY_CSS + COMMUNITY_CSS + "</style>", 1).replace("</head>", faq_ld(body_html) + "\n</head>", 1)
        open(os.path.join(SITE, f"{slug}.html"), "w", encoding="utf-8").write(sync_images(page))
        built.append(slug)
    for slug, p in RATGEBER.items():
        FALLBACK_IMG[slug] = p["img"]
        head = render_new_page(slug, p, aside_title="Wir helfen Ihnen weiter")
        m = re.search(r"<section.*?</section>", head, re.S)
        crumbs = f'<nav class="crumbs page-width" aria-label="Brotkrumen"><a href="index.html">Startseite</a><span>›</span><a href="ratgeber.html">Ratgeber</a><span>›</span><span aria-current="page">{esc(p["short"])}</span></nav>'
        svcs = {x[0]: x for x in all_services()}
        rel = f'<section class="more-svc"><div class="page-width"><h2>Passende Leistungen</h2>{tile_grid([svcs[r] for r in p["related"] if r in svcs])}</div></section>'
        body_html = head[:m.end()] + crumbs + head[m.end():] + rel + LEGAL_NOTE + booking_cta(slug, p["short"])
        art = {"@context": "https://schema.org", "@type": "Article", "headline": p["title"], "description": p["desc"], "image": f"{DOMAIN}/images/{p['img']}",
               "author": {"@type": "Organization", "name": "Täubert Karosserie & Lack GmbH"}, "publisher": {"@type": "Organization", "name": "Täubert Karosserie & Lack GmbH"},
               "mainEntityOfPage": f"{DOMAIN}/{slug}.html", "inLanguage": "de"}
        extra_ld = '<script type="application/ld+json">' + json.dumps(art, ensure_ascii=False) + "</script>" + breadcrumb_ld(slug, p["short"], ("Ratgeber", f"{DOMAIN}/ratgeber.html")) + faq_ld(body_html)
        page = f"""<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(p["title"])} | Täubert</title>
{seo_head(p["title"] + " – Täubert Karosserie & Lack", p["desc"], slug, p["img"])}
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
    hub = f'''<section class="sub-hero" style="--h:480px;--mh:400px">
  <div class="media"><img src="images/pexels-glv-visuals-859366-28611341.webp" alt="Ratgeber rund ums Auto" fetchpriority="high"></div><div class="overlay" style="opacity:.55"></div>
  <div class="sub-hero-content" style="max-width:960px">
    <p class="overline">Täubert Karosserie &amp; Lack</p>
    <h1 class="h-8">Ratgeber</h1>
    <div class="rte"><p>Unfall, Lack, Versicherung und Pflege: verständlich erklärt von unserer Werkstatt in Sonneberg.</p></div>
  </div>
</section>
<section class="more-svc">
  <div class="page-width">{tile_grid([(g, guide_meta(g)[0] if g in SERVICES else guide_meta(g)[1], guide_meta(g)[2]) for g in GUIDES])}</div>
</section>'''
    open(os.path.join(SITE, "ratgeber.html"), "w", encoding="utf-8").write(sync_images(simple_page(
        "ratgeber", "Ratgeber – Unfall, Lack & Pflege",
        "Ratgeber von Täubert Karosserie & Lack in Sonneberg: Wildunfall, Parkschaden, Steinschlag, Leasingrückgabe, Smart Repair, Winter-Check und mehr.",
        hub + booking_cta("ratgeber", "Ratgeber"), style, head_links, top, footer, js, ld)))
    built.append("ratgeber")
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
        "Termin anfragen bei Täubert Karosserie & Lack in Sonneberg: Unfallreparatur, Lackierung, Smart Repair, Reifenservice und mehr.",
        BOOKING_PAGE, style, head_links, top, footer, js, ld)))
    built.insert(2, "termin")
    open(os.path.join(SITE, "unfall-was-tun.html"), "w", encoding="utf-8").write(sync_images(simple_page(
        "unfall-was-tun", "Unfall – was tun?",
        "Unfall gehabt? Checkliste in 7 Schritten: sichern, helfen, fotografieren, Daten austauschen – und Täubert in Sonneberg kümmert sich um den Rest.",
        UNFALL_PAGE + LEGAL_NOTE, style, head_links, top, footer, js, ld)))
    built.insert(3, "unfall-was-tun")
    kpage = simple_page("konfigurator", "Lack-Konfigurator – Wunschfarbe online wählen",
        "Lack-Konfigurator von Täubert Karosserie & Lack in Sonneberg: Modell und Farbe wählen, Umfang festlegen und die Konfiguration direkt als Anfrage senden.",
        konfig_page(), style, head_links, top, footer, js, ld)
    kpage = kpage.replace("</style>", KONFIG_CSS + "</style>", 1).replace("</body>", KONFIG_JS + "</body>", 1)
    open(os.path.join(SITE, "konfigurator.html"), "w", encoding="utf-8").write(sync_images(kpage))
    built.insert(4, "konfigurator")
    faq_body, faq_schema, faq_count = render_faq_page()
    faq_page = simple_page("fragen", "Häufige Fragen – Täubert Sonneberg",
        f"{faq_count} Antworten zu Termin, Kostenvoranschlag, Versicherung, Ersatzwagen, Unfallreparatur, Lackierung und Smart Repair bei Täubert in Sonneberg.",
        faq_body + LEGAL_NOTE, style, head_links, top, footer, js, ld)
    faq_page = faq_page.replace("</head>", faq_schema + "\n</head>", 1)
    open(os.path.join(SITE, "fragen.html"), "w", encoding="utf-8").write(sync_images(faq_page))
    built.insert(4, "fragen")
    open(os.path.join(SITE, "danke.html"), "w", encoding="utf-8").write(simple_page(
        "danke", "Danke", "Ihre Schadensmeldung ist bei uns eingegangen.", THANKS, style, head_links, top, footer, js, ld,
        robots='<meta name="robots" content="noindex, follow">\n'))
    open(os.path.join(SITE, "danke-termin.html"), "w", encoding="utf-8").write(simple_page(
        "danke-termin", "Danke für Ihre Terminanfrage", "Ihre Terminanfrage ist bei uns eingegangen.", THANKS_TERM, style, head_links, top, footer, js, ld,
        robots='<meta name="robots" content="noindex, follow">\n'))
    open(os.path.join(SITE, "danke-bewerbung.html"), "w", encoding="utf-8").write(simple_page(
        "danke-bewerbung", "Danke für Ihre Bewerbung", "Ihre Bewerbung ist bei uns eingegangen.", THANKS_APPLY, style, head_links, top, footer, js, ld,
        robots='<meta name="robots" content="noindex, follow">\n'))
    open(os.path.join(SITE, "danke-anfrage.html"), "w", encoding="utf-8").write(simple_page(
        "danke-anfrage", "Danke für Ihre Anfrage", "Ihre Anfrage ist bei uns eingegangen.", THANKS_REQ, style, head_links, top, footer, js, ld,
        robots='<meta name="robots" content="noindex, follow">\n'))
    write_seo_files(built)
    update_index()  # erneut, jetzt mit den Bildern der gebauten Leistungsseiten
    for extra in ("index.html", "impressum.html", "datenschutz.html"):
        fp = os.path.join(SITE, extra)
        content = sync_images(open(fp, encoding="utf-8").read())
        open(fp, "w", encoding="utf-8").write(content)
    print("\n".join(built))


main()
