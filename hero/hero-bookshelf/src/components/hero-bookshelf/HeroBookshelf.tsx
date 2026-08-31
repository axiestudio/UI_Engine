import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Bookshelf hero — vertical book-spines set the brand.
// ═══ EMOTION     Institutional, archive-y.
// ═══ SIGNATURE   A row of vertical spine titles above the statement.

export type HeroBookshelfProps = {
  spines?: string[]
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: { label: string; href?: string; onClick?: () => void }[]
  tone?: "paper" | "ink"
  className?: string
}

export function HeroBookshelf({
  spines = ["SECTIONS", "TOKENS", "MOTION", "TYPE", "GRID", "SHIP", "A11Y", "COLOR"],
  eyebrow = "THE SHELF",
  title = "A shelf of sections.",
  subtitle = "Every block is a spine you can pull — each one self-contained, all of them the same design language.",
  actions = [{ label: "Browse the shelf", href: "#" }],
  tone = "paper",
  className,
}: HeroBookshelfProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate overflow-hidden py-16 sm:py-20", ink && "bg-foreground text-background", className)}>
      <Grain opacity={ink ? 0.07 : 0.04} />
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex flex-wrap">
            {spines.map((sp, i) => (
              <div
                key={sp}
                className={cn(
                  "flex h-44 w-11 items-center justify-center border-b-2 border-r-2 px-1 transition-colors last:border-r-0",
                  ink ? "border-background/30 bg-background/5" : "border-foreground/25 bg-muted/30",
                  i % 2 === 0 ? "rotate-0" : "rotate-[0.6deg]",
                )}
                style={{ writingMode: "vertical-rl" }}
              >
                <span className="font-display text-[11px] font-black uppercase tracking-[0.18em]">{sp}</span>
              </div>
            ))}
          </div>
        </InView>
        <div className="mt-10 max-w-xl">
          <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <MonoLabel className={ink ? "text-background/55" : "text-muted-foreground"}>{eyebrow}</MonoLabel>
            <h1 className="mt-4 font-display text-4xl font-black leading-[0.98] tracking-[-0.035em] sm:text-6xl">{title}</h1>
            <p className={cn("mt-5 text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              {actions.map((a) => (
                <Button key={a.label} size="lg" onClick={a.onClick} asChild={!a.onClick && !!a.href} className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-widest">
                  {a.onClick || !a.href ? a.label : <a href={a.href}>{a.label}</a>}
                </Button>
              ))}
            </div>
          </InView>
        </div>
      </div>
    </section>
  )
}
