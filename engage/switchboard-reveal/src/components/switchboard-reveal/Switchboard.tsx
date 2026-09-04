import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { PhoneCall, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel } from "@/components/primitives/handcraft"

// ═══ JOB      get the visitor to the right human on the first try
// ═══ EMOTION  mastery — you just patched the line yourself
// ═══ SIGNATURE tapping a route lights its jack and draws an SVG patch cable
//               from the IN socket; the answer-lamp glows green when connected
//   SITE  → "who do you want to speak to?" contact-routing band
//   APP   → support ticket router / department chooser (controlled)
//   A11Y  radiogroup with arrow-key roving, focus-visible, live region,
//         cables are decorative (aria-hidden), reduced-motion skips cable

export type SwitchRoute = { id: string; label: string; desc?: string; meta?: string }

export type SwitchboardProps = {
  eyebrow?: string
  title?: React.ReactNode
  intro?: React.ReactNode
  routes: SwitchRoute[]
  inLabel?: string
  connectedLabel?: string
  defaultValue?: string
  value?: string
  onSelect?: (route: SwitchRoute) => void
  className?: string
}

export function Switchboard({
  eyebrow = "THE SWITCHBOARD",
  title = "Who do you need?",
  intro,
  routes = [
    { id: "bookings", label: "Bookings", desc: "Move, change, cancel an appointment.", meta: "Front desk" },
    { id: "membership", label: "Membership", desc: "Plans, billing, the regular rate card.", meta: "Accounts" },
    { id: "press", label: "Press & collabs", desc: "Press kit, shoots, partnerships.", meta: "Studio" },
  ],
  inLabel = "IN — YOUR CALL",
  connectedLabel = "Line connected",
  defaultValue,
  value,
  onSelect,
  className,
}: SwitchboardProps) {
  const reduceMotion = useReducedMotion()
  const reduce = !!reduceMotion
  const [internal, setInternal] = React.useState<string | null>(defaultValue ?? null)
  const active = value !== undefined ? value : internal
  const activeRoute = routes.find((r) => r.id === active) ?? null

  const jackRefs = React.useRef<Record<string, HTMLLabelElement | null>>({})
  const gridRef = React.useRef<HTMLDivElement>(null)
  const inRef = React.useRef<HTMLSpanElement>(null)
  const [cable, setCable] = React.useState<{ d: string; key: string } | null>(null)

  const computeCable = React.useCallback(
    (routeId: string | null) => {
      if (!routeId || reduce) {
        setCable(null)
        return
      }
      const host = gridRef.current
      const from = inRef.current
      const el = jackRefs.current[routeId]
      if (!host || !from || !el) return
      const hr = host.getBoundingClientRect()
      const a = from.getBoundingClientRect()
      const b = el.getBoundingClientRect()
      const x1 = a.left + a.width / 2 - hr.left
      const y1 = a.top + a.height / 2 - hr.top
      const x2 = b.left + b.width / 2 - hr.left
      const y2 = b.top + b.height / 2 - hr.top
      const sag = Math.max(36, Math.abs(x2 - x1) * 0.32)
      setCable({ d: `M ${x1} ${y1} C ${x1} ${y1 + sag}, ${x2} ${y2 + sag}, ${x2} ${y2}`, key: routeId })
    },
    [reduce],
  )

  const pick = React.useCallback(
    (route: SwitchRoute) => {
      if (value === undefined) setInternal(route.id)
      onSelect?.(route)
      // delay to allow DOM to settle before measuring
      requestAnimationFrame(() => computeCable(route.id))
    },
    [computeCable, onSelect, value],
  )

  // Recompute cable on resize / route change
  React.useEffect(() => {
    if (!active) {
      setCable(null)
      return
    }
    computeCable(active)
    const onResize = () => computeCable(active)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [active, computeCable])

  // Keyboard roving for radiogroup
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!routes.length) return
    const idx = routes.findIndex((r) => r.id === active)
    let next: number | null = null
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = idx < routes.length - 1 ? idx + 1 : 0
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = idx > 0 ? idx - 1 : routes.length - 1
    if (e.key === "Home") next = 0
    if (e.key === "End") next = routes.length - 1
    if (next !== null) {
      e.preventDefault()
      pick(routes[next])
      // focus the radio input
      const id = routes[next].id
      const label = jackRefs.current[id]
      label?.querySelector<HTMLInputElement>('input[type="radio"]')?.focus()
    }
  }

  if (!routes.length) {
    return (
      <section className={cn("relative isolate overflow-hidden w-full bg-[hsl(var(--board))] px-4 py-16", className)}>
        <p className="mx-auto max-w-[1120px] font-mono text-sm text-[hsl(var(--board-jack))]/60">No routes configured.</p>
      </section>
    )
  }

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-[hsl(var(--board))] px-4 py-16 sm:px-6 sm:py-20 lg:px-8", className)} aria-labelledby="switchboard-title">
      <div className="mx-auto grid w-full max-w-[1120px] gap-10 lg:grid-cols-[0.95fr_1.15fr] lg:items-center">
        <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-40px" }}>
          <div className="max-w-md">
            <MonoLabel className="text-[hsl(var(--board-jack))]/70">{eyebrow}</MonoLabel>
            <h2 id="switchboard-title" className="mt-3 font-display text-[32px] font-black leading-[1.02] tracking-[-0.03em] text-[hsl(var(--board-jack))] sm:text-[44px]">
              {title}
            </h2>
            {intro && <p className="mt-4 text-[15px] font-medium leading-[1.7] text-[hsl(var(--board-jack))]/65">{intro}</p>}
            <p
              aria-live="polite"
              aria-atomic
              className={cn(
                "mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] shadow-sm transition-all",
                activeRoute ? "bg-[hsl(var(--board-lamp))] text-white" : "bg-[hsl(var(--board-jack))] text-[hsl(var(--board-face))]",
              )}
            >
              {activeRoute ? <Check className="size-3.5" aria-hidden /> : <PhoneCall className="size-3.5" aria-hidden />}
              {activeRoute ? `${connectedLabel}: ${activeRoute.label}` : "Pick a line to patch"}
            </p>
          </div>
        </InView>

        <div
          ref={gridRef}
          className="relative rounded-xl border-2 border-[hsl(var(--board-jack))]/20 bg-[hsl(var(--board-face))] p-5 pt-8 shadow-[0_20px_48px_-20px_hsl(var(--foreground)/0.35)] sm:p-6 sm:pt-8"
        >
          {/* the IN socket */}
          <span
            ref={inRef}
            aria-hidden
            className="absolute -top-3.5 left-6 inline-flex items-center gap-2 rounded-full border-2 border-[hsl(var(--board-jack))] bg-[hsl(var(--board-face))] px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--board-jack))] shadow-sm"
          >
            <span className="size-2.5 rounded-full bg-[hsl(var(--board-jack))] shadow-[inset_0_0_0_2px_hsl(var(--board-face))]" />
            {inLabel}
          </span>

          {cable && !reduce && (
            <svg aria-hidden className="pointer-events-none absolute inset-0 z-10 h-full w-full">
              <motion.path
                key={cable.key}
                d={cable.d}
                fill="none"
                stroke="hsl(var(--board-jack))"
                strokeWidth={4}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.9 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{ filter: "drop-shadow(0 3px 4px hsl(var(--foreground)/0.28))" }}
              />
            </svg>
          )}

          <div role="radiogroup" aria-label="Contact routes" onKeyDown={handleKeyDown} className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {routes.map((r, i) => {
              const on = active === r.id
              return (
                <label
                  key={r.id}
                  ref={(el) => {
                    jackRefs.current[r.id] = el
                  }}
                  className={cn(
                    "group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 pr-8 text-left transition-all focus-within:ring-2 focus-within:ring-[hsl(var(--board-jack))] focus-within:ring-offset-2 focus-within:ring-offset-[hsl(var(--board-face))]",
                    on
                      ? "border-[hsl(var(--board-lamp))] bg-[hsl(var(--board-lamp))]/10 shadow-[0_2px_12px_hsl(var(--board-lamp)/0.18)]"
                      : "border-[hsl(var(--board-jack))]/15 bg-white/60 hover:border-[hsl(var(--board-jack))]/30 hover:bg-white",
                  )}
                >
                  <input
                    type="radio"
                    name="switchboard-routes"
                    value={r.id}
                    checked={on}
                    onChange={() => pick(r)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
                      on ? "border-[hsl(var(--board-lamp))] bg-[hsl(var(--board-lamp))]" : "border-[hsl(var(--board-jack))]/40 bg-[hsl(var(--board-face))]",
                    )}
                    aria-hidden
                  >
                    <span className={cn("size-2 rounded-full transition-all", on ? "bg-white shadow-[0_0_8px_1px_hsl(var(--board-lamp)/0.6)]" : "bg-[hsl(var(--board-jack))]/45")} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold leading-tight text-[hsl(var(--board-jack))]">{r.label}</span>
                    {r.desc && <span className="mt-1 block text-[12.5px] font-medium leading-snug text-[hsl(var(--board-jack))]/60">{r.desc}</span>}
                    {r.meta && <span className="mt-1.5 inline-block rounded-full bg-[hsl(var(--board-jack))]/5 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--board-jack))]/55">{r.meta}</span>}
                  </span>
                  <span className="absolute right-3 top-3 font-mono text-[10px] font-bold tabular-nums text-[hsl(var(--board-jack))]/30" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
