import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — "where did my storage GO?" answered with one ring.
// JOB      show a quota split across categories, legibly
// SIGNATURE a single stacked ring (arc per category); hovering a legend row
//           lifts its arc outward 4px and dims the rest; total % counts up in
//           the middle; >85% gets a warning wash behind the ring.
// API      segments [{label, bytes, color?}] + quotaBytes.
// A11Y     legend carries the numbers; ring is aria-hidden; live region for %.

export type RingSeg = { label: string; bytes: number; color?: string }
export type StorageRingMeterProps = { segments: RingSeg[]; quota: number; label?: string; resetNote?: string; className?: string }

const human = (b: number) => b >= 1073741824 ? (b / 1073741824).toFixed(1) + " GB" : b >= 1048576 ? Math.round(b / 1048576) + " MB" : Math.round(b / 1024) + " KB"

export function StorageRingMeter({ segments, quota, label = "STORAGE USED", resetNote, className }: StorageRingMeterProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [hi, setHi] = React.useState<number | null>(null)
  const used = segments.reduce((a, s) => a + s.bytes, 0)
  const pct = Math.min(1, used / quota)
  const R = 46
  const C = 2 * Math.PI * R
  const pal = ["hsl(var(--info))", "hsl(var(--pinned))", "hsl(var(--warn))", "hsl(var(--ok))", "hsl(var(--err))"]
  let acc = 0
  return (
    <div className={cn("flex items-center gap-6 font-sans", className)}>
      <div className="relative size-[150px] shrink-0">
        {pct > 0.85 && <motion.span aria-hidden animate={{ opacity: [0.18, 0.34, 0.18] }} transition={{ duration: 2.4, repeat: Infinity }} className="absolute inset-0 rounded-full bg-[hsl(var(--warn)/0.35)] blur-2xl" />}
        <svg viewBox="0 0 110 110" className="size-full -rotate-90" aria-hidden>
          <circle cx="55" cy="55" r={R} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
          {segments.map((s, i) => {
            const frac = s.bytes / quota
            const dash = frac * C
            const off = acc * C
            acc += frac
            return (
              <motion.circle
                key={s.label}
                cx="55" cy="55" r={R} fill="none"
                stroke={s.color ?? pal[i % pal.length]}
                strokeWidth={hi === i ? 12 : 10}
                strokeLinecap="butt"
                initial={reduce ? false : { strokeDasharray: `0 ${C}` }}
                animate={{ strokeDasharray: `${Math.max(0.5, dash)} ${C - dash}`, strokeDashoffset: -off, scale: hi === i ? 1.05 : hi !== null ? 0.985 : 1 }}
                transition={{ strokeDasharray: { duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }, scale: { duration: 0.2 } }}
                style={{ transformOrigin: "55px 55px" }}
                opacity={hi !== null && hi !== i ? 0.38 : 1}
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <motion.p aria-hidden className="font-display text-2xl font-black tabular-nums leading-none" initial={false} animate={{}}>{Math.round(pct * 100)}<span className="text-[11px]">%</span></motion.p>
          <p className="mt-1 font-mono text-[8px] font-black uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-1">
        {segments.map((s, i) => (
          <li key={s.label} onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(null)}>
            <button type="button" className={cn("flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[12px] transition-colors hover:bg-muted/60", hi === i && "bg-muted/80")}>
              <span aria-hidden className="size-2.5 shrink-0 rounded-[3px]" style={{ background: s.color ?? pal[i % pal.length] }} />
              <span className="min-w-0 flex-1 truncate font-semibold">{s.label}</span>
              <span className="font-mono tabular-nums text-muted-foreground">{human(s.bytes)}</span>
            </button>
          </li>
        ))}
        <li className="flex items-center justify-between px-2 pt-1 text-[11px] text-muted-foreground">
          <span>{pct >= 1 ? "over quota" : `${human(quota - used)} free`}</span>
          {resetNote && <span className="font-mono text-[9px] uppercase tracking-[0.14em]">{resetNote}</span>}
        </li>
      </ul>
      <p className="sr-only" aria-live="polite">{human(used)} of {human(quota)} used.</p>
    </div>
  )
}
