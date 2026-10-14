# ---------- Buch ----------
CH = [('Haltung finden', 'Warum es euch gibt – und warum das wichtiger ist als euer Produkt.'),
      ('Zielgruppe verstehen', 'Für wen ihr da seid. Und für wen ganz bewusst nicht.'),
      ('Versprechen formulieren', 'Eine Zusage, die ihr jeden Tag halten könnt.'),
      ('Werte leben', 'Wie aus Worten auf der Wand Verhalten im Alltag wird.'),
      ('Stimme finden', 'Tonalität, Claim und die Kunst, wiedererkannt zu werden.'),
      ('Gestalt geben', 'Vom Kompass zum Corporate Design – Schritt für Schritt.'),
      ('Marke zeigen', 'Roll-out, Kultur und die ersten 100 Tage mit neuer Marke.')]
chap = ''.join(f'<li data-r><span class="mo-label">(Kapitel {k+1:02d})</span><b>{t}</b><span>{d}</span></li>' for k, (t, d) in enumerate(CH))
B_HERO = '''    <section class="mo-book" aria-label="Das Buch">
      <div class="mo-book__txt">
        <p class="mo-label">(Das Strategie-eBook)</p>
        <h1 class="mo-book__t">Marken&shy;strategie<br><span class="mo-book__sub">ohne Bauchweh.</span></h1>
        <p class="mo-book__p">Wie ihr eine Marke baut, für die man einsteht. Unser Wissen aus Workshops und Projekten – in sieben Kapiteln, mit Checklisten und Vorlagen zum Ausfüllen.</p>
        <p><a class="mx-btn" href="#vormerken">Kostenlos vormerken</a></p>
      </div>
      <div class="mo-book__art"><div class="mo-cover mo-cover--st" data-stickers aria-label="Buchcover: Markenstrategie – wie ihr eine Marke baut, für die man einsteht, ohne Agentursprech und Bauchweh" role="img"><span class="mo-cover__l">B3DE<sup>®</sup></span><span class="mo-cover__h">markenstrategie</span><span class="mo-st" style="top:21%;left:4%;--r:-14deg;--i:0"><span class="ms ms--burst ms--v"><svg viewBox="0 0 100 100"><polygon points="50,2 61,22 83,14 79,37 98,50 79,63 83,86 61,78 50,98 39,78 17,86 21,63 2,50 21,37 17,14 39,22"/></svg><b>wie</b></span></span><span class="mo-st" style="top:23%;left:28%;--r:3deg;--i:1"><span class="ms ms--pill ms--o">ihr eine</span></span><span class="mo-st" style="top:21%;left:56%;--r:-6deg;--i:2"><span class="ms ms--pill ms--v">Marke baut,</span></span><span class="mo-st" style="top:31%;left:84%;--r:0deg;--i:3"><span class="ms ms--ic ms--line"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="12"/><path d="M50 18v10M50 72v10M18 50h10M72 50h10M27 27l7 7M66 66l7 7M27 73l7-7M66 34l7-7"/></svg></span></span><span class="mo-st" style="top:35%;left:8%;--r:0deg;--i:4"><span class="ms ms--ic ms--w"><svg viewBox="0 0 100 100"><path d="M30 70 70 30M40 30h30v30"/></svg></span></span><span class="mo-st" style="top:36%;left:27%;--r:-4deg;--i:5"><span class="ms ms--pill ms--l">für die</span></span><span class="mo-st" style="top:34%;left:60%;--r:8deg;--i:6"><span class="ms ms--ic ms--w"><svg viewBox="0 0 100 100"><rect x="22" y="36" width="56" height="40" rx="4"/><path d="M40 36v-8h20v8M22 52h56"/></svg></span></span><span class="mo-st" style="top:46%;left:3%;--r:-10deg;--i:7"><span class="ms ms--burst ms--v"><svg viewBox="0 0 100 100"><polygon points="50,2 61,22 83,14 79,37 98,50 79,63 83,86 61,78 50,98 39,78 17,86 21,63 2,50 21,37 17,14 39,22"/></svg><b>man</b></span></span><span class="mo-st" style="top:47%;left:30%;--r:6deg;--i:8"><span class="ms ms--pill ms--v ms--big">einsteht</span></span><span class="mo-st" style="top:46%;left:82%;--r:-12deg;--i:9"><span class="ms ms--tri"><svg viewBox="0 0 100 100"><polygon points="50,8 94,90 6,90"/></svg></span></span><span class="mo-st" style="top:60%;left:6%;--r:-3deg;--i:10"><span class="ms ms--pill ms--o">ohne</span></span><span class="mo-st" style="top:59%;left:36%;--r:-8deg;--i:11"><span class="ms ms--pill ms--l">Agentur-</span></span><span class="mo-st" style="top:61%;left:70%;--r:0deg;--i:12"><span class="ms ms--ic ms--l"><svg viewBox="0 0 100 100"><path d="M40 32v36M60 32v36"/></svg></span></span><span class="mo-st" style="top:72%;left:10%;--r:4deg;--i:13"><span class="ms ms--pill ms--o">sprech</span></span><span class="mo-st" style="top:71%;left:44%;--r:-5deg;--i:14"><span class="ms ms--pill ms--v">und Bauchweh</span></span><span class="mo-st" style="top:84%;left:6%;--r:0deg;--i:15"><span class="ms ms--ic ms--w"><svg viewBox="0 0 100 100"><path d="M30 24 70 52l-18 4 10 20-8 4-10-20-14 12z"/></svg></span></span><span class="mo-st" style="top:85%;left:24%;--r:-10deg;--i:16"><span class="ms ms--burst ms--l ms--s"><svg viewBox="0 0 100 100"><polygon points="50,2 61,22 83,14 79,37 98,50 79,63 83,86 61,78 50,98 39,78 17,86 21,63 2,50 21,37 17,14 39,22"/></svg><b>7</b></span></span><span class="mo-st" style="top:84%;left:80%;--r:6deg;--i:17"><span class="ms ms--ic ms--line"><svg viewBox="0 0 100 100"><rect x="34" y="20" width="32" height="60" rx="5"/><path d="M46 72h8"/></svg></span></span><span class="mo-cover__hint">(Sticker verschieben)</span></div></div>
    </section>'''
