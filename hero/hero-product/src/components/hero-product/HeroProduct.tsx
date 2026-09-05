import * as React from "react"
import { ArrowRight, Lock } from "lucide-react"
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
  title?: string
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
// Design decisions (refactored):
// · The screenshot is still the argument — but the frame now reads as a real
//   browser: traffic dots, a lock + URL pill, hairline chrome, an inner top
//   highlight and a soft ground shadow that lifts it off the page.
// · Signature kept: floating stat chips — refined into glass cards with rings,
//   ±2° tilt and staggered pop-in; they sell the numbers before the copy does.
// · The frame bleeds off the section bottom; a subtle fade keeps the crop
//   intentional. Ink gets depth glow; paper gets the mouse spotlight.

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_HERO_PRODUCT_TITLE = "Your whole studio,"
const DEMO_HERO_PRODUCT_EYEBROW = "The dashboard"
const DEMO_HERO_PRODUCT_TITLE_HIGHLIGHT = "one calm screen."
const DEMO_HERO_PRODUCT_SUBTITLE = "Bookings, payments and reminders \u2014 synced in real time."
const DEMO_HERO_PRODUCT_PRIMARY_ACTION = { label: "Start free", href: "#" }
const DEMO_HERO_PRODUCT_SECONDARY_ACTION = { label: "Watch the tour", href: "#" }
const DEMO_HERO_PRODUCT_SHOT = { src: "/showcase/hero-poster.webp", alt: "Dashboard" }
const DEMO_HERO_PRODUCT_URL_LABEL = "app.aurum.studio"
const DEMO_HERO_PRODUCT_CHIPS: ProductChip[] = [
  { label: "No-show rate", value: "-40%", corner: "tl" },
  { label: "Rebookings", value: "2x", corner: "br" },
]


