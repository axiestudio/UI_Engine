import * as React from "react"
import { ArrowRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, Ordinal, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

const BASES = [
  { id: "solo", name: "Solo", blurb: "One chair, one stylist", price: 249 },
  { id: "studio", name: "Studio", blurb: "Up to six chairs", price: 649 },
] as const
const EXTRAS = [
  { id: "app", name: "Client app", blurb: "Bookings & loyalty in one pocket", price: 60 },
  { id: "sms", name: "SMS reminders", blurb: "Cut the no-shows", price: 40 },
  { id: "payroll", name: "Payroll", blurb: "Chairs, rent and commissions", price: 140 },
] as const

type BaseId = (typeof BASES)[number]["id"]
type ExtraId = (typeof EXTRAS)[number]["id"]
type Cadence = "monthly" | "yearly"

const YEARLY_DISCOUNT = 0.2

export type PlanBuilderProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function PlanBuilder({
  eyebrow = "Quiet Times Studio · Plans",
  title = "Build the plan your salon needs.",
  subtitle = "Start from a base, pick a rhythm, bolt on extras. The tally at the bottom keeps up as you go.",
  caption = "PLAN BUILDER · LIVE TALLY",
  tone = "paper",
  className,
}: PlanBuilderProps) {
  const ink = tone === "ink"
  const reduce = React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  )
  const [baseId, setBaseId] = React.useState<BaseId>("solo")
  const [cadence, setCadence] = React.useState<Cadence>("monthly")
  const [extras, setExtras] = React.useState<ExtraId[]>(["sms"])

  const base = BASES.find((b) => b.id === baseId)!
  const baseNow = cadence === "yearly" ? Math.round(base.price * (1 - YEARLY_DISCOUNT)) : base.price
  const extrasPicked = EXTRAS.filter((e) => extras.includes(e.id))
  const extrasSum = extrasPicked.reduce((sum, e) => sum + e.price, 0)
  const total = baseNow + extrasSum

  const toggleExtra = (id: ExtraId) =>
    setExtras((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const hair = ink ? "border-background/15" : "border-border"

  return (
    <SectionShell tone={tone} width={760} rule="bottom" className={className}>
      <InView
        once
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.12 }}
      >
        <div className="mt-10">
          <div
            className={cn(
              "mx-auto w-full max-w-[520px] overflow-hidden rounded-[16px] border bg-card shadow-[0_24px_52px_-30px_hsl(var(--foreground)/0.45)]",
              ink ? "border-background/15" : "border-border"
            )}
          >
            <div className={cn("flex items-center justify-between border-b px-6 py-3.5", hair)}>
              <MonoLabel>Quiet Times · Plan builder</MonoLabel>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">SEK · excl. moms</span>
            </div>

            <div className="space-y-6 px-6 py-5">
              <div>
                <div className="flex items-center gap-3">
                  <Ordinal n={1} />
                  <MonoLabel className="text-muted-foreground">Base plan</MonoLabel>
                </div>
                <div role="radiogroup" aria-label="Base plan" className="mt-3 grid grid-cols-2 gap-2.5">
                  {BASES.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      role="radio"
                      aria-checked={baseId === b.id}
                      onClick={() => setBaseId(b.id)}
                      className={cn(
                        "rounded-xl border px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        baseId === b.id ? "border-primary bg-primary/[0.06]" : "border-border hover:border-foreground/30 hover:bg-muted/40"
                      )}
                    >
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="font-display text-[14px] font-bold">{b.name}</span>
                        <span className="font-mono text-[11px] font-bold tabular-nums text-muted-foreground">{b.price} kr</span>
                      </span>
                      <span className="mt-1 block text-[11px] font-medium text-muted-foreground">{b.blurb}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Ordinal n={2} />
                  <MonoLabel className="text-muted-foreground">Cadence</MonoLabel>
                </div>
                <div role="radiogroup" aria-label="Billing cadence" className={cn("flex rounded-full border bg-muted p-1", hair)}>
                  {(["monthly", "yearly"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={cadence === c}
                      onClick={() => setCadence(c)}
                      className={cn(
                        "rounded-full px-4 py-1.5 font-display text-[12px] font-bold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        cadence === c ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {c}
                      {c === "yearly" && <span className="ml-1.5 font-mono text-[10px] font-black tracking-tight text-primary">−20%</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <Ordinal n={3} />
                  <MonoLabel className="text-muted-foreground">Extras</MonoLabel>
                </div>
                <div role="group" aria-label="Extras" className="mt-3 space-y-2">
                  {EXTRAS.map((e) => {
                    const on = extras.includes(e.id)
                    return (
                      <button
                        key={e.id}
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        onClick={() => toggleExtra(e.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          on ? "border-primary bg-primary/[0.06]" : "border-border hover:border-foreground/30 hover:bg-muted/40"
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "flex size-[18px] shrink-0 items-center justify-center rounded-md border transition-colors",
                            on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                          )}
                        >
                          {on && <Check className="size-3" strokeWidth={3} />}
                        </span>
                        <span className="flex-1">
                          <span className="block font-display text-[13px] font-bold">{e.name}</span>
                          <span className="block text-[11px] font-medium text-muted-foreground">{e.blurb}</span>
                        </span>
                        <span className="font-mono text-[11px] font-bold tabular-nums text-muted-foreground">+{e.price} kr</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className={cn("border-t px-6 py-5", ink ? "border-background/15 bg-foreground/5" : "border-border bg-muted/40")}>
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3 text-[12px] font-medium">
                  <span className="text-muted-foreground">
                    Base — {base.name}
                    {cadence === "yearly" && (
                      <span className={cn("ml-2 rounded-full border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em]", hair)}>
                        billed yearly
                      </span>
                    )}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {cadence === "yearly" && <span className="mr-1.5 text-muted-foreground line-through">{base.price}</span>}
                    {baseNow} kr
                  </span>
                </div>
                {extrasPicked.map((e) => (
                  <div key={e.id} className="flex items-baseline justify-between gap-3 text-[12px] font-medium">
                    <span className="text-muted-foreground">{e.name}</span>
                    <span className="font-semibold tabular-nums">+{e.price} kr</span>
                  </div>
                ))}
                {extrasPicked.length === 0 && (
                  <div className="flex items-baseline justify-between gap-3 text-[12px] font-medium">
                    <span className="text-muted-foreground">Extras</span>
                    <span className="tabular-nums text-muted-foreground">—</span>
                  </div>
                )}
              </div>

              <div className={cn("my-4 border-t", hair)} />

              <div aria-live="polite" className="flex items-end justify-between gap-4">
                <MonoLabel className="text-muted-foreground">Total</MonoLabel>
                <div className="text-right">
                  <p className="font-display text-[32px] font-bold leading-none tracking-[-0.02em] tabular-nums">{total} kr</p>
                  <p className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    {cadence === "yearly" ? "per month, billed yearly" : "per month"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label={`Continue with ${base.name}, ${total} kr per month`}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-display text-[13px] font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Continue with {base.name}
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>

          <p className="mx-auto mt-8 flex w-full max-w-[520px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            <span>{caption}</span>
            <span aria-hidden>●</span>
          </p>
        </div>
      </InView>
    </SectionShell>
  )
}
