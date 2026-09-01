// Vendored from Bklit UI (MIT) — https://github.com/bklit/bklit-ui · packages/ui/src/charts/chart-scale.ts — fetched 2026-09-01
// Adapted: --chart-scale-* tokens defined as full hsl() values in this package's src/index.css

/** Sequential scale CSS variables for heatmaps, choropleths, and binned data (01 = lowest, 05 = highest). */
export const CHART_SCALE_VARS = [
  "var(--chart-scale-01)",
  "var(--chart-scale-02)",
  "var(--chart-scale-03)",
  "var(--chart-scale-04)",
  "var(--chart-scale-05)",
] as const;

export type ChartScaleVars = typeof CHART_SCALE_VARS;

export const chartScaleCssVars = {
  scale01: CHART_SCALE_VARS[0],
  scale02: CHART_SCALE_VARS[1],
  scale03: CHART_SCALE_VARS[2],
  scale04: CHART_SCALE_VARS[3],
  scale05: CHART_SCALE_VARS[4],
  patternColor: "var(--chart-scale-pattern-color)",
} as const;
