import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { TextEffect } from "@/components/primitives/text-effect"
import { MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Type-scale hero — a word that resizes between a small and huge scale on scroll.
// ═══ EMOTION     Proportion as a moment.
// ═══ SIGNATURE   The headline is set huge; a label word scales into it on scroll/reveal.

export type HeroTypeScaleProps = {
  eyebrow?: string
  small?: string
  big?: string
  subtitle?: string
  actions?: { label: string; href?: string }[]
  tone?: "paper" | "ink"
  className?: string
}

export function HeroTypeScale({ eyebrow = "SCALE", small = "make it", big = "BOLD.", subtitle = "One word scales until it carries the frame — a typographic reveal you can set per brand.", actions = [{ label: "Explore", href: "#" }], tone = "paper", className }: HeroTypeScaleProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate overflow-hidden py-20 sm:py-28", ink && "bg-foreground text-background", className)}>
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className={ink ? "text-background/55" : "text-muted-foreground"}>{eyebrow}</MonoLabel>
        </InView>
        <div className="mt-10">
          <p className={cn("font-display text-4xl font-black leading-none tracking-[-0.03em] sm:text-6xl", ink ? "text-background/45" : "text-muted-foreground/50")}>{small}</p>
          <InView once variants={{ hidden: { opacity: 0, y: 40, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1 } }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}>
            <TextEffect as="h1" per="char" preset="blur" speedSegment={0.06} className="mt-2 font-display text-[22vw] font-black leading-[0.8] tracking-[-0.05em] sm:text-[16vw]">
              {big}
            </TextEffect>
          </InView>
        </div>
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}>
          <div className="mt-10 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <p className={cn("max-w-lg text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>
            <div className="flex gap-3">
              {actions.map((a) => <Button key={a.label} size="lg" onClick={() => { if (a.href) window.location.href = a.href }} className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-widest">{a.label}</Button>)}
            </div>
          </div>
        </InView>
      </div>
    </section>
  )
}
