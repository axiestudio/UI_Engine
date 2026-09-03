import { Button } from "@/components/ui/button"
import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { RingChart } from "../bklit/ring-chart";
import { Ring } from "../bklit/ring";
import { RingCenter } from "../bklit/ring-center";

// ═══ APP-PRIMARY — "where did my storage GO?" answered with one ring.
// JOB      show a quota split across categories, legibly
// SIGNATURE Bklit multi-ring: each category is its own progress ring
//           (value/maxValue), hover a legend row lifts its ring + glow and
//           dims the rest; center shows % of quota used (counts up); >85%
//           warning wash pulses behind.
// API       {segments: {label, bytes, color?}[], quota, label?, resetNote?,
//            className?} unchanged. Colors: segment.color wins, else
//           --chart-1..5 in order.
// A11Y      legend carries the numbers; ring svg aria-hidden; live region for %.

export type RingSeg = { label: string; bytes: number; color?: string };
export type StorageRingMeterProps = {
  segments: RingSeg[];
  quota: number;
  label?: string;
  resetNote?: string;
  className?: string;
};

const human = (b: number) =>
  b >= 1073741824
    ? (b / 1073741824).toFixed(1) + " GB"
    : b >= 1048576
      ? Math.round(b / 1048576) + " MB"
      : Math.round(b / 1024) + " KB";

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function StorageRingMeter({
  segments,
  quota,
  label = "STORAGE USED",
  resetNote,
  className,
}: StorageRingMeterProps) {
  const reduce = useReducedMotion();
  const [hi, setHi] = React.useState<number | null>(null);
  const used = segments.reduce((a, s) => a + s.bytes, 0);
  const pct = quota > 0 ? Math.min(1, used / quota) : 0;
  const pctLabel = Math.round(pct * 100);

  // RingData per segment: value/maxValue drives both the arc fraction and the
  // center readout (totalValue = used% when not hovering; segment % on hover).
  const data = React.useMemo(
    () =>
      segments.map((s) => ({
        label: s.label,
        // percent-of-quota contribution so RingCenter reads naturally
        value: quota > 0 ? (s.bytes / quota) * 100 : 0,
        maxValue: 100,
        color: s.color ?? PALETTE[0],
      })),
    [segments, quota]
  );

  const getColor = React.useCallback(
    (index: number) => segments[index]?.color ?? PALETTE[index % PALETTE.length],
    [segments]
  );

  return (
    <div className={cn("relative isolate flex items-center gap-6 overflow-hidden font-sans", className)}>
      <div className="relative size-[170px] shrink-0">
        {pct > 0.85 && (
          <motion.span
            aria-hidden
            animate={reduce ? { opacity: 0.25 } : { opacity: [0.18, 0.34, 0.18] }}
            transition={reduce ? { duration: 0 } : { duration: 2.4, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-[hsl(var(--warn)/0.35)] blur-2xl"
          />
        )}
        <RingChart
          baseInnerRadius={44}
          data={data}
          // controlled hover: legend rows drive it (lift + dim inside Bklit Ring)
          hoveredIndex={hi}
          onHoverChange={setHi}
          ringGap={4}
          size={170}
          strokeWidth={10}
        >
          <Ring color={undefined} index={0} />
          <Ring color={undefined} index={1} />
          <Ring color={undefined} index={2} />
          <Ring color={undefined} index={3} />
          <Ring color={undefined} index={4} />
          <RingCenter
            defaultLabel={label}
            formatOptions={{ maximumFractionDigits: 0 }}
            suffix="%"
            valueClassName="font-display font-semibold tabular-nums leading-none tracking-tight text-[clamp(0.75rem,22cqw,1.875rem)]"
          />
        </RingChart>
      </div>
      <ul className="min-w-0 flex-1 space-y-1">
        {segments.map((s, i) => (
          <li
            key={s.label}
            onBlur={() => setHi(null)}
            onFocus={() => setHi(i)}
            onMouseEnter={() => setHi(i)}
            onMouseLeave={() => setHi(null)}
          >
            <Button type="button" variant="ghost"
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[12px] transition-colors hover:bg-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[hsl(var(--app-focus))]",
                hi === i && "bg-muted/80"
              )}
            >
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-[3px]"
                style={{ background: s.color ?? getColor(i) }}
              />
              <span className="min-w-0 flex-1 truncate font-semibold">{s.label}</span>
              <span className="font-mono tabular-nums text-muted-foreground">
                {human(s.bytes)}
              </span>
            </Button>
          </li>
        ))}
        <li className="flex items-center justify-between px-2 pt-1 text-[11px] text-muted-foreground">
          <span>{pct >= 1 ? "over quota" : `${human(quota - used)} free`}</span>
          {resetNote && <span className="text-[11px] text-muted-foreground">{resetNote}</span>}
        </li>
      </ul>
      <p className="sr-only" aria-live="polite">
        {human(used)} of {human(quota)} used — {pctLabel}%.
      </p>
    </div>
  );
}
