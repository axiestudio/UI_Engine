import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { CreditCard, Plus, Printer, Undo2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"
import { InlineEditCell } from "inline-edit-cell"
import { SegmentedControl } from "segmented-control"
import { ToastStack } from "toast-stack"

// COMPOSITE SCREEN · POINT OF SALE
// composed of: inline-edit-cell (qty/price), segmented-control (tender),
// toast-stack (void notices) + purpose-built line-item table, order rail and
// authorisation panel.
//
// DESIGN BAR (applies to the whole wave): header strip ≤48px · label 11px
// semibold uppercase 12% tracking · body 13px · numerics 12px tabular
// right-aligned · panels rounded-lg bordered with a 36px header strip ·
// functional copy only · motion marks state changes, never decorates.

export type SaleLine = { id: string; name: string; qty: number; price: number; voided?: boolean }
export type CheckoutDeskProps = {
  orderNo?: string
  openedBy?: string
  lines?: SaleLine[]
  onAuthorised?: (total: number) => void
  className?: string
}

const DEFAULT_LINES: SaleLine[] = [
  { id: "l1", name: "Cut & style — chair 03", qty: 1, price: 295 },
  { id: "l2", name: "Colour refresh — skylight", qty: 1, price: 460 },
  { id: "l3", name: "Home care shampoo 250 ml", qty: 2, price: 120 },
]

const VAT = 0.25

export function CheckoutDesk({ orderNo = "TILL-2-4812", openedBy = "Elin S.", lines = DEFAULT_LINES, onAuthorised, className }: CheckoutDeskProps) {
  const [rows, setRows] = React.useState(lines)
  const [tender, setTender] = React.useState("card")
  const [disc, setDisc] = React.useState<string | null>(null)
  const [authorising, setAuthorising] = React.useState(false)
  const [approved, setApproved] = React.useState<null | { tail: string; at: string }>(null)
  const [undoLine, setUndoLine] = React.useState<SaleLine | null>(null)
  const [toasts, setToasts] = React.useState<{ id: string; title: string; tone?: "ok" | "warn"; action?: { label: string; run: () => void } }[]>([])

  const push = (title: string, tone: "ok" | "warn" = "ok", action?: { label: string; run: () => void }) =>
    setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone, action }])

  const active = rows.filter((r) => !r.voided)
  const gross = active.reduce((a, r) => a + r.price * r.qty, 0)
  const net = disc && gross ? Math.round(gross * (1 - (disc === "staff" ? 0.2 : 0.1))) : gross
  const vat = Math.round(net - net / (1 + VAT))
  const total = net

  const setQty = (id: string, q: number) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, qty: q } : r)))
  const voidLine = (r: SaleLine) => {
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, voided: true } : x)))
    push(`Line voided — ${r.name}`, "warn", { label: "Undo", run: () => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, voided: false } : x))) })
  }

  const authorise = () => {
    setAuthorising(true)
    setTimeout(() => {
      setAuthorising(false)
      setApproved({ tail: "42", at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) })
      onAuthorised?.(total)
    }, 1200)
  }

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      {/* screen header */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Point of sale</h2>
        <span className="text-[12px] text-muted-foreground">{orderNo}</span>
        <span className="text-[12px] text-muted-foreground">· opened by {openedBy}</span>
        <button onClick={() => push("receipt sent to printer", "ok")} className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"><Printer className="size-3.5" /> Reprint</button>
        <button disabled={!rows.some((r) => r.voided)} onClick={() => { setRows((rs) => rs.map((r) => ({ ...r, voided: false }))); push("voided lines restored", "ok") }} className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted disabled:opacity-40">Restore voids</button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
        {/* context rail */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Client</header>
            <div className="p-3">
              <p className="text-[13px] font-bold">M. Ahlberg</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">chair 03 · member since 2021</p>
              <div className="mt-2 flex gap-1.5">
                {["priority", "quiet chair"].map((t) => <span key={t} className="rounded border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{t}</span>)}
              </div>
            </div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Discounts</header>
            <div className="grid gap-1.5 p-3">
              {[["staff — 20%", "staff"], ["regular — 10%", "regular"]].map(([label, key]) => (
                <button key={key} onClick={() => setDisc(disc === key ? null : key)} className={cn("flex h-8 items-center justify-between rounded-md border px-2.5 text-[12px] font-semibold", disc === key ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted/50")}>
                  {label}<span>{disc === key ? "applied" : "apply"}</span>
                </button>
              ))}
              <p className="pt-1 text-[11px] text-muted-foreground">One discount per order. Manager PIN is asked at the terminal.</p>
            </div>
          </section>
        </aside>

        {/* line items */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Lines · {active.length} active</span>
            <button onClick={() => { const l = { id: "m" + Date.now(), name: "Manual line", qty: 1, price: 0 }; setRows((r) => [...r, l]); push("manual line added — set price", "ok") }} className="flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--info))]"><Plus className="size-3.5" /> add line</button>
          </header>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b text-left text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="px-3 py-1.5 font-semibold">Item</th><th className="w-20 px-2 py-1.5 text-center font-semibold">Qty</th><th className="w-24 px-2 py-1.5 text-right font-semibold">Price</th><th className="w-24 px-3 py-1.5 text-right font-semibold">Amount</th><th className="w-12 px-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={cn("border-b border-app-line/60 last:border-0", r.voided && "opacity-40")}>
                  <td className="px-3 py-1">{r.voided ? <span className="line-through">{r.name}</span> : <span className="font-medium">{r.name}</span>}</td>
                  <td className="px-2 py-1">{r.voided ? r.qty : <InlineEditCell value={String(r.qty)} name={`quantity ${r.name}`} mono width={40} onSave={async (v) => { const num = Number(v); if (!isFinite(num) || num < 0) throw new Error("qty"); setQty(r.id, Math.round(num)) }} />}</td>
                  <td className="px-2 py-1 text-right font-mono tabular-nums">{r.price.toLocaleString()}</td>
                  <td className="px-3 py-1 text-right font-mono font-bold tabular-nums">{(r.price * r.qty).toLocaleString()}</td>
                  <td className="px-2 py-1 text-right">{!r.voided && <button aria-label={`Void ${r.name}`} onClick={() => voidLine(r)} className="text-[10px] font-bold uppercase text-muted-foreground hover:text-[hsl(var(--err))]">void</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Tap a quantity to change it · void lines stay on the ticket for the audit</div>
        </section>

        {/* totals + tender */}
        <aside className="flex flex-col gap-4">
          <section className={cn("overflow-hidden rounded-lg border bg-card transition-colors", approved && "border-[hsl(var(--ok)/0.5)]")}>
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Totals</header>
            <div className="space-y-1.5 p-3 text-[12px]">
              <Row l="Gross" v={gross} />
              {disc && <Row l="Discount" v={net - gross} signed />}
              <Row l="of which VAT 25%" v={vat} />
              <AnimatePresence>
                {approved ? (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex items-center justify-between rounded-md border border-[hsl(var(--ok)/0.5)] bg-[hsl(var(--ok)/0.08)] px-3 py-2">
                    <span className="text-[12px] font-bold text-[hsl(var(--ok))]">AUTHORISED · {approved.at}</span>
                    <button className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground"><Undo2 className="size-3" /> refund</button>
                  </motion.div>
                ) : (
                  <motion.div key="total" className="mt-2 flex items-baseline justify-between border-t pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Due</span>
                    <motion.span key={total} initial={{ scale: 1.08 }} animate={{ scale: 1 }} className="text-[22px] font-black tabular-nums">{total.toLocaleString()} kr</motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Tender</header>
            <div className="space-y-3 p-3">
              <SegmentedControl size="sm" className="w-full justify-between" value={tender} onChange={setTender} options={[{ value: "card", label: "Card" }, { value: "cash", label: "Cash" }, { value: "gift", label: "Gift" }]} />
              <button onClick={authorise} disabled={authorising || !!approved || !active.length} className={cn("flex h-10 w-full items-center justify-center gap-2 rounded-md text-[12px] font-black uppercase tracking-[0.12em] text-white transition-colors", approved ? "bg-[hsl(var(--ok))]" : "bg-[hsl(var(--info))] hover:bg-[hsl(var(--info)/0.9)] disabled:opacity-40")}>
                <CreditCard className="size-4" aria-hidden /> {authorising ? "Waiting for terminal…" : approved ? `Paid · visa ••${approved.tail}` : `Charge ${total.toLocaleString()} kr`}
              </button>
              <p className="text-[11px] text-muted-foreground">{tender === "cash" ? "Cash drawer count prints on the receipt." : tender === "gift" ? "Gift card balance is held pending email confirmation." : "Terminal 1 · taps, chips, wallets."}</p>
            </div>
          </section>
        </aside>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
    </div>
  )
}

function Row({ l, v, signed }: { l: string; v: number; signed?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{l}</span>
      <span className={cn("font-mono tabular-nums", signed && v < 0 && "text-[hsl(var(--ok))]")}>{v.toLocaleString()} kr</span>
    </div>
  )
}
