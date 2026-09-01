import * as React from "react"
import { motion, MotionConfig } from "motion/react"
import { BookmarkPlus, Download, Table2, TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollProgress } from "@/components/primitives/scroll-progress"
import { AreaChart, Area } from "@/components/bklit/area-chart"
import { Grid } from "@/components/bklit/grid"
import { XAxis } from "@/components/bklit/x-axis"
import { YAxis } from "@/components/bklit/y-axis"
import { ChartTooltip } from "@/components/bklit/tooltip/chart-tooltip"
import { KpiTileLive } from "kpi-tile-live"
import { FunnelStageBars } from "funnel-stage-bars"
import { ActivityHeatmap } from "activity-heatmap"
import { FilterTokenBuilder, type FilterToken } from "filter-token-builder"
import { DateRangePresets, type Range } from "date-range-presets"
import { UndoHistorySlider } from "undo-history-slider"
import { SmartSkeleton } from "smart-skeleton"
import { ToastStack } from "toast-stack"

// COMPOSITE — kpi-tile-live + funnel-stage-bars + activity-heatmap +
// filter-token-builder + date-range-presets + undo-history-slider +
// smart-skeleton + toast-stack, with a scroll-progress spine.
// JOB      be the page the CEO opens on Monday
// MOVE     filters + range RECOMPUTE the whole deck through one deterministic
//          seed — KPIs roll, trend re-anchors, funnel re-splits, heatmap
//          re-blooms; saving a cut lands it on the version rail (scrub to
//          preview old decks)
// LAYOUT   reference BI deck, built for the domain — 12-col asymmetric grid
//          (3/4/5 KPI row · 4/8 funnel-vs-trend split · full-bleed heatmap),
//          sticky filter dock under the masthead, versions band across the
//          bottom. No permuted three-pane template anywhere.

const DAY_MS = 86_400_000
const DECK_END = Date.UTC(2026, 7, 31)

const seedFrom = (parts: (string | number)[]) => {
  let h = 2166136261
  for (const p of parts) for (const c of String(p)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0 }
  return () => { h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0; return (h & 0xffff) / 0xffff }
}
const iso = (d: Date) => d.toISOString().slice(0, 10)
const kr = (v: number) => v.toLocaleString("en-US") + " kr"

export type AnalyticsDeckProps = { title?: string; onExport?: () => void; className?: string }
type Toast = { id: string; title: string; tone?: "ok" | "warn" | "info" }

