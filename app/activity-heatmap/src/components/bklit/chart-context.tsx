// Vendored from Bklit UI (MIT) — https://github.com/bklit/bklit-ui · packages/ui/src/charts/chart-context.tsx — fetched 2026-09-01
// Adapted: trimmed to Margin + chartCssVars (heatmap family only — ChartProvider/series machinery not vendored); --chart-tooltip-background → --chart-tooltip-bg token rename

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// CSS variable references for theming (only the vars consumed by the heatmap family)
export const chartCssVars = {
  crosshair: "var(--chart-crosshair)",
  grid: "var(--chart-grid)",
  tooltipBackground: "var(--chart-tooltip-bg)",
};
