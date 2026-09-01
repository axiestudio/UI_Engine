// Reconstructed helper (missing from staged Bklit snapshot). Mirrors the shared
// bar-depth geometry contract used by <Bar perspective> and <BarDepthBack>:
// depth scales with horizontal offset from center; rise tapers for one-point
// perspective. Not exercised unless 3D depth layers are enabled.
export function barDepthMaxDepth(step: number, bandWidth: number): number {
  const bar = bandWidth > 0 ? Math.min(bandWidth, step) : 0;
  return Math.min(bar * 0.22, 18);
}

export function barDepthAndRise(
  absOffset: number,
  naturalHeight: number,
  maxDepth: number
): { depth: number; perspectiveRise: number } {
  if (maxDepth <= 0 || naturalHeight <= 0) {
    return { depth: 0, perspectiveRise: 0 };
  }
  const offset = Math.min(1, Math.max(0, absOffset));
  const depth = maxDepth * offset;
  const perspectiveRise = depth * (0.35 + 0.25 * offset);
  return { depth, perspectiveRise };
}
