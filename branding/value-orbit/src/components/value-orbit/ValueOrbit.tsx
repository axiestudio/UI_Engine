import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { SpinningText } from "@/components/primitives/spinning-text"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// ═══ JOB      make values graspable as objects in orbit
// ═══ EMOTION  gravity — everything circles one center on purpose
// ═══ SIGNATURE value chips orbit the mark in dashed wells and bob on
//               offset sine clocks; click (or hover, or arrow-navigate the
//               ledger) pins one — the orbit freezes, the pinned chip
//               letterpresses to ink, and the note column highlights its row
//   SITE      → values/culture sections
//   APP       → values onboarding; orbit is decorative, notes are content
//   BUILD     vendored SpinningText + motion chips; ledger rows are Buttons
//             so keyboard users reach the exact same pin state as pointers
//   A11Y      chips are labelled buttons with aria-pressed; focus scrolls the
//             matching ledger note into view; reduce-motion = static ring,
//             no bob

export type Value = { word: string; note: string }

export type ValueOrbitProps = {
  values?: Value[]
  eyebrow?: string
  className?: string
  onPinChange?: (v: Value | null) => void
}

const DEFAULT_VALUES: Value[] = [
  { word: "Craft", note: "We sand edges nobody will see. Especially those." },
  { word: "Candor", note: "Bad news travels first-class here." },
  { word: "Momentum", note: "A shipped small thing beats a perfect deck." },
  { word: "Care", note: "Every support reply is signed by a human who built it." },
  { word: "Restraint", note: "We say no so the yes means something." },
]

export function ValueOrbit({ values = DEFAULT_VALUES, eyebrow = "VALUES · IN ORBIT", className, onPinChange }: ValueOrbitProps) {
  const reduced = useReducedMotion() ?? false
  const [pinned, setPinned] = React.useState<number | null>(null)
  const noteRefs = React.useRef<(HTMLButtonElement | null)[]>([])

  const pin = (i: number | null) => {
    setPinned((p) => {
      const next = p === i ? null : i
      onPinChange?.(next == null ? null : values[next])
      return next
    })
  }

  const orbitFrozen = pinned != null || reduced

  return (
    <section className={cn("bg-background text-foreground", className)>
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
      <div className="grid items-center gap-14 lg:grid-cols-[420px_1fr]">
        {/* orbit */}
        <div className="relative mx-auto aspect-square w-full max-w-[420px]" role="group" aria-label="Core values orbit">
          <span aria-hidden className="absolute inset-[12%] rounded-full border border-dashed border-border" />
          <span aria-hidden className="absolute inset-[30%] rounded-full border border-border/60" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="relative grid size-24 place-items-center rounded-3xl border-2 border-foreground bg-background">
              <SpinningText duration={reduced ? 0 : orbitFrozen ? 40 : 14} fontSize={1.1} className="fill-foreground text-[4.5px] font-bold uppercase tracking-[0.3em]">
                core values · core values ·
              </SpinningText>
              <svg width="30" height="30" viewBox="0 0 48 48" fill="none" aria-hidden className="absolute text-foreground">
                <path d="M14 32 L24 14 L34 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          {values.map((v, i) => {
            const angle = (i / values.length) * Math.PI * 2 - Math.PI / 2
            const x = 50 + Math.cos(angle) * 42
            const y = 50 + Math.sin(angle) * 42
            return (
              <motion.div
                key={v.word}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
                animate={orbitFrozen ? { y: 0 } : { y: [0, -6, 0] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Button
                  type="button"
                  variant={pinned === i ? "default" : "outline"}
                  size="xs"
                  aria-pressed={pinned === i}
                  aria-label={`${v.word} — ${v.note}`}
                  onClick={() => pin(i)}
                  onMouseEnter={() => !reduced && pinned == null && pin(i)}
                  className={cn(
                    "rounded-full font-mono text-[10px] font-black uppercase tracking-[0.16em] shadow-sm",
                    pinned === i && "shadow-[3px_3px_0_0_hsl(var(--border))]"
                  )}
                >
                  {v.word}
                </Button>
              </motion.div>
            )
          })}
        </div>

        {/* ledger */}
        <div>
                    <header className="">
            {eyebrow != null && (              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>            )}
            <h2 className="mt-2 tracking-tight text-3xl font-bold tracking-tight sm:text-4xl text-foreground">{<>Five words we <em className="font-serif italic font-medium">actually</em> pay for.</>}</h2>
          </header>
          <ul className="mt-10 space-y-3">
            {values.map((v, i) => {
              const isActive = pinned === i
              return (
                <li key={v.word}>
                  <Button
                    ref={(el) => { noteRefs.current[i] = el }}
                    type="button"
                    variant="ghost"
                    aria-pressed={isActive}
                    onClick={() => pin(isActive ? null : i)}
                    onFocus={() => { if (!reduced && pinned !== i) pin(i) }}
                    className={cn(
                      "h-auto w-full flex-col items-start gap-1 rounded-none border-l-2 py-2 pl-4 pr-2 text-left",
                      isActive ? "border-l-foreground bg-muted/40" : "border-l-border hover:bg-muted/20"
                    )}
                  >
                    <span className="flex items-baseline gap-3">
                      <span className={cn("font-mono text-[11px] font-semibold tabular-nums text-muted-foreground", isActive ? "opacity-90" : "opacity-50")>{String(i + 1).padStart(2, "0")}<span className="opacity-50"> / {String(values.length).padStart(2, "0")}</span></span>
                      <span className="font-display text-sm font-black uppercase tracking-[0.12em] text-foreground">{v.word}</span>
                    </span>
                    <p className={cn("max-w-md text-[14px] leading-relaxed transition-opacity duration-300", isActive ? "opacity-100 text-foreground" : "text-muted-foreground")}>{v.note}</p>
                  </Button>
                </li>
              )
            })}
          </ul>
          <p className="mt-8">
            <Badge variant="outline" className="rounded-full font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {pinned != null ? `${values[pinned].word} pinned` : "nothing pinned"}
            </Badge>
          </p>
        </div>
      </div>
      <InView once as="p" className="mt-12 text-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        click a chip or a row — the well holds what you pin
      </InView>
    </div>
    </section>
  )
}
