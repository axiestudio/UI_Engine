import * as React from "react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { Badge } from "@/components/ui/badge"
import { HEATMAP_DEFAULT_ENTER_EASE } from "../bklit/heatmap/heatmap-animation"
import { HeatmapChart } from "../bklit/heatmap/heatmap-chart"
import { HeatmapCells } from "../bklit/heatmap/heatmap-cells"
import {
  type HeatmapColumn,
} from "../bklit/heatmap/heatmap-context"
import {
  HEATMAP_DEFAULT_LEVEL_COLORS,
  type HeatmapLevelColors,
  type HeatmapLevelStyles,
  levelStylesFromColors,
} from "../bklit/heatmap/heatmap-colors"
import { HeatmapLegend } from "../bklit/heatmap/heatmap-legend"
import { HeatmapSeparator } from "../bklit/heatmap/heatmap-separator"
import { HeatmapTooltip } from "../bklit/heatmap/heatmap-tooltip"
import { HeatmapYAxis } from "../bklit/heatmap/heatmap-y-axis"

// ═══ APP-PRIMARY — streaks, usage, focus: time as texture.
// JOB      show when a user (or fleet) is active over the last ~26 weeks
// SIGNATURE the grid BLOOMS in a left→right column wave on first view;
//           hovering a cell lifts the whole week column (others dim) and a
//           real Bklit-style tooltip reads out the date + count.
// API      { cells: {count}[] } mapped onto the vendored Bklit HeatmapChart
//          (week columns of 7 bins, dates synthesized back from today).
//          levelOf or auto-bucketing (max-relative, ceil(count/max*4)) picks
//          the --chart-scale-01..05 level. totals + best streak in header.
// A11Y     role="img" + sr-only summary; reduced motion renders instantly.

