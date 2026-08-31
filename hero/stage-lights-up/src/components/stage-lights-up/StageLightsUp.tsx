import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"

// ═══ JOB      open a page like a show, not a template
// ═══ EMOTION  the hush when the house lights go down
// ═══ SIGNATURE three beam cones sweep in from the grid, converge on the
//               headline, HALT a beat — then snap off and the band settles
//               up out of the dark with the copy lit where the spots were
//   SITE     → cinematic opening band on a performance/event landing
//   APP      → "go live" present/announce card (pass `compact` + fire on mount,
//             or drive `key` to replay for each announcement)
//   A11Y     text present from first paint (beams are decoration + the
//             sequence ends in the readable state); reduced = settled state

export type StageLightsUpProps = {
  kicker?: string
  title: React.ReactNode
  sub?: React.ReactNode
  cta?: { label: string; href?: string; onClick?: () => void }
  /** shorter vertical rhythm for app surfaces */
  compact?: boolean
  className?: string
}

export function StageLightsUp({ kicker = "HOUSE LIGHTS DOWN", title, sub, cta, compact, className }: StageLightsUpProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-[hsl(var(--house))] text-[hsl(var(--house-ink))]", compact ? "py-14" : "py-28 sm:py-36", className)}>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: "linear-gradient(180deg, transparent, hsl(var(--house-floor)))" }} />
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        {/* three cones sweeping in: left, centre-high, right */}
        {[
          { left: "-14%", rotate: [ -26, -8, 0], delay: 0 },
          { left: "50%", rotate: [4, -4, 0], delay: 0.15 },
          { left: "114%", rotate: [26, 8, 0], delay: 0 },
        ].map((c, i) => (
          <motion.span
            key={i}
            initial={reduce ? { opacity: 0 } : { opacity: 0, rotate: c.rotate[0], x: "-50%" }}
            animate={{ opacity: [0, 0.9, 0.9, 0], rotate: [c.rotate[0], c.rotate[1], 0, 0], x: "-50%" }}
            transition={reduce ? { duration: 0 } : { duration: 2.6, times: [0, 0.34, 0.72, 0.78], ease: [0.6, 0, 0.2, 1], delay: c.delay }}
            className="absolute top-[-6%] block h-[130%] w-[34vw] max-w-[420px]"
            style={{
              left: c.left,
              transformOrigin: "50% 0%",
              background: `linear-gradient(180deg, hsl(var(--beam)/0.5) 0%, hsl(var(--beam)/0.16) 46%, transparent 78%)`,
              clipPath: "polygon(46.5% 0%, 53.5% 0%, 100% 100%, 0% 100%)",
              filter: "blur(2px)",
            }}
          >
            <span className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 rounded-full bg-[hsl(var(--beam))] shadow-[0_0_24px_8px_hsl(var(--beam)/0.6)]" />
          </motion.span>
        ))}
      </div>

      {/* the pool of light they aimed at */}
      <motion.span
        aria-hidden
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 0.8, 0.8, 0.28], scale: [0.6, 1, 1, 1.15] }}
        transition={reduce ? { duration: 0.2 } : { duration: 2.8, times: [0, 0.34, 0.74, 1] }}
        className="pointer-events-none absolute left-1/2 top-1/2 block size-[46vw] max-h-[480px] max-w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
        style={{ background: "radial-gradient(50% 50% at 50% 50%, hsl(var(--beam)/0.16), transparent 70%)" }}
      />

      <motion.div
        initial={reduce ? false : { y: 12, opacity: 0.65 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.1, delay: reduce ? 0 : 2.0, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto flex w-full max-w-[860px] flex-col items-center px-6 text-center"
      >
        <MonoLabel className="text-[hsl(var(--beam))]/70">{kicker}</MonoLabel>
        <h1 className="mt-5 font-display text-[clamp(36px,7.5vw,72px)] font-black leading-[0.95] tracking-[-0.03em]" style={{ textShadow: "0 0 34px hsl(var(--beam)/0.22)" }}>{title}</h1>
        {sub && <p className="mt-5 max-w-xl text-[15px] font-medium leading-[1.7] text-white/65">{sub}</p>}
        {cta && (
          <a href={cta.href ?? "#"} onClick={cta.onClick} className="mt-8 inline-flex h-12 items-center gap-2 rounded-full border border-[hsl(var(--beam)/0.4)] bg-[hsl(var(--beam)/0.06)] px-7 font-mono text-[11px] font-bold uppercase tracking-[0.24em] backdrop-blur-sm transition-colors hover:bg-[hsl(var(--beam)/0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--beam))]">
            {cta.label}
          </a>
        )}
      </motion.div>
      <Grain opacity={0.07} />
    </section>
  )
}
