import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"

// ═══ JOB      make a page feel like it was projected, not printed
// ═══ EMOTION  a borrowed evening at the pictures
// ═══ SIGNATURE the beam flickers into existence — cone + screen bloom to
//               full brightness with two lamp stutter beats, dust motes
//               drift through the light, copy holds on the screen
//   SITE     → film-club / archive / vintage-brand hero
//   APP      → "feature presentation" slide frame (compact + custom slate)
//   A11Y     the slate is real HTML text on a light card; flicker is
//             decorative; reduced = steady projection, motes still

export type ProjectionBurnProps = {
  slate?: string
  title: React.ReactNode
  sub?: React.ReactNode
  cta?: { label: string; href?: string; onClick?: () => void }
  /** show the projector beam cone (on by default — it's the whole bit) */
  beam?: boolean
  compact?: boolean
  className?: string
}

const FLICKER = { opacity: [0.15, 0.95, 0.28, 1, 0.72, 1, 1] }
const FLICKER_T = { duration: 1.5, times: [0, 0.18, 0.3, 0.44, 0.58, 0.74, 1] }

export function ProjectionBurn({ slate = "Engine presents · Reel 01", title, sub, cta, beam = true, compact, className }: ProjectionBurnProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-[hsl(var(--booth))]", compact ? "py-12" : "py-24 sm:py-28", className)}>
      <div className="relative mx-auto w-full max-w-[980px] px-6">
        {beam && !reduce && (
          <motion.span
            aria-hidden
            initial={{ clipPath: "polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)" }}
            animate={{ clipPath: "polygon(0% 100%, 0% 62%, 100% 26%, 100% 100%)", opacity: [0.15, 0.95, 0.28, 1, 0.72, 1, 1] }}
            transition={{ default: FLICKER_T, clipPath: { duration: 1.1, ease: "easeOut" } }}
            className="pointer-events-none absolute inset-0 z-0"
            style={{ background: "linear-gradient(100deg, hsl(var(--beam-warm)/0.12) 0%, hsl(var(--beam-warm)/0.05) 55%, transparent 100%)", left: -40 }}
          />
        )}
        {/* dust motes inside the beam */}
        {!reduce && (
          <span aria-hidden className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
            {[12, 30, 46, 61, 78, 88].map((x, i) => (
              <motion.span
                key={i}
                initial={{ y: 220 + i * 30, opacity: 0 }}
                animate={{ y: [-30, 240], opacity: [0, 0.8, 0] }}
                transition={{ duration: 7 + i, repeat: Infinity, delay: i * 1.35, ease: "linear" }}
                className="absolute block size-[3px] rounded-full bg-white/70"
                style={{ left: `${x}%` }}
              />
            ))}
          </span>
        )}

        {/* the screen */}
        <motion.div
          initial={{ opacity: reduce ? 1 : 0.15 }}
          animate={{ opacity: reduce ? 1 : [0.15, 0.95, 0.28, 1, 0.72, 1, 1] }}
          transition={reduce ? { duration: 0 } : { duration: 1.5, times: [0, 0.18, 0.3, 0.44, 0.58, 0.74, 1], delay: 0.05 }}
          className="relative z-[2] overflow-hidden rounded-sm border border-white/15 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]"
          style={{ background: "hsl(var(--screen-paper))", color: "hsl(var(--burn-ink))" }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply" style={{ background: "radial-gradient(120% 110% at 12% 88%, transparent 42%, hsl(var(--burn-ink)/0.22) 100%)" }} />
          <div className={cn("px-8 py-12 text-center sm:px-16 sm:py-16", compact && "px-6 py-8")}>
            <MonoLabel className="opacity-55">{slate}</MonoLabel>
            <h1 className="mx-auto mt-4 max-w-[640px] font-serif text-[clamp(30px,6vw,56px)] font-black leading-[1.04] tracking-[-0.01em]">{title}</h1>
            {sub && <p className="mx-auto mt-4 max-w-md text-[14px] font-medium leading-[1.75] opacity-70">{sub}</p>}
            {cta && (
              <a href={cta.href ?? "#"} onClick={cta.onClick} className="mt-8 inline-flex h-11 w-fit items-center gap-2 border-2 border-current px-6 font-mono text-[11px] font-black uppercase tracking-[0.22em] transition-colors hover:bg-[hsl(var(--burn-ink))] hover:text-[hsl(var(--screen-paper))] focus-visible:outline-2 focus-visible:outline-offset-2">
                {cta.label}
              </a>
            )}
          </div>
          {/* gate weave hairline */}
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-[38%] h-px bg-white/50 opacity-60" />
          <Grain opacity={0.08} />
        </motion.div>

        {/* projector porthole glow bottom-left */}
        {!reduce && (
          <motion.span aria-hidden animate={{ opacity: [0.4, 0.8, 0.45] }} transition={{ duration: 3.2, repeat: Infinity }} className="absolute bottom-3 left-2 z-[3] block size-3 rounded-full bg-[hsl(var(--beam-warm))] shadow-[0_0_18px_6px_hsl(var(--beam-warm)/0.5)]" />
        )}
      </div>
    </section>
  )
}
