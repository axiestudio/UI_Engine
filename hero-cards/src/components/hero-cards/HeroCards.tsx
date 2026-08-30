import * as React from "react"
import { ArrowRight } from "lucide-react"
import { CornerTicks, Grain, MonoLabel, Ordinal } from "@/components/primitives/handcraft"
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
// Design decisions (hand-tuned):
// · The visual is BUILT, not photographed: three product cards layered at
//   -6°/0°/5° with increasing elevation — it demos the product's own UI using
//   the kit's own tokens. Works with zero assets.
// · The front card carries a progress hairline and ledger rows; hover fans
//   the stack (back cards push out ±10px).
// · Left column: magnetic CTA with hard-offset hover, serif-italic capable
//   headline, mono meta line under the actions.
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
      "absolute inset-x-0 border bg-card p-5 text-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
      ink ? "border-background/20" : "border-border",
      depth === 2 && "-rotate-6 translate-x-[-14px] translate-y-[14px] opacity-60 group-hover:translate-x-[-30px] group-hover:rotate-[-8deg]",
      depth === 1 && "-rotate-2 translate-x-[7px] translate-y-[7px] opacity-80 group-hover:translate-x-[16px] group-hover:rotate-[-1deg]",
      depth === 0 && "rotate-[3deg] shadow-2xl group-hover:rotate-[1deg]",
    )

  return (
    <section className={cn(ink && "bg-foreground", "relative isolate w-full overflow-hidden", className)} aria-label={title}>
      <Grain opacity={ink ? 0.07 : 0.045} />
      <div className="relative mx-auto grid w-full max-w-[1150px] items-center gap-16 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:px-8">
        {/* copy */}
        <div>
          {eyebrow && <MonoLabel className={cn(ink ? "text-background/55" : "text-muted-foreground")}>{eyebrow}</MonoLabel>}
          <h1 className={cn("mt-5 max-w-[15ch] font-display text-[clamp(2.4rem,5.5vw,4rem)] font-black leading-[0.98] tracking-[-0.04em]", ink ? "text-background" : "text-foreground")}>
            {title}
            {titleHighlight && (
              <TextEffect as="span" preset="slide" per="word" delay={0.2} className={cn("block", ink ? "text-background/60" : "text-muted-foreground")}>
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
              <p className={cn("mt-5 max-w-md text-[15px] font-medium leading-[1.75]", ink ? "text-background/60" : "text-muted-foreground")}>
                {subtitle}
              </p>
            </InView>
          )}
          <InView
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            viewOptions={{ once: true, margin: "-60px" }}
          >
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {primaryAction && (
                <Magnetic intensity={0.3} range={70}>
                  <Button
                    size="lg"
                    asChild={Boolean(primaryAction.href)}
                    onClick={primaryAction.onClick}
                    className={cn(
                      "group rounded-none px-7 font-mono text-xs font-bold uppercase tracking-[0.16em] transition-shadow duration-300 hover:shadow-[3px_4px_0_0_currentColor]",
                      ink && "bg-background text-foreground hover:bg-background/90",
                    )}
                  >
                    {primaryAction.href ? (
                      <a href={primaryAction.href} className="inline-flex items-center gap-2">
                        {primaryAction.label}
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        {primaryAction.label}
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    )}
                  </Button>
                </Magnetic>
              )}
              {secondaryAction && (
                <a
                  href={secondaryAction.href ?? "#"}
                  onClick={secondaryAction.onClick}
                  className={cn(
                    "rounded-full font-semibold underline decoration-dotted decoration-2 underline-offset-8 hover:no-underline",
                    ink ? "text-background/70 hover:text-background" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {secondaryAction.label}
                </a>
              )}
            </div>
            <p className={cn("mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em]", ink ? "text-background/40" : "text-muted-foreground/70")}>
              setup in minutes · free while in beta
            </p>
          </InView>
        </div>

        {/* the card stack */}
        <InView
          variants={{ hidden: { opacity: 0, y: 30, rotate: 2 }, visible: { opacity: 1, y: 0, rotate: 0 } }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-80px" }}
        >
          <div className="group relative mx-auto h-[380px] w-full max-w-[380px] sm:h-[420px]">
            {/* back cards */}
            {stack.slice(1, 3).reverse().map((c, idx) => {
              const depth = 2 - idx // render back-most first
              return (
                <div key={c.title} className={cardCls(depth)}>
                  <CardBody card={c} ink={ink} />
                </div>
              )
            })}
            {/* front card */}
            <div className={cn(cardCls(0), "relative")}>
              <CornerTicks size={12} offset={-8} className={cn(ink ? "text-background/40" : "text-foreground/25")} />
              <CardBody card={stack[0]} ink={ink} front />
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
        <p className={cn("font-display text-sm font-extrabold tracking-[-0.01em]", ink ? "text-background" : "text-foreground")}>{card.title}</p>
        {card.badge && (
          <span className={cn("border px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em]", ink ? "border-background/30 text-background/70" : "border-border text-muted-foreground")}>
            {card.badge}
          </span>
        )}
      </div>
      <dl className={cn("mt-3 flex flex-col border-t", ink ? "border-background/10" : "border-border")}>
        {card.rows.map((r) => (
          <div key={r.label} className={cn("flex items-baseline justify-between gap-4 border-b py-2 last:border-b-0", ink ? "border-background/8" : "border-border/70")}>
            <dt className={cn("font-mono text-[9px] font-bold uppercase tracking-[0.18em]", ink ? "text-background/45" : "text-muted-foreground")}>{r.label}</dt>
            <dd className={cn("font-display text-sm font-extrabold tabular-nums", ink ? "text-background" : "text-foreground")}>{r.value}</dd>
          </div>
        ))}
      </dl>
      {typeof card.progress === "number" && (
        <div className="mt-4">
          <div className={cn("flex items-baseline justify-between font-mono text-[9px] font-bold uppercase tracking-[0.18em]", ink ? "text-background/45" : "text-muted-foreground")}>
            <span>goal</span>
            <span className="tabular-nums">{card.progress}%</span>
          </div>
          <div className={cn("mt-1.5 h-[3px] w-full", ink ? "bg-background/15" : "bg-border")}>
            <div className={cn("h-full", ink ? "bg-background" : "bg-foreground")} style={{ width: `${Math.min(100, Math.max(0, card.progress))}%` }} />
          </div>
        </div>
      )}
      {front && (
        <p className={cn("mt-4 flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em]", ink ? "text-background/35" : "text-muted-foreground/60")}>
          <Ordinal n={1} />
          updated just now
        </p>
      )}
    </div>
  )
}
