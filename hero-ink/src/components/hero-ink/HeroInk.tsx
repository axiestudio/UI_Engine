import * as React from "react"
import { ArrowRight } from "lucide-react"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { GlowEffect } from "@/components/primitives/glow-effect"
import { InView } from "@/components/primitives/in-view"
import { TextEffect } from "@/components/primitives/text-effect"
import { Button, buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type HeroInkProps = {
  eyebrow?: string
  title: string
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
// Design decisions (hand-tuned):
// · Always ink (forced dark band) — this hero is the moody one in the family.
// · Signature: a breathing GLOW ORB anchored behind the headline's left edge
//   (asymmetric, not centered) + corner ticks at the four section corners —
//   the whole viewport becomes a framed plate.
// · A coordinates strip runs along the bottom edge (mono, spaced dots) — the
//   "you are here" detail.
export function HeroInk({
  eyebrow,
  title,
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
      <Grain opacity={0.08} />
      {/* asymmetric dotted field — right side only */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-full w-1/2 [background-image:radial-gradient(circle_at_1px_1px,hsl(0_0%_100%)_1px,transparent_0)] [background-size:22px_22px] opacity-[0.1] [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_70%)]"
      />
      {/* the glow orb — anchored off-left behind the headline */}
      <span aria-hidden className="pointer-events-none absolute -left-40 top-1/3 size-[560px] opacity-40">
        <GlowEffect
          colors={["#ffffff", "#737373", "#ffffff"]}
          mode="breathe"
          blur="strongest"
          duration={6}
          className="rounded-full"
        />
      </span>

      {/* corner ticks at the four section corners */}
      <span aria-hidden className="pointer-events-none absolute inset-0 text-background/50">
        <span className="absolute left-5 top-5 size-4 border-l-2 border-t-2 border-current" />
        <span className="absolute right-5 top-5 size-4 border-r-2 border-t-2 border-current" />
        <span className="absolute bottom-5 left-5 size-4 border-b-2 border-l-2 border-current" />
        <span className="absolute bottom-5 right-5 size-4 border-b-2 border-r-2 border-current" />
      </span>

      <div className="relative mx-auto flex w-full max-w-[1000px] flex-col items-start px-10 py-28 sm:px-14">
        {eyebrow && <MonoLabel className="text-background/55">{eyebrow}</MonoLabel>}

        <h1 className="mt-6 max-w-[16ch] font-display text-[clamp(2.6rem,6.5vw,5rem)] font-black leading-[0.95] tracking-[-0.05em] text-background">
          {title}
          {titleHighlight && (
            <TextEffect as="span" preset="blur" per="word" delay={0.2} className="block text-background/55">
              {titleHighlight}
            </TextEffect>
          )}
        </h1>

        {subtitle && (
          <InView
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            viewOptions={{ once: true, margin: "-60px" }}
          >
            <p className="mt-6 max-w-md text-[15px] font-medium leading-[1.75] text-background/60">
              {subtitle}
            </p>
          </InView>
        )}

        <InView
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-60px" }}
        >
          <div className="mt-9 flex flex-wrap items-center gap-3">
            {primaryAction && (
              <Button
                size="lg"
                asChild={Boolean(primaryAction.href)}
                onClick={primaryAction.onClick}
                className="group relative overflow-hidden rounded-none px-7 font-mono text-xs font-bold uppercase tracking-[0.16em]"
              >
                {primaryAction.href ? (
                  <a href={primaryAction.href} className="relative z-10 inline-flex items-center gap-2">
                    {primaryAction.label}
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                ) : (
                  <span className="relative z-10 inline-flex items-center gap-2">
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
                className="rounded-full font-semibold text-background/70 underline decoration-dotted decoration-2 underline-offset-8 transition-colors hover:text-background hover:no-underline"
              >
                {secondaryAction.label}
              </a>
            )}
          </div>

          {proof && (
            <div className="mt-8 flex items-center gap-3">
              {proof.avatars && proof.avatars.length > 0 && (
                <span className="flex -space-x-2">
                  {proof.avatars.slice(0, 5).map((a, i) => (
                    <Avatar key={i} className="size-7 border-2 border-foreground">
                      <AvatarFallback className="bg-background/15 font-mono text-[8px] font-bold text-background">
                        {a.initials ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </span>
              )}
              {proof.label && <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-background/50">{proof.label}</span>}
            </div>
          )}
        </InView>
      </div>

      {/* coordinates strip */}
      <div className="absolute inset-x-0 bottom-0 border-t border-background/10">
        <div className="mx-auto flex h-9 w-full max-w-[1100px] items-center justify-between px-10 font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-background/35 sm:px-14">
          {strip.map((s, i) => (
            <React.Fragment key={i}>
              <span>{s}</span>
              {i < strip.length - 1 && <span aria-hidden className="size-1 rotate-45 bg-background/30" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
