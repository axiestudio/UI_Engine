import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { MonoLabel } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Scroll scene — a pinned multi-staged scene where each stage translates/slides.
// ═══ EMOTION     A mini-narrative pinned to one viewport.
// ═══ SIGNATURE   A h-screen stage that slides through 3 scenes on a vertical scroll runway.

export type Scene = { id: string; kicker: string; title: string; body?: string; from: string; to: string }

export type HeroScrollSceneProps = {
  eyebrow?: string
  scenes: Scene[]
  className?: string
}

export function HeroScrollScene({ eyebrow = "SCENE", scenes, className }: HeroScrollSceneProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const runway = `${scenes.length * 90}vh`
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(scenes.length - 1) * 100}%`])
  const [idx, setIdx] = React.useState(0)
  React.useEffect(() => scrollYProgress.on("change", (v) => setIdx(Math.min(scenes.length - 1, Math.floor(v * scenes.length)))), [scrollYProgress, scenes.length])
  return (
    <section ref={ref} className={cn("relative w-full bg-foreground text-background", className)} style={{ height: runway }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-5 pb-4 sm:px-8">
          <MonoLabel className="text-background/55">{eyebrow}</MonoLabel>
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-background/50">{idx + 1} / {scenes.length}</span>
        </div>
        <motion.div style={{ x }} className="flex flex-nowrap">
          {scenes.map((s) => (
            <div key={s.id} className="flex h-full min-w-[100vw] flex-col items-start justify-center px-5 sm:px-8">
              <div className="mx-auto w-full max-w-[1120px]">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-background/50">{s.kicker}</p>
                <h2 className="mt-3 font-display text-4xl font-black leading-[0.98] tracking-[-0.03em] sm:text-6xl">{s.title}</h2>
                {s.body && <p className="mt-4 max-w-md text-base font-medium leading-relaxed text-background/70">{s.body}</p>}
                <div className="mt-8 h-1 w-40 overflow-hidden rounded-full bg-background/15">
                  <div className="h-full bg-background" style={{ width: `${((scenes.findIndex((sc) => sc.id === s.id) + 1) / scenes.length) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
