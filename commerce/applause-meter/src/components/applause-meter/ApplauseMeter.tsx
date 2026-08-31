import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"

// ═══ JOB      make a rating feel earned — proof with a pulse
// ═══ EMOTION  the room warming up
// ═══ SIGNATURE amplitude equalizer whose bars lean toward the score, count-up
//               verdict, and above 4.7 a STANDING OVATION line rises
//   SITE     → testimonials header / social-proof band
//   APP      → post-session "rate this visit" dialog (pass onRate, interactive)
//   A11Y     interactive mode = real radio row; read-only = text value;
//             bars aria-hidden; reduce-motion counts instantly

export type ApplauseMeterProps = {
  /** 0..max, e.g. 4.8 */
  value: number
  max?: number
  count?: number
  countLabel?: string
  eyebrow?: string
  label?: string
  /** make it tappable (webapp feedback screen) */
  onRate?: (v: number) => void
  className?: string
}

export function ApplauseMeter({ value, max = 5, count, countLabel = "verified voices", eyebrow = "REVIEWS", label, onRate, className }: ApplauseMeterProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const ratio = Math.max(0, Math.min(1, value / max))
  const [shown, setShown] = React.useState(reduce ? value : 0)
  const [rated, setRated] = React.useState<number | null>(null)
  React.useEffect(() => {
    if (reduce || shown !== 0) return
    let raf = 0
    const t0 = performance.now()
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 1200)
      setShown(value * (1 - (1 - p) ** 3))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, reduce, shown])

  const standing = value / max >= 0.94
  const target = rated ?? value

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-ovation-stage px-4 py-16 text-white sm:px-6 lg:px-8", className)}>
      {/* warm floor glow proportional to the score */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-56" style={{ background: `radial-gradient(60% 100% at 50% 100%, hsl(var(--ovation)/${0.16 + ratio * 0.24}), transparent)` }} />
      <div className="relative mx-auto grid w-full max-w-[980px] items-center gap-10 lg:grid-cols-[1fr_auto]">
        <div>
          <MonoLabel className="text-ovation">{eyebrow}</MonoLabel>
          <p className="mt-3 font-display text-[44px] font-semibold leading-none tracking-[-0.02em] sm:text-[56px]">
            {shown.toFixed(1)}<span className="text-white/35 text-[24px]"> / {max}</span>
          </p>
          {label && <p className="mt-2 max-w-sm text-sm font-medium text-white/60">{label}</p>}
          <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-white/45">
            {count !== undefined && <>{count.toLocaleString()} {countLabel}</>} {standing && <span className="ml-3 inline-flex items-center gap-1.5 text-ovation" aria-hidden><Star className="size-3 fill-current" /> Average rating</span>}
          </p>
          <Bars ratio={ratio / (value ? target / value : 1) || 1} live={Math.max(ratio, (target ?? 0) / max)} reduce={reduce} />
          {ratingRow(onRate, setRated, rated, max, reduce)}
        </div>
        <OvationMeter ratio={target / max} reduce={reduce} />
      </div>
    </section>
  )
}

function Bars({ ratio, live, reduce }: { ratio: number; live: number; reduce: boolean }) {
  const heights = [0.45, 0.75, 0.55, 0.9, 0.65, 1, 0.72, 0.58, 0.84, 0.5, 0.68, 0.4]
  return (
    <div className="mt-7 flex h-16 items-end gap-[6px]" aria-hidden>
      {heights.map((h, i) => {
        const toward = Math.sin(i / heights.length * Math.PI) // center-weighted
        const hh = reduce ? h * ratio : h * (0.25 + toward * 0.75) * live
        return (
          <motion.span
            key={i}
            initial={reduce ? false : { scaleY: 0 }}
            whileInView={reduce ? undefined : { scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 0.25 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: `${14 + hh * 48}px`, backgroundColor: "hsl(var(--ovation))", opacity: 0.24 + hh * 0.76 }}
            className="w-[7%] origin-bottom rounded-t-[2px]"
          />
        )
      })}
    </div>
  )
}

function OvationMeter({ ratio, reduce }: { ratio: number; reduce: boolean }) {
  const spring = useSpring(useMotionValue(reduce ? ratio : 0), { stiffness: 60, damping: 20 })
  React.useEffect(() => { spring.set(ratio) }, [ratio, spring])
  const h = useTransform(spring, [0, 1], ["4%", "100%"])
  return (
    <div aria-hidden className="relative hidden size-28 shrink-0 items-end justify-center overflow-hidden rounded-full border border-border bg-white/5 lg:flex">
      <motion.span style={{ height: h }} className="w-full" >
        <span className="block h-full w-full bg-gradient-to-t from-[hsl(var(--ovation-deep))] via-[hsl(var(--ovation))] to-[hsl(var(--ovation)/0.6)] opacity-80" />
        <span className="absolute inset-x-0 bottom-0 h-px bg-white/30" />
      </motion.span>
      <span className="absolute inset-0 grid place-items-center font-mono text-[10px] font-semibold tracking-[0.2em]">{Math.round(ratio * 100)}% APPLAUSE</span>
    </div>
  )
}

function ratingRow(onRate: ((v: number) => void) | undefined, setRated: (n: number | null) => void, rated: number | null, max: number, reduce: boolean) {
  if (!onRate) return null
  return (
    <fieldset className="mt-7 flex items-center gap-2" onChange={(e) => { const v = Number((e.target as unknown as HTMLInputElement).value); setRated(v); onRate(v) }}>
      <legend className="sr-only">Rate your visit</legend>
      {Array.from({ length: max }, (_, i) => i + 1).map((v) => (
        <label key={v} className="cursor-pointer">
          <input type="radio" name="ovation" value={v} className="peer sr-only" checked={rated === v} />
          <span className={cn("grid size-11 place-items-center rounded-full border transition-all", rated !== null && v <= rated ? "border-ovation bg-ovation/15" : "border-white/20", "peer-focus-visible:ring-2 peer-focus-visible:ring-[hsl(var(--ovation))]", !reduce && "hover:scale-110")}>
            <Star className={cn("size-5", rated !== null && v <= rated ? "fill-[hsl(var(--ovation))] text-ovation" : "text-white/40")} />
          </span>
          <span className="sr-only">{v} of {max}</span>
        </label>
      ))}
    </fieldset>
  )
}
