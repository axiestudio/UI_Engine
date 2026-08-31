import * as React from "react"
import { motion } from "motion/react"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell, CornerTicks } from "@/components/primitives/handcraft"
import { TextShimmerWave } from "@/components/primitives/text-shimmer-wave"
import { GlowEffect } from "@/components/primitives/glow-effect"

// ═══ JOB      give the brand a sound without playing a note
// ═══ EMOTION  hum in the air — the motif you can almost hear
// ═══ SIGNATURE a waveform bar wall where each bar is a real note of the
//               motif; hover plays the note (visual pulse), shimmer tagline
//   SITE      → brand guideline "sonic identity" chapter
//   APP       → notification-sound pickers; notes are data
//   A11Y      bars are buttons with note labels; waveform decorative

export type BrandNote = { note: string; hz: number; weight: number }

export type SoundOfBrandProps = {
  tagline?: string
  notes?: BrandNote[]
  className?: string
}

const DEFAULT_NOTES: BrandNote[] = [
  { note: "C3", hz: 130.8, weight: 60 },
  { note: "E3", hz: 164.8, weight: 45 },
  { note: "G3", hz: 196, weight: 80 },
  { note: "B3", hz: 246.9, weight: 35 },
  { note: "C4", hz: 261.6, weight: 100 },
  { note: "B3", hz: 246.9, weight: 55 },
  { note: "G3", hz: 196, weight: 70 },
  { note: "E3", hz: 164.8, weight: 40 },
]

export function SoundOfBrand({ tagline = "You'll know us in three notes.", notes = DEFAULT_NOTES, className }: SoundOfBrandProps) {
  const [active, setActive] = React.useState<number | null>(null)
  return (
    <SectionShell width={920} tone="ink" grain className={cn("text-background", className)}>
      <CornerTicks className="text-background/40" />
      <div className="text-center">
        <MonoLabel className="justify-center text-background/55">SONIC IDENTITY · 8-NOTE MOTIF</MonoLabel>
        <TextShimmerWave className="mt-4 font-display text-3xl font-black tracking-tight sm:text-4xl" duration={1.6}>
          {tagline}
        </TextShimmerWave>
      </div>

      <div role="group" aria-label="Brand motif notes" className="mt-14 flex h-44 items-end justify-center gap-2 sm:gap-3">
        {notes.map((n, i) => (
          <motion.button
            key={`${n.note}-${i}`}
            type="button"
            aria-label={`Note ${n.note}, ${Math.round(n.hz)} hertz`}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            animate={{ height: `${n.weight}%`, scaleY: active === i ? 1.06 : 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "bottom" }}
            className={cn(
              "relative w-6 rounded-t-md border border-background/25 bg-background/15 sm:w-9",
              active === i && "bg-background/35"
            )}
          >
            {active === i && (
              <motion.span
                layoutId="snd-glow"
                className="absolute inset-x-0 -top-2 h-2 rounded-t-full bg-background/70"
                transition={{ duration: 0.3 }}
              />
            )}
            <span className="absolute -bottom-6 inset-x-0 text-center font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-background/50">
              {n.note}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="mt-16 flex items-center justify-center gap-3">
        <span className="relative inline-grid place-items-center">
          <GlowEffect colors={["hsl(0 0% 100%)", "hsl(0 0% 70%)"]} blur="soft" scale={1.06} className="rounded-full" />
          <span className="relative inline-flex items-center gap-2 rounded-full border border-background/30 px-5 py-2 font-mono text-[10px] font-black uppercase tracking-[0.2em]">
            <Play className="size-3.5" aria-hidden /> motif · 1.2s · mp3 + ogg
          </span>
        </span>
      </div>
    </SectionShell>
  )
}
