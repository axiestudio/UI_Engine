import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { AnimatedNumber } from "@/components/primitives/animated-number"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      prove the brand is alive — and watched
// ═══ EMOTION  a pulse you can feel; institutional yet breathing
// ═══ SIGNATURE an ECG line pulses across the band and the mark's glow
//               breathes on each beat; live stat ticks up per beat
//   SITE      → "trusted by" bands, about pages
//   APP       → status/health surfaces reusing bpm as events-per-min
//   A11Y      ECG decorative; stats use aria-live; reduce-motion = static line

export type BrandHeartbeatProps = {
  bpm?: number
  stat?: { value: number; label: string }
  className?: string
}

export function BrandHeartbeat({ bpm = 62, stat, className }: BrandHeartbeatProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [beat, setBeat] = React.useState(0)
  const period = 60000 / Math.max(30, Math.min(180, bpm))

  React.useEffect(() => {
    if (reduce) return
    const t = window.setInterval(() => setBeat((b) => b + 1), period)
    return () => window.clearInterval(t)
  }, [period, reduce])

  return (
    <SectionShell width={1120} tone="ink" padding="tight" className={cn("text-background", className)}>
      <div className="flex flex-wrap items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <motion.span
            key={beat}
            aria-hidden
            initial={reduce ? false : { scale: 1 }}
            animate={reduce ? {} : { scale: [1, 1.12, 1] }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="grid size-14 place-items-center rounded-2xl border border-background/25"
            style={reduce ? undefined : { boxShadow: "0 0 34px hsl(var(--background)/0.18)" }}
          >
            <svg width="26" height="26" viewBox="0 0 48 48" fill="none" aria-hidden className="text-background">
              <rect x="4" y="4" width="40" height="40" rx="10" stroke="currentColor" strokeWidth="3" />
              <path d="M14 32 L24 14 L34 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.span>
          <div>
            <MonoLabel className="text-background/55">{bpm} BPM · BRAND PULSE</MonoLabel>
            <p className="mt-1 font-display text-xl font-black tracking-tight">Alive and watched, every minute.</p>
          </div>
        </div>

        {stat && (
          <InView once className="text-right">
            <AnimatedNumber value={stat.value} className="font-display text-5xl font-black tabular-nums" />
            <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-background/55">{stat.label}</p>
          </InView>
        )}
      </div>

      {/* ECG strip */}
      <div aria-hidden className="relative mt-10 h-16 overflow-hidden rounded-lg border border-background/15 bg-black/20">
        <svg viewBox="0 0 600 64" preserveAspectRatio="none" className="h-full w-full text-background/80">
          <motion.path
            d="M0 40 H90 l10-24 8 44 10-20 H210 l10-24 8 44 10-20 H330 l10-24 8 44 10-20 H450 l10-24 8 44 10-20 H600"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            initial={reduce ? {} : { pathLength: 0 }}
            animate={reduce ? {} : { pathLength: 1 }}
            transition={{ duration: 2.4, repeat: reduce ? 0 : Infinity, repeatDelay: period / 1000 - 2.4 > 0 ? period / 1000 - 2.4 : 0.2, ease: "linear" }}
          />
        </svg>
      </div>
    </SectionShell>
  )
}
