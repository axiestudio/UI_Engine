import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Fullscreen hero with a muted looping video behind the statement.
// ═══ EMOTION     Cinematic.
// ═══ SIGNATURE   A full-bleed <video> layer + gradient scrim + centered type.

export type HeroVideoProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: { label: string; href?: string; onClick?: () => void }[]
  src?: string
  poster?: string
  className?: string
}

export function HeroVideo({
  eyebrow = "SHOWREEL",
  title = "Work that moves.",
  subtitle = "A short, looping film behind the statement — no controls, no clutter. Poster-first, muted and playsInline for a calm, cinematic backdrop.",
  actions = [{ label: "View the collection", href: "#" }],
  src = "/showcase/video/background-loop.mp4",
  poster = "/showcase/video/background-loop-poster.webp",
  className,
}: HeroVideoProps) {
  return (
    <section className={cn("relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-foreground text-background", className)}>
      <div className="absolute inset-0 -z-10 bg-foreground">
        {/* poster underneath — never a blank frame */}
        {poster && (
          <img
            src={poster}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
        )}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={poster}
          className="absolute inset-0 h-full w-full object-cover"
          src={src}
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
        <div className="absolute inset-0 opacity-[0.28]" style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 55%, hsl(0 0% 0% / 0.52) 100%)" }} aria-hidden />
        <Grain opacity={0.07} className="z-[1]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-5 py-28 text-center sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <span className="inline-flex items-center rounded-full border border-background/15 bg-foreground/30 px-3 py-1 font-mono text-[10px] font-bold tracking-[0.2em] text-background/70">
            {eyebrow}
          </span>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <h1 className="mt-5 text-balance font-display text-5xl font-black leading-[0.95] tracking-[-0.035em] text-white sm:text-7xl lg:text-8xl">{title}</h1>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base font-medium leading-relaxed text-white/75 sm:text-lg">{subtitle}</p>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {actions.map((a) => (
              <Button key={a.label} size="lg" onClick={a.onClick} asChild={!a.onClick && !!a.href} className="h-11 rounded-full bg-background px-7 font-display text-sm font-extrabold tracking-tight text-foreground shadow-sm hover:bg-background/90">
                {a.onClick || !a.href ? a.label : <a href={a.href}>{a.label}</a>}
              </Button>
            ))}
          </div>
        </InView>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 font-mono text-[10px] font-bold tracking-[0.3em] text-white/50">SCROLL</div>
      <span className="pointer-events-none absolute bottom-6 z-0 flex h-10 w-6 items-start justify-center rounded-full border border-white/30 p-1.5">
        <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="block h-1.5 w-1.5 rounded-full bg-white/70" />
      </span>
    </section>
  )
}
