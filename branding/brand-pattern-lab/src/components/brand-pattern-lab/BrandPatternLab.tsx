import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// ═══ JOB      extend the identity from logo to pattern
// ═══ EMOTION  playful systems-thinking — geometry that multiplies
// ═══ SIGNATURE pattern wall seeded from a deterministic hash of the logo's
//               geometry; the Reseed button (icon spins once) regenerates
//               the whole wall with a staggered soak-in; a density rail flips
//               the wall between 3 / 6 / 9 tiles per row
//   SITE      → packaging/merch walls, brand guidelines
//   APP       → background/pattern pickers; onSeed emits the seed
//   BUILD     shadcn new-york-v4 Button/Badge  token-driven section markup
//             seed-pure SVG (currentColor only — no palette leaks)
//   A11Y      controls are real buttons with visible focus; tiles are
//             aria-hidden and the seed is text

export type BrandPatternLabProps = {
  className?: string
  /** Initial seed. Changing it re-seeds the wall. */
  seed?: number
  onSeedChange?: (seed: number) => void
}

type Density = 3 | 6 | 9

/** Deterministic pseudo-pattern from a seed: hollow disc + rotated square per slot. */
function PatternTile({ seed, className }: { seed: number; className?: string }) {
  const rand = (n: number) => ((Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1
  const shapes = Array.from({ length: 6 }, (_, i) => ({
    x: 12 + rand(i) * 72,
    y: 12 + rand(i + 10) * 72,
    disc: rand(i + 20) > 0.5,
    s: 6 + rand(i + 30) * 14,
  }))
  return (
    <svg viewBox="0 0 96 96" aria-hidden className={cn("h-full w-full text-foreground", className)}>
      {shapes.map((sh, i) =>
        sh.disc ? (
          <circle key={i} cx={sh.x} cy={sh.y} r={sh.s / 2} fill="none" stroke="currentColor" strokeWidth="1.6" />
        ) : (
          <rect key={i} x={sh.x - sh.s / 2} y={sh.y - sh.s / 2} width={sh.s} height={sh.s} fill="currentColor" opacity="0.85" transform={`rotate(${seed % 45} ${sh.x} ${sh.y})`} />
        )
      )}
      <path d="M8 88 L48 60 L88 88" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.5" />
    </svg>
  )
}

export function BrandPatternLab({ className, seed: controlledSeed, onSeedChange }: BrandPatternLabProps) {
  const reduced = useReducedMotion()
  const [seed, setSeed] = React.useState(controlledSeed ?? 7)
  const [density, setDensity] = React.useState<Density>(3)
  const [spin, setSpin] = React.useState(0)

  React.useEffect(() => {
    if (controlledSeed != null) setSeed(controlledSeed)
  }, [controlledSeed])

  const tiles = React.useMemo(() => Array.from({ length: density * 3 }, (_, i) => seed + i * 13), [seed, density])
  const colsClass: Record<Density, string> = { 3: "grid-cols-3", 6: "grid-cols-3 sm:grid-cols-6", 9: "grid-cols-3 sm:grid-cols-6 lg:grid-cols-9" }

  const reseed = () => {
    const s = Math.floor(Math.random() * 9999)
    setSeed(s)
    setSpin((n) => n + 1)
    onSeedChange?.(s)
  }

  return (
    <section className={cn("bg-background text-foreground", className)}>
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
                <header className="">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">PATTERN SYSTEM · ONE GEOMETRY</span>
          <h2 className="mt-2 tracking-tight text-3xl font-bold tracking-tight sm:text-4xl text-foreground">The logo, multiplied.</h2>
        </header>
        <div className="flex flex-wrap items-center gap-3">
          <div role="group" aria-label="Pattern density" className="inline-flex overflow-hidden rounded-full border">
            {([3, 6, 9] as Density[]).map((d) => (
              <Button
                key={d}
                type="button"
                variant={density === d ? "secondary" : "ghost"}
                size="xs"
                aria-pressed={density === d}
                onClick={() => setDensity(d)}
                className="h-8 rounded-none border-x-0 font-mono text-[9px] font-black uppercase tracking-[0.14em]"
              >
                {d}×3
              </Button>
            ))}
          </div>
          <Button type="button" variant="default" size="sm" onClick={reseed} className="group gap-2 rounded-full font-mono text-[10px] font-black uppercase tracking-[0.18em]">
            <motion.span
              key={spin}
              aria-hidden
              initial={reduced || spin === 0 ? false : { rotate: 0 }}
              animate={{ rotate: reduced ? 0 : 360 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex"
            >
              <RefreshCw className="size-3.5" />
            </motion.span>
            Reseed
          </Button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div
          key={`${seed}-${density}`}
          className={cn("mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border", colsClass[density])}
        >
          {tiles.map((s, i) => (
            <motion.div
              key={s}
              initial={reduced ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: reduced ? 0 : i * 0.03, ease: [0.22, 1, 0.36, 1] }}
              className="group aspect-square bg-background p-3"
            >
              <InView once delay={0} className="h-full w-full">
                <motion.div
                  whileHover={reduced ? undefined : { scale: 1.08, rotate: i % 2 ? 1.5 : -1.5 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full w-full"
                >
                  <PatternTile seed={s} />
                </motion.div>
              </InView>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="rounded-full font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">96px tile</Badge>
        <Badge variant="outline" className="rounded-full font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">300 dpi safe</Badge>
        <span className="ml-auto font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          seed <span className="text-foreground tabular-nums">#{seed}</span>
        </span>
      </div>
    </div>
    </section>
  )
}
