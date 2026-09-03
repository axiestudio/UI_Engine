import * as React from "react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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

const DEFAULT_TABS = [
  { id: "t1", label: "Shop", title: "The floor", body: "Six benches, one assembly table, no bottlenecks." },
  { id: "t2", label: "Finish", title: "The finishing room", body: "Separate, dust-free, and deliberately slow." },
  { id: "t3", label: "Dispatch", title: "The loading door", body: "Blankets, straps, and a driver who helps carry." },
]
export function InteractiveTabsStickyNav({ eyebrow = "STICKY", title = "Tabs that stay within reach.", tabs = DEFAULT_TABS, onView, className }: InteractiveTabsStickyNavProps) {
  const [active, setActive] = React.useState(tabs[0]?.id ?? "")
  const select = (id: string) => { setActive(id); onView?.(id); document.getElementById(`panel-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }) }
  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", false ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", false ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <div className="sticky top-16 z-30 mt-10 -mx-2 overflow-x-auto rounded-xl border bg-card p-1">
        <div className="flex min-w-max gap-1">
          {tabs.map((t, i) => (
            <Button type='button' key={t.id} onClick={() => select(t.id)} className={cn("rounded-xl px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors", active === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent")} variant="default">
              <span className="mr-2 opacity-50">{String(i + 1).padStart(2, "0")}</span>{t.label}
            </Button>
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
    
  </div>
</section>
  )
}
