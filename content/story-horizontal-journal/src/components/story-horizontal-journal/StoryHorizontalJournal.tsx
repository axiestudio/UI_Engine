import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { cn } from "@/lib/utils"

// ═══ JOB         Horizontal journal — a pinned editorial spread that scrolls sideways.
// ═══ EMOTION     A magazine you page through by scrolling.
// ═══ SIGNATURE   Whole-viewport "chapter" spreads translate horizontally on scroll.

export type JournalSpread = { id: string; index: string; title: string; body?: string; src?: string }

export type StoryHorizontalJournalProps = {
  eyebrow?: string
  spreads: JournalSpread[]
  className?: string
}

const DEFAULT_SPREADS = [
  { id: "sp1", index: "01", title: "The brief", body: "A kitchen table for Sunday dough and Monday emails.", src: "/showcase/content/content-01-office.webp" },
  { id: "sp2", index: "02", title: "The argument", body: "They wanted white. The room wanted oak. The room won.", src: "/showcase/content/content-07-corner.webp" },
  { id: "sp3", index: "03", title: "The build", body: "Nineteen days, four of them waiting on glue.", src: "/showcase/content/content-05-workshop.webp" },
  { id: "sp4", index: "04", title: "The table", body: "Delivered flat, finished in situ, first dough the same night.", src: "/showcase/content/content-03-product.webp" },
]
export function StoryHorizontalJournal({ eyebrow = "JOURNAL", spreads = DEFAULT_SPREADS, className }: StoryHorizontalJournalProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const runway = `${spreads.length * 110}vh`
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(spreads.length - 1) * 100}%`])
  const [idx, setIdx] = React.useState(0)
  React.useEffect(() => scrollYProgress.on("change", (v) => setIdx(Math.min(spreads.length - 1, Math.floor(v * spreads.length)))), [scrollYProgress, spreads.length])
  return (
    <section ref={ref} className={cn("relative isolate w-full bg-background", className)} style={{ height: runway }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-5 pb-4 sm:px-8">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</span>
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{idx + 1} / {spreads.length}</span>
        </div>
        <motion.div style={{ x }} className="flex flex-nowrap">
          {spreads.map((s) => (
            <div key={s.id} className="flex min-w-full items-center px-5 sm:px-8">
              <div className="mx-auto grid w-full max-w-[1120px] gap-8 sm:grid-cols-[0.9fr_1.1fr] sm:items-center">
                <div>
                  <p className="font-display text-7xl font-bold opacity-10">{s.index}</p>
                  <h2 className="font-display text-4xl font-bold tracking-[-0.03em] sm:text-6xl">{s.title}</h2>
                  {s.body && <p className="mt-4 max-w-md text-base font-medium leading-relaxed text-muted-foreground">{s.body}</p>}
                </div>
                <div className="img-hover-wash aspect-[4/5] overflow-hidden rounded-xl border bg-muted">
                  {s.src ? <img src={s.src} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
