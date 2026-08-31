import * as React from "react"
import { motion } from "motion/react"
import { CalendarPlus, Download, LifeBuoy, TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, Grain } from "@/components/primitives/handcraft"
import { DragNumberField } from "drag-number-field"
import { RadialGauge } from "radial-gauge"
import { ActivityHeatmap, type HeatCell } from "activity-heatmap"
import { EventTimelineDay, type TimelineEvent } from "event-timeline-day"
import { CitationHoverCard, type Source } from "citation-hover-card"

// COMPOSITE SCREEN · CSM BOOK OF BUSINESS
// composed of: drag-number-field (health odometer), radial-gauge (quota ring),
// activity-heatmap (usage heat), event-timeline-day (check-in timeline),
// citation-hover-card (renewal notes backed by cites) + purpose-built account
// book rail.
//
// DESIGN BAR: header strip ≤48px · labels 11px semibold uppercase 12% tracking
// · body 13px · numerics 12px mono tabular right · panels rounded-lg with 36px
// header strips · motion marks state changes only.

export type Account = {
  id: string
  name: string
  arr: number
  health: number
  healthLast: number
  seatsUsed: number
  seatsBought: number
  tier: "enterprise" | "growth"
}

export type CustomerHealthDeskProps = {
  accounts?: Account[]
  onBookCheckIn?: (account: Account) => void
  className?: string
}

const DEFAULT_ACCOUNTS: Account[] = [
  { id: "a1", name: "Nordbro Bank", arr: 1_240_000, health: 74, healthLast: 81, seatsUsed: 318, seatsBought: 400, tier: "enterprise" },
  { id: "a2", name: "Klara Logistics", arr: 412_000, health: 58, healthLast: 60, seatsUsed: 96, seatsBought: 120, tier: "growth" },
  { id: "a3", name: "Vasa Försäkring", arr: 890_000, health: 91, healthLast: 88, seatsUsed: 201, seatsBought: 210, tier: "enterprise" },
]

const TIMELINES: Record<string, TimelineEvent[]> = {
  a1: [
    { id: "t1", at: "2026-08-12T09:30:00", actor: "R. Ek (CSM)", kind: "comment", text: "QBR: CFO signed off on the platform fee — renewal shaping at current terms." },
    { id: "t2", at: "2026-08-08T15:10:00", actor: "platform", kind: "alert", text: "Sandbox rate-limit incident — 214 support tickets, macro shipped." },
    { id: "t3", at: "2026-08-04T11:00:00", actor: "N. Berg (admin)", kind: "edit", text: "SSO groups re-mapped; 22 dormant seats reclaimed." },
    { id: "t4", at: "2026-07-28T13:45:00", actor: "release train", kind: "deploy", text: "2026.31 adopted — audit-log export now self-serve." },
  ],
  a2: [
    { id: "t5", at: "2026-08-11T10:00:00", actor: "R. Ek (CSM)", kind: "comment", text: "Champion moved roles — new ops lead is warm, intro call booked." },
    { id: "t6", at: "2026-08-06T09:20:00", actor: "platform", kind: "alert", text: "Usage below floor for 3 straight weeks — playbook triggered." },
  ],
  a3: [
    { id: "t7", at: "2026-08-13T08:15:00", actor: "L. Saa (CSM)", kind: "comment", text: "Expansion signal: claims team asked for 40 more seats in December." },
    { id: "t8", at: "2026-08-07T16:40:00", actor: "release train", kind: "deploy", text: "2026.32 adopted cleanly, no tickets in 48 h." },
  ],
}

const SOURCES: Source[] = [
  { n: 1, title: "QBR deck · Nordbro · 12 Jun", domain: "gdrive", snippet: "CFO slide: platform fee held, expansion deferred to FY27 — recorded by R. Ek" },
  { n: 2, title: "Support summary · wk33", domain: "desk.internal", snippet: "rate-limit incident postmortem: goodwill credits issued, churn risk revised to low-medium" },
  { n: 3, title: "Usage export · seats", domain: "warehouse.internal", snippet: "318 of 400 seats active 30-day; sandbox tenancy excluded" },
]

const healthCells = (seed: string, health: number): HeatCell[] => {
  const base = seed.split("").reduce((a, c) => a + c.charCodeAt(0) * 7, 0)
  return Array.from({ length: 18 * 7 }, (_, i) => {
    const v = Math.sin(base * 0.11 + i * 1.7) * 0.5 + 0.5
    const weekly = i % 7 > 4 ? 0.35 : 1
    return { count: v * weekly * 100 < health - 25 ? 0 : v * weekly * 100 < health ? 1 : 2 }
  })
}

const level = (c: number): 0 | 1 | 2 | 3 | 4 => (c === 0 ? 0 : c < 60 ? 1 : c < 90 ? 2 : c < 110 ? 3 : 4)

