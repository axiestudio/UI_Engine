import * as React from "react"
import { ArrowRight } from "lucide-react"
import { Grain } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type ManifestoProof = {
  avatars?: { initials?: string; alt?: string }[]
  countLabel?: string
}

export type HeroManifestoProps = {
  /** Mono eyebrow, e.g. "Studio — est. 2019". */
  eyebrow?: string
  /** Three stacked lines; middle renders indented + serif-italic (the turn). */
  lines: [React.ReactNode, React.ReactNode, React.ReactNode]
  subtitle?: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
  proof?: ManifestoProof
  tone?: "paper" | "ink"
  fullPage?: boolean
  className?: string
}

// ── HeroManifesto ────────────────────────────────────────────────────────────
// Design decisions (refactored):
// · The typography is still the product — but lines now rise out of clipped
//   masks (theatre-curtain reveal) instead of floating up as blocks.
// · Signature kept: the middle line indents a full gutter step and flips to
//   serif-italic — the "turn" in the argument.
// · CTAs upgraded to proper shadcn pair (solid pill + quiet ghost); the
//   colophon strip stays as the sign-off, with live year.
export function HeroManifesto({
  eyebrow = "Manifesto",
  lines,
  subtitle,
  primaryAction,
  secondaryAction,
  proof,
  tone = "paper",
  fullPage = false,
  className,
}: HeroManifestoProps) {
  const ink = tone === "ink"
  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]
  const lineReveal = (delay: number) => ({
    variants: { hidden: { y: "115%" }, visible: { y: "0%" } },
    transition: { duration: 0.85, delay, ease: ease as [number, number, number, number] },
    viewOptions: { once: true, margin: "-80px" as const },
  })

  return (
    <section
      className={cn(ink && "bg-foreground", "relative isolate flex w-full items-center overflow-hidden", fullPage ? "min-h-svh" : "min-h-[86svh]", className)}
      aria-label={eyebrow}
    >
      <Grain opacity={ink ? 0.06 : 0.04} />
      {/* soft vignette so the type sits on a stage, not a flat field */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_42%,transparent_55%,hsl(0_0%_0%/0.03)_100%)]",
          ink && "bg-[radial-gradient(ellipse_70%_55%_at_50%_42%,transparent_50%,hsl(0_0%_100%/0.05)_100%)]",
        )}
      />

      <div className="relative mx-auto flex w-full max-w-[1000px] flex-col items-center px-4 py-28 text-center sm:px-6 sm:py-36">
        <InView
          variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-80px" }}
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

        <h1
          className={cn(
            "mt-10 font-display font-black leading-[0.96] tracking-[-0.045em]",
            ink ? "text-background" : "text-foreground",
          )}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} aria-hidden={false} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
              <InView {...lineReveal(0.12 + i * 0.14)}>
                <span
                  className={cn(
                    "block text-[clamp(2.4rem,6.5vw,5.6rem)]",
                    i === 1 && "pl-[0.9em] text-left font-serif font-medium italic tracking-[-0.02em] sm:pl-[1.4em]",
                    ink ? (i === 1 ? "text-background/80" : "text-background") : i === 1 ? "text-foreground/80" : "text-foreground",
                  )}
                  style={i === 1 ? { fontFamily: "Georgia, 'Times New Roman', serif" } : undefined}
                >
                  {lines[i]}
                </span>
              </InView>
            </span>
          ))}
        </h1>

        {subtitle && (
          <InView
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            viewOptions={{ once: true, margin: "-60px" }}
          >
            <p className={cn("mx-auto mt-9 max-w-[46ch] text-[15px] leading-[1.8]", ink ? "text-background/60" : "text-muted-foreground")}>
              {subtitle}
            </p>
          </InView>
        )}

        <InView
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, delay: 0.66, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-60px" }}
        >
          <div className="mt-11 flex flex-wrap items-center justify-center gap-3">
            {primaryAction && (
              <Button
                size="lg"
                asChild={Boolean(primaryAction.href)}
                onClick={primaryAction.href ? undefined : primaryAction.onClick}
                className={cn(
                  "group relative h-12 overflow-hidden rounded-full px-8 text-sm font-semibold shadow-sm transition-all duration-300 hover:shadow-md focus-visible:ring-offset-2",
                  ink
                    ? "bg-background text-foreground hover:bg-background/90 focus-visible:ring-background/50"
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
                  "motion-reduce:transition-none",
                )}
              >
                {primaryAction.href ? (
                  <a href={primaryAction.href} className="relative z-10 inline-flex items-center gap-2">
                    {primaryAction.label}
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -translate-x-[110%] bg-[linear-gradient(105deg,transparent_40%,hsl(0_0%_100%/0.25)_50%,transparent_60%)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[110%] motion-reduce:hidden"
                    />
                  </a>
                ) : (
                  <span className="relative z-10 inline-flex items-center gap-2">
                    {primaryAction.label}
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -translate-x-[110%] bg-[linear-gradient(105deg,transparent_40%,hsl(0_0%_100%/0.25)_50%,transparent_60%)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[110%] motion-reduce:hidden"
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
                  "h-12 rounded-full px-6 text-sm font-semibold focus-visible:ring-offset-2",
                  ink
                    ? "text-background/75 hover:bg-background/10 hover:text-background focus-visible:ring-background/50"
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

        {/* colophon strip — the sign-off */}
        <InView
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          transition={{ duration: 0.6, delay: 0.85 }}
          viewOptions={{ once: true, margin: "-60px" }}
        >
          <div
            className={cn(
              "mt-16 flex w-full max-w-lg flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t pt-7 font-mono text-[10px] font-bold uppercase tracking-[0.2em]",
              ink ? "border-background/10 text-background/45" : "border-border text-muted-foreground/80",
            )}
          >
            {proof?.avatars && proof.avatars.length > 0 && (
              <span className="flex -space-x-2">
                {proof.avatars.slice(0, 5).map((a, i) => (
                  <Avatar key={i} className={cn("size-6 ring-1", ink ? "bg-background/15 ring-background/40" : "bg-secondary ring-background")}>
                    <AvatarFallback className={cn("font-mono text-[8px] font-bold", ink ? "text-background" : "text-foreground")}>
                      {a.initials ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </span>
            )}
            <span>{proof?.countLabel ?? "Trusted by teams worldwide"}</span>
            <span aria-hidden className="opacity-50">·</span>
            <span>{new Date().getFullYear()}</span>
            <span aria-hidden className="opacity-50">·</span>
            <span>v2.0</span>
          </div>
        </InView>
      </div>
    </section>
  )
}
