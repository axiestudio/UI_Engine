// pricing-lab — price bench: drag levers, watch margin gauges + odometer
// revenue reshape, and fold in (or reject with undo) the agent's per-hunk
// price edits. One deterministic seed keeps the whole bench stable.
import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Check, RotateCcw, Sparkles, Undo2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { AnimatedNumber } from "@/components/primitives/animated-number"
import { AreaChart, Area } from "@/components/bklit/area-chart"
import { Grid } from "@/components/bklit/grid"
import { XAxis } from "@/components/bklit/x-axis"
import { YAxis } from "@/components/bklit/y-axis"
import { ChartTooltip } from "@/components/bklit/tooltip/chart-tooltip"
import { RadialGauge } from "radial-gauge"
import { KpiTileLive } from "kpi-tile-live"
import { DragNumberField } from "drag-number-field"

export type PricingLabProps = {
  /** initial lever values — defaults to the seeded bench */
  initialBase?: number
  initialDiscount?: number
  initialTier?: number
  className?: string
}

// ── deterministic PRNG (mulberry32, seeded from a string signature) ────────
function hashSeed(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type LeverState = { base: number; discount: number; tier: number }

type Proposal = {
  id: string
  hunk: string
  title: string
  detail: string
  from: string
  to: string
  effect: Partial<LeverState>
}

// seeded agent proposals — each one edits a hunk of the price book
const PROPOSALS: Proposal[] = [
  {
    id: "p-base-6",
    hunk: "price-book · base seat",
    title: "Raise base seat $29 → $31",
    detail: "Win-rate held at 61% in the $31 band last quarter; the $2 lands straight on margin.",
    from: "$29.00",
    to: "$31.00",
    effect: { base: 2 },
  },
  {
    id: "p-disc-5",
    hunk: "price-book · launch discount",
    title: "Trim launch discount 15% → 10%",
    detail: "Discount depth past 12% correlates with 2.3× churn; reclaim half of it.",
    from: "−15%",
    to: "−10%",
    effect: { discount: -5 },
  },
  {
    id: "p-tier-up",
    hunk: "price-book · seat tier",
    title: "Move default cohort to tier 2 (Growth)",
    detail: "Growth seats carry $9.40 cost vs $14.80 service load — mix shift lifts blended margin.",
    from: "tier 1 · Starter",
    to: "tier 2 · Growth",
    effect: { tier: 1 },
  },
  {
    id: "p-counter",
    hunk: "price-book · annual counter-offer",
    title: "Counter-offer: base −$1 if discount deepens 4%",
    detail: "Protects the enterprise pipeline flag; blended margin dips 1.1pt, volume covers it.",
    from: "$29.00 · −15%",
    to: "$28.00 · −19%",
    effect: { base: -1, discount: 4 },
  },
]

const TIER_COST = [6.2, 9.4, 14.8]
const TIER_SEATS = [1240, 860, 420]
const TIER_NAMES = ["Starter", "Growth", "Scale"]
const FIXED_MONTHLY_COST = 24_000
const BENCH_DATE = new Date(2026, 8, 1) // fixed — the demo must not drift

const usd = (v: number, dp = 2) =>
  "$" + v.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp })

