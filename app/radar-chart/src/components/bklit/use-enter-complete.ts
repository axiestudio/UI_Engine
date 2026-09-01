// Vendored from Bklit UI (MIT) — https://github.com/bklit/bklit-ui · packages/ui/src/charts/use-enter-complete.ts — fetched 2026-09-01
// Adapted: none — colocated with the radar import closure
"use client";

import type { MotionValue } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Returns true once a mount-progress MotionValue reaches 1.
 * Use to swap animated MotionValue-driven props for static values after
 * enter completes — drops per-frame subscriptions during pan/hover.
 */
export function useEnterComplete(mountProgress: MotionValue<number>): boolean {
  const [complete, setComplete] = useState(() => mountProgress.get() >= 1);

  useEffect(() => {
    if (mountProgress.get() >= 1) {
      setComplete(true);
      return;
    }

    return mountProgress.on("change", (value) => {
      if (value >= 1) {
        setComplete(true);
      }
    });
  }, [mountProgress]);

  return complete;
}
