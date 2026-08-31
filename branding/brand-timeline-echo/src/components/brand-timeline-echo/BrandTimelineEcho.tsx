import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      show heritage without a boring table of years
// ═══ EMOTION  depth — the brand was here before and will be after
// ═══ SIGNATURE era cards echo outward from a central rail; the active era
//               lifts with a hard-offset shadow and ticks the rail
//   SITE      → about pages, anniversary sections
//   APP       → company timeline widgets
//   A11Y      focusable buttons with aria-pressed; text is content

export type BrandEra = { year: string; title: string; note: string }

export type BrandTimelineEchoProps = {
  eras?: BrandEra[]
  className?: string
}

const DEFAULT_ERAS: BrandEra[] = [
  { year: "2014", title: "The garage", note: "Two desks, one router, a borrowed espresso machine." },
  { year: "2018", title: "First thousand", note: "Word of mouth did the marketing. We just kept shipping." },
  { year: "2021", title: "The workshop", note: "Our own space. The sign took three tries to hang level." },
  { year: "2024", title: "The method", note: "We wrote down how we work. Then we rewrote it." },
  { year: "2026", title: "Now", note: "You're reading the brand. It's still warm." },
]

export function BrandTimelineEcho({ eras = DEFAULT_ERAS, className }: BrandTimelineEchoProps) {
  const [active, setActive] = React.useState(eras.length - 1)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  return (
    <SectionShell width={1120} grain className={className}>
      <MonoLabel className="text-muted-foreground">HERITAGE · ECHOES</MonoLabel>
      <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
        Twelve years, five rooms, one signature.
      </h2>

      <div className="mt-12 flex flex-col gap-2 lg:flex-row lg:items-start">
        {eras.map((era, i) => (
          <InView key={era.year} once delay={i * 0.07} className="flex-1">
            <motion.button
              type="button"
              aria-pressed={active === i}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              animate={active === i && !reduce ? { y: -10 } : { y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "group relative w-full rounded-xl border p-5 text-left transition-colors",
                active === i ? "border-foreground bg-foreground text-background shadow-[6px_6px_0_0_hsl(var(--border))]" : "border-border bg-background text-foreground hover:border-foreground/40"
              )}
            >
              <span className={cn("font-display text-3xl font-black tabular-nums tracking-tight", active === i ? "text-background" : "text-muted-foreground/50")}>
                {era.year}
              </span>
              <span className="mt-2 block font-display text-base font-bold">{era.title}</span>
              <p className={cn("mt-2 text-[13px] leading-relaxed", active === i ? "text-background/75" : "text-muted-foreground")}>{era.note}</p>
              {active === i && (
                <motion.span layoutId="era-tick" aria-hidden className="absolute -bottom-[5px] left-6 size-2.5 rotate-45 bg-foreground" />
              )}
            </motion.button>
          </InView>
        ))}
      </div>

      <div className="mt-10 flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" aria-hidden />
        end of log
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>
    </SectionShell>
  )
}
