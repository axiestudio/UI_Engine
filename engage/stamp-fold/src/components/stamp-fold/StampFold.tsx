import * as React from "react"
import { motion } from "motion/react"
import { Stamp as StampIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, Grain } from "@/components/primitives/handcraft"

// JOB      turn "submitted" into a physical moment — the letter is sealed
// EMOTION  ceremony; the small satisfaction of hot wax and a fold
// SIGNATURE press drops the wax stamp (impact squash), then the paper folds
//             bottom-up and the whole letter tilts as if posted
// SITE     RSVP / booking-request confirmation band (replaces a spinner)
// APP      order-confirmed / application-received card inside a dialog
// A11Y     status announced via aria-live; animation is choreography, not info

export type StampFoldProps = {
  to?: string
  greeting?: string
  lines: React.ReactNode[]
  signoff?: string
  signature?: string
  /** Drive from outside: sealed when true. Omit to seal on mount after `delay`. */
  sealed?: boolean
  delay?: number
  onSealed?: () => void
  className?: string
}

export function StampFold({
  to = "The front desk",
  greeting = "Hello —",
  lines,
  signoff = "See you soon,",
  signature = "A. Lindqvist",
  sealed: sealedProp,
  delay = 900,
  onSealed,
  className,
}: StampFoldProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [auto, setAuto] = React.useState(sealedProp === undefined)
  React.useEffect(() => {
    if (!auto) return
    const t = setTimeout(() => setSeal(true), delay)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto])
  const [seal, setSeal] = React.useState(sealedProp ?? false)
  React.useEffect(() => { if (sealedProp !== undefined) { setSeal(sealedProp); setAuto(false) } }, [sealedProp])
  const [folded, setFolded] = React.useState(reduce || seal)
  React.useEffect(() => {
    if (!seal) return
    onSealed?.()
    if (reduce) return
    const t = setTimeout(() => setFolded(true), 1150)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seal])

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-background px-4 py-20 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto w-full max-w-[560px] [perspective:1200px]">
        <motion.div
          animate={folded ? { rotate: -1.2, y: -8 } : { rotate: 0, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-sm border bg-[hsl(var(--letter-paper))] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]"
        >
          <Grain opacity={0.05} />
          {/* letterhead rule */}
          <div className="flex items-center justify-between border-b border-[hsl(var(--letter-edge))] px-7 py-4">
            <MonoLabel className="text-[hsl(var(--letter-ink))] opacity-70">Letter — {to}</MonoLabel>
            <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-[hsl(var(--letter-soft))] opacity-50">{new Date().toLocaleDateString(undefined, { day: "2-digit", month: "short" }).toUpperCase()}</span>
          </div>

          <div className="px-7 py-8 font-serif text-[hsl(var(--letter-ink))]">
            <p className="text-[15px] italic opacity-70">{greeting}</p>
            <div className="mt-4 space-y-3 text-[15px] leading-[1.8]">
              {lines.map((l, i) => <p key={i}>{l}</p>)}
            </div>
            <p className="mt-8 text-[14px] italic opacity-70">{signoff}</p>
            <p className="mt-1 font-display text-[17px] font-semibold tracking-tight">{signature}</p>
          </div>

          {/* fold panel — the paper's bottom edge swinging up over the body */}
          <motion.div
            aria-hidden
            initial={{ rotateX: reduce ? 0 : 0 }}
            animate={{ rotateX: folded ? 178 : 0 }}
            transition={{ duration: reduce ? 0 : 1.05, ease: [0.7, 0, 0.2, 1], delay: 0.1 }}
            style={{ transformOrigin: "bottom center" }}
            className="absolute inset-x-0 bottom-0 z-[1] h-1/2 rounded-b-sm border-t bg-[hsl(var(--letter-paper))] shadow-[0_-14px_24px_-16px_rgba(0,0,0,0.3)]"
          >
            <div className="flex h-full items-end justify-center pb-4">
              <span className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[hsl(var(--letter-soft))] transition-opacity duration-300", folded ? "opacity-40 rotate-180" : "opacity-0")}>confirmed</span>
            </div>
          </motion.div>

          {/* wax stamp — drops in with a squash settle, sits on the fold edge */}
          <motion.div
            aria-hidden={false}
            role="img"
            aria-label={seal ? "Sealed" : "Not yet sealed"}
            animate={seal && !reduce ? { scale: [0, 1.35, 0.94, 1], rotate: [-14, -8, -9, -9] } : undefined}
            initial={{ scale: seal ? undefined : 0, rotate: -9 }}
            transition={{ duration: 0.65, times: [0, 0.55, 0.8, 1], ease: "easeOut" }}
            className={cn(
              "absolute bottom-[44%] right-10 z-[2] grid size-14 place-items-center rounded-full",
              seal || reduce ? "opacity-100" : "opacity-0",
            )}
            style={{ background: "radial-gradient(circle at 35% 30%, hsl(var(--wax)/0.85), hsl(var(--wax) 70% 30%) 60%, hsl(var(--wax-deep)))", boxShadow: "0 6px 10px -4px rgba(0,0,0,0.45), inset 0 2px 6px hsl(var(--wax-deep)/0.8)" }}
          >
            <StampIcon className="size-6 text-white/85" strokeWidth={2.4} />
          </motion.div>
          {/* wax drip dots */}
          {(seal || reduce) && (
            <span aria-hidden className="absolute bottom-[41%] right-[4.2rem] z-[2]">
              <span className="absolute size-1.5 rounded-full" style={{ background: "hsl(var(--wax))", top: 46, left: 18 }} />
              <span className="absolute size-1 rounded-full" style={{ background: "hsl(var(--wax-deep))", top: 52, left: 6 }} />
            </span>
          )}
        </motion.div>
        <p aria-live="polite" className="sr-only">{seal ? "Your letter is sealed and on its way — confirmed." : "Sending…"}</p>
      </div>
    </section>
  )
}
