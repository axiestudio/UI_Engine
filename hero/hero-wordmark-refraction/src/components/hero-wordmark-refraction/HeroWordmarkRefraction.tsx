import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Wordmark refraction — a brand word set in layered, offset tint layers.
// ═══ EMOTION     Depth + brand.
// ═══ SIGNATURE   A wordmark with 3 stacked chromatic copies that shift at different rates.

export type HeroWordmarkRefractionProps = {
  eyebrow?: string
  word?: string
  tagline?: string
  actions?: { label: string; href?: string }[]
  tone?: "paper" | "ink"
  className?: string
}

export function HeroWordmarkRefraction({ eyebrow = "REFRACT", word = "NORTHING", tagline = "A studio that bends material, type and light into intent.", actions = [{ label: "See the work", href: "#" }], tone = "paper", className }: HeroWordmarkRefractionProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate flex min-h-[80vh] items-center overflow-hidden px-5 py-20 sm:px-8", ink && "bg-foreground text-background", className)}>
      <div className="mx-auto w-full max-w-5xl">
        <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className={ink ? "text-background/55" : "text-muted-foreground"}>{eyebrow}</MonoLabel>
        </InView>
        <div className="relative mt-6">
          {/* chromatic layers */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 font-display text-[18vw] font-black leading-[0.85] tracking-[-0.05em] opacity-40 sm:text-[13vw]"
            style={{ color: ink ? "hsl(var(--primary)/0.4)" : "hsl(var(--primary)/0.4)" }}
            initial={{ x: 0 }} animate={{ x: [0, -14, 0], y: [0, 6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
          >{word}</motion.span>
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 font-display text-[18vw] font-black leading-[0.85] tracking-[-0.05em] opacity-40 sm:text-[13vw]"
            style={{ color: ink ? "hsl(var(--accent)/0.4)" : "hsl(var(--accent)/0.4)" }}
            initial={{ x: 0 }} animate={{ x: [0, 12, 0], y: [0, -6, 0] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
          >{word}</motion.span>
          <InView once variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
            <motion.h1
              className="relative font-display text-[18vw] font-black leading-[0.85] tracking-[-0.05em] sm:text-[13vw]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
              {word}
            </motion.h1>
          </InView>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
            <p className={cn("max-w-lg text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{tagline}</p>
          </InView>
          <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}>
            <div className="flex gap-3">
              {actions.map((a) => <Button key={a.label} size="lg" onClick={() => { if (a.href) window.location.href = a.href }} className="h-12 rounded-full px-7 font-mono text-[11px] font-bold uppercase tracking-widest">{a.label}</Button>)}
            </div>
          </InView>
        </div>
      </div>
    </section>
  )
}
