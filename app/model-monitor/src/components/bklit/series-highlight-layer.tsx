// Vendored from Bklit UI (MIT) — https://github.com/bklit/bklit-ui · packages/ui/src/charts/series-highlight-layer.tsx — fetched 2026-09-01
// Adapted: no import rewrites needed — "@/lib/utils" alias resolves via tsconfig paths + vite alias; "use client" directive stripped for library build
import type { RefObject } from "react";
import { useChartStable } from "./chart-context";
import { HighlightSegment } from "./highlight-segment";
import { useHighlightSegment } from "./use-highlight-segment";

interface SeriesHighlightLayerProps {
  /** Caller already gated `showHighlight && showLine`; this just routes through. */
  enabled: boolean;
  height: number;
  pathRef: RefObject<SVGPathElement | null>;
  stroke: string;
  strokeWidth: number;
}

/**
 * Self-contained hover-highlight band over a series stroke.
 *
 * Owns the `useHighlightSegment` subscription (which reads both stable + hover
 * context) so the parent <Area> / <Line> can stay on the stable slice. This
 * component still re-renders on hover — that's the price of driving the
 * highlight band — but it's a tiny leaf so the cost is bounded to itself.
 */
export function SeriesHighlightLayer({
  enabled,
  height,
  pathRef,
  stroke,
  strokeWidth,
}: SeriesHighlightLayerProps) {
  const { isLoaded } = useChartStable();
  const { xSpring, widthSpring, isActive } = useHighlightSegment({ enabled });
  return (
    <HighlightSegment
      height={height}
      pathRef={pathRef}
      stroke={stroke}
      strokeWidth={strokeWidth}
      visible={enabled && isActive && isLoaded}
      width={widthSpring}
      x={xSpring}
    />
  );
}

SeriesHighlightLayer.displayName = "SeriesHighlightLayer";

export default SeriesHighlightLayer;
