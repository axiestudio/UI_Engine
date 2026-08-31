import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { SlidingNumber } from "@/components/primitives/sliding-number"

export type TrendPoint = { label: string; value: number }

export type TrendScrubProps = {
  title?: string
  subtitle?: string
  unit?: string
  points?: TrendPoint[]
  className?: string
}

const DEFAULT_POINTS: TrendPoint[] = Array.from({ length: 24 }, (_, i) => ({
  label: `W${i + 1}`,
  value: Math.round(40 + Math.sin(i / 3.1) * 22 + i * 1.4),
}))

export function TrendScrub({
  title = "Weekly signups — 26 weeks",
  subtitle = "Scrub the line to inspect any week. Arrow keys work when focused.",
  unit = "signups",
  points = DEFAULT_POINTS,
  className,
}: TrendScrubProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [index, setIndex] = React.useState(points.length - 1)
  const [isDragging, setIsDragging] = React.useState(false)

  const reduce = React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )

  // pointer position (0 .. width) — spring only when not reducing motion
  const mx = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 420, damping: 36 })
  const crossX = useTransform(sx, (v) => `${v}px`)

  const max = React.useMemo(() => Math.max(...points.map((p) => p.value)), [points])
  const min = React.useMemo(() => Math.min(...points.map((p) => p.value)), [points])
  const W = 100
  const H = 100

  const path = React.useMemo(() => {
    return points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * W
        const y = H - ((p.value - min) / (max - min || 1)) * (H - 12) - 6
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`
      })
      .join(" ")
  }, [points, min, max])

  // keep crosshair synced to selected index (keyboard + initial)
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const w = el.clientWidth
    if (!w) return
    const x = (index / Math.max(1, points.length - 1)) * w
    mx.set(x)
  }, [index, points.length, mx])

  // also sync on resize
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth
      const x = (index / Math.max(1, points.length - 1)) * w
      mx.set(x)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [index, points.length, mx])

  const locate = React.useCallback(
    (clientX: number) => {
      const el = containerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
      const i = Math.round(t * (points.length - 1))
      setIndex(i)
      mx.set(t * r.width)
    },
    [points.length, mx],
  )

  const handlePointerDown = (e: React.PointerEvent) => {
    if (reduce) return
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    setIsDragging(true)
    locate(e.clientX)
  }
  const handlePointerMove = (e: React.PointerEvent) => {
    if (reduce) return
    if (isDragging || e.pointerType !== "mouse") locate(e.clientX)
    else locate(e.clientX)
  }
  const handlePointerUp = () => setIsDragging(false)

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault()
      setIndex((prev) => Math.min(points.length - 1, prev + 1))
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      setIndex((prev) => Math.max(0, prev - 1))
    } else if (e.key === "Home") {
      e.preventDefault()
      setIndex(0)
    } else if (e.key === "End") {
      e.preventDefault()
      setIndex(points.length - 1)
    }
  }

  const pt = points[index] ?? points[0]
  if (!points.length) {
    return (
      <SectionShell width={920} className={className}>
        <MonoLabel className="text-muted-foreground">TREND · SCRUB</MonoLabel>
        <h2 className="mt-2 font-display text-[28px] font-semibold tracking-[-0.022em] text-foreground sm:text-[34px]">{title}</h2>
        <p className="mt-6 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No data points.</p>
      </SectionShell>
    )
  }

  return (
    <SectionShell width={920} className={className}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <MonoLabel className="text-muted-foreground">TREND · SCRUB</MonoLabel>
          <h2 className="mt-3 font-display text-[28px] font-semibold leading-[1.05] tracking-[-0.022em] text-foreground sm:text-[34px]">
            {title}
          </h2>
          <p className="mt-2 max-w-[48ch] text-[13px] leading-6 text-muted-foreground">{subtitle}</p>
        </div>

        <div
          aria-live="polite"
          aria-atomic="true"
          className="shrink-0 rounded-xl border bg-card px-5 py-4 text-right shadow-sm"
        >
          <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {pt.label} · {unit}
          </span>
          <span className="mt-1 flex items-baseline justify-end gap-2 font-display text-[28px] font-semibold tabular-nums leading-none tracking-[-0.02em] text-foreground">
            <SlidingNumber value={pt.value} />
            <span className="text-[13px] font-medium tracking-normal text-muted-foreground">{unit}</span>
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-label="Scrub the weekly trend. Use arrow keys, Home, End."
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={pt.value}
        aria-valuetext={`${pt.value} ${unit} at ${pt.label}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => setIsDragging(false)}
        onKeyDown={onKeyDown}
        className="relative mt-8 h-[320px] touch-none select-none rounded-xl border bg-card shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {/* grid */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full">
          <g className="text-chart-grid">
            {[0, 25, 50, 75, 100].map((y) => (
              <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="currentColor" strokeWidth="0.3" opacity="0.9" />
            ))}
          </g>
          {/* area */}
          <motion.path
            d={`${path} L100 100 L0 100 Z`}
            fill="hsl(var(--foreground))"
            fillOpacity={0.04}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          />
          {/* line */}
          <motion.path
            d={path}
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeWidth="1.6"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? undefined : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>

        {/* crosshair — only when not reduce, otherwise static dot */}
        {!reduce ? (
          <>
            <motion.span
              aria-hidden
              style={{ left: crossX }}
              className="pointer-events-none absolute inset-y-0 w-px bg-foreground/15"
            />
            <motion.span
              aria-hidden
              style={{ left: crossX }}
              className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow-sm"
            />
          </>
        ) : (
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
            style={{
              left: `${(index / Math.max(1, points.length - 1)) * 100}%`,
              top: `${(() => {
                const v = points[index]?.value ?? min
                return H - ((v - min) / (max - min || 1)) * (H - 12) - 6
              })()}%`,
            }}
          />
        )}

        {/* inset padding for hit area label */}
        <div className="pointer-events-none absolute inset-x-4 bottom-3 flex justify-between font-mono text-[11px] font-medium tracking-[0.08em] text-muted-foreground/70">
          <span>{points[0].label}</span>
          <span className="hidden sm:inline">{points[Math.floor(points.length / 2)].label}</span>
          <span>{points[points.length - 1].label}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="font-mono text-[11px] font-medium tracking-wide text-muted-foreground">
          Hover or drag to inspect · <span className="hidden sm:inline">Focus then use ← → Home End</span>
        </p>
        <span className="hidden font-mono text-[11px] tabular-nums text-muted-foreground sm:block">
          {index + 1} / {points.length}
        </span>
      </div>
    </SectionShell>
  )
}
