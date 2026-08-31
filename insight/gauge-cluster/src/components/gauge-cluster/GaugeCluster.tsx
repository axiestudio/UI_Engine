import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell, Ordinal } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      read a fleet's vitals in one glance
// ═══ EMOTION  cockpit confidence — needles, not noise
// ═══ SIGNATURE radial gauges with spring needles that overshoot then
//               settle; threshold arcs tint; hover prints the exact value
//   SITE      → performance/infra proof pages
//   APP       → monitoring dashboards; gauges re-tick via props
//   A11Y      role=meter per gauge; sr text; needles decorative

export type Gauge = { label: string; value: number; max: number; unit?: string; warn?: number; danger?: number }

export type GaugeClusterProps = {
  gauges?: Gauge[]
  className?: string
}

const DEFAULT_GAUGES: Gauge[] = [
  { label: "CPU", value: 62, max: 100, unit: "%", warn: 70, danger: 90 },
  { label: "Memory", value: 81, max: 100, unit: "%", warn: 75, danger: 90 },
  { label: "Disk I/O", value: 34, max: 100, unit: "%", warn: 80 },
  { label: "Queue depth", value: 145, max: 500, warn: 300, danger: 450 },
]

function GaugeDial({ g, index }: { g: Gauge; index: number }) {
  const pct = Math.min(1, g.value / g.max)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const zone = g.danger && pct >= g.danger / g.max ? "danger" : g.warn && pct >= g.warn / g.max ? "warn" : "ok"
  const needle = -120 + pct * 240
  const R = 54
  const arc = (from: number, to: number) => {
    const a1 = ((-120 + from * 240) - 90) * (Math.PI / 180)
    const a2 = ((-120 + to * 240) - 90) * (Math.PI / 180)
    return `M ${60 + R * Math.cos(a1)} ${60 + R * Math.sin(a1)} A ${R} ${R} 0 0 1 ${60 + R * Math.cos(a2)} ${60 + R * Math.sin(a2)}`
  }
  const ZONE: Record<string, string> = { ok: "text-foreground", warn: "text-amber-500", danger: "text-red-500" }
  return (
    <InView once delay={index * 0.08}>
      <figure className="flex flex-col items-center rounded-2xl border bg-card p-6">
        <div className="relative" role="meter" aria-valuemin={0} aria-valuemax={g.max} aria-valuenow={g.value} aria-label={`${g.label}: ${g.value} ${g.unit ?? ""}`}>
          <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden>
            <path d={arc(0, 1)} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-border" />
            <motion.path d={arc(0, pct)} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className={ZONE[zone]}
              initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} />
            {Array.from({ length: 9 }, (_, t) => {
              const a = ((-120 + (t / 8) * 240) - 90) * (Math.PI / 180)
              return <line key={t} x1={60 + (R - 12) * Math.cos(a)} y1={60 + (R - 12) * Math.sin(a)} x2={60 + (R - 6) * Math.cos(a)} y2={60 + (R - 6) * Math.sin(a)} stroke="currentColor" strokeWidth="1.6" className="text-muted-foreground/50" />
            })}
          </svg>
          {/* needle */}
          <motion.div
            aria-hidden
            initial={reduce ? { rotate: needle } : { rotate: -120 }}
            whileInView={{ rotate: needle }}
            viewport={{ once: true }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 9, delay: 0.3 + index * 0.08 }}
            style={{ transformOrigin: "60px 60px" }}
            className="absolute inset-0"
          >
            <span className="absolute left-1/2 top-[14px] h-[46px] w-[3px] -translate-x-1/2 rounded-full bg-foreground" />
          </motion.div>
          <span className="absolute inset-0 grid place-items-center pt-6 font-display text-xl font-black tabular-nums text-foreground">
            {g.value}<span className="text-[10px] font-bold text-muted-foreground">{g.unit}</span>
          </span>
        </div>
        <figcaption className="mt-3 flex items-center gap-2">
          <Ordinal n={index + 1} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{g.label}</span>
        </figcaption>
      </figure>
    </InView>
  )
}

export function GaugeCluster({ gauges = DEFAULT_GAUGES, className }: GaugeClusterProps) {
  return (
    <SectionShell width={920} className={className}>
      <MonoLabel className="text-muted-foreground">VITALS · COCKPIT</MonoLabel>
      <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">Needles over noise.</h2>
      <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {gauges.map((g, i) => <GaugeDial key={g.label} g={g} index={i} />)}
      </div>
    </SectionShell>
  )
}
