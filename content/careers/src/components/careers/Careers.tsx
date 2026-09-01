import * as React from "react"
import { ArrowUpRight, MapPin } from "lucide-react"
import { Grain, Ordinal, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type Job = {
  title: string
  department?: string
  location?: string
  type?: string
  href: string
  id?: string
}

export type CareersProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  jobs: Job[]
  /** Group rows by department. Default true when departments present. */
  grouped?: boolean
  applyLabel?: string
  tone?: "paper" | "ink"
  className?: string
}

// ── Careers ──────────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · Jobs are a LEDGER, not a card grid: full-width rows separated by hairlines,
//   ordinal at the left, department as a right-aligned mono tag. Hover slides
//   the whole row right by 6px — like pulling a file from a drawer.
// · Department groups get a mono count ("engineering · 2 open") — a hiring
//   signal, not decoration.
// · The sign-off echoes the steps/changelog family: dashed rule + italic line.
export function Careers({
  eyebrow = "Careers",
  title = "Do the best work of your life",
  subtitle = "Small team, real ownership, careful craft. If a role below sounds like you, we read every application.",
  jobs,
  grouped = true,
  applyLabel = "Apply",
  tone = "paper",
  className,
}: CareersProps) {
  if (!jobs.length) return null
  const ink = tone === "ink"
  const hasDepartments = jobs.some((j) => j.department)
  const groups = hasDepartments && grouped
    ? Object.entries(
        jobs.reduce<Record<string, Job[]>>((acc, job) => {
          const key = job.department ?? "Other"
          ;(acc[key] ??= []).push(job)
          return acc
        }, {}),
      )
    : [["All roles", jobs] as [string, Job[]]]

  return (
    <SectionShell tone={tone} width={920} rails padding="roomy" className={className}>
      <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} index="02" tone={tone} />

      <div className="mt-12 flex flex-col gap-12">
        {groups.map(([department, items]) => (
          <div key={department}>
            {hasDepartments && grouped && (
              <p className={cn("mb-2 flex items-baseline justify-between font-mono text-[11px] font-bold uppercase tracking-[0.2em]", ink ? "text-background/50" : "text-muted-foreground")}>
                <span>{department}</span>
                <span className="opacity-60">{items.length} open</span>
              </p>
            )}
            <div className={cn("flex flex-col border-t", ink ? "border-background/10" : "border-border")}>
              {items.map((job, i) => (
                <InView
                  key={job.id ?? job.title}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.25), ease: [0.16, 1, 0.3, 1] }}
                  viewOptions={{ once: true, margin: "-40px" }}
                >
                  <a
                    href={job.href}
                    className={cn(
                      "group flex items-center gap-5 border-b px-2 py-5 transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1.5 sm:gap-7 sm:px-4",
                      ink ? "border-background/10 hover:bg-background/5" : "border-border hover:bg-secondary/60",
                    )}
                  >
                    <Ordinal n={i + 1} className={cn("hidden shrink-0 sm:block", ink ? "text-background/50" : "text-muted-foreground/70")} />
                    <div className="min-w-0 flex-1">
                      <h3 className={cn("truncate font-display text-lg font-bold tracking-[-0.02em] sm:text-xl", ink ? "text-background" : "text-foreground")}>
                        {job.title}
                      </h3>
                      <p className={cn("mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]", ink ? "text-background/50" : "text-muted-foreground")}>
                        {job.location && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3" />
                            {job.location}
                          </span>
                        )}
                        {job.type && <span>{job.type}</span>}
                      </p>
                    </div>
                    {job.department && (
                      <span className={cn("hidden shrink-0 border px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] sm:block", ink ? "border-background/25 text-background/60" : "border-border text-muted-foreground")}>
                        {job.department}
                      </span>
                    )}
                    <span className={cn("inline-flex shrink-0 items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", ink ? "text-background" : "text-foreground")}>
                      {applyLabel}
                      <ArrowUpRight className={cn("size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5", ink ? "text-background/60" : "text-muted-foreground")} />
                    </span>
                  </a>
                </InView>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={cn("mt-14 flex items-center gap-4", ink ? "text-background/40" : "text-muted-foreground/60")}>
        <span className="h-px flex-1 border-t border-dashed border-current opacity-50" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em]">no role fits? write us anyway</span>
        <span className="h-px flex-1 border-t border-dashed border-current opacity-50" />
      </div>
    </SectionShell>
  )
}
