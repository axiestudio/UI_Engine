// Vendored from Bklit UI (MIT) — https://github.com/bklit/bklit-ui · packages/ui/src/charts/heatmap/heatmap-utils.ts — fetched 2026-09-01
// Adapted: trimmed calendar/quarter/separator-group helpers unused by this package's rolling-week grid (level + hover + separator math unchanged)

import type { HeatmapLevelStyles } from "./heatmap-colors";
import type { HeatmapBin, HeatmapColumn } from "./heatmap-context";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getHeatmapTimeExtent(
  columns: HeatmapColumn[]
): [Date, Date] | null {
  if (columns.length === 0) {
    return null;
  }

  const firstColumn = columns[0];
  if (!firstColumn) {
    return null;
  }
  const start = getHeatmapColumnStartDate(firstColumn);
  const lastColumn = columns.at(-1);
  if (!lastColumn) {
    return null;
  }
  const end = getHeatmapColumnEndDate(lastColumn);
  if (!(start && end)) {
    return null;
  }

  return [start, end];
}

export function filterHeatmapColumns(
  columns: HeatmapColumn[],
  xDomain?: [Date, Date]
): HeatmapColumn[] {
  if (!xDomain) {
    return columns;
  }

  const start = Math.min(xDomain[0].getTime(), xDomain[1].getTime());
  const end = Math.max(xDomain[0].getTime(), xDomain[1].getTime());

  return columns.filter((column) => {
    const weekStart = getHeatmapColumnStartDate(column)?.getTime();
    const weekEnd = getHeatmapColumnEndDate(column)?.getTime();
    if (weekStart == null || weekEnd == null) {
      return false;
    }
    return weekEnd >= start && weekStart <= end;
  });
}

const heatmapTooltipMonthFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
});

const heatmapTooltipWeekdayFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
});

