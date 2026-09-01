import * as React from "react"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
  { date: "2026-08-24", title: "SMS gateway — EU delivery delays, cleared 14:20" },
  { date: "2026-07-19", title: "Bookings API — 22 min elevated 500s during deploy" },
]

const dayDate = (i: number) =>
  new Date(Date.now() - (DAYS - 1 - i) * 86_400_000).toISOString().slice(0, 10)

export function StatusPage({
  eyebrow = "Insight · Status page",
  title = "All systems, ninety days.",
  subtitle = "Four services. The faded bars had a bad day — hover one to see which.",
  caption = "90-day window",
  tone = "paper",
  services = DEFAULT_SERVICES,
  incidents = DEFAULT_INCIDENTS,
  className,
}: StatusPageProps) {
  const ink = tone === "ink"
  const hair = ink ? "border-background/15" : "border-border"
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  const overall = services.some((s) => s.state !== "operational") ? "degraded" : "operational"
  const avgUptime = (services.reduce((acc, s) => acc + parseFloat(s.uptime), 0) / Math.max(1, services.length)).toFixed(2)

  return (
    <section className={cn("relative isolate w-full overflow-hidden", ink && "bg-foreground", className)}>
      <div
        className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")}
        style={{ maxWidth: 920, ["--shell-w" as string]: "920px" }}
      >
        <InView
          once
          variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <header className={cn("relative")}>
            {eyebrow && (
              <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", ink ? "text-background/55" : "text-muted-foreground")}>
                <span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />
                {eyebrow}
              </span>
            )}
            <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", ink ? "text-background" : "text-foreground")}>{title}</h2>
            {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", ink ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
          </header>
        </InView>

        <InView
          once
          variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.08 }}
        >
          <div className="mt-8 flex flex-wrap items-start gap-3">
            <Card className="w-[min(100%,340px)]">
              <CardHeader className="pb-2">
                <CardDescription>Live state</CardDescription>
                <CardTitle className="flex items-center gap-2">
                  {overall === "operational" ? (
                    <CheckCircle2 aria-hidden className="size-5 text-success" />
                  ) : (
                    <AlertTriangle aria-hidden className="size-5 text-warning" />
                  )}
                  {overall === "operational" ? "Operational" : "Degraded"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="font-mono text-[12px] font-medium tabular-nums text-muted-foreground">{services.length} services · avg {avgUptime}% · {incidents.length} incidents</p>
              </CardContent>
            </Card>
            <div className="flex flex-wrap gap-1.5">
              {services.map((svc) => (
                <Badge
                  key={svc.name}
                  variant="outline"
                  className={cn("font-mono", !ink && svc.state === "degraded" && "border-warning/30 text-warning-foreground")}
                  data-state={svc.state}
                >
                  <span aria-hidden className={cn("size-1.5 rounded-full", svc.state === "operational" ? "bg-success" : "bg-warning")} />
                  {svc.name}
                </Badge>
              ))}
            </div>
          </div>
        </InView>

        <InView
          once
          variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.12 }}
        >
          <div className="mt-10">
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <ul className={cn("divide-y", hair)}>
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
                          <span aria-hidden className={cn("size-1.5 rounded-full", operational ? "bg-success" : "bg-warning")} />
                          {operational ? "Operational" : "Degraded"}
                        </span>
                      </div>

                      <div>
                        <div aria-hidden className="flex h-4 gap-[2px] overflow-hidden">
                          {Array.from({ length: DAYS }, (_, i) => (
                            <span
                              key={i}
                              title={`${dayDate(i)} — ${degraded.has(i) ? "Degraded" : "Operational"}`}
                              className={cn("w-1 shrink-0 rounded-sm", degraded.has(i) ? "bg-warning/50" : "bg-success/60")}
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
            </div>

            <div className="mt-12">
              <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", ink ? "text-background/55" : "text-muted-foreground")}>
                <span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />
                Incidents
              </span>
              <div className="mt-4 grid gap-3">
                {incidents.map((inc) => (
                  <div key={inc.title} className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[12px] border bg-card px-4 py-3.5", ink ? "border-background/15" : "border-border")}>
                    <span className="font-mono text-[12px] font-bold tabular-nums text-muted-foreground">{inc.date}</span>
                    <span className="min-w-0 flex-1 text-sm font-medium">{inc.title}</span>
                    <Badge variant="outline" className="rounded-full font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Resolved
                    </Badge>
                  </div>
                ))}
              </div>
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
      </div>
    </section>
  )
}
