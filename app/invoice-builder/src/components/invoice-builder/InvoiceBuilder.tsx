import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Plus, X } from "lucide-react"
import { toast, Toaster } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB         Draft an invoice without doing any math in your head.
// ═══ EMOTION     The total quietly agreeing with itself.
// ═══ SIGNATURE   Line items you add and strike out with a spring, a live
//                 subtotal, moms at 25% and one big honest TOTAL — all tabular.
//                 Draft → saved → paid is a real state machine: every move is
//                 validated (rows must describe and price) and acknowledged by
//                 preset-scoped Sonner toasts; the PAID stamp is in-document.

export type InvoiceLine = {
  id: string
  label: string
  /** Raw input value — parsed leniently ("1 850", "1250,50"). */
  price: string
}

export type InvoiceBuilderProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  caption?: string
  tone?: "paper" | "ink"
  /** Starting line items; rows are fully owned state after mount. */
  items?: InvoiceLine[]
  className?: string
}

const DEFAULT_ITEMS: InvoiceLine[] = [
  { id: "r1", label: "Full colour & cut — Chair 1", price: "1850" },
  { id: "r2", label: "Olaplex treatment", price: "650" },
  { id: "r3", label: "Sea-salt spray, take home", price: "290" },
]

const FIELD =
  "h-9 w-full rounded-md border border-border bg-background px-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

const TOASTER_ID = "invoice-builder"
const fakeLedger = () => new Promise<string>((r) => setTimeout(() => r("ok"), 800))

const formatKr = (n: number) =>
  n.toLocaleString("sv-SE", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })

const parseKr = (raw: string) =>
  Number.parseFloat(raw.replace(/\s/g, "").replace(",", ".")) || 0

