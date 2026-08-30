import * as React from "react"
import { ArrowRight } from "lucide-react"
import { CornerTicks, Grain, MonoLabel } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"
import { Magnetic } from "@/components/primitives/magnetic"
import { TextShimmer } from "@/components/primitives/text-shimmer"
import { BorderTrail } from "@/components/primitives/border-trail"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type CtaAction = {
  label: string
  href?: string
  onClick?: () => void
}

export type CtaProps = {
  /** Small mono line above the headline, e.g. "Ready when you are". */
  eyebrow?: string
  /** Headline — accepts JSX for line breaks. */
  title: React.ReactNode
  description?: React.ReactNode
  primary: CtaAction
  secondary?: CtaAction
  /** ink = dark band, paper = bordered light panel, ghost = no container. */
  tone?: "ink" | "paper" | "ghost"
  /** Shimmer the headline while idle. Default true (ink tone only — it animates a bright color). */
  shimmer?: boolean
  /** Optional chip above the title. */
  badge?: string
  /** Trust line under the buttons, e.g. reviews or guarantees. */
  note?: React.ReactNode
  className?: string
}

// ── CTA ──────────────────────────────────────────────────────────────────────

export function Cta({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  tone = "ink",
  shimmer = true,
  badge,
  note,
  className,
}: CtaProps) {
  const ink = tone === "ink"
  const ghost = tone === "ghost"

  const primaryBtn = primary.href ? (
    <Button asChild variant={ink ? "secondary" : "default"} className="group relative h-11 overflow-hidden rounded-none px-7 font-display text-sm font-extrabold tracking-tight transition-shadow duration-300 hover:shadow-[3px_3px_0_0_currentColor]">
      <a href={primary.href} onClick={primary.onClick}>
        <span className="relative z-10 inline-flex items-center">
          {primary.label}
          <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
        <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-[110%] bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.3)_50%,transparent_60%)] transition-transform duration-700 group-hover:translate-x-[110%]" />
      </a>
    </Button>
  ) : (
    <Button onClick={primary.onClick} variant={ink ? "secondary" : "default"} className="group relative h-11 overflow-hidden rounded-none px-7 font-display text-sm font-extrabold tracking-tight transition-shadow duration-300 hover:shadow-[3px_3px_0_0_currentColor]">
      <span className="relative z-10 inline-flex items-center">
        {primary.label}
        <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
      <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-[110%] bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.3)_50%,transparent_60%)] transition-transform duration-700 group-hover:translate-x-[110%]" />
    </Button>
  )

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-label={typeof title === "string" ? title : "Call to action"}>
      <InView variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-80px" }}>
        <div className="mx-auto w-full max-w-[1120px] px-4 py-16 sm:px-6 lg:px-8">
          <div
            className={cn(
              "group relative overflow-hidden border px-6 py-12 sm:px-10 sm:py-14 lg:px-14",
              ink && "border-background/15 bg-foreground text-background",
              tone === "paper" && "border-border bg-card shadow-sm",
              ghost && "border-transparent bg-transparent"
            )}
          >
            {/* craft layer: grain + corner ticks + cornered panel (no pill card) */}
            <Grain opacity={ink ? 0.07 : 0.04} />
            <CornerTicks size={14} offset={10} className={cn(ink ? "text-background/35" : "text-foreground/20")} />
            {ink && (
              <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.35]" style={{ background: "radial-gradient(120% 90% at 85% -10%, hsl(0 0% 100% / 0.14), transparent 55%)" }} />
            )}
            {tone === "paper" && (
              <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-foreground/10 via-foreground to-foreground/10" />
            )}

            <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
              <div className="max-w-2xl">
                {eyebrow && (
                  <MonoLabel className={cn(ink ? "text-background/55" : "text-muted-foreground", badge && "mt-0", !badge && "mt-0")}>{eyebrow}</MonoLabel>
                )}
                {badge && (
                  <span className={cn("mt-4 inline-flex items-center rounded-none border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em]", ink ? "border-background/25 bg-transparent text-background/80" : "border-border bg-background text-muted-foreground", eyebrow && "ml-0")}>
                    {badge}
                  </span>
                )}
                {shimmer && ink && typeof title === "string" ? (
                  <TextShimmer as="h2" duration={2.8} spread={3} className="mt-2 font-display text-[30px] font-black leading-[1.02] tracking-[-0.03em] sm:text-[40px]">
                    {title}
                  </TextShimmer>
                ) : (
                  <h2 className="mt-2 font-display text-[30px] font-black leading-[1.02] tracking-[-0.03em] sm:text-[40px]">{title}</h2>
                )}
                {description && (
                  <p className={cn("mt-3 max-w-xl text-sm font-medium leading-relaxed sm:text-[15px]", ink ? "text-background/70" : "text-muted-foreground")}>{description}</p>
                )}
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Magnetic intensity={0.18} range={60}>
                  <span className="relative inline-flex">
                    <BorderTrail size={80} className={cn("rounded-full", ink ? "bg-background/30" : "bg-foreground/20")} />
                    {primaryBtn}
                  </span>
                </Magnetic>
                {secondary &&
                  (secondary.href ? (
                    <Button asChild variant={ink ? "ghost" : "outline"} className={cn("h-11 rounded-full px-6 font-display text-sm font-bold tracking-tight", ink && "text-background hover:bg-background/10 hover:text-background")}>
                      <a href={secondary.href} onClick={secondary.onClick}>
                        {secondary.label}
                      </a>
                    </Button>
                  ) : (
                    <Button variant={ink ? "ghost" : "outline"} onClick={secondary.onClick} className={cn("h-11 rounded-full px-6 font-display text-sm font-bold tracking-tight", ink && "text-background hover:bg-background/10 hover:text-background")}>
                      {secondary.label}
                    </Button>
                  ))}
                {note && <span className="font-mono text-[11px] font-semibold opacity-70">· {note}</span>}
              </div>
            </div>
          </div>
        </div>
      </InView>
    </section>
  )
}
