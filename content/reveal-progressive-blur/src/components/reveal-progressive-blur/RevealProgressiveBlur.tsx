import * as React from "react"
import { Button } from "@/components/ui/button"
import { InView } from "@/components/primitives/in-view"
import { ProgressiveBlur } from "@/components/primitives/progressive-blur"
import { Grain, SectionHead, SectionShell } from "@/components/primitives/handcraft"
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
    <SectionShell tone={tone} width={920} rule={ink ? "top" : "none"} className={className}>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div className="relative">
          <div className="relative overflow-hidden">
            <div className={cn("relative pb-16", ink && "text-background")}>
              <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
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
          {!ink && <Grain opacity={0.04} className="z-[1]" />}
        </div>
      </InView>
    </SectionShell>
  )
}
