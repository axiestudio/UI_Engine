import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Sticky fullscreen hero that the next section rolls over.
// ═══ EMOTION     A cinematic opening that hands off.
// ═══ SIGNATURE   A pinned h-screen hero + a following section that overlaps it.

export type HeroStickyFullscreenProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: { label: string; href?: string; onClick?: () => void }[]
  cover?: { src: string; alt?: string }
  /** Height of the scroll runway for the over/under overlap (vh). */
  runway?: string
  className?: string
}

export function HeroStickyFullscreen({
  eyebrow = "Rollover",
  title = "A hero that hands off.",
  subtitle = "The hero pins full-screen while the next section rolls over it — a handoff, not a hard cut.",
  actions = [{ label: "Continue", href: "#" }],
  cover = { src: "/showcase/hero-poster.webp", alt: "Showcase cover" },
  runway = "220vh",
  className,
}: HeroStickyFullscreenProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, 60])
  const coverOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.4])

  return (
    <section ref={ref} className={cn("relative isolate w-full overflow-hidden bg-background", className)} style={{ height: runway }}>
      {/* pinned hero */}
      <div className="sticky top-0 flex h-full min-h-[80vh] items-center justify-center overflow-hidden">
        <motion.div style={{ scale, opacity: coverOpacity }} className="absolute inset-0">
          <img src={cover.src} alt={cover.alt} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
          <Grain opacity={0.06} />
        </motion.div>
        <motion.div style={{ y: textY }} className="relative z-10 mx-auto max-w-3xl px-5 text-center text-background sm:px-8">
          <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <MonoLabel className="justify-center text-background/60">{eyebrow}</MonoLabel>
          </InView>
          <InView once variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
            <h1 className="mt-5 font-display text-5xl font-black leading-[0.95] tracking-[-0.035em] sm:text-7xl lg:text-8xl">{title}</h1>
          </InView>
          <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}>
            <p className="mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed text-background/75">{subtitle}</p>
          </InView>
          <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.24 }}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {actions.map((a) => (
                <Button key={a.label} size="lg" onClick={a.onClick} asChild={!a.onClick && !!a.href} className="h-12 rounded-full bg-background px-7 font-mono text-[11px] font-bold uppercase tracking-widest text-foreground">
                  {a.onClick || !a.href ? a.label : <a href={a.href}>{a.label}</a>}
                </Button>
              ))}
            </div>
          </InView>
        </motion.div>
      </div>

      {/* the section that rolls over the hero */}
      <div className="relative -mt-[20vh] flex min-h-[120vh] items-start rounded-t-3xl bg-background px-5 pt-16 sm:px-8">
        <p className="mx-auto max-w-md font-display text-3xl font-black tracking-[-0.03em]">
          The next section rolls over the fold — a smooth handoff between blocks.
        </p>
      </div>
    </section>
  )
}