export function InvoiceBuilder({
  eyebrow = "App chrome · Invoice builder",
  title = "An invoice that adds itself up.",
  subtitle = "Line items, live subtotal and moms at 25% — edit any price and the total keeps itself honest.",
  caption = "LIVE MATH · MOMS 25% · QUIET TIMES STUDIO",
  tone = "paper",
  items = DEFAULT_ITEMS,
  className,
}: InvoiceBuilderProps) {
  const ink = tone === "ink"
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [rows, setRows] = React.useState<InvoiceLine[]>(items)
  const nextId = React.useRef(rows.length + 1)
  const [status, setStatus] = React.useState<"draft" | "saved" | "paid">("draft")
  const [paidAt, setPaidAt] = React.useState("")
  const [paying, setPaying] = React.useState(false)

  const addRow = () => {
    setRows((rs) => [...rs, { id: `r${nextId.current++}`, label: "", price: "" }])
  }
  const removeRow = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id))
  const setLabel = (id: string, label: string) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, label } : r)))
  const setPrice = (id: string, price: string) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, price } : r)))

  const subtotal = rows.reduce((sum, r) => sum + parseKr(r.price), 0)
  const moms = subtotal * 0.25
  const total = subtotal + moms

  const firstBadRow = () =>
    rows.length && rows.every((r) => r.label.trim() && parseKr(r.price) > 0)
      ? -1
      : rows.findIndex((r) => !r.label.trim() || parseKr(r.price) <= 0)

  const save = () => {
    if (!rows.length) {
      toast.error("Nothing to invoice — the ticket has no lines", { toasterId: TOASTER_ID })
      return
    }
    const bad = firstBadRow()
    if (bad >= 0) {
      toast.error(`Can't save — line ${bad + 1} ${rows[bad].label.trim() ? "has no price" : "has no description"}`, {
        description: "Every line must say what was done and how much.",
        duration: 6000,
        toasterId: TOASTER_ID,
      })
      return
    }
    setStatus("saved")
    toast.success("Draft #042 saved", { description: `${formatKr(total)} kr · moms 25% included`, toasterId: TOASTER_ID })
  }

  const markPaid = () => {
    if (status !== "saved") {
      toast.error("Save the draft first — nothing is in the ledger to settle", { duration: 5000, toasterId: TOASTER_ID })
      return
    }
    setPaying(true)
    toast.promise(fakeLedger, {
      loading: "Recording payment with the ledger…",
      success: () => {
        setPaying(false)
        setStatus("paid")
        setPaidAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
        return "Marked paid — the stamp is on it"
      },
      error: () => { setPaying(false); return "The ledger said no — still on you to send" },
      duration: 4500,
      toasterId: TOASTER_ID,
    })
  }

  const sendMail = () => {
    if (status === "draft") {
      toast.error("Can't send an unsaved draft", { description: "Save first, then the PDF goes out.", duration: 5000, toasterId: TOASTER_ID })
      return
    }
    toast(status === "paid" ? "Paid receipt is on its way" : "Invoice #042 is on its way", {
      description: status === "paid" ? "Stamp included — no reminder needed." : "Payment due in 30 days.",
      toasterId: TOASTER_ID,
    })
  }

  return (
    <section className={cn("bg-background text-foreground", className)}>
      <div className="mx-auto w-full max-w-[760px] px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}>
                <header className="">
          {eyebrow != null && (
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>
          )}
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">{title}</h2>
          {subtitle != null && (
            <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{subtitle}</p>
          )}
        </header>
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.1 }}>
        <div className="mt-10">
          <div className={cn("relative mx-auto w-full max-w-[560px] overflow-hidden rounded-[16px] border bg-card shadow-[0_24px_52px_-30px_hsl(var(--foreground)/0.45)]", ink ? "border-background/15" : "border-border")}>
            {status === "paid" && (
              <motion.span
                initial={{ opacity: 0, scale: 1.6, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: -11 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                aria-label="Marked paid"
                className="pointer-events-none absolute right-6 top-16 z-10 select-none rounded-sm border-[3px] border-[hsl(var(--ok)/0.65)] px-3 py-0.5 font-mono text-[15px] font-black uppercase leading-tight tracking-[0.3em] text-[hsl(var(--ok)/0.8)]"
              >
                Paid<span className="block pt-0.5 text-center text-[9px] font-bold tracking-[0.18em] text-[hsl(var(--ok)/0.65)]">{paidAt}</span>
              </motion.span>
            )}
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">Quiet Times Studio — Faktura</span>
              <span className="font-mono text-[11px] font-bold text-muted-foreground">Jönköping · #042</span>
            </div>

            <div className="px-5 py-5">
              <div className="grid grid-cols-[1fr_104px_32px] gap-2 border-b border-border/60 pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                <span>Description</span>
                <span className="text-right">Price · kr</span>
                <span className="sr-only">Remove</span>
              </div>

              <AnimatePresence initial={false}>
                {rows.map((row, i) => (
                  <motion.div
                    key={row.id}
                    layout={reduce ? undefined : true}
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : {
                            layout: { type: "spring", stiffness: 420, damping: 34 },
                            height: { duration: 0.22, ease: "easeOut" },
                            opacity: { duration: 0.18 },
                          }
                    }
                    style={{ overflow: "hidden" }}
                  >
                    <div className="grid grid-cols-[1fr_104px_32px] items-center gap-2 py-1.5">
                      <input
                        type="text"
                        value={row.label}
                        onChange={(e) => setLabel(row.id, e.target.value)}
                        placeholder={i === 0 ? "e.g. Full colour & cut — Chair 1" : "What did we do?"}
                        aria-label={`Line ${i + 1} description`}
                        className={FIELD}
                      />
                      <input
                        type="number"
                        min={0}
                        step={50}
                        inputMode="numeric"
                        value={row.price}
                        onChange={(e) => setPrice(row.id, e.target.value)}
                        aria-label={`Line ${i + 1} price in kronor`}
                        className={cn(FIELD, "text-right font-mono tabular-nums")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeRow(row.id)}
                        aria-label={`Remove line ${i + 1}`}
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <X className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <Button
                type="button"
                variant="ghost"
                onClick={addRow}
                className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="size-4" aria-hidden />
                Add row
              </Button>

              <div className="mt-5 space-y-1.5 border-t border-border pt-4">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono font-semibold tabular-nums">{formatKr(subtotal)} kr</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">Moms 25%</span>
                  <span className="font-mono font-semibold tabular-nums">{formatKr(moms)} kr</span>
                </div>
                <div className="flex items-end justify-between border-t border-border pt-3">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                    Total · ink moms
                  </span>
                  <span aria-live="polite" className="font-display text-[32px] font-bold leading-none tracking-[-0.03em] tabular-nums">
                    {formatKr(total)} <span className="text-sm font-semibold text-muted-foreground">kr</span>
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-dashed border-border pt-4">
                <Button type="button" variant="outline" size="sm" onClick={save} className="h-8 px-3 font-mono text-[11px] uppercase tracking-[0.14em]">
                  {status === "draft" ? "Save draft" : "Save again"}
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={status !== "saved" || paying} onClick={markPaid} className="h-8 px-3 font-mono text-[11px] uppercase tracking-[0.14em]">
                  {paying ? "Recording…" : "Mark as paid"}
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={status === "draft"} onClick={sendMail} className="h-8 px-3 font-mono text-[11px] uppercase tracking-[0.14em]">
                  Send
                </Button>
                <span aria-live="polite" className="ml-auto font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {status === "paid" ? "settled · thank you" : status === "saved" ? "saved · unpaid" : "draft — unsaved"}
                </span>
              </div>
            </div>
          </div>

          <p
            className={cn(
              "mx-auto mt-8 flex w-full max-w-[560px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
              ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
            )}
          >
            <span>{caption}</span>
            <span aria-hidden>●</span>
          </p>
        </div>
      </InView>
    </div>
      <Toaster id={TOASTER_ID} position="bottom-right" richColors closeButton />
    </section>
  )
}