export type HeatCell = { count: number }
export type ActivityHeatmapProps = {
  cells: HeatCell[]
  levelOf?: (c: number) => 0 | 1 | 2 | 3 | 4
  weeks?: number
  className?: string
  showTooltip?: boolean
  showLegend?: boolean
  weekStartDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  colorScale?: (level: number) => string
  /** Unit noun for the total + tooltip (default "events"). Hosts pass their
   *  own domain word, e.g. merch-console passes "orders". */
  unit?: string
  /**
   * `true` (default) renders the full marketing scene: eyebrow + headline +
   * hero card + caption. `false` renders the bare data visual (total row +
   * grid + legend) for embedding inside host cards that already own the
   * header — e.g. merch-console's "Order heat" section.
   */
  scene?: boolean
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function ActivityHeatmap({
  cells,
  levelOf,
  className,
  showTooltip = true,
  showLegend = true,
  weekStartDay = 0,
  colorScale,
  scene = true,
  unit = "events",
}: ActivityHeatmapProps) {
  // `weeks` is kept for API compat; columns were always derived from cells
  // length (ceil(len/7)) and that stays the source of truth.
  const max = Math.max(1, ...cells.map((c) => c.count))
  const cols = Math.max(1, Math.ceil(cells.length / 7))
  const total = cells.reduce((a, c) => a + c.count, 0)
  let streak = 0, run = 0
  for (const c of cells) { run = c.count > 0 ? run + 1 : 0; streak = Math.max(streak, run) }

  const levelColors = React.useMemo<HeatmapLevelColors>(
    () => [
      colorScale ? colorScale(0) : HEATMAP_DEFAULT_LEVEL_COLORS[0],
      colorScale ? colorScale(1) : HEATMAP_DEFAULT_LEVEL_COLORS[1],
      colorScale ? colorScale(2) : HEATMAP_DEFAULT_LEVEL_COLORS[2],
      colorScale ? colorScale(3) : HEATMAP_DEFAULT_LEVEL_COLORS[3],
      colorScale ? colorScale(4) : HEATMAP_DEFAULT_LEVEL_COLORS[4],
    ],
    [colorScale],
  )
  const levelStyles = React.useMemo<HeatmapLevelStyles>(
    () => levelStylesFromColors(levelColors),
    [levelColors],
  )

  const resolveLevel = React.useCallback(
    (c: number) =>
      levelOf
        ? levelOf(c)
        : c <= 0
          ? 0
          : (Math.min(4, Math.ceil((c / max) * 4)) as 0 | 1 | 2 | 3 | 4),
    [levelOf, max],
  )
  const fillScale = React.useCallback(
    (count: number | null | undefined) => {
      const style = levelStyles[resolveLevel(count ?? 0)] ?? levelStyles[0]
      return style.color
    },
    [levelStyles, resolveLevel],
  )

  const columns = React.useMemo<HeatmapColumn[]>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const length = cells.length
    return Array.from({ length: Math.max(1, Math.ceil(length / 7)) }, (_, w) => ({
      bin: w,
      bins: cells.slice(w * 7, w * 7 + 7).map((cell, d) => {
        const index = w * 7 + d
        return {
          bin: d,
          count: cell.count,
          date: new Date(today.getTime() - (length - index) * MS_PER_DAY),
        }
      }),
    }))
  }, [cells])

  const visual = (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="font-display text-2xl font-bold tracking-tight tabular-nums">
          {total.toLocaleString()} <span className="text-sm font-bold text-muted-foreground">{unit}</span>
        </p>
        <Badge variant="secondary">best streak {streak}d</Badge>
      </div>

      <div className="mt-6" role="img" aria-label={`Activity heatmap: ${total.toLocaleString()} ${unit} across ${cols} weeks, best streak ${streak} days.`}>
        <HeatmapChart
          data={columns}
          gap={3}
          margin={{ top: 4, right: 4, bottom: 0, left: 34 }}
          animationDuration={1100}
          enterTransition={{ type: "tween", duration: 0.4, ease: HEATMAP_DEFAULT_ENTER_EASE }}
          levelColors={levelColors}
          colorScale={fillScale}
          fillScale={fillScale}
          weekStartDay={weekStartDay}
        >
          <HeatmapCells cornerRadius={2} hoverScope="column" hideGhostCells={false} />
          <HeatmapYAxis />
          <HeatmapSeparator every={4} spacing={0} stroke="var(--chart-grid)" />
          {showTooltip ? (
            <HeatmapTooltip formatLabel={(count) => `${count.toLocaleString()} ${unit}`} />
          ) : null}
        </HeatmapChart>
      </div>

      {showLegend ? <HeatmapLegend levelStyles={levelStyles} interactive={false} className="mt-5" /> : null}
      <p className="sr-only">
        {`Activity over the last ${cols} weeks: ${total.toLocaleString()} ${unit} total, best streak ${streak} day${streak === 1 ? "" : "s"}. Use a pointer to read the exact date and count per day.`}
      </p>
    </>
  )

  // Bare embed: host card owns header + chrome, preset contributes data only.
  if (!scene) return <div className={cn("w-full", className)}>{visual}</div>

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-background", className)}>
      <div className="mx-auto w-full max-w-[720px] px-4 py-12 sm:px-6 sm:py-14">
        {/* ── scene header ───────────────────────────────────────────── */}
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">Activity · last {cols} weeks</span>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">Time, as texture.</h2>
          <p className="mt-2.5 max-w-xl text-sm leading-6 text-muted-foreground">
            Six months of focus in one grid — every cell a day. Hover a column to lift the week, or a day to read its count.
          </p>
        </InView>

        {/* ── hero card ──────────────────────────────────────────────── */}
        <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-[0_24px_48px_-32px_hsl(var(--foreground)/0.5)] sm:p-7">
          {visual}
        </div>

        {/* ── caption line ───────────────────────────────────────────── */}
        <p className="mx-auto mt-6 flex items-center justify-between border-t border-border/60 pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          <span>Day cells · Column hover · Tooltip</span>
          <span aria-hidden>●</span>
        </p>
      </div>
    </section>
  )
}

/** TESTANCHOR scene=false — bare embed used by merch-console order heat. */
