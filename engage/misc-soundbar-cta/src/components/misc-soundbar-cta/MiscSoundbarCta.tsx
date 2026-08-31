import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Volume2, Pause } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Soundbar CTA — an equalizer-style call to action.
// ═══ EMOTION     Rhythm you can hear.
// ═══ SIGNATURE   An animated equalizer bar row + a single CTA.

export type MiscSoundbarCtaProps = {
  eyebrow?: string
  title?: React.ReactNode
  body?: React.ReactNode
  cta?: string
  bars?: number
  onCtaClick?: () => void
  className?: string
}

// Deterministic pseudo-heights to avoid hydration mismatch (seeded by golden ratio)
function barHeight(index: number) {
  const x = Math.sin(index * 12.9898) * 43758.5453
  return 0.28 + (x - Math.floor(x)) * 0.62
}

export function MiscSoundbarCta({ eyebrow = "LISTEN", title = "Press play on the process.", body = "A short audio walkthrough of how a section is composed.", cta = "Play the walkthrough", bars = 28, onCtaClick, className }: MiscSoundbarCtaProps) {
  const reduce = useReducedMotion()
  const [isPlaying, setIsPlaying] = React.useState(!reduce)
  const heights = React.useMemo(() => Array.from({ length: bars }).map((_, i) => barHeight(i)), [bars])
  return (
    <section className={cn("relative isolate overflow-hidden bg-foreground py-20 text-background sm:py-28", className)}>
      <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-background/55">{eyebrow}</p>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <h2 className="mt-4 font-display text-4xl font-black tracking-[-0.03em] sm:text-5xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-md text-base font-medium leading-relaxed text-background/70">{body}</p>
        </InView>
        <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}>
          <div className="mt-8 flex h-16 items-end justify-center gap-1" aria-hidden="true">
            {heights.map((h, i) => (
              <motion.span
                key={i}
                className="w-1.5 rounded-full bg-[hsl(var(--site-accent))]"
                style={{ height: `${h * 100}%`, transformOrigin: "bottom" }}
                animate={reduce || !isPlaying ? undefined : { scaleY: [1, 0.35, 1] }}
                transition={reduce || !isPlaying ? undefined : { duration: 0.9 + (i % 5) * 0.14, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
              />
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Button
              size="lg"
              aria-pressed={isPlaying}
              aria-label={isPlaying ? "Pause preview" : "Play preview"}
              onClick={() => {
                setIsPlaying((p) => !p)
                onCtaClick?.()
              }}
              className="h-11 rounded-full bg-background px-7 font-mono text-[11px] font-bold uppercase tracking-widest text-foreground hover:bg-background/90 focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
            >
              {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />} {cta}
            </Button>
            {!reduce && (
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="font-mono text-[10px] font-bold uppercase tracking-widest text-background/60 underline-offset-4 hover:text-background hover:underline"
              >
                {isPlaying ? "Pause animation" : "Resume animation"}
              </button>
            )}
          </div>
        </InView>
      </div>
    </section>
  )
}
