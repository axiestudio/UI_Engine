// Reconstructed helper (missing from staged Bklit snapshot). Computes the
// tooltip snap Y for the squares bar variant: the center of the topmost
// square tile in a bar built from upward-stacked squares.
export interface TopSquareCenterYInput {
  baselineY: number;
  barLengthPx: number;
  squareSize: number;
  gap: number;
  fit?: boolean;
}

export function topSquareCenterY(input: TopSquareCenterYInput): number {
  const { baselineY, barLengthPx, squareSize, gap, fit } = input;
  if (barLengthPx <= 0 || squareSize <= 0) {
    return baselineY;
  }
  if (fit) {
    return baselineY - barLengthPx + squareSize / 2;
  }
  const unit = squareSize + gap;
  const fullUnits = Math.max(1, Math.floor((barLengthPx + gap) / unit));
  const topSquareTop =
    baselineY - fullUnits * squareSize - Math.max(0, fullUnits - 1) * gap;
  return topSquareTop + squareSize / 2;
}
