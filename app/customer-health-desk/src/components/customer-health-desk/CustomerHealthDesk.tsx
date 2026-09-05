import * as React from "react"
import { motion, MotionConfig } from "motion/react"
import { CalendarPlus, Download, LifeBuoy, TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DragNumberField } from "drag-number-field"
import { RadialGauge } from "radial-gauge"
import { ActivityHeatmap, type HeatCell } from "activity-heatmap"
import { EventTimelineDay, type TimelineEvent } from "event-timeline-day"
import { CitationHoverCard, type Source } from "citation-hover-card"
import { RadarChart } from "radar-chart"
import { AreaChart, Area } from "@/components/bklit/area-chart"
import { Grid } from "@/components/bklit/grid"
import { XAxis } from "@/components/bklit/x-axis"
import { YAxis } from "@/components/bklit/y-axis"
import { ChartTooltip } from "@/components/bklit/tooltip/chart-tooltip"

// COMPOSITE SCREEN · CSM BOOK OF BUSINESS
// composed of: radar-chart (health-dimension hero), bklit AreaChart (vendored,
// weekly usage trend), drag-number-field (health odometer), radial-gauge
// (quota ring), activity-heatmap (daily usage heat), event-timeline-day
// (check-in timeline — fed by the renewal-note composer), citation-hover-card
// (notes backed by cites) + purpose-built account switcher band.
//
// DESIGN BAR: header strip ≤48px · asymmetric 12-col grid · varied panel
// treatments (radar card framing, plain rails, full-width editorial band)
// · all charts recompute from the same account state.

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

const INITIAL_TIMELINES: Record<string, TimelineEvent[]> = {
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

const seedOf = (s: string) => s.split("").reduce((a, c) => a + c.charCodeAt(0) * 7, 0)
const clamp = (v: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v))

const healthCells = (seed: string, health: number): HeatCell[] => {
  const base = seedOf(seed)
  return Array.from({ length: 18 * 7 }, (_, i) => {
    const v = Math.sin(base * 0.11 + i * 1.7) * 0.5 + 0.5
    const weekly = i % 7 > 4 ? 0.35 : 1
    return { count: v * weekly * 100 < health - 25 ? 0 : v * weekly * 100 < health ? 1 : 2 }
  })
}

const level = (c: number): 0 | 1 | 2 | 3 | 4 => (c === 0 ? 0 : c < 60 ? 1 : c < 90 ? 2 : c < 110 ? 3 : 4)

/** 18 weekly actives ending Mon 31 Aug 2026 — deterministic per account, bends toward the live health score. */
const weeklyActives = (a: Account) => {
  const seed = seedOf(a.id)
  const end = Date.UTC(2026, 7, 31)
  return Array.from({ length: 18 }, (_, i) => {
    const wobble = 0.5 + 0.5 * Math.sin(seed * 0.11 + i * 1.7)
    const drift = i / 17
    const raw = a.seatsUsed * (0.45 + 0.35 * wobble) + (a.health - a.healthLast) * 2.4 * drift
    return { date: new Date(end - (17 - i) * 7 * 86_400_000), actives: Math.round(clamp(raw, 1, a.seatsBought)) }
  })
}

