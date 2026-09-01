// Vendored from Bklit UI (MIT) — https://github.com/bklit/bklit-ui · packages/ui/src/charts/use-mount-progress.ts — fetched 2026-09-01
// Adapted: none (verbatim copy, imports unchanged)
"use client";

import { animate, type Transition, useMotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { DEFAULT_CHART_ENTER_TRANSITION } from "./animation";

/** Drives 0→1 enter progress using the studio motion transition (spring or tween). */
export function useMountProgress(
  enterTransition: Transition | undefined,
  delaySeconds: number,
  replayKey: number | string
) {
  const progress = useMotionValue(0);
  const transitionRef = useRef(enterTransition);
  transitionRef.current = enterTransition;

  // replayKey intentionally retriggers enter when motion settings change
  // biome-ignore lint/correctness/useExhaustiveDependencies: replayKey
  useEffect(() => {
    progress.set(0);
    const controls = animate(progress, 1, {
      ...(transitionRef.current ?? DEFAULT_CHART_ENTER_TRANSITION),
      delay: delaySeconds,
    });
    return () => controls.stop();
  }, [delaySeconds, replayKey, progress]);

  return progress;
}