import * as React from "react"
import { ArrowUpRight, MapPin } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Badge } from "@/components/ui/badge"
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

// ── Sub components ───────────────────────────────────────────────────────────

function JobRow({ job, ink, applyLabel }: { job: Job; ink: boolean; applyLabel: string }) {
  return (
    <a
      href={job.href}
      className={cn(
        "group flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border px-5 py-4 transition-all sm:px-6",
        ink ? "border-background/15 bg-transparent hover:border-background/35 hover:bg-background/5" : "border-border bg-card hover:border-foreground/25 hover:shadow-md",
      )}
    >
      <div className="min-w-0 flex-1">
        <h3 className={cn("truncate font-display text-base font-extrabold tracking-tight sm:text-lg", ink ? "text-background" : "text-foreground")}>
          {job.title}
        </h3>
        <p className={cn("mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-medium", ink ? "text-background/55" : "text-muted-foreground")}>
          {job.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" />
              {job.location}
            </span>
          )}
          {job.type && <span>{job.type}</span>}
        </p>
      </div>
      {job.department && (
        <Badge
          variant="outline"
          className={cn("rounded-full px-2.5 font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "border-background/25 text-background/70" : "bg-secondary text-muted-foreground")}
        >
          {job.department}
        </Badge>
      )}
      <span className={cn("inline-flex items-center gap-1 text-sm font-bold", ink ? "text-background" : "text-foreground")}>
        {applyLabel}
        <ArrowUpRight className={cn("size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5")} />
      </span>
    </a>
  )
}

// ── Careers ──────────────────────────────────────────────────────────────────

export function Careers({
  eyebrow,
  title = "Join the team",
  subtitle = "We're a small team doing careful work. If a role below sounds like you, we'd love to read your application.",
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
    <section className={cn(ink && "bg-foreground", "w-full", className)} aria-label={title}>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <header className="mb-10 max-w-2xl sm:mb-14">
          {eyebrow && (
            <Badge
              variant="outline"
              className={cn(
                "mb-4 rounded-full border px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest",
                ink ? "border-background/25 bg-transparent text-background/80" : "bg-secondary text-muted-foreground",
              )}
            >
              {eyebrow}
            </Badge>
          )}
          <h2 className={cn("font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl", ink ? "text-background" : "text-foreground")}>
            {title}
          </h2>
          <p className={cn("mt-3 text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>
            {subtitle}
          </p>
        </header>

        <div className="flex flex-col gap-10">
          {groups.map(([department, items]) => (
            <div key={department}>
              {hasDepartments && grouped && (
                <p className={cn("mb-3 font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>
                  {department}
                  <span className="ml-2 opacity-60">{items.length}</span>
                </p>
              )}
              <div className="flex flex-col gap-3">
                {items.map((job, i) => (
                  <InView
                    key={job.id ?? job.title}
                    variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.25), ease: [0.16, 1, 0.3, 1] }}
                    viewOptions={{ once: true, margin: "-40px" }}
                  >
                    <JobRow job={job} ink={ink} applyLabel={applyLabel} />
                  </InView>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
