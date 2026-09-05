import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Timer } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"

// ═══ JOB      make a launch time the protagonist of the band
// ═══ EMOTION  T-minus air in the lungs
// ═══ SIGNATURE LED flip cells burn down second by second; at T-0 the horizon
//               line lifts with an exhaust flash and the slot fills with
//               whatever the launch IS (children)
//   SITE     → pre-launch section (pass `to`)
//   APP      → auction/drop ends widget: compact, shows days, `onFire` hooks
//             your route change; re-arms when `to` changes
//   A11Y     plain-time sr-only mirror, updates once a minute not per second

export type CountdownFlareProps = {
  /** ISO string or ms epoch */
  to: string | number
  title?: React.ReactNode
  lead?: string
  firedLabel?: string
  compact?: boolean
  children?: React.ReactNode
  onFire?: () => void
  className?: string
}

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0")

const DEFAULT_TO = (() => {
  if (typeof window === "undefined") return Date.now() + 7 * 24 * 60 * 60 * 1000
  return Date.now() + 7 * 24 * 60 * 60 * 1000
})()

export function CountdownFlare({ to = DEFAULT_TO, title = "Launch countdown", lead = "Offer begins at zero", firedLabel = "Offer live", compact, children, onFire, className }: CountdownFlareProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const target = typeof to === "number" ? to : Date.parse(to)
  const [now, setNow] = React.useState(() => Date.now())
  const firedRef = React.useRef(false)
  React.useEffect(() => {
    firedRef.current = false
    setNow(Date.now())
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [target])
  const remain = Math.max(0, target - now)
  const fired = remain === 0
  React.useEffect(() => { if (fired && !firedRef.current) { firedRef.current = true; onFire?.() } }, [fired, onFire])
  React.useEffect(() => { if (fired && reduce) onFire?.() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const total = Math.floor(remain / 1000)
  const d = Math.floor(total / 86400)
  const h = d > 0 ? Math.floor((total % 86400) / 3600) : Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const units: [string, string][] = d > 0 ? [["days", pad(d)], ["hrs", pad(h)], ["min", pad(m)], ["sec", pad(s)]] : [["hours", pad(h)], ["minutes", pad(m)], ["seconds", pad(s)]]

  return (
    <section className={cn("relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-flare-bg text-white", compact ? "py-10" : "py-20 sm:py-24", className)}>
      {/* horizon */}
      <motion.span aria-hidden animate={fired && !reduce ? { y: "0%", opacity: 1 } : { y: "100%", opacity: 0.35 }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-x-0 bottom-0 block h-40 bg-gradient-to-t from-[hsl(var(--flare-hot)/0.5)] via-[hsl(var(--flare-hot)/0.12)] to-transparent" />
      <AnimatePresence>
        {fired && !reduce && (
          <motion.span key="flash" aria-hidden initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.9, times: [0, 0.15, 1] }} className="absolute inset-0 bg-white" />
        )}
      </AnimatePresence>

      <div className="relative mx-auto w-full max-w-[900px] px-6 text-center">
        <MonoLabel className={cn(fired ? "text-flare-hot" : "text-white/45")}>{fired ? firedLabel : lead}</MonoLabel>
        {!fired && (
          <>
            {title && <p className="mt-2 font-display text-lg font-semibold tracking-[-0.02em] text-white/85 sm:text-xl">{title}</p>}
            <div className="mt-8 flex items-end justify-center gap-3 sm:gap-5" role="timer" aria-label={units.map(([u, v]) => `${v} ${u}`).join(", ")}>
              {units.map(([u, v]) => <Cell key={u} n={v} label={u} compact={compact} />)}
            </div>
            <p className="sr-only" aria-live="polite" suppressHydrationWarning>{units.map(([u, v]) => `${v} ${u}`).join(" ")} remaining</p>
          </>
        )}
        <AnimatePresence>
          {fired && (
            <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="py-10">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-flare-hot shadow-[0_0_40px_hsl(var(--flare-hot)/0.6)]"><Timer className="size-7 text-black" /></div>
              {title && <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">{title}</h2>}
              <div className="mt-4">{children ?? <p className="text-sm font-medium text-white/60">The launch has cleared the tower — this slot is yours.</p>}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function Cell({ n, label, compact }: { n: string; label: string; compact?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center overflow-hidden rounded-md border border-border bg-flare-panel shadow-sm">
        <span key={n} className={cn("relative block font-display font-semibold tabular-nums text-flare-led", compact ? "px-3 py-2 text-[30px]" : "px-4 py-3 text-[40px] sm:px-6 sm:text-[64px]")} style={{ textShadow: "0 0 22px hsl(var(--flare-hot)/0.5)" }}>
          {n}
          <span className="font-mono text-[9px] align-top opacity-50">{"\u00A0"}</span>
        </span>
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/60" />
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,hsl(var(--background)/0.02)_0_2px,transparent_2px_4px)]" />
      </div>
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">{label}</span>
    </div>
  )
}
