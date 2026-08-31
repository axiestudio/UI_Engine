import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      benchmark honestly against the industry
// ═══ EMOTION  fair fight, visible win — a tug-of-war you can watch
// ═══ SIGNATURE the bar knots in the middle with a "tension" badge that
//               shows the gap; bars fill on enter with overshoot ease
//   SITE      → comparison/pricing proof, sales one-pagers
//   APP       → benchmark panels; values are props
//   A11Y      role=meter with valuenow/max; values as text

export type BenchmarkDuelProps = {
  you: { label: string; value: number }
  industry: { label: string; value: number }
  unit?: string
  max?: number
  className?: string
}

export function BenchmarkDuel({
  you = { label: "Your team", value: 94 },
  industry = { label: "Industry median", value: 58 },
  unit = "% on-time",
  max = 100,
  className,
}: BenchmarkDuelProps) {
  const gap = Math.round(you.value - industry.value)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const Row = ({ item, tone, delay }: { item: { label: string; value: number }; tone: "you" | "ind"; delay: number }) => (
    <div role="meter" aria-valuenow={item.value} aria-valuemin={0} aria-valuemax={max} aria-label={`${item.label}: ${item.value} ${unit}`}>
      <div className="flex items-baseline justify-between">
        <span className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.16em]", tone === "you" ? "text-foreground" : "text-muted-foreground")}>{item.label}</span>
        <span className={cn("font-display text-2xl font-black tabular-nums", tone === "you" ? "text-foreground" : "text-muted-foreground")}>{item.value}<span className="text-sm">{unit}</span></span>
      </div>
      <div className="mt-2 h-10 overflow-hidden rounded-lg bg-muted">
        <motion.div
          initial={reduce ? {} : { width: 0 }}
          whileInView={{ width: `${(item.value / max) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay, ease: [0.34, 1.3, 0.5, 1] }}
          className={cn("h-full rounded-lg", tone === "you" ? "bg-foreground" : "bg-muted-foreground/50")}
        />
      </div>
    </div>
  )

  return (
    <SectionShell width={760} className={className}>
      <MonoLabel className="text-muted-foreground">BENCHMARK · HEAD TO HEAD</MonoLabel>
      <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">Same race. Different stride.</h2>

      <div className="mt-10 space-y-8">
        <Row item={you} tone="you" delay={0.1} />
        <Row item={industry} tone="ind" delay={0.35} />
      </div>

      <div className="mt-10 flex items-center gap-4 rounded-xl border border-dashed p-4">
        <motion.span
          initial={reduce ? {} : { rotate: [-4, 4, -4] }}
          animate={reduce ? {} : { rotate: [-4, 4, -4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="grid size-12 shrink-0 place-items-center rounded-lg border-2 border-foreground font-display text-xl font-black text-foreground"
        >
          +{gap}
        </motion.span>
        <p className="text-sm font-medium leading-relaxed text-muted-foreground">
          <span className="font-bold text-foreground">{gap} points of tension</span> between you and the median. The rope is pulling your way.
        </p>
      </div>
    </SectionShell>
  )
}
