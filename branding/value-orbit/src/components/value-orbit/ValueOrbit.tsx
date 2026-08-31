import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { SpinningText } from "@/components/primitives/spinning-text"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      make values graspable as objects in orbit
// ═══ EMOTION  gravity — everything circles one center on purpose
// ═══ SIGNATURE value chips orbit the logomark in elliptical wells;
//               clicking a chip freezes the orbit and opens its note
//   SITE      → values/culture sections
//   APP       → values onboarding; orbit is decorative, notes are content
//   A11Y      buttons; spinning ring aria-hidden; reduce-motion = static grid

export type Value = { word: string; note: string }

export type ValueOrbitProps = {
  values?: Value[]
  className?: string
}

const DEFAULT_VALUES: Value[] = [
  { word: "Craft", note: "We sand edges nobody will see. Especially those." },
  { word: "Candor", note: "Bad news travels first-class here." },
  { word: "Momentum", note: "A shipped small thing beats a perfect deck." },
  { word: "Care", note: "Every support reply is signed by a human who built it." },
  { word: "Restraint", note: "We say no so the yes means something." },
]

export function ValueOrbit({ values = DEFAULT_VALUES, className }: ValueOrbitProps) {
  const [pinned, setPinned] = React.useState<number | null>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const active = pinned ?? null

  return (
    <SectionShell width={1120} className={className}>
      <div className="grid items-center gap-14 lg:grid-cols-[420px_1fr]">
        {/* orbit */}
        <div className="relative mx-auto aspect-square w-full max-w-[420px]" role="group" aria-label="Core values orbit">
          <span aria-hidden className="absolute inset-[12%] rounded-full border border-dashed border-border" />
          <span aria-hidden className="absolute inset-[30%] rounded-full border border-border/60" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="relative grid size-24 place-items-center rounded-3xl border-2 border-foreground bg-background">
              <SpinningText duration={reduce ? 0 : 14} fontSize={1.1} className="fill-foreground text-[4.5px] font-bold uppercase tracking-[0.3em]">
                core values · core values ·
              </SpinningText>
              <svg width="30" height="30" viewBox="0 0 48 48" fill="none" aria-hidden className="absolute text-foreground">
                <path d="M14 32 L24 14 L34 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          {values.map((v, i) => {
            const angle = (i / values.length) * Math.PI * 2 - Math.PI / 2
            const rx = 42, ry = 42
            const x = 50 + Math.cos(angle) * rx
            const y = 50 + Math.sin(angle) * ry
            return (
              <motion.button
                key={v.word}
                type="button"
                aria-pressed={active === i}
                onClick={() => setPinned((p) => (p === i ? null : i))}
                onMouseEnter={() => !reduce && setPinned(i)}
                animate={reduce ? {} : { y: [0, -6, 0] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                style={{ left: `${x}%`, top: `${y}%` }}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3.5 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.16em] transition-colors",
                  active === i ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground"
                )}
              >
                {v.word}
              </motion.button>
            )
          })}
        </div>

        {/* notes */}
        <div>
          <MonoLabel className="text-muted-foreground">VALUES · IN ORBIT</MonoLabel>
          <h2 className="mt-2 max-w-md font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] text-foreground sm:text-[44px]">
            Five words we <em className="font-serif italic font-medium">actually</em> pay for.
          </h2>
          <ul className="mt-10 space-y-5">
            {values.map((v, i) => (
              <InView key={v.word} once delay={i * 0.06}>
                <li
                  onMouseEnter={() => !reduce && setPinned(i)}
                  className={cn("group cursor-default border-l-2 pl-4 transition-colors", active === i ? "border-foreground" : "border-border")}
                >
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">{String(i + 1).padStart(2, "0")} · {v.word}</span>
                  <p className="mt-1 max-w-md text-[14px] leading-relaxed text-muted-foreground">{v.note}</p>
                </li>
              </InView>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  )
}
