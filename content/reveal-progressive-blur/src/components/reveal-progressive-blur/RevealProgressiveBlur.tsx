import * as React from "react"
import { Button } from "@/components/ui/button"
import { InView } from "@/components/primitives/in-view"
import { ProgressiveBlur } from "@/components/primitives/progressive-blur"

import { cn } from "@/lib/utils"

// ═══ JOB         Reveal a content band optically as it enters view.
// ═══ EMOTION     A soft, gradual emergence — no hard wipe.
// ═══ SIGNATURE   Progressive-blur dissolve driven by InView.

export type RevealProgressiveBlurProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  /** Centered statement above a stacked proof band (heading + bullets). */
  statements?: { id?: string; heading: string; body?: React.ReactNode }[]
  action?: { label: string; href?: string; onClick?: () => void }
  tone?: "paper" | "ink"
  blurDirection?: "top" | "right" | "bottom" | "left"
  className?: string
}

export function RevealProgressiveBlur({
  eyebrow = "REVEAL",
  title = "Emerging, not abrupt.",
  subtitle = "Content dissolves into focus instead of sliding, snapping or wiping — a softer kind of reveal.",
  statements = [
    { id: "one", heading: "Optical, not geometric", body: "The edge is a blur gradient, so nothing clips the content." },
    { id: "two", heading: "Still accessible", body: "Reduced-motion collapses to a plain fade — nothing is hidden from screen readers." },
  ],
  action,
  tone = "paper",
  blurDirection = "bottom",
  className,
}: RevealProgressiveBlurProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  {((ink ? "top" : "none") === "top" || (ink ? "top" : "none") === "both") && <span aria-hidden className={cn("pointer-events-none absolute top-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-t border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />}
  {((ink ? "top" : "none") === "bottom" || (ink ? "top" : "none") === "both") && <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />}
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div className="relative">
          <div className="relative overflow-hidden">
            <div className={cn("relative pb-16", ink && "text-background")}>
                <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {statements.map((s) => (
                  <div key={s.id} className={cn("rounded-xl border p-6", ink ? "border-background/15" : "border-border")}>
                    <h3 className="font-display text-lg font-bold">{s.heading}</h3>
                    {s.body && <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{s.body}</p>}
                  </div>
                ))}
              </div>
              {action && (
                <div className="mt-8">
                  <Button onClick={action.onClick} asChild={!!action.href && !action.onClick}>
                    {action.href && !action.onClick ? <a href={action.href}>{action.label}</a> : action.label}
                  </Button>
                </div>
              )}
            </div>
            <ProgressiveBlur direction={blurDirection} blurIntensity={0.3} className="absolute inset-x-0 bottom-0 h-24" />
          </div>
          {!ink && <span aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", z-[1])}><Noise patternAlpha={Math.round((0.04) * 255)} patternSize={240} patternRefreshInterval={3} /></span>}
        </div>
      </InView>
    
  </div>
</section>
  )
}
