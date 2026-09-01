import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ═══ JOB         Scale-reveal — a stack of sections that scale down as the next one arrives.
// ═══ EMOTION     Z-depth steps.
// ═══ SIGNATURE   Each sticky block scales from 1 -> 0.9 as it hands off.

export type ScaleRevealBlock = { id: string; title: string; body?: string; src?: string }

export type ScrollScaleRevealProps = {
  eyebrow?: string
  blocks: ScaleRevealBlock[]
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_BLOCKS = [
  { id: "b1", title: "Chosen slowly", body: "Two sawmills. Every board seen before it is bought.", src: "/showcase/content/content-06-nature.webp" },
  { id: "b2", title: "Built once", body: "One maker per piece, from lumber to sign-off.", src: "/showcase/content/content-05-workshop.webp" },
  { id: "b3", title: "Kept forever", body: "Annual check-up included. Joints guaranteed ten years.", src: "/showcase/gallery-04.webp" },
]
export function ScrollScaleReveal({ eyebrow = "ZOOM", blocks = DEFAULT_BLOCKS, tone = "paper", className }: ScrollScaleRevealProps) {
  const ink = tone === "ink"
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const runway = `${blocks.length * 110}vh`
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9])
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.6])

  return (
    <section ref={ref} className={cn("relative w-full bg-background", className)} style={{ height: runway }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div style={{ scale, opacity }} className="mx-auto w-full max-w-4xl px-5 sm:px-8">
          <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <p className={cn("text-center font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
          </InView>
          <div className="mt-8 space-y-6">
            {blocks.map((b, i) => (
              <div key={b.id} className={cn("grid gap-5 rounded-xl border p-6 sm:grid-cols-[auto_1fr] sm:items-center", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
                <span className="font-display text-4xl font-bold opacity-20">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-2xl font-bold">{b.title}</h3>
                  {b.body && <p className={cn("mt-1 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{b.body}</p>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
