import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      make retention visible as waves, not a spreadsheet
// ═══ EMOTION  pattern recognition — the tide pulls back or holds
// ═══ SIGNATURE cohort heatmap where hovering a cell cross-highlights its
//               row AND column with lighthouse beams; cells pulse on entry
//   SITE      → data-led case studies, investor pages
//   APP       → analytics surfaces; weeks × cohorts are props
//   A11Y      table semantics; sr-only data table; color+opacity encoding

export type CohortWavesProps = {
  cohorts?: string[]
  weeks?: number
  /** retention[c][w] = % retained; w0 = 100 */
  retention?: number[][]
  className?: string
}

const DEFAULT_COHORTS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"]
const DEFAULT_RETENTION = [
  [100, 64, 52, 47, 44, 42],
  [100, 68, 55, 50, 47, 0],
  [100, 71, 58, 53, 0, 0],
  [100, 66, 54, 0, 0, 0],
  [100, 74, 61, 0, 0, 0],
  [100, 70, 0, 0, 0, 0],
]

export function CohortWaves({ cohorts = DEFAULT_COHORTS, weeks = 6, retention = DEFAULT_RETENTION, className }: CohortWavesProps) {
  const [hover, setHover] = React.useState<{ c: number; w: number } | null>(null)
  return (
    <SectionShell width={920} className={className}>
      <MonoLabel className="text-muted-foreground">RETENTION · COHORT WAVES</MonoLabel>
      <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">Who stays, week by week.</h2>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-1" onMouseLeave={() => setHover(null)}>
          <caption className="sr-only">Retention percentage by signup month and week since signup</caption>
          <thead>
            <tr>
              <th scope="col" className="pb-2 text-left font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Cohort</th>
              {Array.from({ length: weeks }, (_, w) => (
                <th key={w} scope="col" className={cn("pb-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.16em]", hover?.w === w ? "text-foreground" : "text-muted-foreground")}>W{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((c, ci) => (
              <tr key={c}>
                <th scope="row" className={cn("pr-3 text-left font-mono text-[11px] font-bold uppercase tracking-[0.14em]", hover?.c === ci ? "text-foreground" : "text-muted-foreground")}>{c} '26</th>
                {Array.from({ length: weeks }, (_, w) => {
                  const v = retention[ci]?.[w] ?? 0
                  const empty = v === 0
                  const active = hover && (hover.c === ci || hover.w === w)
                  const exact = hover?.c === ci && hover?.w === w
                  return (
                    <td key={w}>
                      <motion.button
                        type="button"
                        aria-label={`${c} cohort, week ${w}: ${empty ? "no data" : `${v} percent retained`}`}
                        onMouseEnter={() => setHover({ c: ci, w })}
                        onFocus={() => setHover({ c: ci, w })}
                        initial={{ opacity: 0, scale: 0.85 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: (ci * weeks + w) * 0.012 }}
                        className={cn(
                          "relative h-10 w-full min-w-14 rounded-md font-mono text-[10px] font-bold tabular-nums transition-all",
                          empty ? "border border-dashed border-border bg-transparent text-muted-foreground/40"
                            : active ? "text-background" : "text-foreground",
                          exact && "ring-2 ring-foreground ring-offset-1 ring-offset-background"
                        )}
                        style={!empty ? { backgroundColor: `hsl(var(--foreground) / ${active ? 0.14 + (v / 100) * 0.8 : 0.08 + (v / 100) * 0.5})` } : undefined}
                      >
                        {empty ? "·" : `${v}%`}
                      </motion.button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p aria-live="polite" className="mt-4 h-5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {hover ? `${cohorts[hover.c]} cohort · week ${hover.w}` : "hover a cell to cross-highlight"}
      </p>
    </SectionShell>
  )
}
