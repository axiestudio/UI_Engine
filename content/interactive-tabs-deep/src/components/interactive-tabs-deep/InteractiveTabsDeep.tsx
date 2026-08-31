import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

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

export function InteractiveTabsDeep({ eyebrow = "DEEP", title = "A drill-down that stays put.", tabs, tone = "paper", className }: InteractiveTabsDeepProps) {
  const ink = tone === "ink"
  const [active, setActive] = React.useState(0)
  const tab = tabs[active]
  return (
    <SectionShell tone={tone} width={1120} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {tabs.map((t, i) => (
            <button key={t.id} type="button" onClick={() => setActive(i)}
              className={cn("shrink-0 rounded-xl px-4 py-3 text-left font-display text-sm font-bold transition-colors", i === active ? "bg-foreground text-background" : ink ? "hover:bg-background/10" : "hover:bg-accent")}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="rounded-2xl border p-6 sm:p-8">
          <p className={cn("font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>{String(active + 1).padStart(2, "0")}</p>
          <h3 className="mt-2 font-display text-2xl font-black">{tab.title}</h3>
          {tab.body && <p className={cn("mt-3 text-base font-medium leading-relaxed", ink ? "text-background/75" : "text-muted-foreground")}>{tab.body}</p>}
          {tab.points && (
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {tab.points.map((p) => <li key={p} className={cn("rounded-lg border px-3 py-2 text-sm font-medium", ink ? "border-background/15" : "border-border")}>{p}</li>)}
            </ul>
          )}
        </div>
      </div>
    </SectionShell>
  )
}
