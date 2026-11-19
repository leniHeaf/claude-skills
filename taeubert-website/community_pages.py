"""Täubert Club, Täubert Events und Partner für Autohäuser & Firmen.

Bewusst ohne erfundene Rabatte, Termine oder Partnernamen: konkrete Vorteile,
Eventdaten und Konditionen trägt der Betrieb selbst nach (siehe TODO-Hinweise unten).
"""

COMMUNITY = {
    "club": {
        "title": "Täubert Club",
        "nav": "Täubert Club",
        "img": "ElevenLabs_image_nano-banana_Porsche_rast..._2026-01-13T08_49_41.webp",
        "desc": "Der Täubert Club für Autoliebhaber aus Sonneberg, Coburg und Kronach: Erinnerungen an HU, Reifen und Pflege, Einladungen zu Events und Club-Angebote. Kostenlos anmelden.",
        "eyebrow": "Members only",
        "claim": "Für alle, die ihr Auto lieben.",
        "lead": "Kostenlos Mitglied werden: Wir denken an die Termine Ihres Fahrzeugs, laden Sie zu unseren Events ein und informieren Sie zuerst über Club-Angebote.",
        "perks": [
            ("Wir denken mit", "Erinnerung an HU/AU, Reifenwechsel, Versiegelung und Unterbodenschutz – rechtzeitig, damit Sie nichts verpassen."),
            ("Zuerst eingeladen", "Club-Mitglieder erfahren als Erste von Täubert Events, Werkstattabenden und Ausfahrten."),
            ("Club-Angebote", "Saisonale Angebote, z. B. zur Fahrzeugpflege vor dem Winter oder zum Frühjahrs-Check – nur für Mitglieder."),
            ("Ihr Fahrzeug, unsere Historie", "Wir kennen Ihr Auto: Farbton, frühere Arbeiten und Wünsche sind bei uns hinterlegt."),
        ],
        "steps": [("01", "Formular ausfüllen"), ("02", "E-Mail bestätigen"), ("03", "Willkommen im Club")],
        "faq": [
            ("Was kostet die Mitgliedschaft?", "Nichts. Der Täubert Club ist kostenlos und kann jederzeit beendet werden – eine kurze Nachricht genügt."),
            ("Wie oft bekomme ich Nachrichten?", "Nur wenn es einen Anlass gibt: ein anstehender Termin Ihres Fahrzeugs, ein Event oder ein Club-Angebot. Kein täglicher Newsletter."),
            ("Kann ich mehrere Fahrzeuge eintragen?", "Ja. Nennen Sie uns einfach alle Fahrzeuge im Feld „Fahrzeug“ oder in der Nachricht."),
            ("Wie melde ich mich ab?", "Jederzeit per E-Mail an hallo@taeubert-karosserie-lack.de oder telefonisch unter 03675 4289606."),
        ],
        "form": {
            "name": "club", "button": "Kostenlos Mitglied werden", "headline": "Jetzt Mitglied werden.",
            "fields": '''<label class="f half">E-Mail *<input name="email" type="email" autocomplete="email" required></label>
        <label class="f half">Fahrzeug<input name="fahrzeug" placeholder="z. B. Porsche 911, Bj. 2019"></label>
        <label class="f half">Nächste HU fällig<input name="datum" placeholder="z. B. 05/2027"></label>
        <label class="f half">Interessiert an
          <select name="leistung"><option>Alles rund ums Auto</option><option>Events &amp; Ausfahrten</option><option>Pflege &amp; Aufbereitung</option><option>Oldtimer &amp; Youngtimer</option></select>
        </label>''',
            "consent": "Ich möchte in den Täubert Club aufgenommen werden und per E-Mail Erinnerungen, Einladungen und Club-Angebote erhalten. Die Einwilligung kann ich jederzeit widerrufen (siehe <a href=\"datenschutz.html\">Datenschutz</a>). *",
        },
    },
    "events": {
        "title": "Täubert Events",
        "nav": "Täubert Events",
        "img": "67e54e9e6a50c47dbfeb5962_03_DSC_0367_2-p-3200.webp",
        "desc": "Täubert Events in Sonneberg: Werkstattabende, Pflege-Workshops, Cars & Coffee und Ausfahrten für Autoliebhaber aus Sonneberg, Coburg und Kronach.",
        "eyebrow": "Come together",
        "claim": "Benzingespräche in unserer Werkstatt.",
        "lead": "Wir öffnen unsere Türen: zum Fachsimpeln, Zuschauen und Mitmachen. Die nächsten Termine kündigen wir hier und im Täubert Club an.",
        "perks": [
            ("Cars & Coffee", "Ein entspannter Vormittag auf unserem Hof – mit Kaffee, besonderen Fahrzeugen und guten Gesprächen."),
            ("Werkstattabend", "Blick hinter die Kulissen: Richtbank, Farbtonmessung, Lackierkabine – live erklärt von unserem Team."),
            ("Pflege-Workshop", "Waschen, polieren, versiegeln: Wie Ihr Lack lange wie neu aussieht – mit Tipps aus der Aufbereitung."),
            ("Ausfahrten", "Gemeinsam durch den Thüringer Wald und das Coburger Land – für Klassiker, Sportwagen und alle, die gern fahren."),
        ],
        "steps": [("01", "Interesse eintragen"), ("02", "Einladung erhalten"), ("03", "Dabei sein")],
        "faq": [
            ("Wann ist das nächste Event?", "Die nächsten Termine veröffentlichen wir hier und informieren alle, die sich unten eingetragen haben oder im Täubert Club sind."),
            ("Kostet die Teilnahme etwas?", "Das hängt vom Event ab und steht in der jeweiligen Einladung."),
            ("Muss ich Kunde sein?", "Nein. Jeder, der Autos mag, ist herzlich willkommen."),
            ("Kann ich mein Fahrzeug mitbringen?", "Sehr gern – bei Cars & Coffee und Ausfahrten ist das sogar der Kern der Sache."),
        ],
        "form": {
            "name": "events", "button": "Einladung erhalten", "headline": "Keine Einladung verpassen.",
            "fields": '''<label class="f half">E-Mail *<input name="email" type="email" autocomplete="email" required></label>
        <label class="f half">Fahrzeug<input name="fahrzeug" placeholder="optional"></label>
        <label class="f">Welche Events interessieren Sie?
          <select name="leistung"><option>Alle Events</option><option>Cars &amp; Coffee</option><option>Werkstattabend</option><option>Pflege-Workshop</option><option>Ausfahrten</option></select>
        </label>''',
            "consent": "Ich möchte per E-Mail zu Täubert Events eingeladen werden. Die Einwilligung kann ich jederzeit widerrufen (siehe <a href=\"datenschutz.html\">Datenschutz</a>). *",
        },
    },
    "partner": {
        "title": "Partner für Autohäuser & Firmen",
        "nav": "Partner: Autohäuser & Firmen",
        "img": "T_ubert_Karosserie_und_Lack_in_Sonneberg_Fuhrparkserive.webp",
        "desc": "Täubert als Karosserie- und Lackpartner für Autohäuser, Händler, Leasinggesellschaften und Firmen in Sonneberg, Coburg und Kronach: Unfallinstandsetzung, Lack, Smart Repair und Aufbereitung.",
        "eyebrow": "B2B",
        "claim": "Ihr Karosserie- und Lackpartner.",
        "lead": "Für Autohäuser, Händler, Vermieter und Firmen mit eigenem Fuhrpark: ein fester Ansprechpartner, planbare Abläufe und Ergebnisse in Werksqualität.",
        "perks": [
            ("Autohäuser & Händler", "Unfallinstandsetzung für Ihre Werkstattkunden, Smart Repair und Lackierung für Gebrauchtwagen – damit Ihre Fahrzeuge schneller verkaufsfertig sind."),
            ("Firmen & Fuhrparks", "PKW, Transporter und Firmenfahrzeuge aller Marken: Schäden beheben, Ausfallzeiten kurz halten, Termine gebündelt planen."),
            ("Leasing & Vermietung", "Aufbereitung und Smart Repair vor der Rückgabe oder dem nächsten Vertrag – sauber dokumentiert."),
            ("Alles aus einer Hand", "Karosserie, Lack, Unterbodenschutz, Aufbereitung, HU/AU und Reifen – plus Hol- und Bringservice im Umkreis von 30 km."),
        ],
        "steps": [("01", "Anfrage senden"), ("02", "Kennenlernen & Ablauf abstimmen"), ("03", "Zusammenarbeit starten")],
        "faq": [
            ("Arbeiten Sie mit Autohäusern zusammen?", "Ja. Wir übernehmen Karosserie-, Lack- und Smart-Repair-Arbeiten für Autohäuser und Händler. Den Ablauf stimmen wir individuell mit Ihnen ab."),
            ("Können wir mehrere Fahrzeuge gebündelt bringen?", "Ja. Wir planen Termine für mehrere Fahrzeuge gemeinsam mit Ihnen, damit möglichst wenige gleichzeitig ausfallen."),
            ("Holen Sie Fahrzeuge ab?", "Ja, im Umkreis von 30 km holen wir Fahrzeuge ab und bringen sie zurück."),
            ("Wie wird abgerechnet?", "Per Rechnung. Bei Unfallschäden rechnen wir auf Wunsch direkt mit der Versicherung ab."),
            ("Gibt es Konditionen für Partner?", "Sprechen Sie uns an – Konditionen vereinbaren wir individuell nach Umfang der Zusammenarbeit."),
        ],
        "form": {
            "name": "partner", "button": "Partneranfrage senden", "headline": "Lassen Sie uns sprechen.",
            "fields": '''<label class="f half">Unternehmen *<input name="unternehmen" autocomplete="organization" required></label>
        <label class="f half">E-Mail *<input name="email" type="email" autocomplete="email" required></label>
        <label class="f half">Art des Unternehmens
          <select name="leistung"><option>Autohaus / Händler</option><option>Firma mit Fuhrpark</option><option>Leasing / Vermietung</option><option>Versicherung / Gutachter</option><option>Sonstiges</option></select>
        </label>
        <label class="f half">Anzahl Fahrzeuge<input name="fahrzeug" placeholder="z. B. 12 PKW, 3 Transporter"></label>''',
            "consent": "Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage gespeichert werden (siehe <a href=\"datenschutz.html\">Datenschutz</a>). *",
        },
    },
}

