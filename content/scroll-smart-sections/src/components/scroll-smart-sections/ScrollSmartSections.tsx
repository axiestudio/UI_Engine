import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { SectionShell } from "@/components/primitives/handcraft"
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

export function ScrollSmartSections({ eyebrow = "INDEX", sections, className }: ScrollSmartSectionsProps) {
  const wrap = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] })
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const [active, setActive] = React.useState(0)
  React.useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight * 0.45
      let cur = 0
      wrap.current?.querySelectorAll<HTMLElement>("[data-sec]").forEach((el, i) => { if (el.getBoundingClientRect().top < mid) cur = i })
      setActive(cur)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <SectionShell width={1120} rule="bottom" className={className}>
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
    </SectionShell>
  )
}
