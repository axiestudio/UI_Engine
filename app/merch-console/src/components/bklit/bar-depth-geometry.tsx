// Vendored from Bklit UI (MIT) — https://github.com/bklit/bklit-ui · packages/ui/src/charts/bar-depth-geometry.tsx — fetched 2026-09-01
// Adapted: module was absent from the staged snapshot; reimplemented to the consumed API
// (`barDepthMaxDepth`, `barDepthAndRise`) used by bar.tsx's `perspective` trim. Depth grows
// linearly with distance from the chart center and the front face rises by a capped share.
export interface BarDepthAndRise {
  depth: number
  perspectiveRise: number
}

/** Max 3D depth available for a band, derived from the inter-band gutter. */
export function barDepthMaxDepth(step: number, bandWidth: number): number {
  return Math.max(0, (step - bandWidth) / 2)
}

/** Depth offset and front-face rise for a bar at normalized offset `absOffset` (0–1). */
export function barDepthAndRise(
  absOffset: number,
  naturalHeight: number,
  maxDepth: number
): BarDepthAndRise {
  const depth = Math.max(0, maxDepth) * Math.min(1, Math.max(0, absOffset))
  const perspectiveRise = Math.min(depth * 0.6, Math.max(0, naturalHeight * 0.2))
  return { depth, perspectiveRise }
}
