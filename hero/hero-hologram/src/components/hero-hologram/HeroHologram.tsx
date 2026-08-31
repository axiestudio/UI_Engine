import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { TextShimmer } from "@/components/primitives/text-shimmer"
import { MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Hologram hero — a glimmering title that floats over a scanline grid.
// ═══ EMOTION     Holographic, sci-fi, premium.
// ═══ SIGNATURE   A shimmer title over a faint scanline/graticule field with floating badges.

export type HeroHologramProps = {
  eyebrow?: string
  word?: string
  subtitle?: React.ReactNode
  actions?: { label: string; href?: string }[]
  tone?: "paper" | "ink"
  className?: string
}

export function HeroHologram({ eyebrow = "HOLO", word = "HALO", subtitle = "A glimmering wordmark floating over a faint tech grid.", actions = [{ label: "Board", href: "#" }], tone = "paper", className }: HeroHologramProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate overflow-hidden py-24 sm:py-32", ink && "bg-foreground text-background", className)}>
      {/* graticule field */}
      <div aria-hidden className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: "linear-gradient(to right, hsl(var(--site-accent)/0.5) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--site-accent)/0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, #000 35%, transparent 75%)",
        }} />
      <div className="relative z-10 mx-auto max-w-3xl px-5 text-center sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className={cn(ink ? "text-background/55" : "text-muted-foreground", "justify-center")}>{eyebrow}</MonoLabel>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <h1 className={cn("mt-6 font-display text-7xl font-black tracking-tight sm:text-9xl", "bg-clip-text text-transparent", ink ? "bg-gradient-to-b from-background to-background/40" : "bg-gradient-to-b from-foreground to-foreground/40")}>
            <TextShimmer as="span" duration={2.4} spread={0.65} className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-[hsl(var(--site-accent))] to-foreground">
              {word}
            </TextShimmer>
          </h1>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
          <p className={cn("mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>
          <div className="mt-8 flex justify-center gap-3">{actions.map((a) => <Button key={a.label} size="lg" onClick={() => { if (a.href) window.location.href = a.href }} className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-widest">{a.label}</Button>)}</div>
        </InView>
        <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {["SECTIONS", "MOTION", "TOKENS", "SHIP"].map((t) => <span key={t} className={cn("rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "border-background/25 text-background/60" : "border-border text-muted-foreground")}>{t}</span>)}
          </div>
        </InView>
      </div>
    </section>
  )
}
