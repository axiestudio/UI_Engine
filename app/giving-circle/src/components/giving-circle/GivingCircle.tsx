import { useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { CloudOff, HandCoins, Tags } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FunnelStageBars, type FunnelStage } from "funnel-stage-bars"
import { DateRangePresets, type Range } from "date-range-presets"
import { DragNumberField } from "drag-number-field"
import { OfflineQueueBanner } from "offline-queue-banner"
import { ToastStack, type Toast } from "toast-stack"
import { Checkbox } from "@/components/watermelon/checkbox"

// COMPOSITE SCREEN · NONPROFIT GIFTS
// composed of: funnel-stage-bars (campaign funnel), date-range-presets (gift
// window), drag-number-field (envelope amounts), offline-queue-banner (sync
// while counting), watermelon checkbox (double-count check) + fund selector.

export type Envelope = { id: string; no: string; fund: string; amount: number; counted: boolean; by: string }

export type GivingCircleProps = {
  campaign?: string
  window?: Range | null
  envelopes?: Envelope[]
  className?: string
}

const FUNDS = ["General", "Food bank", "Night shelter"]
const TEAM = ["Nora", "Bea", "Sam"]

const DEFAULT_WINDOW: Range = { from: new Date(new Date().setHours(0, 0, 0, 0) - 6 * 86_400_000), to: new Date(), label: "Count week" }

const DEFAULT_ENVELOPES: Envelope[] = [
  { id: "e1", no: "#0142", fund: "General", amount: 350, counted: true, by: "Nora" },
  { id: "e2", no: "#0143", fund: "Food bank", amount: 120, counted: true, by: "Bea" },
  { id: "e3", no: "#0144", fund: "Night shelter", amount: 90, counted: false, by: "Nora" },
  { id: "e4", no: "#0145", fund: "General", amount: 500, counted: false, by: "Sam" },
]

const DEFAULT_FUNNEL: FunnelStage[] = [
  { label: "Appealed", value: 412 },
  { label: "Pledged", value: 265 },
  { label: "Received", value: 188 },
  { label: "Receipted", value: 141 },
]

const FUND_ALLOC: { fund: string; pct: number; note: string }[] = [
  { fund: "General", pct: 55, note: "rent, insurance, core staff" },
  { fund: "Food bank", pct: 30, note: "winter stock top-up" },
  { fund: "Night shelter", pct: 15, note: "mattresses and laundry" },
]

