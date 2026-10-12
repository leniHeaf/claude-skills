# Website Leni Heaf

Agentur-Website im Stil der Rue-Collection von Studio Standard (siehe `../branding/rue-analyse.md`).
Reines HTML, CSS und JavaScript ohne Build-Schritt. Läuft auf jedem Webhosting.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite mit allen Kapiteln (1.0 bis 6.0) |
| `impressum.html`, `datenschutz.html` | Rechtstexte als **Vorlage** (Platzhalter in [eckigen Klammern]) |
| `404.html` | Fehlerseite |
| `styles.css`, `script.js` | Gestaltung und Animationen |
| `fonts/`, `fonts.css` | Schriften, lokal gehostet (DSGVO-konform, kein Google-Server) |
| `img/` | Fotos, lokal gehostet (Unsplash-Lizenz, Platzhalter) |
| `robots.txt`, `sitemap.xml` | Für Google |
| `og-image.jpg` | Vorschaubild beim Teilen (WhatsApp, LinkedIn, Instagram) |
| `favicon.svg`, `apple-touch-icon.png`, `site.webmanifest` | Icons |

## Schon eingebaut (SEO und Technik)

- Seitentitel und Beschreibung mit „Werbeagentur Sonneberg“, „Branding“, „Webdesign“, „Social Media“
- Strukturierte Daten für Google: Agentur mit Standort Sonneberg, Einzugsgebiet, Leistungen und Preisen sowie FAQ
- FAQ-Bereich mit regionalen Suchbegriffen (Coburg, Kronach, Hildburghausen, Oberfranken)
- Vorschaubild und Texte für das Teilen in sozialen Netzwerken
- Sitemap, robots.txt, Canonical-Link
- Keine Cookies, kein Tracking, daher **kein Cookie-Banner nötig**
- Schriften und Bilder vom eigenen Server, schnelle Ladezeit (Bilder als WebP, ca. 2 MB gesamt)
- Barrierearm: Tastaturbedienung, Alternativtexte, reduzierte Bewegung wird respektiert

## Vor dem Livegang (Checkliste)

- [ ] **Domain** kaufen (z. B. leniheaf.de). Lautet sie anders: in `index.html`, `robots.txt`, `sitemap.xml` und den Rechtsseiten ersetzen (Suchen nach `leniheaf.de`)
- [ ] **Impressum und Datenschutz** ausfüllen (alle [eckigen Klammern]) und prüfen lassen
- [ ] **E-Mail** `hallo@leniheaf.de` einrichten oder überall ersetzen
- [ ] **Instagram- und LinkedIn-Links** auf deine Profile setzen (suchen nach `instagram.com/` und `linkedin.com/`)
- [ ] **Leistungen pro Kund:in** unter „Arbeiten“ prüfen
- [ ] **Eigene Fotos** einsetzen (Shooting-Liste in `../branding/rue-analyse.md`), dann Bildnachweis im Impressum anpassen
- [ ] Hochladen, z. B. bei **Netlify** (kostenlos, Ordner `website` per Drag-and-drop) oder bei IONOS/Strato per FTP

## Nach dem Livegang (SEO)

1. **Google Search Console** einrichten und `sitemap.xml` einreichen
2. **Google-Unternehmensprofil** anlegen (Kategorie „Werbeagentur“, Standort Sonneberg). Das ist für lokale Suchen das Wichtigste
3. Erste **Google-Bewertungen** von Kund:innen einholen (z. B. Täubert, Butter und Brot)
4. Website in Instagram- und LinkedIn-Profil verlinken
5. Einträge bei IHK Südthüringen, Gelbe Seiten, Das Örtliche, Branchenbuch Sonneberg
6. Optional später: eigene Unterseiten pro Leistung („Webdesign Sonneberg“, „Social Media Agentur Coburg“) und Fallstudien pro Kunde

## Lokal ansehen

`index.html` im Browser öffnen. Für die volle Funktion besser über einen kleinen Server:
`python3 -m http.server` im Ordner `website`, dann http://localhost:8000 öffnen.
