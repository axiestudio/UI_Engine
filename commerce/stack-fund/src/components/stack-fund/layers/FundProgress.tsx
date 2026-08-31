import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

// ── FUND PROGRESS — the honesty band. Raised, goal, backers. ────────────────

export type FundProgressProps = {
  raised?: string
  goal?: string
  percent?: number
  backers?: string
  daysLeft?: string
  className?: string
}

export function FundProgress({ raised = "48 120 kr", goal = "of 75 000 kr", percent = 64, backers = "212 backers", daysLeft = "9 days left", className }: FundProgressProps) {
  const reduce = useReducedMotion()
  return (
    <div className={cn("border-b border-border/60 px-5 py-4", className)}>
      <div className="flex items-baseline justify-between">
        <p className="flex items-baseline gap-1.5">
          <span className="font-display text-[24px] font-black tracking-tight">{raised}</span>
          <span className="font-mono text-[10px] font-semibold text-muted-foreground">{goal}</span>
        </p>
        <span className="font-mono text-[10px] font-bold text-primary tabular-nums">{percent}%</span>
      </div>
      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="Funding progress">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={reduce ? false : { width: 0 }}
          whileInView={{ width: `${percent}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </div>
      <p className="mt-2 flex justify-between font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        <span>{backers}</span>
        <span>{daysLeft}</span>
      </p>
    </div>
  )
}
