import * as React from "react"
import { useScroll, useMotionValueEvent } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ═══ JOB         Scrollspy nav — a sticky rail that highlights the section in view.
// ═══ EMOTION     Always oriented.
// ═══ SIGNATURE   Tracks scroll position and highlights the matching link with a progress bar.

export type ScrollspySection = { id: string; label: string; blurb?: string }

const DEFAULT_BLURBS: Record<string, string> = {
  top: "Start here \u2014 the rail lights up as each section passes.",
  work: "Selected work, one project per row. Watch the highlight follow.",
  process: "How the work gets made, in four short steps.",
  studio: "The people and the room behind the output.",
  visit: "Hours, address, and the booking link. End of the line.",
}
const FALLBACK_BLURB = "Keep scrolling \u2014 the rail marks this section as you pass."

export type NavScrollspyProps = {
  brand?: string
  sections: ScrollspySection[]
  className?: string
}

const DEFAULT_SECTIONS = [
  { id: "top", label: "Top" },
  { id: "work", label: "Work" },
  { id: "process", label: "Process" },
  { id: "studio", label: "Studio" },
  { id: "visit", label: "Visit" },
]
export function NavScrollspy({ brand = "STUDIO", sections = DEFAULT_SECTIONS, className }: NavScrollspyProps) {
  const [active, setActive] = React.useState(sections[0]?.id ?? "")
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", () => {
    const mid = window.innerHeight * 0.4
    let cur = sections[0]?.id ?? ""
    for (const s of sections) {
      const el = document.getElementById(s.id)
      if (el && el.getBoundingClientRect().top < mid) cur = s.id
    }
    setActive(cur)
  })
  return (
    <div className={cn("relative isolate min-h-[480px] w-full", className)}>
      <header className="relative isolate overflow-hidden sticky top-0 z-40 border-b bg-background/80 ">
        <div className="mx-auto flex max-w-[1280px] items-center gap-6 px-5 py-4 sm:px-8">
          <span className="font-display text-lg font-black tracking-tight">{brand}</span>
          <nav className="flex items-center gap-6">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={cn("relative font-mono text-[11px] font-bold uppercase tracking-widest transition-colors", active === s.id ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {s.label}
                {active === s.id && <span className="absolute -bottom-2 left-0 h-0.5 w-full bg-foreground" />}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-3xl space-y-24 px-5 py-16 sm:px-8">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
              <h2 className="font-display text-2xl font-black sm:text-3xl">{s.label}</h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">{s.blurb ?? DEFAULT_BLURBS[s.id] ?? FALLBACK_BLURB}</p>
            </InView>
          </section>
        ))}
      </div>
    </div>
  )
}
