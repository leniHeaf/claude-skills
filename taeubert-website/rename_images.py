"""Einmalig: Dateien in images/ nach image_names.IMAGE_NAMES umbenennen (inkl. -700-Varianten)."""
import os, subprocess
from image_names import IMAGE_NAMES
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")
n = 0
for f in sorted(os.listdir(D)):
    base, ext = os.path.splitext(f)
    small = base.endswith("-700") and base[:-4] in IMAGE_NAMES
    key = base[:-4] if small else base
    if key not in IMAGE_NAMES:
        continue
    new = IMAGE_NAMES[key] + ("-700" if small else "") + ext
    subprocess.run(["git", "mv", os.path.join(D, f), os.path.join(D, new)], check=True)
    n += 1
print(n, "Dateien umbenannt")
