import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Magnetic } from "@/components/primitives/magnetic"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Panel hero — a stacked info panel beside the statement.
// ═══ EMOTION     App-like, functional.
// ═══ SIGNATURE   A magnetic CTA + a callout panel that lifts slightly on hover.

export type HeroPanelProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  panel?: { label: string; value: string; note?: string }
  actions?: { label: string; href?: string; onClick?: () => void }[]
  tone?: "paper" | "ink"
  className?: string
}

export function HeroPanel({
  eyebrow = "PANEL",
  title = "A hero with a panel.",
  subtitle = "A functional callout sits beside the headline — a preview of the product, not just the pitch.",
  panel = { label: "Sections", value: "100+", note: "ready to ship" },
  actions = [{ label: "Get started", href: "#" }],
  tone = "paper",
  className,
}: HeroPanelProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate overflow-hidden py-16 sm:py-20", ink && "bg-foreground text-background", className)}>
      <Grain opacity={ink ? 0.07 : 0.04} />
      <div className="mx-auto grid max-w-[1120px] items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div>
            <MonoLabel className={ink ? "text-background/55" : "text-muted-foreground"}>{eyebrow}</MonoLabel>
            <h1 className="mt-4 font-display text-4xl font-black leading-[0.98] tracking-[-0.035em] sm:text-6xl">{title}</h1>
            <p className={cn("mt-5 max-w-lg text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>
            <div className="mt-7">
              {actions.map((a) => (
                <Magnetic key={a.label}>
                  <Button size="lg" onClick={a.onClick} asChild={!a.onClick && !!a.href} className="h-12 rounded-full px-7 font-mono text-[11px] font-bold uppercase tracking-widest">
                    {a.onClick || !a.href ? a.label : <a href={a.href}>{a.label}</a>}
                  </Button>
                </Magnetic>
              ))}
            </div>
          </div>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
          <div className={cn("rounded-2xl border p-6 shadow-xl transition-transform hover:-translate-y-1 sm:p-8", ink ? "border-background/20 bg-background/5" : "border-border bg-card")}>
            <p className={cn("font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>{panel.label}</p>
            <p className="mt-2 font-display text-6xl font-black tracking-tight sm:text-7xl">{panel.value}</p>
            {panel.note && <p className={cn("mt-2 font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/55" : "text-muted-foreground")}>{panel.note}</p>}
            <div className={cn("mt-6 h-2 w-full overflow-hidden rounded-full", ink ? "bg-background/10" : "bg-muted")}>
              <div className="h-full w-[68%] rounded-full bg-foreground" />
            </div>
          </div>
        </InView>
      </div>
    </section>
  )
}
