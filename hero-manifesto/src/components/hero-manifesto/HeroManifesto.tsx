import * as React from "react"
import { ArrowRight } from "lucide-react"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
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
  className?: string
}

// ── HeroManifesto ────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · No image. The typography IS the product: three stacked lines at clamp
//   sizes up to 6.5rem, each revealing in sequence (stagger 0.12s).
// · Signature: the middle line indents a full gutter step and flips to
//   serif-italic — the "turn" in the argument, like a spoken emphasis.
// · A meta strip under the CTAs reads like a colophon: mono, dotted
//   separators. Proof avatars sit inline with the count.
export function HeroManifesto({
  eyebrow = "Manifesto",
  lines,
  subtitle,
  primaryAction,
  secondaryAction,
  proof,
  tone = "paper",
  className,
}: HeroManifestoProps) {
  const ink = tone === "ink"

  return (
    <section
      className={cn(ink && "bg-foreground", "relative isolate flex w-full items-center overflow-hidden", fullMin(className), className)}
      aria-label={eyebrow}
    >
      <Grain opacity={ink ? 0.07 : 0.045} />
      <div className="relative mx-auto flex w-full max-w-[980px] flex-col items-center px-4 py-28 text-center sm:px-6 sm:py-36">
        <MonoLabel className={cn(ink ? "text-background/55" : "text-muted-foreground")}>{eyebrow}</MonoLabel>

        <h1 className={cn("mt-8 font-display font-black leading-[0.94] tracking-[-0.045em]", ink ? "text-background" : "text-foreground")}>
          {[0, 1, 2].map((i) => (
            <InView
              key={i}
              variants={{ hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.7, delay: 0.08 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              viewOptions={{ once: true, margin: "-80px" }}
            >
              <span
                className={cn(
                  "block text-[clamp(2.4rem,6.5vw,5.5rem)]",
                  i === 1 && "pl-[0.9em] text-left font-serif italic font-medium tracking-[-0.02em] sm:pl-[1.4em]",
                  ink ? (i === 1 ? "text-background/85" : "text-background") : i === 1 ? "text-foreground/85" : "text-foreground",
                )}
                style={i === 1 ? { fontFamily: "Georgia, 'Times New Roman', serif" } : undefined}
              >
                {lines[i]}
              </span>
            </InView>
          ))}
        </h1>

        {subtitle && (
          <InView
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            viewOptions={{ once: true, margin: "-60px" }}
          >
            <p className={cn("mx-auto mt-8 max-w-md text-[15px] font-medium leading-[1.75]", ink ? "text-background/60" : "text-muted-foreground")}>
              {subtitle}
            </p>
          </InView>
        )}

        <InView
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-60px" }}
        >
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
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
                  "rounded-full font-semibold underline decoration-dotted decoration-2 underline-offset-8 transition-colors hover:no-underline",
                  ink ? "text-background/70 hover:text-background" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {secondaryAction.label}
              </a>
            )}
          </div>
        </InView>

        {/* colophon strip */}
        <div className={cn("mt-14 flex w-full max-w-lg flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t pt-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em]", ink ? "border-background/10 text-background/40" : "border-border text-muted-foreground/70")}>
          {proof?.avatars && proof.avatars.length > 0 && (
            <span className="flex -space-x-2">
              {proof.avatars.slice(0, 5).map((a, i) => (
                <Avatar key={i} className={cn("size-6 border", ink ? "border-background/40 bg-background/15" : "border-background bg-secondary")}>
                  <AvatarFallback className="font-mono text-[8px] font-bold">{a.initials ?? "?"}</AvatarFallback>
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
      </div>
    </section>
  )
}

function fullMin(className?: string) {
  return /min-h-svh|min-h-screen/.test(className ?? "") ? "" : "min-h-[86svh]"
}
