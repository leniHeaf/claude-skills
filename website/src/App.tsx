import { MotionConfig } from 'motion/react'
import { Contact, Footer } from './components/Contact'
import { Hero } from './components/Hero'
import { Nav } from './components/Nav'
import { Faq, Marquee, Pricing, Process, Projects, Services, Stats, Testimonial } from './components/Sections'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Services />
        <Projects />
        <Stats />
        <Process />
        <Testimonial />
        <Pricing />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  )
}
