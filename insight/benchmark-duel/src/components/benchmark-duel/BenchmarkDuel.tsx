import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"


export type BenchmarkDuelProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  you: { label: string; value: number }
  industry: { label: string; value: number }
  unit?: string
  max?: number
  className?: string
}

export function BenchmarkDuel({
  eyebrow = "BENCHMARK · HEAD TO HEAD",
  title = "Benchmark vs. median",
  subtitle = "Same scale, same unit.",
  you = { label: "Your team", value: 94 },
  industry = { label: "Industry median", value: 58 },
  unit = "% on-time",
  max = 100,
  className,
}: BenchmarkDuelProps) {
  const gap = Math.round(you.value - industry.value)
  const ahead = gap >= 0
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  const Row = ({ item, tone, delay }: { item: { label: string; value: number }; tone: "you" | "ind"; delay: number }) => (
    <div role="meter" aria-valuenow={item.value} aria-valuemin={0} aria-valuemax={max} aria-label={`${item.label}: ${item.value} ${unit}`}>
      <div className="flex items-baseline justify-between gap-4">
        <span className={cn("font-mono text-[11px] font-semibold uppercase tracking-[0.12em]", tone === "you" ? "text-foreground" : "text-muted-foreground")}>
          {item.label}
        </span>
        <span className={cn("font-display text-[22px] font-semibold tabular-nums tracking-[-0.02em]", tone === "you" ? "text-foreground" : "text-muted-foreground")}>
          {item.value}
          <span className="ml-1 text-[12px] font-medium tracking-normal text-muted-foreground">{unit}</span>
        </span>
      </div>
      <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={reduce ? undefined : { width: 0 }}
          whileInView={{ width: `${Math.min(100, (item.value / max) * 100)}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
          className={cn("h-full rounded-full", tone === "you" ? "bg-foreground" : "bg-muted-foreground/40")}
        />
      </div>
      <span className="sr-only">{item.value} out of {max} {unit}</span>
    </div>
  )

  return (
    <section className={cn("relative isolate w-full overflow-hidden", className)}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (760), ["--shell-w" as string]: `${(760)}px` }}>

      <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
      <h2 className="mt-3 font-display text-[28px] font-semibold leading-[1.05] tracking-[-0.022em] text-foreground sm:text-[34px]">{title}</h2>
      {subtitle && <p className="mt-2 max-w-[48ch] text-[13px] leading-6 text-muted-foreground">{subtitle}</p>}

      <div className="mt-8 space-y-6">
        <Row item={you} tone="you" delay={0.08} />
        <Row item={industry} tone="ind" delay={0.18} />
      </div>

      <div className="mt-8 flex items-start gap-4 rounded-xl border bg-card p-4 shadow-sm">
        <span
          aria-hidden
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-lg border font-display text-[15px] font-semibold tabular-nums",
            ahead ? "border-success/20 bg-success-muted text-success" : "border-border bg-muted text-muted-foreground",
          )}
        >
          {ahead ? `+${gap}` : gap}
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold leading-6 text-foreground">
            {Math.abs(gap)} point{gap === 1 || gap === -1 ? "" : "s"} {ahead ? "ahead of" : "behind"} the median
          </p>
          <p className="text-[13px] leading-5 text-muted-foreground">
            {ahead ? "The gap is widening — the system is pulling your way." : "Within striking distance. The next improvement closes it."}
          </p>
        </div>
      </div>

      <p className="mt-3 font-mono text-[11px] font-medium tracking-wide text-muted-foreground">Scale 0–{max} · Values are live props, bars animate once on enter.</p>
    
  </div>
</section>
  )
}
