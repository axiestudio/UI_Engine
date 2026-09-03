import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { Check, CreditCard, Plus, Printer, Scissors, Undo2 } from "lucide-react"
import { toast, Toaster } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InlineEditCell } from "inline-edit-cell"
import { SegmentedControl } from "segmented-control"

// COMPOSITE SCREEN · POINT OF SALE — ticket build
// Structure: a real ticket ledger. The sale is one till roll: lines with
// inline qty edits on the left; the running total panel on the right grows a
// mirrored line for every ticket line; loyalty → delivery → pay form a REAL
// stepped footer flow (each step validates, gates the next, shows its state);
// and the receipt card springs out over the totals panel as the signature.
// No three-pane roster, no card headers.
// Composed of: inline-edit-cell · segmented-control · Sonner (preset-scoped
// toasterId) · shadcn Button/Input · motion receipt.

export type SaleLine = { id: string; name: string; qty: number; price: number; voided?: boolean }
export type CheckoutDeskProps = {
  orderNo?: string
  openedBy?: string
  lines?: SaleLine[]
  onAuthorised?: (total: number) => void
  /** Host the real terminal here; default is a fake gate that authorises. */
  paymentApi?: (total: number) => Promise<string>
  className?: string
}

const DEFAULT_LINES: SaleLine[] = [
  { id: "l1", name: "Cut & style — chair 03", qty: 1, price: 295 },
  { id: "l2", name: "Colour refresh — skylight", qty: 1, price: 460 },
  { id: "l3", name: "Home care shampoo 250 ml", qty: 2, price: 120 },
]

const VAT = 0.25
const ORDER_NO = "TILL-2-4812"
const TOASTER_ID = "checkout-desk"

const TAGS = ["priority", "quiet chair"]

const fakeTerminal = (ms = 1400) => (total: number) =>
  new Promise<string>((resolve) => setTimeout(() => resolve("42"), ms)).then(() => String(total))