export function AnalyticsDeck({ title = "Chair Economics — Q4", onExport, className }: AnalyticsDeckProps) {
  const [range, setRange] = React.useState<Range | null>(null)
  const [tokens, setTokens] = React.useState<FilterToken[]>([{ field: "segment", op: "=", value: "all" }])
  const [and, setAnd] = React.useState(true)
  const [cuts, setCuts] = React.useState<{ id: string; at: string; label: string }[]>([
    { id: "c0", at: "09:41", label: "Monday default" }, { id: "c1", at: "10:02", label: "colour only" },
  ])
  const [deck, setDeck] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const push = (title: string, tone: Toast["tone"] = "info") => setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])

  const key = range ? iso(range.from) + iso(range.to) : "all"
  const rand = React.useMemo(() => seedFrom([key, tokens.map((t) => t.value).join(), deck]), [key, tokens, deck])

  // One deterministic rand stream feeds every panel — KPIs first, trend next,
  // then funnel and heat, so a given seed always renders the same deck.
  const kpis = React.useMemo(() => Array.from({ length: 3 }, (_, k) => ({
    v: Math.round(4200 + rand() * 9000 / (k + 1)),
    p: Math.round(4200 + rand() * 9000 / (k + 1)),
  })), [rand])
  const trend = React.useMemo(() => {
    const days = 42
    let base = 5200 + rand() * 2600
    return Array.from({ length: days }, (_, i) => {
      const wobble = (rand() - 0.5) * 1500 + Math.sin(i / 5.5) * 900
      base = Math.max(1400, base + wobble * 0.24)
      return { date: new Date(DECK_END - (days - 1 - i) * DAY_MS), rev: Math.round(base + wobble) }
    })
  }, [rand])
  const funnel = React.useMemo(() => { let v = Math.round(9000 + rand() * 9000); return ["Walked past", "Looked at the board", "Sat down", "Booked the next one"].map((label, i) => { const s = Math.max(180, Math.round(v * (i === 0 ? 1 : rand() * 0.35 + 0.4))); v = s; return { label, value: s } }) }, [rand])
  const heat = React.useMemo(() => Array.from({ length: 154 }, () => ({ count: Math.floor(rand() * 7 * (rand() > 0.55 ? 1 : 0.2)) })), [rand])

  const trendTotal = React.useMemo(() => trend.reduce((s, d) => s + d.rev, 0), [trend])
  const halfA = trend.slice(0, 21).reduce((s, d) => s + d.rev, 0)
  const halfB = trend.slice(21).reduce((s, d) => s + d.rev, 0)
  const trendDelta = Math.round(((halfB - halfA) / halfA) * 100)
  const trendUp = trendDelta >= 0
  const biggestDrop = React.useMemo(() => {
    let worst = 1
    for (let i = 1; i < funnel.length; i++) {
      if ((funnel[i - 1].value - funnel[i].value) / funnel[i - 1].value > (funnel[worst - 1].value - funnel[worst].value) / funnel[worst - 1].value) worst = i
    }
    return funnel[worst].label
  }, [funnel])

  const spin = () => { setLoading(true); setTimeout(() => { setLoading(false); push("deck recomputed", "ok") }, 1300) }
  const onSaveCut = () => { setCuts((c) => [{ id: "u" + c.length, at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), label: "cut " + (c.length + 1) }, ...c]); push("saved to version rail", "ok") }

  return (
    <div className={cn("relative isolate min-h-[620px] overflow-hidden rounded-xl border border-border/70 bg-background", className)}>
      <MotionConfig reducedMotion="user">
      <ScrollProgress />

      {/* masthead — editorial, not a strip: kicker + display title left,
          version badge + real actions right */}
      <header className="flex flex-wrap items-end gap-x-6 gap-y-3 border-b border-border/60 bg-card px-5 pb-4 pt-5">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">BI / DECK 01</p>
          <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight">{title}</h2>
          </MotionConfig>
    </div>
        <span className="ml-auto flex flex-wrap items-center gap-2.5">
          <Badge variant="secondary" className="font-mono text-xs">
            {tokens.length} filter{tokens.length === 1 ? "" : "s"} · {range ? "custom range" : "all time"} · v{deck + 1}
          </Badge>
          <Button variant="outline" size="sm" onClick={onSaveCut}><BookmarkPlus className="size-3.5" /> save cut</Button>
          <Button size="sm" onClick={() => { onExport?.(); push("CSV queued in the job tray", "ok") }}>
            <Download className="size-3.5" /> export
          </Button>
        </span>
      </header>

      {/* filter dock — sticky under the masthead, not a grid row */}
      <div className="sticky top-0 z-20 border-b border-border/60 bg-card/85 px-5 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-4">
          <FilterTokenBuilder
            tokens={tokens}
            onChange={(t) => { setTokens(t); spin() }}
            and={and}
            onAnd={setAnd}
            fields={["segment", "chair", "stylist", "city"]}
          />
          <span className="ml-auto"><DateRangePresets value={range} onChange={(r) => { setRange(r); spin() }} /></span>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {/* KPI row — deliberately uneven spans (3 / 4 / 5); each tile gets its
            own spark colour + height so the row reads as composed, not cloned */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          <SmartSkeleton loading={loading} lines={2} className="lg:col-span-3">
            <KpiTileLive label="Revenue kr" value={kpis[0].v} prev={kpis[0].p} spark={Array.from({ length: 12 }, () => 10 + rand() * 30)} sparkColor="var(--chart-line-primary)" sparkHeight={30} />
          </SmartSkeleton>
          <SmartSkeleton loading={loading} lines={2} className="lg:col-span-4">
            <KpiTileLive label="Covers" value={kpis[1].v} prev={kpis[1].p} spark={Array.from({ length: 12 }, () => 10 + rand() * 30)} sparkColor="var(--chart-2)" sparkHeight={30} />
          </SmartSkeleton>
          <SmartSkeleton loading={loading} lines={2} className="sm:col-span-2 lg:col-span-5">
            <KpiTileLive label="Chair-hours" value={kpis[2].v} prev={kpis[2].p} spark={Array.from({ length: 12 }, () => 10 + rand() * 30)} sparkColor="var(--chart-3)" sparkHeight={30} />
          </SmartSkeleton>
        </div>

        {/* asymmetric 4/8 split — tall vertical funnel rail against the wide
            revenue trend; the trend is a real vendored Bklit area chart that
            replays its reveal + tweens its y-domain whenever the seed changes */}
        <div className="grid gap-4 lg:grid-cols-12">
          <SmartSkeleton loading={loading} lines={5} className="lg:col-span-4">
            <section className="flex h-full min-h-[340px] flex-col rounded-xl border border-border/70 bg-card">
              <div className="px-4 pt-4">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Conversion · street → regular</p>
              </div>
              <div className="min-h-0 flex-1 p-4">
                <FunnelStageBars
                  stages={funnel}
                  orientation="vertical"
                  layers={2}
                  showDropOff
                  topLabel="walk-in → booked"
                />
              </div>
              <p className="border-t border-border/60 px-4 py-2.5 text-[11px] text-muted-foreground">
                {funnel.length} stages · biggest drop at “{biggestDrop}”
              </p>
            </section>
          </SmartSkeleton>

          <SmartSkeleton loading={loading} lines={4} className="lg:col-span-8">
            <section className="flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card">
              <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-4">
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Revenue trend · daily</p>
                  <p className="mt-1.5 font-display text-3xl font-semibold tabular-nums tracking-tight">{kr(trendTotal)}</p>
                </div>
                <motion.span
                  key={trendDelta}
                  initial={{ scale: 1.06 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs font-bold tabular-nums",
                    trendUp ? "bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]" : "bg-[hsl(var(--err)/0.12)] text-[hsl(var(--err))]"
                  )}
                >
                  {trendUp ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                  {trendUp ? "+" : ""}{trendDelta}% · 2nd half vs 1st
                </motion.span>
              </div>
              <div className="min-h-0 flex-1 px-2 pb-1 pt-2">
                <AreaChart
                  data={trend}
                  margin={{ top: 16, right: 18, bottom: 30, left: 4 }}
                  revealSignature={key + String(deck)}
                  status={loading ? "loading" : "ready"}
                  loadingLabel="re-running the deck"
                  style={{ aspectRatio: "auto", height: 252 }}
                >
                  <Grid horizontal numTicksRows={4} />
                  <Area dataKey="rev" fill="var(--chart-line-primary)" stroke="var(--chart-line-primary)" />
                  <XAxis numTicks={6} />
                  <YAxis numTicks={4} />
                  <ChartTooltip
                    rows={(p) => [{ color: "var(--chart-line-primary)", label: "revenue", value: kr(Number(p.rev)) }]}
                  />
                </AreaChart>
              </div>
            </section>
          </SmartSkeleton>
        </div>

        {/* full-bleed heatmap band — weekday rhythm across the whole deck width */}
        <SmartSkeleton loading={loading} lines={3}>
          <section className="overflow-hidden rounded-xl border border-border/70 bg-card">
            <header className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border/60 px-4 py-2.5">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Footfall heatmap · 22 weeks</p>
              <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">busiest cell {Math.max(...heat.map((h) => h.count))} · quiet cell {Math.min(...heat.map((h) => h.count))}</span>
            </header>
            <div className="px-4 py-3">
              <ActivityHeatmap cells={heat} weeks={22} showTooltip showLegend />
            </div>
          </section>
        </SmartSkeleton>

        {/* versions band — full-width, inline label left, rail right */}
        <section className="rounded-xl border border-border/70 bg-card">
          <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
            <div className="flex shrink-0 items-center gap-2 lg:w-56">
              <Table2 aria-hidden className="size-4 text-muted-foreground" />
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Saved cuts</p>
                <p className="text-[11px] text-muted-foreground">scrub to preview · restore to load</p>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <UndoHistorySlider head="deck versions" versions={cuts} render={(v) => (
                <div className="grid h-full grid-cols-3 place-content-center gap-3 p-8 opacity-90"><p aria-hidden className="col-span-3 text-center font-display text-3xl font-semibold tabular-nums tracking-tight">{Math.round(seedFrom([v.id, deck])() * 9000 + 1200).toLocaleString()} kr</p>{[0, 1, 2].map((i) => <div key={i} className="h-4 rounded" style={{ background: "hsl(var(--info)/0.25)" }} />)}</div>
              )} onRestore={(id) => { setDeck(cuts.findIndex((c) => c.id === id)); push("deck restored", "ok") }} />
            </div>
          </div>
        </section>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
    </div>
  )
}
