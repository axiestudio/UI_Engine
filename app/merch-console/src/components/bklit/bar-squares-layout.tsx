// Vendored from Bklit UI (MIT) — https://github.com/bklit/bklit-ui · packages/ui/src/charts/bar-squares-layout.tsx — fetched 2026-09-01
// Adapted: module was absent from the staged snapshot; reimplemented to the consumed API
// (`topSquareCenterY`) so bar-chart.tsx's `squareSnap` compiles. Geometry: squares of side
// `squareSize` stack from the baseline with `gap` spacing; with `fit` the step compresses so
// the stack spans at most `barLengthPx`.
export interface TopSquareCenterYOptions {
  baselineY: number
  barLengthPx: number
  squareSize: number
  gap: number
  fit?: boolean
}

/** Y center of the top square of a square-stack bar measured from the baseline. */
export function topSquareCenterY({
  baselineY,
  barLengthPx,
  squareSize,
  gap,
  fit = false,
}: TopSquareCenterYOptions): number {
  if (squareSize <= 0 || barLengthPx <= 0) {
    return baselineY
  }

  const step = Math.max(1, squareSize + gap)
  const count = Math.max(1, Math.floor((barLengthPx + gap) / step))
  const effectiveStep =
    fit && count > 1 ? (barLengthPx - squareSize) / (count - 1) : step

  const topSquareTop = baselineY - (count - 1) * effectiveStep - squareSize
  return topSquareTop + squareSize / 2
}
