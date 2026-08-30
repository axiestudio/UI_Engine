import * as React from "react"
import { ArrowRight } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Spotlight } from "@/components/primitives/spotlight"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type CaseStudyMetric = {
  value: string
  label: string
}

export type CaseStudyProps = {
  eyebrow?: string
  brand: string
  quote: string
  author?: { name: string; role?: string; initials?: string }
  metrics?: CaseStudyMetric[]
  image?: { src: string; alt?: string }
  cta?: { label: string; href?: string; onClick?: () => void }
  tags?: string[]
  tone?: "paper" | "ink"
  className?: string
}

// ── CaseStudy ────────────────────────────────────────────────────────────────

export function CaseStudy({
  eyebrow,
  brand,
  quote,
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
    <section className={cn(ink && "bg-foreground", "w-full", className)} aria-label={eyebrow ?? "Customer story"}>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <InView
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-80px" }}
        >
          <div
            className={cn(
              "relative grid gap-10 overflow-hidden rounded-[24px] border p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:gap-14",
              ink ? "border-background/15 bg-transparent" : "border-border bg-card shadow-sm",
            )}
          >
            {!ink && <Spotlight size={460} className="bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.045),transparent_75%)] blur-2xl" />}

            <div className="relative flex flex-col">
              {eyebrow && (
                <Badge
                  variant="outline"
                  className={cn(
                    "mb-6 w-fit rounded-full border px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest",
                    ink ? "border-background/25 bg-transparent text-background/80" : "bg-secondary text-muted-foreground",
                  )}
                >
                  {eyebrow}
                </Badge>
              )}
              <p className={cn("font-mono text-sm font-bold uppercase tracking-widest", ink ? "text-background/60" : "text-muted-foreground")}>
                {brand}
              </p>
              <blockquote
                className={cn(
                  "mt-4 font-display text-2xl font-extrabold leading-[1.15] tracking-[-0.03em] sm:text-3xl",
                  ink ? "text-background" : "text-foreground",
                )}
              >
                <span aria-hidden className={cn("mr-1 select-none", ink ? "text-background/30" : "text-muted-foreground/40")}>
                  “
                </span>
                {quote}
                <span aria-hidden className={cn("select-none", ink ? "text-background/30" : "text-muted-foreground/40")}>
                  ”
                </span>
              </blockquote>

              {author && (
                <figcaption className={cn("mt-6 text-sm font-semibold", ink ? "text-background/80" : "text-foreground")}>
                  {author.name}
                  {author.role && (
                    <span className={cn("font-medium", ink ? "text-background/50" : "text-muted-foreground")}>
                      {" "}· {author.role}
                    </span>
                  )}
                </figcaption>
              )}

              {tags && tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className={cn(
                        "rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest",
                        ink ? "bg-background/10 text-background/70" : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {cta && (
                <div className="mt-auto pt-8">
                  <Button
                    variant={ink ? "outline" : "default"}
                    className={cn(ink && "border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background")}
                    onClick={cta.onClick}
                    asChild={Boolean(cta.href)}
                  >
                    {cta.href ? (
                      <a href={cta.href}>
                        {cta.label}
                        <ArrowRight className="size-4" />
                      </a>
                    ) : (
                      <span onClick={cta.onClick}>
                        {cta.label}
                        <ArrowRight className="size-4" />
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="relative flex flex-col gap-8">
              {image && (
                <div className={cn("overflow-hidden rounded-[20px] border", ink ? "border-background/15" : "border-border")}>
                  <img src={image.src} alt={image.alt ?? ""} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                </div>
              )}
              {metrics && metrics.length > 0 && (
                <dl className={cn("grid gap-px overflow-hidden rounded-[20px] border", ink ? "border-background/15 bg-background/10" : "border-border bg-muted", metrics.length >= 3 ? "grid-cols-3" : "grid-cols-2")}>
                  {metrics.map((m) => (
                    <div key={m.label} className={cn("flex flex-col items-center gap-1 px-3 py-5 text-center", ink ? "bg-foreground" : "bg-card")}>
                      <dd className={cn("font-display text-2xl font-black tracking-[-0.03em] sm:text-3xl", ink ? "text-background" : "text-foreground")}>
                        {m.value}
                      </dd>
                      <dt className={cn("font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>
                        {m.label}
                      </dt>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>
        </InView>
      </div>
    </section>
  )
}
