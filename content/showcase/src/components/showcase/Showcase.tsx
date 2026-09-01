import * as React from "react"

import { InView } from "@/components/primitives/in-view"
import { Spotlight } from "@/components/primitives/spotlight"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Noise from "@/components/primitives/noise"
import { Button } from "@/components/ui/button"

// ── Types ────────────────────────────────────────────────────────────────────
export type ShowcaseShot = {
  src: string
  alt: string
  /** Short label shown on the thumbnail. */
  label?: string
  /** Optional caption under the featured frame. */
  caption?: string
}

export type ShowcaseProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  shots: ShowcaseShot[]
  /** Text shown in the browser-chrome address bar. */
  urlLabel?: string
  tone?: "paper" | "ink"
  className?: string
}

// ── Showcase ─────────────────────────────────────────────────────────────────

export function Showcase({
  eyebrow,
  title,
  subtitle,
  shots,
  urlLabel = "app.example.com",
  tone = "ink",
  className,
}: ShowcaseProps) {
  const [active, setActive] = React.useState(0)
  if (!shots.length) return null
  const ink = tone === "ink"
  const shot = shots[Math.min(active, shots.length - 1)]

  return (
    <section className={cn(ink && "bg-foreground", "w-full", className)} aria-label={title ?? "Product showcase"}>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {(eyebrow || title || subtitle) && (
          <header className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
            {eyebrow && (
              <Badge
                variant="outline"
                className={cn(
                  "mb-4 rounded-full border px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest",
                  ink ? "border-background/25 bg-transparent text-background/80" : "bg-secondary text-muted-foreground",
                )}
              >
                {eyebrow}
              </Badge>
            )}
            {title && (
              <h2 className={cn("font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl", ink ? "text-background" : "text-foreground")}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={cn("mt-3 text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>
                {subtitle}
              </p>
            )}
          </header>
        )}

        <InView
          variants={{ hidden: { opacity: 0, y: 24, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1 } }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-80px" }}
        >
          <figure className="group relative mx-auto max-w-5xl">
            <div
              className={cn(
                "relative overflow-hidden rounded-[20px] border shadow-2xl transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.005]",
                ink ? "border-background/20 bg-background/5" : "border-border bg-card",
              )}
            >
              <span aria-hidden className={cn("pointer-events-none absolute inset-0", cn(ink ? "text-background/40" : "text-foreground/25"))}>
    <span className="absolute border-current top-[-8px] left-[-8px] border-t border-l" style={{ width: 14, height: 14 }} />
    <span className="absolute border-current top-[-8px] right-[-8px] border-t border-r" style={{ width: 14, height: 14 }} />
    <span className="absolute border-current bottom-[-8px] left-[-8px] border-b border-l" style={{ width: 14, height: 14 }} />
    <span className="absolute border-current bottom-[-8px] right-[-8px] border-b border-r" style={{ width: 14, height: 14 }} />
  </span>
              <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden"><Noise patternAlpha={Math.round((ink ? 0.06 : 0.035) * 255)} patternSize={240} patternRefreshInterval={3} /></span>
              <Spotlight size={460} className={cn("blur-2xl", ink ? "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_75%)]" : "bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05),transparent_75%)]")} />
              <div className={cn("relative flex items-center gap-3 border-b px-4 py-3", ink ? "border-background/10 bg-background/5" : "border-border bg-muted/50")}>
                <span className="flex gap-1.5" aria-hidden>
                  <i className={cn("size-2.5 rounded-full", ink ? "bg-background/30" : "bg-muted-foreground/30")} />
                  <i className={cn("size-2.5 rounded-full", ink ? "bg-background/30" : "bg-muted-foreground/30")} />
                  <i className={cn("size-2.5 rounded-full", ink ? "bg-background/30" : "bg-muted-foreground/30")} />
                </span>
                <span
                  className={cn(
                    "mx-auto hidden max-w-xs truncate rounded-full px-3 py-1 font-mono text-[11px] font-medium sm:block",
                    ink ? "bg-background/10 text-background/60" : "bg-background text-muted-foreground",
                  )}
                >
                  {urlLabel}
                </span>
                <span className="w-10" aria-hidden />
              </div>
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                <img
                  key={shot.src}
                  src={shot.src}
                  alt={shot.alt}
                  className="h-full w-full object-cover object-top transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                  loading="lazy"
                />
                {/* sheen sweep on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-[110%] bg-[linear-gradient(105deg,transparent_42%,rgba(255,255,255,0.16)_50%,transparent_58%)] transition-transform [transition-duration:900ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[110%]"
                />
              </div>
            </div>
            {shot.caption && (
              <figcaption className={cn("mt-4 text-center text-sm font-medium", ink ? "text-background/60" : "text-muted-foreground")}>
                {shot.caption}
              </figcaption>
            )}
          </figure>
        </InView>

        {shots.length > 1 && (
          <div className="mx-auto mt-8 flex max-w-5xl flex-wrap justify-center gap-2.5" role="tablist" aria-label="Screenshots">
            {shots.map((s, i) => (
              <Button type='button' key={s.src} role="tab" aria-selected={i === active} onClick={() => setActive(i)} className={cn(
                  "rounded-full border px-4 py-2 text-xs font-bold tracking-tight transition-all",
                  i === active
                    ? ink
                      ? "border-background bg-background text-foreground"
                      : "border-foreground bg-foreground text-background"
                    : ink
                      ? "border-background/20 bg-transparent text-background/70 hover:border-background/40 hover:text-background"
                      : "border-border bg-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )} variant="default">
                {s.label ?? `View ${i + 1}`}
              </Button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
