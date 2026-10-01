import type { Transition, Variants } from 'motion/react'

export const easeOut = [0.23, 1, 0.32, 1] as const

export const reveal: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: easeOut },
  },
}

export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
})

export const spring: Transition = { type: 'spring', duration: 0.5, bounce: 0.15 }

export const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-80px' } } as const