B_MAN = '''    <section class="mo-sec mo-manifest" aria-label="Worum es geht">
      <p class="mo-label">(Worum es geht)</p>
      <p class="mo-manifest__t">Die meisten Marken scheitern nicht am Design, sondern an fehlender Klarheit. Dieses Buch hilft euch, sie zu finden – bevor ihr einen Euro in Gestaltung investiert.</p>
    </section>'''
B_FORM = '''<form class="lsignup mo-booksign" data-newsletter novalidate>
        <label class="field"><span>E-Mail</span><input name="email" type="email" autocomplete="email" required></label>
        <button type="submit">Vormerken →</button>
        <p class="form__status" role="status" aria-live="polite"></p>
      </form>'''
BOOK = '\n'.join([B_HERO, B_MAN,
 f'    <section class="mo-lsec">{shead(1, "Sieben Kapitel")}<ol class="mo-chapters">{chap}</ol></section>',
 f'    <section class="mo-lsec" id="vormerken">{shead(2, "Vormerken", "Das eBook erscheint in Kürze. Tragt euch ein, wir schicken es euch als Erstes – kostenlos.")}{B_FORM}</section>',
 cta('Lieber direkt sprechen?', 'Wenn ihr nicht auf das Buch warten wollt: Im Markenworkshop<sup>®</sup> erarbeiten wir die sieben Kapitel gemeinsam – für eure Marke.', 'Workshop anfragen'),
])
page('buch.html', 'mx mx-legacy mx-pages3', BOOK)
