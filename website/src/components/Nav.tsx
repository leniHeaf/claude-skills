import { List, X } from '@phosphor-icons/react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'
import { easeOut } from '../lib/motion'

const links = [
  { href: '#leistungen', label: 'Leistungen' },
  { href: '#projekte', label: 'Projekte' },
  { href: '#prozess', label: 'Prozess' },
  { href: '#preise', label: 'Preise' },
  { href: '#faq', label: 'FAQ' },
]

export function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid size-8 place-items-center rounded-lg bg-zinc-900">
        <svg viewBox="0 0 32 32" className="size-5" aria-hidden>
          <path d="M8 10l3.2 12L16 12l4.8 10L24 10" fill="none" stroke="#e8602c" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      Werkraum
    </a>
  )
}

export function Nav() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24))

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl border px-4 py-3 transition-[background-color,border-color,box-shadow] duration-300 ${
          scrolled ? 'border-zinc-200/80 bg-white/80 shadow-sm backdrop-blur-xl' : 'border-transparent bg-transparent'
        }`}
      >
        <Logo />
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a href="#kontakt" className="pressable hidden rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 md:inline-block">
          Erstgespräch buchen
        </a>
        <button className="pressable grid size-10 place-items-center rounded-lg md:hidden" aria-label="Menü öffnen" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: easeOut }}
            style={{ transformOrigin: 'top right' }}
            className="mx-auto mt-2 max-w-6xl rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg md:hidden"
          >
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-4 py-3 text-zinc-700 hover:bg-zinc-50">
                {l.label}
              </a>
            ))}
            <a href="#kontakt" onClick={() => setOpen(false)} className="mt-1 block rounded-xl bg-zinc-900 px-4 py-3 text-center font-medium text-white">
              Erstgespräch buchen
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
