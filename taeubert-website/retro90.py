"""90er-Film-Look für Fotos: warm, ausgewaschene Schatten, Korn, Vignette.
Aufruf: python3 retro90.py images/neues-foto.webp  (überschreibt die Datei; Logos/PNG nicht verwenden)
"""
import sys, numpy as np
from PIL import Image, ImageFilter
def look(im):
    im = im.convert("RGB")
    w, h = im.size
    im = im.filter(ImageFilter.GaussianBlur(0.35 * max(w, h) / 1400))   # etwas weicher wie Kompaktkamera
    a = np.asarray(im).astype(np.float32) / 255
    lum = a @ np.array([.299, .587, .114], np.float32)
    a = lum[..., None] + (a - lum[..., None]) * 1.18                    # kräftigere Farben
    # Farbkurven: Rot/Gelb warm, Schatten leicht grün-cyan
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    r = r * 1.06 + .02
    g = g * 1.01 + .015
    b = b * .88 + .03 + (1 - lum) * .03
    a = np.stack([r, g, b], -1)
    a = .06 + a * .88                                                    # ausgewaschene Schwarztöne, gedämpfte Lichter
    a = .5 + (a - .5) * 1.04
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = ((xx / w - .5) ** 2 + (yy / h - .5) ** 2) * 2
    a *= (1 - .32 * d ** 1.4)[..., None]                                 # Vignette
    rng = np.random.default_rng(90)
    n = rng.normal(0, .034, (h, w)).astype(np.float32)
    n = np.asarray(Image.fromarray(((n + .5) * 255).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.8))).astype(np.float32) / 255 - .5
    a += (n * 1.5)[..., None] * (.6 + .4 * (1 - lum))[..., None]         # Korn, stärker in Schatten
    return Image.fromarray((a.clip(0, 1) * 255).astype(np.uint8))
for src in sys.argv[1:]:
    dst = src
    if "--out" in sys.argv: continue
    im = Image.open(src)
    out = look(im)
    if src.lower().endswith(".webp"): out.save(dst, "WEBP", quality=66, method=6)
    else: out.save(dst, "JPEG", quality=74, optimize=True, progressive=True)
