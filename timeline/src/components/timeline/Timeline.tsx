import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { BorderTrail } from "@/components/primitives/border-trail"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type TimelineMilestone = {
  id?: string
  /** Any display string: year, date, label. */
  time: string
  title: string
  description?: string
  /** Optional image card attached to the milestone. */
  image?: string
  imageAlt?: string
  /** Marks the milestone as current (filled dot + NOW chip). Default false. */
  now?: boolean
}

export type TimelineProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  items: TimelineMilestone[]
  /** "center" alternates cards around a middle rail (from lg up); "left" keeps one rail + cards. Default "center". */
  layout?: "center" | "left"
  /** Animated glow that sweeps the rail (Motion-Primitives BorderTrail). Default true. */
  trail?: boolean
  className?: string
}

// ── Sub components ───────────────────────────────────────────────────────────

function Dot({ active }: { active?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block h-3.5 w-3.5 rounded-full border-2 border-background shadow-sm",
        active ? "bg-foreground ring-2 ring-foreground/25 ring-offset-2 ring-offset-background" : "bg-muted-foreground/70"
      )}
    />
  )
}

// ── Timeline ─────────────────────────────────────────────────────────────────

export function Timeline({ eyebrow = "History", title = "Our story", subtitle, items, layout = "center", trail = true, className }: TimelineProps) {
  if (!items.length) return null
  const center = layout === "center"

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-label={title}>
      <div className="mx-auto w-full max-w-[960px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {(eyebrow || title) && (
          <InView variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-80px" }}>
            <header className="mb-12 max-w-2xl">
              {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>}
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
              {subtitle && <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">{subtitle}</p>}
            </header>
          </InView>
        )}

        <ol className="relative">
          {/* the rail */}
          <div aria-hidden className={cn("absolute inset-y-0 w-px bg-border", center ? "left-[7px] lg:left-1/2" : "left-[7px]")}>
            {trail && <BorderTrail size={120} className="bg-foreground/25" />}
          </div>

          {items.map((m, i) => {
            const right = i % 2 === 1
            return (
              <li key={m.id ?? `${m.time}-${i}`} className="relative pb-9 last:pb-0" id={m.id ? undefined : undefined}>
                {/* dot on the rail (always absolute → geometry holds on every breakpoint) */}
                <span className={cn("absolute top-6 z-10", center ? "left-[1px] lg:left-1/2 lg:-translate-x-1/2" : "left-[1px]")} aria-hidden>
                  <Dot active={m.now} />
                </span>
                <InView
                  as="div"
                  className={cn(
                    "pl-8",
                    center && "lg:w-1/2 lg:pl-0",
                    center && right && "lg:ml-auto lg:pl-9",
                    center && !right && "lg:pr-9"
                  )}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.5, delay: Math.min(i * 0.06, 0.3), ease: [0.16, 1, 0.3, 1] }}
                  viewOptions={{ once: true, margin: "-40px" }}
                >
                  <div id={m.id}>
                    <div className="rounded-[20px] border bg-card p-5 text-left shadow-sm transition-shadow hover:shadow-md">
                      <MilestoneBody m={m} right={center && !right} />
                    </div>
                  </div>
                </InView>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

function MilestoneBody({ m, right }: { m: TimelineMilestone; right?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row-reverse sm:items-start", right && "sm:flex-row")}>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{m.time}</p>
        <h3 className="font-display text-lg font-extrabold leading-tight tracking-tight">
          {m.title}
          {m.now && <span className="ml-2 inline-flex items-center rounded-full bg-foreground px-2 py-0.5 align-middle font-mono text-[9px] font-black tracking-widest text-background">NOW</span>}
        </h3>
        {m.description && <p className="text-sm font-medium leading-relaxed text-muted-foreground">{m.description}</p>}
      </div>
      {m.image && (
        <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl sm:w-[180px] sm:shrink-0 lg:w-[210px]">
          <img src={m.image} alt={m.imageAlt ?? ""} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
        </div>
      )}
    </div>
  )
}

