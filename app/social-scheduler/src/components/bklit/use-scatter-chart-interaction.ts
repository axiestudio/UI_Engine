// Vendored from Bklit UI (MIT) — https://github.com/bklit/bklit-ui · packages/ui/src/charts/use-scatter-chart-interaction.ts — fetched 2026-09-01
// Adapted: reconstructed as a thin adapter over the staged use-chart-interaction
// hook (the scatter shell consumes the identical interaction contract).
"use client";

import type { scaleLinear, scaleTime } from "@visx/scale";
import type { LineConfig, Margin } from "./chart-context";
import { useChartInteraction } from "./use-chart-interaction";

type ScaleTime = ReturnType<typeof scaleTime<number>>;
type ScaleLinear = ReturnType<typeof scaleLinear<number>>;

export interface UseScatterChartInteractionParams {
  xScale: ScaleTime;
  yScale: ScaleLinear;
  yScales: Record<string, ScaleLinear>;
  data: Record<string, unknown>[];
  lines: LineConfig[];
  margin: Margin;
  xAccessor: (d: Record<string, unknown>) => Date;
  bisectDate: (
    data: Record<string, unknown>[],
    date: Date,
    lo: number
  ) => number;
  canInteract: boolean;
}

export function useScatterChartInteraction(
  params: UseScatterChartInteractionParams
) {
  return useChartInteraction(params);
}
