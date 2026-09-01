import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  CheckCheck,
  Flame,
  Landmark,
  Lock,
  Receipt,
  Undo2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { RadialGauge } from "radial-gauge"
import { CopySecretField } from "copy-secret-field"
import { InlineEditCell } from "inline-edit-cell"
import { UploadQueue, type UploadFile } from "upload-queue"
import { ToastStack, type Toast } from "toast-stack"
import { SlidingNumber } from "@/components/primitives/sliding-number"
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
    <div className={cn("flex min-h-[560px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <Landmark className="size-4 text-primary" />
        <h2 className="text-[13px] font-bold">Finance</h2>
        <span className="text-[12px] text-muted-foreground">{period} · closer {closer}</span>
        <span className="flex items-center gap-1.5 rounded border border-[hsl(var(--warn)/0.5)] bg-[hsl(var(--warn)/0.08)] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--warn))]">
          <Flame className="size-3.5" /> burn {burnPct}% of plan
        </span>
        {locked && (
          <span className="flex items-center gap-1.5 rounded border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
            <Lock className="size-3" /> books locked
          </span>
        )}
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-12">
        {/* ── money column: cash position chart + ledger ─────────────────── */}
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-8">
          <section className="overflow-hidden rounded-lg border bg-card">
            <div className="flex flex-wrap items-end justify-between gap-2 px-4 pt-3.5">
              <div>
                <h3 className="text-[13px] font-bold tracking-tight">Cash position</h3>
                <p className="text-[11px] text-muted-foreground">daily open / close · {period} · bank + clearing</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[20px] font-black tabular-nums">{compactKr(last ? last.close : 0)}</span>
                <span className={cn("flex items-center gap-0.5 text-[11px] font-bold tabular-nums", lastUp ? "text-[hsl(var(--ok))]" : "text-[hsl(var(--err))]")}>
                  {lastUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {compactKr(Math.abs(dayDelta))} today
                </span>
              </div>
            </div>
            <div className="px-2 pb-1 pt-2">
              <CandlestickChart
                data={CASH_SERIES}
                margin={{ top: 10, right: 14, bottom: 24, left: 48 }}
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
            <dl className="grid grid-cols-4 divide-x border-t px-0 py-2 text-[11px]">
              {([
                ["month open", compactKr(first ? first.open : 0)],
                ["month close", compactKr(last ? last.close : 0)],
                ["net Δ month", `${monthDelta >= 0 ? "+" : "−"}${compactKr(Math.abs(monthDelta))}`],
                ["low / high", `${compactKr(windowLow)} / ${compactKr(windowHigh)}`],
              ] as const).map(([k, v]) => (
                <div key={k} className="px-4">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</dt>
                  <dd className="mt-0.5 font-mono tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
              <h3 className="flex items-center gap-1.5 text-[13px] font-bold tracking-tight">
                <BookOpen className="size-3.5 text-muted-foreground" /> Ledger
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">{ledger.length}</span>
              </h3>
              <span className="text-[11px] text-muted-foreground">
                pending <span className="font-mono font-bold text-[hsl(var(--warn))]">{pendingSum.toLocaleString("sv-SE")}</span> kr · tap a memo to edit
              </span>
            </header>
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-b bg-muted/20 text-left text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  <th className="px-4 py-1.5 font-semibold">Date</th>
                  <th className="px-2 py-1.5 font-semibold">Account</th>
                  <th className="px-2 py-1.5 font-semibold">Memo</th>
                  <th className="px-2 py-1.5 text-right font-semibold">Amount</th>
                  <th className="w-24 px-3 py-1.5 text-right font-semibold" />
                </tr>
              </thead>
              <tbody>
                {ledger.map((e) => (
                  <tr key={e.id} className={cn("border-b border-border/50 last:border-0", e.state === "reversed" && "opacity-45", diffs[e.id] && "bg-[hsl(var(--warn)/0.05)]")}>
                    <td className="px-4 py-1 font-mono tabular-nums text-muted-foreground">{e.date}</td>
                    <td className="px-2 py-1 font-mono text-[11px]">{e.account}</td>
                    <td className="px-2 py-1">
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
                    <td className={cn("px-2 py-1 text-right font-mono font-bold tabular-nums", e.amount < 0 ? "text-[hsl(var(--err))]" : "text-[hsl(var(--ok))]")}>
                      {e.amount.toLocaleString("sv-SE")}
                    </td>
                    <td className="px-3 py-1 text-right">
                      {e.state === "pending" && (
                        <Button variant="ghost" size="sm" onClick={() => post(e.id)} className="h-6 px-2 text-[10px] font-bold uppercase text-[hsl(var(--info))]">
                          post
                        </Button>
                      )}
                      {e.state === "posted" && (
                        <Button variant="ghost" size="sm" onClick={() => revert(e)} className="h-6 px-2 text-[10px] font-bold uppercase text-muted-foreground hover:text-[hsl(var(--err))]">
                          revert
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-auto flex items-baseline justify-between border-t bg-muted/20 px-4 py-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Closing balance · posted</span>
              <span className="flex items-center gap-1.5 font-mono text-[22px] font-black tabular-nums">
                <SlidingNumber value={balance} />
                <span className="text-[12px] font-bold text-muted-foreground">kr</span>
              </span>
            </div>
          </section>
        </div>

        {/* ── control rail: burn, receipts, trail ────────────────────────── */}
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <div className="flex items-center justify-between px-4 pt-3.5">
              <h3 className="flex items-center gap-1.5 text-[13px] font-bold tracking-tight">
                <Flame className="size-3.5 text-[hsl(var(--warn))]" /> Burn rate
              </h3>
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">of plan</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-3">
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
              <dl className="w-full space-y-1.5 border-t px-1 pt-2.5 text-[12px]">
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

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex items-center gap-1.5 border-b px-4 py-2">
              <Receipt className="size-3.5 text-muted-foreground" />
              <h3 className="text-[13px] font-bold tracking-tight">Receipt drop</h3>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">{files.length} docs</span>
            </header>
            <UploadQueue
              files={files}
              onRemove={(id: string) => setFiles((fs) => fs.filter((f) => f.id !== id))}
              onRetry={(id: string) => setFiles((fs) => fs.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 8, error: undefined } : f)))}
              className="border-0"
            />
          </section>

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
            <header className="flex items-center justify-between border-b px-4 py-2">
              <h3 className="text-[13px] font-bold tracking-tight">Audit trail</h3>
              <span className="font-mono text-[10px] text-muted-foreground">{trail.length} events</span>
            </header>
            <ul className="max-h-[168px] flex-1 divide-y overflow-auto">
              <AnimatePresence initial={false}>
                {[...trail].reverse().map((t) => (
                  <motion.li key={t.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 px-4 py-1.5">
                    <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", t.honest ? "bg-[hsl(var(--ok))]" : "bg-muted-foreground/40")} />
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">{t.at}</span>
                    <span className={cn("text-[11px] leading-[1.5]", t.honest ? "font-semibold text-[hsl(var(--ok))]" : "text-muted-foreground")}>
                      {t.honest && <Undo2 className="mr-1 inline size-3" aria-hidden />}
                      {t.text}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <p className="border-t px-4 py-2 text-[11px] text-muted-foreground">Reversions re-stamp with operator and time — originals are never hidden.</p>
          </section>
        </div>
      </div>

      {/* ── month close action bar: edits → diff trail → approve → lock ── */}
      <footer className="flex h-14 shrink-0 flex-wrap items-center gap-3 border-t bg-background px-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Month close</span>
        <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
          {diffCount > 0
            ? `${diffCount} memo edit${diffCount === 1 ? "" : "s"} staged — approve to close the diff trail`
            : pendingSum !== 0
              ? "post or revert pending rows before locking"
              : locked
                ? `books locked for ${period}`
                : "ledger balanced — ready to lock"}
        </span>
        <Button variant="outline" size="sm" onClick={approveEdits} disabled={diffCount === 0}>
          <CheckCheck className="size-3.5" /> Approve edits {diffCount > 0 ? `(${diffCount})` : ""}
        </Button>
        <Button size="sm" onClick={lockMonth} disabled={locked || pendingSum !== 0 || diffCount > 0}>
          <Lock className="size-3.5" /> {locked ? "Books locked" : "Lock month"}
        </Button>
      </footer>

      <ToastStack toasts={toasts} onDismiss={(id: string) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
    </div>
  )
}
