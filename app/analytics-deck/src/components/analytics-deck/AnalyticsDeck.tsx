import * as React from "react"
import { motion } from "motion/react"
import { Download, Table2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollProgress } from "@/components/primitives/scroll-progress"
import { MonoLabel, Grain } from "@/components/primitives/handcraft"
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
//          seed — KPIs roll, funnel re-splits, heatmap re-blooms; saving a cut
//          lands it on the version rail (scrub to preview old decks)

const seedFrom = (parts: (string | number)[]) => {
  let h = 2166136261
  for (const p of parts) for (const c of String(p)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0 }
  return () => { h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0; return (h & 0xffff) / 0xffff }
}
const iso = (d: Date) => d.toISOString().slice(0, 10)

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
  const kpis = React.useMemo(() => Array.from({ length: 3 }, (_, k) => ({
    v: Math.round(4200 + rand() * 9000 / (k + 1)),
    p: Math.round(4200 + rand() * 9000 / (k + 1)),
  })), [rand])
  const funnel = React.useMemo(() => { let v = Math.round(9000 + rand() * 9000); return ["Walked past", "Looked at the board", "Sat down", "Booked the next one"].map((label, i) => { const s = Math.max(180, Math.round(v * (i === 0 ? 1 : rand() * 0.35 + 0.4))); v = s; return { label, value: s } }) }, [rand])
  const heat = React.useMemo(() => Array.from({ length: 154 }, () => ({ count: Math.floor(rand() * 7 * (rand() > 0.55 ? 1 : 0.2)) })), [rand])

  const spin = () => { setLoading(true); setTimeout(() => { setLoading(false); push("deck recomputed", "ok") }, 1300) }
  const onSaveCut = () => { setCuts((c) => [{ id: "u" + c.length, at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), label: "cut " + (c.length + 1) }, ...c]); push("saved to version rail", "ok") }

  return (
    <div className={cn("relative isolate min-h-[620px] overflow-hidden rounded-2xl border bg-background font-sans", className)}>
      <ScrollProgress />
      <Grain opacity={0.035} />
      <header className="flex flex-wrap items-end gap-4 border-b bg-card px-5 py-4">
        <div>
          <MonoLabel>BI / DECK 01</MonoLabel>
          <h2 className="mt-1 font-display text-xl font-black tracking-tight">{title}</h2>
        </div>
        <span className="ml-auto flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="font-mono text-[9px]">{tokens.length} filter{tokens.length === 1 ? "" : "s"} · {range ? "custom" : "all time"} · v{deck + 1}</Badge>
          <button onClick={onSaveCut} className="h-8 rounded-md border px-3 font-mono text-[10px] font-black uppercase tracking-[0.14em] hover:bg-muted">save cut</button>
          <button onClick={() => { onExport?.(); push("CSV queued in the job tray", "ok") }} className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-primary-foreground"><Download className="size-3.5" /> export</button>
        </span>
      </header>

      <div className="space-y-6 p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <FilterTokenBuilder tokens={tokens} onChange={(t) => { setTokens(t); spin() }} and={and} onAnd={setAnd} fields={["segment", "chair", "stylist", "city"]} />
          <DateRangePresets value={range} onChange={(r) => { setRange(r); spin() }} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {kpis.map((k, i) => (
            <SmartSkeleton key={i} loading={loading} lines={2}><KpiTileLive label={["Revenue kr", "Covers", "Chair-hours"][i]} value={k.v} prev={k.p} spark={Array.from({ length: 12 }, () => 10 + rand() * 30)} /></SmartSkeleton>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <SmartSkeleton loading={loading} lines={5}><Card><CardContent className="p-5"><FunnelStageBars stages={funnel} topLabel="street → regular" /></CardContent></Card></SmartSkeleton>
          <SmartSkeleton loading={loading} lines={4}><Card><CardContent className="p-5"><ActivityHeatmap cells={heat} /></CardContent></Card></SmartSkeleton>
          <div className="lg:-ml-0 lg:col-span-2">{null}</div>
        </div>

        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2"><Table2 aria-hidden className="size-4 text-muted-foreground" /><MonoLabel className="text-muted-foreground">SAVED CUTS — scrub to preview, restore to load</MonoLabel></div>
            <UndoHistorySlider head="deck versions" versions={cuts} render={(v) => (
              <div className="grid h-full grid-cols-3 place-content-center gap-3 p-8 opacity-90"><p aria-hidden className="col-span-3 text-center font-display text-3xl font-black tabular-nums">{Math.round(seedFrom([v.id, deck])() * 9000 + 1200).toLocaleString()} kr</p>{[0, 1, 2].map((i) => <div key={i} className="h-4 rounded" style={{ background: "hsl(var(--info)/0.25)" }} />)}</div>
            )} onRestore={(id) => { setDeck(cuts.findIndex((c) => c.id === id)); push("deck restored", "ok") }} />
          </CardContent>
        </Card>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
    </div>
  )
}
