import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { PartyPopper } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ JOB      give success a moment, not a toast
// ═══ EMOTION  the room goes off for you
// ═══ SIGNATURE a banner unfurls centre-stage while two cannons rake the
//               frame with confetti — paper rectangles on seeded physics,
//               no library, self-harvesting at `duration`
//   SITE     → form-success / deal-closed finale band
//   APP      → achievement overlay over any product surface: `show`, `onDone`
//             (it dismisses itself and calls you back)
//   A11Y     role=dialog + aria-live announcement; Esc closes; reduced =
//            banner only, zero particles; overlay is inert (no focus trap war,
//            host owns what it celebrates)

export type FinaleConfettiProps = {
  show?: boolean
  title?: React.ReactNode
  sub?: React.ReactNode
  duration?: number
  onDone?: () => void
  /** site mode: always shown (render band); app mode: pass show */
  variant?: "band" | "overlay"
  className?: string
}

const COLORS = ["--c1", "--c2", "--c3", "--c4", "--c5"] as const

function seededBurst(count: number, seedText: string) {
  let h = 2166136261
  for (const c of seedText) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0 }
  const r = () => { h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0; return (h & 0xffff) / 0xffff }
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (r() - 0.5) * 2, // -1..1 spread
    dx: (r() - 0.5) * 340,
    dy: -(160 + r() * 340),
    fall: 420 + r() * 520,
    delay: r() * 0.65,
    spin: (r() - 0.5) * 900,
    w: 6 + r() * 7,
    hgt: 3 + r() * 4,
    color: COLORS[Math.floor(r() * COLORS.length)],
  }))
}

export function FinaleConfetti({ show = true, title = "DEAL, SEALED.", sub, duration = 3200, onDone, variant = "band", className }: FinaleConfettiProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const bursts = React.useMemo(() => ({ l: seededBurst(46, "L" + title), r: seededBurst(46, "R" + title) }), [title])
  const [live, setLive] = React.useState(show)
  React.useEffect(() => { setLive(show) }, [show])
  React.useEffect(() => {
    if (variant !== "overlay" || !live || !show) return
    const t = setTimeout(() => { setLive(false); onDone?.() }, duration)
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setLive(false); onDone?.() } }
    window.addEventListener("keydown", esc)
    return () => { clearTimeout(t); window.removeEventListener("keydown", esc) }
  }, [live, show, duration, onDone, variant])

  const Content = (
    <>
      {/* two cannon mouths at the bottom corners */}
      <Cannon side="left" parts={bursts.l} reduce={reduce} />
      <Cannon side="right" parts={bursts.r} reduce={reduce} />
      <motion.div
        initial={reduce ? { opacity: 0 } : { scaleY: 0.2, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        exit={reduce ? { opacity: 0 } : { scaleY: 0.6, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-[2] rounded-md border-[3px] border-double px-8 py-6 text-center shadow-2xl"
        style={{ borderColor: "hsl(var(--c2))", background: "hsl(var(--party-bg) / 0.92)", color: "hsl(var(--party-ink))" }}
      >
        <p className="flex items-center justify-center gap-3 font-display text-2xl font-black tracking-tight sm:text-3xl">
          <PartyPopper aria-hidden className="size-6 text-[hsl(var(--c2))]" /> {title}
        </p>
        {sub && <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.26em] opacity-65">{sub}</p>}
      </motion.div>
    </>
  )

  if (variant === "band") {
    return (
      <section className={cn("relative isolate flex w-full min-h-[320px] items-center justify-center overflow-hidden bg-[hsl(var(--party-bg))] px-4 py-16", className)} aria-live="polite">
        {Content}
      </section>
    )
  }
  return (
    <AnimatePresence>
      {live && (
        <motion.div role="dialog" aria-label="Celebration" aria-live="assertive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className={cn("fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 backdrop-blur-[2px]", className)}>
          {Content}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Cannon({ side, parts, reduce }: { side: "left" | "right"; parts: ReturnType<typeof seededBurst>; reduce: boolean }) {
  if (reduce) {
    return (
      <span aria-hidden className={cn("absolute bottom-10 z-[1] block size-14 rounded-lg", side === "left" ? "left-6 -rotate-[24deg]" : "right-6 rotate-[24deg]")} style={{ background: "linear-gradient(180deg, hsl(var(--c1)), hsl(var(--c4)))" }} />
    )
  }
  return (
    <>
      <span aria-hidden className={cn("absolute bottom-10 z-[1] block size-14 origin-bottom rounded-lg", side === "left" ? "left-6 -rotate-[24deg]" : "right-6 rotate-[24deg]")} style={{ background: "linear-gradient(180deg, hsl(var(--c1)), hsl(var(--c4)))", boxShadow: "0 8px 22px rgba(0,0,0,0.4)" }} />
      <span className={cn("pointer-events-none absolute bottom-[74px] z-[3]", side === "left" ? "left-[52px]" : "right-[52px]")}>
        {parts.map((p) => (
          <motion.span
            key={p.id}
            aria-hidden
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x: p.dx * (side === "left" ? 1 : -1), y: [p.dy, p.dy * 0.4, p.fall], opacity: [1, 1, 0], rotate: p.spin }}
            transition={{ duration: 2.4 + (p.id % 5) * 0.12, delay: 0.15 + p.delay, ease: [0.12, 0.6, 0.4, 1] }}
            className="absolute block rounded-[1px]"
            style={{ width: p.w, height: p.hgt, background: `hsl(var(${p.color}))` }}
          />
        ))}
      </span>
    </>
  )
}
