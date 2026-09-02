import * as React from "react"
import { BorderTrail } from "@/components/primitives/border-trail"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Design language ──────────────────────────────────────────────────────────
// JOB: answer the boring questions before they become reasons not to come.
//   Parking. Stairs. Changing rooms. Languages. These decide the visit.
// EMOTION: competence and courtesy — "we thought about your Tuesday."
// SIGNATURE MOVE: a ledger rail — one hairline under everything, mono-quiet
//   labels in a queue, values in display type like a museum wall text. On
//   mobile it's a horizontal scroll rail (the strip itself says *more →*);
//   a border-trail sweeps the top rule once on reveal.
// ─────────────────────────────────────────────────────────────────────────────

export type FactItem = {
  label: string
  value: string
  icon?: React.ElementType
}

export type FactsProps = {
  eyebrow?: string
  title?: string
  items?: FactItem[]
  /** Horizontal rail on mobile, grid on lg. Default true. */
  singleRow?: boolean
  className?: string
}


// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_FACTS_ITEMS = [ { label: "Parking", value: "Kvarnen, 40 m" }, { label: "Step-free", value: "Ground floor, 90 cm door" }, { label: "Languages", value: "SV · EN · AR · TI" }, { label: "Changing", value: "Lockers, towels, dryer" }, { label: "Kids", value: "Welcome in waiting room" }, { label: "Gift cards", value: "Digital, never expires" }, ]

export function Facts({ eyebrow = "Practicalities", title, items = DEMO_FACTS_ITEMS, singleRow = true, className }: FactsProps) {
  if (!items.length) return null
  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-label={title ?? eyebrow}>
      <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
        <div className="mx-auto w-full max-w-[1180px] px-4 py-14 sm:px-6 lg:px-8">
          {eyebrow && <p className="mb-6 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p>}
          <div className="relative">
            <BorderTrail className="absolute inset-x-0 top-0 h-px bg-foreground/15" size={140} />
            <dl
              className={cn(
                "relative grid min-h-[104px] gap-y-6 gap-x-8 pt-4",
                singleRow
                  ? "grid-flow-col auto-cols-[minmax(200px,1fr)] overflow-x-auto no-scrollbar snap-x snap-mandatory lg:grid-flow-row lg:grid-cols-3 lg:xl:grid-cols-4 xl:grid-cols-[repeat(4,minmax(0,1fr))]"
                  : "grid-cols-2 lg:grid-cols-4"
              )}
            >
              {items.map((f, i) => {
                const Icon = f.icon
                return (
                  <InView
                    key={f.label}
                    as="div"
                    once
                    viewOptions={{ once: true, margin: "-30px" }}
                    variants={{ hidden: { opacity: 0, x: 14 }, visible: { opacity: 1, x: 0 } }}
                    transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.25), ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      singleRow ? "w-[200px] shrink-0 snap-start lg:w-auto lg:shrink" : "",
                      "border-l pl-4"
                    )}
                  >
                    <dt className="flex items-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                      {Icon && <Icon className="h-3 w-3" />}
                      {f.label}
                    </dt>
                    <dd className="mt-2 font-display text-lg font-extrabold leading-snug tracking-tight">{f.value}</dd>
                  </InView>
                )
              })}
            </dl>
          </div>
        </div>
      </InView>
    </section>
  )
}
