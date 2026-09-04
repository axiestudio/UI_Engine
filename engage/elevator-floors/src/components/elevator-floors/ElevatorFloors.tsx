import * as React from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { ArrowDown, ArrowUp, Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { MonoLabel, CornerTicks } from "@/components/primitives/handcraft"

// ═══ JOB      make plan tiers physical — you ride to the one you choose
// ═══ EMOTION  trust in an engine that clearly holds weight
// ═══ SIGNATURE brass floor indicator counts and ticks as you switch plans;
//               two-panel elevator doors part over the selected plan's details
//   SITE     → pricing section as a lift shaft (plans = floors)
//   APP      → billing plan switcher card (controlled `defaultFloor` / `onFloorChange`)
//   A11Y     radiogroup with arrow-key roving, live region, reduced-motion
//            falls back to crossfade, doors are decorative

export type LiftFloor = {
  name: string
  price?: string
  period?: string
  blurb?: string
  features: { label: string; included?: boolean }[]
  cta?: { label: string; href?: string; onClick?: () => void }
  badge?: string
}

export type ElevatorFloorsProps = {
  eyebrow?: string
  title?: React.ReactNode
  floors: LiftFloor[]
  defaultFloor?: number
  /** Controlled floor index — when set, component is controlled. */
  floor?: number
  onFloorChange?: (index: number) => void
  className?: string
}

export function ElevatorFloors({
  eyebrow = "TAKE THE LIFT",
  title,
  floors = [
    {
      name: "Studio",
      price: "€0",
      period: "/month",
      blurb: "For curious neighbours.",
      features: [{ label: "Open hours walk-ins", included: true }, { label: "Two bookings a month", included: true }, { label: "Workshop discounts", included: false }],
      cta: { label: "Take this floor" },
    },
    {
      name: "Regular",
      price: "€29",
      period: "/month",
      blurb: "Most of our regulars ride here.",
      features: [{ label: "Everything in Studio", included: true }, { label: "Weekly booking", included: true }, { label: "Priority slots", included: true }],
      cta: { label: "Take this floor" },
      badge: "Most chosen",
    },
    {
      name: "Patron",
      price: "€89",
      period: "/month",
      blurb: "Unlimited access and the late slot.",
      features: [{ label: "Everything in Regular", included: true }, { label: "Unlimited sessions", included: true }, { label: "Saturday late opening", included: true }],
      cta: { label: "Take this floor" },
    },
  ],
  defaultFloor = 1,
  floor: controlledFloor,
  onFloorChange,
  className,
}: ElevatorFloorsProps) {
  const reduceMotion = useReducedMotion()
  const reduce = !!reduceMotion
  const [internal, setInternal] = React.useState(() => Math.max(0, Math.min(floors.length - 1, defaultFloor)))
  const floor = controlledFloor ?? internal
  const active = floors[floor] ?? floors[0]
  const setFloor = React.useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(floors.length - 1, next))
      if (controlledFloor === undefined) setInternal(clamped)
      onFloorChange?.(clamped)
    },
    [controlledFloor, floors.length, onFloorChange],
  )

  if (!floors.length) {
    return (
      <section className={cn("relative isolate overflow-hidden w-full bg-background px-4 py-16", className)}>
        <p className="mx-auto max-w-[1120px] font-mono text-sm text-muted-foreground">No floors configured.</p>
      </section>
    )
  }

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8", className)} aria-labelledby={title ? "elevator-title" : undefined}>
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="mb-8 max-w-xl">
          <MonoLabel className="text-muted-foreground">{eyebrow}</MonoLabel>
          {title && (
            <h2 id="elevator-title" className="mt-3 font-display text-3xl font-black tracking-tight sm:text-[40px]">
              {title}
            </h2>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* call panel + controls */}
          <div className="relative overflow-hidden rounded-xl border-2 border-[hsl(var(--lift-shaft))] bg-[hsl(var(--lift-shaft))] p-5 text-[hsl(var(--lift-ink))] shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)]">
            <CornerTicks size={10} offset={6} className="text-white/20" />
            {/* floor indicator */}
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">Now serving</p>
                <p className="font-mono text-[11px] font-medium text-white/60">Floor {floor + 1} of {floors.length}</p>
              </div>
              <span className="grid place-items-center rounded-lg bg-white/5 px-3 py-1.5 font-display text-3xl font-black leading-none tabular-nums text-[hsl(var(--lift-panel))] ring-1 ring-white/10" aria-live="polite" aria-atomic>
                {floor + 1}
              </span>
              <span className="flex flex-col gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  aria-label="Floor up"
                  disabled={floor === floors.length - 1}
                  onClick={() => setFloor(floor + 1)}
                  className="size-7 rounded-full border-white/20 bg-white/[0.04] p-0 text-white hover:bg-white/10 hover:border-white/30 focus-visible:ring-[hsl(var(--lift-panel))] focus-visible:ring-offset-[hsl(var(--lift-shaft))]"
                >
                  <ArrowUp className="size-3.5" aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  aria-label="Floor down"
                  disabled={floor === 0}
                  onClick={() => setFloor(floor - 1)}
                  className="size-7 rounded-full border-white/20 bg-white/[0.04] p-0 text-white hover:bg-white/10 hover:border-white/30 focus-visible:ring-[hsl(var(--lift-panel))] focus-visible:ring-offset-[hsl(var(--lift-shaft))]"
                >
                  <ArrowDown className="size-3.5" aria-hidden />
                </Button>
              </span>
            </div>

            {/* brass floor buttons */}
            <RadioGroup
              value={String(floor)}
              onValueChange={(v) => setFloor(Number(v))}
              aria-label="Pricing floors"
              className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3 [&_[data-slot=radio-group-indicator]]:hidden"
            >
              {floors.map((f, i) => (
                <RadioGroupItem
                  key={f.name}
                  value={String(i)}
                  className={cn(
                    "group flex h-[72px] flex-col items-center justify-center gap-1 rounded-2xl border-2 px-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] shadow-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--lift-panel))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--lift-shaft))] data-[state=checked]:border-[hsl(var(--lift-panel))] data-[state=checked]:bg-[hsl(var(--lift-panel))] data-[state=checked]:text-[hsl(var(--lift-shaft))] data-[state=checked]:shadow-[0_6px_20px_hsl(var(--lift-panel)/0.35)] data-[state=unchecked]:border-white/15 data-[state=unchecked]:bg-white/[0.03] data-[state=unchecked]:text-white/70 hover:border-white/30 hover:bg-white/[0.07] hover:text-white",
                  )}
                >
                  <span className="font-display text-lg leading-none tabular-nums">{i + 1}</span>
                  <span className="line-clamp-1 px-1 text-center leading-tight">{f.name}</span>
                </RadioGroupItem>
              ))}
            </RadioGroup>

            <p className="sr-only" aria-live="polite">
              Selected floor {floor + 1}: {active.name} {active.price ? `at ${active.price} ${active.period ?? ""}` : ""}
            </p>

            {/* shaft cable tick */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute -right-1 top-0 hidden h-8 w-1.5 rounded-full bg-[hsl(var(--lift-floor-glow))] shadow-[0_0_12px_hsl(var(--lift-floor-glow)/0.5)] lg:block"
              animate={{ y: 96 + floor * 76 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 20 }}
            />
          </div>

          {/* shaft doors + cabin interior */}
          <div className="relative flex min-h-[440px] flex-col overflow-hidden rounded-xl border-2 border-[hsl(var(--lift-shaft))] bg-[hsl(var(--lift-panel)/0.06)] shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.name}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="flex h-full flex-1 flex-col p-6 sm:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <h3 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
                    {active.name}
                    {active.badge && (
                      <span className="ml-3 inline-flex items-center rounded-full bg-foreground px-3 py-1 align-middle font-mono text-[9px] font-black uppercase tracking-[0.16em] text-background">
                        {active.badge}
                      </span>
                    )}
                  </h3>
                  {active.price && (
                    <p className="font-display text-[30px] font-black leading-none tracking-tight sm:text-[36px]">
                      {active.price}
                      {active.period && <span className="ml-1.5 align-baseline font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{active.period}</span>}
                    </p>
                  )}
                </div>
                {active.blurb && <p className="mt-3 max-w-[48ch] text-sm font-medium leading-relaxed text-muted-foreground">{active.blurb}</p>}

                <ul className="mt-6 flex-1 divide-y divide-border/60 rounded-xl border bg-card/50">
                  {active.features.map((ft) => {
                    const included = ft.included !== false
                    return (
                      <li key={ft.label} className="flex items-center gap-3 px-4 py-3.5 text-sm">
                        <span
                          aria-hidden
                          className={cn(
                            "grid size-6 shrink-0 place-items-center rounded-full border text-[11px] font-black",
                            included
                              ? "border-[hsl(var(--lift-floor-glow))] bg-[hsl(var(--lift-floor-glow))/0.12] text-[hsl(var(--lift-floor-glow))]"
                              : "border-border bg-muted text-muted-foreground",
                          )}
                        >
                          {included ? <Check className="size-3.5" /> : <Minus className="size-3" />}
                        </span>
                        <span className={cn("font-medium leading-none", !included && "text-muted-foreground line-through decoration-muted-foreground/30")}>{ft.label}</span>
                        <span className="sr-only">{included ? "Included" : "Not included"}</span>
                      </li>
                    )
                  })}
                </ul>

                {active.cta && (
                  active.cta.href ? (
                    <a
                      href={active.cta.href}
                      onClick={active.cta.onClick}
                      className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[hsl(var(--lift-shaft))] px-7 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm transition-all hover:translate-y-[-1px] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--lift-shaft))] focus-visible:ring-offset-2"
                    >
                      {active.cta.label}
                    </a>
                  ) : (
                    <Button
                      type="button"
                      onClick={active.cta.onClick}
                      className="mt-6 h-11 rounded-full bg-[hsl(var(--lift-shaft))] px-7 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-[hsl(var(--lift-shaft))]/90 hover:translate-y-[-1px] hover:shadow-md"
                    >
                      {active.cta.label}
                    </Button>
                  )
                )}
              </motion.div>
            </AnimatePresence>

            {!reduce && <Doors key={floor} />}
          </div>
        </div>
      </div>
    </section>
  )
}

function Doors() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 flex overflow-hidden rounded-lg">
      {[0, 1].map((side) => (
        <motion.span
          key={side}
          initial={{ x: "0%" }}
          animate={{ x: side ? "102%" : "-102%" }}
          transition={{ duration: 0.62, ease: [0.7, 0, 0.2, 1] }}
          className="relative h-full w-1/2 border-black/25 bg-gradient-to-b from-[hsl(var(--lift-shaft))] via-[hsl(220_9%_18%)] to-[hsl(var(--lift-shaft))]"
          style={{ borderLeftWidth: side ? 1 : 0, borderRightWidth: side ? 0 : 1 } as React.CSSProperties}
        >
          <span className="absolute inset-y-6 left-2 w-px bg-black/30" />
          <span className="absolute inset-y-6 right-2 w-px bg-white/10" />
          <span className="absolute left-1/2 top-1/2 h-10 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/8" />
        </motion.span>
      ))}
    </div>
  )
}
