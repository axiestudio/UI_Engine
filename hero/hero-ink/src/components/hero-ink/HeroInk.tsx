import * as React from "react"
import { ArrowRight, Star } from "lucide-react"
import { Grain } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"
import { TextEffect } from "@/components/primitives/text-effect"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type HeroInkProps = {
  eyebrow?: string
  title?: string
  titleHighlight?: string
  subtitle?: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
  proof?: { avatars?: { initials?: string }[]; label?: string }
  /** Mono strip items along the bottom, e.g. coordinates or guarantees. */
  strip?: string[]
  fullPage?: boolean
  className?: string
}

// ── HeroInk ──────────────────────────────────────────────────────────────────
// Design decisions (refactored):
// · The forced-ink band stays, but the mood shifts from brutalist plate to a
//   lit stage: a soft aurora bloom low-left, a hairline grid fading out from
//   the top-right, and a faint top sheen — depth instead of noise.
// · Eyebrow upgrades to a beta-badge pill (pulsing dot, hairline ring) so the
//   first read is "product", not "poster".
// · Signature kept: corner ticks + the coordinates strip — now quieter, with
//   diamond separators and a proper hairline above.

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_HERO_INK_TITLE = "The quiet way"


export function HeroInk({
  eyebrow,
  title = DEMO_HERO_INK_TITLE,
  titleHighlight,
  subtitle,
  primaryAction,
  secondaryAction,
  proof,
  strip = ["no credit card", "5-minute setup", "cancel anytime"],
  fullPage = true,
  className,
}: HeroInkProps) {
  return (
    <section
      className={cn("relative isolate flex w-full items-center overflow-hidden bg-foreground", fullPage && "min-h-svh", className)}
      aria-label={title}
    >
      <Grain opacity={0.06} />

      {/* hairline grid, fading out from the top-right */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,hsl(0_0%_100%)_1px,transparent_0),linear-gradient(to_bottom,hsl(0_0%_100%)_1px,transparent_0)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_60%_50%_at_78%_0%,black_30%,transparent_75%)]"
      />
      {/* aurora bloom — low-left, breathing through CSS only */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-48 bottom-[-30%] size-[720px] rounded-full bg-[radial-gradient(circle_at_center,hsl(0_0%_100%/0.09),transparent_65%)] blur-2xl motion-safe:animate-pulse [animation-duration:7s]"
      />
      {/* top sheen */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-background/25 to-transparent" />

      {/* corner ticks — the framed-plate signature, now hairline */}
      <span aria-hidden className="pointer-events-none absolute inset-0 text-background/35">
        <span className="absolute left-6 top-6 size-3.5 border-l border-t border-current" />
        <span className="absolute right-6 top-6 size-3.5 border-r border-t border-current" />
        <span className="absolute bottom-12 left-6 size-3.5 border-b border-l border-current" />
        <span className="absolute bottom-12 right-6 size-3.5 border-b border-r border-current" />
      </span>

      <div className="relative mx-auto flex w-full max-w-[1020px] flex-col items-start px-6 py-28 pb-44 sm:px-10 sm:py-32">
        {eyebrow && (
          <InView
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            viewOptions={{ once: true, margin: "-60px" }}
          >
            <span className="inline-flex items-center gap-2.5 rounded-full border border-background/15 bg-background/[0.04] py-1.5 pl-3 pr-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-background/70">
              <span aria-hidden className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-background/60 motion-reduce:hidden" />
                <span className="relative inline-flex size-1.5 rounded-full bg-background" />
              </span>
              {eyebrow}
            </span>
          </InView>
        )}

        <h1 className="mt-7 max-w-[15ch] font-display text-[clamp(2.7rem,6.5vw,5.2rem)] font-black leading-[0.94] tracking-[-0.05em] text-background">
          <TextEffect as="span" preset="blur" per="word" delay={0.1}>
            {title}
          </TextEffect>
          {titleHighlight && (
            <TextEffect as="span" preset="blur" per="word" delay={0.25} className="block text-background/50">
              {titleHighlight}
            </TextEffect>
          )}
        </h1>

        {subtitle && (
          <InView
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.55, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            viewOptions={{ once: true, margin: "-60px" }}
          >
            <p className="mt-6 max-w-[44ch] text-base leading-[1.75] text-background/60">{subtitle}</p>
          </InView>
        )}

        <InView
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-60px" }}
        >
          <div className="mt-9 flex flex-wrap items-center gap-3">
            {primaryAction && (
              <Button
                size="lg"
                asChild={Boolean(primaryAction.href)}
                onClick={primaryAction.href ? undefined : primaryAction.onClick}
                className="group relative h-12 overflow-hidden rounded-full bg-background px-7 text-sm font-semibold text-foreground shadow-[0_8px_30px_-8px_hsl(0_0%_100%/0.35)] transition-all duration-300 hover:bg-background/90 hover:shadow-[0_12px_40px_-8px_hsl(0_0%_100%/0.45)] focus-visible:ring-background/50 motion-reduce:transition-none"
              >
                {/* single slotted child — sheen rides inside it */}
                {primaryAction.href ? (
                  <a href={primaryAction.href} className="relative z-10 inline-flex items-center gap-2">
                    {primaryAction.label}
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -translate-x-[110%] bg-[linear-gradient(105deg,transparent_40%,hsl(0_0%_100%/0.35)_50%,transparent_60%)] transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[110%] motion-reduce:hidden"
                    />
                  </a>
                ) : (
                  <span className="relative z-10 inline-flex items-center gap-2">
                    {primaryAction.label}
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -translate-x-[110%] bg-[linear-gradient(105deg,transparent_40%,hsl(0_0%_100%/0.35)_50%,transparent_60%)] transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[110%] motion-reduce:hidden"
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
                className="h-12 rounded-full border border-background/15 px-6 text-sm font-semibold text-background/80 hover:bg-background/10 hover:text-background focus-visible:ring-background/50"
              >
                {secondaryAction.href ? (
                  <a href={secondaryAction.href} className="inline-flex items-center">{secondaryAction.label}</a>
                ) : (
                  <span>{secondaryAction.label}</span>
                )}
              </Button>
            )}
          </div>

          {proof && (
            <div className="mt-9 flex items-center gap-3.5">
              {proof.avatars && proof.avatars.length > 0 && (
                <span className="flex -space-x-2.5">
                  {proof.avatars.slice(0, 5).map((a, i) => (
                    <Avatar key={i} className="size-8 ring-2 ring-foreground">
                      <AvatarFallback className="bg-background/15 font-mono text-[9px] font-bold text-background">
                        {a.initials ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </span>
              )}
              {proof.label && (
                <span className="flex flex-col gap-1">
                  <span aria-hidden className="flex gap-0.5 text-background">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3 fill-current" />
                    ))}
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-background/50">{proof.label}</span>
                </span>
              )}
            </div>
          )}
        </InView>
      </div>

      {/* coordinates strip — the "you are here" detail */}
      <div className="absolute inset-x-0 bottom-0 border-t border-background/10 bg-foreground/85">
        <div className="mx-auto flex h-11 w-full max-w-[1100px] items-center justify-between gap-4 overflow-x-auto px-6 font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-background/40 sm:px-10">
          {strip.map((s, i) => (
            <React.Fragment key={i}>
              <span className="whitespace-nowrap">{s}</span>
              {i < strip.length - 1 && <span aria-hidden className="size-1 shrink-0 rotate-45 bg-background/30" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
