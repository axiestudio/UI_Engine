import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell, Ordinal } from "@/components/primitives/handcraft"

export type Gauge = { label: string; value: number; max: number; unit?: string; warn?: number; danger?: number }

export type GaugeClusterProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
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
  const pct = Math.min(1, Math.max(0, g.value / g.max))
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const zone: "ok" | "warn" | "danger" =
    g.danger != null && pct >= g.danger / g.max ? "danger" : g.warn != null && pct >= g.warn / g.max ? "warn" : "ok"
  const needle = -120 + pct * 240
  const R = 54
  const arc = (from: number, to: number) => {
    const a1 = ((-120 + from * 240) - 90) * (Math.PI / 180)
    const a2 = ((-120 + to * 240) - 90) * (Math.PI / 180)
    return `M ${60 + R * Math.cos(a1)} ${60 + R * Math.sin(a1)} A ${R} ${R} 0 0 1 ${60 + R * Math.cos(a2)} ${60 + R * Math.sin(a2)}`
  }
  const ZONE: Record<string, string> = {
    ok: "text-foreground",
    warn: "text-warning",
    danger: "text-destructive",
  }
  const ZONE_BG: Record<string, string> = {
    ok: "bg-muted",
    warn: "bg-warning-muted text-warning-foreground",
    danger: "bg-destructive/10 text-destructive border-destructive/20",
  }

  return (
    <div className="flex flex-col items-center rounded-xl border bg-card p-5 shadow-sm">
      <div className="relative" role="meter" aria-valuemin={0} aria-valuemax={g.max} aria-valuenow={g.value} aria-valuetext={`${g.value} ${g.unit ?? ""} — ${zone}`}>
        <svg width="132" height="132" viewBox="0 0 120 120" aria-hidden className="block">
          <path d={arc(0, 1)} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" className="text-border" />
          <motion.path
            d={arc(0, pct)}
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            className={ZONE[zone]}
            initial={reduce ? undefined : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
          />
          {Array.from({ length: 9 }, (_, t) => {
            const a = ((-120 + (t / 8) * 240) - 90) * (Math.PI / 180)
            return (
              <line
                key={t}
                x1={60 + (R - 11) * Math.cos(a)}
                y1={60 + (R - 11) * Math.sin(a)}
                x2={60 + (R - 5) * Math.cos(a)}
                y2={60 + (R - 5) * Math.sin(a)}
                stroke="currentColor"
                strokeWidth={t % 2 === 0 ? 1.4 : 1}
                className="text-muted-foreground/40"
              />
            )
          })}
        </svg>

        {/* needle */}
        <motion.div
          aria-hidden
          initial={reduce ? { rotate: needle } : { rotate: -120 }}
          whileInView={{ rotate: needle }}
          viewport={{ once: true }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 18, delay: 0.2 + index * 0.06 }}
          style={{ transformOrigin: "66px 66px" }}
          className="absolute inset-0"
        >
          <span className="absolute left-1/2 top-[14px] h-[44px] w-[2.5px] -translate-x-1/2 rounded-full bg-foreground" />
          <span className="absolute left-1/2 top-[60px] size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow" />
        </motion.div>

        <span className="pointer-events-none absolute inset-0 grid place-items-center pt-7">
          <span className="font-display text-[20px] font-semibold tabular-nums leading-none tracking-[-0.02em] text-foreground">
            {g.value}
            <span className="ml-0.5 text-[11px] font-medium tracking-normal text-muted-foreground">{g.unit}</span>
          </span>
        </span>
      </div>

      <div className="mt-3 flex w-full items-center justify-between gap-3">
        <span className="min-w-0 truncate font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{g.label}</span>
        <span className={cn("shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]", ZONE_BG[zone])}>
          {zone === "ok" ? "Nominal" : zone === "warn" ? "Watch" : "Action"}
        </span>
      </div>
      <span className="mt-1 font-mono text-[11px] tabular-nums text-muted-foreground">
        {g.value} / {g.max} {g.unit ?? ""}
      </span>
    </div>
  )
}

export function GaugeCluster({
  eyebrow = "VITALS · COCKPIT",
  title = "System resources",
  subtitle = "Current utilization against warning and critical thresholds.",
  gauges = DEFAULT_GAUGES,
  className,
}: GaugeClusterProps) {
  return (
    <SectionShell width={920} className={className}>
      <div className="max-w-xl">
        <MonoLabel className="text-muted-foreground">{eyebrow}</MonoLabel>
        <h2 className="mt-3 font-display text-[28px] font-semibold leading-[1.05] tracking-[-0.022em] text-foreground sm:text-[34px]">{title}</h2>
        <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{subtitle}</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {gauges.map((g, i) => (
          <GaugeDial key={g.label} g={g} index={i} />
        ))}
      </div>

      <p className="mt-4 font-mono text-[11px] font-medium tracking-wide text-muted-foreground">
        Each gauge is a <span className="font-semibold text-foreground">role=meter</span> · Needle settles with a spring, disabled when reduced-motion is on.
      </p>
    </SectionShell>
  )
}
