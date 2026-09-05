import { useMemo, useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCheck,
  Flame,
  Lock,
  Undo2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { RadialGauge } from "radial-gauge"
import { CopySecretField } from "copy-secret-field"
import { InlineEditCell } from "inline-edit-cell"
import { UploadQueue, type UploadFile } from "upload-queue"
import { ToastStack, type Toast } from "toast-stack"
import { SlidingNumber } from "@/components/primitives/sliding-number"
import { InView } from "@/components/primitives/in-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CandlestickChart, type OHLCDataPoint } from "@/components/bklit/candlestick-chart"
import { Candlestick } from "@/components/bklit/candlestick"
import { Grid } from "@/components/bklit/grid"
import { XAxis } from "@/components/bklit/x-axis"
import { YAxis } from "@/components/bklit/y-axis"
import { ChartTooltip } from "@/components/bklit/tooltip/chart-tooltip"

// COMPOSITE SCREEN · MONTH CLOSE
// Domain layout, not the generic three-pane shell: the cash position candlestick
// chart anchors an 8-col money column (chart → ledger table → close bar) while a
// 4-col rail holds burn gauge, receipt drop and the audit trail. Vendored Bklit
// candlestick renders daily open/close cash; ledger keeps inline-edit memos with
// an edits → diff trail → approve month-close flow.

export type LedgerEntry = {
  id: string
  date: string
  account: string
  memo: string
  amount: number
  state: "posted" | "pending" | "reversed"
}

export type TrailItem = { id: string; at: string; text: string; honest?: boolean }

export type FinanceDeskProps = {
  period?: string
  closer?: string
  entries?: LedgerEntry[]
  burnPct?: number
  receipts?: UploadFile[]
  onLock?: () => void
  className?: string
}

const DEFAULT_ENTRIES: LedgerEntry[] = [
  { id: "e1", date: "24/08", account: "6110 · salaries", memo: "studio payroll August", amount: -386_400, state: "posted" },
  { id: "e2", date: "23/08", account: "4010 · services", memo: "colour retouch package", amount: 74_500, state: "posted" },
  { id: "e3", date: "22/08", account: "5430 · software", memo: "render farm seats", amount: -12_900, state: "pending" },
  { id: "e4", date: "21/08", account: "4010 · services", memo: "duplicate booking — voided", amount: 74_500, state: "reversed" },
  { id: "e5", date: "20/08", account: "3010 · equity", memo: "owner draw correction", amount: -25_000, state: "posted" },
]

const DEFAULT_RECEIPTS: UploadFile[] = [
  { id: "rc1", name: "freight-4482.pdf", size: 214_000, status: "done" },
  { id: "rc2", name: "printer-lease-aug.pdf", size: 96_500, status: "uploading", progress: 41 },
  { id: "rc3", name: "receipt-unknown.jpg", size: 1_240_000, status: "error", tries: 1, error: "no OCR match — needs account" },
]

const CASH_ON_HAND = 4_218_000

/** Deterministic daily open/close cash walk for August 2026, pinned to CASH_ON_HAND. */
function buildCashSeries(): OHLCDataPoint[] {
  let s = 987_654_321
  const rand = () => {
    s = (s * 1_103_515_245 + 12_345) % 2_147_483_648
    return s / 2_147_483_648
  }
  const days: Date[] = []
  for (let d = 1; d <= 28 && days.length < 20; d++) {
    const date = new Date(2026, 7, d)
    const wd = date.getDay()
    if (wd !== 0 && wd !== 6) days.push(date)
  }
  const walk: number[] = [3_905_000]
  for (let i = 1; i < days.length; i++) walk.push(walk[i - 1] + (rand() - 0.47) * 96_000)
  const shift = CASH_ON_HAND - walk[walk.length - 1]

  return days.map((date, i) => {
    const open = i === 0 ? walk[0] : walk[i - 1]
    const close = Math.round(walk[i] + shift)
    const high = Math.max(open, close) + Math.round(rand() * 42_000)
    const low = Math.min(open, close) - Math.round(rand() * 42_000)
    return { date, open: Math.round(open + shift), high, low, close }
  })
}

const CASH_SERIES = buildCashSeries()

const kr = (v: number) => `${v.toLocaleString("sv-SE")} kr`
const compactKr = (v: number) => `${(v / 1_000_000).toFixed(2)} M`

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

export function FinanceDesk({ period = "August 2026", closer = "Elin S.", entries = DEFAULT_ENTRIES, burnPct = 62, receipts = DEFAULT_RECEIPTS, onLock, className }: FinanceDeskProps) {
  const [ledger, setLedger] = useState(entries)
  const [files, setFiles] = useState(receipts)
  const [trail, setTrail] = useState<TrailItem[]>([
    { id: "t1", at: "21:58", text: "e4 reversed — duplicate booking voided" },
    { id: "t2", at: "22:06", text: "e5 memo corrected", honest: true },
  ])
  const [diffs, setDiffs] = useState<Record<string, { from: string; to: string }>>({})
  const [key, setKey] = useState("sk_live_7f3a9c2e88b1d4")
  const [rotating, setRotating] = useState(false)
  const [locked, setLocked] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = (title: string, tone: Toast["tone"] = "ok") =>
    setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])

  const posted = ledger.filter((e) => e.state === "posted")
  const balance = posted.reduce((a, e) => a + e.amount, 0)
  const pendingSum = ledger.filter((e) => e.state === "pending").reduce((a, e) => a + e.amount, 0)
  const diffCount = Object.keys(diffs).length

  const log = (text: string, honest = false) => setTrail((ts) => [...ts.slice(-5), { id: "t" + Date.now(), at: now(), text, honest }])

  const stageMemoEdit = (id: string, from: string, to: string) => {
    setDiffs((d) => ({ ...d, [id]: { from, to } }))
    log(`${id} memo staged for approval: “${from}” → “${to}”`)
  }

  const approveEdits = () => {
    log(`${diffCount} memo edit${diffCount === 1 ? "" : "s"} approved by ${closer} — diff trail closed`, true)
    push(`${diffCount} memo edit${diffCount === 1 ? "" : "s"} approved`)
    setDiffs({})
  }

  const post = (id: string) => {
    setLedger((es) => es.map((e) => (e.id === id ? { ...e, state: "posted" as const } : e)))
    log(`${id} posted by ${closer}`)
    push(`${id} posted to the ledger`)
  }

  const revert = (e: LedgerEntry) => {
    const rid = e.id + "r"
    setLedger((es) => [...es.map((x) => (x.id === e.id ? { ...x, state: "reversed" as const } : x)), { ...e, id: rid, memo: `reversal of ${e.memo}`, amount: -e.amount, state: "posted" }])
    log(`${e.id} reverted → reversal ${rid} re-stamped by ${closer} at ${now()} — original kept visible`, true)
    push(`${e.id} reverted — honest re-stamp in the trail`, "warn")
  }

  const rotate = () => {
    setRotating(true)
    window.setTimeout(() => {
      setKey("sk_live_" + Math.random().toString(16).slice(2, 18))
      setRotating(false)
      log("api key rotated — old key valid for 24 h grace")
      push("new key issued — update the render farm", "warn")
    }, 1100)
  }

  const lockMonth = () => {
    setLocked(true)
    log("books locked for " + period)
    push("books locked — reopen needs the auditor key")
    onLock?.()
  }

  const first = CASH_SERIES[0]
  const last = CASH_SERIES[CASH_SERIES.length - 1]
  const windowLow = useMemo(() => Math.min(...CASH_SERIES.map((d) => d.low)), [])
  const windowHigh = useMemo(() => Math.max(...CASH_SERIES.map((d) => d.high)), [])
  const dayDelta = last ? last.close - (last ? last.open : 0) : 0
  const monthDelta = first && last ? last.close - first.open : 0
  const lastUp = dayDelta >= 0

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-background", className)}>
      <MotionConfig reducedMotion="user">
        <div className="mx-auto w-full max-w-[920px] px-4 py-10 sm:px-6 sm:py-12">
          {/* ── hero: cash position ─────────────────────────────────────── */}
          <InView once variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex flex-wrap items-start justify-between gap-3 px-6 pt-6">
              <div>
                <span className="text-sm text-muted-foreground">Cash position · daily open / close</span>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">{compactKr(last ? last.close : 0)}</span>
                  <span className="text-sm text-muted-foreground">kr</span>
                  <span className={cn("flex items-center gap-0.5 text-xs tabular-nums", lastUp ? "text-[hsl(var(--ok))]" : "text-[hsl(var(--err))]")}>
                    {lastUp ? <ArrowUpRight className="size-3.5" aria-hidden /> : <ArrowDownRight className="size-3.5" aria-hidden />}
                    {compactKr(Math.abs(dayDelta))} today
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!locked && (
                  <Badge variant="secondary" className="gap-1.5">
                    <Flame className="size-3" aria-hidden /> burn {burnPct}% of plan
                  </Badge>
                )}
                {locked && (
                  <Badge variant="outline" className="gap-1.5">
                    <Lock className="size-3" aria-hidden /> books locked
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-2 px-3 pb-2 pt-2">
              <CandlestickChart
                data={CASH_SERIES}
                margin={{ top: 10, right: 14, bottom: 34, left: 48 }}
                animationDuration={900}
                aspectRatio="2.9 / 1"
                candleGap={0.32}
              >
                <Grid horizontal numTicksRows={4} strokeDasharray="3,5" strokeOpacity={0.8} />
                <Candlestick positiveFill="hsl(var(--ok))" negativeFill="hsl(var(--err))" fadedOpacity={0.45} />
                <XAxis numTicks={5} tickerHalfWidth={44} />
                <YAxis numTicks={4} formatValue={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
                <ChartTooltip
                  indicatorColor={(p) => (Number(p.close) >= Number(p.open) ? "hsl(var(--ok))" : "hsl(var(--err))")}
                  rows={(p) => {
                    const open = Number(p.open)
                    const close = Number(p.close)
                    const up = close >= open
                    return [
                      { color: "hsl(var(--muted-foreground))", label: "open", value: kr(open) },
                      { color: up ? "hsl(var(--ok))" : "hsl(var(--err))", label: "close", value: kr(close) },
                      { color: "hsl(var(--muted-foreground))", label: "high / low", value: `${kr(Number(p.high))} / ${kr(Number(p.low))}` },
                    ]
                  }}
                />
              </CandlestickChart>
            </div>

            <dl className="grid grid-cols-2 divide-x divide-border/60 border-t bg-muted/20 py-3 sm:grid-cols-4">
              {([
                ["month open", compactKr(first ? first.open : 0)],
                ["month close", compactKr(last ? last.close : 0)],
                ["net Δ month", `${monthDelta >= 0 ? "+" : "−"}${compactKr(Math.abs(monthDelta))}`],
                ["low / high", `${compactKr(windowLow)} / ${compactKr(windowHigh)}`],
              ] as const).map(([k, v]) => (
                <div key={k} className="px-4 sm:px-5">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="mt-1 text-sm font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          </InView>

          {/* ── money column + rail ──────────────────────────────────────── */}
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* ledger */}
            <section className="overflow-hidden rounded-xl border border-border bg-card lg:col-span-8">
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-6 py-4">
                <h3 className="text-sm font-semibold tracking-tight">
                  Ledger
                  <Badge variant="secondary" className="ml-2">{ledger.length} rows</Badge>
                </h3>
                <span className="text-xs text-muted-foreground">
                  pending {pendingSum.toLocaleString("sv-SE")} kr · tap a memo to edit
                </span>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20 text-left text-xs text-muted-foreground">
                    <th className="px-6 py-2.5 font-semibold">Date</th>
                    <th className="px-3 py-2.5 font-semibold">Account</th>
                    <th className="px-3 py-2.5 font-semibold">Memo</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Amount</th>
                    <th className="w-24 px-4 py-2.5 text-right font-semibold" />
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((e) => (
                    <tr key={e.id} className={cn("border-b border-border/50 last:border-0", e.state === "reversed" && "opacity-45", diffs[e.id] && "bg-[hsl(var(--warn)/0.05)]")}>
                      <td className="px-6 py-2 font-mono text-xs tabular-nums text-muted-foreground">{e.date}</td>
                      <td className="px-3 py-2 font-mono text-xs">{e.account}</td>
                      <td className="px-3 py-2">
                        {e.state !== "reversed" ? (
                          <InlineEditCell
                            value={e.memo}
                            name={`memo of ${e.id}`}
                            onSave={async (v: string) => {
                              const next = v.trim()
                              if (!next) throw new Error("memo")
                              setLedger((es) => es.map((x) => (x.id === e.id ? { ...x, memo: next } : x)))
                              if (e.state === "posted") stageMemoEdit(e.id, e.memo, next)
                            }}
                            width={190}
                          />
                        ) : (
                          <span className="line-through">{e.memo}</span>
                        )}
                      </td>
                      <td className={cn("px-3 py-2 text-right text-sm tabular-nums", e.amount < 0 ? "text-[hsl(var(--err))]" : "text-foreground")}>
                        {e.amount.toLocaleString("sv-SE")}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {e.state === "pending" && (
                          <Button variant="ghost" size="sm" onClick={() => post(e.id)} className="h-8 px-3 text-xs">
                            Post
                          </Button>
                        )}
                        {e.state === "posted" && (
                          <Button variant="ghost" size="sm" onClick={() => revert(e)} className="h-8 px-3 text-xs text-muted-foreground">
                            Revert
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <div className="mt-auto flex items-baseline justify-between border-t border-border/60 bg-muted/20 px-6 py-4">
                <span className="text-xs text-muted-foreground">Closing balance · posted</span>
                <span className="flex items-baseline gap-1.5 text-2xl font-bold tabular-nums">
                  <SlidingNumber value={balance} />
                  <span className="text-sm text-muted-foreground">kr</span>
                </span>
              </div>
            </section>

            {/* rail */}
            <div className="flex min-w-0 flex-col gap-5 lg:col-span-4">
              <section className="rounded-xl border border-border bg-card p-5">
                <header className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                    <Flame className="size-4 text-muted-foreground" aria-hidden /> Burn rate
                  </h3>
                  <Badge variant="outline">plan</Badge>
                </header>
                <div className="mt-4 flex flex-col items-center gap-4">
                  <RadialGauge
                    value={burnPct}
                    min={0}
                    max={120}
                    precision={0}
                    size={168}
                    notches={48}
                    showCenterValue
                    label="of plan"
                    unit="%"
                    zones={[
                      { to: 70, color: "hsl(var(--ok))", label: "on plan" },
                      { to: 100, color: "hsl(var(--warn))", label: "watch" },
                      { to: 120, color: "hsl(var(--err))", label: "over" },
                    ]}
                  />
                  <dl className="w-full space-y-1.5 border-t border-border/60 pt-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Cash on hand</dt>
                      <dd className="font-mono font-semibold tabular-nums">{CASH_ON_HAND.toLocaleString("sv-SE")} kr</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Runway</dt>
                      <dd className="font-mono font-bold tabular-nums">9.3 months</dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-border bg-card">
                <header className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
                  <h3 className="text-sm font-bold tracking-tight">Receipt drop</h3>
                  <span className="text-xs text-muted-foreground">{files.length} docs</span>
                </header>
                <UploadQueue
                  files={files}
                  onRemove={(id: string) => setFiles((fs) => fs.filter((f) => f.id !== id))}
                  onRetry={(id: string) => setFiles((fs) => fs.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 8, error: undefined } : f)))}
                  className="border-0"
                />
              </section>

              <section className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
                <header className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
                  <h3 className="text-sm font-bold tracking-tight">Audit trail</h3>
                  <span className="text-xs text-muted-foreground">{trail.length} events</span>
                </header>
                <ul className="flex-1 divide-y divide-border/50">
                  <AnimatePresence initial={false}>
                    {[...trail].reverse().map((t) => (
                      <motion.li key={t.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5 px-5 py-2.5">
                        <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", t.honest ? "bg-foreground" : "bg-muted-foreground/40")} />
                        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{t.at}</span>
                        <span className={cn("text-xs leading-[1.55]", t.honest ? "text-foreground" : "text-muted-foreground")}>
                          {t.honest && <Undo2 className="mr-1 inline size-3" aria-hidden />}
                          {t.text}
                        </span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <p className="border-t border-border/60 px-5 py-3 text-xs leading-5 text-muted-foreground">Reversals keep the operator and time of the change.</p>
              </section>
            </div>
          </div>

          {/* ── close bar ─────────────────────────────────────────────────── */}
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 sm:px-6">
            <span className="text-xs text-muted-foreground">Month close</span>
            <span aria-live="polite" className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {diffCount > 0
                ? `${diffCount} memo edit${diffCount === 1 ? "" : "s"} staged — approve to close the diff trail`
                : pendingSum !== 0
                  ? "post or revert pending rows before locking"
                  : locked
                    ? `books locked for ${period}`
                    : "ledger balanced — ready to lock"}
            </span>
            <Button variant="outline" onClick={approveEdits} disabled={diffCount === 0}>
              <CheckCheck className="size-3.5" aria-hidden /> Approve edits {diffCount > 0 ? `(${diffCount})` : ""}
            </Button>
            <Button onClick={lockMonth} disabled={locked || pendingSum !== 0 || diffCount > 0}>
              <Lock className="size-3.5" aria-hidden /> {locked ? "Books locked" : "Lock month"}
            </Button>
          </div>

        </div>
      </MotionConfig>

      <ToastStack toasts={toasts} onDismiss={(id: string) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
    </section>
  )
}
