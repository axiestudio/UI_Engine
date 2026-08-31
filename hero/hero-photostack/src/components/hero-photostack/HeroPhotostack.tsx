import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Photo stack hero — a fanned stack of photos that fans out on hover/scroll.
// ═══ EMOTION     A portfolio spread, tactile.
// ═══ SIGNATURE   Rotated, offset image cards that spread as you hover the cluster.

export type HeroPhotostackProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: { label: string; href?: string }[]
  photos?: { src?: string }[]
  className?: string
}

export function HeroPhotostack({ eyebrow = "STACK", title = "Work, in a handful.", subtitle = "A fanned stack — hover to spread the cards.", actions = [{ label: "Open the archive", href: "#" }], photos = [
  { src: "/showcase/gallery-01.webp" }, { src: "/showcase/gallery-02.webp" }, { src: "/showcase/gallery-03.webp" }, { src: "/showcase/gallery-04.webp" }, { src: "/showcase/gallery-05.webp" },
], className }: HeroPhotostackProps) {
  const [spread, setSpread] = React.useState(false)
  return (
    <section className={cn("relative isolate overflow-hidden py-20 sm:py-28", className)}>
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className="justify-center text-muted-foreground">{eyebrow}</MonoLabel>
          <h1 className="mt-4 font-display text-5xl font-black leading-[0.98] tracking-[-0.035em] sm:text-7xl">{title}</h1>
          <p className="mx-auto mt-5 max-w-md text-base font-medium leading-relaxed text-muted-foreground">{subtitle}</p>
          <div className="mt-6 flex justify-center">
            {actions.map((a) => <Button key={a.label} size="lg" onClick={() => { if (a.href) window.location.href = a.href }} className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-widest">{a.label}</Button>)}
          </div>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <div
            className="relative mx-auto mt-12 h-[320px] w-full max-w-md"
            onMouseEnter={() => setSpread(true)} onMouseLeave={() => setSpread(false)}
          >
            {photos.map((p, i) => {
              const mid = (photos.length - 1) / 2
              const offset = i - mid
              const angle = spread ? offset * 16 : offset * 6
              const x = spread ? offset * 110 : offset * 20
              const y = Math.abs(offset) * (spread ? 18 : 6)
              return (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 aspect-[3/4] w-44 overflow-hidden rounded-xl border bg-muted shadow-2xl"
                  animate={{ x: `calc(-50% + ${x}px)`, y: `calc(-50% + ${y}px)`, rotate: angle, zIndex: i }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  {p.src ? <img src={p.src} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
                </motion.div>
              )
            })}
          </div>
        </InView>
      </div>
    </section>
  )
}
