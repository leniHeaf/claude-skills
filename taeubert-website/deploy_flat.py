"""Erzeugt eine Upload-Version der Website OHNE Unterordner (für IONOS, wenn Ordner beim Hochladen nicht ankommen).

Alle Dateien aus images/, images/konfigurator/, images/konfigurator/daten/ und fonts/ landen direkt neben den Seiten;
die Verweise in den Seiten und in den Konfigurator-Daten werden entsprechend umgeschrieben. Das Projekt selbst bleibt
unverändert (dort bleiben die Ordner für den Generator erhalten).

Aufruf:  python3 deploy_flat.py <zielordner> [zip-datei]
"""
import os, shutil, sys, zipfile

SITE = os.path.dirname(os.path.abspath(__file__))
SKIP = {"build_pages.py", "new_pages.py", "community_pages.py", "image_names.py", "rename_images.py",
        "retro90.py", "deploy_flat.py", "BILDER.md", "higgsfield-prompts.md", "ratgeber_alter_blog.json"}
PREFIXES = ["images/konfigurator/daten/", "images/konfigurator/", "images/", "fonts/"]   # längste zuerst
TEXT = (".html", ".js", ".json", ".xml", ".txt", ".php", ".css")


def flatten_text(s):
    for p in PREFIXES:
        s = s.replace(p, "")
    return s


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    seen = {}
    for root, dirs, files in os.walk(SITE):
        dirs[:] = [d for d in dirs if d not in ("__pycache__", ".git")]
        for f in files:
            if f in SKIP:
                continue
            src = os.path.join(root, f)
            rel = os.path.relpath(src, SITE)
            if f in seen:
                raise SystemExit(f"Doppelter Dateiname, flache Version nicht möglich: {rel} und {seen[f]}")
            seen[f] = rel
            dst = os.path.join(out, f)
            if f.endswith(TEXT) and f != ".htaccess":
                open(dst, "w", encoding="utf-8").write(flatten_text(open(src, encoding="utf-8").read()))
            else:
                shutil.copy2(src, dst)
    print(len(seen), "Dateien flach nach", out)
    if len(sys.argv) > 2:
        with zipfile.ZipFile(sys.argv[2], "w", zipfile.ZIP_DEFLATED) as z:
            for f in sorted(os.listdir(out)):
                z.write(os.path.join(out, f), f)
        print("ZIP:", sys.argv[2], round(os.path.getsize(sys.argv[2]) / 1048576, 1), "MB")


if __name__ == "__main__":
    main()
