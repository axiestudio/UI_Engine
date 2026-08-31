import * as React from "react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB         Answer "is it just me?" before anyone files a ticket.
// ═══ EMOTION     Ninety quiet squares, the odd faded one owning its bad day.
// ═══ SIGNATURE   One w-1 bar per day per service — hover for the date —
//                 plus a live state pill and an incidents ledger beneath.

export type StatusService = {
  name: string
  /** e.g. "99.98%" */
  uptime: string
  state: "operational" | "degraded"
  /** Day indices (0 = 89 days ago … 89 = today) that ran degraded. */
  degradedDays: number[]
}

export type StatusIncident = {
  date: string
  title: string
}

export type StatusPageProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  caption?: string
  tone?: "paper" | "ink"
  services?: StatusService[]
  incidents?: StatusIncident[]
  className?: string
}

const DAYS = 90

const DEFAULT_SERVICES: StatusService[] = [
  { name: "Bookings API", uptime: "99.98%", state: "operational", degradedDays: [43, 44] },
  { name: "SMS gateway", uptime: "99.71%", state: "degraded", degradedDays: [12, 13, 58, 89] },
  { name: "Payments", uptime: "99.95%", state: "operational", degradedDays: [30] },
  { name: "Media CDN", uptime: "100%", state: "operational", degradedDays: [] },
]

const DEFAULT_INCIDENTS: StatusIncident[] = [
  { date: "2026-08-24", title: "SMS gateway — delivery delays to EU carriers, backlog cleared by 14:20" },
  { date: "2026-07-19", title: "Bookings API — elevated 500s during a deploy window, 22 minutes" },
]

const dayDate = (i: number) =>
  new Date(Date.now() - (DAYS - 1 - i) * 86_400_000).toISOString().slice(0, 10)

export function StatusPage({
  eyebrow = "Insight · Status page",
  title = "All four services humming.",
  subtitle = "One strip per service, ninety days deep. Solid bars are healthy days, faded ones degraded — hover a bar for its date.",
  caption = "90-DAY WINDOW · UPDATED HOURLY · STATUS.QUIETTIMES.STUDIO",
  tone = "paper",
  services = DEFAULT_SERVICES,
  incidents = DEFAULT_INCIDENTS,
  className,
}: StatusPageProps) {
  const ink = tone === "ink"
  const hair = ink ? "border-background/15" : "border-border"
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  return (
    <SectionShell tone={tone} width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.1 }}>
        <div className="mt-10">
          <ul className={cn("divide-y border-y", hair)}>
            {services.map((svc) => {
              const degraded = new Set(svc.degradedDays)
              const operational = svc.state === "operational"
              return (
                <li key={svc.name} className="grid gap-3 py-5 lg:grid-cols-[190px_1fr_76px] lg:items-center lg:gap-6">
                  <div>
                    <p className="text-sm font-semibold">{svc.name}</p>
                    <span
                      className={cn(
                        "mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
                        hair,
                        operational ? "text-muted-foreground" : "text-foreground",
                      )}
                    >
                      <span aria-hidden className={cn("size-1.5 rounded-full", operational ? "bg-primary" : "bg-primary/40")} />
                      {operational ? "Operational" : "Degraded"}
                    </span>
                  </div>

                  <div>
                    <div aria-hidden className="flex h-4 gap-[2px] overflow-hidden">
                      {Array.from({ length: DAYS }, (_, i) => (
                        <span
                          key={i}
                          title={`${dayDate(i)} — ${degraded.has(i) ? "Degraded" : "Operational"}`}
                          className={cn("w-1 shrink-0 rounded-sm", degraded.has(i) ? "bg-primary/30" : "bg-primary")}
                        />
                      ))}
                    </div>
                    <p className="sr-only">
                      {svc.name}: {svc.uptime} uptime over the last {DAYS} days — {svc.degradedDays.length} degraded{" "}
                      {svc.degradedDays.length === 1 ? "day" : "days"}.
                    </p>
                  </div>

                  <p className="font-mono text-[13px] font-bold tabular-nums lg:text-right">{svc.uptime}</p>
                </li>
              )
            })}
          </ul>

          <div className="mt-12">
            <MonoLabel className={cn(ink && "text-background/60")}>Recent incidents</MonoLabel>
            <ul className="mt-4 space-y-3">
              {incidents.map((inc) => (
                <li key={inc.title} className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[12px] border bg-card px-4 py-3.5", ink ? "border-background/15" : "border-border")}>
                  <span className="font-mono text-[12px] font-bold tabular-nums text-muted-foreground">{inc.date}</span>
                  <span className="min-w-0 flex-1 text-sm font-medium">{inc.title}</span>
                  <span className={cn("rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground", hair)}>
                    Resolved
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p
            className={cn(
              "mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
              ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
            )}
          >
            <span>{caption}</span>
            <span aria-hidden>●</span>
          </p>
        </div>
      </InView>
    </SectionShell>
  )
}
