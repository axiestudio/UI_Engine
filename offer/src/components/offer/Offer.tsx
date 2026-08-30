import * as React from "react"
import { useReducedMotion } from "motion/react"
import { SlidingNumber } from "@/components/primitives/sliding-number"
import { Spotlight } from "@/components/primitives/spotlight"
import { InView } from "@/components/primitives/in-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Design language ──────────────────────────────────────────────────────────
// JOB: make a real offer legible in one glance — what's off, until when,
//   what to do. Scarcity earns trust only when it's *checkable*.
// EMOTION: a raised eyebrow, not a shouting banner.
// SIGNATURE MOVE: the deadline as a FLIP-CLOCK — four mono digits sliding
//   through days/hours/minutes/seconds (mp SlidingNumber), ticking in real
//   time. Nothing says "this week only" like watching it become untrue.
// TYPE: offer name in display black; countdown digits in mono black with
//   hairline labels between units.
// ─────────────────────────────────────────────────────────────────────────────

export type OfferProps = {
  badge?: string
  title: string
  description?: string
  /** ISO datetime or Date — the countdown target. Past → sold-out state. */
  until: string | Date
  price?: { from?: number | string; to?: number | string; unit?: string }
  cta: { label: string; href?: string; onClick?: () => void }
  /** Expired copy. Default honest "This one's gone." — don't fake a dead offer. */
  expiredLabel?: string
  className?: string
}


function Unit({ n, label, reduced }: { n: number; label: string; reduced: boolean | null }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-3xl font-black leading-none tabular-nums tracking-tighter sm:text-4xl">
        {reduced ? String(n).padStart(2, "0") : <SlidingNumber value={n} padStart />}
      </span>
      <span aria-hidden className="mt-1.5 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

function Countdown({ until, reduced }: { until: number; reduced: boolean | null }) {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  const left = Math.max(0, until - now)
  const d = Math.floor(left / 86400000)
  const h = Math.floor((left % 86400000) / 3600000)
  const m = Math.floor((left % 3600000) / 60000)
  const s = Math.floor((left % 60000) / 1000)
  if (reduced) {
    return (
      <p className="font-mono text-sm font-bold tabular-nums uppercase tracking-widest">
        closes in {d}d {h}h {m}m {s}s
      </p>
    )
  }
  return (
    <div className="flex items-end gap-3 sm:gap-4" aria-label={`Offer closes in ${d} days, ${h} hours, ${m} minutes, ${s} seconds`} role="timer">
      <Unit n={d} label="days" reduced={!!reduced} />
      <span aria-hidden className="pb-5 font-mono text-2xl text-muted-foreground/40">:</span>
      <Unit n={h} label="hrs" reduced={!!reduced} />
      <span aria-hidden className="pb-5 font-mono text-2xl text-muted-foreground/40">:</span>
      <Unit n={m} label="min" reduced={!!reduced} />
      <span aria-hidden className="pb-5 font-mono text-2xl text-muted-foreground/40">:</span>
      <Unit n={s} label="sec" reduced={!!reduced} />
    </div>
  )
}

export function Offer({ badge = "This week only", title, description, until, price, cta, expiredLabel = "This one's gone — next offer lands with the season.", className }: OfferProps) {
  const reduce = useReducedMotion()
  const target = React.useMemo(() => (until instanceof Date ? until.getTime() : new Date(until).getTime()), [until])
  const [gone, setGone] = React.useState(() => Date.now() >= target)
  React.useEffect(() => {
    if (gone) return
    const t = window.setTimeout(() => setGone(true), Math.max(0, target - Date.now()) + 500)
    return () => window.clearTimeout(t)
  }, [target, gone])

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-label={gone ? "Offer expired" : title}>
      <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
        <div className="mx-auto w-full max-w-[860px] px-4 py-14 sm:px-6">
          <div className="relative overflow-hidden rounded-[28px] border bg-foreground p-6 text-background shadow-lg sm:p-10">
            {!gone && <Spotlight size={420} className="opacity-40" />}
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-md">
                {badge && !gone && (
                  <span className="inline-flex items-center rounded-full bg-background/15 px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-[0.2em] ring-1 ring-background/25">
                    {badge}
                  </span>
                )}
                <h2 className="mt-4 font-display text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl">{title}</h2>
                {description && <p className="mt-2 max-w-sm text-sm font-medium leading-relaxed text-background/75">{description}</p>}
                {price && (
                  <p className="mt-5 flex items-baseline gap-3">
                    <s className="font-mono text-sm text-background/45">{String(price.from)}</s>
                    <span className="font-display text-3xl font-black tabular-nums">{String(price.to)}</span>
                    {price.unit && <span className="font-mono text-[10px] font-black uppercase tracking-widest text-background/60">{price.unit}</span>}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-6">
                {gone ? (
                  <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-background/70">{expiredLabel}</p>
                ) : (
                  <div className="text-background">
                    <Countdown until={target} reduced={reduce} />
                  </div>
                )}
                <div>
                  {cta.href ? (
                    <Button asChild disabled={gone} variant="secondary" size="lg" className="h-12 rounded-full px-8 font-display text-sm font-extrabold tracking-tight">
                      <a href={cta.href} aria-disabled={gone}>{cta.label}</a>
                    </Button>
                  ) : (
                    <Button disabled={gone} onClick={cta.onClick} variant="secondary" size="lg" className="h-12 rounded-full px-8 font-display text-sm font-extrabold tracking-tight">
                      {cta.label}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </InView>
    </section>
  )
}
