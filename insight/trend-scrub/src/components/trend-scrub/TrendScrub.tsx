import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { SlidingNumber } from "@/components/primitives/sliding-number"

// ═══ JOB      let a visitor interrogate the trend with their own hand
// ═══ EMOTION  instrument-panel control — the data answers your cursor
// ═══ SIGNATURE pointer-scrubbed chart: a crosshair follows the pointer,
//               morphing readout reveals the exact value at that x
//   SITE      → case studies, performance pages
//   APP       → analytics surfaces; data + labels are props
//   A11Y      keyboard arrow scrubbing; readout is aria-live; chart decorative

export type TrendPoint = { label: string; value: number }

export type TrendScrubProps = {
  title?: string
  unit?: string
  points?: TrendPoint[]
  className?: string
}

const DEFAULT_POINTS: TrendPoint[] = Array.from({ length: 24 }, (_, i) => ({
  label: `W${i + 1}`,
  value: Math.round(40 + Math.sin(i / 3.1) * 22 + i * 1.4),
}))

export function TrendScrub({ title = "Weekly signups — 26 weeks", unit = "signups", points = DEFAULT_POINTS, className }: TrendScrubProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [index, setIndex] = React.useState(points.length - 1)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const mx = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 250, damping: 28 })
  const crossX = useTransform(sx, (v) => `${v}px`)

  const max = Math.max(...points.map((p) => p.value)), min = Math.min(...points.map((p) => p.value))
  const W = 100, H = 100
  const path = points.map((p, i) => {
    const x = (i / (points.length - 1)) * W
    const y = H - ((p.value - min) / (max - min || 1)) * (H - 12) - 6
    return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(" ")

  const locate = (clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    const i = Math.round(t * (points.length - 1))
    setIndex(i)
    mx.set(t * r.width)
  }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { setIndex((i) => Math.min(points.length - 1, i + 1)); mx.set((index + 1) / (points.length - 1) * (containerRef.current?.clientWidth ?? 0)) }
    if (e.key === "ArrowLeft") { setIndex((i) => Math.max(0, i - 1)); mx.set((index - 1) / (points.length - 1) * (containerRef.current?.clientWidth ?? 0)) }
  }
  const pt = points[index]

  return (
    <SectionShell width={920} className={className}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <MonoLabel className="text-muted-foreground">TREND · SCRUB ME</MonoLabel>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground">{title}</h2>
        </div>
        <p aria-live="polite" className="rounded-xl border bg-card px-5 py-3 text-right">
          <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{pt.label}</span>
          <span className="font-display text-3xl font-black tabular-nums text-foreground">
            <SlidingNumber value={pt.value} /> <span className="text-sm font-bold text-muted-foreground">{unit}</span>
          </span>
        </p>
      </div>

      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-label="Scrub the trend. Use arrow keys."
        aria-valuemin={min} aria-valuemax={max} aria-valuenow={pt.value} aria-valuetext={`${pt.value} ${unit} at ${pt.label}`}
        onPointerMove={(e) => !reduce && locate(e.clientX)}
        onKeyDown={onKey}
        className="relative mt-8 h-64 touch-none rounded-2xl border bg-card outline-none ring-ring focus-visible:ring-2"
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full px-4 py-4">
          {[25, 50, 75].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.4" className="text-foreground" />)}
          <motion.path d={`${path} L100 100 L0 100 Z`} fill="currentColor" fillOpacity="0.06" className="text-foreground"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} />
          <motion.path d={path} fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" strokeLinecap="round" className="text-foreground"
            initial={reduce ? {} : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />
        </svg>
        {/* crosshair */}
        <motion.span aria-hidden style={{ left: crossX }} className="pointer-events-none absolute inset-y-3 w-px bg-foreground/50" />
        <motion.span aria-hidden style={{ left: crossX }} className="pointer-events-none absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow" />
      </div>
      <div className="mt-3 flex justify-between font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        <span>{points[0].label}</span><span>{points[Math.floor(points.length / 2)].label}</span><span>{points[points.length - 1].label}</span>
      </div>
    </SectionShell>
  )
}
