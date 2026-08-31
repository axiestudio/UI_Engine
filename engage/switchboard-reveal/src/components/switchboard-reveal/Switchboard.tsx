import * as React from "react"
import { motion } from "motion/react"
import { PhoneCall, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel } from "@/components/primitives/handcraft"
// ═══ JOB      get the visitor to the right human on the first try
// ═══ EMOTION  mastery — you just patched the line yourself
// ═══ SIGNATURE dragging/tapping a route lights its jack and draws an SVG
//               patch cable from the IN socket with a self-drawing stroke;
//               the answer-lamp fades in green when the line "connects"
//   SITE  → "who do you want to speak to?" contact-routing band
//   APP   → support ticket router / department chooser dialog
//   A11Y  real radio inputs (arrow-key navigable), aria-live status,
//         cables aria-hidden, focus-visible rings
export type SwitchRoute = { id: string; label: string; desc?: string; meta?: string }
export type SwitchboardProps = {
  eyebrow?: string
  title?: React.ReactNode
  intro?: React.ReactNode
  routes: SwitchRoute[]
  /** label under the IN socket */
  inLabel?: string
  connectedLabel?: string
  onSelect?: (route: SwitchRoute) => void
  className?: string
}
export function Switchboard({
  eyebrow = "THE SWITCHBOARD",
  title = "Who do you need?",
  intro,
  routes,
  inLabel = "IN — YOUR CALL",
  connectedLabel = "Line connected",
  onSelect,
  className,
}: SwitchboardProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [active, setActive] = React.useState<string | null>(null)
  const jackRefs = React.useRef<Record<string, HTMLLabelElement | null>>({})
  const gridRef = React.useRef<HTMLDivElement>(null)
  const inRef = React.useRef<HTMLButtonElement>(null)
  const [cable, setCable] = React.useState<{ d: string; key: string } | null>(null)
  const pick = (route: SwitchRoute, el: HTMLElement | null) => {
    setActive(route.id)
    onSelect?.(route)
    const host = gridRef.current
    const from = inRef.current
    if (!host || !from || !el || reduce) return
    const hr = host.getBoundingClientRect()
    const a = from.getBoundingClientRect()
    const b = el.getBoundingClientRect()
    const x1 = a.left + a.width / 2 - hr.left
    const y1 = a.top + a.height / 2 - hr.top
    const x2 = b.left + b.width / 2 - hr.left
    const y2 = b.top + b.height / 2 - hr.top
    const sag = Math.max(36, Math.abs(x2 - x1) * 0.32)
    setCable({ d: `M ${x1} ${y1} C ${x1} ${y1 + sag}, ${x2} ${y2 + sag}, ${x2} ${y2}`, key: route.id })
  }
  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-[hsl(var(--board))] px-4 py-20 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto grid w-full max-w-[1120px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <div className="max-w-md">
            <MonoLabel className="text-[hsl(var(--board-jack))]">{eyebrow}</MonoLabel>
            <h2 className="mt-4 font-display text-[34px] font-black leading-[1.02] tracking-[-0.03em] text-[hsl(var(--board-jack))] sm:text-[44px]">{title}</h2>
            {intro && <p className="mt-4 text-[15px] font-medium leading-[1.7] text-[hsl(var(--board-jack))]/65">{intro}</p>}
            <p aria-live="polite" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--board-jack))] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--board-face))] transition-opacity data-[off=true]:opacity-35" data-off={!active}>
              {active ? <Check className="size-3.5" /> : <PhoneCall className="size-3.5" />}
              {active ? connectedLabel : "Pick a line"}
            </p>
          </div>
        </InView>
        <div ref={gridRef} className="relative rounded-xl border-2 border-[hsl(var(--board-jack))]/25 bg-[hsl(var(--board-face))] p-5 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.35)]">
          {/* the IN socket */}
          <button ref={inRef} type="button" aria-hidden tabIndex={-1} className="absolute -top-4 left-6 flex items-center gap-2 rounded-full border-2 border-[hsl(var(--board-jack))] bg-[hsl(var(--board-face))] px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--board-jack))]">
            <span className="size-2.5 rounded-full bg-[hsl(var(--board-jack))] shadow-[inset_0_0_0_2px_hsl(var(--board-face))]" />
            {inLabel}
          </button>
          {cable && !reduce && (
            <svg aria-hidden className="pointer-events-none absolute inset-0 z-10 h-full w-full" key={cable.key}>
              <motion.path
                d={cable.d}
                fill="none"
                stroke="hsl(var(--board-jack))"
                strokeWidth={4}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 1 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ filter: "drop-shadow(0 4px 3px rgba(0,0,0,0.3))" }}
              />
            </svg>
          )}
          <div role="radiogroup" aria-label="Contact routes" className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {routes.map((r, i) => {
              const on = active === r.id
              return (
                <label
                  key={r.id}
                  className={cn(
                    "group relative flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all",
                    on ? "border-[hsl(var(--board-lamp))] bg-[hsl(var(--board-lamp))]/8" : "border-[hsl(var(--board-jack))]/20 bg-white/40 hover:border-[hsl(var(--board-jack))]/50",
                  )}
                  ref={(el) => { jackRefs.current[r.id] = el }}
                >
                  <input
                    type="radio"
                    name="switchboard"
                    className="peer sr-only"
                    checked={on}
                    onChange={() => pick(r, jackRefs.current[r.id])}
                  />
                  <span
                    className={cn(
                      "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
                      on ? "border-[hsl(var(--board-lamp))] bg-[hsl(var(--board-lamp))]" : "border-[hsl(var(--board-jack))] bg-[hsl(var(--board-face))]",
                    )}
                    aria-hidden
                  >
                    <span className={cn("size-2 rounded-full", on ? "bg-white shadow-[0_0_8px_2px_hsl(var(--board-lamp)/0.7)]" : "bg-[hsl(var(--board-jack))]/50")} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-[hsl(var(--board-jack))]">{r.label}</span>
                    {r.desc && <span className="mt-0.5 block text-[12px] font-medium leading-snug text-[hsl(var(--board-jack))]/60">{r.desc}</span>}
                    {r.meta && <span className="mt-1 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--board-jack))]/45">{r.meta}</span>}
                  </span>
                  <span className="absolute right-3 top-3 font-mono text-[10px] font-bold text-[hsl(var(--board-jack))]/35">{String(i + 1).padStart(2, "0")}</span>
                </label>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
