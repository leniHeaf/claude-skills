import { ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { easeOut, inView, reveal, stagger } from '../lib/motion'
import { Logo } from './Nav'

const year = new Date().getFullYear()
const budgets = ['< 5.000 €', '5–10.000 €', '10–20.000 €', '20.000 € +']

export function Contact() {
  const [budget, setBudget] = useState(budgets[1])
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="kontakt" className="scroll-mt-24 px-4 py-28">
      <motion.div {...inView} variants={stagger()} className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-zinc-900 text-white lg:grid-cols-2">
        <div className="relative p-10 md:p-14">
          <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-accent/25 blur-3xl" />
          <motion.p variants={reveal} className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            Kontakt
          </motion.p>
          <motion.h2 variants={reveal} className="mt-3 text-4xl font-semibold tracking-tighter md:text-5xl">
            Bereit für eine Website, die arbeitet?
          </motion.h2>
          <motion.p variants={reveal} className="mt-5 max-w-md leading-relaxed text-zinc-400">
            Erzählen Sie uns kurz von Ihrem Vorhaben. Sie erhalten innerhalb von 24 Stunden eine Antwort – mit konkreten Ideen statt Floskeln.
          </motion.p>
          <motion.ul variants={reveal} className="mt-10 space-y-3 text-sm text-zinc-300">
            <li>✓ Kostenloses Erstgespräch (30 Min.)</li>
            <li>✓ Festpreisangebot innerhalb von 48 Stunden</li>
            <li>✓ Kein Vertrieb, keine Verpflichtung</li>
          </motion.ul>
        </div>

        <motion.div variants={reveal} className="bg-white p-10 text-zinc-900 md:p-14">
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: easeOut }}
                className="flex h-full flex-col items-start justify-center"
              >
                <CheckCircle size={44} weight="fill" className="text-accent" />
                <h3 className="mt-4 text-2xl font-semibold tracking-tight">Danke! Wir melden uns.</h3>
                <p className="mt-2 text-zinc-600">Ihre Anfrage ist eingegangen. Rechnen Sie innerhalb von 24 Stunden mit einer Antwort.</p>
              </motion.div>
            ) : (
              <motion.form key="form" exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }} onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Name" name="name" autoComplete="name" />
                  <Field label="E-Mail" name="email" type="email" autoComplete="email" />
                </div>
                <Field label="Unternehmen" name="company" autoComplete="organization" required={false} />
                <fieldset>
                  <legend className="mb-2 text-sm font-medium">Budget</legend>
                  <div className="flex flex-wrap gap-2">
                    {budgets.map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setBudget(b)}
                        aria-pressed={budget === b}
                        className={`pressable rounded-full border px-4 py-2 text-sm transition-colors ${budget === b ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 hover:border-zinc-400'}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Worum geht es?</span>
                  <textarea name="message" rows={4} required className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition-[border-color,box-shadow] focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5" />
                </label>
                <button type="submit" className="pressable group flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 font-medium text-white hover:brightness-110">
                  Anfrage senden
                  <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
                <p className="text-xs text-zinc-500">Mit dem Absenden stimmen Sie unserer Datenschutzerklärung zu.</p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  )
}

function Field({ label, required = true, ...props }: { label: string; name: string; type?: string; autoComplete?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input
        {...props}
        required={required}
        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition-[border-color,box-shadow] focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5"
      />
    </label>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-zinc-500">Digitalstudio für Marken, die wachsen wollen.</p>
        </div>
        <nav className="flex flex-wrap gap-6 text-sm text-zinc-600">
          <a href="#leistungen" className="hover:text-zinc-900">Leistungen</a>
          <a href="#projekte" className="hover:text-zinc-900">Projekte</a>
          <a href="#preise" className="hover:text-zinc-900">Preise</a>
          <a href="#" className="hover:text-zinc-900">Impressum</a>
          <a href="#" className="hover:text-zinc-900">Datenschutz</a>
        </nav>
        <p className="text-sm text-zinc-500">© {year} Werkraum</p>
      </div>
    </footer>
  )
}
