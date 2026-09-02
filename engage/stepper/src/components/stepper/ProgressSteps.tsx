import * as React from "react"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type WizardStep = {
  id: string
  label: string
  /** Optional caption under the dot, e.g. "3 items". */
  detail?: string
}

export type ProgressStepsProps = {
  steps?: WizardStep[]
  /** Index of the active step (0-based). */
  current: number
  onStepClick?: (index: number) => void
  /** Allow jumping to completed steps. Default true. */
  backNavigation?: boolean
  /** Compact mono number badges instead of bare dots on not-done steps. Default false. */
  numbered?: boolean
  className?: string
}

// ── ProgressSteps ────────────────────────────────────────────────────────────
// The multi-step wizard rail that booking/checkout flows wrap their forms in.
// Distinct from the static marketing `Steps` component (UI/steps) and the
// product `roadmap` feed — this is interactive state chrome.

function Check() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
      <path d="M2.5 6.5 5 9l4.5-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}


// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_STEPPER_STEPS = [{ id: "s", label: "Service", detail: "Deep tissue" }, { id: "t", label: "Time", detail: "Tue 16:30" }, { id: "p", label: "Details" }, { id: "d", label: "Done" }]

export function ProgressSteps({
  steps = DEMO_STEPPER_STEPS,
  current,
  onStepClick,
  backNavigation = true,
  numbered = false,
  className,
}: ProgressStepsProps) {
  if (!steps.length) return null
  return (
    <ol className={cn("flex items-center", className)} aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        const reachable = onStepClick && ((done && backNavigation) || active)
        const inner = (
          <>
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-black transition-colors",
                done
                  ? "border-foreground bg-foreground text-background"
                  : active
                    ? "border-foreground bg-background text-foreground ring-2 ring-foreground/20"
                    : "border-border bg-card text-muted-foreground"
              )}
              aria-hidden
            >
              {done ? <Check /> : numbered ? i + 1 : null}
            </span>
            <span className="ms-2 hidden text-left md:block">
              <span className={cn("block text-xs font-bold tracking-tight", active ? "text-foreground" : done ? "text-foreground/80" : "text-muted-foreground")}>{s.label}</span>
              {s.detail && <span className="block font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">{s.detail}</span>}
            </span>
          </>
        )
        return (
          <li key={s.id} className="flex flex-1 items-center last:flex-none" aria-current={active ? "step" : undefined}>
            {onStepClick ? (
              <button
                type="button"
                onClick={() => reachable && onStepClick(i)}
                disabled={!(done || active) || (done && !backNavigation)}
                aria-label={`Step ${i + 1}: ${s.label}${done ? " (completed)" : active ? " (current)" : ""}`}
                className="flex items-center"
              >
                {inner}
              </button>
            ) : (
              <span className="flex items-center">{inner}</span>
            )}
            {i < steps.length - 1 && <span aria-hidden className={cn("mx-3 h-px flex-1 bg-border", done && "bg-foreground/50")} />}
          </li>
        )
      })}
    </ol>
  )
}