export function HeroProduct({
  eyebrow = DEMO_HERO_PRODUCT_EYEBROW,
  title = DEMO_HERO_PRODUCT_TITLE,
  titleHighlight = DEMO_HERO_PRODUCT_TITLE_HIGHLIGHT,
  subtitle = DEMO_HERO_PRODUCT_SUBTITLE,
  primaryAction = DEMO_HERO_PRODUCT_PRIMARY_ACTION,
  secondaryAction = DEMO_HERO_PRODUCT_SECONDARY_ACTION,
  shot = DEMO_HERO_PRODUCT_SHOT,
  urlLabel = DEMO_HERO_PRODUCT_URL_LABEL,
  chips = DEMO_HERO_PRODUCT_CHIPS,
  tone = "ink",
  className,
}: HeroProductProps) {
  const ink = tone === "ink"
  const chipPos: Record<string, string> = {
    tl: "left-3 top-10 sm:-left-7 sm:top-12",
    tr: "right-3 top-10 sm:-right-7 sm:top-12",
    bl: "bottom-12 left-3 sm:-bottom-5 sm:left-10",
    br: "bottom-12 right-3 sm:-bottom-5 sm:right-10",
  }
  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

  return (
    <section className={cn(ink && "bg-foreground", "relative isolate w-full overflow-hidden", className)} aria-label={title}>
      <Grain opacity={ink ? 0.06 : 0.04} />
      {!ink && <Spotlight size={560} className="bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.045),transparent_72%)] blur-2xl" />}
      {ink && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-24 size-[640px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,hsl(0_0%_100%/0.07),transparent_65%)] blur-2xl"
        />
      )}

      <div className="relative mx-auto flex w-full max-w-[1120px] flex-col items-center px-4 pt-16 text-center sm:px-6 sm:pt-24">
        {eyebrow && (
          <MonoLabel tick={false} className={cn("rounded-full border px-3.5 py-1.5", ink ? "border-background/15 text-background/60" : "border-border text-muted-foreground")}>
            {eyebrow}
          </MonoLabel>
        )}
        <h1
          className={cn(
            "mt-6 max-w-[18ch] font-display text-[clamp(2.3rem,5.5vw,4rem)] font-black leading-[1.02] tracking-[-0.04em]",
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
          <p className={cn("mt-5 max-w-[52ch] text-[15px] leading-[1.75]", ink ? "text-background/60" : "text-muted-foreground")}>{subtitle}</p>
        )}
        {(primaryAction || secondaryAction) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
        )}

        {/* the frame, bleeding off the bottom */}
        <InView
          variants={{ hidden: { opacity: 0, y: 48 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.85, delay: 0.35, ease }}
          viewOptions={{ once: true, margin: "-60px" }}
        >
          <div className="relative mt-16 w-full max-w-[900px]">
            <div
              className={cn(
                "relative overflow-hidden rounded-t-2xl border border-b-0",
                ink
                  ? "border-background/20 bg-background/[0.04] shadow-[0_-20px_80px_-30px_hsl(0_0%_100%/0.12)]"
                  : "border-border bg-card shadow-[0_40px_80px_-32px_hsl(0_0%_0%/0.25)]",
              )}
            >
              {/* chrome */}
              <div className={cn("flex items-center gap-3 border-b px-4 py-3", ink ? "border-background/10 bg-background/[0.04]" : "border-border bg-muted/60")}>
                <span className="flex gap-1.5" aria-hidden>
                  <i className={cn("size-2.5 rounded-full", ink ? "bg-background/25" : "bg-border")} />
                  <i className={cn("size-2.5 rounded-full", ink ? "bg-background/25" : "bg-border")} />
                  <i className={cn("size-2.5 rounded-full", ink ? "bg-background/25" : "bg-border")} />
                </span>
                <span
                  className={cn(
                    "mx-auto flex max-w-xs items-center gap-1.5 truncate rounded-full px-3.5 py-1 font-mono text-[11px]",
                    ink ? "bg-background/10 text-background/60" : "bg-background text-muted-foreground shadow-xs ring-1 ring-border",
                  )}
                >
                  <Lock className="size-3 shrink-0 opacity-60" aria-hidden />
                  <span className="truncate">{urlLabel}</span>
                </span>
                <span aria-hidden className="flex gap-2">
                  <i className={cn("h-1.5 w-8 rounded-full", ink ? "bg-background/15" : "bg-border")} />
                  <i className={cn("h-1.5 w-3 rounded-full", ink ? "bg-background/15" : "bg-border")} />
                </span>
              </div>

              {/* inner top highlight */}
              <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-white/[0.06] to-transparent" />

              <div className={cn("aspect-[16/10] w-full overflow-hidden", ink ? "bg-background/5" : "bg-muted")}>
                {shot ? (
                  <img src={shot.src} alt={shot.alt ?? ""} loading="eager" decoding="async" className="h-full w-full object-cover object-top" />
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
                variants={{ hidden: { opacity: 0, y: 14, scale: 0.94 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                transition={{ duration: 0.5, delay: 0.75 + i * 0.14, ease }}
                viewOptions={{ once: true }}
              >
                <div
                  className={cn(
                    "absolute z-20 rounded-xl border px-4 py-3 text-left shadow-lg ring-1 ring-foreground/[0.06]",
                    ink
                      ? "border-background/15 bg-background text-foreground"
                      : "border-border/80 bg-background text-foreground",
                    chipPos[chip.corner ?? (i % 2 === 0 ? "tl" : "br")],
                    i % 2 === 0 ? "-rotate-2" : "rotate-2",
                  )}
                >
                  <CornerTicks size={7} offset={-5} className="w-fit text-foreground/20" corners={["tl"]} />
                  <p className="font-display text-xl font-black leading-none tracking-[-0.03em]">{chip.value}</p>
                  <p className={cn("mt-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em]", ink ? "text-foreground/55" : "text-muted-foreground")}>{chip.label}</p>
                </div>
              </InView>
            ))}
          </div>
        </InView>
      </div>
    </section>
  )
}
