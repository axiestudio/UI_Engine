import * as React from "react"
import { motion } from "motion/react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"

// ═══ JOB      show scarcity honestly — and make watching it a spectacle
// ═══ EMOTION  the grid dropping, seats vanishing, red LEDs ticking
// ═══ SIGNATURE digit odometer: each number cell slides a column of digits
//               (mask-clipped) into place with a stagger right-to-left
//   SITE     → drop/waitlist scarcity band (pass `sold` from your API)
//   APP      → live inventory in checkout — re-render with new prop values
//             and the digits tick again; `onSoldOut` when at zero
//   A11Y     aria-live polite announces remaining count; odometer is
//            decorative; no motion loops

export type TicketRushProps = {
  stock: number
  sold?: number
  eyebrow?: string
  title?: React.ReactNode
  label?: string
  cta?: { label: string; href?: string; onClick?: () => void }
  onSoldOut?: () => void
  className?: string
}

export function TicketRush({ stock, sold = 0, eyebrow = "Today's release", title, label = "remaining", cta, onSoldOut, className }: TicketRushProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const remaining = Math.max(0, stock - sold)
  const prev = React.useRef(remaining)
  React.useEffect(() => {
    if (remaining === 0 && prev.current !== 0) onSoldOut?.()
    prev.current = remaining
  }, [remaining, onSoldOut])
  const digits = String(remaining).padStart(3, "0").split("")

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-rush px-4 py-16 text-white sm:px-6 lg:px-8", className)}>
      {/* glass sheen */}
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,hsl(var(--torch,0_0%_100%)/0.04)_0%,transparent_30%,transparent_75%,hsl(var(--torch,0_0%_100%)/0.02)_100%)]" />
      <div className="relative mx-auto flex w-full max-w-[980px] flex-wrap items-center justify-between gap-8">
        <div className="min-w-[240px]">
          <MonoLabel className={cn(remaining === 0 ? "text-white/40" : "text-led")}>{eyebrow}</MonoLabel>
          {title && <h2 className="mt-3 max-w-xs font-display text-2xl font-semibold tracking-[-0.02em] sm:text-[30px]">{title}</h2>}
          <p className="mt-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">{stock} issued · {sold} gone</p>
        </div>

        <div className="flex items-end gap-6">
          <div aria-live="polite">
            <div className="flex items-center gap-3" aria-hidden>
              <span className="flex gap-1.5 rounded-lg border border-border bg-black/50 p-3 shadow-[inset_0_2px_12px_rgba(0,0,0,0.8)]">
                {digits.map((d, i) => <Cell key={`${i}-${digits.length}`} d={d} n={digits.length - i} reduce={reduce} off={remaining === 0} />)}
              </span>
              <span className="font-display text-[42px] font-semibold leading-none tabular-nums text-led/90 sm:text-[54px]" style={{ textShadow: "0 0 26px hsl(var(--led)/0.5)" }}>{remaining === 0 ? "GONE" : ""}</span>
            </div>
            <p className="mt-2 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-white/45">{remaining === 0 ? "sold out" : `${remaining} ${label}`}</p>
            <span className="sr-only">{remaining === 0 ? "Sold out." : `${remaining} of ${stock} remaining.`}</span>
          </div>
        </div>

        {cta && (
          <a href={cta.href ?? "#"} onClick={remaining > 0 ? cta.onClick : undefined} aria-disabled={remaining === 0} className={cn("group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full px-7 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] transition-all", remaining === 0 ? "pointer-events-none bg-white/10 text-white/30" : "bg-led text-black shadow-sm hover:-translate-y-0.5")}>
            <Clock className="size-4" strokeWidth={2.6} /> {cta.label}
          </a>
        )}
      </div>
    </section>
  )
}

function Cell({ d, n, reduce, off }: { d: string; n: number; reduce: boolean; off: boolean }) {
  return (
    <span className="relative block h-[52px] w-9 overflow-hidden rounded-sm bg-black/60 sm:h-[64px] sm:w-11">
      <motion.span
        key={d}
        initial={reduce ? false : { y: 26, opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: n * 0.06, ease: [0.22, 1, 0.36, 1] }}
        className={cn("absolute inset-0 grid place-items-center font-display text-[34px] font-semibold tabular-nums sm:text-[44px]", off ? "text-led-off" : "text-led")}
        style={off ? undefined : { textShadow: "0 0 18px hsl(var(--led)/0.6)" }}
      >
        {d}
      </motion.span>
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/70" />
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,hsl(var(--led-off)/0.12)_0_2px,transparent_2px_4px)]" />
    </span>
  )
}
