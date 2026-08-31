import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { TextScramble } from "@/components/primitives/text-scramble"
import { MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Firewatch text — a title that resolves from trailing embers (text-scramble).
// ═══ EMOTION     Slow burn to clarity.
// ═══ SIGNATURE   A big title that scrambles into place then holds, over a warm glow.

export type HeroFirewatchTextProps = {
  eyebrow?: string
  word?: string
  subtitle?: string
  actions?: { label: string; href?: string }[]
  className?: string
}

export function HeroFirewatchText({ eyebrow = "EMBER", word = "BURNTHROUGH", subtitle = "The word assembles from trailing light and stays lit.", actions = [{ label: "See it", href: "#" }], className }: HeroFirewatchTextProps) {
  return (
    <section className={cn("relative isolate overflow-hidden py-24 sm:py-32", className)}>
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[780px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, hsl(var(--site-accent)/0.35), transparent 65%)" }} />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl px-5 text-center sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className="justify-center text-muted-foreground">{eyebrow}</MonoLabel>
        </InView>
        <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <h1 className="mt-6 font-display text-6xl font-black tracking-tight sm:text-8xl">
            <TextScramble trigger className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">{word}</TextScramble>
          </h1>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}>
          <p className="mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed text-muted-foreground">{subtitle}</p>
          <div className="mt-8 flex justify-center">{actions.map((a) => <Button key={a.label} size="lg" onClick={() => { if (a.href) window.location.href = a.href }} className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-widest">{a.label}</Button>)}</div>
        </InView>
      </div>
    </section>
  )
}
