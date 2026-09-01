// Vendored from Bklit UI (MIT) — https://github.com/bklit/bklit-ui · packages/ui/src/charts/heatmap/use-delayed-tooltip-data.ts — fetched 2026-09-01
// Adapted: compat shim — this hook is imported by upstream heatmap-tooltip.tsx but was not present in the staged sources; implemented here to the Bklit API contract (showDelay gates first appearance, hideDelay adds a leave grace period, movement updates instantly)

import { useEffect, useRef, useState } from "react";
import type { HeatmapTooltipData } from "./heatmap-context";

/**
 * Delays tooltip appearance (first hover only), keeps it visible across the
 * hideDelay grace period, and tracks pointer movement instantly once shown.
 */
export function useDelayedTooltipData(
  data: HeatmapTooltipData | null,
  showDelay = 0,
  hideDelay = 120
): HeatmapTooltipData | null {
  const [displayed, setDisplayed] = useState<HeatmapTooltipData | null>(data);
  const visibleRef = useRef(false);
  const latestRef = useRef<HeatmapTooltipData | null>(data);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  latestRef.current = data;

  useEffect(() => {
    const clearShow = () => {
      if (showTimerRef.current != null) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
    };
    const clearHide = () => {
      if (hideTimerRef.current != null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    if (data != null) {
      clearHide();
      if (visibleRef.current || showDelay <= 0) {
        clearShow();
        visibleRef.current = true;
        setDisplayed(data);
        return;
      }
      if (showTimerRef.current == null) {
        showTimerRef.current = window.setTimeout(() => {
          showTimerRef.current = null;
          visibleRef.current = true;
          setDisplayed(latestRef.current);
        }, showDelay);
      }
      return;
    }

    clearShow();
    if (!visibleRef.current) {
      return;
    }
    if (hideDelay <= 0) {
      visibleRef.current = false;
      setDisplayed(null);
      return;
    }
    if (hideTimerRef.current == null) {
      hideTimerRef.current = window.setTimeout(() => {
        hideTimerRef.current = null;
        visibleRef.current = false;
        setDisplayed(null);
      }, hideDelay);
    }
  }, [data, showDelay, hideDelay]);

  useEffect(() => {
    return () => {
      if (showTimerRef.current != null) {
        window.clearTimeout(showTimerRef.current);
      }
      if (hideTimerRef.current != null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  return displayed;
}
