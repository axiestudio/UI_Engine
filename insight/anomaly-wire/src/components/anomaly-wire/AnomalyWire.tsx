import * as React from "react"
import { motion } from "motion/react"
import { AlertTriangle, Zap, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"
import { TextShimmer } from "@/components/primitives/text-shimmer"

// ═══ JOB      surface anomalies before they become incidents
// ═══ EMOTION  a live wire — attentive, a little electric
// ═══ SIGNATURE alert wire: rows slide in with a red sweep flash; hovering
//               a row expands it to show the raw signal + assign action
//   SITE      → trust/status storytelling for infra & fintech
//   APP       → alerting surfaces; alerts re-tick via props
//   A11Y      aria-live=assertive on new criticals; expanders keyboard-safe

export type Anomaly = { id: string; at: string; severity: "critical" | "warn"; signal: string; metric: string; value: string }

export type AnomalyWireProps = {
  anomalies?: Anomaly[]
  className?: string
}

const DEFAULTS: Anomaly[] = [
  { id: "a1", at: "09:41", severity: "critical", signal: "Checkout conversion dropped 38% vs 7-day floor", metric: "checkout.conv", value: "1.9% (floor 3.1%)" },
  { id: "a2", at: "09:12", severity: "warn", signal: "p95 latency drifting up on /search", metric: "api.p95", value: "820ms (+34%)" },
  { id: "a3", at: "08:57", severity: "warn", signal: "Signup source mix shifted: paid → organic", metric: "signup.mix", value: "-22pp paid" },
]

const SEV = {
  critical: { icon: AlertTriangle, cls: "text-red-600 dark:text-red-400", chip: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300" },
  warn: { icon: Zap, cls: "text-amber-600 dark:text-amber-400", chip: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300" },
}

export function AnomalyWire({ anomalies = DEFAULTS, className }: AnomalyWireProps) {
  const [open, setOpen] = React.useState<string | null>(null)
  return (
    <SectionShell width={920} className={className}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <MonoLabel className="text-muted-foreground">ANOMALY WIRE · LAST HOUR</MonoLabel>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground">The wire never sleeps.</h2>
        </div>
        <TextShimmer className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground" duration={2.4}>
          ● live · detecting on 41 metrics
        </TextShimmer>
      </div>

      <ul aria-live="assertive" className="mt-10 space-y-3">
        {anomalies.map((a, i) => {
          const S = SEV[a.severity]
          const isOpen = open === a.id
          return (
            <InView key={a.id} once delay={i * 0.1}>
              <li className="relative overflow-hidden rounded-xl border bg-card">
                {/* entry sweep */}
                <motion.span
                  aria-hidden
                  initial={{ x: "-100%" }} animate={{ x: "220%" }}
                  transition={{ duration: 1.1, delay: 0.2 + i * 0.15, ease: "easeOut" }}
                  className={cn("pointer-events-none absolute inset-y-0 w-1/3 skew-x-12", a.severity === "critical" ? "bg-red-500/10" : "bg-amber-500/10")}
                />
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : a.id)}
                  className="relative flex w-full items-center gap-4 px-5 py-4 text-left">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", S.chip)}>
                    <S.icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-[15px] font-bold text-foreground">{a.signal}</span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{a.at} · {a.metric}</span>
                  </span>
                  <span className="hidden shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold tabular-nums text-foreground sm:block">{a.value}</span>
                  <Eye className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-90")} aria-hidden />
                </button>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.3 }} className="overflow-hidden border-t border-dashed">
                    <div className="flex flex-wrap items-center gap-3 px-5 py-4 font-mono text-[11px] text-muted-foreground">
                      <span className="rounded bg-muted px-2 py-1 font-bold text-foreground">{a.metric} {a.value}</span>
                      <span>baseline 7d · seasonal-adjusted · detector v3</span>
                      <span className="ml-auto flex gap-2">
                        <span className="rounded-full bg-foreground px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-background">Acknowledge</span>
                        <span className="rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-foreground">Assign</span>
                      </span>
                    </div>
                  </motion.div>
                )}
              </li>
            </InView>
          )
        })}
      </ul>
    </SectionShell>
  )
}
