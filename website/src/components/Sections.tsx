import {
  ArrowUpRight,
  ChartLineUp,
  Check,
  Lightning,
  MagnifyingGlass,
  PaintBrushBroad,
  Plus,
  ShieldCheck,
  Translate,
} from '@phosphor-icons/react'
import { AnimatePresence, animate, motion, useInView, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { easeOut, inView, reveal, stagger } from '../lib/motion'

function Eyebrow({ children }: { children: string }) {
  return (
    <motion.p variants={reveal} className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
      {children}
    </motion.p>
  )
}

/* ---------- Logo-Laufband ---------- */
const brands = ['Nordwerk', 'Lumen&Co', 'Haus Falk', 'Vektor', 'Kiesel', 'Brandt Bau', 'Solvia', 'Mühlberg']

export function Marquee() {
  return (
    <section aria-label="Kunden" className="border-y border-zinc-200 bg-white py-8">
      <p className="mb-6 text-center text-sm text-zinc-500">Vertrauen von Marken aus Handel, Handwerk und Tech</p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <motion.div
          className="flex w-max gap-16 pr-16"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
        >
          {[...brands, ...brands].map((b, i) => (
            <span key={i} className="whitespace-nowrap text-xl font-semibold tracking-tight text-zinc-400">
              {b}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- Leistungen (Bento) ---------- */
export function Services() {
  return (
    <section id="leistungen" className="scroll-mt-24 px-4 py-28">
      <motion.div {...inView} variants={stagger()} className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Eyebrow>Leistungen</Eyebrow>
          <motion.h2 variants={reveal} className="mt-3 text-4xl font-semibold tracking-tighter md:text-5xl">
            Alles, was eine Website braucht. Nichts, was sie bremst.
          </motion.h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-6">
          <motion.article variants={reveal} className="group relative overflow-hidden rounded-3xl bg-zinc-900 p-8 text-white md:col-span-4 md:row-span-2">
            <PaintBrushBroad size={28} className="text-accent" />
            <h3 className="mt-6 text-2xl font-semibold tracking-tight">Design mit Haltung</h3>
            <p className="mt-3 max-w-md leading-relaxed text-zinc-400">
              Kein Template, kein Baukasten. Wir entwickeln ein visuelles System, das Ihre Marke unverwechselbar macht – von der Typografie bis zur Mikroanimation.
            </p>
            <div className="mt-10 grid grid-cols-4 gap-2">
              {['#18181b', '#3f3f46', '#e8602c', '#fafafa'].map((c, i) => (
                <motion.div
                  key={c}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.07, ease: easeOut }}
                  className="aspect-square rounded-2xl ring-1 ring-white/10 transition-transform duration-300 group-hover:-translate-y-1"
                  style={{ background: c, transitionDelay: `${i * 40}ms` }}
                />
              ))}
            </div>
            <p className="mt-6 font-mono text-xs text-zinc-500">Aa Geist · 48/56 · −2 % Laufweite</p>
          </motion.article>

          <motion.article variants={reveal} className="rounded-3xl border border-zinc-200 bg-white p-8 md:col-span-2">
            <Lightning size={28} className="text-accent" />
            <h3 className="mt-6 text-xl font-semibold tracking-tight">Ladezeit unter 1 s</h3>
            <p className="mt-2 text-zinc-600">Moderne Technik, optimierte Bilder, keine Plugin-Altlasten.</p>
          </motion.article>

          <motion.article variants={reveal} className="rounded-3xl border border-zinc-200 bg-white p-8 md:col-span-2">
            <MagnifyingGlass size={28} className="text-accent" />
            <h3 className="mt-6 text-xl font-semibold tracking-tight">SEO ab Tag eins</h3>
            <p className="mt-2 text-zinc-600">Saubere Struktur, Meta-Daten und Schema-Markup inklusive.</p>
          </motion.article>

          <motion.article variants={reveal} className="rounded-3xl border border-zinc-200 bg-white p-8 md:col-span-2">
            <ChartLineUp size={28} className="text-accent" />
            <h3 className="mt-6 text-xl font-semibold tracking-tight">Conversion-Fokus</h3>
            <p className="mt-2 text-zinc-600">Jede Sektion hat ein Ziel. Wir messen, testen und verbessern.</p>
          </motion.article>

          <motion.article variants={reveal} className="rounded-3xl border border-zinc-200 bg-white p-8 md:col-span-2">
            <ShieldCheck size={28} className="text-accent" />
            <h3 className="mt-6 text-xl font-semibold tracking-tight">DSGVO-konform</h3>
            <p className="mt-2 text-zinc-600">Hosting in Deutschland, Cookie-Consent und Impressum sauber gelöst.</p>
          </motion.article>

          <motion.article variants={reveal} className="rounded-3xl border border-zinc-200 bg-accent-soft p-8 md:col-span-2">
            <Translate size={28} className="text-accent" />
            <h3 className="mt-6 text-xl font-semibold tracking-tight">Mehrsprachig</h3>
            <p className="mt-2 text-zinc-700">Deutsch, Englisch und mehr – mit sauberer hreflang-Struktur.</p>
          </motion.article>
        </div>
      </motion.div>
    </section>
  )
}

/* ---------- Projekte ---------- */
const projects = [
  { name: 'Haus Falk', tag: 'Immobilien · Relaunch', result: '+180 % Anfragen', tone: 'from-zinc-800 to-zinc-950' },
  { name: 'Kiesel Coffee', tag: 'E-Commerce · Shopify', result: '+64 % Umsatz', tone: 'from-[#e8602c] to-[#b9431b]' },
  { name: 'Vektor Labs', tag: 'SaaS · Landingpage', result: '3× Demo-Buchungen', tone: 'from-zinc-500 to-zinc-700' },
  { name: 'Brandt Bau', tag: 'Handwerk · Recruiting', result: '42 Bewerbungen / Monat', tone: 'from-zinc-300 to-zinc-500' },
]

export function Projects() {
  return (
    <section id="projekte" className="scroll-mt-24 bg-white px-4 py-28">
      <motion.div {...inView} variants={stagger()} className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <Eyebrow>Ausgewählte Arbeiten</Eyebrow>
            <motion.h2 variants={reveal} className="mt-3 text-4xl font-semibold tracking-tighter md:text-5xl">
              Ergebnisse, nicht nur Screenshots.
            </motion.h2>
          </div>
          <motion.a variants={reveal} href="#kontakt" className="group inline-flex items-center gap-1 font-medium text-zinc-900">
            Ähnliches Projekt anfragen
            <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </motion.a>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {projects.map((p, i) => (
            <motion.a
              key={p.name}
              href="#kontakt"
              variants={reveal}
              className={`group relative block overflow-hidden rounded-3xl ${i % 2 === 1 ? 'md:translate-y-16' : ''}`}
            >
              <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${p.tone}`}>
                <div className="absolute inset-x-8 bottom-0 top-12 rounded-t-2xl bg-white/95 p-5 shadow-2xl transition-transform duration-500 ease-[var(--ease-out-strong)] group-hover:-translate-y-3">
                  <div className="h-2 w-14 rounded-full bg-zinc-300" />
                  <div className="mt-6 h-4 w-3/4 rounded bg-zinc-900" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-zinc-900" />
                  <div className="mt-4 h-2 w-2/3 rounded-full bg-zinc-200" />
                  <div className="mt-5 h-7 w-24 rounded-md bg-accent" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 border border-t-0 border-zinc-200 bg-white p-5 rounded-b-3xl">
                <div>
                  <h3 className="font-semibold tracking-tight">{p.name}</h3>
                  <p className="text-sm text-zinc-500">{p.tag}</p>
                </div>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-800">{p.result}</span>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

/* ---------- Zahlen ---------- */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const visible = useInView(ref, { once: true })
  useEffect(() => {
    if (!visible || !ref.current) return
    const el = ref.current
    const controls = animate(0, to, {
      duration: 1.6,
      ease: easeOut,
      onUpdate: (v) => (el.textContent = Math.round(v).toLocaleString('de-DE') + suffix),
    })
    return () => controls.stop()
  }, [visible, to, suffix])
  return (
    <span ref={ref} className="tabular-nums">
      0{suffix}
    </span>
  )
}

export function Stats() {
  const stats = [
    { to: 120, suffix: '+', label: 'Websites live' },
    { to: 98, suffix: ' %', label: 'Weiterempfehlung' },
    { to: 6, suffix: ' Wo.', label: 'Ø bis zum Launch' },
    { to: 212, suffix: ' %', label: 'Ø mehr Anfragen' },
  ]
  return (
    <section className="px-4 py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-200 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-zinc-50 p-8">
            <p className="text-4xl font-semibold tracking-tighter md:text-5xl">
              <Counter to={s.to} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-sm text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------- Prozess ---------- */
const steps = [
  { t: 'Kennenlernen', d: '30 Minuten, kostenlos. Wir verstehen Ziele, Zielgruppe und Budget – und sagen ehrlich, ob wir passen.', w: 'Woche 1' },
  { t: 'Strategie & Inhalte', d: 'Positionierung, Seitenstruktur und Texte, die Ihre Kunden abholen. Die Basis für alles Weitere.', w: 'Woche 1–2' },
  { t: 'Design', d: 'Ein eigenes Designsystem mit klickbarem Prototyp. Zwei Feedbackrunden sind inklusive.', w: 'Woche 2–4' },
  { t: 'Entwicklung & Launch', d: 'Pixelgenaue Umsetzung, Tests auf allen Geräten, Tracking-Setup und ein sauberer Go-live.', w: 'Woche 4–6' },
]

export function Process() {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section id="prozess" className="scroll-mt-24 bg-zinc-900 px-4 py-28 text-white">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1fr_1.3fr]">
        <motion.div {...inView} variants={stagger()} className="lg:sticky lg:top-32 lg:self-start">
          <Eyebrow>Prozess</Eyebrow>
          <motion.h2 variants={reveal} className="mt-3 text-4xl font-semibold tracking-tighter md:text-5xl">
            In sechs Wochen live. Ohne Chaos.
          </motion.h2>
          <motion.p variants={reveal} className="mt-5 max-w-md leading-relaxed text-zinc-400">
            Ein fester Ansprechpartner, ein klarer Zeitplan und wöchentliche Updates. Sie wissen jederzeit, wo Ihr Projekt steht.
          </motion.p>
        </motion.div>

        <ol ref={ref} className="relative space-y-12 pl-10">
          <div aria-hidden className="absolute bottom-2 left-[7px] top-2 w-px bg-white/10" />
          <motion.div aria-hidden style={{ scaleY }} className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-accent" />
          {steps.map((s, i) => (
            <motion.li
              key={s.t}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: easeOut }}
              className="relative"
            >
              <span className="absolute -left-10 top-1.5 grid size-[15px] place-items-center rounded-full border border-accent bg-zinc-900">
                <span className="size-1.5 rounded-full bg-accent" />
              </span>
              <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                0{i + 1} · {s.w}
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">{s.t}</h3>
              <p className="mt-2 max-w-lg leading-relaxed text-zinc-400">{s.d}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------- Preise ---------- */
const plans = [
  {
    name: 'Start',
    price: '4.900',
    desc: 'Für Selbstständige und kleine Teams, die professionell auftreten wollen.',
    features: ['Onepager mit bis zu 6 Sektionen', 'Individuelles Design', 'Texte inklusive', 'SEO-Grundsetup', 'Launch in 3 Wochen'],
  },
  {
    name: 'Wachstum',
    price: '9.900',
    desc: 'Für Unternehmen, deren Website aktiv Kunden gewinnen soll.',
    features: ['Bis zu 10 Unterseiten', 'Designsystem & Animationen', 'Conversion-Strategie & Texte', 'CMS zum Selbstpflegen', 'Tracking & A/B-Tests', '3 Monate Optimierung'],
    featured: true,
  },
  {
    name: 'Individuell',
    price: 'ab 15.000',
    desc: 'Für Shops, Plattformen und mehrsprachige Auftritte.',
    features: ['Unbegrenzte Seiten', 'E-Commerce & Integrationen', 'Mehrsprachigkeit', 'Priorisierter Support', 'Laufende Betreuung'],
  },
]

export function Pricing() {
  return (
    <section id="preise" className="scroll-mt-24 px-4 py-28">
      <motion.div {...inView} variants={stagger()} className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Preise</Eyebrow>
          <motion.h2 variants={reveal} className="mt-3 text-4xl font-semibold tracking-tighter md:text-5xl">
            Transparente Pakete. Keine Überraschungen.
          </motion.h2>
          <motion.p variants={reveal} className="mt-4 text-zinc-600">
            Festpreise netto, zahlbar in zwei Raten. Hosting ab 29 € im Monat.
          </motion.p>
        </div>

        <div className="mt-14 grid items-start gap-4 lg:grid-cols-3">
          {plans.map((p) => (
            <motion.div
              key={p.name}
              variants={reveal}
              className={`relative rounded-3xl p-8 ${p.featured ? 'bg-zinc-900 text-white shadow-2xl shadow-zinc-900/20 lg:-mt-4 lg:pb-12' : 'border border-zinc-200 bg-white'}`}
            >
              {p.featured && <span className="absolute right-6 top-6 rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">Beliebteste Wahl</span>}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className={`mt-2 text-sm ${p.featured ? 'text-zinc-400' : 'text-zinc-600'}`}>{p.desc}</p>
              <p className="mt-6 text-4xl font-semibold tracking-tighter">
                {p.price} <span className={`text-base font-normal ${p.featured ? 'text-zinc-400' : 'text-zinc-500'}`}>€</span>
              </p>
              <ul className="mt-8 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm">
                    <Check size={18} weight="bold" className="mt-0.5 shrink-0 text-accent" />
                    <span className={p.featured ? 'text-zinc-200' : 'text-zinc-700'}>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#kontakt"
                className={`pressable mt-8 block rounded-xl px-5 py-3 text-center font-medium ${p.featured ? 'bg-accent text-white hover:brightness-110' : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'}`}
              >
                Paket anfragen
              </a>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

/* ---------- Stimmen ---------- */
export function Testimonial() {
  return (
    <section className="px-4 py-20">
      <motion.figure {...inView} variants={stagger(0.1)} className="mx-auto max-w-4xl text-center">
        <motion.blockquote variants={reveal} className="text-3xl font-medium leading-snug tracking-tight text-balance md:text-4xl">
          „Nach dem Relaunch kamen in vier Wochen mehr Anfragen als im ganzen Jahr davor. Werkraum hat nicht einfach eine Website gebaut – sondern unseren besten Vertriebler.“
        </motion.blockquote>
        <motion.figcaption variants={reveal} className="mt-8 flex items-center justify-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-zinc-900 text-sm font-semibold text-white">LF</span>
          <span className="text-left text-sm">
            <span className="block font-semibold">Lena Falk</span>
            <span className="text-zinc-500">Geschäftsführerin, Haus Falk Immobilien</span>
          </span>
        </motion.figcaption>
      </motion.figure>
    </section>
  )
}

/* ---------- FAQ ---------- */
const faqs = [
  { q: 'Was kostet eine Website bei Werkraum?', a: 'Unsere Pakete starten bei 4.900 € netto für einen professionellen Onepager. Die meisten Kunden entscheiden sich für das Wachstum-Paket für 9.900 €. Im Erstgespräch erhalten Sie ein verbindliches Festpreisangebot.' },
  { q: 'Wie lange dauert ein Projekt?', a: 'Ein Onepager ist in rund drei Wochen live, umfangreichere Websites in sechs bis acht Wochen. Voraussetzung ist, dass Feedback zügig kommt – wir planen das gemeinsam.' },
  { q: 'Kann ich die Website später selbst bearbeiten?', a: 'Ja. Ab dem Wachstum-Paket erhalten Sie ein CMS, mit dem Sie Texte, Bilder und Blogartikel ohne Programmierkenntnisse pflegen. Eine Einweisung ist inklusive.' },
  { q: 'Übernehmt ihr auch Texte und Fotos?', a: 'Texte sind in allen Paketen enthalten. Für Fotos und Videos arbeiten wir mit erfahrenen Fotografinnen und Fotografen aus unserem Netzwerk zusammen.' },
  { q: 'Was passiert nach dem Launch?', a: 'Wir bleiben an Bord: Hosting, Updates, Backups und Monitoring übernehmen wir auf Wunsch. Im Wachstum-Paket optimieren wir drei Monate lang datenbasiert weiter.' },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-zinc-200">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-6 py-6 text-left">
        <span className="text-lg font-medium tracking-tight">{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2, ease: easeOut }} className="grid size-8 shrink-0 place-items-center rounded-full bg-zinc-100">
          <Plus size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: easeOut }}
            className="overflow-hidden"
          >
            <p className="max-w-[65ch] pb-6 leading-relaxed text-zinc-600">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 bg-white px-4 py-28">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.6fr]">
        <motion.div {...inView} variants={stagger()}>
          <Eyebrow>FAQ</Eyebrow>
          <motion.h2 variants={reveal} className="mt-3 text-4xl font-semibold tracking-tighter md:text-5xl">
            Gute Fragen.
          </motion.h2>
          <motion.p variants={reveal} className="mt-4 text-zinc-600">
            Ihre Frage ist nicht dabei?{' '}
            <a href="#kontakt" className="font-medium text-zinc-900 underline decoration-accent decoration-2 underline-offset-4">
              Schreiben Sie uns.
            </a>
          </motion.p>
        </motion.div>
        <div className="border-t border-zinc-200">
          {faqs.map((f) => (
            <FaqItem key={f.q} {...f} />
          ))}
        </div>
      </div>
    </section>
  )
}
