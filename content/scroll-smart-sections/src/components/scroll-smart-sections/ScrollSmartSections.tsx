import * as React from "react"
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react"
import { cn } from "@/lib/utils"

// ═══ JOB         Smart sections — a sticky index that highlights whichever section you read.
// ═══ EMOTION     A map that follows you.
// ═══ SIGNATURE   A sticky index rail + three deep sections with scroll-linked highlighting.

export type SmartSection = { id: string; label: string; title: string; body?: string; stat?: string }

export type ScrollSmartSectionsProps = {
  eyebrow?: string
  sections: SmartSection[]
  className?: string
}

const DEFAULT_SECTIONS = [
  { id: "s1", label: "01", title: "North light only", body: "Colour judgement needs one honest light.", stat: "6 benches" },
  { id: "s2", label: "02", title: "Dust leaves at the source", body: "Extraction at every station, swept twice daily.", stat: "2x daily" },
  { id: "s3", label: "03", title: "The wall of standards", body: "Every joint we promise, cut and pinned for reference.", stat: "14 joints" },
]
export function ScrollSmartSections({ eyebrow = "INDEX", sections = DEFAULT_SECTIONS, className }: ScrollSmartSectionsProps) {
  const wrap = React.useRef<HTMLDivElement>(null)
  const { scrollY, scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] })
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const [active, setActive] = React.useState(0)
  useMotionValueEvent(scrollY, "change", () => {
    const mid = window.innerHeight * 0.45
    let cur = 0
    wrap.current?.querySelectorAll<HTMLElement>("[data-sec]").forEach((el, i) => { if (el.getBoundingClientRect().top < mid) cur = i })
    setActive(cur)
  })
  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
      <div ref={wrap} className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <div className="sticky top-24 h-fit">
          <ol className="space-y-3">
            {sections.map((s, i) => (
              <li key={s.id} className={cn("flex items-baseline gap-3 font-display font-bold transition-colors", i === active ? "text-foreground" : "text-muted-foreground")}>
                <span className="font-mono text-[10px]">{String(i + 1).padStart(2, "0")}</span>{s.label}
              </li>
            ))}
          </ol>
          <div className="mt-6 h-1 overflow-hidden rounded-full bg-muted">
            <motion.div style={{ width: progress }} className="h-full rounded-full bg-foreground" />
          </div>
        </div>
        <div className="space-y-24">
          {sections.map((s, i) => (
            <section key={s.id} data-sec className="scroll-mt-32">
              <p className="font-display text-6xl font-bold opacity-10">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="font-display text-3xl font-bold tracking-[-0.02em]">{s.title}</h3>
              {s.stat && <p className="mt-3 font-display text-5xl font-bold text-[hsl(var(--primary))]">{s.stat}</p>}
              {s.body && <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-muted-foreground">{s.body}</p>}
            </section>
          ))}
        </div>
      </div>
    
  </div>
</section>
  )
}
