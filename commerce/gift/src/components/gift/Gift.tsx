import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Magnetic } from "@/components/primitives/magnetic"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Design language ──────────────────────────────────────────────────────────
// JOB: gift a service to someone who isn't in the room — the purchase is
//   for one person, the joy belongs to two.
// EMOTION: generous warmth. Hand-picked, not checkout-adjacent.
// SIGNATURE MOVE: the card FLIPS like real card stock. Front: brand, amount
//   embossed-style. Back: the message written in a serif italic — because
//   gifts explain themselves on the back, in handwriting. Hover on desktop,
//   tap toggle on touch. Reduced motion: front and back shown side by side.
// ─────────────────────────────────────────────────────────────────────────────

export type GiftProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  brand?: string
  amounts?: number[]
  defaultAmount?: number
  /** e.g. "60-minute deep tissue + tea after" */
  includes?: string[]
  message?: string
  messageAuthor?: string
  validNote?: string
  onGift?: (amount: number) => void | Promise<void>
  ctaLabel?: string
  className?: string
}


// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_GIFT_BRAND = "AURUM"
const DEMO_GIFT_AMOUNTS = [590, 890, 1280, 1780]
const DEMO_GIFT_INCLUDES = ["One 60-min treatment, any kind", "Tea & the quiet corner after", "A card that never expires"]

export function Gift({
  eyebrow = "Gift a membership",
  title = "Digital delivery — no shipping required",
  subtitle,
  brand = DEMO_GIFT_BRAND,
  amounts = DEMO_GIFT_AMOUNTS,
  defaultAmount,
  includes = DEMO_GIFT_INCLUDES,
  message,
  messageAuthor,
  validNote = "Delivered as PDF in two minutes · never expires",
  onGift,
  ctaLabel = "Wrap it",
  className,
}: GiftProps) {
  const reduce = useReducedMotion()
  const [flipped, setFlipped] = React.useState(false)
  const [amount, setAmount] = React.useState<number>(defaultAmount ?? amounts[0] ?? 0)
  const showBack = reduce ? true : flipped

  const front = (
    <div className="absolute inset-0 backface-hidden">
      <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => setFlipped((f) => !f)}
          aria-pressed={flipped}
          className="h-full w-full cursor-pointer justify-start text-left"
          aria-label="Flip gift card to read the message"
        >
          <span className="flex h-full w-full flex-col rounded-xl border border-background/10 bg-gradient-to-br from-muted via-muted to-card p-5 text-background shadow-sm">
            <span className="flex items-start justify-between">
              <span className="font-display text-[15px] font-semibold tracking-[-0.02em]">{brand}</span>
              <span aria-hidden className="rounded-md border border-background/25 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.2em] opacity-70">gift card</span>
            </span>
            <span className="mt-auto block font-display text-[38px] font-semibold leading-none tracking-[-0.02em]">{amount.toLocaleString()} kr</span>
            <span className="mt-5 flex items-center justify-between font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-background/55">
              <span>№ 00{String(amount).slice(-2)} · {new Date().getFullYear()}</span>
              <span>{validNote ? "open end · never expires" : ""}</span>
            </span>
          </span>
        </Button>
    </div>
  )

  const back = (
    <div className={cn("absolute inset-0", !reduce && "rotate-y-180 backface-hidden")}>
      <div className="flex h-full w-full flex-col rounded-xl border border-border bg-secondary p-5 text-foreground shadow-sm">
        <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Includes</p>
        <ul className="mt-2 space-y-1">
          {includes.map((l) => (
            <li key={l} className="flex items-baseline gap-2 text-[13px] font-semibold">
              <span aria-hidden>·</span> {l}
            </li>
          ))}
        </ul>
        {message && (
          <>
            <p className="mt-auto pt-4 font-serif text-[15px] italic leading-relaxed tracking-[-0.02em] text-foreground/90">“{message}”</p>
            {messageAuthor && (
              <p className="mt-2 text-right font-serif text-sm italic text-muted-foreground">— {messageAuthor}</p>
            )}
          </>
        )}
      </div>
    </div>
  )

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-background text-foreground", className)} aria-label={title}>
      <InView variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-80px" }}>
        <div className="mx-auto grid w-full max-w-[1080px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
          {/* the card — desktop right on purpose: gifts belong beside the prose */}
          <div className="relative order-first mx-auto w-full max-w-[380px] lg:order-last">
            {reduce ? (
              <div className="relative h-[230px]">
                {front}
                <div className="absolute inset-0 translate-x-6 translate-y-6">{back}</div>
              </div>
            ) : (
              <div className="relative h-[230px]" style={{ perspective: 1200 }}>
                <motion.div
                  className="absolute inset-0 origin-center"
                  animate={{ rotateY: flipped ? -180 : 0 }}
                  transition={{ type: "spring", bounce: 0.22, duration: 0.7 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {front}
                  {back}
                </motion.div>
              </div>
            )}
            <p className="mt-4 hidden text-center font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:block">
              {flipped && !reduce ? "the message — tap to give it back" : "tap the card — the message is on the back"}
            </p>
          </div>

          {/* copy + configurator */}
          <div className="min-w-0">
            {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{eyebrow}</p>}
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">{title}</h2>
            {subtitle && <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-muted-foreground">{subtitle}</p>}

            <div role="radiogroup" aria-label="Gift amount" className="mt-8 flex flex-wrap gap-2">
              {amounts.map((a) => (
                <Button
                  key={a}
                  type="button"
                  role="radio"
                  variant="ghost"
                  size="lg"
                  aria-checked={a === amount}
                  onClick={() => setAmount(a)}
                  className={cn(
                    "h-11 min-w-[88px] rounded-full border px-4 font-display text-sm font-semibold tabular-nums tracking-[-0.02em]",
                    a === amount ? "border-foreground bg-foreground text-background shadow-sm hover:bg-foreground/90" : "bg-card hover:border-foreground/40"
                  )}
                >
                  {a.toLocaleString()} kr
                </Button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Magnetic intensity={0.18} range={60}>
                <Button
                  onClick={() => onGift?.(amount)}
                  className="h-11 rounded-full px-7 font-display text-sm font-semibold tracking-[-0.02em]"
                >
                  {ctaLabel} <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Magnetic>
              <p className="text-[11px] font-medium text-muted-foreground">{validNote}</p>
            </div>
          </div>
        </div>
      </InView>
    </section>
  )
}
