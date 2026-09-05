import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"

// ═══ JOB      announce availability the way a storefront does — with tubes
// ═══ EMOTION  rain outside, somebody's sign left on for you
// ═══ SIGNATURE letters ignite one by one (a stutter of near-misses before
//               each tube grabs), the last letter hums; status swap relights
//               the whole phrase in the second colour with a double flicker
//   SITE     → bar / food / late-hours offer band
//   APP      → status beacon on a settings or availability screen:
//             `status` + `onToggle` = OPEN ⇄ CLOSED, no scroll anywhere
//   A11Y     word lives in aria + sr text; toggle is a real switch input;
//            reduced = steady neon, one-beat fade per letter only

export type NeonBeaconProps = {
  word?: string
  under?: string
  eyebrow?: string
  status?: "open" | "closed"
  onToggle?: (next: "open" | "closed") => void
  compact?: boolean
  className?: string
}

export function NeonBeacon({ word, under, eyebrow, status: statusProp, onToggle, compact, className }: NeonBeaconProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [inner, setInner] = React.useState<"open" | "closed">("open")
  const status = statusProp ?? inner
  const letters = (word ?? (status === "open" ? "OPEN" : "CLOSED")).toUpperCase().split("")
  const col = status === "open" ? "hsl(var(--neon))" : "hsl(var(--neon-alt))"
  return (
    <section className={cn("relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-brick", compact ? "px-5 py-10" : "px-6 py-20 sm:py-24", className)}>
      {/* brick courses */}
      <span aria-hidden className="absolute inset-0 opacity-[0.16]" style={{ backgroundImage: "repeating-linear-gradient(0deg, hsl(var(--brick-line)) 0 1px, transparent 1px 16px), repeating-linear-gradient(90deg, hsl(var(--brick-line)) 0 1px, transparent 1px 40px)" }} />
      <div className={cn("relative mx-auto text-center", compact ? "max-w-[420px]" : "max-w-[760px]")}>
        <span key={status + word} aria-hidden className={cn("inline-flex flex-wrap items-end justify-center", compact ? "gap-1" : "gap-2 sm:gap-3")}>
          {letters.map((ch, i) => (
            <motion.span
              key={`${status}-${i}-${ch}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { opacity: [0, 0, 0.9, 0.15, 0.9, 0.35, 1], filter: [`drop-shadow(0 0 0px ${col})`, `drop-shadow(0 0 0px ${col})`, `drop-shadow(0 0 14px ${col})`, `drop-shadow(0 0 2px ${col})`, `drop-shadow(0 0 14px ${col})`, `drop-shadow(0 0 4px ${col})`, `drop-shadow(0 0 18px ${col})`] }}
              transition={reduce ? { duration: 0.3, delay: i * 0.03 } : { duration: 1.1 + (i % 3) * 0.14, delay: i * 0.13, ease: "linear" }}
              className="font-display font-semibold leading-none text-transparent"
              style={{
                ["--tc" as string]: col,
                color: "transparent",
                backgroundImage: `linear-gradient(${col}, ${col})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                textShadow: "none",
                fontSize: compact ? 34 : undefined,
              }}
            >
              <span style={{ color: col, WebkitTextFillColor: col, textShadow: `0 0 6px ${col}, 0 0 22px ${col}, 0 0 2px ${col}` }} className={cn("font-display font-semibold", !compact && "text-[clamp(48px,12vw,110px)]")}>
                {ch}
              </span>
            </motion.span>
          ))}
        </span>

        {under && <p className={cn("mt-3 font-mono font-bold uppercase tracking-[0.3em] text-white/55", compact ? "text-[9px]" : "text-[11px]")}>{under}</p>}
        {eyebrow && <MonoLabel className="mt-2 text-white/35">{eyebrow}</MonoLabel>}

        {onToggle && (
          <Button
            type="button"
            role="switch"
            variant="outline"
            size="sm"
            aria-checked={status === "open"}
            aria-label="Neon status"
            onClick={() => { const next = status === "open" ? "closed" : "open"; if (statusProp === undefined) setInner(next); onToggle(next) }}
            className={cn("group mt-7 h-auto gap-3 rounded-full px-5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]", status === "open" ? "border-[hsl(var(--neon)/0.5)] text-neon" : "border-[hsl(var(--neon-alt)/0.5)] text-neon-alt")}
          >
            <span className={cn("size-2 rounded-full transition-all", status === "open" ? "bg-neon shadow-sm" : "bg-neon-alt shadow-[0_0_10px_hsl(var(--neon-alt))]")} />
            {status === "open" ? "switch off" : "switch on"}
            <span className="sr-only"> — currently {status}</span>
          </Button>
        )}
      </div>
      <Grain opacity={0.08} />
    </section>
  )
}
