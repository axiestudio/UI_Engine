import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"

// ═══ JOB      announce a date/premiere/sale like a variety-theatre front
// ═══ EMOTION  Friday-night electricity
// ═══ SIGNATURE bulb frame: chase + random twinkle orbit the marquee face,
//               status chip ("NOW BOOKING") gets its own faster chase
//   SITE     → premiere/launch hero or event band header
//   APP      → live status bar: pass `status` to flip bulb rhythm (live = fast)
//   A11Y     bulbs are decorative; every word is real text; pause-friendly
//             (reduced motion = static lit bulbs, no chase)

export type MarqueeLightsProps = {
  overline?: string
  big: string
  under?: string
  status?: "soon" | "live" | "sold-out"
  statusLabel?: string
  cta?: { label: string; href?: string; onClick?: () => void }
  className?: string
}

const BULBS = 18

export function MarqueeLights({ overline = "One night only", big, under = "The UI engine premiere", status = "soon", cta, className }: MarqueeLightsProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const chaseSpeed = status === "live" ? 0.45 : 0.9
  const [seed] = React.useState(() => Array.from({ length: BULBS * 4 }, () => Math.random()))
  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-[hsl(var(--marquee-deep))] px-4 py-14 text-center sm:px-6", className)}>
      <div className="relative mx-auto w-fit max-w-full">
        {/* bulb frame */}
        <ul aria-hidden className="pointer-events-none absolute -inset-5 list-none sm:-inset-7">
          {Array.from({ length: BULBS }, (_, i) => <Bulb key={`t${i}`} x={`${(i + 0.5) * (100 / BULBS)}%`} y="0" i={i} reduce={reduce} speed={chaseSpeed} seed={seed[i]} />)}
          {Array.from({ length: BULBS }, (_, i) => <Bulb key={`b${i}`} x={`${(i + 0.5) * (100 / BULBS)}%`} y="100%" i={i + BULBS} reduce={reduce} speed={chaseSpeed} seed={seed[i + BULBS]} />)}
          {Array.from({ length: 7 }, (_, i) => <Bulb key={`l${i}`} x="0" y={`${(i + 0.5) * (100 / 7)}%`} i={i + BULBS * 2} reduce={reduce} speed={chaseSpeed} seed={seed[i + BULBS * 2]} />)}
          {Array.from({ length: 7 }, (_, i) => <Bulb key={`r${i}`} x="100%" y={`${(i + 0.5) * (100 / 7)}%`} i={i + BULBS * 3} reduce={reduce} speed={chaseSpeed} seed={seed[i + BULBS * 3]} />)}
        </ul>
        {/* marquee face */}
        <div className="relative border-[6px] border-[hsl(var(--bulb-off)/0.4)] bg-[hsl(var(--marquee-face))] px-8 py-10 shadow-[inset_0_0_60px_hsl(var(--foreground)/0.35)] sm:px-16 sm:py-12">
          <MonoLabel className="text-[hsl(var(--bulb))]">{overline}</MonoLabel>
          {big && <p className="mt-4 font-display text-[clamp(40px,9vw,84px)] font-black uppercase leading-[0.9] tracking-[-0.02em] text-[hsl(var(--marquee-ink))]" style={{ textShadow: "0 3px 0 hsl(var(--marquee-deep)), 0 0 24px hsl(var(--bulb)/0.35)" }}>{big}</p>}
          {under && <p className="mt-4 font-mono text-[11px] font-black uppercase tracking-[0.3em] text-[hsl(var(--bulb))]/90">{under}</p>}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {status && (
              <span className={cn("inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.2em] ring-1", status === "live" ? "bg-foreground/25 text-[hsl(var(--bulb))] ring-[hsl(var(--bulb)/0.6)]" : status === "sold-out" ? "bg-foreground/30 text-foreground/60 ring-foreground/20" : "bg-foreground/20 text-foreground/80 ring-foreground/30")}>
                <span aria-hidden className={cn("size-1.5 rounded-full", status === "live" ? "animate-ping bg-[hsl(var(--bulb))]" : "bg-current opacity-70")} />
                {status === "live" ? "Happening now" : status === "sold-out" ? "Sold out" : "Now booking"}
              </span>
            )}
            {cta && (
              <a href={cta.href ?? "#"} onClick={cta.onClick} className="rounded-full bg-[hsl(var(--bulb))] px-5 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--marquee-deep))] transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--marquee-ink))]">
                {cta.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Bulb({ x, y, i, reduce, speed, seed }: { x: string; y: string; i: number; reduce: boolean; speed: number; seed: number }) {
  const lit = reduce || seed > 0.25
  return (
    <motion.span
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: x, top: y }}
    >
      <motion.span
        aria-hidden
        animate={reduce ? undefined : { opacity: [lit ? 1 : 0.35, 0.35, lit ? 1 : 0.35], scale: [1, lit ? 1.25 : 0.9, 1] }}
        transition={reduce ? undefined : { duration: speed * 1.6, repeat: Infinity, delay: (i % 9) * speed * 0.2 + (i > 35 ? 0.12 : 0), ease: "easeInOut" }}
        className="block size-2.5 rounded-full"
        style={{ background: lit ? "hsl(var(--bulb))" : "hsl(var(--bulb-off))", boxShadow: lit ? "0 0 10px 2px hsl(var(--bulb)/0.55)" : "none" }}
      />
    </motion.span>
  )
}
