import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { Download, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { SlidingNumber } from "@/components/primitives/sliding-number"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      turn the annual report from a PDF into an event
// ═══ EMOTION  an envelope worth opening — ceremony before data
// ═══ SIGNATURE the report cover folds open on scroll: two panels hinge
//               apart (perspective) revealing stat tiles + download
//   SITE      → investor relations, annual report landing
//   APP       → quarterly business reviews; stats are props
//   A11Y      content readable without scroll; panels aria-hidden when closed

export type ReportStat = { value: number; suffix?: string; label: string }

export type ReportUnfoldProps = {
  year?: string
  title?: string
  stats?: ReportStat[]
  className?: string
}

const DEFAULT_STATS: ReportStat[] = [
  { value: 48, suffix: "%", label: "YoY revenue growth" },
  { value: 12, suffix: "k", label: "Teams onboarded" },
  { value: 97, suffix: "%", label: "Renewal rate" },
]

export function ReportUnfold({ year = "2026", title = "The Honest Ledger", stats = DEFAULT_STATS, className }: ReportUnfoldProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "center 0.55"] })
  const open = reduce ? 1 : useTransform(scrollYProgress, [0, 1], [0, 1])
  const leftX = useTransform(open, [0, 1], ["0%", "-8%"])
  const rightX = useTransform(open, [0, 1], ["0%", "8%"])
  const lRot = useTransform(open, [0, 1], [0, -64])
  const rRot = useTransform(open, [0, 1], [0, 64])

  return (
    <div ref={ref}>
      <SectionShell width={920} className={className}>
        <MonoLabel className="text-muted-foreground">ANNUAL REPORT · {year}</MonoLabel>

        <div className="relative mx-auto mt-10 max-w-[640px]" style={{ perspective: 1200 }}>
          {/* cover halves */}
          <motion.div aria-hidden style={{ x: leftX, rotateY: lRot, transformOrigin: "left center" }}
            className={cn("absolute inset-0 z-20 flex flex-col justify-between rounded-l-2xl border bg-foreground p-8 text-background [backface-visibility:hidden]",
              reduce && "hidden")}>
            <MonoLabel className="text-background/50">CONFIDENTIAL · V1</MonoLabel>
            <div>
              <span className="font-display text-6xl font-black tracking-tighter">{year}</span>
              <span className="mt-2 block font-serif text-lg italic text-background/80">{title}</span>
            </div>
            <span className="font-mono text-[9px] font-black uppercase tracking-[0.24em] text-background/40">fold to open ↓</span>
          </motion.div>
          <motion.div aria-hidden style={{ x: rightX, rotateY: rRot, transformOrigin: "right center" }}
            className={cn("absolute inset-0 z-10 rounded-r-2xl border bg-foreground/90 [backface-visibility:hidden]", reduce && "hidden")} />

          {/* inside spread */}
          <div className="rounded-2xl border bg-card p-8 sm:p-10">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-2xl font-black tracking-tight text-foreground">{title} · {year}</span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">32 pages</span>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {stats.map((s, i) => (
                <InView key={s.label} once delay={0.3 + i * 0.12}>
                  <div className="border-l-2 border-foreground/70 pl-4">
                    <span className="font-display text-4xl font-black tabular-nums tracking-tight text-foreground">
                      <SlidingNumber value={s.value} /><span className="text-xl text-muted-foreground">{s.suffix}</span>
                    </span>
                    <p className="mt-1 font-mono text-[10px] font-bold uppercase leading-relaxed tracking-[0.14em] text-muted-foreground">{s.label}</p>
                  </div>
                </InView>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#" className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-background">
                <Download className="size-3.5" aria-hidden /> PDF · 4.2 MB
              </a>
              <a href="#" className="group inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-foreground">
                Web version <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </a>
            </div>
          </div>
        </div>
        <p className="mt-6 text-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">scroll to unfold the cover</p>
      </SectionShell>
    </div>
  )
}
