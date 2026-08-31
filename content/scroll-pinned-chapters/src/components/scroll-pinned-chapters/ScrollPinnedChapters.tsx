import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Pinned chapters — a sticky stage where chapters crossfade as you scroll.
// ═══ EMOTION     Storytelling that stays in one place.
// ═══ SIGNATURE   A pinned viewport that steps through chapters (title/content) on scroll.

export type Chapter = { id: string; title: string; body?: string; progress?: number }

export type ScrollPinnedChaptersProps = {
  eyebrow?: string
  chapters: Chapter[]
  tone?: "paper" | "ink"
  className?: string
}

export function ScrollPinnedChapters({ eyebrow = "CHAPTERS", chapters, tone = "paper", className }: ScrollPinnedChaptersProps) {
  const ink = tone === "ink"
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const runway = `${chapters.length * 100 + 40}vh`
  const [idx, setIdx] = React.useState(0)
  React.useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      setIdx(Math.min(chapters.length - 1, Math.floor(v * chapters.length)))
    })
  }, [scrollYProgress, chapters.length])
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1.04])

  return (
    <section ref={ref} className={cn("relative w-full bg-background", className)} style={{ height: runway }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div style={{ scale }} className="mx-auto max-w-2xl px-5 text-center sm:px-8">
          <MonoLabel className={cn(ink ? "text-background/55" : "text-muted-foreground", "justify-center")}>{eyebrow}</MonoLabel>
          <div className="relative mt-6 min-h-[220px]">
            {chapters.map((c, i) => (
              <motion.div
                key={c.id}
                initial={false}
                animate={{ opacity: i === idx ? 1 : 0, y: i === idx ? 0 : 24 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={cn("absolute inset-0", i !== idx && "pointer-events-none")}
              >
                <h2 className="font-display text-4xl font-black tracking-[-0.03em] sm:text-6xl">{c.title}</h2>
                {c.body && <p className={cn("mx-auto mt-4 max-w-md text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{c.body}</p>}
                <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CHAPTER {i + 1} / {chapters.length}</p>
              </motion.div>
            ))}
          </div>
          {/* progress dots */}
          <div className="mt-8 flex justify-center gap-2">
            {chapters.map((c, i) => (
              <span key={c.id} className={cn("h-1 w-8 rounded-full transition-colors", i === idx ? "bg-foreground" : "bg-muted")} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
