import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { Separator } from "@/components/ui/separator"

// ═══ JOB      show heritage without a boring table of years
// ═══ EMOTION  depth — the brand was here before and will be after
// ═══ SIGNATURE era cards echo off a shared rail: the selected era lifts on
//               a hard-offset shadow and neighbours dim by distance; a
//               diamond tick glides between eras on a layoutId spring, and
//               the whole row answers arrow keys / Home / End
//   SITE      → about pages, anniversary sections
//   APP       → company timeline widgets
//   BUILD     handcraft shell + vendored InView lift/spring; distance-echo
//             opacity is derived state, not per-card guessing
//   A11Y      each era is a real button with aria-pressed; roving tabindex
//             with arrow-key navigation; reduced motion = no lift/tick travel

export type BrandEra = { year: string; title: string; note: string }

export type BrandTimelineEchoProps = {
  eras?: BrandEra[]
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: string
  /** Index selected on mount. Defaults to the latest era. */
  defaultActive?: number
  onEraChange?: (era: BrandEra, index: number) => void
  className?: string
}

const DEFAULT_ERAS: BrandEra[] = [
  { year: "2014", title: "The garage", note: "Two desks, one router, a borrowed espresso machine." },
  { year: "2018", title: "First thousand", note: "Word of mouth did the marketing. We just kept shipping." },
  { year: "2021", title: "The workshop", note: "Our own space. The sign took three tries to hang level." },
  { year: "2024", title: "The method", note: "We wrote down how we work. Then we rewrote it." },
  { year: "2026", title: "Now", note: "You're reading the brand. It's still warm." },
]

export function BrandTimelineEcho({
  eras = DEFAULT_ERAS,
  eyebrow = "HERITAGE · ECHOES",
  title = "Twelve years, five rooms, one signature.",
  subtitle,
  defaultActive,
  onEraChange,
  className,
}: BrandTimelineEchoProps) {
  const reduced = useReducedMotion()
  const lastIndex = Math.max(0, eras.length - 1)
  const [active, setActive] = React.useState(() => Math.min(defaultActive ?? lastIndex, lastIndex))
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])

  const select = (i: number) => {
    setActive(i)
    refs.current[i]?.focus()
    if (eras[i]) onEraChange?.(eras[i], i)
  }

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? i + 1
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? i - 1
      : e.key === "Home" ? 0
      : e.key === "End" ? lastIndex
      : null
    if (next == null) return
    e.preventDefault()
    const clamped = Math.max(0, Math.min(lastIndex, next))
    refs.current[clamped]?.focus()
    setActive(clamped)
    if (eras[clamped]) onEraChange?.(eras[clamped], clamped)
  }

  return (
    <section className="relative isolate overflow-hidden w-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
            <header className="">
        {eyebrow != null && (          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>        )}
        <h2 className="mt-2 tracking-tight text-3xl font-bold tracking-tight sm:text-4xl text-foreground">{title}</h2>
        {subtitle != null && (          <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{subtitle}</p>        )}
      </header>

      <div className="mt-12 flex flex-col gap-2 lg:flex-row lg:items-start">
        {eras.map((era, i) => {
          const isActive = active === i
          const distance = Math.abs(i - active)
          return (
            <InView key={era.year} once delay={i * 0.07} className="flex-1">
              <motion.button
                ref={(el) => { refs.current[i] = el }}
                type="button"
                aria-pressed={isActive}
                tabIndex={isActive ? 0 : -1}
                onKeyDown={(e) => onKey(e, i)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => select(i)}
                animate={{ y: isActive && !reduced ? -10 : 0 }}
                style={{ opacity: reduced || isActive ? 1 : Math.max(0.45, 1 - distance * 0.16) }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className={cn(
                  "group relative w-full rounded-xl border p-5 text-left outline-none transition-colors duration-200",
                  "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  isActive
                    ? "border-foreground bg-foreground text-background shadow-[6px_6px_0_0_hsl(var(--border))]"
                    : "border-border bg-background text-foreground hover:border-foreground/40"
                )}
              >
                <span className={cn("font-display text-3xl font-black tabular-nums tracking-tight", isActive ? "text-background" : "text-muted-foreground/60")}>
                  {era.year}
                </span>
                <span className="mt-2 block font-display text-base font-bold tracking-tight">{era.title}</span>
                <p className={cn("mt-2 text-[13px] leading-relaxed", isActive ? "text-background/75" : "text-muted-foreground")}>{era.note}</p>
                {isActive && (
                  <motion.span
                    layoutId="era-tick"
                    aria-hidden
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    className="absolute -bottom-[5px] left-6 size-2.5 rotate-45 bg-foreground"
                  />
                )}
              </motion.button>
            </InView>
          )
        })}
      </div>

      <div className="mt-10 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{lastIndex + 1} eras · end of log</span>
        <Separator className="flex-1" />
      </div>
    </div>
    </section>
  )
}
