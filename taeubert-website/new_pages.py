"""Zusätzliche Leistungsseiten (eigene Texte), aus der Wettbewerbsanalyse abgeleitet.

Nur Leistungen, die laut den bestehenden Täubert-Seiten angeboten werden.
Jede Seite: (SEO-Titel, Kurzname, Meta-Beschreibung, Hero, Abschnitte, FAQ)
"""

NEW_PAGES = {
    "hagelschaden": {
        "title": "Hagelschaden reparieren – Sonneberg",
        "short": "Hagelschaden",
        "desc": "Hagelschaden am Auto in Sonneberg reparieren: Dellen möglichst ohne Lackieren entfernen, Lack und Karosserie aus einer Hand, direkt mit der Versicherung.",
        "claim": "Nach dem Hagel kommt Täubert.",
        "lead": "Dellen auf Dach, Motorhaube und Kofferraum – wir prüfen, was ohne Neulackierung geht.",
        "sections": [
            ("Hagel hinterlässt mehr als ein paar Dellen",
             "<p>Ein kurzer Schauer reicht, und das Dach sieht aus wie ein Golfball. Hagelschäden sind ärgerlich, aber in vielen Fällen gut zu reparieren – oft sogar, ohne dass der Originallack angetastet werden muss.</p>"
             "<p>Entscheidend ist, wie tief die Dellen sind und ob der Lack beschädigt wurde. Genau das schauen wir uns als Erstes an.</p>"),
            ("So reparieren wir Hagelschäden",
             "<ul><li><strong>Smart Repair:</strong> Dellen werden von innen schonend zurückgeformt, der Originallack bleibt erhalten.</li>"
             "<li><strong>Lackreparatur:</strong> Ist der Lack gerissen oder abgeplatzt, lackieren wir die betroffenen Teile mit exakter Farbtonanpassung.</li>"
             "<li><strong>Karosserie:</strong> Stark verformte Teile setzen wir instand oder ersetzen sie.</li></ul>"
             "<p>Karosserie und Lackierung passieren bei uns im selben Betrieb – das spart Zeit und sorgt für ein einheitliches Ergebnis.</p>"),
            ("Hagelschaden und Versicherung",
             "<p>Hagel ist in der Regel über die Teilkasko versichert. Wir dokumentieren den Schaden, stimmen uns mit Ihrer Versicherung und dem Gutachter ab und übernehmen die Reparatur. Welche Kosten Ihre Versicherung übernimmt, hängt von Ihrem Vertrag ab – wir helfen Ihnen gern bei der Klärung.</p>"),
        ],
        "faq": [
            ("Kann jede Hageldelle ohne Lackieren entfernt werden?", "Nicht jede. Ist der Lack beschädigt oder die Delle sehr tief oder an einer Kante, ist meist eine Lackierung nötig. Wir sagen Ihnen nach der Begutachtung ehrlich, welcher Weg sinnvoll ist."),
            ("Zahlt die Versicherung den Hagelschaden?", "Hagel ist üblicherweise über die Teilkasko abgedeckt. Die genauen Bedingungen stehen in Ihrem Vertrag; wir unterstützen Sie bei der Abstimmung mit der Versicherung."),
            ("Wie schnell sollte ich nach einem Hagelschauer kommen?", "So bald wie möglich – vor allem, wenn der Lack beschädigt ist. Offene Stellen können sonst rosten."),
        ],
    },
    "stossstange-reparieren": {
        "title": "Stoßstange reparieren Sonneberg",
        "short": "Stoßstange reparieren",
        "desc": "Stoßstange reparieren oder lackieren in Sonneberg & Neustadt bei Coburg: Kratzer, Risse und Dellen im Stoßfänger beseitigen – oft ohne neues Teil.",
        "claim": "Stoßstange erwischt? Kriegen wir hin.",
        "lead": "Kratzer, Risse oder Dellen im Stoßfänger – reparieren statt tauschen, wo es Sinn macht.",
        "sections": [
            ("Der Stoßfänger trifft es zuerst",
             "<p>Beim Einparken, Rangieren oder im Stau: Die Stoßstange bekommt fast immer zuerst etwas ab. Die gute Nachricht – viele Schäden lassen sich reparieren, ohne dass ein neues Teil bestellt werden muss.</p>"),
            ("Was wir am Stoßfänger reparieren",
             "<ul><li>Kratzer und Schrammen im Lack</li><li>Dellen und Eindrückungen</li><li>Risse und Brüche im Kunststoff</li><li>abgeplatzter Lack an Ecken und Kanten</li></ul>"
             "<p>Anschließend lackieren wir den Stoßfänger mit digitaler Farbtonmessung, damit er wieder exakt zum restlichen Fahrzeug passt.</p>"),
            ("Reparieren oder tauschen?",
             "<p>Ist der Stoßfänger stark gebrochen oder sind Halterungen und Sensoren beschädigt, kann ein Austausch die bessere Lösung sein. Wir prüfen beides und sagen Ihnen ehrlich, was günstiger und sinnvoller ist.</p>"
             "<p>Gerade vor einer Leasingrückgabe lohnt sich eine Reparatur oft besonders.</p>"),
        ],
        "faq": [
            ("Kann ein gerissener Stoßfänger repariert werden?", "Kleinere Risse im Kunststoff lassen sich häufig reparieren. Bei großen Brüchen oder beschädigten Befestigungen ist ein neues Teil meist sinnvoller."),
            ("Sieht man die Lackierung danach?", "Unser Ziel ist, dass man keinen Unterschied sieht. Dafür messen wir den Farbton digital und lackieren in der Lackierkabine."),
            ("Was ist mit Parksensoren im Stoßfänger?", "Sensoren werden bei der Reparatur berücksichtigt und nach dem Einbau auf Funktion geprüft."),
        ],
    },
    "oldtimer-restaurierung": {
        "title": "Oldtimer-Restaurierung Sonneberg",
        "short": "Oldtimer & Klassiker",
        "desc": "Oldtimer-Restaurierung und Klassiker-Lackierung in Sonneberg: Entrostung, Karosseriearbeiten und originalgetreue Lackierung – mit Respekt vor dem Original.",
        "claim": "Klassiker verdienen Geduld.",
        "lead": "Entrostung, Karosserie und Lackierung – originalgetreu und mit Gefühl für das Fahrzeug.",
        "sections": [
            ("Substanz erhalten, Charakter bewahren",
             "<p>Bei einem Klassiker geht es nicht darum, ihn wie neu aussehen zu lassen. Es geht darum, ihn richtig zu machen: Rost konsequent entfernen, die Substanz erhalten und den Charakter des Fahrzeugs bewahren.</p>"),
            ("Was wir an Oldtimern machen",
             "<ul><li>Entrostung und Instandsetzung tragender Karosseriebereiche</li><li>Karosseriearbeiten an Front, Heck und Anbauteilen</li><li>Lackaufbau im Originalfarbton</li><li>Teil- und Komplettlackierungen</li></ul>"
             "<p>Vorbereitung, Lackaufbau und Farbton orientieren sich am Original – so bleibt der Klassiker stimmig.</p>"),
            ("Unsere Projekte",
             "<p>Ob Porsche 911, VW Bulli T2 oder Porsche Cayenne: Einige unserer Projekte zeigen wir ausführlich.</p>"
             '<p><a href="porsche-911.html">Porsche 911</a> · <a href="vw-bulli-t2.html">VW Bulli T2</a> · <a href="porsche-gts.html">Porsche Cayenne GTS</a></p>'
             '<p>Individuelle Designs und Sonderlackierungen finden Sie bei <a href="https://taeubertcustomize.de/" target="_blank" rel="noopener">Täubert custom</a>.</p>'),
        ],
        "faq": [
            ("Restauriert ihr komplette Fahrzeuge?", "Unser Schwerpunkt liegt auf Karosserie, Entrostung und Lackierung. Was bei Ihrem Fahrzeug sinnvoll ist, besprechen wir gemeinsam vor Ort."),
            ("Könnt ihr den Originalfarbton treffen?", "Ja, der Farbton wird am Original orientiert und digital gemessen. Bei sehr alten Lacken stimmen wir den Ton zusätzlich mit Ihnen ab."),
            ("Wie lange dauert eine Restaurierung?", "Das hängt stark vom Zustand des Fahrzeugs ab. Nach der Begutachtung bekommen Sie eine realistische Einschätzung."),
        ],
    },
    "fuhrparkservice": {
        "title": "Fuhrparkservice Sonneberg – Firmenfahrzeuge",
        "short": "Fuhrparkservice",
        "desc": "Karosserie- und Lackservice für Firmenwagen und Transporter in Sonneberg & Neustadt bei Coburg: Schäden schnell beheben, Fahrzeuge schnell zurück im Einsatz.",
        "claim": "Ihre Flotte. Unser Job.",
        "lead": "Karosserie, Lack und Smart Repair für PKW, Transporter und Firmenfahrzeuge.",
        "sections": [
            ("Fahrzeuge, die stehen, kosten Geld",
             "<p>Ein Firmenwagen mit Delle oder ein Transporter mit beschädigter Seitenwand – im Betrieb zählt vor allem, dass das Fahrzeug schnell wieder einsatzbereit ist. Wir kümmern uns darum, dass Reparaturen planbar und zügig laufen.</p>"),
            ("Was wir für Ihren Fuhrpark tun",
             "<ul><li>Unfallinstandsetzung und Karosseriearbeiten</li><li>Lackierung und Spot Repair</li><li>Smart Repair bei kleinen Dellen und Kratzern</li><li>Vorbereitung von Leasingfahrzeugen auf die Rückgabe</li><li>Fahrzeugaufbereitung</li></ul>"
             "<p>Wir reparieren PKW, Transporter und Firmenfahrzeuge aller Marken.</p>"),
            ("Ein Ansprechpartner für alle Fahrzeuge",
             "<p>Sprechen Sie uns an, wenn Sie mehrere Fahrzeuge betreuen. Wir stimmen Termine und Abläufe so mit Ihnen ab, dass Ausfallzeiten möglichst kurz bleiben.</p>"),
        ],
        "faq": [
            ("Repariert ihr auch Transporter?", "Ja, neben PKW reparieren wir auch Transporter und Firmenfahrzeuge."),
            ("Können Termine für mehrere Fahrzeuge abgestimmt werden?", "Ja. Sprechen Sie uns an, dann planen wir die Termine gemeinsam mit Ihnen."),
            ("Übernehmt ihr die Abwicklung mit der Versicherung?", "Bei Unfallschäden stimmen wir uns mit Versicherung und Gutachter ab – auch bei Firmenfahrzeugen."),
        ],
    },
    "versicherungsschaden": {
        "title": "Versicherungsschaden Sonneberg – direkt abgerechnet",
        "short": "Versicherungsschaden",
        "desc": "Versicherungsschaden in Sonneberg: Täubert übernimmt Schadenaufnahme, Abstimmung mit Versicherung und Gutachter sowie die komplette Reparatur.",
        "claim": "Sie bringen das Auto. Wir regeln den Rest.",
        "lead": "Schadenaufnahme, Versicherung, Gutachter und Reparatur – alles aus einer Hand.",
        "sections": [
            ("Papierkram ist nicht Ihr Job",
             "<p>Nach einem Unfall möchte niemand Formulare ausfüllen und Telefonate führen. Bei Täubert müssen Sie das auch nicht: Wir übernehmen die Abstimmung mit der Versicherung und dem Gutachter und kümmern uns um die Reparatur.</p>"),
            ("So läuft die Abwicklung",
             "<ol><li>Sie melden den Schaden bei uns – telefonisch, per WhatsApp oder über die Online-Terminbuchung.</li>"
             "<li>Wir nehmen den Schaden auf und dokumentieren ihn.</li>"
             "<li>Wir stimmen uns mit Ihrer Versicherung und dem Gutachter ab.</li>"
             "<li>Wir reparieren Karosserie und Lack im eigenen Haus.</li>"
             "<li>Sie holen Ihr Fahrzeug fertig repariert ab.</li></ol>"),
            ("Haftpflicht oder Kasko?",
             "<p>Wer die Kosten übernimmt, hängt davon ab, wer den Schaden verursacht hat und wie Sie versichert sind. Mehr dazu lesen Sie in unserem Ratgeber <a href=\"unfall-oder-kratzer.html\">Unfall oder Kratzer – wer übernimmt die Reparaturkosten?</a></p>"),
        ],
        "faq": [
            ("Muss ich den Gutachter der Versicherung akzeptieren?", "Wenn Sie nicht schuld sind, dürfen Sie in der Regel einen unabhängigen Gutachter wählen. Wir beraten Sie dazu gern."),
            ("Bekomme ich einen Ersatzwagen?", "Bei Fremdverschulden haben Sie meist Anspruch auf einen Mietwagen oder eine Nutzungsausfallentschädigung."),
            ("Muss ich die Reparatur vorstrecken?", "In vielen Fällen rechnen wir direkt mit der Versicherung ab. Ob das bei Ihnen möglich ist, klären wir vorab mit Ihnen."),
        ],
    },
}
