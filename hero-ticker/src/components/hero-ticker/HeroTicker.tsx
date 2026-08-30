import * as React from "react"
import { ArrowRight } from "lucide-react"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"
import { TextLoop } from "@/components/primitives/text-loop"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type HeroTickerProps = {
  eyebrow?: string
  /** Headline start, e.g. "Build" — the rotating word follows it. */
  title: string
  /** Words that rotate inside the headline, e.g. ["websites", "apps", "stores"]. */
  rotating: string[]
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
// Design decisions (hand-tuned):
// · One kinetic idea: the headline never sits still — a TextLoop word flips
//   every 2.4s inside it, framed by fixed words. The rest of the hero is
//   completely static so the motion has nowhere to hide.
// · The ticker base strip (dashed top rule, 26s loop, pause on hover) doubles
//   as social proof — it's the footer of the hero, not a decoration.
export function HeroTicker({
  eyebrow,
  title = "Build",
  rotating,
  titleTail,
  subtitle,
  primaryAction,
  secondaryAction,
  ticker = [],
  tone = "paper",
  className,
}: HeroTickerProps) {
  const ink = tone === "ink"

  return (
    <section className={cn(ink && "bg-foreground", "relative isolate flex w-full flex-col overflow-hidden", className)} aria-label={title}>
      <Grain opacity={ink ? 0.07 : 0.045} />
      <div className="relative mx-auto flex w-full max-w-[1100px] flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6 sm:py-32">
        {eyebrow && <MonoLabel className={cn(ink ? "text-background/55" : "text-muted-foreground")}>{eyebrow}</MonoLabel>}

        <h1 className={cn("mt-7 font-display text-[clamp(2.6rem,7vw,5.5rem)] font-black leading-[0.98] tracking-[-0.045em]", ink ? "text-background" : "text-foreground")}>
          <span className="block">{title}</span>
          <span className={cn("block", ink ? "text-background/60" : "text-muted-foreground")}>
            <span className="inline-flex items-baseline justify-center gap-[0.28em]">
              <TextLoop
                interval={2.4}
                className={cn("inline-block", ink ? "text-background" : "text-foreground")}
                variants={{
                  enter: { y: "110%", opacity: 0 },
                  center: { y: "0%", opacity: 1 },
                  exit: { y: "-110%", opacity: 0 },
                }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {rotating.map((word) => (
                  <span key={word} className="inline-block underline decoration-dotted decoration-[3px] underline-offset-[0.14em]">
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
            <p className={cn("mx-auto mt-6 max-w-md text-[15px] font-medium leading-[1.75]", ink ? "text-background/60" : "text-muted-foreground")}>
              {subtitle}
            </p>
          </InView>
        )}

        <InView
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-60px" }}
        >
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {primaryAction && (
              <Button
                size="lg"
                asChild={Boolean(primaryAction.href)}
                onClick={primaryAction.onClick}
                className={cn("group rounded-none px-7 font-mono text-xs font-bold uppercase tracking-[0.16em] transition-shadow duration-300 hover:shadow-[3px_4px_0_0_currentColor]", ink && "bg-background text-foreground hover:bg-background/90")}
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
        </InView>
      </div>

      {/* ticker base — the proof strip */}
      {ticker.length > 0 && (
        <InView variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.6, delay: 0.3 }} viewOptions={{ once: true }}>
          <div className={cn("relative border-t border-dashed py-4", ink ? "border-background/15" : "border-border")}>
            <div className="group flex overflow-hidden">
              <div
                className="ui-ticker-track flex w-max shrink-0 items-center motion-reduce:[animation:none]"
                style={{ animation: "ui-ticker-scroll 26s linear infinite" }}
              >
                {[0, 1].map((copy) => (
                  <span key={copy} aria-hidden={copy === 1 || undefined} className={cn("flex items-center", ink ? "text-background/45" : "text-muted-foreground")}>
                    {ticker.map((t, i) => (
                      <span key={i} className="flex items-center gap-6 whitespace-nowrap pr-6 font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
                        {t}
                        <span aria-hidden className="text-[8px] opacity-50">◆</span>
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            </div>
            <style>{`
              @keyframes ui-ticker-scroll {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
              }
              .group:hover .ui-ticker-track { animation-play-state: paused; }
            `}</style>
          </div>
        </InView>
      )}
    </section>
  )
}