export function PricingLab({
  initialBase = 29,
  initialDiscount = 15,
  initialTier = 1,
  className,
}: PricingLabProps) {
  const reduce = useReducedMotion()

  // ── state ────────────────────────────────────────────────────────────────
  const [levers, setLevers] = React.useState<LeverState>({
    base: initialBase,
    discount: initialDiscount,
    tier: initialTier,
  })
  const [annual, setAnnual] = React.useState(true)
  const [accepted, setAccepted] = React.useState<string[]>([])
  const [rejected, setRejected] = React.useState<string[]>([])
  const undoTimers = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  React.useEffect(() => {
    const timers = undoTimers.current
    return () => Object.values(timers).forEach(clearTimeout)
  }, [])

  const reject = (id: string) => {
    setRejected((r) => [...r, id])
    undoTimers.current[id] = setTimeout(() => {
      setRejected((r) => r.filter((x) => x !== id))
      delete undoTimers.current[id]
    }, 4000)
  }
  const undo = (id: string) => {
    clearTimeout(undoTimers.current[id])
    delete undoTimers.current[id]
    setRejected((r) => r.filter((x) => x !== id))
  }
  const acceptAll = () =>
    setAccepted((a) => [...a, ...PROPOSALS.map((p) => p.id).filter((id) => !accepted.includes(id) && !rejected.includes(id))])
  const reset = () => {
    Object.values(undoTimers.current).forEach(clearTimeout)
    undoTimers.current = {}
    setAccepted([])
    setRejected([])
    setLevers({ base: initialBase, discount: initialDiscount, tier: initialTier })
  }

  // ── effective pricing = levers + folded-in proposals ────────────────────
  // Levers always edit the EFFECTIVE value: folded-in deltas are subtracted
  // back out so dragging never fights an accepted hunk.
  const deltas = React.useMemo(() => {
    const acc = PROPOSALS.filter((p) => accepted.includes(p.id))
    return {
      base: acc.reduce((v, p) => v + (p.effect.base ?? 0), 0),
      discount: acc.reduce((v, p) => v + (p.effect.discount ?? 0), 0),
      tier: acc.reduce((v, p) => v + (p.effect.tier ?? 0), 0),
    }
  }, [accepted])

  const eff = React.useMemo(() => ({
    base: Math.min(99, Math.max(9, levers.base + deltas.base)),
    discount: Math.min(60, Math.max(0, levers.discount + deltas.discount)),
    tier: Math.min(3, Math.max(1, levers.tier + deltas.tier)),
  }), [levers, deltas])

  const set = (k: keyof LeverState) => (v: number) => {
    const bounds = k === "base" ? [9, 99] : k === "discount" ? [0, 60] : [1, 3]
    const raw = Math.min(bounds[1], Math.max(bounds[0], v - deltas[k]))
    setLevers((s) => ({ ...s, [k]: k === "tier" ? Math.round(raw) : raw }))
  }

  const ti = eff.tier - 1
  const net = eff.base * (1 - eff.discount / 100)
  const cost = TIER_COST[ti]
  const seats = TIER_SEATS[ti]
  const marginPct = net > 0 ? ((net - cost) / net) * 100 : 0
  const mrr = net * seats
  const cover = (mrr * 0.62) / FIXED_MONTHLY_COST // gross contribution vs fixed load
  const projected = annual ? mrr * 12 : mrr

  // ── 12-month projection curve (seeded wobble, stable per state) ─────────
  const sig = `${eff.base.toFixed(2)}|${eff.discount}|${eff.tier}|${annual}`
  const curve = React.useMemo(() => {
    const rand = mulberry32(hashSeed(sig))
    const g = 0.018 - eff.discount * 0.0004 + (annual ? 0.006 : 0)
    let v = mrr
    return Array.from({ length: 12 }, (_, i) => {
      v = v * (1 + g) + (rand() - 0.42) * mrr * 0.012
      return { date: new Date(2026, 8 + i, 1), rev: Math.round(v) }
    })
  }, [sig, eff.discount, annual, mrr])

  const marginZone = marginPct < 45 ? "err" : marginPct < 65 ? "warn" : "ok"
  const pending = PROPOSALS.filter((p) => !accepted.includes(p.id) && !rejected.includes(p.id))
  const undoable = PROPOSALS.filter((p) => rejected.includes(p.id))

  return (
    <div className={cn("font-sans text-foreground", className)}>
      {/* ── header band: bare, hairline-ruled — the margin arc anchors it ── */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border/70 pb-5">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Revenue ops · bench 04
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold tracking-tight">Pricing lab</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Drag the levers — margin gauges and the revenue odometer follow. The agent files
            price edits below; fold in what you trust.
          </p>
        </div>
        <RadialGauge
          value={marginPct}
          min={0}
          max={100}
          precision={1}
          unit="%"
          size={140}
          label="blended margin"
          zones={[
            { to: 0.45, color: "hsl(var(--err))", label: "thin" },
            { to: 0.65, color: "hsl(var(--warn))", label: "watch" },
            { to: 1, color: "hsl(var(--ok))", label: "healthy" },
          ]}
        />
      </div>

      {/* ── 12-col bench ──────────────────────────────────────────────────── */}
      <div className="mt-5 grid grid-cols-12 gap-5">
        {/* levers — solid card, left rail */}
        <section aria-label="Price levers" className="col-span-12 rounded-xl border border-border/70 bg-card shadow-sm lg:col-span-5">
          <header className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
            <h3 className="font-display text-lg font-semibold">Levers</h3>
            <p className="font-mono text-[11px] font-medium text-muted-foreground">drag · scroll · type</p>
          </header>
          <div className="space-y-5 px-5 py-4">
            <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <DragNumberField label="Base price" value={eff.base} onValueChange={set("base")} step={0.5} precision={2} min={9} max={99} unit="$" />
              <RadialGauge orientation="linear" size={200} notches={28} showCenterValue={false} label="net / seat" value={net} min={0} max={110} precision={2} unit="" zones={[{ to: 0.36, color: "hsl(var(--err))", label: "under water" }, { to: 0.64, color: "hsl(var(--warn))", label: "thin" }, { to: 1, color: "hsl(var(--ok))", label: "priced" }]} />
            </div>
            <div className="grid items-center gap-3 border-t border-border/50 pt-5 sm:grid-cols-[minmax(0,1fr)_auto]">
              <DragNumberField label="Launch discount" value={eff.discount} onValueChange={set("discount")} step={1} precision={0} min={0} max={60} unit="%" />
              <RadialGauge orientation="linear" size={200} notches={28} showCenterValue={false} label="headroom" value={100 - eff.discount} min={0} max={100} precision={0} unit="" zones={[{ to: 0.4, color: "hsl(var(--err))", label: "giving it away" }, { to: 0.7, color: "hsl(var(--warn))", label: "deep" }, { to: 1, color: "hsl(var(--ok))", label: "room" }]} />
            </div>
            <div className="grid items-center gap-3 border-t border-border/50 pt-5 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="space-y-1.5">
                <DragNumberField label="Seat tier" value={eff.tier} onValueChange={set("tier")} step={1} precision={0} min={1} max={3} />
                <p className="text-xs text-muted-foreground">tier {eff.tier} · {TIER_NAMES[ti]} · {seats.toLocaleString()} seats · {usd(cost)} cost</p>
              </div>
              <RadialGauge orientation="linear" size={200} notches={28} showCenterValue={false} label="fixed-cost cover" value={cover} min={0} max={3} precision={2} unit="×" zones={[{ to: 0.9, color: "hsl(var(--err))", label: "not covering" }, { to: 1.6, color: "hsl(var(--warn))", label: "close" }, { to: 3, color: "hsl(var(--ok))", label: "covered" }]} />
            </div>
            <label className="flex items-center justify-between border-t border-border/50 pt-4">
              <span className="text-sm font-medium">
                Bill annually
                <span className="ml-2 font-mono text-[11px] font-medium text-muted-foreground">{annual ? "run-rate ×12" : "monthly view"}</span>
              </span>
              <Switch checked={annual} onCheckedChange={setAnnual} aria-label="Bill annually" />
            </label>
          </div>
        </section>

        {/* right column: revenue band (full-bleed, hairlines) over chart card */}
        <div className="col-span-12 space-y-5 lg:col-span-7">
          <section aria-label="Projected revenue" className="border-y border-border/70 bg-muted/30 px-5 py-4">
            <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {annual ? "Annual run-rate" : "Monthly recurring"}
                </p>
                <p className="mt-1 flex items-baseline gap-1.5 font-display text-4xl font-bold tracking-tight">
                  <span className="text-2xl text-muted-foreground">$</span>
                  <AnimatedNumber value={projected} />
                </p>
              </div>
              <div className="ml-auto grid w-full max-w-md grid-cols-3 gap-3">
                <KpiTileLive label="Net MRR" value={mrr} format={(v) => "$" + Math.round(v).toLocaleString()} spark={curve.map((c) => c.rev)} sparkColor="var(--chart-line-primary)" sparkHeight={22} />
                <KpiTileLive label="Margin" value={marginPct} format={(v) => v.toFixed(1) + "%"} danger={marginZone === "err"} spark={curve.map((c) => ((c.rev * (1 - eff.discount / 100) - cost * seats) / Math.max(1, c.rev)) * 100)} sparkColor="var(--chart-line-secondary)" sparkHeight={22} />
                <KpiTileLive label="Seats" value={seats} format={(v) => Math.round(v).toLocaleString()} spark={[seats, seats, seats, seats, seats, seats]} sparkColor="var(--chart-crosshair)" sparkHeight={22} />
              </div>
            </div>
          </section>

          <section aria-label="Revenue projection" className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            <header className="flex flex-wrap items-baseline justify-between gap-2 px-1 pb-2">
              <h3 className="font-display text-lg font-semibold">Where does the year land?</h3>
              <p className="font-mono text-[11px] font-medium text-muted-foreground">
                12-mo projection · {TIER_NAMES[ti]} · {eff.discount}% off
              </p>
            </header>
            <AreaChart data={curve} margin={{ top: 12, right: 14, bottom: 26, left: 2 }} style={{ aspectRatio: "auto", height: 236 }}>
              <Grid horizontal numTicksRows={4} />
              <Area dataKey="rev" fill="var(--chart-line-primary)" stroke="var(--chart-line-primary)" />
              <XAxis numTicks={6} />
              <YAxis numTicks={4} />
              <ChartTooltip rows={(p) => [{ color: "var(--chart-line-primary)", label: "projected", value: "$" + Number(p.rev).toLocaleString("en-US") }]} />
            </AreaChart>
          </section>
        </div>

        {/* agent proposals — dashed surface, full width */}
        <section aria-label="Agent proposals" className="col-span-12 rounded-xl border border-dashed border-border bg-card/50">
          <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-dashed border-border/80 px-5 py-3.5">
            <Sparkles aria-hidden className="size-4 text-[hsl(var(--info))]" />
            <h3 className="font-display text-lg font-semibold">Agent proposals</h3>
            <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[11px] font-bold text-accent-foreground" role="status">
              {pending.length} pending · {accepted.length} folded in
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw aria-hidden /> Reset bench
              </Button>
              <Button size="sm" disabled={pending.length === 0} onClick={acceptAll}>
                <Check aria-hidden /> Accept all
              </Button>
            </div>
          </header>

          <div className="px-5 py-4">
            {/* folded-in hunks collapse into chips */}
            {accepted.length > 0 && (
              <ul className="mb-4 flex flex-wrap gap-2" aria-label="Folded-in hunks">
                {PROPOSALS.filter((p) => accepted.includes(p.id)).map((p) => (
                  <motion.li
                    key={p.id}
                    initial={reduce ? false : { opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--ok)/0.45)] bg-[hsl(var(--ok)/0.08)] px-3 py-1 text-xs font-medium"
                  >
                    <Check aria-hidden className="size-3.5 text-[hsl(var(--ok))]" />
                    {p.title}
                  </motion.li>
                ))}
              </ul>
            )}

            <ul className="grid gap-3 xl:grid-cols-2" aria-live="polite">
              <AnimatePresence initial={false}>
                {pending.map((p) => (
                  <motion.li
                      key={p.id}
                      layout={!reduce}
                      initial={reduce ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, x: -28, height: 0, marginBottom: 0 }}
                      transition={{ duration: reduce ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden rounded-lg border-l-2 border-l-[hsl(var(--info))] border-y border-y-border/70 border-r border-r-border/70 bg-background shadow-sm"
                    >
                      <div className="flex items-start gap-3 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-[11px] font-medium text-muted-foreground">{p.hunk}</p>
                          <p className="mt-0.5 text-sm font-semibold">{p.title}</p>
                          <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{p.detail}</p>
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          <Button size="icon" variant="outline" aria-label={`Accept proposal: ${p.title}`} onClick={() => setAccepted((a) => [...a, p.id])} className="border-[hsl(var(--ok)/0.5)] text-[hsl(var(--ok))] hover:bg-[hsl(var(--ok)/0.1)] hover:text-[hsl(var(--ok))]">
                            <Check aria-hidden />
                          </Button>
                          <Button size="icon" variant="outline" aria-label={`Reject proposal: ${p.title}`} onClick={() => reject(p.id)}>
                            <X aria-hidden />
                          </Button>
                        </div>
                      </div>
                      <p className="border-t border-border/50 bg-muted/30 px-4 py-1.5 font-mono text-[11px] font-medium tabular-nums">
                        <del className="mr-2 text-muted-foreground">{p.from}</del>
                        <ins className="font-bold text-[hsl(var(--ok))]">{p.to}</ins>
                      </p>
                    </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {/* rejected: 4s undo strip */}
            <AnimatePresence>
              {undoable.map((p) => (
                <motion.div
                  key={p.id}
                  role="status"
                  initial={reduce ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2 text-sm"
                >
                  <Undo2 aria-hidden className="size-4 text-muted-foreground" />
                  <span>
                    Rejected <strong className="font-semibold">{p.title}</strong>
                    <span className="ml-1.5 font-mono text-[11px] font-medium text-muted-foreground">discarding in 4s</span>
                  </span>
                  <Button size="sm" variant="outline" className="ml-auto" onClick={() => undo(p.id)}>
                    Undo
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>

            {pending.length === 0 && undoable.length === 0 && accepted.length > 0 && (
              <p className="py-2 text-center text-sm text-muted-foreground">
                All hunks folded in — the bench reflects the agent&apos;s edits.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
