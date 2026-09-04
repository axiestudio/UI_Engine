import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// ═══ JOB      archive the brand's eras as collectible seals
// ═══ EMOTION  wax, paper, weight — a brand with a filing cabinet
// ═══ SIGNATURE paper wax seals float on the ink band: press one and it
//               squashes, an ink ring ripples out, and a rotated "FILED"
//               date stamp stays behind; the header tallies impressions
//   SITE      → heritage/archive sections, anniversary pages
//   APP       → milestone pickers; eras are data
//   BUILD     shadcn new-york-v4 Button/Badge + token-driven section markup
//   A11Y      seals are real buttons ("Press seal {year}"); press counts
//             live in state, announced via aria-live; reduced-motion drops
//             the ripple/squash, states still arrive

export type Era = { year: string; label: string }

export type ArchiveStampProps = {
  eras?: Era[]
  /** Fired with the era's running impression count after each press. */
  onPress?: (year: string, presses: number) => void
  className?: string
}

const DEFAULT_ERAS: Era[] = [
  { year: "2014", label: "Founded in a garage" },
  { year: "2017", label: "First craft standard" },
  { year: "2020", label: "The workshop opens" },
  { year: "2023", label: "Method published" },
  { year: "2026", label: "Still finishing" },
]

// paper medallion lit from the top-left — deliberate overlay maths on tokens only
const WAX = "bg-[radial-gradient(circle_at_32%_28%,hsl(var(--background)/0.95),hsl(var(--background))_58%,hsl(var(--background)/0.82))]"

function Seal({ era, presses, onPress }: { era: Era; presses: number; onPress: (year: string) => void }) {
  const reduced = useReducedMotion()
  const [ripple, setRipple] = React.useState<number | null>(null)
  const [filedOn, setFiledOn] = React.useState<string | null>(null)

  const press = () => {
    setRipple(performance.now())
    setFiledOn(new Intl.DateTimeFormat(undefined, { year: "2-digit", month: "2-digit", day: "2-digit" }).format(new Date()))
    onPress(era.year)
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Press seal ${era.year}`}
        onClick={press}
        className={cn(
          "relative size-28 rounded-full border-0 shadow-[inset_0_2px_6px_hsl(0_0%_100%/0.18),0_14px_24px_-10px_hsl(var(--foreground)/0.65)]",
          WAX,
          "hover:bg-transparent focus-visible:ring-background/50",
        )}
      >
        <motion.span
          aria-hidden
          initial={false}
          animate={{ scale: reduced ? 1 : 1 }}
          whileTap={reduced ? undefined : { scale: 0.92 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="absolute inset-0 rounded-full"
        >
          <span className="absolute inset-2 rounded-full border border-dashed border-foreground/25" />
          <span className="relative z-10 grid h-full w-full place-items-center text-[22px] font-black tabular-nums leading-none text-foreground">
            {era.year}
          </span>
        </motion.span>

        {/* ink-ring ripple, re-keyed on every press */}
        {ripple !== null && (
          <motion.span
            key={ripple}
            aria-hidden
            initial={{ scale: 0.65, opacity: 0.9 }}
            animate={{ scale: 1.65, opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 rounded-full border-2 border-foreground/60"
          />
        )}

        {/* the filing stamp — arrives rotated, then settles */}
        {filedOn && (
          <motion.span
            key={filedOn + presses}
            aria-hidden
            initial={reduced ? false : { scale: 1.7, opacity: 0, rotate: -18 }}
            animate={{ scale: 1, opacity: 1, rotate: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.08 }}
            className="pointer-events-none absolute -bottom-4 -right-3 rounded-[3px] border-[2.5px] border-background/85 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-[0.18em] text-background/85"
          >
            filed {filedOn}
          </motion.span>
        )}
      </Button>

      <span className="max-w-[160px] font-mono text-[10px] font-bold uppercase leading-relaxed tracking-[0.16em] text-background/55">
        {era.label}
      </span>

      <Badge
        variant="outline"
        className={cn(
          "rounded-full border-background/25 bg-transparent font-mono text-[9px] font-bold uppercase tracking-[0.16em] transition-colors",
          presses > 0 ? "border-background/50 text-background/85" : "text-background/40",
        )}
      >
        {presses > 0 ? `${presses} impression${presses === 1 ? "" : "s"}` : "unpressed"}
      </Badge>
    </div>
  )
}

export function ArchiveStamp({ eras = DEFAULT_ERAS, onPress, className }: ArchiveStampProps) {
  const reduced = useReducedMotion()
  const [pressedCounts, setPressedCounts] = React.useState<Record<string, number>>({})
  const totalPresses = Object.values(pressedCounts).reduce((a, b) => a + b, 0)
  const filed = Object.keys(pressedCounts).length

  const handlePress = (year: string) => {
    setPressedCounts((c) => {
      const next = (c[year] ?? 0) + 1
      onPress?.(year, next)
      return { ...c, [year]: next }
    })
  }

  return (
    <section className="relative isolate overflow-hidden w-full bg-foreground text-background">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 py-20 sm:py-24">

      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
        <div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-background/55">ARCHIVE · PRESSED SEALS</span>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">Every era leaves a mark.</h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="rounded-full border-background/25 bg-transparent font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-background/70">
            {filed}/{eras.length} filed
          </Badge>
          <Badge variant="outline" className="hidden rounded-full border-background/25 bg-transparent font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-background/70 sm:inline-flex">
            {totalPresses} impression{totalPresses === 1 ? "" : "s"}
          </Badge>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 pb-4 sm:grid-cols-3 lg:grid-cols-5">
        {eras.map((era, i) => (
          <InView once key={era.year} delay={i * 0.08}>
            <Seal era={era} presses={pressedCounts[era.year] ?? 0} onPress={handlePress} />
          </InView>
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        {totalPresses > 0 ? `${filed} of ${eras.length} seals pressed, ${totalPresses} impressions total.` : ""}
      </p>
      <p className="mt-10 text-center font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-background/45">
        {reduced ? `${filed} of ${eras.length} seals filed` : "press a seal to re-ink it"}
      </p>
    </div>
    </section>
  )
}