COMMUNITY_CSS = """
  .cm-hero { position: relative; min-height: 78vh; display: flex; align-items: flex-end; color: #fff; background: #000; overflow: hidden; }
  .cm-hero img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .62; }
  .cm-hero::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.15) 30%, rgba(0,0,0,.85)); }
  .cm-hero .page-width { position: relative; z-index: 1; padding-top: 140px; padding-bottom: 72px; }
  .cm-hero .eyebrow { color: rgba(255,255,255,.7); }
  .cm-hero h1 { font-family: var(--f-display); font-weight: 400; text-transform: uppercase; letter-spacing: .04em; font-size: clamp(38px, 6vw, 84px); line-height: .98; margin: 10px 0 18px; }
  .cm-hero .claim { font-family: var(--f-display); font-style: italic; font-size: clamp(20px, 2vw, 26px); margin-bottom: 12px; }
  .cm-hero .lead { max-width: 620px; color: rgba(255,255,255,.82); font-size: 17px; }
  .cm-hero .btns { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
  .cm-perks { padding: 110px 0; }
  .cm-perks ol { list-style: none; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; border-top: 1px solid var(--black); }
  .cm-perks li { padding: 32px 28px 36px 0; border-right: 1px solid var(--line); }
  .cm-perks li + li { padding-left: 28px; }
  .cm-perks li:last-child { border-right: 0; }
  .cm-perks .n { font-family: var(--f-mono); font-size: 11px; letter-spacing: .2em; color: #6b6b6b; }
  .cm-perks h3 { font-family: var(--f-display); font-weight: 400; text-transform: uppercase; letter-spacing: .05em; font-size: 20px; margin: 18px 0 10px; }
  .cm-perks p { color: #555; font-size: 15px; }
  .cm-links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 34px; }
  .cm-links a { font-family: var(--f-mono); font-size: 11px; letter-spacing: .16em; text-transform: uppercase; border: 1px solid var(--line); padding: 10px 16px; color: var(--black); text-decoration: none; }
  .cm-links a:hover { border-color: var(--black); }
  @media (max-width: 900px) {
    .cm-hero { min-height: 70vh; } .cm-hero .page-width { padding-bottom: 48px; }
    .cm-perks { padding: 64px 0; } .cm-perks ol { grid-template-columns: minmax(0, 1fr); }
    .cm-perks li, .cm-perks li + li { padding: 26px 0; border-right: 0; border-bottom: 1px solid var(--line); }
  }
"""
