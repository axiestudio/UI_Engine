import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Logo hero — a bold brand wordmark to open the page.
// ═══ EMOTION     Own the moment.
// ═══ SIGNATURE   A huge wordmark + tagline + one CTA, centered.

export type HeroLogoProps = {
  mark?: string
  tagline?: string
  kicker?: string
  actions?: { label: string; href?: string; onClick?: () => void }[]
  tone?: "paper" | "ink"
  className?: string
}

export function HeroLogo({
  mark = "STUDIO",
  tagline = "Sections for the work that matters.",
  kicker = "EST. 2026",
  actions = [{ label: "Enter", href: "#" }],
  tone = "paper",
  className,
}: HeroLogoProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-hidden", ink && "bg-foreground text-background", className)}>
      <Grain opacity={ink ? 0.07 : 0.04} />
      <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
        <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className={cn(ink ? "text-background/55" : "text-muted-foreground", "justify-center")}>{kicker}</MonoLabel>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <h1 className={cn("mt-8 font-display text-[88px] font-black leading-[0.85] tracking-[-0.05em] sm:text-[160px] lg:text-[220px]", ink ? "text-background" : "text-foreground")}>
            {mark}
          </h1>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}>
          <p className={cn("mx-auto mt-6 max-w-md text-sm font-medium leading-relaxed", ink ? "text-background/65" : "text-muted-foreground")}>{tagline}</p>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
