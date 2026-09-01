import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export interface WaveformProps {
  /** Number of sample points driving the wave + bars. Default: 120 */
  samples?: number
  /** Morph speed multiplier for the rAF loop. Default: 0.6 */
  speed?: number
  /** Wave amplitude as a fraction of the height. Default: 0.4 */
  amplitude?: number
  /** Height of the waveform stage in px. Default: 120 */
  height?: number
  /** Primary ink for the wave line + bars. Default: var(--chart-line-primary) */
  color?: string
  /** Show mirrored level bars behind the line. Default: true */
  showBars?: boolean
  /** Show the dashed horizontal centreline. Default: true */
  showCenterline?: boolean
  /** Freeze the wave on a static frame. Default: false */
  paused?: boolean
  /** Mono uppercase kicker label, e.g. "SIGNAL" (rendered as "/// SIGNAL") */
  label?: string
  className?: string
}

const VB_W = 1000
const VB_H = 100

/** Deterministic per-sample pseudo-noise in [0, 1] — stable across frames. */
function hashNoise(i: number) {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

/** Layered sine + seeded jitter field, in [-1, 1]. */
function sampleAt(i: number, count: number, phase: number) {
  const u = count > 1 ? i / (count - 1) : 0.5
  const wobble =
    0.55 * Math.sin(u * Math.PI * 6 + phase * 2.1) +
    0.28 * Math.sin(u * Math.PI * 13 - phase * 1.35 + 1.7) +
    0.17 * Math.sin(u * Math.PI * 27 + phase * 3.4 + 4.2)
  const jitter = (hashNoise(i) - 0.5) * (0.55 + 0.35 * Math.sin(phase * 0.9 + u * 5))
  return Math.max(-1, Math.min(1, wobble + jitter))
}

function buildLineD(count: number, phase: number, ampUnits: number) {
  let d = ""
  for (let i = 0; i < count; i++) {
    const x = (count > 1 ? i / (count - 1) : 0.5) * VB_W
    const y = VB_H / 2 - sampleAt(i, count, phase) * ampUnits
    d += `${i === 0 ? "M" : " L"} ${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return d
}

function buildBarsD(count: number, phase: number, ampUnits: number) {
  const slot = VB_W / count
  const w = Math.max(1, slot * 0.42)
  const c = VB_H / 2
  let d = ""
  for (let i = 0; i < count; i++) {
    const v = sampleAt(i, count, phase) * ampUnits * 0.85
    const x = ((i + 0.5) / count) * VB_W - w / 2
    d += ` M ${x.toFixed(2)} ${(c - v).toFixed(2)} h ${w.toFixed(2)} v ${(2 * v).toFixed(2)} h ${(-w).toFixed(2)} Z`
  }
  return d
}

export function Waveform({
  samples = 120,
  speed = 0.6,
  amplitude = 0.4,
  height = 120,
  color = "var(--chart-line-primary)",
  showBars = true,
  showCenterline = true,
  paused = false,
  label,
  className,
}: WaveformProps) {
  const prefersReducedMotion = useReducedMotion()
  const [selfPaused, setSelfPaused] = useState(paused)
  const isPaused = selfPaused
  const isStill = isPaused || prefersReducedMotion === true

  const phaseRef = useRef(0)
  const lineRef = useRef<SVGPathElement>(null)
  const barsRef = useRef<SVGPathElement>(null)

  const ampUnits = Math.min(amplitude, 0.48) * VB_H
  const count = Math.max(2, Math.floor(samples))

  const initialLineD = useMemo(
    () => buildLineD(count, phaseRef.current, ampUnits),
    [count, ampUnits]
  )
  const initialBarsD = useMemo(
    () => buildBarsD(count, phaseRef.current, ampUnits),
    [count, ampUnits]
  )

  const draw = useCallback(
    (phase: number) => {
      const line = buildLineD(count, phase, ampUnits)
      lineRef.current?.setAttribute("d", line)
      barsRef.current?.setAttribute("d", buildBarsD(count, phase, ampUnits))
    },
    [count, ampUnits]
  )

  useEffect(() => {
    setSelfPaused(paused)
  }, [paused])

  useEffect(() => {
    if (isStill) {
      draw(phaseRef.current)
      return
    }
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      phaseRef.current += dt * speed
      draw(phaseRef.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isStill, draw, speed])

  return (
    <div
      className={cn(
        "relative select-none bg-card px-5 pb-4 pt-3",
        className
      )}
      data-paused={isPaused || undefined}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t border-[color:var(--app-line)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r border-t border-[color:var(--app-line)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b border-l border-[color:var(--app-line)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r border-[color:var(--app-line)]"
      />

      {label ? (
        <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          /// {label}
        </span>
      ) : null}

      <svg
        role="img"
        aria-label={label ?? "live signal waveform"}
        className="block w-full"
        height={height}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
      >
        <g aria-hidden>
          {showBars ? (
            <path
              ref={barsRef}
              d={initialBarsD}
              fill={color}
              fillOpacity={0.14}
            />
          ) : null}
          {showCenterline ? (
            <line
              x1={0}
              y1={VB_H / 2}
              x2={VB_W}
              y2={VB_H / 2}
              stroke="var(--app-line)"
              strokeDasharray="3 5"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          <path
            ref={lineRef}
            d={initialLineD}
            fill="none"
            stroke={color}
            strokeLinejoin="round"
            strokeWidth={1.75}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>

      <button
        type="button"
        aria-pressed={isPaused}
        onClick={() => setSelfPaused((p) => !p)}
        className="absolute inset-0 cursor-pointer bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--app-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--card)]"
      >
        <span className="sr-only">{isPaused ? "Resume waveform" : "Pause waveform"}</span>
      </button>

      <span aria-live="polite" className="sr-only">
        {isPaused ? "Waveform paused" : "Waveform playing"}
      </span>
    </div>
  )
}
