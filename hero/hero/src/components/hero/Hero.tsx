import * as React from "react"
import { ArrowRight, Star } from "lucide-react"
import { CornerTicks, Dots, Grain, MonoLabel } from "@/components/primitives/handcraft"
import { GlowEffect } from "@/components/primitives/glow-effect"
import { Magnetic } from "@/components/primitives/magnetic"
import { Spotlight } from "@/components/primitives/spotlight"
import { TextEffect } from "@/components/primitives/text-effect"
import { Button, buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type HeroProof = {
  avatars?: { src?: string; initials?: string; alt?: string }[]
  rating?: number
  ratingLabel?: string
}

export type HeroAction = {
  label: string
  href?: string
  onClick?: () => void
}

export type HeroProps = {
  eyebrow?: string
  /** Leading title part rendered solid. */
  title: string
  /** Second title part — words rise word-by-word; keep it a plain string — pair with Accent via custom JSX if needed. */
  titleHighlight?: string
  subtitle?: string
  primaryAction?: HeroAction
  secondaryAction?: HeroAction
  proof?: HeroProof
  /** split = copy left / visual right; centered = stacked copy. Default split. */
  layout?: "split" | "centered"
  /** Right-side visual for split layout. */
  visual?: React.ReactNode
  tone?: "paper" | "ink"
  className?: string
}

// ── Sub components ───────────────────────────────────────────────────────────

function ProofRow({ proof, ink }: { proof: HeroProof; ink: boolean }) {
  return (
    <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
      {proof.avatars && proof.avatars.length > 0 && (
        <div className="flex -space-x-2.5">
          {proof.avatars.slice(0, 5).map((a, i) => (
            <Avatar key={i} className={cn("size-9 border-2", ink ? "border-background" : "border-background")}>
              {a.src ? <AvatarImage src={a.src} alt={a.alt ?? ""} /> : null}
              <AvatarFallback className={cn("font-mono text-[10px] font-bold", ink ? "bg-background/15 text-background" : "bg-secondary text-foreground")}>
                {a.initials ?? "?"}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      )}
      {typeof proof.rating === "number" && (
        <span className="flex items-center gap-2" aria-label={`Rated ${proof.rating} out of 5`}>
          <span className="flex -space-x-0.5" aria-hidden>
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className={cn("size-3.5", i < Math.round(proof.rating!) ? (ink ? "fill-background text-background" : "fill-foreground text-foreground") : ink ? "text-background/25" : "text-muted-foreground/30")} />
            ))}
          </span>
          <span className={cn("font-mono text-xs font-bold tracking-tight", ink ? "text-background" : "text-foreground")}>{proof.rating.toFixed(1)}</span>
          {proof.ratingLabel && <span className={cn("text-xs font-medium", ink ? "text-background/55" : "text-muted-foreground")}>{proof.ratingLabel}</span>}
        </span>
      )}
    </div>
  )
}

// ── Hero ─────────────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · Copy column is deliberately NARROWER than the visual (5fr/6fr) — the eye
//   should land on the product first, then return to the promise.
// · Grain + dots sit bottom-LEFT only (asymmetry), never full-bleed wash.
// · Headline: solid line 1, then word-by-word rise on line 2 — momentum, not
//   a wall of blur. One <Accent> serif word breaks the grotesk monotony.
// · Primary CTA is magnetic + breathing glow ring; secondary stays quiet.
// · Visual gets corner ticks + sheen + -1.5deg settle — like a pinned print.
export function Hero({
  eyebrow,
  title,
  titleHighlight,
  subtitle,
  primaryAction,
  secondaryAction,
  proof,
  layout = "split",
  visual,
  tone = "paper",
  className,
}: HeroProps) {
  const ink = tone === "ink"

  const copy = (
    <div className={cn("flex flex-col items-start", layout === "centered" && "items-center text-center")}>
      {eyebrow && (
        <MonoLabel className={cn(ink ? "text-background/60" : "text-muted-foreground")}>{eyebrow}</MonoLabel>
      )}
      <h1
        className={cn(
          "mt-6 max-w-[13ch] font-display text-[clamp(2.75rem,7vw,4.75rem)] font-black leading-[0.94] tracking-[-0.045em]",
          ink ? "text-background" : "text-foreground",
        )}
      >
        {title}
        {titleHighlight && (
          <TextEffect as="span" preset="slide" per="word" delay={0.25} speedReveal={1.4} className="mt-1 block">
            {titleHighlight}
          </TextEffect>
        )}
      </h1>
      {subtitle && (
        <p
          className={cn(
            "mt-6 max-w-md text-[15px] font-medium leading-[1.75] sm:text-base",
            ink ? "text-background/65" : "text-muted-foreground",
            layout === "centered" && "mx-auto",
          )}
          style={{ animation: "none" }}
        >
          {subtitle}
        </p>
      )}
      {(primaryAction || secondaryAction) && (
        <div className={cn("mt-9 flex flex-wrap items-center gap-3", layout === "centered" && "justify-center")}>
          {primaryAction &&
            (primaryAction.href ? (
              <Magnetic intensity={0.35} range={80}>
                <a
                  href={primaryAction.href}
                  onClick={primaryAction.onClick}
                  className={cn(buttonVariants({ size: "lg" }), "group relative overflow-hidden rounded-full px-8", ink && "bg-background text-foreground hover:bg-background/90")}
                >
                  <span className="relative z-10 inline-flex items-center gap-2">
                    {primaryAction.label}
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-[110%] bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.35)_50%,transparent_60%)] transition-transform duration-700 ease-out group-hover:translate-x-[110%]"
                  />
                </a>
              </Magnetic>
            ) : (
              <span className="relative inline-flex rounded-full">
                <GlowEffect
                  colors={ink ? ["#ffffff", "#8f8f8f", "#ffffff"] : ["#121212", "#6b6b6b", "#121212"]}
                  mode="breathe"
                  blur="medium"
                  duration={4.5}
                  className="rounded-full opacity-50"
                />
                <Magnetic intensity={0.35} range={80}>
                  <Button size="lg" onClick={primaryAction.onClick} className={cn("group relative overflow-hidden rounded-full px-8", ink && "bg-background text-foreground hover:bg-background/90")}>
                    <span className="relative z-10 inline-flex items-center gap-2">
                      {primaryAction.label}
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -translate-x-[110%] bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.35)_50%,transparent_60%)] transition-transform duration-700 ease-out group-hover:translate-x-[110%]"
                    />
                  </Button>
                </Magnetic>
              </span>
            ))}
          {secondaryAction &&
            (secondaryAction.href ? (
              <a
                href={secondaryAction.href}
                onClick={secondaryAction.onClick}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "rounded-full font-semibold underline decoration-dotted decoration-2 underline-offset-8 hover:no-underline",
                  ink ? "text-background/80 hover:bg-background/5 hover:text-background" : "text-muted-foreground hover:bg-transparent hover:text-foreground",
                )}
              >
                {secondaryAction.label}
              </a>
            ) : (
              <Button
                variant="ghost"
                size="lg"
                onClick={secondaryAction.onClick}
                className={cn(
                  "rounded-full font-semibold underline decoration-dotted decoration-2 underline-offset-8 hover:no-underline",
                  ink ? "text-background/80 hover:bg-background/5 hover:text-background" : "text-muted-foreground hover:bg-transparent hover:text-foreground",
                )}
              >
                {secondaryAction.label}
              </Button>
            ))}
        </div>
      )}
      {proof && <ProofRow proof={proof} ink={ink} />}
    </div>
  )

  return (
    <section className={cn(ink && "bg-foreground", "relative isolate w-full overflow-hidden", className)} aria-label={title}>
      <Grain opacity={ink ? 0.07 : 0.045} />
      {/* dotted field, bottom-left quadrant only — asymmetric on purpose */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -left-8 bottom-0 h-64 w-[46%] [background-image:radial-gradient(circle_at_1px_1px,var(--dot)_1px,transparent_0)] [background-size:22px_22px] opacity-[0.14] [mask-image:radial-gradient(ellipse_at_bottom_left,black_30%,transparent_75%)]",
        )}
        style={{ ["--dot" as string]: ink ? "hsl(0 0% 100%)" : "hsl(0 0% 9%)" }}
      />
      {!ink && <Spotlight size={620} className="bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05),transparent_72%)] blur-2xl" />}

      <div
        className={cn(
          "relative mx-auto grid w-full max-w-[1200px] gap-14 px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-24 lg:grid-cols-[5fr_6fr] lg:items-center lg:gap-20 lg:px-8",
          layout === "centered" && "flex max-w-3xl flex-col items-center text-center lg:grid-cols-1",
        )}
      >
        {copy}
        {layout === "split" && visual && (
          <div className="group relative lg:-mt-2">
            {/* pinned-print settle */}
            <div className="relative -rotate-1 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-0">
              <CornerTicks size={16} offset={-9} className={cn(ink ? "text-background/40" : "text-foreground/30")} />
              {visual}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-[110%] bg-[linear-gradient(105deg,transparent_42%,rgba(255,255,255,0.18)_50%,transparent_58%)] transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[110%]"
              />
            </div>
            {/* offset caption chip — the hand-placed detail */}
            <span
              className={cn(
                "absolute -bottom-4 left-6 inline-flex rotate-1 items-center gap-2 border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] shadow-sm",
                ink ? "border-background/20 bg-background/10 text-background/70" : "border-border bg-card text-muted-foreground",
              )}
            >
              ● live
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
