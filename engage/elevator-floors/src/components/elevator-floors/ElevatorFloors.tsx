import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { ArrowDown, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, CornerTicks } from "@/components/primitives/handcraft"

// ═══ JOB      make plan tiers physical — you ride to the one you choose
// ═══ EMOTION  trust in an engine that clearly holds weight
// ═══ SIGNATURE brass floor indicator COUNTS and ticks as you switch plans;
//               two-panel elevator doors part over the selected plan's details
//   SITE     → pricing section as a lift shaft (plans = floors)
//   APP      → billing plan switcher card (same component, app `frame`)
//   A11Y     floors are a radiogroup (keys move); doors are decorative —
//             details are always in the DOM for SRs; reduced = no slide

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
  className?: string
}

export function ElevatorFloors({ eyebrow = "TAKE THE LIFT", title, floors, defaultFloor = 1, className }: ElevatorFloorsProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [floor, setFloor] = React.useState(Math.max(0, Math.min(floors.length - 1, defaultFloor)))
  const active = floors[floor]

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-background px-4 py-20 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="mb-9 max-w-xl">
          <MonoLabel className="text-muted-foreground">{eyebrow}</MonoLabel>
          {title && <h2 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-[40px]">{title}</h2>}
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* call buttons + indicator */}
          <div className="flex lg:block">
            <div role="radiogroup" aria-label="Plans" className="relative w-full overflow-hidden rounded-xl border-2 border-[hsl(var(--lift-shaft))] bg-[hsl(var(--lift-shaft))] p-5 text-[hsl(var(--lift-ink))]">
              <CornerTicks size={10} offset={6} className="text-white/25" />
              {/* floor indicator */}
              <div className="mb-6 flex items-center justify-between border-b border-white/15 pb-4">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-white/50">Now serving</span>
                <span className="font-display text-4xl font-black leading-none tabular-nums text-[hsl(var(--lift-panel))]">{floor + 1}</span>
                <span className="flex flex-col gap-1">
                  <button aria-label="Floor up" disabled={floor === floors.length - 1} onClick={() => setFloor((f) => Math.min(floors.length - 1, f + 1))} className="grid size-6 place-items-center rounded-full border border-white/25 disabled:opacity-25 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[hsl(var(--lift-panel))]"><ArrowUp className="size-3.5" /></button>
                  <button aria-label="Floor down" disabled={floor === 0} onClick={() => setFloor((f) => Math.max(0, f - 1))} className="grid size-6 place-items-center rounded-full border border-white/25 disabled:opacity-25 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[hsl(var(--lift-panel))]"><ArrowDown className="size-3.5" /></button>
                </span>
              </div>
              {/* brass floor buttons */}
              <ul className="grid grid-cols-4 gap-2 lg:grid-cols-3">
                {floors.map((f, i) => (
                  <li key={f.name}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={i === floor}
                      onClick={() => setFloor(i)}
                      className={cn(
                        "flex h-16 w-full flex-col items-center justify-center gap-1 rounded-full border-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition-all",
                        i === floor
                          ? "border-[hsl(var(--lift-panel))] bg-[hsl(var(--lift-panel))] text-[hsl(var(--lift-shaft))] shadow-[0_0_18px_hsl(var(--lift-panel)/0.45)]"
                          : "border-white/20 text-white/70 hover:border-white/50",
                      )}
                    >
                      <span className="text-base">{i + 1}</span>
                      <span className="px-1 leading-tight">{f.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {/* shaft cable tick line */}
              <motion.span
                aria-hidden
                className="absolute -right-[3px] top-10 hidden h-8 w-[6px] rounded-full bg-[hsl(var(--lift-floor-glow))] lg:block"
                animate={{ top: `${96 + floor * 74}px` }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 18 }}
              />
            </div>
          </div>

          {/* shaft doors + cabin interior */}
          <div className="relative min-h-[420px] overflow-hidden rounded-xl border-2 border-[hsl(var(--lift-shaft))] bg-[hsl(var(--lift-panel)/0.06)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.name}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex h-full flex-col p-6 sm:p-8"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-6">
                  <h3 className="font-display text-2xl font-black tracking-tight">{active.name}{active.badge && <span className="ml-3 rounded-full bg-foreground px-2.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-[0.16em] text-background align-middle">{active.badge}</span>}</h3>
                  {active.price && (
                    <p className="font-display text-[34px] font-black tabular-nums tracking-tight">
                      {active.price}<span className="ml-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{active.period}</span>
                    </p>
                  )}
                </div>
                {active.blurb && <p className="mt-2 max-w-md text-sm font-medium text-muted-foreground">{active.blurb}</p>}
                <ul className="mt-6 flex-1 divide-y divide-border/70 border-y">
                  {active.features.map((ft) => (
                    <li key={ft.label} className="flex items-center gap-3 py-3 text-sm font-semibold">
                      <span aria-hidden className={cn("grid size-5 shrink-0 place-items-center rounded-full border text-[10px]", ft.included === false ? "border-border text-muted-foreground" : "border-[hsl(var(--lift-floor-glow))] bg-[hsl(var(--lift-floor-glow)/0.12)] text-[hsl(var(--lift-floor-glow))]")}>{ft.included === false ? "—" : "✓"}</span>
                      <span className={cn(ft.included === false && "text-muted-foreground line-through decoration-border")}>{ft.label}</span>
                    </li>
                  ))}
                </ul>
                {active.cta && (
                  <button type="button" onClick={active.cta.onClick} className="mt-7 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-[hsl(var(--lift-shaft))] px-7 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--lift-panel))]">
                    {active.cta.label}
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
            {/* the doors (decorative sweep on change) */}
            {!reduce && (
              <Doors key={floor} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Doors() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 flex">
      {[0, 1].map((side) => (
        <motion.span
          key={side}
          initial={{ x: side ? "0%" : "0%", opacity: 1 }}
          animate={{ x: side ? "102%" : "-102%", opacity: 1 }}
          transition={{ duration: 0.65, ease: [0.7, 0, 0.2, 1] }}
          className="h-full w-1/2 border-x border-black/30 bg-gradient-to-b from-[hsl(var(--lift-shaft))] via-[hsl(var(--steel,220_9%_16%))] to-[hsl(var(--lift-shaft))]"
          style={{ [side ? "right" : "left"]: 0 } as React.CSSProperties}
        >
          <span className="absolute inset-y-8 left-3 w-[2px] bg-black/40" />
          <span className="absolute inset-y-8 right-3 w-[2px] bg-white/10" />
        </motion.span>
      ))}
    </div>
  )
}
