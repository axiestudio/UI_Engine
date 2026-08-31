import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { MonoLabel } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Pinned plates — sticky cards that peel one-by-one as you scroll.
// ═══ EMOTION     A stack of statements that hand off.
// ═══ SIGNATURE   Whole-viewport plates that offset and settle as the next arrives.

export type Plate = { id: string; kicker: string; title: string; body?: string; src?: string }

export type StoryPinnedPlatesProps = {
  eyebrow?: string
  plates: Plate[]
  className?: string
}

export function StoryPinnedPlates({ eyebrow = "PLATES", plates, className }: StoryPinnedPlatesProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const runway = `${plates.length * 90}vh`
  return (
    <section ref={ref} className={cn("relative w-full bg-background", className)} style={{ height: runway }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div className="absolute left-0 top-6 w-full px-5 sm:px-8">
          <MonoLabel className="text-muted-foreground">{eyebrow}</MonoLabel>
        </div>
        {plates.map((p, i) => {
          const start = i / plates.length
          const end = (i + 1) / plates.length
          const y = useTransform(scrollYProgress, [start, end], ["0%", i === plates.length - 1 ? "0%" : `${-8 * (i + 1)}%`])
          const scale = useTransform(scrollYProgress, [start, end], [1, 0.94])
          const opacity = useTransform(scrollYProgress, [start, Math.max(start + 0.08, end)], [1, 0.7])
          return (
            <motion.div key={p.id} style={{ y, scale, opacity }} className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-5 sm:px-8">
              <div className="mx-auto grid max-w-[1120px] gap-6 rounded-2xl border bg-card p-8 shadow-2xl sm:grid-cols-[0.8fr_1.2fr] sm:items-center">
                <div className="img-hover-wash aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                  {p.src ? <img src={p.src} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
                </div>
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{p.kicker}</p>
                  <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.03em] sm:text-4xl">{p.title}</h2>
                  {p.body && <p className="mt-3 text-base font-medium leading-relaxed text-muted-foreground">{p.body}</p>}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
