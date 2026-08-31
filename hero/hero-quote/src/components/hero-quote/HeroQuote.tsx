import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Quote hero — a big pull-quote as the opening statement.
// ═══ EMOTION     Opinionated, editorial.
// ═══ SIGNATURE   A giant quote mark, oversized quote, attribution + one CTA.

export type HeroQuoteProps = {
  quote?: React.ReactNode
  attribution?: string
  role?: string
  actions?: { label: string; href?: string; onClick?: () => void }[]
  tone?: "paper" | "ink"
  className?: string
}

export function HeroQuote({
  quote = "The best sites read like they were made by one person who cared deeply.",
  attribution = "Hacker Herald",
  role = "Design weekly",
  actions = [{ label: "Read the essay", href: "#" }],
  tone = "paper",
  className,
}: HeroQuoteProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate overflow-hidden py-20 sm:py-24", ink && "bg-foreground text-background", className)}>
      <Grain opacity={ink ? 0.07 : 0.04} />
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <span aria-hidden className={cn("mx-auto block font-display text-8xl font-black leading-none", ink ? "text-background/20" : "text-foreground/20")}>“</span>
          <blockquote className="mt-4">
            <p className="font-display text-3xl font-black leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">{quote}</p>
          </blockquote>
          <figcaption className="mt-8">
            <p className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/70" : "text-foreground")}>{attribution}</p>
            {role && <p className={cn("mt-1 font-mono text-[10px] uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>{role}</p>}
          </figcaption>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {actions.map((a) => (
              <Button key={a.label} size="lg" onClick={a.onClick} asChild={!a.onClick && !!a.href} className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-widest">
                {a.onClick || !a.href ? a.label : <a href={a.href}>{a.label}</a>}
              </Button>
            ))}
          </div>
        </InView>
      </div>
    </section>
  )
}
