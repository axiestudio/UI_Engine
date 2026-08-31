import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — analytics funnels that explain their own drops.
// JOB      show conversion between stages as one honest bar
// SIGNATURE each stage expands from the previous stage's edge (share % of the
//           top stage), the DROP-OFF wedge sits between stages labelled with
//           absolute lost count + %, and the hovered stage dims its siblings.
// API      stages [{label, value}] — we derive the rest.
// A11Y     every bar is a list item; values are visible text, not tooltips.

export type FunnelStage = { label: string; value: number }
export type FunnelStageBarsProps = { stages: FunnelStage[]; eyebrow?: string; topLabel?: string; className?: string }

export function FunnelStageBars({ stages, eyebrow = "CONVERSION FUNNEL", topLabel, className }: FunnelStageBarsProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [hi, setHi] = React.useState<number | null>(null)
  const top = Math.max(1, stages[0]?.value ?? 1)
  let cumulative = 1
  return (
    <figure className={cn("font-sans", className)}>
      <figcaption className="mb-4 flex items-baseline justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
        {topLabel && <p className="text-sm font-medium">{topLabel}: <span className="font-semibold text-[hsl(var(--info))]">{(((stages.at(-1)?.value ?? 0) / top) * 100).toFixed(1)}%</span></p>}
      </figcaption>
      <ol className="space-y-3">
        {stages.map((st, i) => {
          const prev = i === 0 ? st.value : stages[i - 1].value
          const share = st.value / top
          const drop = prev - st.value
          cumulative = share
          return (
            <li key={st.label} onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(null)} className={cn("transition-opacity", hi !== null && hi !== i && "opacity-45")}>
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{st.label}</span>
                <span className="tabular-nums text-muted-foreground">{st.value.toLocaleString()}<span className="ml-1.5">({(share * 100).toFixed(0)}%)</span></span>
              </div>
              <div className="relative mt-1 h-8 rounded-md bg-muted/50">
                {i > 0 && drop > 0 && (
                  <div aria-hidden className="absolute inset-y-0 right-0 flex items-center justify-end pr-2" style={{ width: `${((prev - st.value) / top) * 100}%` }}>
                    <span className="font-mono text-[10px] font-semibold text-[hsl(var(--err))]">−{drop.toLocaleString()}</span>
                  </div>
                )}
                <motion.div initial={reduce ? { width: `${share * 100}%` } : { width: 0 }} whileInView={{ width: `${share * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-y-0 left-0 rounded-md" style={{ background: `linear-gradient(90deg, hsl(var(--info) / ${0.95 - i * 0.13}), hsl(var(--info) / ${0.65 - i * 0.1}))` }} />
              </div>
            </li>
          )
        })}
      </ol>
    </figure>
  )
}
