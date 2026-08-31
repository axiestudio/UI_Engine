import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Horizontal-cards — a vertically-scrolled section that pans sideways.
// ═══ EMOTION     A carousel that scrolls like a deck.
// ═══ SIGNATURE   A pinned viewport whose cards translate horizontally as you scroll.

export type HorizCard = { id: string; title: string; body?: string; src?: string }

export type ScrollHorizontalCardsProps = {
  eyebrow?: string
  title?: React.ReactNode
  cards: HorizCard[]
  tone?: "paper" | "ink"
  className?: string
}

export function ScrollHorizontalCards({ eyebrow = "PAN", title = "A section that moves sideways.", cards, tone = "paper", className }: ScrollHorizontalCardsProps) {
  const ink = tone === "ink"
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const runway = `${cards.length * 60 + 100}vh`
  const x = useTransform(scrollYProgress, [0, 1], ["1%", `-${cards.length * 40}%`])
  return (
    <section ref={ref} className={cn("relative w-full bg-background", className)} style={{ height: runway }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
          <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
          </InView>
        </div>
        <motion.div style={{ x }} className="mt-10 flex flex-nowrap gap-4 px-5">
          {cards.map((c) => (
            <div key={c.id} className={cn("w-[72vw] max-w-[420px] shrink-0 rounded-2xl border p-6 sm:w-[38vw]", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
              <div className="mb-4 aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                {c.src ? <img src={c.src} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
              </div>
              <h3 className="font-display text-xl font-bold">{c.title}</h3>
              {c.body && <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{c.body}</p>}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
