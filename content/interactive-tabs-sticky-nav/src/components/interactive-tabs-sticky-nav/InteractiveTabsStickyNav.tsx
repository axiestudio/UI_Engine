import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Sticky tabs nav — a tab bar that sticks as you scroll through tab panels.
// ═══ EMOTION     Persistent context.
// ═══ SIGNATURE   A sticky tab rail with scrollspy over long panels.

export type StickyTab = { id: string; label: string; title: string; body?: string }

export type InteractiveTabsStickyNavProps = {
  eyebrow?: string
  title?: React.ReactNode
  tabs: StickyTab[]
  onView?: (id: string) => void
  className?: string
}

export function InteractiveTabsStickyNav({ eyebrow = "STICKY", title = "Tabs that stay within reach.", tabs, onView, className }: InteractiveTabsStickyNavProps) {
  const [active, setActive] = React.useState(tabs[0]?.id ?? "")
  const select = (id: string) => { setActive(id); onView?.(id); document.getElementById(`panel-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }) }
  return (
    <SectionShell width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} />
      </InView>
      <div className="sticky top-16 z-30 mt-10 -mx-2 overflow-x-auto rounded-xl border bg-background/85 p-1 backdrop-blur">
        <div className="flex min-w-max gap-1">
          {tabs.map((t, i) => (
            <button key={t.id} type="button" onClick={() => select(t.id)}
              className={cn("rounded-xl px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors", active === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent")}>
              <span className="mr-2 opacity-50">{String(i + 1).padStart(2, "0")}</span>{t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-8 space-y-8">
        {tabs.map((t) => (
          <div key={t.id} id={`panel-${t.id}`} className={cn("scroll-mt-40 rounded-xl border p-6 transition-opacity sm:p-8", active === t.id ? "bg-card" : "opacity-60")}>
            <div className="flex items-center gap-4">
              <span className="font-display text-5xl font-bold opacity-15">{String(tabs.indexOf(t) + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-2xl font-bold">{t.title}</h3>
            </div>
            {t.body && <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-muted-foreground">{t.body}</p>}
          </div>
        ))}
      </div>
    </SectionShell>
  )
}
