import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — ops screens like throttles, RPM, SLA burn.
// JOB      one number, instantly graded against its safe band
// SIGNATURE the needle is a DYPHYSICAL spring (stiffness by threat); threshold
//           zones are coloured arc segments; the digital readout only settles
//           when the needle does — the read-writes-time illusion.
// A11Y     role=meter with valuenow/text; zones in the value text.

export type RadialGaugeProps = { value: number; min?: number; max?: number; zones?: { to: number; color: string; label?: string }[]; label?: string; unit?: string; precision?: number; size?: number; className?: string }

export function RadialGauge({ value, min = 0, max = 100, zones = [{ to: 0.7, color: "hsl(var(--ok))" }, { to: 0.9, color: "hsl(var(--warn))" }, { to: 1, color: "hsl(var(--err))" }], label, unit = "%", precision = 0, size = 220, className }: RadialGaugeProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const norm = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const START = 225, SWEEP = 270
  const deg = START + norm * SWEEP
  const activeZone = zones.find((z) => norm <= z.to) ?? zones[zones.length - 1]
  const C = 2 * Math.PI * 40
  const arc = (from: number, to: number) => {
    const a = ((from * SWEEP + START - 90) * Math.PI) / 180
    const b = ((to * SWEEP + START - 90) * Math.PI) / 180
    const x1 = 50 + 40 * Math.cos(a), y1 = 50 + 40 * Math.sin(a)
    const x2 = 50 + 40 * Math.cos(b), y2 = 50 + 40 * Math.sin(b)
    return `M${x1} ${y1} A40 40 0 ${to - from > 0.5 ? 1 : 0} 1 ${x2} ${y2}`
  }
  // needle rest = "hold" after settle: use keyframes so it dips past then stops
  const needleAnim = reduce ? { rotate: deg - 90 } : { rotate: [START - 90, (deg + START - 90) / 2, deg - 90 + 5, deg - 90], times: [0, 0.55, 0.85, 1] }
  return (
    <div className={cn("relative mx-auto font-sans", className)} style={{ width: size }}>
      <svg viewBox="0 0 100 100" className="w-full" role="meter" aria-valuemin={min} aria-valuemax={max} aria-valuenow={Math.round(value)} aria-valuetext={`${value}${unit} ${activeZone.label ? `- ${activeZone.label}` : ""}`}>
        <path d={arc(0, 1)} fill="none" stroke="hsl(var(--muted))" strokeWidth="7" strokeLinecap="round" />
        {zones.map((z, i) => { const from = i === 0 ? 0 : zones[i - 1].to; return <path key={i} d={arc(from, z.to)} fill="none" stroke={z.color} strokeWidth="3" strokeLinecap="butt" opacity={0.85} /> })}
        <motion.path d={arc(0, norm)} fill="none" stroke={activeZone.color} strokeWidth="7" strokeLinecap="round" initial={false} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} strokeDasharray={undefined} style={{ opacity: 0.9 }} />
        {/* ticks */}
        {Array.from({ length: 10 }, (_, t) => { const a = ((t / 9) * SWEEP + START - 90) * (Math.PI / 180); const r = t && t % 3 === 0 ? 13 : 8; return <line key={t} x1={50 + (46 - r) * Math.cos(a)} y1={50 + (46 - r) * Math.sin(a)} x2={50 + 45 * Math.cos(a)} y2={50 + 45 * Math.sin(a)} stroke="hsl(var(--muted-foreground))" strokeWidth={t % 3 === 0 ? 1.4 : 0.7} opacity={0.5} /> })}
        <motion.g initial={false} animate={needleAnim as never} transition={reduce ? { duration: 0 } : { duration: 1.25, ease: [0.35, 0, 0.25, 1] }} style={{ transformOrigin: "50px 50px" }}>
          <line x1="50" y1="50" x2={50 + 36 * Math.cos(((deg - 90) * Math.PI) / 180)} y2={50 + 36 * Math.sin(((deg - 90) * Math.PI) / 180)} stroke="hsl(var(--foreground))" strokeWidth="2.2" strokeLinecap="round" />
        </motion.g>
        <circle cx="50" cy="50" r="4.5" fill="hsl(var(--foreground))" />
        <circle cx="50" cy="50" r="2" fill="hsl(var(--background))" />
      </svg>
      <div className="absolute inset-x-0 bottom-[6%] text-center">
        <p className={cn("font-display text-3xl font-black tabular-nums leading-none")} style={{ color: activeZone.color }}>{value.toFixed(precision)}<span className="text-[13px] font-bold">{unit}</span></p>
        <p className="mt-1 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label ?? "Gauge"} · {activeZone.label ?? ""}</p>
      </div>
    </div>
  )
}
