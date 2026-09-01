// Vendored from Bklit UI (MIT) — https://github.com/bklit/bklit-ui · packages/ui/src/charts/visx-pattern.tsx — fetched 2026-09-01
// Adapted: stripped "use client" directive (library build)

import {
  PatternCircles as VisxPatternCircles,
  PatternHexagons as VisxPatternHexagons,
  PatternLines as VisxPatternLines,
  PatternWaves as VisxPatternWaves,
} from "@visx/pattern";
import type { ComponentProps } from "react";

export function PatternLines(props: ComponentProps<typeof VisxPatternLines>) {
  return <VisxPatternLines {...props} />;
}
PatternLines.displayName = "PatternLines";

export function PatternCircles(
  props: ComponentProps<typeof VisxPatternCircles>
) {
  return <VisxPatternCircles {...props} />;
}
PatternCircles.displayName = "PatternCircles";

export function PatternWaves(props: ComponentProps<typeof VisxPatternWaves>) {
  return <VisxPatternWaves {...props} />;
}
PatternWaves.displayName = "PatternWaves";

export function PatternHexagons(
  props: ComponentProps<typeof VisxPatternHexagons>
) {
  return <VisxPatternHexagons {...props} />;
}
PatternHexagons.displayName = "PatternHexagons";