export function CustomerHealthDesk({ accounts = DEFAULT_ACCOUNTS, onBookCheckIn, className }: CustomerHealthDeskProps) {
  const [book, setBook] = React.useState(accounts)
  const [activeId, setActiveId] = React.useState(accounts[0]?.id ?? "a1")
  const active = book.find((a) => a.id === activeId) ?? book[0]
  const events = TIMELINES[active.id] ?? []
  const seatPct = Math.round((active.seatsUsed / active.seatsBought) * 100)
  const delta = active.health - active.healthLast

  const setHealth = (v: number) => setBook((bs) => bs.map((a) => (a.id === active.id ? { ...a, health: v } : a)))

  return (
    <div className={cn("relative isolate flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <Grain opacity={0.03} />

      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Customer health</h2>
        <span className="text-[12px] text-muted-foreground">{active.name}</span>
        <span className="text-[12px] text-muted-foreground">· {active.tier} · ARR {active.arr.toLocaleString()} kr</span>
        <span className={cn("ml-2 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold", delta >= 0 ? "text-[hsl(var(--ok))]" : "text-[hsl(var(--err))]")}>
          {delta >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />} {delta >= 0 ? "+" : ""}{delta} vs Jun
        </span>
        <button onClick={() => onBookCheckIn?.(active)} className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"><CalendarPlus className="size-3.5" /> Book check-in</button>
        <button className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"><Download className="size-3.5" /> Export book</button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[280px_minmax(0,1fr)_330px]">
        {/* left — book of business + odometer + ring */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Book of business</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{book.length} accounts</span>
            </header>
            <div className="grid gap-1 p-2">
              {book.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setActiveId(a.id)}
                  className={cn("flex items-center justify-between rounded-md px-2 py-1.5 text-left text-[12px] hover:bg-muted/50", a.id === activeId && "bg-accent text-accent-foreground")}
                >
                  <span className="font-medium">{a.name}</span>
                  <span className={cn("font-mono text-[12px] tabular-nums", a.health < 60 ? "text-[hsl(var(--err))]" : a.health < 75 ? "text-[hsl(var(--warn))]" : "text-[hsl(var(--ok))]")}>{a.health}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Health odometer</span>
              <MonoLabel tick={false} className="text-[10px] text-muted-foreground">drag to adjust</MonoLabel>
            </header>
            <div className="p-3">
              <DragNumberField label="health score" value={active.health} onValueChange={setHealth} min={0} max={100} precision={0} unit="/100" className="text-[13px]" />
              <p className="mt-2 border-t pt-2 text-[11px] text-muted-foreground">{active.health < 60 ? "Playbook: executive sponsor call within 10 days." : active.health < 75 ? "Playbook: usage review at next check-in." : "Playbook: standard cadence, expansion signals welcome."}</p>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Quota ring</header>
            <div className="flex items-center gap-3 p-3">
              <RadialGauge value={active.seatsUsed} max={active.seatsBought} label="seats" unit={`/${active.seatsBought}`} precision={0} size={92} zones={[{ to: 70, color: "hsl(var(--ok))" }, { to: 90, color: "hsl(var(--warn))" }, { to: 100, color: "hsl(var(--err))" }]} className="shrink-0" />
              <div className="min-w-0 space-y-1 text-[12px]">
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">used</span><span className="font-mono tabular-nums">{active.seatsUsed}</span></div>
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">contracted</span><span className="font-mono tabular-nums">{active.seatsBought}</span></div>
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">headroom</span><span className="font-mono tabular-nums">{active.seatsBought - active.seatsUsed}</span></div>
              </div>
            </div>
          </section>
        </aside>

        {/* centre — usage heat + renewal notes */}
        <section className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Usage heat · daily actives vs health</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">18 wks</span>
            </header>
            <div className="p-3">
              <ActivityHeatmap cells={healthCells(active.id, active.health)} weeks={18} levelOf={level} />
              <div className="mt-2 flex gap-1.5 border-t pt-2 text-[11px] text-muted-foreground">
                <LifeBuoy className="size-3.5" /> Weekends read low for {active.tier} — the floor alert ignores Sat/Sun.
              </div>
            </div>
          </section>

          <section className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Renewal notes · {active.name}</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">renews 01 Nov</span>
            </header>
            <div className="space-y-2.5 p-4 text-[13px] leading-relaxed">
              <motion.p key={active.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                Seat adoption is at {seatPct}% of contracted volume{" "}
                <CitationHoverCard sources={[SOURCES[2]]} className="underline decoration-dotted underline-offset-4">
                  with sandbox tenancy excluded from the 30-day active count.
                </CitationHoverCard>{" "}
                The June QBR settled the platform fee at current terms{" "}
                <CitationHoverCard sources={[SOURCES[0]]} className="underline decoration-dotted underline-offset-4">
                  with expansion deferred to FY27.
                </CitationHoverCard>{" "}
                The August rate-limit incident drew 214 tickets but churn risk was revised to low-medium{" "}
                <CitationHoverCard sources={[SOURCES[1]]} className="underline decoration-dotted underline-offset-4">
                  after goodwill credits and the support macro shipped.
                </CitationHoverCard>
              </motion.p>
              <p className="border-t pt-2.5 text-[12px] text-muted-foreground">Hover the dotted spans to see the underlying cites · notes sync to the CRM at 18:00.</p>
            </div>
          </section>
        </section>

        {/* right — check-in timeline */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Check-in timeline</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{events.length} entries</span>
            </header>
            <div className="min-h-0 p-3">
              <EventTimelineDay events={events} groupBy={(e) => new Date(e.at).toLocaleDateString([], { day: "numeric", month: "short" })} />
            </div>
          </section>
          <p className="px-1 text-[11px] text-muted-foreground">Timeline merges CSM notes, platform alerts and release adoptions for the account.</p>
        </aside>
      </div>
    </div>
  )
}