export function CustomerHealthDesk({ accounts = DEFAULT_ACCOUNTS, onBookCheckIn, className }: CustomerHealthDeskProps) {
  const [book, setBook] = React.useState(accounts)
  const [activeId, setActiveId] = React.useState(accounts[0]?.id ?? "a1")
  const [timelines, setTimelines] = React.useState<Record<string, TimelineEvent[]>>(INITIAL_TIMELINES)
  const [draft, setDraft] = React.useState("")
  const [cites, setCites] = React.useState<number[]>([])
  const active = book.find((a) => a.id === activeId) ?? book[0]
  const events = timelines[active.id] ?? []
  const seatPct = Math.round((active.seatsUsed / active.seatsBought) * 100)
  const delta = active.health - active.healthLast

  const setHealth = (v: number) => setBook((bs) => bs.map((a) => (a.id === active.id ? { ...a, health: v } : a)))

  // ── health-dimension radar — one state pool feeds hero, trend, ring and heat ──
  const seed = seedOf(active.id)
  const healthDimensions = [
    { label: "Adoption", value: clamp(seatPct) },
    { label: "Support sentiment", value: clamp(52 + 26 * Math.sin(seed * 0.09) + (active.health - 70) * 0.45) },
    { label: "Payment health", value: clamp(58 + 20 * Math.sin(seed * 0.05 + 2) + (active.health - 70) * 0.3) },
    { label: "Engagement depth", value: active.health },
    { label: "Feature breadth", value: clamp(38 + 52 * Math.abs(Math.sin(seed * 0.11 + 1))) },
  ]
  const radarRows = healthDimensions.map((d, i) => ({
    axisLabel: d.label,
    today: Math.round(d.value),
    prev: Math.round(clamp(d.value - delta - (i % 2 === 0 ? 3 : -2))),
  }))
  const trend = React.useMemo(() => weeklyActives(active), [active])
  const trendAvg = Math.round(trend.reduce((s, p) => s + p.actives, 0) / trend.length)
  const trendPeak = trend.reduce((p, c) => (c.actives > p.actives ? c : p), trend[0])

  const toggleCite = (n: number) => setCites((cs) => (cs.includes(n) ? cs.filter((c) => c !== n) : [...cs, n]))

  const logNote = () => {
    const text = draft.trim()
    if (!text) return
    const suffix = cites.length ? ` [${[...cites].sort((a, b) => a - b).map((n) => `cite ${n}`).join(", ")}]` : ""
    const entry: TimelineEvent = {
      id: `n-${active.id}-${Date.now()}`,
      at: new Date().toISOString(),
      actor: "You (CSM)",
      kind: "comment",
      text: text + suffix,
    }
    setTimelines((t) => ({ ...t, [active.id]: [...(t[active.id] ?? []), entry] }))
    setDraft("")
    setCites([])
  }

  const exportBook = () => {
    const csv = [
      "account,tier,arr_ksek,health,seats_used,seats_bought",
      ...book.map((a) => [a.name, a.tier, Math.round(a.arr / 1000), a.health, a.seatsUsed, a.seatsBought].join(",")),
    ].join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    const link = document.createElement("a")
    link.href = url
    link.download = "book-of-business.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={cn("relative isolate flex min-h-[620px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">

      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Customer health</h2>
        <span className="text-[12px] text-muted-foreground">{active.name}</span>
        <span className="text-[12px] text-muted-foreground">· {active.tier} · ARR {active.arr.toLocaleString()} kr</span>
        <span className={cn("ml-2 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold", delta >= 0 ? "text-[hsl(var(--ok))]" : "text-[hsl(var(--err))]")}>
          {delta >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />} {delta >= 0 ? "+" : ""}{delta} vs Jun
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onBookCheckIn?.(active)}>
            <CalendarPlus className="size-3.5" /> Book check-in
          </Button>
          <Button variant="outline" size="sm" onClick={exportBook}>
            <Download className="size-3.5" /> Export book
          </Button>
          
    </div>
      </header>

      {/* book of business — switcher band */}
      <div role="group" aria-label="Book of business" className="flex shrink-0 flex-wrap items-center gap-1.5 border-b bg-background px-4 py-2">
        {book.map((a) => (
          <Button type="button" variant="ghost"
            key={a.id}
            onClick={() => setActiveId(a.id)}
            aria-pressed={a.id === activeId}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] transition-colors",
              a.id === activeId ? "border-accent-foreground/20 bg-accent text-accent-foreground" : "bg-background text-muted-foreground hover:bg-muted/60",
            )}
          >
            <span className="font-medium">{a.name}</span>
            <span className={cn("font-mono text-[11px] tabular-nums", a.health < 60 ? "text-[hsl(var(--err))]" : a.health < 75 ? "text-[hsl(var(--warn))]" : "text-[hsl(var(--ok))]")}>{a.health}</span>
          </Button>
        ))}
        <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">{book.length} accounts</span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 items-start gap-4 overflow-auto p-4 lg:grid-cols-12 lg:auto-rows-fr">
        {/* hero — health-dimension radar + drag odometer */}
        <section className="col-span-1 flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm lg:col-span-5 lg:row-span-2">
          <div className="flex min-h-0 flex-1 items-start justify-center p-2">
            <RadarChart
              data={radarRows}
              series={[
                { key: "today", label: "today" },
                { key: "prev", label: "30 d ago", color: "hsl(var(--muted-foreground))" },
              ]}
              label="HEALTH SIGNAL"
              title={active.name}
              description={`Five health dimensions vs 30 days ago · ${delta >= 0 ? "up" : "down"} ${Math.abs(delta)} pts overall`}
              className="w-full max-w-[380px] rounded-none border-0"
            />
          </div>
          <div className="border-t p-3">
            <DragNumberField label="health score" value={active.health} onValueChange={setHealth} min={0} max={100} precision={0} unit="/100" className="text-[13px]" />
            <p className="mt-2 text-[11px] text-muted-foreground">{active.health < 60 ? "Playbook: executive sponsor call within 10 days." : active.health < 75 ? "Playbook: usage review at next check-in." : "Playbook: standard cadence, expansion signals welcome."}</p>
          </div>
        </section>

        {/* usage trend — vendored Bklit area chart, weekly rollup of the seeded daily heat */}
        <section className="col-span-1 flex flex-col overflow-hidden rounded-lg border bg-card lg:col-span-4">
          <header className="flex h-10 shrink-0 items-center justify-between border-b px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Usage trend · weekly actives</span>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">18 wks</span>
          </header>
          <div className="px-1 pt-2">
            <AreaChart data={trend} margin={{ top: 10, right: 24, bottom: 30, left: 28 }} style={{ height: 170 }}>
              <Grid horizontal numTicksRows={3} vertical={false} />
              <Area dataKey="actives" fillOpacity={0.28} gradientToOpacity={0} />
              <XAxis numTicks={4} />
              <YAxis numTicks={3} />
              <ChartTooltip
                rows={(point) => [{ color: "var(--chart-line-primary)", label: "weekly actives", value: String(point.actives ?? "—") }]}
              />
            </AreaChart>
          </div>
          <div className="mt-auto flex gap-4 border-t px-3 py-2 font-mono text-[11px] tabular-nums text-muted-foreground">
            <span>avg {trendAvg}</span>
            <span>peak {trendPeak.actives} · wk {trend.indexOf(trendPeak) + 1}</span>
            <span>{Math.round((trendAvg / active.seatsBought) * 100)}% of contracted</span>
          </div>
        </section>

        {/* quota ring */}
        <section className="col-span-1 flex flex-col overflow-hidden rounded-lg border bg-card lg:col-span-3">
          <header className="flex h-10 shrink-0 items-center justify-between border-b px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Quota</span>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{seatPct}%</span>
          </header>
          <div className="flex items-start gap-3 p-3">
            <RadialGauge value={active.seatsUsed} max={active.seatsBought} label="seats" unit={`/${active.seatsBought}`} precision={0} size={92} zones={[{ to: 70, color: "hsl(var(--ok))" }, { to: 90, color: "hsl(var(--warn))" }, { to: 100, color: "hsl(var(--err))" }]} className="shrink-0" />
            <div className="min-w-0 space-y-1 text-[12px]">
              <div className="flex justify-between gap-2"><span className="text-muted-foreground">used</span><span className="font-mono tabular-nums">{active.seatsUsed}</span></div>
              <div className="flex justify-between gap-2"><span className="text-muted-foreground">contracted</span><span className="font-mono tabular-nums">{active.seatsBought}</span></div>
              <div className="flex justify-between gap-2"><span className="text-muted-foreground">headroom</span><span className="font-mono tabular-nums">{active.seatsBought - active.seatsUsed}</span></div>
            </div>
          </div>
        </section>

        {/* usage heat — daily actives vs health */}
        <section className="col-span-1 flex flex-col overflow-hidden rounded-lg border bg-card lg:col-span-4">
          <header className="flex h-10 shrink-0 items-center justify-between border-b px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Usage heat · daily actives</span>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">18 wks</span>
          </header>
          <div className="p-3">
            <ActivityHeatmap cells={healthCells(active.id, active.health)} weeks={18} levelOf={level} weekStartDay={1} showTooltip showLegend />
            <div className="mt-2 flex gap-1.5 border-t pt-2 text-[11px] text-muted-foreground">
              <LifeBuoy className="size-3.5" /> Weekends read low for {active.tier} — the floor alert ignores Sat/Sun.
            </div>
          </div>
        </section>

        {/* check-in timeline — receives composer entries */}
        <section className="col-span-1 flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card lg:col-span-3">
          <header className="flex h-10 shrink-0 items-center justify-between border-b px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Check-in timeline</span>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{events.length} entries</span>
          </header>
          <div className="min-h-0 flex-1 overflow-auto p-3">
            <EventTimelineDay events={events} groupBy={(e) => new Date(e.at).toLocaleDateString([], { day: "numeric", month: "short" })} />
          </div>
        </section>

        {/* renewal notes + composer — full-width editorial band */}
        <section className="col-span-1 overflow-hidden rounded-lg border bg-card lg:col-span-12">
          <div className="grid gap-0 lg:grid-cols-12">
            <div className="border-b p-4 lg:col-span-7 lg:border-b-0 lg:border-r">
              <header className="mb-2.5 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Renewal notes · {active.name}</span>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">renews 01 Nov</span>
              </header>
              <div className="space-y-2.5 text-[13px] leading-relaxed">
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
                <p className="border-t pt-2.5 text-[12px] text-muted-foreground">Hover the dotted spans to see the underlying cites · logged notes land on the timeline with their cite tags · notes sync to the CRM at 18:00.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 p-4 lg:col-span-5">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Compose renewal note</span>
              <div className="flex flex-wrap gap-1.5">
                {SOURCES.map((s) => (
                  <Button type="button" variant="ghost"
                    key={s.n}
                    onClick={() => toggleCite(s.n)}
                    aria-pressed={cites.includes(s.n)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 font-mono text-[10px] transition-colors",
                      cites.includes(s.n) ? "border-accent-foreground/20 bg-accent text-accent-foreground" : "bg-background text-muted-foreground hover:bg-muted/60",
                    )}
                    title={s.title}
                  >
                    cite {s.n} · {s.domain}
                  </Button>
                ))}
              </div>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Note for ${active.name} — what moved this week?`}
                rows={3}
                className="min-h-[64px] resize-none rounded-md border bg-background px-2.5 py-2 text-[12px] placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{cites.length ? `${cites.length} cite${cites.length > 1 ? "s" : ""} attached` : "no cites attached"}</span>
                <Button size="xs" variant="default" disabled={!draft.trim()} onClick={logNote}>
                  Log note to timeline
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
          </MotionConfig>
    </div>
  )
}
