import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Plus, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { TabsOverflowStrip, type AppTab } from "tabs-overflow-strip"
import { FunnelStageBars } from "funnel-stage-bars"
import { InlineEditCell } from "inline-edit-cell"
import { CopySecretField } from "copy-secret-field"
import { ActivityHeatmap, type HeatCell } from "activity-heatmap"

// COMPOSITE SCREEN · STORE BACKEND
// composed of: tabs-overflow-strip (tabs per drop), funnel-stage-bars (sales
// funnel), activity-heatmap (heat of orders), inline-edit-cell (price cells),
// copy-secret-field (API embed keys) + purpose-built payout summary.

export type MerchConsoleProps = {
  store?: string
  onPayout?: () => void
  className?: string
}

type Sku = { id: string; name: string; sku: string; price: number; stock: number; sold24: number }
type DropData = { skus: Sku[]; funnel: { label: string; value: number }[]; seed: number }

const DROPS: Record<string, DropData> = {
  ss26: {
    skus: [
      { id: "k1", name: "Thermal hoodie — ash", sku: "HTW-0114", price: 890, stock: 342, sold24: 41 },
      { id: "k2", name: "Heat glove liner", sku: "HTW-0207", price: 340, stock: 22, sold24: 88 },
      { id: "k3", name: "Wind shell — signal", sku: "HTW-0233", price: 1240, stock: 118, sold24: 12 },
      { id: "k4", name: "Merino beanie", sku: "HTW-0290", price: 290, stock: 0, sold24: 63 },
    ],
    funnel: [
      { label: "views", value: 48200 },
      { label: "carts", value: 6100 },
      { label: "checkout", value: 2400 },
      { label: "paid", value: 1918 },
    ],
    seed: 7,
  },
  archive: {
    skus: [
      { id: "k5", name: "FW24 puffer — restock", sku: "HTW-0450", price: 1490, stock: 76, sold24: 24 },
      { id: "k6", name: "FW24 parka — restock", sku: "HTW-0451", price: 2190, stock: 18, sold24: 9 },
    ],
    funnel: [
      { label: "views", value: 12400 },
      { label: "carts", value: 1980 },
      { label: "checkout", value: 810 },
      { label: "paid", value: 702 },
    ],
    seed: 19,
  },
  acc: {
    skus: [
      { id: "k7", name: "Charge port kit", sku: "HTW-0602", price: 190, stock: 540, sold24: 130 },
      { id: "k8", name: "Care kit textile", sku: "HTW-0611", price: 120, stock: 410, sold24: 51 },
    ],
    funnel: [
      { label: "views", value: 9400 },
      { label: "carts", value: 2600 },
      { label: "checkout", value: 1500 },
      { label: "paid", value: 1388 },
    ],
    seed: 33,
  },
}

const FALLBACK: DropData = {
  skus: [{ id: "kd", name: "Untitled SKU — name me", sku: "HTW-0000", price: 500, stock: 0, sold24: 0 }],
  funnel: [
    { label: "views", value: 0 },
    { label: "carts", value: 0 },
    { label: "checkout", value: 0 },
    { label: "paid", value: 0 },
  ],
  seed: 5,
}

const heatFor = (seed: number): HeatCell[] =>
  Array.from({ length: 56 }, (_, i) => ({ count: (i * 37 + seed * 13) % 9 === 0 ? 0 : ((i * 29 + seed) % 61) % 7 }))

const paidSum = (d: DropData) => d.skus.reduce((a, s) => a + s.price * s.sold24, 0)

