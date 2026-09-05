import { useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { PenLine, ShieldCheck, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/watermelon/checkbox"
import { InlineEditCell } from "inline-edit-cell"
import { DiffPaneSplit, type DiffLine } from "diff-pane-split"
import { CopySecretField } from "copy-secret-field"
import { RadialGauge } from "radial-gauge"
import { ToastStack, type Toast } from "toast-stack"

// COMPOSITE SCREEN · PAYROLL RUN REVIEW
// composed of: inline-edit-cell (editable line cells), diff-pane-split (changed
// rows), copy-secret-field (HSM signing key), radial-gauge (budget vs actual),
// toast-stack (run notices) + watermelon checkbox bulk approve and a
// purpose-built pay-line table.
//
// DESIGN BAR: header strip ≤48px · label 11px semibold uppercase 12% tracking
// · body 13px · numerics 12px tabular right-aligned · panels rounded-lg
// bordered with a 36px header strip · functional copy only · motion marks
// state changes, never decorates.

export type PayLine = {
  id: string
  name: string
  costCentre: string
  base: number
  overtime: number
  prevBase: number
  prevOvertime: number
}

export type PayrollReviewProps = {
  period?: string
  runBy?: string
  lines?: PayLine[]
  budget?: number
  className?: string
}

const DEFAULT_LINES: PayLine[] = [
  { id: "l1", name: "A. Rehnqvist", costCentre: "support", base: 34500, overtime: 1240, prevBase: 34500, prevOvertime: 1240 },
  { id: "l2", name: "J. Okafor", costCentre: "engineering", base: 52000, overtime: 0, prevBase: 49500, prevOvertime: 2100 },
  { id: "l3", name: "M. Sasaki", costCentre: "design", base: 41000, overtime: 640, prevBase: 41000, prevOvertime: 640 },
  { id: "l4", name: "T. Vidal", costCentre: "sales", base: 38000, overtime: 2980, prevBase: 38000, prevOvertime: 1420 },
  { id: "l5", name: "P. Lindgren", costCentre: "support", base: 31500, overtime: 0, prevBase: 31500, prevOvertime: 0 },
]

const SEK = (v: number) => `${v.toLocaleString("sv-SE")} kr`

export function PayrollReview({ period = "2026-05", runBy = "E. Sjöberg", lines = DEFAULT_LINES, budget = 4_600_000, className }: PayrollReviewProps) {
  const [rows, setRows] = useState<PayLine[]>(lines)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [diffOpen, setDiffOpen] = useState(false)
  const [approved, setApproved] = useState<null | { count: number; total: number; at: string }>(null)
  const [keyRotating, setKeyRotating] = useState(false)
  const [key, setKey] = useState("ed25519 · 9f:2c:41:aa:08:d3:e7")
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = (title: string, tone: Toast["tone"] = "ok") =>
    setToasts((t: Toast[]) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])

  const changed = rows.filter((r: PayLine) => r.base !== r.prevBase || r.overtime !== r.prevOvertime)
  const selectedRows = rows.filter((r: PayLine) => selected.has(r.id))
  const spend = rows.reduce((a: number, r: PayLine) => a + r.base + r.overtime, 0)
  const selectedTotal = selectedRows.reduce((a: number, r: PayLine) => a + r.base + r.overtime, 0)
  const allSelected = selected.size === rows.length
  const someSelected = selected.size > 0 && !allSelected

  const diffLines: DiffLine[] = changed.flatMap((r: PayLine): DiffLine[] => [
    { kind: "hunk", text: `${r.name} · ${r.costCentre}` },
    ...(r.base !== r.prevBase ? [{ kind: "del" as const, text: `- base ${SEK(r.prevBase)}` }, { kind: "add" as const, text: `+ base ${SEK(r.base)}` }] : []),
    ...(r.overtime !== r.prevOvertime ? [{ kind: "del" as const, text: `- overtime ${SEK(r.prevOvertime)}` }, { kind: "add" as const, text: `+ overtime ${SEK(r.overtime)}` }] : []),
    { kind: "ctx", text: `  period ${period} · cost centre ${r.costCentre}` },
  ])

  const toggleRow = (id: string, on: boolean) =>
    setSelected((s: Set<string>) => {
      const next = new Set(s)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const saveCell = (id: string, field: "base" | "overtime", raw: string) => {
    const num = Math.round(Number(raw.replace(/[^\d-]/g, "")))
    if (!Number.isFinite(num) || num < 0) throw new Error("invalid amount")
    setRows((rs: PayLine[]) => rs.map((r: PayLine) => (r.id === id ? { ...r, [field]: num } : r)))
  }

  const approve = () => {
    setApproved({ count: selected.size, total: selectedTotal, at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })
    push(`Run signed · ${selected.size} line${selected.size > 1 ? "s" : ""} · ${SEK(selectedTotal)}`, "ok")
  }

  const rotateKey = () => {
    setKeyRotating(true)
    window.setTimeout(() => {
      const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
      setKey(`ed25519 · ${Array.from({ length: 4 }, hex).join(":")}`)
      setKeyRotating(false)
      push("Signing key rotated in HSM — old key revoked after co-sign window", "warn")
    }, 1100)
  }

  return (
    <div className={cn("relative isolate flex min-h-[540px] w-full flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      {/* screen header */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Payroll run</h2>
        <span className="text-[12px] text-muted-foreground">period {period}</span>
        <span className="text-[12px] text-muted-foreground">· prepared by {runBy} · {rows.length} lines</span>
        {changed.length > 0 && (
          <span className="rounded bg-[hsl(var(--warn)/0.14)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[hsl(var(--warn))]">{changed.length} changed</span>
        )}
        <Button type="button" variant="ghost"
          onClick={() => setDiffOpen((o: boolean) => !o)}
          disabled={changed.length === 0}
          className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted disabled:opacity-40"
        >
          <PenLine className="size-3.5" /> {diffOpen ? "Hide diff" : `Review ${changed.length} change${changed.length > 1 ? "s" : ""}`}
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* pay lines + diff */}
        <div className="flex min-w-0 flex-col gap-4">
          <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Pay lines</span>
              <span className="font-mono text-[12px] tabular-nums text-muted-foreground">gross {SEK(spend)}</span>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-b text-left text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  <th className="w-10 px-3 py-1.5">
                    <Checkbox
                      aria-label="Select all pay lines"
                      checked={allSelected ? true : someSelected ? "indeterminate" : false}
                      onCheckedChange={(checked: boolean | "indeterminate") => setSelected(checked ? new Set(rows.map((r: PayLine) => r.id)) : new Set())}
                    />
                  </th>
                  <th className="px-2 py-1.5 font-semibold">Employee</th>
                  <th className="px-2 py-1.5 font-semibold">Cost centre</th>
                  <th className="w-28 px-2 py-1.5 text-right font-semibold">Base</th>
                  <th className="w-24 px-3 py-1.5 text-right font-semibold">Overtime</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: PayLine) => {
                  const dirty = r.base !== r.prevBase || r.overtime !== r.prevOvertime
                  return (
                    <tr key={r.id} className={cn("border-b border-border/60 last:border-0", dirty && "bg-[hsl(var(--warn)/0.05)]", selected.has(r.id) && "bg-accent/50")}>
                      <td className="px-3 py-1">
                        <Checkbox checked={selected.has(r.id)} onCheckedChange={(checked: boolean | "indeterminate") => toggleRow(r.id, checked === true)} />
                      </td>
                      <td className="px-2 py-1 font-medium">
                        {r.name}
                        {dirty && <span className="ml-1.5 rounded bg-[hsl(var(--warn)/0.14)] px-1 py-0.5 text-[9px] font-bold uppercase text-[hsl(var(--warn))]">edited</span>}
                      </td>
                      <td className="px-2 py-1 text-muted-foreground">{r.costCentre}</td>
                      <td className="px-2 py-1 text-right">
                        <InlineEditCell value={String(r.base)} name={`base for ${r.name}`} mono width={72} onSave={async (v: string) => saveCell(r.id, "base", v)} />
                      </td>
                      <td className="px-3 py-1 text-right font-mono tabular-nums">{r.overtime.toLocaleString("sv-SE")}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
            <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Tap a base amount to edit · edited rows keep their previous value for the diff and audit log.      
          
    </div>
          </section>

          <AnimatePresence>
            {diffOpen && changed.length > 0 && (
              <motion.section
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="min-h-0 overflow-hidden rounded-lg border bg-card"
              >
                <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Changed rows · prev → current</span>
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{changed.length} hunks</span>
                </header>
                <div className="p-3">
                  <DiffPaneSplit lines={diffLines} file={`payroll-${period}.csv`} />
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* approve + keys + gauge */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className={cn("overflow-hidden rounded-lg border bg-card transition-colors", approved && "border-[hsl(var(--ok)/0.5)]")}>
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Approve</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{selected.size} selected</span>
            </header>
            <div className="space-y-3 p-3">
              <AnimatePresence mode="wait">
                {approved ? (
                  <motion.div key="approved" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between rounded-md border border-[hsl(var(--ok)/0.5)] bg-[hsl(var(--ok)/0.08)] px-3 py-2">
                    <span className="text-[12px] font-bold text-[hsl(var(--ok))]">SIGNED · {approved.at}</span>
                    <Button type="button" variant="ghost" onClick={() => setApproved(null)} className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground">
                      <Undo2 className="size-3" /> reopen
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Button type="button" variant="ghost"
                      onClick={approve}
                      disabled={selected.size === 0}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[hsl(var(--ok))] text-[12px] font-black uppercase tracking-[0.12em] text-primary-foreground hover:bg-[hsl(var(--ok)/0.9)] disabled:opacity-40"
                    >
                      <ShieldCheck className="size-4" /> Approve {selected.size || "—"} · {selectedTotal ? SEK(selectedTotal) : "no lines"}
                    </Button>
                    <p className="mt-2 text-[11px] text-muted-foreground">Approving signs the selected lines with the HSM key below. Changed rows must be reviewed first.</p>
                  </motion.div>
                )}
              </AnimatePresence>
              {changed.length > 0 && !approved && (
                <p className="rounded border border-[hsl(var(--warn)/0.4)] bg-[hsl(var(--warn)/0.08)] px-2.5 py-1.5 text-[11px] font-semibold text-[hsl(var(--warn))]">
                  {changed.length} edited line{changed.length > 1 ? "s" : ""} pending review — open the diff before signing.
                </p>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Signing keys</header>
            <div className="p-3">
              <CopySecretField value={key} onRotate={rotateKey} rotating={keyRotating} label="payroll-hsm" mono />
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Budget vs actual</span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">{period}</span>
            </header>
            <div className="flex items-center justify-center p-3">
              <RadialGauge
                value={spend}
                min={0}
                max={budget}
                size={140}
                label="committed"
                unit="%"
                precision={1}
                zones={[
                  { to: 0.85, color: "hsl(var(--ok))", label: "on budget" },
                  { to: 1, color: "hsl(var(--err))", label: "over" },
                ]}
              />
            </div>
            <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">
              {SEK(spend)} of {SEK(budget)} · headroom {SEK(Math.max(0, budget - spend))}
            </div>
          </section>
        </aside>
      </div>

      <ToastStack toasts={toasts} onDismiss={(id: string) => setToasts((t: Toast[]) => t.filter((x: Toast) => x.id !== id))} pos="br" />
          </MotionConfig>
    </div>
  )
}
