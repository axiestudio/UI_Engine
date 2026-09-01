import * as React from "react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Tabs deep — a sticky left tab rail that swaps a large detail panel.
// ═══ EMOTION     Drill-down that stays in place.
// ═══ SIGNATURE   A vertical tab list + a synced detail panel.

export type DeepTab = { id: string; label: string; title: string; body?: string; points?: string[] }

export type InteractiveTabsDeepProps = {
  eyebrow?: string
  title?: React.ReactNode
  tabs: DeepTab[]
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_TABS = [
  { id: "d1", label: "The room", title: "One bench, north light", body: "Everything happens within six steps.", points: ["North-facing glazing", "Dust extraction at each station", "Radios off by agreement"] },
  { id: "d2", label: "The method", title: "Measure, argue, cut", body: "Full-scale drawings catch mistakes while they are cheap.", points: ["Taped outlines on the floor", "Second opinion before glue", "Cuts logged in the job book"] },
  { id: "d3", label: "The handover", title: "Signed, oiled, delivered", body: "You meet the maker. They show you how to care for it.", points: ["Care kit included", "Annual check-up booked", "Direct line to the bench"] },
]
export function InteractiveTabsDeep({ eyebrow = "DEEP", title = "A drill-down that stays put.", tabs = DEFAULT_TABS, tone = "paper", className }: InteractiveTabsDeepProps) {
  const ink = tone === "ink"
  const [active, setActive] = React.useState(0)
  const tab = tabs[active]
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
      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {tabs.map((t, i) => (
            <Button type='button' key={t.id} onClick={() => setActive(i)} className={cn("shrink-0 rounded-xl px-4 py-3 text-left font-display text-sm font-bold transition-colors", i === active ? "bg-foreground text-background" : ink ? "hover:bg-background/10" : "hover:bg-accent")} variant="default">
              {t.label}
            </Button>
          ))}
        </div>
        <div className="rounded-xl border p-6 sm:p-8">
          <p className={cn("font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>{String(active + 1).padStart(2, "0")}</p>
          <h3 className="mt-2 font-display text-2xl font-bold">{tab.title}</h3>
          {tab.body && <p className={cn("mt-3 text-base font-medium leading-relaxed", ink ? "text-background/75" : "text-muted-foreground")}>{tab.body}</p>}
          {tab.points && (
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {tab.points.map((p) => <li key={p} className={cn("rounded-lg border px-3 py-2 text-sm font-medium", ink ? "border-background/15" : "border-border")}>{p}</li>)}
            </ul>
          )}
        </div>
      </div>
    
  </div>
</section>
  )
}
