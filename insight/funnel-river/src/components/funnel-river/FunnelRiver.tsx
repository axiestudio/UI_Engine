import * as React from "react"
import { motion } from "motion/react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      show where people drop, and let curiosity open the why
// ═══ EMOTION  a river narrowing — you feel the flow tighten
// ═══ SIGNATURE funnel bands as liquid bars; clicking a stage expands a
//               "drop reasons" drawer with a dripping connector
//   SITE      → case studies, product pages
//   APP       → analytics surfaces; stages are props
//   A11Y      accordion semantics (button + aria-expanded); counts as text

export type FunnelStage = { label: string; count: number; reasons?: string[] }

export type FunnelRiverProps = {
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

export function FunnelRiver({ stages = DEFAULT_STAGES, className }: FunnelRiverProps) {
  const [open, setOpen] = React.useState<number | null>(null)
  const top = stages[0]?.count || 1
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  return (
    <SectionShell width={920} className={className}>
      <MonoLabel className="text-muted-foreground">FUNNEL · THE RIVER</MonoLabel>
      <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">Follow the water. Find the leaks.</h2>

      <div className="mt-10 space-y-2">
        {stages.map((s, i) => {
          const pct = (s.count / top) * 100
          const prev = i === 0 ? null : stages[i - 1].count
          const isOpen = open === i
          return (
            <InView key={s.label} once delay={i * 0.06}>
              <div>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group relative block w-full text-left"
                >
                  <motion.div
                    initial={reduce ? {} : { width: 0, opacity: 0 }}
                    whileInView={{ width: `${Math.max(pct, 22)}%`, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className={cn("flex items-center justify-between gap-4 overflow-hidden rounded-xl border bg-card px-5 py-4",
                      isOpen ? "border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))]" : "group-hover:border-foreground/50")}
                  >
                    <span className="flex min-w-0 items-baseline gap-3">
                      <span className="font-mono text-[10px] font-black text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                      <span className="truncate font-display text-base font-bold text-foreground">{s.label}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="font-display text-lg font-black tabular-nums text-foreground">{s.count.toLocaleString()}</span>
                      {prev && <span className="font-mono text-[10px] font-bold text-muted-foreground">{Math.round((s.count / prev) * 100)}%</span>}
                      <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} aria-hidden />
                    </span>
                  </motion.div>
                </button>
                {isOpen && s.reasons && (
                  <motion.div
                    initial={reduce ? {} : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="ml-[8%] mt-1 flex flex-wrap items-center gap-2 rounded-xl border border-dashed bg-muted/30 px-4 py-3" style={{ width: `${Math.max(pct, 30)}%` }}>
                      <span className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">drops here ·</span>
                      {s.reasons.map((r) => (
                        <span key={r} className="rounded-full border bg-background px-2.5 py-1 font-mono text-[10px] font-bold text-foreground">{r}</span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </InView>
          )
        })}
      </div>
    </SectionShell>
  )
}