function formatHeatmapOrdinalDay(day: number): string {
  if (day >= 11 && day <= 13) {
    return `${day}th`;
  }

  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

/** Tooltip header date — e.g. `January 20th 2026`. */
export function formatHeatmapTooltipDate(date: Date): string {
  const month = heatmapTooltipMonthFmt.format(date);
  const day = formatHeatmapOrdinalDay(date.getDate());
  return `${month} ${day} ${date.getFullYear()}`;
}

/** Tooltip weekday line — e.g. `Monday`. */
export function formatHeatmapTooltipWeekday(date: Date): string {
  return heatmapTooltipWeekdayFmt.format(date);
}

/** Tooltip contribution line — e.g. `3 contributions`. */
export function formatHeatmapContributionLabel(
  count: number,
  _date?: Date
): string {
  const word = count === 1 ? "contribution" : "contributions";
  return `${count} ${word}`;
}

/** Sunday-first day labels for heatmap row bins. */
export const HEATMAP_DAY_LABELS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

/** First row of the grid — `0` = Sunday (GitHub default). */
export type HeatmapWeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Day labels with row 0 aligned to `weekStartDay`. */
export function getHeatmapDayLabels(
  weekStartDay: HeatmapWeekStartDay = 0
): readonly string[] {
  if (weekStartDay === 0) {
    return HEATMAP_DAY_LABELS;
  }

  return [
    ...HEATMAP_DAY_LABELS.slice(weekStartDay),
    ...HEATMAP_DAY_LABELS.slice(0, weekStartDay),
  ];
}

/** Rotates Sun-first column bins so display row 0 starts on `weekStartDay`. */
export function rotateHeatmapColumnBins(
  columns: HeatmapColumn[],
  weekStartDay: HeatmapWeekStartDay = 0
): HeatmapColumn[] {
  if (weekStartDay === 0) {
    return columns;
  }

  return columns.map((column) => ({
    ...column,
    bins: [
      ...column.bins.slice(weekStartDay),
      ...column.bins.slice(0, weekStartDay),
    ],
  }));
}

/** Which Y-axis row ticks to display. */
export type HeatmapYAxisTickFilter = "all" | "odd" | "even";

/** Y-axis label display — `initial` shows the first letter only (Mon → M). */
export type HeatmapYAxisLabelFormat = "full" | "initial";

export function formatHeatmapYAxisLabel(
  label: string,
  labelFormat: HeatmapYAxisLabelFormat
): string {
  return labelFormat === "initial" ? label.charAt(0) : label;
}

export function shouldShowHeatmapYAxisTick(
  row: number,
  tickFilter: HeatmapYAxisTickFilter
): boolean {
  switch (tickFilter) {
    case "all":
      return true;
    case "odd":
      return row % 2 === 1;
    case "even":
      return row % 2 === 0;
    default:
      return row % 2 === 1;
  }
}

/** Column grouping for separators — fixed interval or calendar quarter. */
export type HeatmapSeparatorGroupBy = "every" | "quarter";

/** Separator config from props — resolved to column indices once data is known. */
export interface HeatmapSeparatorParsedConfig {
  groupBy: HeatmapSeparatorGroupBy;
  every?: number;
  spacing: number;
}

export interface HeatmapSeparatorGroup {
  startColumnIndex: number;
  quarter: number;
  year: number;
  startDate: Date;
  label: string;
}

/** Resolved separator layout used for column offsets and rendering. */
export interface HeatmapSeparatorLayout {
  spacing: number;
  atColumns: number[];
  groups: HeatmapSeparatorGroup[];
}

/** Separator line style. */
export type HeatmapSeparatorStrokeStyle = "solid" | "dashed";

/** Vertical stroke gradient for separator lines (`from` → optional `via` → `to`). */
export interface HeatmapSeparatorGradient {
  from: string;
  via?: string;
  to: string;
  fromOpacity?: number;
  viaOpacity?: number;
  toOpacity?: number;
}

export interface HeatmapSeparatorGradientStop {
  offset: string;
  color: string;
  opacity: number;
}

/** Builds SVG gradient stops for a vertical separator line. */
export function buildHeatmapSeparatorGradientStops(
  gradient: HeatmapSeparatorGradient,
  strokeOpacity = 1
): HeatmapSeparatorGradientStop[] {
  const scaleOpacity = (value: number | undefined, fallback = 1) =>
    (value ?? fallback) * strokeOpacity;

  if (gradient.via != null) {
    return [
      {
        offset: "0%",
        color: gradient.from,
        opacity: scaleOpacity(gradient.fromOpacity),
      },
      {
        offset: "50%",
        color: gradient.via,
        opacity: scaleOpacity(gradient.viaOpacity),
      },
      {
        offset: "100%",
        color: gradient.to,
        opacity: scaleOpacity(gradient.toOpacity),
      },
    ];
  }

  return [
    {
      offset: "0%",
      color: gradient.from,
      opacity: scaleOpacity(gradient.fromOpacity),
    },
    {
      offset: "100%",
      color: gradient.to,
      opacity: scaleOpacity(gradient.toOpacity),
    },
  ];
}

export function resolveHeatmapSeparatorStrokeDasharray(
  strokeStyle: HeatmapSeparatorStrokeStyle = "solid",
  strokeDasharray?: string
): string | undefined {
  if (strokeStyle !== "dashed") {
    return undefined;
  }
  return strokeDasharray ?? "4,4";
}

export function getHeatmapColumnStartDate(column: HeatmapColumn): Date | null {
  return column.bins[0]?.date ?? null;
}

export function getHeatmapColumnEndDate(column: HeatmapColumn): Date | null {
  const lastBin = column.bins.at(-1);
  return lastBin?.date ?? null;
}

/** Column indices (0-based) where a vertical separator is drawn (fixed interval). */
export function getHeatmapSeparatorColumnIndices(
  columnCount: number,
  every: number
): number[] {
  if (every <= 0 || columnCount <= every) {
    return [];
  }

  const indices: number[] = [];
  for (
    let columnIndex = every;
    columnIndex < columnCount;
    columnIndex += every
  ) {
    indices.push(columnIndex);
  }
  return indices;
}

export function resolveHeatmapSeparatorLayout(
  config: HeatmapSeparatorParsedConfig | null,
  columns: HeatmapColumn[]
): HeatmapSeparatorLayout | null {
  if (!config) {
    return null;
  }

  if (config.groupBy === "quarter") {
    // Quarter grouping requires calendar-quarter helpers not vendored here;
    // this package uses fixed-interval separators only.
    return null;
  }

  if (!config.every || config.every <= 0) {
    return null;
  }

  const atColumns = getHeatmapSeparatorColumnIndices(
    columns.length,
    config.every
  );

  return {
    spacing: config.spacing,
    atColumns,
    groups: [],
  };
}

export function getHeatmapSeparatorCount(
  separator: Pick<HeatmapSeparatorLayout, "atColumns"> | null
): number {
  return separator?.atColumns.length ?? 0;
}

/** Extra x-offset for a column when separator spacing is enabled. */
export function getHeatmapColumnXOffset(
  columnIndex: number,
  separator: Pick<HeatmapSeparatorLayout, "spacing" | "atColumns"> | null
): number {
  if (!separator || separator.spacing <= 0) {
    return 0;
  }
  if (columnIndex <= 0) {
    return 0;
  }

  const separatorCount = separator.atColumns.filter(
    (atColumn) => atColumn <= columnIndex
  ).length;
  return separatorCount * separator.spacing;
}

export function getHeatmapPlotInnerWidth(
  columnCount: number,
  binWidth: number,
  separator: Pick<HeatmapSeparatorLayout, "spacing" | "atColumns"> | null
): number {
  const separatorCount = separator ? getHeatmapSeparatorCount(separator) : 0;
  return columnCount * binWidth + separatorCount * (separator?.spacing ?? 0);
}

/** Vertical span for a separator line in plot coordinates. */
export function getHeatmapSeparatorLineY({
  innerHeight,
  marginTop,
  startOffset,
  paddingY = 0,
}: {
  innerHeight: number;
  marginTop: number;
  /** Distance from the chart container top to the line start. Default: plot top. */
  startOffset?: number;
  paddingY?: number;
}): { y1: number; y2: number } {
  const resolvedStart = startOffset ?? marginTop;
  const y1 = resolvedStart - marginTop + paddingY;
  const y2 = Math.max(innerHeight - paddingY, y1);
  return { y1, y2 };
}

/** X position for a separator line (centered in the gutter when spacing > 0). */
export function getHeatmapSeparatorX(
  columnIndex: number,
  gap: number,
  separator: Pick<HeatmapSeparatorLayout, "spacing">,
  xScale: (columnIndex: number) => number
): number {
  if (separator.spacing > 0) {
    return xScale(columnIndex) - separator.spacing / 2;
  }
  return xScale(columnIndex) - gap / 2;
}

/**
 * Infers GitHub-style display range for calendar-month contribution grids.
 * Custom data that does not match a known grid shape returns null bounds (show all).
 */
export function resolveHeatmapDisplayRange(
  columns: HeatmapColumn[]
): { start: Date | null; end: Date | null } {
  // This package renders rolling week windows from synthesized dates, so no
  // calendar-range ghost trimming is performed (callers pass hideGhostCells=false).
  void columns;
  return { start: null, end: null };
}

/** Whether a bin falls outside the contribution display window (not merely inactive). */
export function isHeatmapGhostBin(
  bin: HeatmapBin,
  range: { start: Date | null; end: Date | null }
): boolean {
  const time = bin.date.getTime();
  if (range.end && time > range.end.getTime()) {
    return true;
  }
  if (range.start && time < range.start.getTime()) {
    return true;
  }
  return false;
}

/** Maps a contribution count to the GitHub-style legend level (0–4). */
export function getHeatmapContributionLevel(count: number): number {
  if (count <= 0) {
    return 0;
  }
  if (count === 1) {
    return 1;
  }
  if (count === 2) {
    return 2;
  }
  if (count === 3) {
    return 3;
  }
  return 4;
}

export interface HeatmapHoverStyleParams {
  inactiveOpacity: number;
  inactiveScale: number;
  activeScale: number;
}

/** Whether hover styling runs (disabled when all scale/opacity props are 1). */
export function isHeatmapHoverEffectEnabled(
  params: HeatmapHoverStyleParams
): boolean {
  return (
    params.inactiveOpacity !== 1 ||
    params.inactiveScale !== 1 ||
    params.activeScale !== 1
  );
}

/** Opacity and scale for highlighted vs dimmed cells and legend swatches. */
export function resolveHeatmapHoverStyle(
  isHighlighted: boolean,
  isDimmed: boolean,
  params: HeatmapHoverStyleParams
): { opacity: number; scale: number } {
  if (isHighlighted && params.activeScale !== 1) {
    return { opacity: 1, scale: params.activeScale };
  }

  if (isDimmed) {
    return {
      opacity: params.inactiveOpacity,
      scale: params.inactiveScale,
    };
  }

  return { opacity: 1, scale: 1 };
}

/** Opacity and scale for an inactive cell or legend swatch. */
export function resolveHeatmapInactiveStyle(
  isInactive: boolean,
  inactiveOpacity: number,
  inactiveScale: number
): { opacity: number; scale: number } {
  return resolveHeatmapHoverStyle(false, isInactive, {
    inactiveOpacity,
    inactiveScale,
    activeScale: 1,
  });
}

/** Per-row opacity multiplier for display rows (default 1). */
export function resolveHeatmapRowOpacity(
  row: number,
  rowOpacity?: number | readonly number[]
): number {
  if (rowOpacity == null) {
    return 1;
  }

  if (typeof rowOpacity === "number") {
    return rowOpacity;
  }

  return rowOpacity[row] ?? 1;
}

/** CSS `linear-gradient` for a continuous legend bar from level styles. */
export function buildHeatmapLegendGradient(
  levelStyles: HeatmapLevelStyles
): string {
  const lastIndex = levelStyles.length - 1;
  const stops = levelStyles.map((style, index) => {
    const offset = lastIndex === 0 ? 0 : (index / lastIndex) * 100;
    return `${style.color} ${offset}%`;
  });

  return `linear-gradient(to right, ${stops.join(", ")})`;
}

/** Kept for callers needing day math on synthesized bin dates. */
export const HEATMAP_MS_PER_DAY = MS_PER_DAY;
