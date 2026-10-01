import { ArrowRight, ArrowUpRight, Star } from '@phosphor-icons/react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import type { PointerEvent } from 'react'
import { easeOut, reveal, stagger } from '../lib/motion'

const headline = ['Websites,', 'die', 'nicht', 'nur', 'gut', 'aussehen.']

function Mockup() {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 18 })
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 18 })

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.35, ease: easeOut }}
      className="relative [perspective:1200px]"
      onPointerMove={onMove}
      onPointerLeave={() => {
        mx.set(0)
        my.set(0)
      }}
    >
      <motion.div style={{ rotateX, rotateY }} className="relative rounded-2xl border border-zinc-200 bg-white p-2 shadow-[0_30px_80px_-20px_rgba(24,24,27,0.25)]">
        <div className="flex items-center gap-1.5 px-2 pb-2">
          <span className="size-2.5 rounded-full bg-zinc-200" />
          <span className="size-2.5 rounded-full bg-zinc-200" />
          <span className="size-2.5 rounded-full bg-zinc-200" />
          <span className="ml-3 h-5 flex-1 rounded-md bg-zinc-100 font-mono text-[10px] leading-5 text-zinc-400 px-2">ihre-marke.de</span>
        </div>
        <div className="overflow-hidden rounded-xl bg-zinc-900 p-6 text-white">
          <div className="mb-8 flex items-center justify-between">
            <div className="h-2 w-16 rounded-full bg-white/30" />
            <div className="flex gap-2">
              <div className="h-2 w-8 rounded-full bg-white/15" />
              <div className="h-2 w-8 rounded-full bg-white/15" />
              <div className="h-2 w-8 rounded-full bg-white/15" />
            </div>
          </div>
          <div className="space-y-2.5">
            <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1, delay: 0.9, ease: easeOut }} className="h-5 rounded-md bg-white" />
            <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 1, delay: 1.0, ease: easeOut }} className="h-5 rounded-md bg-white" />
            <motion.div initial={{ width: 0 }} animate={{ width: '70%' }} transition={{ duration: 1, delay: 1.1, ease: easeOut }} className="h-2 rounded-full bg-white/25" />
          </div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.3, ease: easeOut }} className="mt-6 inline-flex h-8 w-28 rounded-lg bg-accent" />
          <div className="mt-8 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.4 + i * 0.08, ease: easeOut }} className="aspect-[4/3] rounded-lg bg-white/[0.07] ring-1 ring-white/10" />
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.6, ease: easeOut }}
        className="absolute -bottom-6 -left-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl sm:-left-10"
      >
        <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Conversion-Rate</p>
        <p className="mt-1 flex items-baseline gap-2 text-2xl font-semibold tracking-tight">
          4,8 % <span className="text-sm font-medium text-emerald-600">+212 %</span>
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.75, ease: easeOut }}
        className="absolute -right-3 -top-5 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-xl sm:-right-8"
      >
        <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Lighthouse</p>
        <p className="mt-0.5 text-2xl font-semibold tracking-tight text-emerald-600">100</p>
      </motion.div>
    </motion.div>
  )
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden px-4 pb-24 pt-32 md:pt-40">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_70%_20%,rgba(232,96,44,0.10),transparent_70%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)] opacity-50" />

      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
        <motion.div variants={stagger(0.06)} initial="hidden" animate="show">
          <motion.a
            variants={reveal}
            href="#projekte"
            className="group inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1 pl-1 pr-3 text-sm text-zinc-600 shadow-sm"
          >
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">Neu</span>
            3 Plätze für Q1 2027 frei
            <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </motion.a>

          <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tighter text-balance md:text-7xl">
            {headline.map((w, i) => (
              <motion.span key={i} variants={reveal} className="mr-[0.22em] inline-block">
                {w}
              </motion.span>
            ))}
            <motion.span variants={reveal} className="inline-block text-accent">
              Sondern verkaufen.
            </motion.span>
          </h1>

          <motion.p variants={reveal} className="mt-6 max-w-[52ch] text-lg leading-relaxed text-zinc-600">
            Werkraum ist das Digitalstudio für Marken, die wachsen wollen. Wir verbinden Strategie, Design und Entwicklung zu Websites, die in Sekunden laden, auf jedem Gerät glänzen und messbar Anfragen bringen.
          </motion.p>

          <motion.div variants={reveal} className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#kontakt" className="pressable group inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 font-medium text-white shadow-lg shadow-zinc-900/10 hover:bg-zinc-800">
              Projekt starten
              <ArrowUpRight size={18} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <a href="#projekte" className="pressable rounded-xl border border-zinc-200 bg-white px-5 py-3 font-medium text-zinc-800 hover:bg-zinc-50">
              Arbeiten ansehen
            </a>
          </motion.div>

          <motion.div variants={reveal} className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-2">
              {['bg-zinc-800', 'bg-accent', 'bg-zinc-500', 'bg-zinc-300'].map((c, i) => (
                <span key={i} className={`grid size-9 place-items-center rounded-full border-2 border-zinc-50 text-xs font-semibold text-white ${c}`}>
                  {['LK', 'MS', 'JB', 'AW'][i]}
                </span>
              ))}
            </div>
            <div className="text-sm">
              <div className="flex text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} weight="fill" size={14} />
                ))}
              </div>
              <p className="text-zinc-600">
                <span className="font-semibold text-zinc-900">4,9/5</span> aus 120+ Projekten
              </p>
            </div>
          </motion.div>
        </motion.div>

        <Mockup />
      </div>
    </section>
  )
}
