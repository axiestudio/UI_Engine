import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Editorial hero — a two-column opening with an index numeral.
// ═══ EMOTION     Magazine front matter.
// ═══ SIGNATURE   Left index + giant headline, right column of supporting copy.

export type HeroEditorialProps = {
  index?: string
  eyebrow?: string
  title?: React.ReactNode
  sub?: React.ReactNode
  actions?: { label: string; href?: string; onClick?: () => void }[]
  tone?: "paper" | "ink"
  className?: string
}

export function HeroEditorial({
  index = "01",
  eyebrow = "OPENING STATEMENT",
  title = "Sections that read like essays.",
  sub = "Editorial grids, hand-tune type, and one signature move per block — a library that feels written, not assembled.",
  actions = [{ label: "Open the index", href: "#" }],
  tone = "paper",
  className,
}: HeroEditorialProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate overflow-hidden py-16 sm:py-20", ink && "bg-foreground text-background", className)}>
      <Grain opacity={ink ? 0.07 : 0.04} />
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="grid gap-10 border-b pb-10 lg:grid-cols-[auto_1fr_auto] lg:items-end lg:gap-16">
          <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <span className={cn("font-display text-[80px] font-black leading-none opacity-15 sm:text-[120px]", ink ? "text-background" : "text-foreground")}>{index}</span>
          </InView>
          <InView once variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
            <div>
              <MonoLabel className={ink ? "text-background/55" : "text-muted-foreground"}>{eyebrow}</MonoLabel>
              <h1 className="mt-4 font-display text-4xl font-black leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-7xl">{title}</h1>
            </div>
          </InView>
          <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}>
            <div className="max-w-sm">
              <p className={cn("text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{sub}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {actions.map((a) => (
                  <Button key={a.label} onClick={a.onClick} asChild={!a.onClick && !!a.href} className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-widest">
                    {a.onClick || !a.href ? a.label : <a href={a.href}>{a.label}</a>}
                  </Button>
                ))}
              </div>
            </div>
          </InView>
        </div>
      </div>
    </section>
  )
}
