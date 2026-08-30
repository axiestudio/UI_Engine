import * as React from "react"
import { ArrowRight } from "lucide-react"
import { CornerTicks, Grain, MonoLabel } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"
import { Spotlight } from "@/components/primitives/spotlight"
import { TextEffect } from "@/components/primitives/text-effect"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type ProductChip = {
  label: string
  value: string
  /** Corner position of the floating chip. */
  corner?: "tl" | "tr" | "bl" | "br"
}

export type HeroProductProps = {
  eyebrow?: string
  title: string
  titleHighlight?: string
  subtitle?: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
  /** Screenshot shown in the browser frame. */
  shot?: { src: string; alt?: string }
  urlLabel?: string
  /** Floating stat chips over the screenshot. */
  chips?: ProductChip[]
  tone?: "paper" | "ink"
  className?: string
}

// ── HeroProduct ──────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · The screenshot is the argument: headline stays compact up top, visual
//   takes 60% of the fold, cropped by the section bottom (bleeds off).
// · Signature: stat chips FLOAT over the frame — each rotated ±2°, positioned
//   by `corner`, with a hard hairline border and a tick. They sell the numbers
//   before the visitor reads a word.
// · Spotlight + grain on ink only; paper gets the quiet version.
export function HeroProduct({
  eyebrow,
  title,
  titleHighlight,
  subtitle,
  primaryAction,
  secondaryAction,
  shot,
  urlLabel = "app.example.com",
  chips = [],
  tone = "ink",
  className,
}: HeroProductProps) {
  const ink = tone === "ink"
  const chipPos: Record<string, string> = {
    tl: "left-4 top-8 sm:-left-6 sm:top-10",
    tr: "right-4 top-8 sm:-right-6 sm:top-10",
    bl: "bottom-10 left-4 sm:-bottom-6 sm:left-8",
    br: "bottom-10 right-4 sm:-bottom-6 sm:right-8",
  }

  return (
    <section className={cn(ink && "bg-foreground", "relative isolate w-full overflow-hidden", className)} aria-label={title}>
      <Grain opacity={ink ? 0.07 : 0.045} />
      {!ink && <Spotlight size={560} className="bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.045),transparent_72%)] blur-2xl" />}

      <div className="relative mx-auto flex w-full max-w-[1100px] flex-col items-center px-4 pt-16 text-center sm:px-6 sm:pt-24">
        {eyebrow && <MonoLabel className={cn(ink ? "text-background/55" : "text-muted-foreground")}>{eyebrow}</MonoLabel>}
        <h1 className={cn("mt-5 max-w-[18ch] font-display text-[clamp(2.3rem,5.5vw,3.9rem)] font-black leading-[1.0] tracking-[-0.04em]", ink ? "text-background" : "text-foreground")}>
          {title}
          {titleHighlight && (
            <TextEffect as="span" preset="slide" per="word" delay={0.2} className={cn("block", ink ? "text-background/60" : "text-muted-foreground")}>
              {titleHighlight}
            </TextEffect>
          )}
        </h1>
        {subtitle && (
          <p className={cn("mt-4 max-w-lg text-[15px] font-medium leading-[1.75]", ink ? "text-background/60" : "text-muted-foreground")}>
            {subtitle}
          </p>
        )}
        {(primaryAction || secondaryAction) && (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {primaryAction && (
              <Button
                size="lg"
                asChild={Boolean(primaryAction.href)}
                onClick={primaryAction.onClick}
                className={cn("group relative overflow-hidden rounded-full px-7", ink && "bg-background text-foreground hover:bg-background/90")}
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
                className={cn(
                  "rounded-full font-semibold underline decoration-dotted decoration-2 underline-offset-8 hover:no-underline",
                  ink ? "text-background/70 hover:text-background" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {secondaryAction.label}
              </a>
            )}
          </div>
        )}

        {/* the frame, bleeding off the bottom */}
        <InView
          variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-60px" }}
        >
          <div className="group relative mt-14 w-full max-w-[880px]">
            <div className={cn("relative overflow-hidden rounded-t-[20px] border border-b-0", ink ? "border-background/20 bg-background/5" : "border-border bg-card shadow-2xl")}>
              <div className={cn("flex items-center gap-3 border-b px-4 py-3", ink ? "border-background/10 bg-background/5" : "border-border bg-muted/50")}>
                <span className="flex gap-1.5" aria-hidden>
                  <i className={cn("size-2.5 rounded-full", ink ? "bg-background/30" : "bg-muted-foreground/30")} />
                  <i className={cn("size-2.5 rounded-full", ink ? "bg-background/30" : "bg-muted-foreground/30")} />
                  <i className={cn("size-2.5 rounded-full", ink ? "bg-background/30" : "bg-muted-foreground/30")} />
                </span>
                <span className={cn("mx-auto hidden max-w-xs truncate rounded-full px-3 py-1 font-mono text-[11px] sm:block", ink ? "bg-background/10 text-background/60" : "bg-background text-muted-foreground")}>
                  {urlLabel}
                </span>
                <span className="w-10" aria-hidden />
              </div>
              <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
                {shot ? (
                  <img src={shot.src} alt={shot.alt ?? ""} className="h-full w-full object-cover object-top" />
                ) : (
                  <div className={cn("flex h-full w-full items-center justify-center font-mono text-xs", ink ? "text-background/30" : "text-muted-foreground/40")}>
                    pass shot.src
                  </div>
                )}
              </div>
            </div>

            {/* floating stat chips — the signature */}
            {chips.map((chip, i) => (
              <InView
                key={chip.label}
                variants={{ hidden: { opacity: 0, y: 12, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                transition={{ duration: 0.5, delay: 0.7 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                viewOptions={{ once: true }}
              >
                <div
                  className={cn(
                    "absolute z-10 border bg-background px-3.5 py-2.5 text-left shadow-xl",
                    chipPos[chip.corner ?? (i % 2 === 0 ? "tl" : "br")],
                    i % 2 === 0 ? "-rotate-2" : "rotate-2",
                  )}
                >
                  <CornerTicks size={7} offset={-6} className="w-fit text-foreground/25" corners={["tl"]} />
                  <p className="font-display text-lg font-black leading-none tracking-[-0.03em] text-foreground">{chip.value}</p>
                  <p className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{chip.label}</p>
                </div>
              </InView>
            ))}
          </div>
        </InView>
      </div>
    </section>
  )
}
