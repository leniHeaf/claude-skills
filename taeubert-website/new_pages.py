"""Zusätzliche Leistungsseiten (eigene Texte), aus der Wettbewerbsanalyse abgeleitet.

Nur Leistungen, die laut den bestehenden Täubert-Seiten angeboten werden bzw. vom Betrieb ergänzt wurden (Aufbereitung, Unterboden).
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
            ("Bieten Sie Hohlraumversiegelung für Klassiker an?", "Ja, zum Beispiel mit Mike Sanders Korrosionsschutzfett – ideal für Oldtimer. Mehr dazu beim <a href=\"unterbodenschutz.html\">Unterbodenschutz</a>."),
            ("Restaurieren Sie komplette Fahrzeuge?", "Unser Schwerpunkt liegt auf Karosserie, Entrostung und Lackierung. Was bei Ihrem Fahrzeug sinnvoll ist, besprechen wir gemeinsam vor Ort."),
            ("Können Sie den Originalfarbton treffen?", "Ja, der Farbton wird am Original orientiert und digital gemessen. Bei sehr alten Lacken stimmen wir den Ton zusätzlich mit Ihnen ab."),
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
            ("Reparieren Sie auch Transporter?", "Ja, neben PKW reparieren wir auch Transporter und Firmenfahrzeuge."),
            ("Können Termine für mehrere Fahrzeuge abgestimmt werden?", "Ja. Sprechen Sie uns an, dann planen wir die Termine gemeinsam mit Ihnen."),
            ("Übernehmen Sie die Abwicklung mit der Versicherung?", "Bei Unfallschäden stimmen wir uns mit Versicherung und Gutachter ab – auch bei Firmenfahrzeugen."),
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


NEW_PAGES.update({
    "unterbodenschutz": {
        "title": "Unterbodenschutz & Mike Sanders Versiegelung Sonneberg",
        "short": "Unterbodenschutz",
        "desc": "Unterbodenschutz und Hohlraumversiegelung in Sonneberg – auch mit Mike Sanders Korrosionsschutzfett: Unterbodenwäsche, Rostbehandlung und Langzeitschutz für Alltagsauto und Klassiker.",
        "claim": "Schutz von unten.",
        "lead": "Unterbodenwäsche, Rostbehandlung, Unterbodenschutz und Hohlraumversiegelung – auch mit Mike Sanders. Damit Streusalz keine Chance hat.",
        "sections": [
            ("Was man nicht sieht, rostet zuerst",
             "<p>Im Winter im Thüringer Wald bekommt der Unterboden einiges ab: Streusalz, Splitt, Nässe und Schmutz setzen sich in Falzen, Schwellern und Radhäusern fest. Rost entsteht dort oft unbemerkt – bis er teuer wird oder beim TÜV auffällt.</p>"
             "<p>Ein intakter Unterbodenschutz und versiegelte Hohlräume halten Ihr Fahrzeug über Jahre gesund.</p>"),
            ("Unsere Leistungen am Unterboden",
             "<ul><li><strong>Unterbodenwäsche:</strong> gründliche Reinigung von Salz und Schmutz als Grundlage für jede Behandlung</li>"
             "<li><strong>Prüfung:</strong> Wir schauen uns Unterboden, Schweller, Radhäuser und Falze auf der Hebebühne genau an</li>"
             "<li><strong>Rostbehandlung:</strong> Roststellen entfernen, behandeln und grundieren</li>"
             "<li><strong>Unterbodenschutz:</strong> neue Schutzschicht auf gefährdeten Bereichen</li>"
             "<li><strong>Hohlraumversiegelung:</strong> Konservierung in Schwellern, Türen und Hohlräumen</li>"
             "<li><strong>Mike Sanders Versiegelung:</strong> Langzeit-Korrosionsschutz mit heiß verarbeitetem Fett</li></ul>"),
            ("Mike Sanders Versiegelung",
             "<p>Das Korrosionsschutzfett von Mike Sanders gilt unter Oldtimer- und Youngtimer-Fans als Klassiker – aus gutem Grund. Es wird erhitzt und flüssig in Hohlräume, Schweller, Träger und auf den Unterboden gesprüht. Dabei kriecht es tief in Falze und Nähte und verdrängt Feuchtigkeit.</p>"
             "<ul><li>bleibt dauerhaft elastisch und wird nicht spröde</li><li>kleine Beschädigungen schließen sich wieder</li><li>kriecht in Falze und Spalten, die andere Mittel nicht erreichen</li><li>ideal für Klassiker, Wohnmobile, Transporter und Fahrzeuge, die lange halten sollen</li></ul>"
             "<p>Vorher wird der Unterboden gereinigt, getrocknet und auf Rost geprüft. Vorhandene Roststellen behandeln wir zuerst – erst dann wird versiegelt.</p>"),
            ("Wann sich Unterbodenschutz lohnt",
             "<ul><li>vor dem Winter – und nach dem Winter, um Salz zu entfernen</li><li>nach dem Kauf eines Gebrauchtwagens</li><li>vor der Hauptuntersuchung, wenn Rost sichtbar ist</li><li>bei Oldtimern, Wohnmobilen und Transportern, die lange halten sollen</li></ul>"
             "<p>Ist bereits Blech durchgerostet, übernehmen unsere Karosseriebauer die Reparatur – im selben Betrieb.</p>"),
        ],
        "faq": [
            ("Wie oft sollte der Unterbodenschutz geprüft werden?", "Am besten einmal im Jahr, idealerweise nach dem Winter. Dann sieht man Beschädigungen durch Splitt und Salz und kann früh reagieren."),
            ("Was ist der Unterschied zwischen Unterbodenschutz und Hohlraumversiegelung?", "Der Unterbodenschutz schützt die sichtbaren Flächen unter dem Fahrzeug. Die Hohlraumversiegelung konserviert die Innenseiten von Schwellern, Türen und Trägern, wo Feuchtigkeit sonst unbemerkt Rost bildet."),
            ("Was ist eine Mike Sanders Versiegelung?", "Eine Hohlraum- und Unterbodenkonservierung mit dem Korrosionsschutzfett von Mike Sanders. Es wird heiß verarbeitet, kriecht tief in Falze und Hohlräume, bleibt elastisch und schützt so besonders lange vor Rost."),
            ("Für welche Fahrzeuge lohnt sich Mike Sanders?", "Besonders für Oldtimer und Youngtimer, Wohnmobile, Transporter und alle Fahrzeuge, die man lange behalten möchte. Aber auch ein Alltagsauto profitiert vom Langzeitschutz."),
            ("Kann das Fett nach der Behandlung tropfen?", "An den ersten sehr warmen Tagen kann überschüssiges Fett an Ablauföffnungen austreten. Das ist normal und lässt nach – wir sagen Ihnen bei der Abholung, worauf Sie achten sollten."),
            ("Kann vorhandener Rost einfach überdeckt werden?", "Das machen wir nicht. Rost wird zuerst entfernt und behandelt – sonst arbeitet er unter der neuen Schicht weiter."),
        ],
    },
    "lackaufbereitung": {
        "title": "Lackaufbereitung & Politur Sonneberg",
        "short": "Lackaufbereitung",
        "desc": "Lackaufbereitung und Politur in Sonneberg: Waschkratzer, Hologramme und stumpfen Lack maschinell aufbereiten – für Tiefenglanz wie am ersten Tag.",
        "claim": "Glanz, der zurückkommt.",
        "lead": "Waschkratzer, Hologramme, stumpfer Lack – wir polieren maschinell in mehreren Stufen.",
        "sections": [
            ("Warum Lack mit der Zeit stumpf wird",
             "<p>Waschanlage, Sonne, Vogelkot, Baumharz: Mit den Jahren entstehen feine Kratzer und Schlieren, die das Licht streuen. Der Lack wirkt matt, die Farbe flach.</p>"
             "<p>Meist liegt der Schaden nur in der obersten Klarlackschicht – und lässt sich herauspolieren.</p>"),
            ("So bereiten wir Ihren Lack auf",
             "<ul><li><strong>Gründliche Wäsche und Dekontamination:</strong> Flugrost, Teer und Rückstände werden entfernt</li>"
             "<li><strong>Lackanalyse:</strong> Wir prüfen Zustand und Schichtdicke, bevor wir polieren</li>"
             "<li><strong>Maschinelle Politur:</strong> je nach Zustand ein- oder mehrstufig – vom Schleifen feiner Kratzer bis zum Hochglanz-Finish</li>"
             "<li><strong>Schutz:</strong> Wachs, Sealant oder Keramikversiegelung, damit der Glanz bleibt</li></ul>"),
            ("Wenn Polieren nicht reicht",
             "<p>Kratzer, die bis in die Farbschicht oder das Metall gehen, lassen sich nicht wegpolieren. Dann sagen wir Ihnen das ehrlich – und reparieren die Stelle in unserer Lackierkabine mit digitaler Farbtonmessung.</p>"),
        ],
        "faq": [
            ("Welche Kratzer kann man wegpolieren?", "Kratzer, die nur im Klarlack liegen – zum Beispiel Waschkratzer und Hologramme. Ein Anhaltspunkt: Bleibt der Fingernagel nicht hängen, ist Politur meist möglich."),
            ("Wird bei der Politur Lack abgetragen?", "Ja, ein sehr kleiner Teil des Klarlacks. Deshalb prüfen wir vorher die Schichtdicke und polieren nur so viel wie nötig."),
            ("Wie lange hält das Ergebnis?", "Das hängt von Pflege und Schutz ab. Mit einer Versiegelung und schonender Handwäsche bleibt der Glanz deutlich länger erhalten."),
        ],
    },
    "keramikversiegelung": {
        "title": "Keramikversiegelung & Lackversiegelung Sonneberg",
        "short": "Keramikversiegelung",
        "desc": "Keramikversiegelung und Lackversiegelung in Sonneberg: dauerhafter Schutz und Tiefenglanz – Wasser perlt ab, Schmutz haftet weniger, Pflege wird leichter.",
        "claim": "Schutz, den man sieht.",
        "lead": "Keramik-, Sealant- oder Wachsversiegelung – für Glanz, Schutz und leichtere Pflege.",
        "sections": [
            ("Was eine Versiegelung bringt",
             "<ul><li>tiefer Glanz und satte Farbe</li><li>Wasser perlt ab, Schmutz und Insekten haften weniger</li><li>Schutz vor UV-Strahlung, Vogelkot und Streusalz</li><li>einfachere und schnellere Wäsche</li></ul>"),
            ("Keramik, Sealant oder Wachs?",
             "<p><strong>Keramikversiegelung</strong> bildet eine besonders harte, langlebige Schutzschicht – ideal für Neuwagen und frisch aufbereitete Fahrzeuge.</p>"
             "<p><strong>Sealant und Wachs</strong> sind die günstigere Wahl mit kürzerer Haltbarkeit – gut für regelmäßige Pflege.</p>"
             "<p>Wir beraten Sie, was zu Ihrem Fahrzeug und Ihrer Nutzung passt.</p>"),
            ("Die Vorbereitung entscheidet",
             "<p>Eine Versiegelung konserviert den Zustand, den der Lack gerade hat – auch Kratzer. Deshalb wird der Lack vorher gründlich gereinigt und bei Bedarf poliert. Auch Felgen, Scheiben und Kunststoffteile können versiegelt werden.</p>"),
        ],
        "faq": [
            ("Wie lange hält eine Keramikversiegelung?", "Deutlich länger als Wachs – bei richtiger Pflege mehrere Jahre. Die genaue Haltbarkeit hängt vom Produkt, der Nutzung und der Pflege ab."),
            ("Kann ich mit Keramikversiegelung in die Waschanlage?", "Wir empfehlen schonende Handwäsche. Bürstenwaschanlagen verursachen Kratzer und verkürzen die Lebensdauer jeder Versiegelung."),
            ("Lohnt sich eine Versiegelung bei einem Neuwagen?", "Ja, gerade dann: Der Lack ist noch makellos, und die Versiegelung schützt ihn von Anfang an."),
        ],
    },
    "innenraumaufbereitung": {
        "title": "Innenraumaufbereitung & Polsterreinigung Sonneberg",
        "short": "Innenraumaufbereitung",
        "desc": "Innenraumaufbereitung in Sonneberg: Polster- und Lederreinigung, Teppiche, Armaturen und Geruchsentfernung – damit Sie wieder gern einsteigen.",
        "claim": "Einsteigen und wohlfühlen.",
        "lead": "Sitze, Teppiche, Leder, Armaturen und Gerüche – gründlich gereinigt und gepflegt.",
        "sections": [
            ("Der Unterschied, den man sofort merkt",
             "<p>Im Innenraum verbringen Sie die meiste Zeit. Krümel, Flecken, Tierhaare und Gerüche fallen jeden Tag auf – eine gründliche Aufbereitung macht hier den größten Unterschied.</p>"),
            ("Was wir im Innenraum machen",
             "<ul><li>Sitze aus Stoff: Tiefenreinigung und Fleckentfernung</li><li>Leder: Reinigung und Pflege, damit es geschmeidig bleibt</li><li>Teppiche, Fußmatten und Kofferraum</li><li>Armaturen, Displays, Lüftungen und schwer erreichbare Stellen</li><li>Tierhaarentfernung</li><li>Geruchsbehandlung – z. B. bei Rauch, Hund oder Feuchtigkeit</li><li>Scheiben innen streifenfrei</li></ul>"),
            ("Ideal vor Verkauf und Leasingrückgabe",
             "<p>Ein gepflegter Innenraum macht beim Verkauf den ersten Eindruck – und vermeidet Diskussionen bei der Leasingrückgabe. Kombiniert mit einer Lackaufbereitung wirkt Ihr Fahrzeug wieder wie frisch übernommen.</p>"),
        ],
        "faq": [
            ("Lassen sich alle Flecken entfernen?", "Die meisten ja. Bei sehr alten oder eingebrannten Flecken ist manchmal nur eine deutliche Verbesserung möglich – das sagen wir Ihnen vorher."),
            ("Bekommt man Rauchgeruch wirklich raus?", "In den meisten Fällen deutlich bis vollständig. Dazu reinigen wir alle Flächen und behandeln den Geruch gezielt an der Quelle."),
            ("Wie lange dauert eine Innenraumaufbereitung?", "Das hängt vom Zustand ab. Wir nennen Ihnen beim Termin einen verbindlichen Abholzeitpunkt."),
        ],
    },
    "scheinwerfer-aufbereiten": {
        "title": "Scheinwerfer aufbereiten Sonneberg",
        "short": "Scheinwerfer aufbereiten",
        "desc": "Scheinwerfer aufbereiten in Sonneberg: vergilbte und matte Scheinwerfer schleifen, polieren und versiegeln – für klare Sicht und gepflegte Optik.",
        "claim": "Klare Sicht. Klare Linie.",
        "lead": "Vergilbte, matte Scheinwerfer werden wieder klar – geschliffen, poliert und versiegelt.",
        "sections": [
            ("Warum Scheinwerfer blind werden",
             "<p>Moderne Scheinwerfer bestehen aus Kunststoff. UV-Strahlung, Steinschlag und Waschanlagen machen die Oberfläche mit den Jahren gelblich und matt. Das sieht nicht nur alt aus – die Lichtausbeute sinkt spürbar.</p>"),
            ("So bereiten wir Scheinwerfer auf",
             "<ul><li>Abkleben der umliegenden Lackflächen</li><li>Nassschleifen in mehreren Stufen</li><li>Politur bis zur vollen Klarheit</li><li>UV-Schutz-Versiegelung, damit die Scheinwerfer lange klar bleiben</li></ul>"),
            ("Aufbereiten statt neu kaufen",
             "<p>Neue Scheinwerfer sind teuer. Solange das Glas nicht gerissen und innen nichts beschädigt ist, ist die Aufbereitung meist die deutlich günstigere Lösung.</p>"),
        ],
        "faq": [
            ("Hilft die Aufbereitung bei der Hauptuntersuchung?", "Stark eingetrübte Scheinwerfer können die Lichtwerte verschlechtern. Klare Scheinwerfer verbessern Ausleuchtung und Optik."),
            ("Was, wenn der Scheinwerfer innen beschlagen ist?", "Feuchtigkeit oder Schäden im Inneren lassen sich durch Aufbereiten von außen nicht beheben. Wir prüfen das vorher und sagen Ihnen, was sinnvoll ist."),
            ("Wie lange bleiben die Scheinwerfer klar?", "Durch die abschließende UV-Versiegelung deutlich länger als nach einer einfachen Politur."),
        ],
    },
})


# Ersetzt die Shopify-Seite, die versehentlich den Aufbereitungs-Text enthielt
NEW_PAGES["unfallinstandsetzung"] = {
    "title": "Unfallinstandsetzung Sonneberg & Coburg",
    "short": "Unfallinstandsetzung",
    "desc": "Unfallreparatur in Sonneberg & Neustadt bei Coburg: Karosserie, Lack und Abwicklung mit Versicherung und Gutachter aus einer Hand – mit Ersatzwagen.",
    "claim": "Nach dem Unfall in guten Händen.",
    "lead": "Karosserie, Lack und Versicherung aus einer Hand – mit Ersatzwagen sowie Hol- und Bringservice.",
    "sections": [
        ("Ein Unfall ist Stress genug",
         "<p>Telefonate mit der Versicherung, Gutachter, Werkstatt, Mietwagen – nach einem Unfall kommt vieles auf einmal. Bei uns haben Sie dafür einen Ansprechpartner.</p>"
         "<p>Sie bringen das Auto. Wir regeln den Rest – und Sie bekommen Ihr Fahrzeug so zurück, dass man nicht mehr sieht, wo der Schaden war.</p>"),
        ("Was wir für Sie übernehmen",
         "<ul><li><strong>Schadensaufnahme</strong> mit Fotodokumentation</li>"
         "<li><strong>Kostenvoranschlag in 24 Stunden</strong></li>"
         "<li><strong>Abstimmung mit Gutachter und Versicherung</strong> – und direkte Abrechnung mit der Versicherung</li>"
         "<li><strong>Karosseriereparatur</strong> nach Herstellervorgaben – mit Richtbank und präziser Vermessung</li>"
         "<li><strong>Lackierung</strong> im eigenen Haus mit digitaler Farbtonmessung</li>"
         "<li><strong>Ersatzwagen</strong> sowie <strong>Hol- und Bringservice</strong></li></ul>"),
        ("Haftpflicht, Kasko oder selbst zahlen?",
         "<p>Waren Sie nicht schuld, zahlt in der Regel die Haftpflichtversicherung des Unfallgegners. Bei selbst verursachten Schäden kommt Ihre Vollkasko infrage. Bei kleineren Schäden kann es günstiger sein, selbst zu zahlen, um eine Rückstufung zu vermeiden.</p>"
         "<p>Wir helfen Ihnen bei der Einordnung – mehr dazu im Ratgeber <a href=\"unfall-oder-kratzer.html\">Unfall oder Kratzer – wer zahlt?</a></p>"),
        ("Gerade passiert?",
         "<p>Unfallstelle sichern, Polizei bei Verletzten, Fotos machen, Daten austauschen – unsere Checkliste zeigt Schritt für Schritt, <a href=\"unfall-was-tun.html\">was jetzt zu tun ist</a>. Oder rufen Sie uns direkt an: <a href=\"tel:+4936754289606\">03675 4289606</a>.</p>"),
    ],
    "faq": [
        ("Darf ich die Werkstatt selbst wählen?", "Bei einem Haftpflichtschaden – also wenn der Unfallgegner schuld ist – können Sie die Werkstatt grundsätzlich frei wählen. Bei Kaskoschäden hängt es von Ihrem Tarif ab; manche Verträge sehen eine Werkstattbindung vor."),
        ("Brauche ich einen Gutachter?", "Bei größeren Haftpflichtschäden haben Sie Anspruch auf einen unabhängigen Gutachter. Bei kleineren Schäden reicht oft ein Kostenvoranschlag. Wir sagen Ihnen, was in Ihrem Fall sinnvoll ist, und stimmen uns mit dem Gutachter ab."),
        ("Bekomme ich einen Ersatzwagen?", "Ja. Damit Sie mobil bleiben, stellen wir Ihnen für die Dauer der Reparatur einen Ersatzwagen zur Verfügung. Auf Wunsch holen wir Ihr Fahrzeug auch ab und bringen es zurück."),
        ("Wie lange dauert die Reparatur?", "Das hängt vom Schaden und von der Teileverfügbarkeit ab. Mit dem Kostenvoranschlag nennen wir Ihnen einen realistischen Zeitrahmen."),
    ],
}


NEW_PAGES.update({
    "hu-au": {
        "title": "HU/AU (TÜV) Sonneberg – Hauptuntersuchung",
        "short": "HU/AU (TÜV)",
        "desc": "HU/AU in Sonneberg: Wir bereiten Ihr Fahrzeug auf die Hauptuntersuchung vor, beheben Mängel wie Rost oder blinde Scheinwerfer direkt im Haus und kümmern uns um die Prüfung.",
        "claim": "Neue Plakette. Ohne Stress.",
        "lead": "Vorab-Check, Mängel direkt beheben, Prüfung organisieren – Sie holen Ihr Auto mit Plakette ab.",
        "sections": [
            ("HU/AU-Service bei Täubert",
             "<p>Die Hauptuntersuchung (HU, umgangssprachlich „TÜV“) und die Abgasuntersuchung (AU) sind Pflicht. Damit Ihr Termin ohne böse Überraschung endet, schauen wir uns Ihr Fahrzeug vorher an und beheben, was die Plakette gefährden würde.</p>"
             "<ul><li><strong>Vorab-Check</strong> der typischen Prüfpunkte</li><li><strong>Mängel direkt beheben</strong> – Karosserie, Rost, Unterboden, Scheinwerfer, Reifen</li><li><strong>Prüfung organisieren</strong> durch eine amtlich anerkannte Prüforganisation</li></ul>"),
            ("Was bei der HU geprüft wird",
             "<ul><li>Bremsen, Lenkung und Fahrwerk</li><li>Beleuchtung und Scheinwerfereinstellung</li><li>Karosserie, tragende Teile und Rost</li><li>Reifen und Räder</li><li>Abgasverhalten (AU)</li><li>Sicherheits- und Umweltbauteile</li></ul>"),
            ("Typische Mängel, die wir direkt beheben",
             "<ul><li>Durchrostungen an Schwellern, Radläufen und Unterboden – Instandsetzung durch unsere Karosseriebauer</li><li>beschädigter <a href=\"unterbodenschutz.html\">Unterbodenschutz</a></li><li>blinde oder vergilbte Scheinwerfer – <a href=\"scheinwerfer-aufbereiten.html\">aufbereiten</a> statt neu kaufen</li><li>abgefahrene oder beschädigte <a href=\"reifen-kaufen.html\">Reifen</a></li><li>scharfkantige Unfallschäden</li></ul>"),
        ],
        "faq": [
            ("Wie oft muss mein Auto zur Hauptuntersuchung?", "Ein neuer Pkw muss nach drei Jahren zur ersten HU, danach alle zwei Jahre. Wann es so weit ist, zeigt die Plakette auf dem hinteren Kennzeichen."),
            ("Was passiert, wenn ich die HU überzogen habe?", "Ab etwa zwei Monaten Überziehung drohen ein Verwarn- bzw. Bußgeld und eine erweiterte Prüfung. Am besten rechtzeitig einen Termin buchen."),
            ("Was, wenn bei der HU Mängel gefunden werden?", "Dann beheben wir sie direkt bei uns – Karosserie, Rost, Scheinwerfer oder Reifen – und das Fahrzeug wird zur Nachprüfung vorgestellt."),
            ("Kann ich HU/AU mit einer Reparatur verbinden?", "Ja. Ob Lackschaden, Unfallreparatur oder Aufbereitung – wir erledigen alles in einem Termin."),
        ],
    },
    "reifen-kaufen": {
        "title": "Reifen kaufen & wechseln Sonneberg",
        "short": "Reifen bestellen",
        "desc": "Neue Reifen in Sonneberg bestellen und montieren lassen: Sommer-, Winter- und Ganzjahresreifen aller Marken – mit Beratung, Montage, Wuchten und Einlagerung.",
        "claim": "Neue Reifen. Ohne Umweg.",
        "lead": "Wir beraten, bestellen, montieren und wuchten – und lagern Ihre Räder auf Wunsch ein.",
        "sections": [
            ("Wir bestellen Ihre Reifen",
             "<p>Sommer-, Winter- oder Ganzjahresreifen, Premium oder preisbewusst: Wir beraten Sie nach Fahrzeug und Fahrprofil und bestellen die passenden Reifen für Sie – Sie müssen sich um nichts kümmern.</p>"
             "<ul><li>alle gängigen Größen und Marken</li><li>Beratung zu Fahrprofil, Laufleistung und Budget</li><li>auf Wunsch komplette Räder mit Felgen</li></ul>"),
            ("Montage, Wuchten, Einlagerung",
             "<ul><li>Montage und Auswuchten</li><li>Reifendruck-Kontrollsystem wird berücksichtigt</li><li>Räderwechsel zum Saisonwechsel</li><li>fachgerechte <a href=\"reifenservice.html\">Einlagerung</a> Ihrer Räder</li></ul>"
             "<p>Beschädigte Alufelge? Die bringen wir mit unserer <a href=\"felgenreparatur.html\">Felgenreparatur</a> wieder in Form.</p>"),
            ("Wann brauche ich neue Reifen?",
             "<p>Gesetzlich vorgeschrieben sind mindestens 1,6 mm Profiltiefe. Empfohlen werden bei Sommerreifen etwa 3 mm und bei Winterreifen etwa 4 mm. Auch das Alter zählt: Gummi wird mit den Jahren hart – wir prüfen Ihre Reifen gern und sagen Ihnen ehrlich, ob ein Wechsel nötig ist.</p>"),
        ],
        "faq": [
            ("Welche Reifengröße passt auf mein Auto?", "Die Größe steht auf der Reifenflanke (z. B. 205/55 R16) und in der Zulassungsbescheinigung. Am einfachsten: Fahrzeug nennen oder ein Foto der Reifenflanke schicken – wir finden die passenden Reifen."),
            ("Wie lange dauert die Bestellung?", "In der Regel sind die Reifen innerhalb weniger Werktage da. Den Montagetermin stimmen wir direkt mit Ihnen ab."),
            ("Lohnen sich Ganzjahresreifen?", "Für Fahrer mit eher geringer Laufleistung und milden Wintern oft ja. Wer viel fährt oder häufig im Thüringer Wald unterwegs ist, ist mit Winterreifen meist besser bedient. Wir beraten Sie gern."),
        ],
    },
    "felgenreparatur": {
        "title": "Felgenreparatur Sonneberg – Bordsteinschäden",
        "short": "Felgenreparatur",
        "desc": "Felgenreparatur in Sonneberg: Bordsteinschäden, Kratzer und Korrosion an Alufelgen beseitigen und im Originalfarbton lackieren – günstiger als neue Felgen.",
        "claim": "Bordstein erwischt? Wird wieder schön.",
        "lead": "Kratzer, Bordsteinschäden und Korrosion an Alufelgen – geschliffen, gespachtelt und neu lackiert.",
        "sections": [
            ("Typische Felgenschäden",
             "<ul><li>Bordsteinschäden am Felgenhorn</li><li>Kratzer und Schrammen</li><li>Korrosion und abblätternder Lack</li><li>verblasste oder beschädigte Felgenfarbe</li></ul>"),
            ("So reparieren wir Ihre Felgen",
             "<ul><li><strong>Prüfung:</strong> Wir kontrollieren die Felge auf Risse und Verformungen</li><li><strong>Vorbereitung:</strong> Schleifen, Spachteln, Glätten der beschädigten Stellen</li><li><strong>Lackierung:</strong> im Originalfarbton – Silber, Anthrazit, Schwarz oder Ihre Wunschfarbe</li><li><strong>Klarlack:</strong> für Glanz und Schutz</li></ul>"
             "<p>Wunschfarbe gefällig? Felgen lackieren wir auch komplett um.</p>"),
            ("Wann eine Reparatur nicht infrage kommt",
             "<p>Bei Rissen oder verformten Felgen geht Sicherheit vor – dann ist ein Austausch die richtige Wahl. Glanzgedrehte Felgen erfordern ein besonderes Verfahren; sprechen Sie uns darauf an.</p>"),
        ],
        "faq": [
            ("Lohnt sich eine Felgenreparatur?", "Meist ja – eine Reparatur ist in der Regel deutlich günstiger als eine neue Felge, besonders bei Original-Alufelgen."),
            ("Sieht man die Reparatur danach?", "Unser Ziel ist, dass man keinen Unterschied sieht. Die Felge wird im passenden Farbton lackiert und mit Klarlack versiegelt."),
            ("Kann ich meine Felgen in einer anderen Farbe lackieren lassen?", "Ja, Felgen lackieren wir auf Wunsch komplett in einer neuen Farbe – zum Beispiel Schwarz glänzend oder matt."),
        ],
    },
    "lackstift": {
        "title": "Lackstift im Originalfarbton – Sonneberg",
        "short": "Lackstift",
        "desc": "Lackstift im Originalfarbton in Sonneberg: nach Farbcode exakt angemischt – für Steinschläge und kleine Kratzer. Mit Anleitung zur richtigen Anwendung.",
        "claim": "Ihr Farbton zum Mitnehmen.",
        "lead": "Nach Farbcode exakt angemischt – für Steinschläge, kleine Kratzer und Macken.",
        "sections": [
            ("Lackstift nach Farbcode",
             "<p>Ein guter Lackstift schützt kleine Macken vor Rost und lässt sie fast verschwinden. Wir mischen Ihren Farbton nach Farbcode exakt an – auf Wunsch messen wir den Lack direkt am Fahrzeug digital.</p>"
             "<p><strong>Ihr Farbcode</strong> steht meist auf dem Typenschild in der Fahrertür bzw. B-Säule, im Kofferraum oder im Serviceheft. Nicht gefunden? Bringen Sie das Auto kurz vorbei.</p>"),
            ("So verwenden Sie den Lackstift richtig",
             "<ol><li>Stelle gründlich reinigen und entfetten</li><li>Lose Lackteile vorsichtig entfernen</li><li>Lack dünn auftupfen, nicht streichen</li><li>Gut trocknen lassen, bei Bedarf eine zweite Schicht</li><li>Zum Schluss Klarlack für Glanz und Schutz</li></ol>"),
            ("Wann ein Lackstift reicht – und wann nicht",
             "<p>Für Steinschläge und kleine, punktuelle Kratzer ist der Lackstift ideal. Längere Kratzer, Dellen oder größere Flächen beheben wir besser mit <a href=\"smartrepair.html\">Smart Repair</a> oder einer <a href=\"lackierarbeiten.html\">Lackierung</a> – dann sieht man wirklich nichts mehr.</p>"),
        ],
        "faq": [
            ("Wo finde ich meinen Farbcode?", "Meist auf dem Typenschild an der B-Säule oder in der Fahrertür, manchmal im Kofferraum, unter der Motorhaube oder im Serviceheft. Wir helfen Ihnen gern beim Finden."),
            ("Wie schnell bekomme ich meinen Lackstift?", "Fragen Sie kurz per Telefon oder WhatsApp an – wir sagen Ihnen, wann Ihr Farbton fertig angemischt ist."),
            ("Schützt ein Lackstift vor Rost?", "Ja, bei kleinen Steinschlägen versiegelt er die offene Stelle und verhindert, dass Feuchtigkeit an das Blech kommt."),
        ],
    },
})


# Ratgeber-Artikel (beantworten typische Suchanfragen, verlinken auf passende Leistungen)
RATGEBER = {
    "wildunfall-was-tun": {
        "title": "Wildunfall – was tun? Checkliste & Versicherung",
        "short": "Wildunfall – was tun?",
        "desc": "Wildunfall mit Reh oder Wildschwein: Was Sie sofort tun müssen, warum die Wildunfallbescheinigung wichtig ist und welche Versicherung zahlt – Ratgeber von Täubert in Sonneberg.",
        "claim": "Wildunfall? Ruhe bewahren.",
        "lead": "Was Sie an der Unfallstelle tun, welche Bescheinigung Sie brauchen und wer den Schaden zahlt.",
        "img": "pexels-glv-visuals-859366-28611341.webp",
        "related": ["unfall", "versicherungsschaden", "karosserie"],
        "sections": [
            ("Sofort an der Unfallstelle",
             "<ol><li>Warnblinker an, Warnweste anziehen, Warndreieck aufstellen</li><li>Verletzte versorgen und bei Bedarf den Notruf 112 wählen</li><li>Polizei verständigen (110) – sie informiert den zuständigen Jäger</li><li>Das Tier nicht anfassen – verletzte Tiere können sich wehren</li><li>Fotos machen: Fahrzeug, Schaden, Tier und Unfallstelle</li></ol>"
             "<p>Nehmen Sie das Tier auf keinen Fall mit – das wäre Wilderei.</p>"),
            ("Die Wildunfallbescheinigung",
             "<p>Lassen Sie sich von Polizei oder Jäger eine Wildunfallbescheinigung ausstellen. Sie ist der wichtigste Nachweis für Ihre Versicherung. Melden Sie den Schaden anschließend zeitnah Ihrer Versicherung.</p>"),
            ("Wer zahlt den Schaden?",
             "<ul><li><strong>Teilkasko:</strong> zahlt in der Regel bei Zusammenstößen mit Haarwild wie Reh, Wildschwein, Hirsch, Fuchs oder Hase – viele Verträge auch bei Tieren aller Art.</li><li><strong>Keine Rückstufung:</strong> Ein Teilkasko-Schaden verschlechtert Ihren Schadenfreiheitsrabatt nicht.</li><li><strong>Ausweichmanöver ohne Zusammenstoß:</strong> Hier kommt es auf Ihren Vertrag an – lassen Sie sich beraten.</li></ul>"
             "<p>Bei Täubert rechnen wir direkt mit Ihrer Versicherung ab, stellen einen Ersatzwagen und holen Ihr Auto im Umkreis von 30 km ab.</p>"),
        ],
        "faq": [
            ("Muss ich nach einem Wildunfall die Polizei rufen?", "Ja, informieren Sie Polizei oder Jäger. Nur so erhalten Sie die Wildunfallbescheinigung, die Ihre Versicherung in der Regel verlangt."),
            ("Darf ich das tote Tier mitnehmen?", "Nein. Das Wild gehört dem Jagdpächter – wer es mitnimmt, macht sich strafbar."),
            ("Werde ich nach einem Wildunfall hochgestuft?", "Nein, wenn die Teilkasko zahlt. Teilkasko-Schäden wirken sich nicht auf den Schadenfreiheitsrabatt aus."),
        ],
    },
    "parkschaden-fahrerflucht": {
        "title": "Parkschaden mit Fahrerflucht – wer zahlt?",
        "short": "Parkschaden & Fahrerflucht",
        "desc": "Parkschaden und der Verursacher ist weg? So gehen Sie richtig vor, wer den Schaden zahlt und wann Selbstzahlen günstiger ist – Ratgeber von Täubert in Sonneberg.",
        "claim": "Delle da, Verursacher weg?",
        "lead": "So sichern Sie Beweise, wann die Versicherung zahlt – und wann eine günstige Reparatur die bessere Wahl ist.",
        "img": "pexels-artempodrez-8985722.jpg",
        "related": ["kleinschaden", "smartrepair", "kratzer"],
        "sections": [
            ("Das sollten Sie sofort tun",
             "<ol><li>Fotos vom Schaden und der Umgebung machen</li><li>Nach einem Zettel am Fahrzeug suchen – und nach Zeugen fragen</li><li>Unfallflucht bei der Polizei anzeigen, möglichst schnell</li><li>Den Schaden Ihrer Versicherung melden</li></ol>"),
            ("Wer zahlt den Schaden?",
             "<ul><li><strong>Verursacher wird ermittelt:</strong> Dessen Kfz-Haftpflicht zahlt – ohne Nachteile für Sie.</li><li><strong>Verursacher bleibt unbekannt:</strong> Es zahlt Ihre Vollkasko, sofern vorhanden – dann gilt Ihre Selbstbeteiligung und Sie werden zurückgestuft.</li><li><strong>Kleine Schäden:</strong> Oft ist Selbstzahlen günstiger als Rückstufung plus Selbstbeteiligung.</li></ul>"),
            ("Kleine Delle, kleiner Preis",
             "<p>Viele Parkschäden lassen sich per <a href=\"smartrepair.html\">Smart Repair</a> ohne Lackieren beheben – oft in wenigen Stunden. Schicken Sie uns Fotos, Sie bekommen den Kostenvoranschlag innerhalb von 24 Stunden. Dann rechnen wir gemeinsam durch, ob sich die Versicherung lohnt.</p>"),
        ],
        "faq": [
            ("Reicht ein Zettel hinter dem Scheibenwischer?", "Nein. Wer einen Schaden verursacht, muss angemessen warten oder die Polizei informieren. Ein Zettel allein schützt nicht vor dem Vorwurf der Unfallflucht."),
            ("Soll ich die Vollkasko in Anspruch nehmen?", "Bei kleinen Schäden oft nicht – Rückstufung und Selbstbeteiligung können teurer sein als die Reparatur. Wir rechnen es mit Ihnen durch."),
            ("Muss ich Anzeige erstatten, wenn ich selbst zahle?", "Empfehlenswert ist es trotzdem: Wird der Verursacher später ermittelt, können Sie die Kosten zurückfordern."),
        ],
    },
    "steinschlag-lack": {
        "title": "Steinschlag im Lack – reparieren, bevor Rost entsteht",
        "short": "Steinschlag im Lack",
        "desc": "Steinschlag im Autolack: warum Sie schnell handeln sollten, wann ein Lackstift reicht und wann Spot Repair oder Lackierung nötig ist – Ratgeber von Täubert in Sonneberg.",
        "claim": "Kleiner Punkt, große Wirkung.",
        "lead": "Warum Steinschläge im Lack schnell behandelt werden sollten – und welche Reparatur die richtige ist.",
        "img": "ElevenLabs_image_nano-banana_Nahaufnahmen..._2026-01-13T08_52_06.webp",
        "related": ["lackstift", "smartrepair", "lackierarbeiten"],
        "sections": [
            ("Warum Sie schnell handeln sollten",
             "<p>Ein Steinschlag sieht harmlos aus. Liegt das Blech frei, dringt aber Feuchtigkeit ein – besonders im Winter mit Streusalz. Der Rost wandert unter den Lack, und aus einem kleinen Punkt wird eine größere Reparatur.</p>"),
            ("Welche Reparatur passt?",
             "<ul><li><strong>Lackstift:</strong> für einzelne kleine Steinschläge – nach Farbcode exakt angemischt. <a href=\"lackstift.html\">Mehr zum Lackstift</a></li><li><strong>Spot Repair:</strong> für mehrere oder größere Stellen – punktgenau und kaum sichtbar.</li><li><strong>Teillackierung:</strong> wenn eine Motorhaube oder Front stark übersät ist.</li></ul>"),
            ("Vorbeugen",
             "<p>Eine <a href=\"keramikversiegelung.html\">Versiegelung</a> macht den Lack widerstandsfähiger und leichter zu pflegen. Und: Kleine Schäden am besten vor dem Winter schließen.</p>"
             "<p>Steinschlag in der Windschutzscheibe ist ein eigenes Thema – hier geht es um den Lack.</p>"),
        ],
        "faq": [
            ("Zahlt die Versicherung einen Steinschlag im Lack?", "In der Regel nicht über die Teilkasko – die deckt Glasschäden, nicht den Lack. Bei Lackschäden ist Selbstzahlen meist günstiger."),
            ("Kann ich einen Steinschlag selbst ausbessern?", "Ja, mit einem passend angemischten Lackstift. Wichtig: gründlich reinigen, dünn auftupfen und mit Klarlack abschließen."),
            ("Wie schnell rostet ein Steinschlag?", "Liegt das Blech frei, kann sich schon nach wenigen Wochen Flugrost bilden – im Winter schneller."),
        ],
    },
    "leasingrueckgabe-checkliste": {
        "title": "Leasingrückgabe-Checkliste: Nachzahlungen vermeiden",
        "short": "Checkliste Leasingrückgabe",
        "desc": "Leasingrückgabe ohne teure Nachzahlung: Checkliste für Lack, Felgen, Innenraum und Unterlagen – und wann sich eine Reparatur vorher lohnt. Ratgeber von Täubert in Sonneberg.",
        "claim": "Gut vorbereitet zurückgeben.",
        "lead": "Mit dieser Checkliste erkennen Sie, was der Gutachter beanstanden könnte – und was sich vorher günstig beheben lässt.",
        "img": "pexels-bulat843-1243575272-31389821.webp",
        "related": ["leasingrueckgabe", "fahrzeugaufbereitung", "felgenreparatur"],
        "sections": [
            ("Wann anfangen?",
             "<p>Am besten sechs bis acht Wochen vor der Rückgabe. Dann bleibt genug Zeit für Einschätzung, Reparatur und Aufbereitung – ohne Stress.</p>"),
            ("Checkliste außen",
             "<ul><li>Kratzer und Schrammen im Lack</li><li>Dellen und Parkschäden</li><li>Steinschläge an Front und Motorhaube</li><li>Bordsteinschäden an den Felgen</li><li>Risse oder Schäden an Stoßfängern</li><li>Reifen: Profiltiefe und Beschädigungen</li></ul>"),
            ("Checkliste innen und Unterlagen",
             "<ul><li>Flecken, Gerüche, Brandlöcher, Tierhaare</li><li>Kratzer an Verkleidungen und Displays</li><li>Serviceheft bzw. Wartungsnachweise</li><li>alle Schlüssel und Zubehör (Ladekabel, Kofferraumabdeckung, Warndreieck)</li></ul>"),
            ("Reparieren oder zahlen?",
             "<p>Leasinggeber berechnen Schäden oft nach Pauschalen. Kleine Schäden vorher per Smart Repair, Spot Repair oder Aufbereitung zu beheben, ist häufig deutlich günstiger. Wir schauen uns Ihr Fahrzeug an und sagen ehrlich, was sich lohnt – und was als normale Abnutzung durchgeht.</p>"),
        ],
        "faq": [
            ("Muss ich jeden Kratzer reparieren lassen?", "Nein. Normale Gebrauchsspuren sind meist erlaubt. Entscheidend ist der Schadenkatalog Ihres Leasinggebers – wir helfen bei der Einschätzung."),
            ("Bekomme ich vorher eine Einschätzung?", "Ja. Kommen Sie vorbei oder schicken Sie Fotos – Sie erhalten eine ehrliche Einschätzung und einen Kostenvoranschlag in 24 Stunden."),
            ("Lohnt sich eine Aufbereitung vor der Rückgabe?", "Oft ja. Ein sauberer, polierter Wagen macht einen deutlich besseren Eindruck, und viele Gebrauchsspuren verschwinden."),
        ],
    },
    "smart-repair-kosten": {
        "title": "Was kostet Smart Repair? Preisfaktoren & Ablauf",
        "short": "Smart Repair: Kosten",
        "desc": "Was kostet Smart Repair? Wovon der Preis abhängt, wo die Grenzen liegen und warum es meist günstiger ist als Lackieren – Ratgeber von Täubert in Sonneberg.",
        "claim": "Dellen weg. Lack bleibt.",
        "lead": "Wovon der Preis abhängt – und wie Sie in 24 Stunden wissen, was Ihre Reparatur kostet.",
        "img": "1_6f36b140-2e90-4499-9343-be0cf20702fe.webp",
        "related": ["smartrepair", "kleinschaden", "hagelschaden"],
        "sections": [
            ("Was ist Smart Repair?",
             "<p>Beim Smart Repair werden Dellen von innen schonend zurückgedrückt oder von außen herausgezogen – ohne neue Lackierung. Der Originallack bleibt erhalten, und die Reparatur dauert oft nur wenige Stunden.</p>"),
            ("Wovon der Preis abhängt",
             "<ul><li><strong>Größe und Tiefe</strong> der Delle</li><li><strong>Position:</strong> an Kanten und Sicken ist es aufwendiger</li><li><strong>Zugänglichkeit</strong> von innen</li><li><strong>Material:</strong> Aluminium ist anspruchsvoller als Stahl</li><li><strong>Lack:</strong> ist er gerissen, kommt ein Spot Repair hinzu</li></ul>"),
            ("Smart Repair oder Lackierung?",
             "<p>Smart Repair ist meist deutlich günstiger und schneller als eine Lackierung – und es gibt keine Farbunterschiede. Ist der Lack beschädigt oder die Delle zu stark, lackieren wir. Wir sagen Ihnen ehrlich, was sinnvoll ist.</p>"
             "<p><strong>Ihr Preis in 24 Stunden:</strong> Schicken Sie uns zwei, drei Fotos über <a href=\"schaden-melden.html\">Schaden per Foto melden</a>.</p>"),
        ],
        "faq": [
            ("Was kostet es, eine Delle entfernen zu lassen?", "Das hängt von Größe, Position und Zugänglichkeit ab. Schicken Sie uns Fotos – Sie bekommen innerhalb von 24 Stunden einen verbindlichen Kostenvoranschlag."),
            ("Wie lange dauert Smart Repair?", "Oft nur wenige Stunden – bei mehreren Dellen oder Hagelschaden entsprechend länger."),
            ("Funktioniert Smart Repair bei jeder Delle?", "Nicht immer. Ist der Lack gerissen oder die Delle sehr scharfkantig, ist eine Lackreparatur nötig. Wir prüfen das vorab."),
        ],
    },
    "auto-winterfest": {
        "title": "Auto winterfest machen – Checkliste für Thüringen",
        "short": "Auto winterfest machen",
        "desc": "Auto winterfest machen: Reifen, Unterbodenschutz, Lackversiegelung, Licht und kleine Lackschäden – Checkliste von Täubert in Sonneberg für Winter im Thüringer Wald.",
        "claim": "Bereit für Schnee und Salz.",
        "lead": "Streusalz, Splitt und Nässe setzen dem Auto zu. Mit dieser Checkliste kommt es gut durch den Winter.",
        "img": "pexels-borta-2790256-30787396.webp",
        "related": ["reifen-kaufen", "unterbodenschutz", "keramikversiegelung"],
        "sections": [
            ("Reifen",
             "<p>Faustregel: von O bis O – Oktober bis Ostern. Bei Glätte, Schnee oder Matsch sind Winterreifen Pflicht. Empfohlen werden mindestens 4 mm Profil. <a href=\"reifen-kaufen.html\">Reifen bestellen und wechseln</a></p>"),
            ("Unterboden und Hohlräume",
             "<p>Streusalz greift vor allem dort an, wo man nicht hinschaut. Eine Unterbodenwäsche und ein intakter Unterbodenschutz – zum Beispiel mit Mike Sanders – schützen vor Rost. <a href=\"unterbodenschutz.html\">Mehr zum Unterbodenschutz</a></p>"),
            ("Lack",
             "<p>Kleine Steinschläge und Kratzer vor dem Winter schließen – sonst rosten sie. Eine <a href=\"keramikversiegelung.html\">Versiegelung</a> schützt den Lack zusätzlich vor Salz und Schmutz.</p>"),
            ("Kurz-Checkliste",
             "<ul><li>Winterreifen montiert, Profil geprüft</li><li>Unterboden gereinigt und geschützt</li><li>Lackschäden ausgebessert, Lack versiegelt</li><li>Scheinwerfer klar und richtig eingestellt</li><li>Frostschutz im Scheibenwischwasser</li><li>Eiskratzer und Handbesen im Auto</li></ul>"),
        ],
        "faq": [
            ("Wann sollte ich mein Auto winterfest machen?", "Am besten im Oktober – bevor die ersten Frostnächte und das Streusalz kommen."),
            ("Lohnt sich eine Unterbodenwäsche im Winter?", "Ja, besonders nach längeren Fahrten auf gesalzenen Straßen und spätestens im Frühjahr."),
            ("Wann ist der beste Zeitpunkt für eine Versiegelung?", "Vor dem Winter: Dann ist der Lack geschützt, wenn Salz und Schmutz kommen."),
        ],
    },
}
