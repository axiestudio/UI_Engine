import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Framed hero — the statement sits inside a matted frame.
// ═══ EMOTION     Gallery-poster, deliberate.
// ═══ SIGNATURE   A bordered inset frame around the headline with a caption rail.

export type HeroFramedProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: { label: string; href?: string; onClick?: () => void; variant?: "default" | "outline" }[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function HeroFramed({
  eyebrow = "FRAME 04",
  title = "The work, framed.",
  subtitle = "A matted frame holds the opening statement like a poster, with a caption rail underneath.",
  actions = [{ label: "View the series", href: "#" }, { label: "About", variant: "outline", href: "#" }],
  caption = "STUDIO · TYPOGRAPHIC SERIES",
  tone = "paper",
  className,
}: HeroFramedProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate overflow-hidden py-16 sm:py-20", ink && "bg-foreground text-background", className)}>
      <Grain opacity={ink ? 0.07 : 0.04} />
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className={cn("relative border p-8 sm:p-12 lg:p-16", ink ? "border-background/30" : "border-foreground/25")}>
            <span className={cn("pointer-events-none absolute left-2 top-2 block size-3 border-l-2 border-t-2", ink ? "border-background/60" : "border-foreground/50")} />
            <span className={cn("pointer-events-none absolute bottom-2 right-2 block size-3 border-b-2 border-r-2", ink ? "border-background/60" : "border-foreground/50")} />
            <MonoLabel className={ink ? "text-background/55" : "text-muted-foreground"}>{eyebrow}</MonoLabel>
            <h1 className="mt-5 font-display text-4xl font-black leading-[0.98] tracking-[-0.035em] sm:text-6xl">{title}</h1>
            <p className={cn("mt-5 max-w-xl text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((a) => (
                <Button key={a.label} size="lg" variant={a.variant ?? "default"} onClick={a.onClick} asChild={!a.onClick && !!a.href} className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-widest">
                  {a.onClick || !a.href ? a.label : <a href={a.href}>{a.label}</a>}
                </Button>
              ))}
            </div>
          </div>
        </InView>
        {caption && (
          <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
            <p className={cn("mt-3 text-right font-mono text-[10px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{caption}</p>
          </InView>
        )}
      </div>
    </section>
  )
}
