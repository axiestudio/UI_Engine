import { useMemo, useState } from "react"
import { useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RadarArea } from "@/components/bklit/radar-area"
import { RadarAxis } from "@/components/bklit/radar-axis"
import { RadarChart as BklitRadarChart } from "@/components/bklit/radar-chart"
import { defaultRadarColors } from "@/components/bklit/radar-context"
import { RadarGrid } from "@/components/bklit/radar-grid"
import { RadarLabels } from "@/components/bklit/radar-labels"

export interface RadarChartSeries {
  /** Row key holding this series' numeric value (0–100 per axis) */
  key: string
  /** Display label for the legend + series */
  label: string
  /** Color token override; defaults to --chart-1..5 by index */
  color?: string
}

export interface RadarChartProps {
  /** Rows, each with an axis label column + one value column per series key */
  data: Record<string, unknown>[]
  /** Series definitions (one filled polygon each) */
  series: RadarChartSeries[]
  /** Row key holding the axis label. Default: "axisLabel" */
  axisKey?: string
  /** Mono uppercase kicker, e.g. "DIAGNOSTICS" (rendered as "/// DIAGNOSTICS") */
  label?: string
  /** Card title */
  title?: string
  /** Card description under the title */
  description?: string
  className?: string
}

function toScaledNumber(value: unknown) {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, n))
}

export function RadarChart({
  data,
  series,
  axisKey = "axisLabel",
  label,
  title,
  description,
  className,
}: RadarChartProps) {
  const prefersReducedMotion = useReducedMotion()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const metrics = useMemo(
    () =>
      data.map((row, i) => {
        const axisLabel = String(row[axisKey] ?? `Axis ${i + 1}`)
        return { key: `${i}:${axisLabel}`, label: axisLabel }
      }),
    [data, axisKey]
  )

  const radarData = useMemo(
    () =>
      series.map((s) => ({
        label: s.label,
        ...(s.color ? { color: s.color } : {}),
        values: Object.fromEntries(
          data.map((row, i) => [`${i}:${String(row[axisKey] ?? `Axis ${i + 1}`)}`, toScaledNumber(row[s.key])])
        ),
      })),
    [series, data, axisKey]
  )

  const ariaLabel = useMemo(() => {
    const axes = metrics.map((m) => m.label).join(", ")
    const names = series.map((s) => s.label).join(", ")
    return `Radar chart of ${names} across ${axes}`
  }, [metrics, series])

  return (
    <div
      className={cn(
        "relative isolate flex flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground",
        className
      )}
    >
      {label || title || description ? (
        <div className="flex flex-col gap-1 border-b border-border px-5 pb-3 pt-4">
          {label ? (
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              /// {label}
            </span>
          ) : null}
          {title ? (
            <h3 className="font-display text-base font-semibold leading-tight">{title}</h3>
          ) : null}
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}

      <div className="px-6 pb-2 pt-4">
        <div role="img" aria-label={ariaLabel}>
          <BklitRadarChart
            data={radarData}
            metrics={metrics}
            animate={prefersReducedMotion !== true}
            hoveredIndex={hoveredIndex}
            onHoverChange={setHoveredIndex}
          >
            <RadarGrid stroke="var(--chart-grid)" strokeOpacity={1} />
            <RadarAxis stroke="var(--border)" />
            <RadarLabels fontSize={10} />
            {radarData.map((d, i) => (
              <RadarArea key={`${d.label}-${i}`} index={i} />
            ))}
          </BklitRadarChart>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 pb-4 pt-1">
        {series.map((s, i) => {
          const swatch = s.color ?? defaultRadarColors[i % defaultRadarColors.length]
          const dimmed = hoveredIndex !== null && hoveredIndex !== i
          return (
            <Button
              key={s.key}
              type="button"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(i)}
              onBlur={() => setHoveredIndex(null)}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-xs transition-opacity duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--app-focus)]",
                dimmed ? "opacity-40" : "opacity-100"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "h-2.5 w-2.5 rounded-[2px] transition-shadow duration-150",
                  hoveredIndex === i && "ring-2 ring-offset-1 ring-offset-card"
                )}
                style={{
                  backgroundColor: swatch,
                  ...(hoveredIndex === i ? { boxShadow: `0 0 0 2px ${swatch}` } : {}),
                }}
              />
              <span className="font-medium text-foreground">{s.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
