import * as React from "react"
import { ArrowRight } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Centered hero — a single-column statement.
// ═══ EMOTION     Calm, confident, unmistakable.
// ═══ SIGNATURE   Pill eyebrow, giant centered headline, CTA row.

export type HeroCenteredProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: { label: string; href?: string; onClick?: () => void; variant?: "default" | "outline" }[]
  badge?: string
  tone?: "paper" | "ink"
  className?: string
}

export function HeroCentered({
  eyebrow = "INTRODUCING",
  title = "The section library that ships itself.",
  subtitle = "Pre-built, token-first website sections with one signature move each — for studios, agencies and brands.",
  actions = [{ label: "Start building", href: "#" }, { label: "Read the docs", variant: "outline", href: "#" }],
  badge = "v0.1 · 100+ sections",
  tone = "paper",
  className,
}: HeroCenteredProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate overflow-hidden", ink && "bg-foreground text-background", className)}>
      <Grain opacity={ink ? 0.07 : 0.04} />
      <div className="mx-auto max-w-4xl px-5 pb-24 pt-16 text-center sm:px-8 lg:pb-32 lg:pt-24">
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className={cn(ink ? "text-background/55" : "text-muted-foreground", "justify-center")}>{eyebrow}</MonoLabel>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <h1 className="mt-6 font-display text-5xl font-black leading-[0.96] tracking-[-0.035em] sm:text-7xl lg:text-8xl">{title}</h1>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}>
          <p className={cn("mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed sm:text-lg", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.24 }}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {actions.map((a) => (
              <Button key={a.label} size="lg" variant={a.variant ?? "default"} onClick={a.onClick} asChild={!a.onClick && !!a.href} className="h-12 rounded-full px-7 font-mono text-[11px] font-bold uppercase tracking-widest">
                {a.onClick || !a.href ? a.label : <a href={a.href}>{a.label}</a>}
              </Button>
            ))}
          </div>
        </InView>
        {badge && (
          <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.32 }}>
            <p className={cn("mt-10 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/55" : "text-muted-foreground")}>
              {badge}
              <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </InView>
        )}
      </div>
    </section>
  )
}
