import * as React from "react"
import { cn } from "@/lib/utils"

// ── PROOF METRICS — the first filling. A band of honest numbers. ────────────

export type ProofMetric = { value: string; label: string }

export type ProofMetricsProps = {
  items: ProofMetric[]
  className?: string
}

export function ProofMetrics({ items, className }: ProofMetricsProps) {
  return (
    <dl className={cn("grid grid-cols-3 border-t border-border/60", className)}>
      {items.map((m, i) => (
        <div key={m.label} className={cn("px-4 py-3.5", i > 0 && "border-l border-border/60")}>
          <dt className="order-2 mt-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{m.label}</dt>
          <dd className="font-display text-[20px] font-black tabular-nums tracking-tight">{m.value}</dd>
        </div>
      ))}
    </dl>
  )
}
