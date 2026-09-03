import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Pause, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import Noise from "@/components/primitives/noise"
import { Button } from "@/components/ui/button"


// ═══ JOB      give a quote/track a ritual object instead of a card
// ═══ EMOTION  handling something analog and expensive
// ═══ SIGNATURE the jacket sits closed; on play (in-view, or app button) the
//               disc slides out of the sleeve opening and a groove-lit spin
//               kicks in; the quote is written on the paper ring while it plays
//   SITE     → featured-quote / "what we're spinning" band
//   APP      → episode or playlist hero card: `playing`+`onToggle` controlled,
//             title/meta real text for your player state
//   A11Y     play/pause = real button w/ pressed state when controlled;
//             spin aria-hidden; reduced = static disc out of sleeve

export type VinylSpinProps = {
  artist?: string
  title?: React.ReactNode
  quote?: React.ReactNode
  /** app mode: controlled playback */
  playing?: boolean
  onToggle?: (next: boolean) => void
  compact?: boolean
  className?: string
}

export function VinylSpin({ artist = "SIDE A — STUDIO CUTS", title = "Slow hair, fast lives", quote = "“Every good chair is a two-year argument you settle politely.”", playing: playingProp, onToggle, compact, className }: VinylSpinProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [seen, setSeen] = React.useState(false)
  const [inner, setInner] = React.useState(false)
  const out = playingProp !== undefined ? playingProp : seen || inner
  const spinning = out

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-background", compact ? "px-5 py-10" : "px-6 py-20 sm:py-24", className)}>
      <div className={cn("mx-auto flex w-full max-w-[980px] items-center gap-8", compact ? "gap-6" : "gap-10 sm:gap-14", "flex-col sm:flex-row")}>
        {/* the deck */}
        <div className="relative shrink-0" aria-hidden
        >
          {/* disc — slides right & spins */}
          <motion.span
            animate={{ x: out ? "58%" : "8%", opacity: 1 }}
            transition={{ x: { duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.4 } }}
            className="absolute left-0 top-0 z-0 block rounded-full"
            style={{
              width: compact ? 190 : 240, height: compact ? 190 : 240,
              background: "repeating-radial-gradient(circle at 50% 50%, hsl(var(--disc)) 0 2px, hsl(var(--groove)) 2px 3.2px)",
              boxShadow: "inset 0 0 22px hsl(var(--foreground)/0.9), -6px 0 18px hsl(var(--foreground)/0.4)",
              animation: spinning && !reduce ? "vinyl-spin 4.5s linear infinite" : undefined,
            }}
          >
            <span className="absolute inset-[30%] grid place-items-center rounded-full" style={{ background: "hsl(var(--label))" }}>
              <span className="size-2.5 rounded-full bg-background" />
            </span>
            <span className="absolute inset-[30%] rounded-full border border-white/15 mix-blend-overlay" />
          </motion.span>
          {/* sleeve on top of disc's left half */}
          <div
            className="relative z-[1] overflow-hidden rounded-[3px] shadow-[8px_10px_24px_-10px_hsl(var(--foreground)/0.6)]"
            style={{ width: compact ? 210 : 264, height: compact ? 210 : 264, background: "hsl(var(--sleeve))" }}
          >
            <span className="absolute inset-x-6 top-6 block h-[42%] rounded-sm" style={{ background: "linear-gradient(140deg, hsl(var(--sleeve-art)) 0%, hsl(var(--label)) 60%, hsl(var(--sleeve-art)) 100%)", opacity: 0.9 }} />
            <span className="absolute bottom-6 left-6 right-6 block font-mono text-[9px] font-bold uppercase leading-[1.6] tracking-[0.12em]" style={{ color: "hsl(var(--vinyl-ink))", opacity: 0.8 }}>{String(title).slice(0, 28)}</span>
            <span className="absolute inset-y-0 left-0 w-[10px] bg-black/45" />
            <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden"><Noise patternAlpha={Math.round((0.12) * 255)} patternSize={240} patternRefreshInterval={3} /></span>
            {/* sleeve opening where the disc exits */}
            <span className="absolute right-0 top-[12%] bottom-[12%] w-[3px] bg-black/60" />
          </div>
        </div>

        {/* copy + play control */}
        <div className={cn("min-w-0 flex-1", compact ? "text-center sm:text-left" : "")}>
          <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{artist}</span>
          <h2 className={cn("mt-3 font-display font-bold tracking-tight", compact ? "text-2xl" : "text-[32px] sm:text-[40px]")}>{title}</h2>
          <AnimatePresence mode="wait">
            {out && (
              <motion.blockquote key="q" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.35, duration: 0.5 }} className="mt-4 max-w-md border-l-2 pl-4 font-serif text-[15px] italic leading-relaxed text-muted-foreground">
                {quote}
              </motion.blockquote>
            )}
          </AnimatePresence>
          <Button type='button' aria-pressed={out} onClick={() => { const next = !out; if (playingProp === undefined) setInner(next); onToggle?.(next) }} className={cn("mt-6 inline-flex h-12 items-center gap-3 rounded-full pl-2 pr-6 font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition-colors", out ? "bg-foreground text-background" : "border-2 border-foreground text-foreground hover:bg-foreground/5")} variant="default">
            <span className={cn("grid size-9 place-items-center rounded-full", out ? "bg-background text-foreground" : "bg-foreground text-background")}>
              {out ? <Pause className="size-4" /> : <Play className="size-4 translate-x-[1px]" />}
            </span>
            {out ? "Let it run" : "Drop the needle"}
          </Button>
          <p className="sr-only">{out ? "Now spinning." : "Stopped."}</p>
        </div>
      </div>
      {/* set in-view once for site mode */}
      {!compact && playingProp === undefined && <InViewOnce onFire={() => setSeen(true)} />}
      <style>{`@keyframes vinyl-spin { to { transform: rotate(360deg) } }`}</style>
    </section>
  )
}

function InViewOnce({ onFire }: { onFire: () => void }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { onFire(); io.disconnect() } }, { rootMargin: "-20%" })
    io.observe(el)
    return () => io.disconnect()
  }, [onFire])
  return <span ref={ref} aria-hidden className="absolute inset-x-0 bottom-0 h-px" />
}
