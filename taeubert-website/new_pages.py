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
