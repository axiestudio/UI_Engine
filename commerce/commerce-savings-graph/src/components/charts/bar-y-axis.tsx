/**
 * Vendored from Bklit UI registry: https://ui.bklit.com/r/bar-chart.json
 * Item: bar-chart (type registry:component). Snapshot: UI/_registry/bklit/r/bar-chart.json
 */
"use client";

import { motion } from "motion/react";
import { memo, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useChart, useChartStable } from "./chart-context";

export interface BarYAxisProps {
  /** Whether to show all labels or skip some for dense data. Default: true */
  showAllLabels?: boolean;
  /** Maximum number of labels to show. Default: 20 */
  maxLabels?: number;
}

interface BarYAxisLabelProps {
  label: string;
  y: number;
  bandHeight: number;
  isHovered: boolean;
}

function BarYAxisLabel({
  label,
  y,
  bandHeight,
  isHovered,
}: BarYAxisLabelProps) {
  return (
    <div
      className="absolute right-0 flex items-center justify-end pr-2"
      style={{
        top: y,
        height: bandHeight,
      }}
    >
      <motion.span
        animate={{
          opacity: isHovered ? 1 : 0.7,
          color: isHovered
            ? "var(--foreground)"
            : "var(--chart-label, var(--color-zinc-500))",
        }}
        className={cn("truncate whitespace-nowrap text-right text-xs")}
        initial={{
          opacity: 0.7,
          color: "var(--chart-label, var(--color-zinc-500))",
        }}
        style={{ maxWidth: 70 }}
        transition={{ duration: 0.15 }}
      >
        {label}
      </motion.span>
    </div>
  );
}

export function BarYAxis(props: BarYAxisProps) {
  const { containerRef, barScale } = useChartStable();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const container = containerRef.current;
  if (!(mounted && container)) {
    return null;
  }

  if (!barScale) {
    return null;
  }

  return <BarYAxisInner {...props} container={container} />;
}

const BarYAxisInner = memo(function BarYAxisInner({
  showAllLabels = true,
  maxLabels = 20,
  container,
}: BarYAxisProps & { container: HTMLDivElement }) {
  const { margin, barScale, bandWidth, barXAccessor, data, hoveredBarIndex, orientation, yScale } =
    useChart();

  // Vertical (column) charts put their category labels on the X axis; the
  // Y axis shows the VALUE scale. Mapping categories through the band scale
  // here would scatter labels diagonally down the left gutter (bandScale
  // outputs horizontal x positions for vertical charts). Render value ticks
  // aligned to the gridlines instead.
  if (orientation !== "horizontal") {
    const ticks = yScale ? yScale.ticks(5) : [];
    return createPortal(
      <div
        className="pointer-events-none absolute top-0 bottom-0"
        style={{
          left: 0,
          width: margin.left,
        }}
      >
        {ticks.map((v) => (
          <div
            key={v}
            className="absolute right-0 flex items-center justify-end pr-2"
            style={{ top: (yScale?.(v) ?? 0) + margin.top - 8, height: 16 }}
          >
            <span
              className="whitespace-nowrap text-right text-xs tabular-nums"
              style={{ color: "var(--chart-label, var(--color-zinc-500))" }}
            >
              {v >= 1000 ? `${Math.round(v / 100) / 10}k` : v}
            </span>
          </div>
        ))}
      </div>,
      container
    );
  }

  // Generate labels for each bar
  const labelsToShow = useMemo(() => {
    if (!(barScale && bandWidth && barXAccessor)) {
      return [];
    }

    const allLabels = data.map((d, i) => {
      const label = barXAccessor(d);
      const bandY = barScale(label) ?? 0;
      // Center the label vertically within the band
      const y = bandY + margin.top;
      return { label, y, bandHeight: bandWidth, index: i };
    });

    // If showAllLabels is true or we have fewer than maxLabels, show all
    if (showAllLabels || allLabels.length <= maxLabels) {
      return allLabels;
    }

    // Otherwise, skip some labels to avoid crowding
    const step = Math.ceil(allLabels.length / maxLabels);
    return allLabels.filter((_, i) => i % step === 0);
  }, [
    barScale,
    bandWidth,
    barXAccessor,
    data,
    margin.top,
    showAllLabels,
    maxLabels,
  ]);

  return createPortal(
    <div
      className="pointer-events-none absolute top-0 bottom-0"
      style={{
        left: 0,
        width: margin.left,
      }}
    >
      {labelsToShow.map((item) => (
        <BarYAxisLabel
          bandHeight={item.bandHeight}
          isHovered={hoveredBarIndex === item.index}
          key={`${item.label}-${item.y}`}
          label={item.label}
          y={item.y}
        />
      ))}
    </div>,
    container
  );
});

BarYAxis.displayName = "BarYAxis";

export default BarYAxis;
