import * as React from "react"
import { ArrowRight } from "lucide-react"

import { InView } from "@/components/primitives/in-view"
import { Spotlight } from "@/components/primitives/spotlight"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type CaseStudyMetric = {
  value: string
  label: string
}

export type CaseStudyProps = {
  eyebrow?: string
  brand?: string
  quote?: string
  author?: { name: string; role?: string; initials?: string }
  metrics?: CaseStudyMetric[]
  image?: { src: string; alt?: string }
  cta?: { label: string; href?: string; onClick?: () => void }
  tags?: string[]
  tone?: "paper" | "ink"
  className?: string
}

// ── CaseStudy ────────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · One signature move: a giant serif quotation mark that BLEEDS off the
//   card's top-left corner — the quote is the hero, cropped like a print.
// · The quote itself is serif-italic at display size (Georgia stack) — voice,
//   not interface. Brand line sits above as a mono stamp.
// · Metrics read like an annual report: hairline-divided tiles, mono labels.
// · Image gets corner ticks + a hard 1deg tilt that settles on hover.

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_CASE_STUDY_BRAND = "Aurum Studio"
const DEMO_CASE_STUDY_QUOTE = "We replaced three tools and doubled rebookings in a single quarter."


export function CaseStudy({
  eyebrow = "Customer story",
  brand = DEMO_CASE_STUDY_BRAND,
  quote = DEMO_CASE_STUDY_QUOTE,
  author,
  metrics,
  image,
  cta,
  tags,
  tone = "paper",
  className,
}: CaseStudyProps) {
  const ink = tone === "ink"

  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        viewOptions={{ once: true, margin: "-80px" }}
      >
        <figure
          className={cn(
            "relative grid gap-10 overflow-hidden border p-8 sm:p-12 lg:grid-cols-[1.15fr_1fr] lg:gap-14",
            ink ? "border-background/15 bg-background/[0.03]" : "border-border bg-card shadow-sm",
          )}
        >
          {!ink && <span aria-hidden className={cn("pointer-events-none absolute inset-0", "text-foreground/25")}>
    <span className="absolute border-current top-[9px] left-[9px] border-t border-l" style={{ width: 13, height: 13 }} />
    <span className="absolute border-current top-[9px] right-[9px] border-t border-r" style={{ width: 13, height: 13 }} />
    <span className="absolute border-current bottom-[9px] left-[9px] border-b border-l" style={{ width: 13, height: 13 }} />
    <span className="absolute border-current bottom-[9px] right-[9px] border-b border-r" style={{ width: 13, height: 13 }} />
  </span>}
          {!ink && <Spotlight size={440} className="bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05),transparent_72%)] blur-2xl" />}

          {/* the bleeding quote mark */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute -left-3 -top-10 select-none font-serif text-[200px] leading-none sm:-left-4 sm:-top-14 sm:text-[260px]",
              ink ? "text-background opacity-[0.08]" : "text-foreground opacity-[0.07]",
            )}
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            “
          </span>

          <div className="relative flex flex-col">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", cn(ink ? "text-background/55" : "text-muted-foreground"))}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
              <span className={cn("border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em]", ink ? "border-background/30 text-background/70" : "border-foreground/25 text-foreground/70")}>
                {brand}
              </span>
            </div>

            <blockquote
              className={cn(
                "mt-7 max-w-[22ch] font-serif text-[26px] font-medium italic leading-[1.28] tracking-[-0.01em] sm:text-[32px]",
                ink ? "text-background" : "text-foreground",
              )}
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {quote}
            </blockquote>

            {author && (
              <figcaption className="mt-7">
                <span className={cn("block font-display text-sm font-bold tracking-tight", ink ? "text-background" : "text-foreground")}>
                  {author.name}
                </span>
                {author.role && (
                  <span className={cn("mt-0.5 block font-mono text-[10px] font-bold uppercase tracking-[0.18em]", ink ? "text-background/45" : "text-muted-foreground")}>
                    {author.role}
                  </span>
                )}
              </figcaption>
            )}

            {tags && tags.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className={cn(
                      "border px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em]",
                      ink ? "border-background/20 text-background/55" : "border-border text-muted-foreground/80",
                    )}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {cta && (
              <div className="mt-auto pt-9">
                <Button
                  variant={ink ? "outline" : "default"}
                  asChild={Boolean(cta.href)}
                  onClick={cta.onClick}
                  className={cn(
                    "group rounded-none border font-mono text-[11px] font-bold uppercase tracking-[0.18em]",
                    ink
                      ? "border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
                      : "border-foreground bg-foreground text-background hover:shadow-[3px_3px_0_0_currentColor]",
                  )}
                >
                  {cta.href ? (
                    <a href={cta.href} className="inline-flex items-center gap-2">
                      {cta.label}
                      <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      {cta.label}
                      <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="relative flex flex-col gap-7">
            {image && (
              <div className={cn("relative rotate-1 border transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:rotate-0", ink ? "border-background/15" : "border-border")}>
                <span aria-hidden className={cn("pointer-events-none absolute inset-0", cn(ink ? "text-background/40" : "text-foreground/30"))}>
    <span className="absolute border-current top-[-8px] left-[-8px] border-t border-l" style={{ width: 11, height: 11 }} />
    <span className="absolute border-current top-[-8px] right-[-8px] border-t border-r" style={{ width: 11, height: 11 }} />
    <span className="absolute border-current bottom-[-8px] left-[-8px] border-b border-l" style={{ width: 11, height: 11 }} />
    <span className="absolute border-current bottom-[-8px] right-[-8px] border-b border-r" style={{ width: 11, height: 11 }} />
  </span>
                <img src={image.src} alt={image.alt ?? ""} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              </div>
            )}
            {metrics && metrics.length > 0 && (
              <dl className={cn("grid border", metrics.length >= 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2", ink ? "border-background/10" : "border-border")}>
                {metrics.map((m, i) => (
                  <div
                    key={m.label}
                    className={cn(
                      "flex flex-col items-center gap-1.5 px-3 py-6 text-center",
                      i > 0 && (ink ? "border-l border-background/10" : "border-l border-border"),
                      ink ? "bg-background/[0.03]" : "bg-muted/40",
                    )}
                  >
                    <dd className={cn("font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl", ink ? "text-background" : "text-foreground")}>
                      {m.value}
                    </dd>
                    <dt className={cn("font-mono text-[9px] font-bold uppercase tracking-[0.2em]", ink ? "text-background/45" : "text-muted-foreground")}>
                      {m.label}
                    </dt>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </figure>
      </InView>
    
  </div>
</section>
  )
}
