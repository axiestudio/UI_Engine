import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      archive the brand's eras as collectible seals
// ═══ EMOTION  wax, paper, weight — a brand with a filing cabinet
// ═══ SIGNATURE wax seals per era; clicking presses a fresh seal with an
//               ink-ring ripple and rotated date stamp
//   SITE      → heritage/archive sections, anniversary pages
//   APP       → milestone pickers; eras are data
//   A11Y      buttons labeled "Press seal {year}"; ripples decorative

export type Era = { year: string; label: string }

export type ArchiveStampProps = {
  eras?: Era[]
  className?: string
}

const DEFAULT_ERAS: Era[] = [
  { year: "2014", label: "Founded in a garage" },
  { year: "2017", label: "First craft standard" },
  { year: "2020", label: "The workshop opens" },
  { year: "2023", label: "Method published" },
  { year: "2026", label: "Still finishing" },
]

function Seal({ era, index }: { era: Era; index: number }) {
  const [pressedAt, setPressedAt] = React.useState<number | null>(null)
  return (
    <InView once delay={index * 0.08}>
      <div className="flex flex-col items-center gap-4 text-center">
        <motion.button
          type="button"
          aria-label={`Press seal ${era.year}`}
          whileTap={{ scale: 0.92 }}
          onClick={() => setPressedAt(Date.now())}
          className="relative grid size-28 place-items-center rounded-full"
        >
          {/* wax body */}
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,hsl(var(--foreground)/0.92),hsl(var(--foreground))_60%,hsl(var(--foreground)/0.8))] shadow-[inset_0_2px_6px_rgba(255,255,255,0.14),0_10px_22px_-10px_rgba(0,0,0,0.55)]" aria-hidden />
          <span className="absolute inset-2 rounded-full border border-dashed border-background/30" aria-hidden />
          <span className="relative z-10 font-display text-xl font-black tabular-nums tracking-tight text-background">{era.year}</span>
          {/* ink ring on press */}
          {pressedAt && (
            <motion.span
              key={pressedAt}
              aria-hidden
              initial={{ scale: 0.6, opacity: 0.7 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-2 border-foreground"
            />
          )}
        </motion.button>
        <span className="max-w-[160px] font-mono text-[10px] font-bold uppercase leading-relaxed tracking-[0.16em] text-muted-foreground">{era.label}</span>
      </div>
    </InView>
  )
}

export function ArchiveStamp({ eras = DEFAULT_ERAS, className }: ArchiveStampProps) {
  return (
    <SectionShell width={1120} tone="ink" grain className={cn("text-background", className)}>
      <MonoLabel className="text-background/55">ARCHIVE · PRESSED SEALS</MonoLabel>
      <h2 className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">Every era leaves a mark.</h2>
      <div className="mt-14 grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
        {eras.map((e, i) => (
          <div key={e.year} className="[&_button]:text-background">
            <Seal era={e} index={i} />
          </div>
        ))}
      </div>
      <p className="mt-12 text-center font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-background/45">press a seal to re-ink it</p>
    </SectionShell>
  )
}
