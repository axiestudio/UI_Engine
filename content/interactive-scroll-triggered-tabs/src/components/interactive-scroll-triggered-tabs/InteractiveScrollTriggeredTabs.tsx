import * as React from "react"
import { motion, useScroll, useMotionValueEvent } from "motion/react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Scroll-triggered tabs — tab activation driven by scroll position.
// ═══ EMOTION     You read, the tabs follow.
// ═══ SIGNATURE   As you scroll a tall section, the matching tab auto-activates.

export type ScrollTabRow = { id: string; label: string; title: string; body?: string }

export type InteractiveScrollTriggeredTabsProps = {
  eyebrow?: string
  title?: React.ReactNode
  rows: ScrollTabRow[]
  className?: string
}

const DEFAULT_ROWS = [
  { id: "t1", label: "Materials", title: "Chosen slowly", body: "Two sawmills, both within a day's drive." },
  { id: "t2", label: "Joinery", title: "Cut by hand", body: "Dovetails fitted to a paper's width." },
  { id: "t3", label: "Finish", title: "Oiled, then oiled again", body: "Three coats, seven days, one finish." },
]
export function InteractiveScrollTriggeredTabs({ eyebrow = "SCROLLABLE", title = "The tabs follow your reading.", rows = DEFAULT_ROWS, className }: InteractiveScrollTriggeredTabsProps) {
  const [active, setActive] = React.useState(0)
  const wrap = React.useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", () => {
    const els = wrap.current?.querySelectorAll<HTMLElement>("[data-row]")
    if (!els) return
    const mid = window.innerHeight * 0.5
    let cur = 0
    els.forEach((el, i) => { if (el.getBoundingClientRect().top < mid) cur = i })
    setActive(cur)
  })
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
      <div ref={wrap} className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="sticky top-20 h-fit rounded-xl border bg-card shadow-sm p-2">
          {rows.map((r, i) => (
            <Button type="button" key={r.id} variant="default" className={cn(cn("flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left font-display text-sm font-bold transition-colors", i === active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent"))}>
              <span className="font-mono text-[10px] opacity-50">{String(i + 1).padStart(2, "0")}</span>{r.label}
            
          ))}
        </div>
        <div className="space-y-6">
          {rows.map((r, i) => (
            <div key={r.id} data-row className={cn("scroll-mt-24 rounded-xl border p-6 transition-colors", i === active ? "border-foreground bg-card" : "border-border")}>
              <h3 className="font-display text-2xl font-bold">{r.title}</h3>
              {r.body && <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-muted-foreground">{r.body}</p>}
            </div>
          ))}
        </div>
      </div>
    
  </div>
</section>
  )
}
