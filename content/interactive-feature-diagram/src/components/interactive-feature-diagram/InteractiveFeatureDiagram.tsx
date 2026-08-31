import * as React from "react"
import { Spotlight } from "@/components/primitives/spotlight"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

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

export function InteractiveFeatureDiagram({ eyebrow = "MAP", title = "Point at what matters.", src = "/showcase/content/content-01-office.webp", pins, tone = "paper", className }: InteractiveFeatureDiagramProps) {
  const ink = tone === "ink"
  const [active, setActive] = React.useState<string | null>(pins[0]?.id ?? null)
  const activePin = pins.find((p) => p.id === active)
  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0, scale: 0.98 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div className="relative mt-10 overflow-hidden rounded-xl border bg-foreground">
          <div className="relative aspect-[16/10]">
            <img src={src} alt="" className="h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0">
              <Spotlight className="h-full w-full" size={280} />
            </div>
            {pins.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActive(p.id)}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                aria-label={p.label}
              >
                <span className={cn("block h-4 w-4 rounded-full border-2 border-white/80", active === p.id ? "scale-125 bg-background" : "bg-black/40")} />
                <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-white/30" />
              </button>
            ))}
          </div>
          <div className="absolute bottom-0 inset-x-0 bg-background/90 p-6 backdrop-blur">
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
    </SectionShell>
  )
}
