import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Stack-cards — a deck where cards peel off to reveal the next.
// ═══ EMOTION     A hand you deal through.
// ═══ SIGNATURE   Cards stack with offset; scrolling lets each top card lift away.

export type StackBlock = { id: string; title: string; body?: string; src?: string }

export type ScrollStackCardsProps = {
  eyebrow?: string
  cards: StackBlock[]
  tone?: "paper" | "ink"
  className?: string
}

export function ScrollStackCards({ eyebrow = "DECK", cards, tone = "paper", className }: ScrollStackCardsProps) {
  const ink = tone === "ink"
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const runway = `${cards.length * 100 + 40}vh`
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85])
  return (
    <section ref={ref} className={cn("relative w-full bg-background", className)} style={{ height: runway }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <p className={cn("pointer-events-none absolute top-20 z-20 text-center font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
        <motion.div style={{ scale }} className="relative h-[420px] w-[320px] sm:w-[360px]">
          {cards.map((c, i) => {
            const start = i / cards.length
            const end = (i + 1) / cards.length
            const y = useTransform(scrollYProgress, [start, end], [0, -60])
            const rot = useTransform(scrollYProgress, [start, end], [0, i % 2 ? -8 : 8])
            const op = useTransform(scrollYProgress, [start, Math.min(end, start + 0.3)], [1, 0.9])
            return (
              <motion.div
                key={c.id}
                style={{ y, rotate: rot, opacity: op }}
                className={cn("absolute inset-0 overflow-hidden rounded-3xl border bg-card p-6 shadow-2xl", i === cards.length - 1 && "z-10")}
              >
                <div className="img-hover-wash mb-4 aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                  {c.src ? <img src={c.src} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
                </div>
                <h3 className="font-display text-xl font-black">{c.title}</h3>
                {c.body && <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{c.body}</p>}
                <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CARD {i + 1} / {cards.length}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
