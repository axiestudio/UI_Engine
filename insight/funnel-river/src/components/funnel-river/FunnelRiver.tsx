import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"

export type FunnelStage = { label: string; count: number; reasons?: string[] }

export type FunnelRiverProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  stages?: FunnelStage[]
  className?: string
}

const DEFAULT_STAGES: FunnelStage[] = [
  { label: "Visited pricing", count: 12400, reasons: ["Cold traffic", "Ads fatigue"] },
  { label: "Started trial", count: 4820, reasons: ["Card required", "Unclear setup"] },
  { label: "Activated (3 actions)", count: 2110, reasons: ["Missing data import", "No invite flow"] },
  { label: "Upgraded to paid", count: 904, reasons: ["Price anchoring", "Seat math"] },
  { label: "Retained month 2", count: 812, reasons: ["Champion left", "Renewal surprise"] },
]

export function FunnelRiver({
  eyebrow = "FUNNEL · THE RIVER",
  title = "Conversion funnel",
  subtitle = "Width shows share of the initial cohort. Open a stage to see drop reasons.",
  stages = DEFAULT_STAGES,
  className,
}: FunnelRiverProps) {
  const [open, setOpen] = React.useState<number | null>(null)
  const top = stages[0]?.count || 1
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  return (
    <SectionShell width={920} className={className}>
      <MonoLabel className="text-muted-foreground">{eyebrow}</MonoLabel>
      <h2 className="mt-3 font-display text-[28px] font-semibold leading-[1.05] tracking-[-0.022em] text-foreground sm:text-[34px]">{title}</h2>
      {subtitle && <p className="mt-2 max-w-[56ch] text-[13px] leading-6 text-muted-foreground">{subtitle}</p>}

      <div className="mt-8 space-y-3">
        {stages.map((s, i) => {
          const pct = (s.count / top) * 100
          const prev = i === 0 ? null : stages[i - 1].count
          const drop = prev ? Math.round((1 - s.count / prev) * 100) : null
          const isOpen = open === i
          const widthPct = Math.max(32, pct)

          return (
            <div key={s.label} className="relative">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`funnel-panel-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group relative block w-full text-left focus-visible:outline-none"
              >
                <motion.div
                  initial={reduce ? undefined : { opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  style={{ width: `${widthPct}%` }}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3.5 shadow-sm transition-colors",
                    isOpen ? "border-foreground/20 ring-1 ring-foreground/10" : "group-hover:border-foreground/15 group-hover:shadow",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg border bg-muted font-mono text-[11px] font-semibold text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate text-[14px] font-semibold leading-none text-foreground">{s.label}</span>
                  </span>

                  <span className="flex shrink-0 items-center gap-3">
                    <span className="text-right">
                      <span className="block font-display text-[15px] font-semibold tabular-nums leading-none tracking-[-0.015em] text-foreground">
                        {s.count.toLocaleString()}
                      </span>
                      {prev && (
                        <span className="font-mono text-[11px] font-medium tabular-nums text-muted-foreground">
                          {Math.round((s.count / prev) * 100)}% kept
                          {drop !== null && drop > 0 ? ` · -${drop}%` : ""}
                        </span>
                      )}
                    </span>
                    <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} aria-hidden />
                  </span>
                </motion.div>
                {/* subtle connector line when open */}
                {isOpen && s.reasons?.length ? (
                  <span aria-hidden className="absolute left-6 top-full h-3 w-px bg-border" />
                ) : null}
              </button>

              <AnimatePresence initial={false}>
                {isOpen && s.reasons?.length ? (
                  <motion.div
                    id={`funnel-panel-${i}`}
                    initial={reduce ? undefined : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduce ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="ml-6 mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-dashed bg-muted/40 px-4 py-3">
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Common drop reasons</span>
                      <span aria-hidden className="h-3 w-px bg-border" />
                      {s.reasons.map((r) => (
                        <span key={r} className="rounded-full border bg-background px-2.5 py-1 font-mono text-[11px] font-medium text-foreground">
                          {r}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* faint track background showing full width reference */}
              <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 -z-10 hidden w-full items-center lg:flex">
                <div className="h-px w-full bg-border/40" />
                <span className="absolute right-0 font-mono text-[10px] font-medium tracking-wide text-muted-foreground/60">{pct.toFixed(0)}% of top</span>
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-4 font-mono text-[11px] font-medium tracking-wide text-muted-foreground">
        Width = share of the opening cohort · Click any stage for the leak breakdown
      </p>
    </SectionShell>
  )
}
