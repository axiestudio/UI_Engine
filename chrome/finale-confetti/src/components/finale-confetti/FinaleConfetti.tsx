import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

// ═══ JOB      give success a moment — tokenized celebration
// ═══ EMOTION  quiet lift, not carnival
// ═══ SIGNATURE banner + reduced particles (24) on seeded physics, token colors only

export type FinaleConfettiProps = {
  show?: boolean
  title?: React.ReactNode
  sub?: React.ReactNode
  duration?: number
  onDone?: () => void
  variant?: "band" | "overlay"
  className?: string
}

const TOKEN_COLORS = ["--primary", "--secondary", "--muted-foreground", "--accent", "--primary"] as const

function seededBurst(count: number, seedText: string) {
  let h = 2166136261
  for (const c of seedText) {
    h ^= c.charCodeAt(0)
    h = Math.imul(h, 16777619) >>> 0
  }
  const r = () => {
    h ^= h << 13
    h >>>= 0
    h ^= h >> 17
    h ^= h << 5
    h >>>= 0
    return (h & 0xffff) / 0xffff
  }
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    dx: (r() - 0.5) * 300,
    dy: -(120 + r() * 280),
    fall: 380 + r() * 420,
    delay: r() * 0.5,
    spin: (r() - 0.5) * 720,
    w: 6 + r() * 6,
    hgt: 3 + r() * 4,
    color: TOKEN_COLORS[Math.floor(r() * TOKEN_COLORS.length)]!,
  }))
}

export function FinaleConfetti({ show = true, title = "Done.", sub, duration = 2800, onDone, variant = "band", className }: FinaleConfettiProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const bursts = React.useMemo(() => ({ l: seededBurst(12, "L" + String(title)), r: seededBurst(12, "R" + String(title)) }), [title])
  const [live, setLive] = React.useState(show)
  React.useEffect(() => {
    setLive(show)
  }, [show])
  React.useEffect(() => {
    if (variant !== "overlay" || !live || !show) return
    const t = setTimeout(() => {
      setLive(false)
      onDone?.()
    }, duration)
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLive(false)
        onDone?.()
      }
    }
    window.addEventListener("keydown", esc)
    return () => {
      clearTimeout(t)
      window.removeEventListener("keydown", esc)
    }
  }, [live, show, duration, onDone, variant])

  const Content = (
    <>
      <Cannon side="left" parts={bursts.l} reduce={reduce} />
      <Cannon side="right" parts={bursts.r} reduce={reduce} />
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[2] rounded-xl border bg-card px-8 py-6 text-center shadow-sm"
      >
        <p className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</p>
        {sub && <p className="mt-2 font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">{sub}</p>}
      </motion.div>
    </>
  )

  if (variant === "band") {
    return (
      <section className={cn("relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-muted px-4 py-16", className)} aria-live="polite">
        {Content}
      </section>
    )
  }
  return (
    <AnimatePresence>
      {live && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Celebration"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          className={cn("absolute inset-0 z-50 flex items-center justify-center bg-foreground/10 p-4 ", className)}
        >
          {Content}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Cannon({ side, parts, reduce }: { side: "left" | "right"; parts: ReturnType<typeof seededBurst>; reduce: boolean }) {
  if (reduce) {
    return (
      <span
        aria-hidden
        className={cn("absolute bottom-10 z-[1] block h-3 w-20 rounded-full bg-foreground/20", side === "left" ? "left-6" : "right-6")}
      />
    )
  }
  return (
    <>
      <span
        aria-hidden
        className={cn("absolute bottom-10 z-[1] block h-3 w-20 rounded-full bg-foreground/20", side === "left" ? "left-6 -rotate-3" : "right-6 rotate-3")}
      />
      <span className={cn("pointer-events-none absolute bottom-[52px] z-[3]", side === "left" ? "left-[44px]" : "right-[44px]")}>
        {parts.map((p) => (
          <motion.span
            key={p.id}
            aria-hidden
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x: p.dx * (side === "left" ? 1 : -1), y: [p.dy, p.dy * 0.4, p.fall], opacity: [1, 1, 0], rotate: p.spin }}
            transition={{ duration: 2, delay: 0.12 + p.delay, ease: [0.22, 1, 0.36, 1] }}
            className="absolute block rounded-sm"
            style={{ width: p.w, height: p.hgt, background: `hsl(var(${p.color}))` }}
          />
        ))}
      </span>
    </>
  )
}
