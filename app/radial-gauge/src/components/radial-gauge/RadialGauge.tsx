import * as React from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { Gauge } from "../bklit/gauge";

// ═══ APP-PRIMARY — ops screens like throttles, RPM, SLA burn.
// JOB      one number, instantly graded against its safe band
// SIGNATURE Bklit notch gauge: per-notch zone colors (ok/warn/err), spring
//           stagger enter, center readout counts up synced with the fill.
//           Digital zone readout under the gauge (label · unit · zone state).
// API       {value, min?, max?, zones?, label?, unit?, precision?, size?,
//            className?} unchanged + NEW optional: orientation ("arc"|"linear",
//            default "arc"), notches (default 40), showCenterValue (default true).
// A11Y      role=meter with valuenow/text; zones in the value text; svg hidden.

export type RadialGaugeZone = { to: number; color: string; label?: string };

export type RadialGaugeProps = {
  value: number;
  min?: number;
  max?: number;
  zones?: RadialGaugeZone[];
  label?: string;
  unit?: string;
  precision?: number;
  size?: number;
  /** NEW — "arc" (default) or "linear" notch track */
  orientation?: "arc" | "linear";
  /** NEW — number of notches (default 40) */
  notches?: number;
  /** NEW — hide the center count-up readout (default true) */
  showCenterValue?: boolean;
  className?: string;
};

const DEFAULT_ZONES: RadialGaugeZone[] = [
  { to: 0.7, color: "hsl(var(--ok))" },
  { to: 0.9, color: "hsl(var(--warn))" },
  { to: 1, color: "hsl(var(--err))" },
];

export function RadialGauge({
  value,
  min = 0,
  max = 100,
  zones = DEFAULT_ZONES,
  label,
  unit = "%",
  precision = 0,
  size = 220,
  orientation = "arc",
  notches = 40,
  showCenterValue = true,
  className,
}: RadialGaugeProps) {
  const reduce = useReducedMotion();

  // normalized fill 0..1 against the min..max span
  const span = max - min || 1;
  const norm = Math.max(0, Math.min(1, (value - min) / span));

  // zone lookup by fill fraction (zones[].to may be absolute like 120 or
  // fractional like 0.7 — treat values > 1 as absolute against max)
  const zoneAt = React.useCallback(
    (fraction: number): RadialGaugeZone => {
      const last = zones[zones.length - 1] ?? DEFAULT_ZONES[DEFAULT_ZONES.length - 1];
      for (const z of zones) {
        const limit = z.to > 1 ? z.to / span : z.to;
        if (fraction <= limit) return z;
      }
      return last;
    },
    [zones, span]
  );

  const activeZone = zoneAt(norm);

  // notch fill: color of the zone each notch lands in
  const zoneFill = React.useCallback(
    (fraction: number) => zoneAt(fraction).color,
    [zoneAt]
  );

  // center readout counts up 0 → value on first view (PieCenterShell behavior)
  const [flowValue, setFlowValue] = React.useState(() =>
    reduce ? value : 0
  );
  React.useEffect(() => {
    if (reduce) {
      setFlowValue(value);
      return;
    }
    let innerRaf = 0;
    const outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(() => setFlowValue(value));
    });
    return () => {
      cancelAnimationFrame(outerRaf);
      cancelAnimationFrame(innerRaf);
    };
  }, [value, reduce]);

  const centerPercent = norm * 100;
  const gaugeLabel = label ?? "Gauge";

  const gauge = (
    <Gauge
      centerValue={showCenterValue ? flowValue : undefined}
      defaultLabel={gaugeLabel}
      endAngle={405}
      formatOptions={{
        maximumFractionDigits: precision,
        minimumFractionDigits: precision,
      }}
      height={orientation === "linear" ? undefined : size * (16 / 21)}
      orientation={orientation}
      spacing={25}
      startAngle={135}
      suffix={unit}
      totalNotches={notches}
      useGradient={false}
      value={centerPercent}
      width={size}
      zoneFill={zoneFill}
    />
  );

  return (
    <div
      className={cn(
        "relative isolate mx-auto overflow-hidden rounded-md font-sans focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--app-focus))]",
        className
      )}
      role="meter"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-valuetext={`${value}${unit} ${activeZone.label ? `- ${activeZone.label}` : ""}`}
      tabIndex={0}
    >
      {gauge}
      <div className="absolute inset-x-0 -bottom-1 text-center">
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          {gaugeLabel} · {unit} ·{" "}
          <span style={{ color: activeZone.color }} className="font-semibold">
            {activeZone.label ?? (norm >= 1 ? "max" : "")}
          </span>
        </p>
      </div>
    </div>
  );
}
