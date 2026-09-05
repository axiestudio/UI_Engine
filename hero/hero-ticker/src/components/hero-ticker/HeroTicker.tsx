import * as React from "react"
import { ArrowRight } from "lucide-react"
import { Grain } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"
import { TextLoop } from "@/components/primitives/text-loop"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type HeroTickerProps = {
  eyebrow?: string
  /** Headline start, e.g. "Build" — the rotating word follows it. */
  title: string
  /** Words that rotate inside the headline, e.g. ["websites", "apps", "stores"]. */
  rotating?: string[]
  /** Headline tail after the rotating word, e.g. "faster". */
  titleTail?: string
  subtitle?: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
  /** Ticker base strip items. */
  ticker?: string[]
  tone?: "paper" | "ink"
  className?: string
}

// ── HeroTicker ───────────────────────────────────────────────────────────────
// Design decisions (refactored):
// · One kinetic idea, kept: the headline never sits still — a TextLoop word
//   flips every 2.4s inside it. The word now sits in a soft "slot" (rounded
//   highlight) so the motion reads as a UI state change, not a gimmick.
// · The base ticker doubles as social proof: dashed top rule, ◆ separators,
//   gradient edge dissolve, pause on hover, frozen for reduced-motion users.
// · CTAs upgraded to the proper shadcn pair; everything else stays still so
//   the motion has nowhere to hide.

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_HERO_TICKER_ROTATING = ["booking pages", "client apps", "gift cards", "intake forms"]
const DEMO_HERO_TICKER_EYEBROW = "Aurum platform"
const DEMO_HERO_TICKER_TAIL = "in minutes."
const DEMO_HERO_TICKER_SUBTITLE = "Start from a template or compose your own \u2014 everything ships responsive, accessible and on-brand."
const DEMO_HERO_TICKER_PRIMARY_ACTION = { label: "Start building", href: "#" }
const DEMO_HERO_TICKER_SECONDARY_ACTION = { label: "See examples", href: "#" }
const DEMO_HERO_TICKER_TICKER = ["No code required", "Own your data", "WCAG AA", "Loves reduced motion", "Real-time sync"]


export function HeroTicker({
  eyebrow = DEMO_HERO_TICKER_EYEBROW,
  title = "Build",
  rotating = DEMO_HERO_TICKER_ROTATING,
  titleTail = DEMO_HERO_TICKER_TAIL,
  subtitle = DEMO_HERO_TICKER_SUBTITLE,
  primaryAction = DEMO_HERO_TICKER_PRIMARY_ACTION,
  secondaryAction = DEMO_HERO_TICKER_SECONDARY_ACTION,
  ticker = DEMO_HERO_TICKER_TICKER,
  tone = "paper",
  className,
}: HeroTickerProps) {
  const ink = tone === "ink"

  return (
    <section
      className={cn(ink && "bg-foreground", "relative isolate flex w-full flex-col overflow-hidden", className)}
      aria-label={title}
    >
      <Grain opacity={ink ? 0.06 : 0.04} />

      <div className="relative mx-auto flex w-full max-w-[1100px] flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6 sm:py-32">
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
            "mt-8 font-display text-[clamp(2.5rem,6.5vw,5.25rem)] font-black leading-[1.04] tracking-[-0.045em]",
            ink ? "text-background" : "text-foreground",
          )}
        >
          <span className="block">{title}</span>
          <span className={cn("block", ink ? "text-background/55" : "text-muted-foreground")}>
            <span className="inline-flex flex-wrap items-baseline justify-center gap-x-[0.26em] gap-y-2">
              <TextLoop
                interval={2.4}
                className={cn(
                  "inline-block rounded-xl px-[0.22em] align-baseline",
                  ink ? "bg-background/10" : "bg-secondary",
                )}
                variants={{
                  initial: { y: "110%", opacity: 0 },
                  animate: { y: "0%", opacity: 1 },
                  exit: { y: "-110%", opacity: 0 },
                }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              >
                {rotating.map((word) => (
                  <span key={word} className={cn("inline-block", ink ? "text-background" : "text-foreground")}>
                    {word}
                  </span>
                ))}
              </TextLoop>
              {titleTail && <span>{titleTail}</span>}
            </span>
          </span>
        </h1>

        {subtitle && (
          <InView
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            viewOptions={{ once: true, margin: "-60px" }}
          >
            <p className={cn("mx-auto mt-7 max-w-[48ch] text-[15px] leading-[1.75]", ink ? "text-background/60" : "text-muted-foreground")}>
              {subtitle}
            </p>
          </InView>
        )}

        <InView
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-60px" }}
        >
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {primaryAction && (
              <Button
                size="lg"
                asChild={Boolean(primaryAction.href)}
                onClick={primaryAction.href ? undefined : primaryAction.onClick}
                className={cn(
                  "group relative h-12 overflow-hidden rounded-full px-8 text-sm font-semibold shadow-sm transition-all duration-300 hover:shadow-md motion-reduce:transition-none",
                  ink
                    ? "bg-background text-foreground hover:bg-background/90 focus-visible:ring-background/50"
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
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
        </InView>
      </div>

      {/* ticker base — the proof strip */}
      {ticker.length > 0 && (
        <InView variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.6, delay: 0.3 }} viewOptions={{ once: true }}>
          <div className={cn("relative border-t border-dashed py-4", ink ? "border-background/15" : "border-border")}>
            <div className="group relative flex overflow-hidden">
              <div
                className="ui-ticker-track flex w-max shrink-0 items-center motion-reduce:[animation:none]"
                style={{ animation: "ui-ticker-scroll 30s linear infinite" }}
              >
                {[0, 1].map((copy) => (
                  <span key={copy} aria-hidden={copy === 1 || undefined} className={cn("flex items-center", ink ? "text-background/40" : "text-muted-foreground/90")}>
                    {ticker.map((t, i) => (
                      <span key={i} className="flex items-center gap-7 whitespace-nowrap pr-7 font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
                        {t}
                        <span aria-hidden className="text-[8px] opacity-40">◆</span>
                      </span>
                    ))}
                  </span>
                ))}
              </div>
              {/* edge dissolve */}
              <span aria-hidden className={cn("pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r", ink ? "from-foreground" : "from-background")} />
              <span aria-hidden className={cn("pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l", ink ? "from-foreground" : "from-background")} />
            </div>
            <style>{`
              @keyframes ui-ticker-scroll {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
              }
              .group:hover .ui-ticker-track { animation-play-state: paused; }
              @media (prefers-reduced-motion: reduce) {
                .ui-ticker-track { animation: none !important; }
              }
            `}</style>
          </div>
        </InView>
      )}
    </section>
  )
}