export function MerchConsole({ store = "heatwear.se", onPayout, className }: MerchConsoleProps) {
  const [tabs, setTabs] = useState<AppTab[]>([
    { id: "ss26", label: "SS26 · Heatwear", pinned: true },
    { id: "archive", label: "Archive restock" },
    { id: "acc", label: "Accessories" },
  ])
  const [active, setActive] = useState("ss26")
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [audit, setAudit] = useState<{ at: string; text: string }[]>([
    { at: "12:04", text: "HEA-0207 price 320 → 340 kr · auto reindex queued" },
  ])
  const [rotating, setRotating] = useState(false)
  const [keyValue, setKeyValue] = useState("pk_live_htw_9f3e21c84d")
  const [payout, setPayout] = useState<null | { at: string }>(null)

  const data = DROPS[active] ?? FALLBACK
  const priceOf = (s: Sku) => prices[`${active}:${s.id}`] ?? s.price

  const savePrice = async (s: Sku, v: string) => {
    const num = Number(v.replace(/\s/g, ""))
    if (!isFinite(num) || num <= 0) throw new Error("not a price")
    const at = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    setPrices((p) => ({ ...p, [`${active}:${s.id}`]: Math.round(num) }))
    setTabs((ts) => ts.map((t) => (t.id === active ? { ...t, dirty: true } : t)))
    setAudit((a) => [{ at, text: `${s.sku} price ${s.price} → ${Math.round(num)} kr · reindex queued` }, ...a].slice(0, 6))
  }

  const newDrop = () => {
    const id = "d" + String(Date.now())
    setTabs((ts) => [...ts, { id, label: "Drop · draft", dirty: true }])
    setActive(id)
  }

  const rotateKey = () => {
    setRotating(true)
    setTimeout(() => {
      setKeyValue("pk_live_htw_" + Math.random().toString(16).slice(2, 12))
      setRotating(false)
    }, 800)
  }

  const requestPayout = () => {
    setPayout({ at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })
    onPayout?.()
  }

  const heat = heatFor(data.seed)
  const gross24 = paidSum(data)

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Store backend</h2>
        <span className="text-[12px] text-muted-foreground">{store}</span>
        <span className="text-[12px] text-muted-foreground">· payout Friday</span>
        <button onClick={newDrop} className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted">
          <Plus className="size-3.5" /> New drop
        </button>
        <button onClick={requestPayout} disabled={!!payout} className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted disabled:opacity-40">
          <Wallet className="size-3.5" /> {payout ? `Requested · ${payout.at}` : "Request payout"}
        </button>
      </header>

      <div className="border-b bg-background px-4 pt-2">
        <TabsOverflowStrip tabs={tabs} value={active} onChange={setActive} onPin={(id: string) => setTabs((ts) => ts.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)))} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[260px_minmax(0,1fr)_290px]">
        {/* funnel + heat */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Sales funnel</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">48 h</span>
            </header>
            <div className="p-3">
              <FunnelStageBars stages={data.funnel} eyebrow={`drop ${active}`} />
            </div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Order heat · 8 wks</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{gross24.toLocaleString()} kr / 24 h</span>
            </header>
            <div className="p-3">
              <ActivityHeatmap cells={heat} weeks={8} />
            </div>
          </section>
        </aside>

        {/* skus */}
        <section className="flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">SKUs · {data.skus.length}</span>
            <span className="text-[11px] text-muted-foreground">tap a price to edit · edits mark the drop dirty</span>
          </header>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b text-left text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="px-3 py-1.5 font-semibold">SKU</th>
                <th className="w-24 px-2 py-1.5 text-right font-semibold">Price</th>
                <th className="w-16 px-2 py-1.5 text-right font-semibold">Stock</th>
                <th className="w-20 px-3 py-1.5 text-right font-semibold">Sold 24 h</th>
              </tr>
            </thead>
            <tbody>
              {data.skus.map((s) => (
                <tr key={s.id} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-1">
                    <span className="font-medium">{s.name}</span>
                    <span className={cn("ml-2 font-mono text-[11px] tabular-nums", s.stock === 0 ? "text-[hsl(var(--err))]" : "text-muted-foreground")}>{s.sku}</span>
                  </td>
                  <td className="px-2 py-1 text-right">
                    <div className="flex justify-end">
                      <InlineEditCell value={String(priceOf(s))} name={`${s.name} price`} mono width={56} onSave={async (v: string) => savePrice(s, v)} />
                    </div>
                  </td>
                  <td className={cn("px-2 py-1 text-right font-mono tabular-nums", s.stock === 0 && "font-bold text-[hsl(var(--err))]")}>{s.stock}</td>
                  <td className="px-3 py-1 text-right font-mono tabular-nums">{s.sold24}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-auto border-t px-3 py-2">
            <ul className="space-y-0.5">
              <AnimatePresence initial={false}>
                {audit.map((a, i) => (
                  <motion.li key={`${a.at}-${a.text}-${i}`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-2 text-[11px]">
                    <span className="font-mono tabular-nums text-muted-foreground">{a.at}</span>
                    <span className="text-muted-foreground">{a.text}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </section>

        {/* keys + payout */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Embed keys</header>
            <div className="space-y-2.5 p-3">
              <CopySecretField value={keyValue} label="Storefront key" mono rotating={rotating} onRotate={rotateKey} />
              <div className="rounded-md border border-dashed p-2.5" style={{ background: "hsl(var(--app-code))" }}>
                <code className="block break-all font-mono text-[11px] leading-relaxed text-muted-foreground">
                  {`<script src="https://cdn.${store.split(".")[0]}.shop/embed.js" data-drop="${active}" async></script>`}
                </code>
              </div>
              <p className="text-[11px] text-muted-foreground">The embed renders the drop grid on any page · rotate revokes the old key in 60 s.</p>
            </div>
          </section>
          <section className={cn("overflow-hidden rounded-lg border bg-card transition-colors", payout && "border-[hsl(var(--ok)/0.5)]")}>
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Payout</header>
            <div className="space-y-1.5 p-3 text-[12px]">
              {[["Gross 24 h", gross24], ["Fees 2.9 %", Math.round(gross24 * 0.029)], ["Net 24 h", gross24 - Math.round(gross24 * 0.029)]].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono tabular-nums">{Number(v).toLocaleString()} kr</span>
                </div>
              ))}
              <AnimatePresence>
                {payout && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 rounded-md border border-[hsl(var(--ok)/0.5)] bg-[hsl(var(--ok)/0.08)] px-3 py-2 text-[11px] font-bold text-[hsl(var(--ok))]">
                    PAYOUT REQUESTED · {payout.at} · lands Friday
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
