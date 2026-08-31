import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { BookOpen, Flame, Lock, Receipt, Undo2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"
import { RadialGauge } from "radial-gauge"
import { CopySecretField } from "copy-secret-field"
import { InlineEditCell } from "inline-edit-cell"
import { UploadQueue, type UploadFile } from "upload-queue"
import { ToastStack, type Toast } from "toast-stack"
import { SlidingNumber } from "@/components/primitives/sliding-number"

// COMPOSITE SCREEN · MONTH CLOSE
// composed of: radial-gauge (burn dial), copy-secret-field (API keys),
// inline-edit-cell (ledger memos), upload-queue (receipt drop), sliding-number
// (closing odometer) + purpose-built ledger with honest reversal stamps.

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

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

export function FinanceDesk({ period = "August 2026", closer = "Elin S.", entries = DEFAULT_ENTRIES, burnPct = 62, receipts = DEFAULT_RECEIPTS, onLock, className }: FinanceDeskProps) {
  const [ledger, setLedger] = useState(entries)
  const [files, setFiles] = useState(receipts)
  const [trail, setTrail] = useState<TrailItem[]>([
    { id: "t1", at: "21:58", text: "e4 reversed — duplicate booking voided" },
    { id: "t2", at: "22:06", text: "e5 memo corrected", honest: true },
  ])
  const [key, setKey] = useState("sk_live_7f3a9c2e88b1d4")
  const [rotating, setRotating] = useState(false)
  const [locked, setLocked] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = (title: string, tone: Toast["tone"] = "ok") =>
    setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])

  const posted = ledger.filter((e) => e.state === "posted")
  const balance = posted.reduce((a, e) => a + e.amount, 0)
  const pendingSum = ledger.filter((e) => e.state === "pending").reduce((a, e) => a + e.amount, 0)

  const log = (text: string, honest = false) => setTrail((ts) => [...ts.slice(-5), { id: "t" + Date.now(), at: now(), text, honest }])

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

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Finance</h2>
        <span className="text-[12px] text-muted-foreground">{period} · closer {closer}</span>
        <span className="flex items-center gap-1.5 rounded border border-[hsl(var(--warn)/0.5)] bg-[hsl(var(--warn)/0.08)] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--warn))]">
          <Flame className="size-3.5" /> burn {burnPct}% of plan
        </span>
        <button
          onClick={() => { setLocked(true); log("books locked for " + period); push("books locked — reopen needs the auditor key"); onLock?.() }}
          disabled={locked || pendingSum !== 0}
          className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted disabled:opacity-40"
        >
          <Lock className="size-3.5" /> {locked ? "Books locked" : "Lock month"}
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[250px_minmax(0,1fr)_260px]">
        {/* burn + keys */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-1.5 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <Flame className="size-3.5" /> Burn rate
            </header>
            <div className="flex flex-col items-center gap-2 p-3">
              <RadialGauge value={burnPct} min={0} max={120} precision={0} size={150} label="of plan" unit="%" zones={[{ to: 70, color: "hsl(var(--ok))", label: "on plan" }, { to: 100, color: "hsl(var(--warn))", label: "watch" }, { to: 120, color: "hsl(var(--err))", label: "over" }]} />
              <dl className="w-full space-y-1 text-[12px]">
                <div className="flex justify-between"><dt className="text-muted-foreground">Cash on hand</dt><dd className="font-mono tabular-nums">4 218 000 kr</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Runway</dt><dd className="font-mono font-bold tabular-nums">9.3 months</dd></div>
              </dl>
            </div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-1.5 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              API key · production
            </header>
            <div className="p-3">
              <CopySecretField value={key} onRotate={rotate} rotating={rotating} label="ledger service key" />
              <p className="mt-2 text-[11px] text-muted-foreground">Rotation keeps a 24 h grace key — rotations are stamped in the trail.</p>
            </div>
          </section>
        </aside>

        {/* ledger */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground"><BookOpen className="size-3.5" /> Ledger · {ledger.length} entries</span>
            <span className="text-[11px] text-muted-foreground">pending {pendingSum.toLocaleString()} kr</span>
          </header>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b text-left text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="px-3 py-1.5 font-semibold">Date</th>
                <th className="px-2 py-1.5 font-semibold">Account</th>
                <th className="px-2 py-1.5 font-semibold">Memo</th>
                <th className="px-3 py-1.5 text-right font-semibold">Amount</th>
                <th className="w-16 px-2 py-1.5 text-right font-semibold" />
              </tr>
            </thead>
            <tbody>
              {ledger.map((e) => (
                <tr key={e.id} className={cn("border-b border-app-line/60 last:border-0", e.state === "reversed" && "opacity-45")}>
                  <td className="px-3 py-1 font-mono tabular-nums text-muted-foreground">{e.date}</td>
                  <td className="px-2 py-1 font-mono text-[11px]">{e.account}</td>
                  <td className="px-2 py-1">
                    {e.state === "pending" ? (
                      <InlineEditCell value={e.memo} name={`memo of ${e.id}`} onSave={async (v: string) => { if (!v.trim()) throw new Error("memo"); setLedger((es) => es.map((x) => (x.id === e.id ? { ...x, memo: v.trim() } : x))) }} width={190} />
                    ) : (
                      <span className={e.state === "reversed" ? "line-through" : "font-medium"}>{e.memo}</span>
                    )}
                  </td>
                  <td className={cn("px-3 py-1 text-right font-mono font-bold tabular-nums", e.amount < 0 ? "text-[hsl(var(--err))]" : "text-[hsl(var(--ok))]")}>
                    {e.amount.toLocaleString("sv-SE")}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {e.state === "pending" && <button onClick={() => post(e.id)} className="text-[10px] font-bold uppercase text-[hsl(var(--info))]">post</button>}
                    {e.state === "posted" && <button onClick={() => revert(e)} className="text-[10px] font-bold uppercase text-muted-foreground hover:text-[hsl(var(--err))]">revert</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-baseline justify-between border-t px-3 py-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Closing</span>
            <span className="flex items-center gap-1.5 font-mono text-[20px] font-black tabular-nums">
              <SlidingNumber value={balance} />
              <span className="text-[12px] font-bold text-muted-foreground">kr</span>
            </span>
          </div>
        </section>

        {/* receipts + trail */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-1.5 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <Receipt className="size-3.5" /> Receipt drop
            </header>
            <UploadQueue files={files} onRemove={(id: string) => setFiles((fs) => fs.filter((f) => f.id !== id))} onRetry={(id: string) => setFiles((fs) => fs.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 8, error: undefined } : f)))} className="border-0" />
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Audit trail</header>
            <ul className="max-h-[190px] divide-y overflow-auto">
              <AnimatePresence initial={false}>
                {[...trail].reverse().map((t) => (
                  <motion.li key={t.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 px-3 py-1.5">
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">{t.at}</span>
                    <span className={cn("text-[11px] leading-[1.5]", t.honest ? "font-semibold text-[hsl(var(--ok))]" : "text-muted-foreground")}>
                      {t.honest && <Undo2 className="mr-1 inline size-3" aria-hidden />}
                      {t.text}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Reversions re-stamp with operator and time — originals are never hidden</div>
          </section>
        </aside>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id: string) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
    </div>
  )
}
