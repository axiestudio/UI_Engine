import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Cursor } from "@/components/primitives/cursor"
import { MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Cursor-glow hero — a light that follows the cursor across the canvas.
// ═══ EMOTION     Ambience that responds to you.
// ═══ SIGNATURE   A radial glow that trails the pointer over the whole hero.

export type HeroCursorGlowProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  cta?: { label: string; href?: string }
  tone?: "paper" | "ink"
  className?: string
}

export function HeroCursorGlow({
  eyebrow = "FOLLOW",
  title = "A light that follows you.",
  subtitle = "Move your cursor — the glow trails it, so the hero feels alive.",
  cta = { label: "Explore", href: "#" },
  tone = "paper",
  className,
}: HeroCursorGlowProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate overflow-hidden py-20 sm:py-28", ink && "bg-foreground text-background", className)}>
      {/* glow layer following the cursor */}
      <div className="pointer-events-none absolute inset-0">
        <Cursor
          springConfig={{ bounce: 0.15, duration: 0.9 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative h-[420px] w-[420px]">
            <span className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, hsl(var(--site-accent)/0.28), transparent 60%)` }} />
            <span className="absolute inset-16 rounded-full" style={{ background: `radial-gradient(circle, hsl(var(--site-accent-2)/0.22), transparent 62%)` }} />
          </div>
        </Cursor>
      </div>
      <div className={cn("pointer-events-none absolute inset-0", ink ? "bg-foreground/40" : "bg-background/30")} />

      <div className="relative z-10 mx-auto max-w-3xl px-5 text-center sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className={cn(ink ? "text-background/55" : "text-muted-foreground", "justify-center")}>{eyebrow}</MonoLabel>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <h1 className="mt-5 font-display text-5xl font-black leading-[0.96] tracking-[-0.035em] sm:text-7xl">{title}</h1>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}>
          <p className={cn("mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.24 }}>
          <div className="mt-8">
            <Button size="lg" onClick={() => { if (cta.href) window.location.href = cta.href }} className="h-12 rounded-full px-7 font-mono text-[11px] font-bold uppercase tracking-widest">
              {cta.label}
            </Button>
          </div>
        </InView>
      </div>
    </section>
  )
}
