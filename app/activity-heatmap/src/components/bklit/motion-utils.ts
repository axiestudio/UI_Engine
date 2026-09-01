// Vendored from Bklit UI (MIT) — https://github.com/bklit/bklit-ui · packages/ui/src/charts/motion-utils.ts — fetched 2026-09-01
// Adapted: "../animation" import rewritten to "./animation" (relative layout preserved); springOptionsFromTransition trimmed (unused by heatmap family)

import type { Transition } from "motion/react";
import { DEFAULT_CHART_ENTER_TRANSITION } from "./animation";

export function transitionWithDelay(
  transition: Transition | undefined,
  delaySeconds: number,
  fallback: Transition = DEFAULT_CHART_ENTER_TRANSITION
): Transition {
  const base = transition ?? fallback;
  return { ...base, delay: delaySeconds };
}
