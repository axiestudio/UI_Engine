import * as React from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ── Design language ──────────────────────────────────────────────────────────
// JOB: on mobile, keep the ONE action (book / call / buy) inside the thumb
//   zone for the whole scroll — the hero CTA has left the screen twenty
//   screens ago.
// EMOTION: calm competence. Helpful furniture, never a pop-up.
// SIGNATURE MOVE: the rise happens EXACTLY ONCE — past the hero the bar
//   slides up under the safe-area inset and stays. Scrolling up never
//   hides it (flicker = anxiety). Optionally tucks away only when the page
//   footer (booking form itself) is reached — it retires once its job is done.
// ─────────────────────────────────────────────────────────────────────────────

export type ActionBarProps = {
  /** Primary action, e.g. { label: "Book — from 790 kr", href: "#booking" } */
  action: { label: string; href?: string; onClick?: () => void }
  /** Optional dim/ghost side action. */
  aside?: { label: string; href?: string; onClick?: () => void }
  /** e.g. "Open until 21:00" — small mono note beside the button. */
  note?: string
  /** Scroll px after which the bar appears (≈ hero height). Default 480. */
  appearAfter?: number
  /** Element id (e.g. "booking") whose arrival retires the bar. Optional. */
  retirementId?: string
  /** Show only below this breakpoint. Default true (lg:hidden). */
  mobileOnly?: boolean
  className?: string
}

const DEFAULT_ACTION = { label: "Book a bench visit", href: "#booking" }

export function ActionBar({ action = DEFAULT_ACTION, aside, note, appearAfter = 480, retirementId, mobileOnly = true, className }: ActionBarProps) {
  const reduce = useReducedMotion()
  const [shown, setShown] = React.useState(false)
  const [retired, setRetired] = React.useState(false)
  const { scrollY, scrollYProgress } = useScroll()
  const shownProgress = useTransform(scrollY, (v) => (v > appearAfter ? 1 : 0))

  React.useEffect(() => {
    // RISE ONCE, stay up — the decision is made at the threshold, never revisited.
    const unsub = shownProgress.on("change", (v) => {
      if (v === 1) setShown(true)
    })
    return () => unsub()
  }, [shownProgress])

  React.useEffect(() => {
    if (!retirementId) return
    const el = document.getElementById(retirementId)
    if (!el) return
    const io = new IntersectionObserver(([e]) => setRetired(e.isIntersecting), { rootMargin: "80px 0px" })
    io.observe(el)
    return () => io.disconnect()
  }, [retirementId, scrollYProgress])

  const visible = shown && !retired
  const Btn = action.href
    ? <a href={action.href} onClick={action.onClick} className="relative isolate overflow-hidden flex h-11 flex-1 items-center justify-center rounded-full bg-foreground px-5 font-display text-sm font-extrabold tracking-tight text-background active:scale-[0.98]">{action.label}</a>
    : <Button type="button" onClick={action.onClick} className="h-11 flex-1 rounded-full bg-foreground px-5 font-display text-sm font-extrabold tracking-tight text-background active:scale-[0.98]">{action.label}</Button>

  return (
    <motion.div
      aria-hidden={!visible}
      initial={false}
      animate={reduce ? { opacity: visible ? 1 : 0 } : { y: visible ? 0 : 72 }}
      transition={{ type: "spring", bounce: 0.28, duration: 0.55 }}
      className={cn("absolute bottom-0 z-40 left-[var(--fixed-inset-left,0px)] right-[var(--fixed-inset-right,0px)]", mobileOnly && "lg:hidden", visible ? "" : "pointer-events-none", className)}
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 12px), 12px)" }}
    >
      <div className="mx-auto flex w-full max-w-[560px] items-center gap-2 px-3 py-2.5 ">
        <div className={cn("w-full rounded-[22px] border bg-card/95 p-2 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.35)] transition-opacity", visible ? "opacity-100" : "opacity-0")}>
          <div className="flex items-center gap-2">
            {aside &&
              (aside.href ? (
                <a href={aside.href} onClick={aside.onClick} tabIndex={visible ? 0 : -1} className="flex h-11 shrink-0 items-center justify-center rounded-full border px-4 text-sm font-bold tracking-tight">
                  {aside.label}
                </a>
              ) : (
                <Button type="button" onClick={aside.onClick} tabIndex={visible ? 0 : -1} className="h-11 shrink-0 rounded-full border px-4 text-sm font-bold tracking-tight">
                  {aside.label}
                </Button>
              ))}
            <div tabIndex={visible ? undefined : -1} className="contents">{Btn}</div>
          </div>
          {note && <p className="pb-0.5 pt-1.5 text-center font-mono text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{note}</p>}
        </div>
      </div>
    </motion.div>
  )
}