export function GivingCircle({ campaign = "Autumn appeal", window: initialWindow = DEFAULT_WINDOW, envelopes = DEFAULT_ENVELOPES, className }: GivingCircleProps) {
  const [win, setWin] = useState<Range | null>(initialWindow)
  const [rows, setRows] = useState(envelopes)
  const [team, setTeam] = useState<string[]>(["Nora", "Bea"])
  const [online, setOnline] = useState(false)
  const [flushing, setFlushing] = useState(false)
  const [queued, setQueued] = useState(2)
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = (title: string, tone: Toast["tone"] = "ok") =>
    setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])

  const counted = rows.filter((r) => r.counted)
  const total = counted.reduce((a, r) => a + r.amount, 0)

  const patch = (id: string, p: Partial<Envelope>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)))

  const cycle = <T,>(list: T[], cur: T): T => list[(list.indexOf(cur) + 1) % list.length]

  const closeBatch = () => {
    if (!online) {
      setQueued((q) => q + 1)
      push("batch sealed and queued — syncs when the office line returns", "warn")
    } else {
      push("batch posted to the ledger — receipts go out at 06:00")
    }
    setRows((rs) => rs.map((r) => ({ ...r, counted: false })))
  }

  const retrySync = () => {
    setFlushing(true)
    window.setTimeout(() => {
      setFlushing(false)
      setOnline(true)
      push(`${queued} count batches synced — gifts receipted`)
      setQueued(0)
    }, 1400)
  }

  return (
    <div className={cn("relative isolate flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Giving circle</h2>
        <span className="text-[12px] text-muted-foreground">{campaign} · count night</span>
        <span className={cn("flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-semibold", online ? "border-border text-muted-foreground" : "border-[hsl(var(--warn)/0.5)] bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]")}>
          <CloudOff className="size-3.5" /> {online ? "synced" : `counting offline · ${queued} queued`}
        </span>
        <Button type="button" variant="ghost" onClick={closeBatch} disabled={counted.length === 0} className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted disabled:opacity-40">
          <HandCoins className="size-3.5" /> Close batch · {total.toLocaleString("sv-SE")} kr
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[250px_minmax(0,1fr)_250px]">
        {/* funnel + window */}
        <aside className="flex flex-col gap-4">
          <section className="rounded-lg border bg-card p-3">
            <FunnelStageBars stages={DEFAULT_FUNNEL} eyebrow={`${campaign} · 6 weeks`} topLabel="gift journey" />
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="h-9 border-b bg-muted/30 px-3 pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Gift window</header>
            <div className="p-3">
              <DateRangePresets value={win} onChange={setWin} presets={[{ label: "Count week", days: 7 }, { label: "Fortnight", days: 14 }, { label: "Quarter", days: 90 }]} />
              <p className="mt-2 text-[11px] text-muted-foreground">The window scopes the funnel and the Sunday envelopes below.</p>
          
    </div>
          </section>
        </aside>

        {/* counting table */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground"><Tags className="size-3.5" /> Offerings · {counted.length} counted</span>
            <div className="flex gap-1.5">
              {TEAM.map((t) => (
                <Button type="button" variant="ghost"
                  key={t}
                  onClick={() => setTeam((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]))}
                  className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", team.includes(t) ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted")}
                >
                  {t}
                </Button>
              ))}
            </div>
          </header>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b text-left text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="w-8 px-2 py-1.5" />
                <th className="px-3 py-1.5 font-semibold">Envelope</th>
                <th className="px-2 py-1.5 font-semibold">Fund</th>
                <th className="px-2 py-1.5 font-semibold">Amount</th>
                <th className="px-3 py-1.5 text-right font-semibold">Counter</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={cn("border-b border-app-line/60 last:border-0", !r.counted && "opacity-60")}>
                  <td className="px-2 py-1">
                    <Checkbox checked={r.counted} onCheckedChange={(v: boolean | "indeterminate") => patch(r.id, { counted: v === true })} aria-label={`Counted ${r.no}`} className="size-3.5" />
                  </td>
                  <td className="px-3 py-1 font-mono font-bold tabular-nums">{r.no}</td>
                  <td className="px-2 py-1">
                    <Button type="button" variant="ghost" onClick={() => patch(r.id, { fund: cycle(FUNDS, r.fund) })} className="rounded border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
                      {r.fund}
                    </Button>
                  </td>
                  <td className="px-2 py-1">
                    <DragNumberField value={r.amount} onValueChange={(v: number) => patch(r.id, { amount: Math.max(0, Math.round(v)) })} step={10} precision={0} min={0} unit="kr" />
                  </td>
                  <td className="px-3 py-1 text-right">
                    <Button type="button" variant="ghost" onClick={() => patch(r.id, { by: cycle(team.length ? team : TEAM, r.by) })} className="text-[11px] font-semibold text-[hsl(var(--info))] hover:underline">
                      {r.by}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-baseline justify-between border-t px-3 py-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Counted total</span>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={total} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }} className="font-mono text-[18px] font-black tabular-nums">
                {total.toLocaleString("sv-SE")} kr
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Drag amounts to scrub · tick the box only after two counters agree</div>
        </section>

        {/* funds + sync */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="h-9 border-b bg-muted/30 px-3 pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Fund selector</header>
            <ul className="divide-y">
              {FUND_ALLOC.map((f) => (
                <li key={f.fund} className="flex items-center justify-between px-3 py-2">
                  <div>
                    <p className="text-[12px] font-semibold">{f.fund}</p>
                    <p className="text-[10px] text-muted-foreground">{f.note}</p>
                  </div>
                  <span className="font-mono text-[12px] font-bold tabular-nums">{f.pct}%</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-lg border bg-card p-3">
            <OfflineQueueBanner online={online} queued={queued} flushing={flushing} onRetryNow={retrySync} />
            <p className="mt-2 text-[11px] text-muted-foreground">Counts keep batching offline — nothing is lost when the parish line drops mid-service.</p>
            {!online && (
              <ul className="mt-2 space-y-1 border-t pt-2 font-mono text-[10px] tabular-nums text-muted-foreground">
                <li>batch 09:42 · 12 envelopes · held</li>
                <li>batch 11:15 · 9 envelopes · held</li>
              </ul>
            )}
          </section>
        </aside>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id: string) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
          </MotionConfig>
    </div>
  )
}
