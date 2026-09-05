// Vendored from Bklit UI (MIT) — https://github.com/bklit/bklit-ui · packages/ui/src/charts/chart-stat-flow.tsx — fetched 2026-09-01
// Adapted: NumberFlow → in-repo SlidingNumber primitive (motion-primitives); reduced-motion renders static text
"use client";

import { type ReactNode, useMemo } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { SlidingNumber } from "@/components/primitives/sliding-number";

/** Subset of `Intl.NumberFormatOptions` supported by the stat display */
export interface ChartStatFlowFormat {
  notation?: "standard" | "compact";
  compactDisplay?: "short" | "long";
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  minimumIntegerDigits?: number;
  minimumSignificantDigits?: number;
  maximumSignificantDigits?: number;
  style?: "decimal" | "percent" | "currency";
  currency?: string;
  currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name";
  unit?: string;
  unitDisplay?: "short" | "long" | "narrow";
}

export const defaultChartStatFlowFormat: ChartStatFlowFormat = {
  notation: "standard",
  maximumFractionDigits: 0,
};

function formatStatValue(
  value: number,
  formatOptions: ChartStatFlowFormat,
  prefix?: string,
  suffix?: string
): string {
  const formatted = new Intl.NumberFormat(undefined, formatOptions).format(
    value
  );
  return `${prefix ?? ""}${formatted}${suffix ?? ""}`;
}

export interface ChartStatFlowProps {
  value: number;
  /** Center label — omit or pass "" to render the value only */
  label?: string;
  formatOptions?: ChartStatFlowFormat;
  prefix?: string;
  suffix?: string;
  valueClassName?: string;
  labelClassName?: string;
  icon?: ReactNode;
}

/**
 * Shared value + label stack using SlidingNumber (same layout as pie / ring centers).
 * Parent should provide flex alignment and sizing when needed.
 */
export function ChartStatFlow({
  value,
  label,
  formatOptions = defaultChartStatFlowFormat,
  prefix,
  suffix,
  valueClassName = "text-2xl font-bold",
  labelClassName = "text-xs",
  icon,
}: ChartStatFlowProps) {
  const reduce = useReducedMotion();
  const staticValue = useMemo(
    () => formatStatValue(value, formatOptions, prefix, suffix),
    [value, formatOptions, prefix, suffix]
  );

  // SlidingNumber animates raw digits; feed it the plain number and keep
  // prefix/suffix as sibling spans so digits slide without re-parsing.
  const slidingValue = useMemo(() => {
    const opts: Intl.NumberFormatOptions = { ...formatOptions };
    // strip style/unit concerns — SlidingNumber handles plain decimals only
    void opts;
    const rounded = Number(
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: formatOptions?.minimumFractionDigits,
        maximumFractionDigits: formatOptions?.maximumFractionDigits ?? 2,
      }).format(value)
    );
    return rounded;
  }, [value, formatOptions]);

  return (
    <>
      {icon ? (
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
          {icon}
        </div>
      ) : null}
      <span className={cn("text-foreground tabular-nums", valueClassName)}>
        {prefix ? <span>{prefix}</span> : null}
        {reduce ? (
          <span>{staticValue.slice(prefix?.length ?? 0, staticValue.length - (suffix?.length ?? 0))}</span>
        ) : (
          <SlidingNumber value={slidingValue} />
        )}
        {suffix ? <span>{suffix}</span> : null}
      </span>
      {label ? (
        <span className={cn("mt-0.5 text-chart-label", labelClassName)}>
          {label}
        </span>
      ) : null}
    </>
  );
}

ChartStatFlow.displayName = "ChartStatFlow";
