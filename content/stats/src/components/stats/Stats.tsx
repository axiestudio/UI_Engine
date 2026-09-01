import * as React from "react"
import { motion, useInView, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react"
import { BorderTrail } from "@/components/primitives/border-trail"

import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type StatItem = {
  /** Numeric values count up when scrolled into view; strings render as-is. */
  value: number | string
  label: string
  /** e.g. "%" or "k" — appended after a (count-up) number. */
  suffix?: string
  prefix?: string
  /** decimals for count-up animation. Default 0. */
  decimals?: number
  /** Optional supporting line. */
  description?: string
  icon?: React.ElementType
  id?: string
}

export type StatsProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  items: StatItem[]
  /** ink = dark band with light type; paper = bordered tiles on light bg. */
  tone?: "paper" | "ink"
  /** 2 / 3 / 4 columns on desktop. Default 4 (clamped to items length). */
  columns?: 2 | 3 | 4
  /** Separator lines between tiles. Default true with ink tone. */
  separators?: boolean
  className?: string
}

// ── Sub components ───────────────────────────────────────────────────────────

function CountUp({ value, decimals }: { value: number; decimals: number }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const reduce = useReducedMotion()
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { stiffness: 50, damping: 20 })
  const text = useTransform(spring, (v) => (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString()))
  React.useEffect(() => {
    if (inView) mv.set(value)
  }, [inView, mv, value])
  return (
    <span ref={ref} className="tabular-nums">
      {reduce ? (decimals ? value.toFixed(decimals) : value.toLocaleString()) : <motion.span>{text}</motion.span>}
    </span>
  )
}

function StatTile({ item, tone, separators, index }: { item: StatItem; tone: "paper" | "ink"; separators?: boolean; index: number }) {
  const Icon = item.icon
  const ink = tone === "ink"
  return (
    <div
      id={item.id}
      className={cn(
        "relative flex flex-col px-6 py-8",
        separators && (tone === "ink" ? "border-background/10" : "border-border"),
        separators && index > 0 && "border-t",
        separators && "sm:border-t-0 sm:border-l sm:first:border-l-0",
      )}
    >
      {separators && <BorderTrail size={40} className="absolute inset-x-0 top-0 h-px" style={{ background: "transparent", backgroundColor: "transparent" }} />}
      <span className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.2em] opacity-60", cn("absolute right-4 top-4", ink ? "text-background/35" : "text-muted-foreground/50"))}>index + 1<span className="opacity-50"> / undefined</span></span>
      <p className={cn("font-display text-[40px] font-bold leading-none tracking-[-0.04em] tabular-nums sm:text-[52px]", ink ? "text-background" : "text-foreground")}>
        {item.prefix}
        {typeof item.value === "number" ? <CountUp value={item.value} decimals={item.decimals ?? 0} /> : item.value}
        {item.suffix && <span className={cn("text-[22px] font-bold sm:text-[26px]", ink ? "text-background/70" : "text-muted-foreground")}>{item.suffix}</span>}
      </p>
      <p className={cn("mt-3 flex items-center gap-1.5 font-display text-sm font-bold tracking-tight", ink ? "text-background/90" : "text-foreground")}>
        {Icon && <Icon className={cn("h-4 w-4", ink ? "text-background/60" : "text-muted-foreground")} />}
        {item.label}
      </p>
      {item.description && <p className={cn("mt-1.5 text-xs font-medium leading-relaxed", ink ? "text-background/60" : "text-muted-foreground")}>{item.description}</p>}
    </div>
  )
}

// ── Stats ────────────────────────────────────────────────────────────────────

export function Stats({
  eyebrow,
  title,
  subtitle,
  items,
  tone = "ink",
  columns = 4,
  separators,
  className,
}: StatsProps) {
  if (!items.length) return null
  const cols = Math.min(columns, items.length)
  const sep = separators ?? tone === "ink"

  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[var(--shell-w)] -translate-x-1/2 border-x lg:block", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      {(eyebrow || title || subtitle) && (
        <InView variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
            <header className={cn("relative")}>
  <span aria-hidden className={cn("pointer-events-none absolute -top-10 right-0 select-none font-display text-[120px] font-black leading-none tracking-[-0.05em] [-webkit-text-stroke:1.5px_currentColor] [color:transparent] opacity-[0.07] sm:text-[160px]", tone === 'ink' ? "text-background" : "text-foreground")}>06</span>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
        </InView>
      )}

        <div className={cn("overflow-hidden border", tone === "ink" ? "border-background/15" : "border-border bg-card shadow-sm")}>
          <div className={cn("grid grid-cols-1 sm:grid-cols-2", cols === 2 && "sm:grid-cols-2", cols === 3 && "sm:grid-cols-2 lg:grid-cols-3", cols === 4 && "sm:grid-cols-2 lg:grid-cols-4")} data-cols={cols}>
              {items.map((item, i) => (
                <InView
                  key={item.id ?? item.label}
                  as="div"
                  variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.3), ease: [0.16, 1, 0.3, 1] }}
                  viewOptions={{ once: true, margin: "-40px" }}
                >
                  <StatTile item={item} tone={tone} separators={sep} index={i} />
                </InView>
              ))}
          </div>
        </div>
    
  </div>
</section>
  )
}
