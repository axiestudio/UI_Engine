import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Oversized gradient / highlighted editorial headline.
// ═══ EMOTION     Loud, confident brand statement.
// ═══ SIGNATURE   Giant display type where a phrase carries the gradient text mask.

export type GradientTextProps = {
  eyebrow?: string
  /** The full headline; `highlight` is the substring painted with the gradient mask. */
  title?: string
  highlight?: string
  subtitle?: string
  actions?: { label: string; href?: string; onClick?: () => void }[]
  tone?: "paper" | "ink"
  className?: string
}

export function GradientText({
  eyebrow = "BRAND",
  title = "Design at the speed of the brief.",
  highlight = "the brief",
  subtitle = "A headline that turns a phrase into the brand mark — gradient masked, oversized, unmistakable.",
  actions = [{ label: "Start", href: "#" }],
  tone = "paper",
  className,
}: GradientTextProps) {
  const ink = tone === "ink"
  const parts = title.split(highlight)
  return (
    <section className={cn("relative isolate overflow-hidden", ink && "bg-foreground text-background", className)}>
      <Grain opacity={ink ? 0.07 : 0.04} />
      <div className="mx-auto max-w-[1280px] px-5 pb-20 pt-16 sm:px-8 lg:pb-28 lg:pt-24">
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className={ink ? "text-background/55" : "text-muted-foreground"}>{eyebrow}</MonoLabel>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <h1 className="mt-5 max-w-5xl font-display text-[48px] font-black leading-[0.96] tracking-[-0.04em] sm:text-7xl lg:text-[96px]">
            {parts[0]}
            <span className="gradient-text">{highlight}</span>
            {parts[1]}
          </h1>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}>
          <p className={cn("mt-6 max-w-xl text-base font-medium leading-relaxed sm:text-lg", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.26 }}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {actions.map((a) => (
              <Button key={a.label} size="lg" onClick={a.onClick} asChild={!a.onClick && !!a.href} className="h-12 rounded-full px-7 font-mono text-[11px] font-bold uppercase tracking-widest">
                {a.onClick || !a.href ? a.label : <a href={a.href}>{a.label}</a>}
              </Button>
            ))}
          </div>
        </InView>
      </div>
    </section>
  )
}
