import * as React from "react"
import { Spotlight } from "@/components/primitives/spotlight"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Feature diagram — an annotated product shot with hot-spot pins.
// ═══ EMOTION     Explain with a map.
// ═══ SIGNATURE   A spotlight-lit image with pulsing pins that reveal labels.

export type DiagramPin = { id: string; x: number; y: number; label: string; body?: string }

export type InteractiveFeatureDiagramProps = {
  eyebrow?: string
  title?: React.ReactNode
  src?: string
  pins: DiagramPin[]
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_PINS = [
  { id: "p1", x: 18, y: 30, label: "Dovetailed rails", body: "Cut by hand, fitted to a whisper." },
  { id: "p2", x: 52, y: 58, label: "Levelling feet", body: "Thirty millimetres of travel for old floors." },
  { id: "p3", x: 80, y: 24, label: "Cable channel", body: "Hidden groove down the back leg." },
]
export function InteractiveFeatureDiagram({ eyebrow = "MAP", title = "Point at what matters.", src = "/showcase/content/content-01-office.webp", pins = DEFAULT_PINS, tone = "paper", className }: InteractiveFeatureDiagramProps) {
  const ink = tone === "ink"
  const [active, setActive] = React.useState<string | null>(pins[0]?.id ?? null)
  const activePin = pins.find((p) => p.id === active)
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <InView once variants={{ hidden: { opacity: 0, scale: 0.98 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div className="relative mt-10 overflow-hidden rounded-xl border bg-foreground">
          <div className="relative aspect-[16/10]">
            <img src={src} alt="" className="h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0">
              <Spotlight className="h-full w-full" size={280} />
            </div>
            {pins.map((p) => (
              <Button type='button' key={p.id} onClick={() => setActive(p.id)} style={{ left: `${p.x}%`, top: `${p.y}%` }} aria-label={p.label} className="group absolute -translate-x-1/2 -translate-y-1/2" variant="default">
                <span className={cn("block h-4 w-4 rounded-full border-2 border-white/80", active === p.id ? "scale-125 bg-background" : "bg-black/40")} />
                <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-white/30" />
              </Button>
            ))}
          </div>
          <div className="absolute bottom-0 inset-x-0 bg-card p-6">
            {activePin && (
              <div className="flex items-center gap-4">
                <span className="font-display text-2xl font-bold">{String(pins.findIndex((p) => p.id === activePin.id) + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-display text-lg font-bold">{activePin.label}</p>
                  {activePin.body && <p className={cn("text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{activePin.body}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </InView>
    
  </div>
</section>
  )
}
