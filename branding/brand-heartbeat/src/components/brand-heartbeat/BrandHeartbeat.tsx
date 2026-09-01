import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatedNumber } from "@/components/primitives/animated-number"
import { InView } from "@/components/primitives/in-view"
import { Badge } from "@/components/ui/badge"

// ═══ JOB      prove the brand is alive — and watched
// ═══ EMOTION  a pulse you can feel; institutional calm with a heartbeat
// ═══ SIGNATURE an ECG rail that redraws itself once per beat; the mark
//               tile thumps in scale on the same clock and the live odometer
//               climbs exactly one rate-per-beat — count and pulse share
//               the same source truth
//   SITE      → "trusted by" bands, about pages
//   APP       → status/health surfaces reusing bpm as events-per-minute
//   BUILD     handcraft ink band + vendored AnimatedNumber (spring odometer)
//             + Badge/mono voice; motion useReducedMotion is the single gate
//   A11Y      ECG/tick marks are aria-hidden; the number is real text; with
//             reduced motion the line is static and the count only changes
//             when `stat.value` does — never a blind ticker

export type BrandHeartbeatProps = {
  /** Beats per minute for the pulse and the ECG redraw clock. */
  bpm?: number
  /** Seed for the live counter. */
  stat?: { value: number; label: string }
  /** How much the odometer climbs per beat (app case: events per beat). */
  perBeat?: number
  /** Fires with the running beat count — wire telemetry here. */
  onBeat?: (beat: number) => void
  className?: string
}

const ECG_D =
  "M0 40 H90 l10-24 8 44 10-20 H210 l10-24 8 44 10-20 H330 l10-24 8 44 10-20 H450 l10-24 8 44 10-20 H600"

export function BrandHeartbeat({
  bpm = 62,
  stat = { value: 41283, label: "sessions under watch" },
  perBeat = 2,
  onBeat,
  className,
}: BrandHeartbeatProps) {
  const reduced = useReducedMotion() ?? false
  const [beat, setBeat] = React.useState(0)
  const clampedBpm = Math.max(30, Math.min(180, bpm))
  const periodMs = 60000 / clampedBpm

  React.useEffect(() => {
    if (reduced) return
    const t = window.setInterval(() => setBeat((b) => b + 1), periodMs)
    return () => window.clearInterval(t)
  }, [periodMs, reduced])

  const lastBeat = React.useRef(0)
  React.useEffect(() => {
    if (beat !== lastBeat.current) {
      lastBeat.current = beat
      onBeat?.(beat)
    }
  }, [beat, onBeat])

  const liveValue = stat.value + (reduced ? 0 : beat * perBeat)

  return (
    <section className={cn("bg-foreground text-background", cn("text-background", className))}>
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-8">
        <div className="flex items-center gap-6">
          {/* the mark tile: one thump per beat */}
          <motion.span
            aria-hidden
            animate={reduced ? {} : { scale: beat > 0 ? [1, 1.09, 1] : 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="grid size-14 place-items-center rounded-2xl border border-background/25 bg-background/[0.06]"
            style={reduced ? undefined : { boxShadow: `0 0 ${22 + (beat % 2) * 16}px hsl(var(--background)/0.16)` }}
          >
            <Activity className="size-7 text-background" strokeWidth={2} aria-hidden />
          </motion.span>

          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] flex items-center gap-2 text-background/55">
              {clampedBpm} BPM · BRAND PULSE
              <Badge variant="outline" className="h-5 gap-1.5 rounded-full border-background/30 bg-transparent px-2 font-mono text-[8px] font-black uppercase tracking-[0.14em] text-background/75">
                <motion.span
                  aria-hidden
                  animate={reduced ? {} : { opacity: [1, 0.25, 1] }}
                  transition={{ duration: periodMs / 1000, repeat: reduced ? 0 : Infinity, ease: "easeInOut" }}
                  className="inline-block size-[6px] rounded-full bg-background"
                />
                Live
              </Badge>
            </span>
            <p className="mt-1 font-display text-xl font-black tracking-tight text-background">Alive and watched, every minute.</p>
          </div>
        </div>

        <InView once className="text-right">
          <AnimatedNumber
            value={liveValue}
            springOptions={{ stiffness: 40, damping: 26 }}
            className="font-display text-5xl font-black tabular-nums leading-none tracking-tight text-background"
          />
          <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-background/55">{stat.label}</p>
        </InView>
      </div>

      {/* ECG rail — redraws once per beat on a linear wipe */}
      <div aria-hidden className="relative mt-10 h-16 overflow-hidden rounded-lg border border-background/15 bg-foreground/60">
        <svg viewBox="0 0 600 64" preserveAspectRatio="none" className="h-full w-full text-background/80">
          {reduced ? (
            <path d={ECG_D} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <motion.path
              key={Math.floor(beat / 1)}
              d={ECG_D}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: Math.min(periodMs / 1000, 2.2), ease: "linear" }}
            />
          )}
        </svg>
        <span className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-foreground to-transparent" />
      </div>

      <p className="sr-only" aria-live="polite">{reduced ? "Pulse paused for reduced motion." : ""}</p>
    </div>
    </section>
  )
}
