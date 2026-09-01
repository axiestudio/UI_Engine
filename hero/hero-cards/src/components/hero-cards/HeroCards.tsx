import * as React from "react"
import { ArrowRight, TrendingUp } from "lucide-react"
import { Grain, Ordinal } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"
import { Magnetic } from "@/components/primitives/magnetic"
import { TextEffect } from "@/components/primitives/text-effect"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type StackCard = {
  title: string
  badge?: string
  rows: { label: string; value: string }[]
  /** Optional progress 0–100 rendered as a hairline bar. */
  progress?: number
}

export type HeroCardsProps = {
  eyebrow?: string
  title: string
  titleHighlight?: string
  subtitle?: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
  /** The stacked product cards — defaults to a crafted sample if omitted. */
  cards?: StackCard[]
  tone?: "paper" | "ink"
  className?: string
}

// ── HeroCards ────────────────────────────────────────────────────────────────
// Design decisions (refactored):
// · The visual is still BUILT, not photographed: three product cards layered
//   at -7°/-2°/+3° with soft elevation rings — it demos the product's own UI
//   using the kit's tokens. Zero assets required.
// · Signature kept: hover fans the stack; the front card gains a floating
//   "live delta" sticker (trending pill) so the product feels alive.
// · Cards are proper rounded surfaces now (ring-1 + layered shadow), the
//   ledger rows keep their hairline rhythm, and the CTA pair is the refined
//   shadcn duo with a magnetic primary.
export function HeroCards({
  eyebrow,
  title,
  titleHighlight,
  subtitle,
  primaryAction,
  secondaryAction,
  cards,
  tone = "paper",
  className,
}: HeroCardsProps) {
  const ink = tone === "ink"
  const stack: StackCard[] = cards ?? [
    { title: "Weekly report", badge: "Live", rows: [{ label: "Sessions", value: "1,284" }, { label: "No-shows", value: "2.1%" }], progress: 72 },
    { title: "Bookings", rows: [{ label: "Today", value: "18" }, { label: "This week", value: "96" }] },
    { title: "Revenue", rows: [{ label: "Month", value: "$12.4k" }] },
  ]

  const cardCls = (depth: number) =>
    cn(
      "absolute inset-x-0 rounded-2xl border bg-card p-5 text-left shadow-sm ring-1 ring-foreground/[0.04] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
      ink ? "border-background/20 text-foreground" : "border-border text-foreground",
      depth === 2 && "-rotate-[7deg] translate-x-[-16px] translate-y-[16px] opacity-55 shadow-none group-hover:translate-x-[-34px] group-hover:rotate-[-9deg]",
      depth === 1 && "-rotate-2 translate-x-[8px] translate-y-[8px] opacity-85 shadow-none group-hover:translate-x-[18px] group-hover:rotate-[-1deg]",
      depth === 0 && "rotate-[3deg] shadow-xl group-hover:rotate-[1deg]",
    )

  return (
    <section className={cn(ink && "bg-foreground", "relative isolate w-full overflow-hidden", className)} aria-label={title}>
      <Grain opacity={ink ? 0.06 : 0.04} />

      <div className="relative mx-auto grid w-full max-w-[1150px] items-center gap-16 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:gap-12 lg:px-8">
        {/* copy */}
        <div>
          {eyebrow && (
            <InView
              variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              viewOptions={{ once: true, margin: "-60px" }}
            >
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em]",
                  ink ? "border-background/15 text-background/60" : "border-border text-muted-foreground",
                )}
              >
                <span aria-hidden className="size-[5px] rotate-45 bg-current" />
                {eyebrow}
              </span>
            </InView>
          )}
          <h1
            className={cn(
              "mt-6 max-w-[15ch] font-display text-[clamp(2.4rem,5.5vw,4.1rem)] font-black leading-[0.98] tracking-[-0.04em]",
              ink ? "text-background" : "text-foreground",
            )}
          >
            {title}
            {titleHighlight && (
              <TextEffect as="span" preset="slide" per="word" delay={0.2} className={cn("block", ink ? "text-background/55" : "text-muted-foreground")}>
                {titleHighlight}
              </TextEffect>
            )}
          </h1>
          {subtitle && (
            <InView
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              viewOptions={{ once: true, margin: "-60px" }}
            >
              <p className={cn("mt-6 max-w-[46ch] text-[15px] leading-[1.75]", ink ? "text-background/60" : "text-muted-foreground")}>{subtitle}</p>
            </InView>
          )}
          <InView
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            viewOptions={{ once: true, margin: "-60px" }}
          >
            <div className="mt-9 flex flex-wrap items-center gap-3">
              {primaryAction && (
                <Magnetic intensity={0.25} range={80}>
                  <Button
                    size="lg"
                    asChild={Boolean(primaryAction.href)}
                    onClick={primaryAction.href ? undefined : primaryAction.onClick}
                    className={cn(
                      "group relative h-12 overflow-hidden rounded-full px-8 text-sm font-semibold shadow-sm transition-all duration-300 hover:shadow-md",
                      ink
                        ? "bg-background text-foreground hover:bg-background/90 focus-visible:ring-background/50"
                        : "bg-primary text-primary-foreground hover:bg-primary/90",
                      "motion-reduce:transition-none",
                    )}
                  >
                    {primaryAction.href ? (
                      <a href={primaryAction.href} className="relative z-10 inline-flex items-center gap-2">
                        {primaryAction.label}
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 -translate-x-[110%] bg-[linear-gradient(105deg,transparent_40%,hsl(0_0%_100%/0.25)_50%,transparent_60%)] transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[110%] motion-reduce:hidden"
                        />
                      </a>
                    ) : (
                      <span className="relative z-10 inline-flex items-center gap-2">
                        {primaryAction.label}
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 -translate-x-[110%] bg-[linear-gradient(105deg,transparent_40%,hsl(0_0%_100%/0.25)_50%,transparent_60%)] transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[110%] motion-reduce:hidden"
                        />
                      </span>
                    )}
                  </Button>
                </Magnetic>
              )}
              {secondaryAction && (
                <Button
                  size="lg"
                  variant="ghost"
                  asChild={Boolean(secondaryAction.href)}
                  onClick={secondaryAction.href ? undefined : secondaryAction.onClick}
                  className={cn(
                    "h-12 rounded-full px-6 text-sm font-semibold",
                    ink
                      ? "border border-background/15 text-background/80 hover:bg-background/10 hover:text-background focus-visible:ring-background/50"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {secondaryAction.href ? (
                    <a href={secondaryAction.href} className="inline-flex items-center">{secondaryAction.label}</a>
                  ) : (
                    <span>{secondaryAction.label}</span>
                  )}
                </Button>
              )}
            </div>
            <p className={cn("mt-7 font-mono text-[10px] font-bold uppercase tracking-[0.2em]", ink ? "text-background/40" : "text-muted-foreground/70")}>
              setup in minutes · free while in beta
            </p>
          </InView>
        </div>

        {/* the card stack */}
        <InView
          variants={{ hidden: { opacity: 0, y: 32, rotate: 2 }, visible: { opacity: 1, y: 0, rotate: 0 } }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-80px" }}
        >
          <div className="group relative mx-auto h-[400px] w-full max-w-[400px] sm:h-[440px]">
            {/* back cards */}
            {stack.slice(1, 3).reverse().map((c, idx) => {
              const depth = 2 - idx // render back-most first
              return (
                <div key={c.title} className={cardCls(depth)} aria-hidden={depth === 2 || undefined}>
                  <CardBody card={c} ink={ink} />
                </div>
              )
            })}
            {/* front card */}
            <div className={cn(cardCls(0), "relative")}>
              <CardBody card={stack[0]} ink={ink} front />
              {/* the live-delta sticker */}
              <span
                aria-hidden
                className={cn(
                  "absolute -right-3 -top-3 flex rotate-3 items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] shadow-md backdrop-blur",
                  ink ? "border-background/20 bg-background text-foreground" : "border-border bg-background text-foreground",
                )}
              >
                <TrendingUp className="size-3" />
                +18% this week
              </span>
            </div>
          </div>
        </InView>
      </div>
    </section>
  )
}

function CardBody({ card, ink, front = false }: { card: StackCard; ink: boolean; front?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-sm font-extrabold tracking-[-0.01em]">{card.title}</p>
        {card.badge && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em]",
              ink ? "border-background/25 text-foreground/70" : "border-border text-muted-foreground",
            )}
          >
            <span aria-hidden className="size-1 rounded-full bg-current" />
            {card.badge}
          </span>
        )}
      </div>
      <dl className={cn("mt-3 flex flex-col border-t", ink ? "border-background/10" : "border-border")}>
        {card.rows.map((r) => (
          <div key={r.label} className={cn("flex items-baseline justify-between gap-4 border-b py-2.5 last:border-b-0", ink ? "border-background/[0.08]" : "border-border/60")}>
            <dt className={cn("font-mono text-[9px] font-bold uppercase tracking-[0.18em]", ink ? "text-foreground/50" : "text-muted-foreground")}>{r.label}</dt>
            <dd className="font-display text-sm font-extrabold tabular-nums">{r.value}</dd>
          </div>
        ))}
      </dl>
      {typeof card.progress === "number" && (
        <div className="mt-4">
          <div className={cn("flex items-baseline justify-between font-mono text-[9px] font-bold uppercase tracking-[0.18em]", ink ? "text-foreground/50" : "text-muted-foreground")}>
            <span>goal</span>
            <span className="tabular-nums">{card.progress}%</span>
          </div>
          <div className={cn("mt-2 h-1.5 w-full overflow-hidden rounded-full", ink ? "bg-background/15" : "bg-border")}>
            <div
              className={cn("h-full rounded-full transition-[width] duration-700 ease-out", ink ? "bg-background" : "bg-foreground")}
              style={{ width: `${Math.min(100, Math.max(0, card.progress))}%` }}
            />
          </div>
        </div>
      )}
      {front && (
        <p className={cn("mt-4 flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em]", ink ? "text-foreground/40" : "text-muted-foreground/70")}>
          <Ordinal n={1} />
          updated just now
        </p>
      )}
    </div>
  )
}
