import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { BorderTrail } from "@/components/primitives/border-trail"
import { cn } from "@/lib/utils"

// ═══ JOB         Capabilities — a framed grid where each card self-draws its edge.
// ═══ EMOTION     Precision, engineering.
// ═══ SIGNATURE   BorderTrail light circles each capability card as it enters.

export type Capability = { id: string; title: string; body?: string }

export type CapabilitiesProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  items: Capability[]
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_ITEMS = [
  { id: "1", title: "Measured twice", body: "Every cut is checked against the drawing before it leaves the bench." },
  { id: "2", title: "Named hands", body: "The person who built your piece signs the back panel." },
  { id: "3", title: "Quiet hardware", body: "Soft-close everything. You hear the room, not the fittings." },
  { id: "4", title: "Ten-year promise", body: "If a joint fails, we drive out and refit it. In writing." },
]
export function Capabilities({ eyebrow = "CAPABILITIES", title = "What we do well.", subtitle = "Each card draws its own edge as you reach it.", items = DEFAULT_ITEMS, tone = "paper", className }: CapabilitiesProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {items.map((c, i) => (
          <InView key={c.id} once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}>
            <div className={cn("relative h-full overflow-hidden rounded-xl border p-6", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
              <BorderTrail size={52} className={cn("bg-[hsl(var(--primary)/0.7)]")} transition={{ ease: "linear", duration: 4 }} />
              <span className={cn("font-mono text-[11px] font-bold tracking-[0.2em]", ink ? "text-background/45" : "text-muted-foreground")}>{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 font-display text-lg font-bold">{c.title}</h3>
              {c.body && <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{c.body}</p>}
            </div>
          </InView>
        ))}
      </div>
    
  </div>
</section>
  )
}
