import { useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { BarChart3, Filter, Plus, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { TabsOverflowStrip, type AppTab } from "tabs-overflow-strip"
import { FunnelStageBars } from "funnel-stage-bars"
import { InlineEditCell } from "inline-edit-cell"
import { CopySecretField } from "copy-secret-field"
import { ActivityHeatmap, type HeatCell } from "activity-heatmap"
import { KpiTileLive } from "kpi-tile-live"
import { Button } from "@/components/ui/button"
import { BarChart } from "@/components/bklit/bar-chart"
import { Bar } from "@/components/bklit/bar"
import { Grid } from "@/components/bklit/grid"
import { BarXAxis } from "@/components/bklit/bar-x-axis"
import { ChartTooltip } from "@/components/bklit/tooltip/chart-tooltip"

// COMPOSITE SCREEN · STORE BACKEND
// Domain layout for a merch drop console: a KPI strip with deliberately uneven
// tile spans, a sales-by-day Bklit bar chart beside the drop funnel, the SKU
// money table with inline price edits, the order heatmap and embed keys. Tab
// switching reseeds every panel per drop.

export type MerchConsoleProps = {
  store?: string
  onPayout?: () => void
  className?: string
}

type Sku = { id: string; name: string; sku: string; price: number; stock: number; sold24: number }
type DaySale = { day: string; kr: number }
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

const DAY_LABELS = ["Tue 18", "Wed 19", "Thu 20", "Fri 21", "Sat 22", "Sun 23", "Mon 24", "Tue 25", "Wed 26", "Thu 27"]

/** Deterministic PRNG so each drop renders the same series across re-renders. */
const seeded = (seed: number) => {
  let s = seed * 9_301 + 49_297
  return () => {
    s = (s * 1_103_515_245 + 12_345) % 2_147_483_648
    return s / 2_147_483_648
  }
}

/** 10-day sales series per drop — weekends lift, slow trend up. */
const salesSeries = (seed: number): DaySale[] => {
  const r = seeded(seed)
  const base = 8_400 + (seed % 5) * 3_100
  return DAY_LABELS.map((day, i) => {
    const weekend = i % 7 === 4 || i % 7 === 5
    const v = base * (weekend ? 1.6 : 0.85 + r() * 0.5) * (1 + i * 0.02)
    return { day, kr: Math.round(v / 10) * 10 }
  })
}

/** Short trend spark for the KPI tiles. */
const sparkFor = (seed: number, n = 12): number[] => {
  const r = seeded(seed)
  const out: number[] = []
  let v = 42 + (seed % 7) * 6
  for (let i = 0; i < n; i++) {
    v = Math.max(6, v + (r() - 0.45) * 15)
    out.push(Math.round(v))
  }
  return out
}

const heatFor = (seed: number): HeatCell[] =>
  Array.from({ length: 56 }, (_, i) => ({ count: (i * 37 + seed * 13) % 9 === 0 ? 0 : ((i * 29 + seed) % 61) % 7 }))

const heatColor = (level: number) => `var(--chart-scale-0${Math.min(5, Math.max(1, level + 1))})`

const paidSum = (d: DropData) => d.skus.reduce((a, s) => a + s.price * s.sold24, 0)
const soldSum = (d: DropData) => d.skus.reduce((a, s) => a + s.sold24, 0)
const convPct = (d: DropData) => {
  const top = d.funnel[0]?.value ?? 0
  const paid = d.funnel.at(-1)?.value ?? 0
  return top > 0 ? (paid / top) * 100 : 0
}

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
  const [funnelHover, setFunnelHover] = useState<number | null>(null)

  const data = DROPS[active] ?? FALLBACK
  const priceOf = (s: Sku) => prices[`${active}:${s.id}`] ?? s.price

  const sales = salesSeries(data.seed)
  const bestDay = sales.reduce((a, b) => (b.kr > a.kr ? b : a), sales[0])
  const salesTotal = sales.reduce((a, d) => a + d.kr, 0)

  const gross24 = paidSum(data)
  const orders24 = soldSum(data)
  const conv = convPct(data)
  const funnelStage = funnelHover !== null ? data.funnel[funnelHover] : undefined

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

  return (
    <div className={cn("flex min-h-[560px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Store backend</h2>
        <span className="text-[12px] text-muted-foreground">{store}</span>
        <span className="text-[12px] text-muted-foreground">· payout Friday</span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={newDrop}>
            <Plus className="size-3.5" /> New drop
          </Button>
          <Button size="sm" onClick={requestPayout} disabled={!!payout}>
            <Wallet className="size-3.5" /> {payout ? `Requested · ${payout.at}` : "Request payout"}
          </Button>
          </MotionConfig>
    </div>
      </header>

      <div className="border-b bg-background px-4 pt-2">
        <TabsOverflowStrip tabs={tabs} value={active} onChange={setActive} onPin={(id: string) => setTabs((ts) => ts.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)))} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-12">
        {/* ── KPI strip · deliberately uneven spans ──────────────────────── */}
        <KpiTileLive
          className="lg:col-span-5"
          label="Paid · 24 h"
          value={gross24}
          prev={Math.round(gross24 * 0.94)}
          format={(v) => v.toLocaleString("sv-SE")}
          unit="kr"
          spark={sparkFor(data.seed + 1)}
          sparkColor="var(--chart-line-primary)"
          sparkHeight={36}
        />
        <KpiTileLive
          className="lg:col-span-4"
          label="Orders · 24 h"
          value={orders24}
          prev={Math.max(0, orders24 - 5)}
          unit="orders"
          spark={sparkFor(data.seed + 2)}
          sparkColor="var(--chart-2)"
          sparkHeight={36}
        />
        <KpiTileLive
          className="lg:col-span-3"
          label="Views → paid"
          value={conv}
          prev={Math.max(0, conv - 0.4)}
          format={(v) => v.toFixed(1)}
          unit="%"
          spark={sparkFor(data.seed + 3)}
          sparkColor="var(--chart-3)"
          sparkHeight={36}
        />

        {/* ── sales by day + funnel ──────────────────────────────────────── */}
        <section className="overflow-hidden rounded-lg border bg-card lg:col-span-8">
          <div className="flex flex-wrap items-end justify-between gap-2 px-4 pt-3.5">
            <div>
              <h3 className="flex items-center gap-1.5 text-[13px] font-bold tracking-tight">
                <BarChart3 className="size-3.5 text-muted-foreground" /> Sales by day
              </h3>
              <p className="text-[11px] text-muted-foreground">gross kr / day · last 10 days · drop {active}</p>
            </div>
            <span className="font-mono text-[13px] font-bold tabular-nums">{salesTotal.toLocaleString("sv-SE")} kr</span>
          </div>
          <div className="px-2 pb-2 pt-2">
            <BarChart data={sales} xDataKey="day" margin={{ top: 10, right: 12, bottom: 26, left: 8 }} animationDuration={900} aspectRatio="2.7 / 1" barGap={0.36}>
              <Grid horizontal numTicksRows={4} strokeDasharray="3,5" strokeOpacity={0.8} />
              <Bar dataKey="kr" fill="var(--chart-line-primary)" lineCap="round" minBarHeight={2} />
              <BarXAxis maxLabels={10} />
              <ChartTooltip
                rows={(p) => [{ color: "var(--chart-2)", label: "sales", value: `${Number(p.kr).toLocaleString("sv-SE")} kr` }]}
              />
            </BarChart>
          </div>
          <dl className="grid grid-cols-3 divide-x border-t px-0 py-2 text-[11px]">
            {([
              ["best day", `${bestDay?.day} · ${compact(bestDay?.kr ?? 0)}`],
              ["avg / day", compact(Math.round(salesTotal / Math.max(1, sales.length)))],
              ["days shown", String(sales.length)],
            ] as const).map(([k, v]) => (
              <div key={k} className="px-4">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</dt>
                <dd className="mt-0.5 font-mono tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="overflow-hidden rounded-lg border bg-card lg:col-span-4">
          <div className="flex items-center justify-between px-4 pt-3.5">
            <h3 className="flex items-center gap-1.5 text-[13px] font-bold tracking-tight">
              <Filter className="size-3.5 text-muted-foreground" /> Sales funnel
            </h3>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">48 h</span>
          </div>
          {funnelStage && (
            <p className="px-4 pt-1.5 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">{funnelStage.label}</span> · {funnelStage.value.toLocaleString("sv-SE")}
              {data.funnel[0] && data.funnel[0].value > 0 && <> · {((funnelStage.value / data.funnel[0].value) * 100).toFixed(1)}% of views</>}
            </p>
          )}
          <div className="p-3 pt-2">
            <FunnelStageBars
              stages={data.funnel}
              eyebrow={`drop ${active}`}
              topLabel="paid conversion"
              layers={2}
              edges="curved"
              orientation="horizontal"
              showDropOff
              hoveredIndex={funnelHover}
              onHoverChange={setFunnelHover}
            />
          </div>
        </section>

        {/* ── SKU money table + order heat ───────────────────────────────── */}
        <section className="flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card lg:col-span-7">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
            <h3 className="text-[13px] font-bold tracking-tight">
              SKUs <span className="ml-1 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">{data.skus.length}</span>
            </h3>
            <span className="text-[11px] text-muted-foreground">tap a price to edit · edits mark the drop dirty</span>
          </header>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b bg-muted/20 text-left text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                <th className="px-4 py-1.5 font-semibold">SKU</th>
                <th className="w-24 px-2 py-1.5 text-right font-semibold">Price</th>
                <th className="w-16 px-2 py-1.5 text-right font-semibold">Stock</th>
                <th className="w-16 px-2 py-1.5 text-right font-semibold">Sold</th>
                <th className="w-28 px-4 py-1.5 text-right font-semibold">Rev 24 h</th>
              </tr>
            </thead>
            <tbody>
              {data.skus.map((s) => {
                const live = priceOf(s)
                return (
                  <tr key={s.id} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-1">
                      <span className="font-medium">{s.name}</span>
                      <span className={cn("ml-2 font-mono text-[11px] tabular-nums", s.stock === 0 ? "text-[hsl(var(--err))]" : "text-muted-foreground")}>{s.sku}</span>
                    </td>
                    <td className="px-2 py-1 text-right">
                      <div className="flex justify-end">
                        <InlineEditCell value={String(live)} name={`${s.name} price`} mono width={56} onSave={async (v: string) => savePrice(s, v)} />
                      </div>
                    </td>
                    <td className={cn("px-2 py-1 text-right font-mono tabular-nums", s.stock === 0 && "font-bold text-[hsl(var(--err))]")}>{s.stock}</td>
                    <td className="px-2 py-1 text-right font-mono tabular-nums">{s.sold24}</td>
                    <td className="px-4 py-1 text-right font-mono font-semibold tabular-nums">{(live * s.sold24).toLocaleString("sv-SE")}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="mt-auto border-t px-4 py-2">
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

        <section className="overflow-hidden rounded-lg border bg-card lg:col-span-5">
          <div className="flex flex-wrap items-end justify-between gap-2 px-4 pt-3.5">
            <div>
              <h3 className="text-[13px] font-bold tracking-tight">Order heat · 8 wks</h3>
              <p className="text-[11px] text-muted-foreground">orders per day · weeks start Monday</p>
            </div>
            <span className="font-mono text-[11px] font-bold tabular-nums">{gross24.toLocaleString("sv-SE")} kr / 24 h</span>
          </div>
          <div className="p-3 pt-1">
            <ActivityHeatmap cells={heat} weeks={8} showTooltip showLegend weekStartDay={1} colorScale={heatColor} />
          </div>
        </section>

        {/* ── embed keys + payout ────────────────────────────────────────── */}
        <section className="overflow-hidden rounded-lg border bg-card lg:col-span-5">
          <header className="flex items-center justify-between border-b px-4 py-2.5">
            <h3 className="text-[13px] font-bold tracking-tight">Embed keys</h3>
            <span className="font-mono text-[10px] text-muted-foreground">drop {active}</span>
          </header>
          <div className="space-y-2.5 p-4">
            <CopySecretField value={keyValue} label="Storefront key" mono rotating={rotating} onRotate={rotateKey} />
            <div className="rounded-md border border-dashed p-2.5" style={{ background: "hsl(var(--app-code))" }}>
              <code className="block break-all font-mono text-[11px] leading-relaxed text-muted-foreground">
                {`<script src="https://cdn.${store.split(".")[0]}.shop/embed.js" data-drop="${active}" async></script>`}
              </code>
            </div>
            <p className="text-[11px] text-muted-foreground">The embed renders the drop grid on any page · rotate revokes the old key in 60 s.</p>
          </div>
        </section>

        <section className={cn("overflow-hidden rounded-lg border bg-card transition-colors lg:col-span-7", payout && "border-[hsl(var(--ok)/0.5)]")}>
          <header className="flex items-center justify-between border-b px-4 py-2.5">
            <h3 className="text-[13px] font-bold tracking-tight">Payout</h3>
            <span className="text-[11px] text-muted-foreground">aggregated every night 00:00</span>
          </header>
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
            {([["Gross 24 h", gross24], ["Fees 2.9 %", Math.round(gross24 * 0.029)], ["Net 24 h", gross24 - Math.round(gross24 * 0.029)]] as const).map(([k, v]) => (
              <div key={k} className={cn("rounded-md border bg-muted/20 px-3 py-2", k === "Net 24 h" && "border-[hsl(var(--ok)/0.4)] bg-[hsl(var(--ok)/0.06)]")}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</p>
                <p className="mt-0.5 font-mono text-[16px] font-bold tabular-nums">{v.toLocaleString("sv-SE")} kr</p>
              </div>
            ))}
            <AnimatePresence>
              {payout && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-md border border-[hsl(var(--ok)/0.5)] bg-[hsl(var(--ok)/0.08)] px-3 py-2 text-[11px] font-bold text-[hsl(var(--ok))] sm:col-span-3">
                  PAYOUT REQUESTED · {payout.at} · lands Friday
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  )
}

const compact = (v: number) => (v >= 10_000 ? `${(v / 1000).toFixed(1)}k` : v.toLocaleString("sv-SE"))
