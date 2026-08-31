import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

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
  React.useEffect(() => {
    const onScroll = () => {
      const els = wrap.current?.querySelectorAll<HTMLElement>("[data-row]")
      if (!els) return
      const mid = window.innerHeight * 0.5
      let cur = 0
      els.forEach((el, i) => { if (el.getBoundingClientRect().top < mid) cur = i })
      setActive(cur)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <SectionShell width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} />
      </InView>
      <div ref={wrap} className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="sticky top-20 h-fit rounded-xl border bg-card shadow-sm p-2">
          {rows.map((r, i) => (
            <button key={r.id} type="button" className={cn("flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left font-display text-sm font-bold transition-colors", i === active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent")}>
              <span className="font-mono text-[10px] opacity-50">{String(i + 1).padStart(2, "0")}</span>{r.label}
            </button>
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
    </SectionShell>
  )
}
