"use client"

import * as React from "react"
import { scaleLinear } from "d3-scale"
import { area, curveMonotoneX, line } from "d3-shape"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { TooltipBox } from "@/components/bklit/tooltip/tooltip-box"
import { TooltipContent } from "@/components/bklit/tooltip/tooltip-content"
import { TooltipDot } from "@/components/bklit/tooltip/tooltip-dot"
import { TooltipIndicator } from "@/components/bklit/tooltip/tooltip-indicator"

// ═══ APP-PRIMARY — a table column that reads like a stock watchlist.
// JOB      show trend inside a data row without leaving the row
// SIGNATURE the line draws itself (pathLength) when it scrolls into view,
//           Bklit-UI crosshair: pointer-tracked indicator + snapped dot +
//           spring tooltip (tooltip-box/content/dot family, vendored);
//           keyboard focus parks the last sample, Escape hides; an anomaly
//           sample (|z| > 2.4) pulses red. Scale: d3-scale · curve: d3
//           curveMonotoneX (Bklit line pattern, self-contained).
// API      values: number[] , format?(v) ⇒ tooltip string, tone auto from slope.
//          showAnomalies (default true), strokeWidth (default 1.6) added.
// A11Y     role="img" with computed alt: "trend up 12.4% over 30 samples".

export type SparklineCellProps = {
  values: number[]
  labels?: string[]
  format?: (v: number) => string
  width?: number
  height?: number
  className?: string
  showAnomalies?: boolean
  strokeWidth?: number
}

const PAD_X = 3
const PAD_Y = 4
const Z_THRESHOLD = 2.4

export function SparklineCell({
  values,
  labels,
  format = (v) => String(Math.round(v * 100) / 100),
  width = 128,
  height = 34,
  className,
  showAnomalies = true,
  strokeWidth = 1.6,
}: SparklineCellProps) {
  const reactId = React.useId()
  const crosshairId = `spark-crosshair-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState<number | null>(null)
  const [dims, setDims] = React.useState({ w: width + 64, h: height })
  const reduce = React.useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  )

  const measure = React.useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setDims((prev) =>
      Math.abs(prev.w - rect.width) < 1 && Math.abs(prev.h - rect.height) < 1
        ? prev
        : { w: rect.width, h: rect.height }
    )
  }, [])

  React.useLayoutEffect(measure, [measure])

  if (values.length < 2) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const sd =
    Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length) ||
    1
  const first = values[0]
  const last = values[values.length - 1]
  const delta = first === 0 ? 0 : ((last - first) / Math.abs(first)) * 100
  const up = delta >= 0
  const tone = up ? "hsl(var(--ok))" : "hsl(var(--err))"

  // Bklit line pattern — d3-scale fit + d3 curveMonotoneX path.
  const xScale = scaleLinear([0, values.length - 1], [PAD_X, width - PAD_X])
  const yScale = scaleLinear([min, max], [height - PAD_Y, PAD_Y])
  const lineGen = line<number>()
    .x((_, i) => xScale(i))
    .y((v) => yScale(v))
    .curve(curveMonotoneX)
  const areaGen = area<number>()
    .x((_, i) => xScale(i))
    .y0(height)
    .y1((v) => yScale(v))
    .curve(curveMonotoneX)
  const lineD = lineGen(values) ?? ""
  const areaD = areaGen(values) ?? ""

  const anomalous = values.map((v) => Math.abs((v - mean) / sd))

  const snapTo = (clientX: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    const x = clientX - rect.left
    const idx = Math.round(((x - PAD_X) / (width - PAD_X * 2)) * (values.length - 1))
    return Math.max(0, Math.min(values.length - 1, idx))
  }

  const activeX = active == null ? 0 : xScale(active)
  const activeY = active == null ? 0 : yScale(values[active])

  const revealMotion = reduce
    ? {}
    : {
        initial: { pathLength: 0, opacity: 0 },
        whileInView: { pathLength: 1, opacity: 1 },
        viewport: { once: true, amount: 0.5 } as const,
      }

  return (
    <span className={cn("relative inline-block align-middle font-sans", className)}>
      <div
        ref={containerRef}
        className="relative inline-flex items-center"
        onPointerEnter={measure}
        onPointerMove={(e) => {
          measure()
          setActive(snapTo(e.clientX, e.currentTarget))
        }}
        onPointerLeave={() => setActive(null)}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`trend ${up ? "up" : "down"} ${Math.abs(delta).toFixed(1)}% over ${values.length} samples`}
          tabIndex={0}
          className="block cursor-crosshair overflow-visible outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]/40"
          onFocus={() => {
            measure()
            setActive(values.length - 1)
          }}
          onBlur={() => setActive(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setActive(null)
          }}
        >
          <motion.g
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={reduce ? undefined : { once: true, amount: 0.5 }}
          >
            <path d={areaD} fill={tone} opacity={0.09} />
            <motion.path
              d={lineD}
              fill="none"
              stroke={tone}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              transition={{ duration: 0.9, ease: "easeOut" }}
              {...revealMotion}
            />
          </motion.g>
          {showAnomalies &&
            values.map((v, i) =>
              anomalous[i] > Z_THRESHOLD ? (
                <circle key={i} cx={xScale(i)} cy={yScale(v)} r={2.4} fill="hsl(var(--err))">
                  <animate attributeName="opacity" values="1;0.25;1" dur="1.6s" repeatCount="indefinite" />
                </circle>
              ) : null
            )}
        </svg>
        {active != null && (
          <svg
            aria-hidden
            className="pointer-events-none absolute left-0 top-0"
            width={width}
            height={height}
          >
            <TooltipIndicator
              x={activeX}
              height={height}
              visible
              width="line"
              fadeEdges="both"
              gradientId={crosshairId}
              strokeDasharray="2 3"
              animate={false}
            />
            <TooltipDot
              x={activeX}
              y={activeY}
              visible
              color={tone}
              size={2.6}
              animate={false}
            />
          </svg>
        )}
        <span
          className={cn(
            "ml-2 inline-block w-14 text-right font-mono text-[11px] font-medium tabular-nums",
            up ? "text-[hsl(var(--ok))]" : "text-[hsl(var(--err))]"
          )}
        >
          {up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
        </span>
        {active != null && (
          <TooltipBox
            x={activeX}
            y={0}
            visible
            containerRef={containerRef}
            containerWidth={dims.w}
            containerHeight={dims.h}
            offset={8}
            top={0}
            className="-translate-y-[calc(100%+8px)]"
          >
            <TooltipContent
              rows={[
                {
                  color: tone,
                  label: labels?.[active] ?? `#${active}`,
                  value: format(values[active]),
                },
              ]}
            />
          </TooltipBox>
        )}
      </div>
    </span>
  )
}
