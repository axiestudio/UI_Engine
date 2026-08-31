import * as React from "react"
import { motion } from "motion/react"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      extend the identity from logo to pattern
// ═══ EMOTION  playful systems-thinking — geometry that multiplies
// ═══ SIGNATURE pattern wall seeded from the logo's geometry; a "reseed"
//               dial regenerates variants; every tile is the same DNA
//   SITE      → packaging/merch walls, brand guidelines
//   APP       → background/pattern pickers; onSeed emits { seed, scale }
//   A11Y      decorative svgs with labels; reseed is a real button

export type BrandPatternLabProps = {
  className?: string
  onSeedChange?: (seed: number) => void
}

/** Deterministic pseudo-pattern from a seed: triangles + dots in a tile. */
function PatternTile({ seed, className }: { seed: number; className?: string }) {
  const rand = (n: number) => ((Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1
  const shapes = Array.from({ length: 6 }, (_, i) => ({
    x: rand(i) * 80,
    y: rand(i + 10) * 80,
    r: rand(i + 20) > 0.5,
    s: 6 + rand(i + 30) * 14,
  }))
  return (
    <svg viewBox="0 0 96 96" aria-hidden className={cn("h-full w-full text-foreground", className)}>
      {shapes.map((sh, i) =>
        sh.r ? (
          <circle key={i} cx={sh.x} cy={sh.y} r={sh.s / 2} fill="none" stroke="currentColor" strokeWidth="1.6" />
        ) : (
          <rect key={i} x={sh.x - sh.s / 2} y={sh.y - sh.s / 2} width={sh.s} height={sh.s} fill="currentColor" opacity="0.85" transform={`rotate(${seed % 45} ${sh.x} ${sh.y})`} />
        )
      )}
      <path d="M8 88 L48 60 L88 88" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.5" />
    </svg>
  )
}

export function BrandPatternLab({ className, onSeedChange }: BrandPatternLabProps) {
  const [seed, setSeed] = React.useState(7)
  const seeds = React.useMemo(() => Array.from({ length: 9 }, (_, i) => seed + i * 13), [seed])
  const reseed = () => {
    const s = Math.floor(Math.random() * 9999)
    setSeed(s)
    onSeedChange?.(s)
  }
  return (
    <SectionShell width={1120} className={className}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <MonoLabel className="text-muted-foreground">PATTERN SYSTEM · ONE GEOMETRY</MonoLabel>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            The logo, multiplied.
          </h2>
        </div>
        <button
          type="button"
          onClick={reseed}
          className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          <RefreshCw className="size-3.5" aria-hidden /> Reseed · #{seed}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-6 lg:grid-cols-9">
        {seeds.map((s, i) => (
          <InView key={s} once delay={i * 0.04} className="aspect-square bg-background p-3">
            <motion.div
              initial={false}
              whileHover={{ scale: 1.08, rotate: i % 2 ? 1.5 : -1.5 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full"
            >
              <PatternTile seed={s} />
            </motion.div>
          </InView>
        ))}
      </div>
      <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        96px tile · print-safe at 300dpi · seed #{seed}
      </p>
    </SectionShell>
  )
}
