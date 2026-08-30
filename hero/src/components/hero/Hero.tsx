import * as React from "react"
import { ArrowRight, Star } from "lucide-react"
import { GlowEffect } from "@/components/primitives/glow-effect"
import { InView } from "@/components/primitives/in-view"
import { Spotlight } from "@/components/primitives/spotlight"
import { TextEffect } from "@/components/primitives/text-effect"
import { Button, buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type HeroProof = {
  /** Up to ~5 avatar images; initials fallback when omitted. */
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
  /** Second title part rendered with per-word blur reveal. */
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
    <div className="mt-8 flex flex-wrap items-center gap-4">
      {proof.avatars && proof.avatars.length > 0 && (
        <div className="flex -space-x-2.5">
          {proof.avatars.slice(0, 5).map((a, i) => (
            <Avatar key={i} className={cn("size-9 border-2", ink ? "border-background" : "border-background")}>
              {a.src ? <AvatarImage src={a.src} alt={a.alt ?? ""} /> : null}
              <AvatarFallback className={cn("text-[10px] font-bold", ink ? "bg-background/15 text-background" : "bg-secondary text-foreground")}>
                {a.initials ?? "?"}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      )}
      {typeof proof.rating === "number" && (
        <span className="flex items-center gap-1.5" aria-label={`Rated ${proof.rating} out of 5`}>
          <span className="flex" aria-hidden>
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className={cn("size-3.5", i < Math.round(proof.rating!) ? (ink ? "fill-background text-background" : "fill-foreground text-foreground") : ink ? "text-background/25" : "text-muted-foreground/30")} />
            ))}
          </span>
          <span className={cn("text-sm font-bold", ink ? "text-background" : "text-foreground")}>{proof.rating.toFixed(1)}</span>
          {proof.ratingLabel && <span className={cn("text-sm font-medium", ink ? "text-background/60" : "text-muted-foreground")}>{proof.ratingLabel}</span>}
        </span>
      )}
    </div>
  )
}

// ── Hero ─────────────────────────────────────────────────────────────────────

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
        <Badge
          variant="outline"
          className={cn(
            "rounded-full border px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest",
            ink ? "border-background/25 bg-transparent text-background/80" : "bg-secondary text-muted-foreground",
          )}
        >
          {eyebrow}
        </Badge>
      )}
      <h1 className={cn("mt-5 max-w-3xl font-display text-4xl font-black leading-[0.95] tracking-[-0.04em] sm:text-5xl lg:text-6xl", ink ? "text-background" : "text-foreground")}>
        {title}
        {titleHighlight && (
          <TextEffect as="span" preset="blur" per="word" delay={0.15} className={cn("block", ink ? "text-background/60" : "text-muted-foreground")}>
            {titleHighlight}
          </TextEffect>
        )}
      </h1>
      {subtitle && (
        <InView
          variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-60px" }}
        >
          <p className={cn("mt-5 max-w-xl text-base font-medium leading-relaxed sm:text-lg", ink ? "text-background/70" : "text-muted-foreground")}>
            {subtitle}
          </p>
        </InView>
      )}
      {(primaryAction || secondaryAction) && (
        <InView
          variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-60px" }}
        >
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {primaryAction &&
              (primaryAction.href ? (
                <a href={primaryAction.href} onClick={primaryAction.onClick} className={cn(buttonVariants({ size: "lg" }), "relative rounded-full px-7", ink && "bg-background text-foreground hover:bg-background/90")}>
                  {primaryAction.label}
                  <ArrowRight className="size-4" />
                </a>
              ) : (
                <span className="relative inline-flex rounded-full">
                  <GlowEffect colors={ink ? ["#ffffff", "#a3a3a3", "#ffffff"] : ["#121212", "#525252", "#121212"]} mode="breathe" blur="medium" duration={4} className="rounded-full opacity-60" />
                  <Button size="lg" onClick={primaryAction.onClick} className={cn("relative rounded-full px-7", ink && "bg-background text-foreground hover:bg-background/90")}>
                    {primaryAction.label}
                    <ArrowRight className="size-4" />
                  </Button>
                </span>
              ))}
            {secondaryAction &&
              (secondaryAction.href ? (
                <a
                  href={secondaryAction.href}
                  onClick={secondaryAction.onClick}
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full", ink && "border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background")}
                >
                  {secondaryAction.label}
                </a>
              ) : (
                <Button variant="outline" size="lg" onClick={secondaryAction.onClick} className={cn("rounded-full", ink && "border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background")}>
                  {secondaryAction.label}
                </Button>
              ))}
          </div>
        </InView>
      )}
      {proof && <ProofRow proof={proof} ink={ink} />}
    </div>
  )

  return (
    <section className={cn(ink && "bg-foreground", "relative w-full overflow-hidden", className)} aria-label={title}>
      {!ink && <Spotlight size={560} className="-z-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.045),transparent_75%)] blur-2xl" />}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,var(--tw-gradient-from)_1px,transparent_0)] [background-size:24px_24px] opacity-[0.12]",
          ink ? "[--tw-gradient-from:hsl(0_0%_100%)]" : "[--tw-gradient-from:hsl(0_0%_9%)]",
        )}
      />
      <div
        className={cn(
          "relative mx-auto grid w-full max-w-[1280px] gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8",
          layout === "centered" && "mx-auto flex max-w-3xl flex-col items-center text-center lg:grid-cols-1",
        )}
      >
        {copy}
        {layout === "split" && visual && (
          <InView
            variants={{ hidden: { opacity: 0, y: 24, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1 } }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            viewOptions={{ once: true, margin: "-80px" }}
          >
            <div className="w-full">{visual}</div>
          </InView>
        )}
      </div>
    </section>
  )
}
