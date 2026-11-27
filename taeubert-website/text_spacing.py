"""Leerzeichen im sichtbaren Text korrigieren (z. B. „Leben.Bekannt“ → „Leben. Bekannt“, „Betrieb,der“ → „Betrieb, der“).

Arbeitet nur außerhalb von <script>/<style> (JSON-LD-Daten ausgenommen: dort nur nach Satzende) und nie innerhalb von Tags.
Inline-Tags zwischen Satzzeichen und neuem Satz (z. B. „Gespräch.</strong>Offene“) werden berücksichtigt.
"""
import re

INLINE = r"(?:</?(?:strong|b|em|i|span|u|small)>)*"
SENT = re.compile(r"([a-zäöüß0-9\)“\"])([.!?;])(" + INLINE + r")([A-ZÄÖÜ][a-zäöüß])")
COLON = re.compile(r"([a-zäöüß\)])(:)(" + INLINE + r")([A-ZÄÖÜ][a-zäöüß])")
COMMA = re.compile(r"([a-zäöüß\)])(,)(" + INLINE + r")([A-Za-zÄÖÜäöüß]{2})")
SPACE_BEFORE = re.compile(r"([a-zäöüß]) ([.,;!?])(" + INLINE + r")([A-ZÄÖÜ])")   # „war klar .Nicht“
DOUBLE = re.compile(r"(?<=\S) {2,}(?=\S)")
AFTER_TAG = re.compile(r"(</(?:strong|b|em|i|span|u|small)>)([.!?;:])([A-ZÄÖÜ][a-zäöüß])")   # „</strong>.Was“


def _fix_text(t, full=True):
    t = SPACE_BEFORE.sub(r"\1\2\3 \4", t)
    t = SENT.sub(r"\1\2\3 \4", t)
    t = AFTER_TAG.sub(r"\1\2 \3", t)
    if full:
        t = COLON.sub(r"\1\2\3 \4", t)
        t = COMMA.sub(r"\1\2\3 \4", t)
        t = DOUBLE.sub(" ", t)
    return t


def fix_spacing(page):
    """Ganze HTML-Seite: Textbereiche korrigieren, Code und Tags unverändert lassen."""
    out, pos = [], 0
    for m in re.finditer(r"<(script|style)\b([^>]*)>(.*?)</\1>", page, re.S | re.I):
        out.append(_fix_html(page[pos:m.start()]))
        if m.group(1).lower() == "script" and "ld+json" in m.group(2):
            out.append(page[m.start():m.start(3)] + _fix_text(m.group(3), full=False) + page[m.end(3):m.end()])
        else:
            out.append(m.group(0))
        pos = m.end()
    out.append(_fix_html(page[pos:]))
    page = "".join(out)
    # Beschreibungen in Meta-Tags (Google, Teilen) ebenfalls korrigieren
    return re.sub(r'(<meta (?:name|property)="(?:description|og:description|twitter:description|og:title|twitter:title)" content=")([^"]*)(")',
                  lambda m: m.group(1) + _fix_text(m.group(2), full=False) + m.group(3), page)


def _fix_html(h):
    # Text zwischen Tags korrigieren; Inline-Tags bleiben im Text, damit „.</strong>Wort“ erkannt wird
    parts = re.split(r"(<(?!/?(?:strong|b|em|i|span|u|small)>)[^>]*>)", h)
    return "".join(p if i % 2 else _fix_text(p) for i, p in enumerate(parts))   # ungerade Indizes = Tags (unverändert)


if __name__ == "__main__":
    import glob, os, sys
    site = os.path.dirname(os.path.abspath(__file__))
    changed = 0
    for f in sorted(glob.glob(os.path.join(site, "*.html"))):
        s = open(f, encoding="utf-8").read()
        n = fix_spacing(s)
        if n != s:
            open(f, "w", encoding="utf-8").write(n); changed += 1
    print(changed, "Seiten korrigiert")