export function CheckoutDesk({ orderNo = ORDER_NO, openedBy = "Elin S.", lines = DEFAULT_LINES, onAuthorised, paymentApi, className }: CheckoutDeskProps) {
  const [rows, setRows] = React.useState(lines)
  const [tender, setTender] = React.useState("card")
  const [fulfilment, setFulfilment] = React.useState("collect")
  const [disc, setDisc] = React.useState<string | null>(null)
  const [authorising, setAuthorising] = React.useState(false)
  const [approved, setApproved] = React.useState<null | { tail: string; at: string }>(null)
  // the stepped flow is REAL: loyalty must be confirmed before delivery,
  // delivery (address when courier) before pay. each number reflects state.
  const [loyaltyDone, setLoyaltyDone] = React.useState(false)
  const [deliveryDone, setDeliveryDone] = React.useState(false)
  const [address, setAddress] = React.useState("")
  const [giftCode, setGiftCode] = React.useState("")
  const addressRef = React.useRef<HTMLInputElement>(null)
  const giftRef = React.useRef<HTMLInputElement>(null)

  const active = rows.filter((r) => !r.voided)
  const gross = active.reduce((a, r) => a + r.price * r.qty, 0)
  const net = disc && gross ? Math.round(gross * (1 - (disc === "staff" ? 0.2 : 0.1))) : gross
  const vat = Math.round(net - net / (1 + VAT))
  const total = net
  const no = orderNo.replace(/^\D+-\D+-/, "")

  const setQty = (id: string, q: number) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, qty: q } : r)))
  const voidLine = (r: SaleLine) => {
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, voided: true } : x)))
    toast.warning(`Line voided — ${r.name}`, {
      id: `void-${r.id}`,
      description: "Voided lines stay on the ticket for the audit.",
      action: { label: "Undo", onClick: () => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, voided: false } : x))) },
      duration: 5000,
      toasterId: TOASTER_ID,
    })
  }
  const addLine = () => {
    const l = { id: "m" + Date.now(), name: "Manual line", qty: 1, price: 0 }
    setRows((r) => [...r, l])
    toast("manual line added — set price", { toasterId: TOASTER_ID })
  }

  const confirmLoyalty = () => { setLoyaltyDone(true); toast("loyalty confirmed — on to delivery", { duration: 2600, toasterId: TOASTER_ID }) }
  const confirmDelivery = () => {
    if (fulfilment === "courier" && !address.trim()) {
      toast.error("Courier needs a drop-off address", { description: "“Delivery address” is empty — fill it to continue.", duration: 6000, toasterId: TOASTER_ID })
      addressRef.current?.focus()
      return
    }
    setDeliveryDone(true)
    toast("delivery set — ready to charge", { duration: 2600, toasterId: TOASTER_ID })
  }

  const authorise = async () => {
    if (!loyaltyDone || !deliveryDone) return
    if (tender === "gift" && !giftCode.trim()) {
      toast.error("Charge blocked — gift card code is empty", { description: "Type the code printed on the card to continue.", duration: 6000, toasterId: TOASTER_ID })
      giftRef.current?.focus()
      return
    }
    setAuthorising(true)
    const run = (paymentApi ?? fakeTerminal())(total)
      .then(() => "42")
    try {
      await toast.promise(run, {
        loading: `Waiting for terminal · ${total.toLocaleString()} kr ${tender}…`,
        success: `Payment authorised — ${tender} ••42`,
        error: "Terminal declined — the sale stays open",
        duration: 4000,
        toasterId: TOASTER_ID,
      })
      setApproved({ tail: "42", at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) })
      onAuthorised?.(total)
    } catch {
      /* the declined toast carries the news; nothing else to do */
    } finally {
      setAuthorising(false)
    }
  }

  const stepState = (n: 1 | 2 | 3): "done" | "current" | "locked" =>
    n === 1 ? (loyaltyDone ? "done" : "current")
      : n === 2 ? (!loyaltyDone ? "locked" : deliveryDone ? "done" : "current")
      : !loyaltyDone || !deliveryDone ? "locked" : approved ? "done" : "current"

  const StepMark = ({ n, label }: { n: 1 | 2 | 3; label: string }) => {
    const s = stepState(n as 1 | 2 | 3)
    return (
      <div className="flex items-baseline gap-2">
        <span
          aria-label={`Step ${n} · ${label} · ${s === "done" ? "confirmed" : s === "current" ? "in progress" : "locked"}`}
          className={cn(
            "grid size-[18px] shrink-0 translate-y-[2px] place-items-center rounded-full border-2 font-mono text-[9px] font-bold tabular-nums",
            s === "done" ? "border-[hsl(var(--ok))] bg-[hsl(var(--ok))] text-white" : s === "current" ? "border-foreground text-foreground" : "border-muted-foreground/40 text-muted-foreground/60",
          )}
        >
          {s === "done" ? <Check aria-hidden className="size-2.5" /> : `0${n}`}
        </span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">{label}</span>
      </div>
    )
  }

  return (
    <div className={cn("relative isolate flex flex-col overflow-hidden rounded-2xl border-2 border-foreground/85 bg-background font-sans text-foreground shadow-sm", className)}>
      <MotionConfig reducedMotion="user">
      {/* header — display numeral voice */}
      <header className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b px-5 pb-2.5 pt-3.5">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-[26px] font-bold leading-none tracking-[-0.02em]">
            № <span className="tabular-nums">{no}</span>
          </h2>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">till 2 · {openedBy}</span>
        </div>
        <div className="ml-auto flex gap-1.5">
          <Button variant="outline" size="sm" onClick={() => toast.success("receipt sent to printer", { toasterId: TOASTER_ID })}>
            <Printer aria-hidden /> Reprint
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!rows.some((r) => r.voided)}
            onClick={() => { setRows((rs) => rs.map((r) => ({ ...r, voided: false }))); toast.success("voided lines restored", { toasterId: TOASTER_ID }) }}
          >
            Restore voids
          </Button>
        </div>
      </header>

      {/* ticket: ledger left, growing total panel right */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* lines — till-roll ledger, dashed rules */}
        <section aria-label="Ticket lines" className="min-w-0 flex-1 border-b lg:border-b-0 lg:border-r">
          <div className="flex items-baseline justify-between border-b px-5 py-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">Ticket · {active.length} active lines</span>
            <Button variant="ghost" size="xs" onClick={addLine}>
              <Plus aria-hidden /> add line
            </Button>
          </div>
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="border-b text-left text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-5 py-1.5 font-semibold">Item</th>
                <th className="w-16 px-2 py-1.5 text-center font-semibold">Qty</th>
                <th className="w-24 px-2 py-1.5 text-right font-semibold">Price</th>
                <th className="w-24 px-3 py-1.5 text-right font-semibold">Amount</th>
                <th className="w-12 px-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={cn("border-b border-dashed last:border-0", r.voided && "opacity-40")}>
                  <td className="px-5 py-1.5">
                    {r.voided ? <span className="line-through">{r.name}</span> : <span className="font-medium">{r.name}</span>}
                  </td>
                  <td className="px-2 py-1.5">
                    {r.voided ? (
                      r.qty
                    ) : (
                      <InlineEditCell
                        value={String(r.qty)}
                        name={`quantity ${r.name}`}
                        mono
                        width={40}
                        onSave={async (v) => {
                          const num = Number(v)
                          if (!isFinite(num) || num < 0) throw new Error("qty")
                          setQty(r.id, Math.round(num))
                        }}
                      />
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">{r.price.toLocaleString()}</td>
                  <td className="px-3 py-1.5 text-right font-mono font-bold tabular-nums">{(r.price * r.qty).toLocaleString()}</td>
                  <td className="px-2 py-1.5 text-right">
                    {!r.voided && (
                      <Button variant="ghost" size="icon-xs" aria-label={`Void ${r.name}`} onClick={() => voidLine(r)} className="text-muted-foreground hover:text-[hsl(var(--err))]">
                        <Scissors aria-hidden className="size-3" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-dashed px-5 py-2 text-[11px] text-muted-foreground">Tap a quantity to change it · voided lines stay on the ticket for the audit</p>
        </section>

        {/* running total panel — mirrors every line, grows as the ticket grows */}
        <aside aria-label="Running total" className={cn("relative flex w-full shrink-0 flex-col bg-muted/30 lg:w-[300px]", approved && "bg-[hsl(var(--ok)/0.07)]")}>
          <div className="flex items-baseline justify-between border-b px-4 py-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">Running total</span>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{active.length} lines</span>
          </div>
          <ul className="divide-y px-4">
            <AnimatePresence initial={false}>
              {active.map((r) => (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-baseline justify-between py-1.5 text-[12px]"
                >
                  <span className="min-w-0 flex-1 truncate pr-2 text-muted-foreground">
                    <span className="font-mono tabular-nums">{r.qty}×</span> {r.name}
                  </span>
                  <span className="font-mono tabular-nums">{(r.price * r.qty).toLocaleString()}</span>
                </motion.li>
              ))}
            </AnimatePresence>
            {active.length === 0 && <li className="py-3 text-[12px] text-muted-foreground">No active lines.</li>}
          </ul>
          <dl className="mt-auto space-y-1.5 border-t-2 border-foreground/80 px-4 py-3 text-[12px]">
            <div className="flex justify-between"><dt className="text-muted-foreground">Gross</dt><dd className="font-mono tabular-nums">{gross.toLocaleString()} kr</dd></div>
            {disc && (
              <div className="flex justify-between"><dt className="text-muted-foreground">Discount · {disc}</dt><dd className="font-mono tabular-nums text-[hsl(var(--ok))]">{(net - gross).toLocaleString()} kr</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-muted-foreground">of which VAT 25%</dt><dd className="font-mono tabular-nums">{vat.toLocaleString()} kr</dd></div>
            <div className="flex items-baseline justify-between pt-1">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Due</dt>
              <motion.dd key={total} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="font-mono text-[24px] font-bold tabular-nums leading-none">
                {total.toLocaleString()}
                <span className="ml-1 text-[12px] font-medium text-muted-foreground">kr</span>
              </motion.dd>
            </div>
          </dl>

          {/* receipt — springs out of the panel once the terminal authorises */}
          <AnimatePresence>
            {approved && (
              <motion.div
                key="receipt"
                initial={{ y: 90, scale: 0.55, opacity: 0, rotate: 5 }}
                animate={{ y: 0, scale: 1, opacity: 1, rotate: -1.5 }}
                exit={{ y: 40, scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 17 }}
                role="status"
                aria-label={`Payment authorised at ${approved.at}, total ${total.toLocaleString()} kr`}
                className="absolute inset-x-3 bottom-3 z-10 overflow-hidden rounded-md border bg-background shadow-lg"
              >
                <div className="flex items-center justify-between border-b border-dashed bg-muted/40 px-3 py-1.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--ok))]">Authorised · {approved.at}</span>
                  <Button variant="ghost" size="xs" onClick={() => toast.warning("refund opened — manager PIN at terminal", { toasterId: TOASTER_ID })}>
                    <Undo2 aria-hidden className="size-3" /> refund
                  </Button>
                </div>
                <div className="space-y-1 px-3 py-2.5 font-mono text-[11px] tabular-nums">
                  <div className="flex justify-between text-muted-foreground"><span>till 2 · № {no}</span><span>{tender} · visa ••{approved.tail}</span></div>
                  {active.map((r) => (
                    <div key={r.id} className="flex justify-between">
                      <span className="truncate pr-2">{r.qty}× {r.name}</span>
                      <span>{(r.price * r.qty).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-dashed pt-1.5 text-[13px] font-bold">
                    <span>TOTAL</span><span>{total.toLocaleString()} kr</span>
                  </div>
                </div>
                <p className="px-3 pb-2.5 text-[11px] text-muted-foreground">
                  {fulfilment === "courier" ? "Courier slot booked — receipt emailed." : fulfilment === "post" ? "Packed for post — tracking emailed." : "Collected at the desk — thank you!"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>

      {/* stepped footer flow — loyalty → delivery → pay, each step gates the next */}
      <footer className="grid grid-cols-1 border-t md:grid-cols-3">
        {/* step 1 · loyalty */}
        <section aria-label="Loyalty" className={cn("border-b px-4 py-3 md:border-b-0 md:border-r", !loyaltyDone && "bg-muted/20")}>
          <StepMark n={1} label="Loyalty" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TAGS.map((t) => (
              <span key={t} className="rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{t}</span>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            {[["staff — 20%", "staff"], ["regular — 10%", "regular"]].map(([label, key]) => (
              <Button
                key={key}
                size="xs"
                variant={disc === key ? "secondary" : "outline"}
                aria-pressed={disc === key}
                onClick={() => setDisc(disc === key ? null : key)}
                disabled={!!approved}
              >
                {label}
              </Button>
            ))}
            {loyaltyDone ? (
              <span className="ml-auto flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--ok))]"><Check aria-hidden className="size-3" /> locked in</span>
            ) : (
              <Button size="xs" variant="outline" onClick={confirmLoyalty} className={cn("ml-auto", !loyaltyDone && "bg-primary text-primary-foreground hover:bg-primary/90")}>next</Button>
            )}
          </div>
        </section>
        {/* step 2 · delivery */}
        <section aria-label="Delivery" className={cn("border-b px-4 py-3 md:border-b-0 md:border-r", !loyaltyDone && "pointer-events-none opacity-45")}>
          <StepMark n={2} label="Delivery" />
          <SegmentedControl
            size="sm"
            className="mt-2 w-full max-w-[280px]"
            value={fulfilment}
            onChange={setFulfilment}
            options={[{ value: "collect", label: "Collect" }, { value: "courier", label: "Courier" }, { value: "post", label: "Post" }]}
          />
          {fulfilment === "courier" && !deliveryDone && (
            <div className="mt-2 max-w-[280px]">
              <label htmlFor="cd-address" className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Delivery address</label>
              <Input id="cd-address" ref={addressRef} placeholder="gatan 12, jönköping" value={address} onChange={(e) => setAddress(e.target.value)} className="h-8 text-[12px]" />
            </div>
          )}
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {fulfilment === "courier" ? "Same-day courier — address on the member card." : fulfilment === "post" ? "Ships tomorrow with the morning run." : "Handed over at the desk after payment."}
          </p>
          {deliveryDone ? (
            <span className="mt-1.5 flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--ok))]"><Check aria-hidden className="size-3" /> {fulfilment} · confirmed</span>
          ) : (
            <Button size="xs" variant="outline" onClick={confirmDelivery} disabled={!loyaltyDone} className="mt-1.5">next</Button>
          )}
        </section>
        {/* step 3 · pay */}
        <section aria-label="Pay" className={cn("px-4 py-3", (!loyaltyDone || !deliveryDone) && "pointer-events-none opacity-45")}>
          <StepMark n={3} label="Pay" />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <SegmentedControl size="sm" value={tender} onChange={setTender} options={[{ value: "card", label: "Card" }, { value: "cash", label: "Cash" }, { value: "gift", label: "Gift" }]} />
            <span className="ml-auto font-mono text-[13px] font-bold tabular-nums">{total.toLocaleString()} kr</span>
            <Button
              size="sm"
              onClick={authorise}
              disabled={authorising || !!approved || !active.length || !loyaltyDone || !deliveryDone}
              className="flex-1 min-w-40"
            >
              <CreditCard aria-hidden />
              {authorising ? "Waiting for terminal…" : approved ? `Paid · visa ••${approved.tail}` : !loyaltyDone || !deliveryDone ? "Finish steps 01–02" : `Charge ${total.toLocaleString()} kr`}
            </Button>
          </div>
          {tender === "gift" && !approved && (
            <div className="mt-2">
              <label htmlFor="cd-gift" className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Gift card code</label>
              <Input id="cd-gift" ref={giftRef} placeholder="GT-0000-0000" value={giftCode} onChange={(e) => setGiftCode(e.target.value)} className="h-8 w-44 text-[12px] font-mono" />
            </div>
          )}
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {tender === "cash" ? "Cash drawer count prints on the receipt." : tender === "gift" ? "Gift card balance is held pending email confirmation." : "Terminal 1 · taps, chips, wallets."}
          </p>
        </section>
      </footer>
      </MotionConfig>
      <Toaster id={TOASTER_ID} position="bottom-right" richColors closeButton />
    </div>
  )
}
