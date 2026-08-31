import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Magnetic } from "@/components/primitives/magnetic"
import { cn } from "@/lib/utils"

// ── Design language ──────────────────────────────────────────────────────────
// JOB: turn a name into a person you'd trust in a quiet room.
// EMOTION: warmth + competence. Unhurried.
// SIGNATURE MOVE: the portrait stays — sticky at the top of the column while
//   the biography scrolls past it. You read about them *with them waiting on
//   the page*. Mobile: portrait as a wide band above the text.
// ─────────────────────────────────────────────────────────────────────────────

export type ExpertProps = {
  name: string
  role: string
  /** 4:5 portrait. Missing/broken → initials block (always styled, never broken). */
  photo?: string
  photoAlt?: string
  /** Short pull-quote that carries the voice — set in display size. */
  quote?: string
  /** Bio paragraphs. */
  bio?: string[]
  /** Credential chips — languages, certifications. */
  tags?: string[]
  /** e.g. "24 years at the table" — large mono counter. */
  counter?: { value: string; label: string }
  availability?: string
  cta?: { label: string; href?: string; onClick?: () => void }
  className?: string
}

export function Expert({
  name,
  role,
  photo,
  photoAlt,
  quote,
  bio = [],
  tags = [],
  counter,
  availability,
  cta,
  className,
}: ExpertProps) {
  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-labelledby="expert-name">
      <div className="mx-auto w-full max-w-[1120px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          {/* sticky portrait column */}
          <div className="lg:sticky lg:top-[104px] lg:self-start">
            <figure className="relative overflow-hidden rounded-[24px] border shadow-sm">
              <div className="aspect-[4/5]">
                {photo ? (
                  <img
                    src={photo}
                    alt={photoAlt ?? name}
                    className="h-full w-full object-cover"
                    onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                  />
                ) : null}
                {!photo && (
                  <span aria-hidden className="flex h-full w-full items-center justify-center bg-muted font-display text-[110px] font-bold text-muted-foreground">
                    {name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-5 pb-5 pt-20">
                <h2 id="expert-name" className="font-display text-2xl font-bold leading-tight tracking-tight text-white">
                  {name}
                </h2>
                <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">{role}</p>
              </figcaption>
            </figure>
            {counter && (
              <div className="mt-5 flex items-baseline gap-3 lg:hidden">
                <span className="font-mono text-4xl font-bold tabular-nums tracking-tighter">{counter.value}</span>
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{counter.label}</span>
              </div>
            )}
          </div>

          {/* biography column */}
          <div className="min-w-0">
            {counter && (
              <div className="mb-8 hidden items-baseline gap-3 lg:flex">
                <span className="font-mono text-[56px] font-bold leading-none tabular-nums tracking-tighter">{counter.value}</span>
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{counter.label}</span>
              </div>
            )}

            {quote && (
              <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
                <blockquote className="relative pl-8">
                  <span aria-hidden className="absolute left-0 top-1 font-display text-5xl font-bold leading-none text-foreground/25 select-none">“</span>
                  <p className="font-display text-[22px] font-bold leading-snug tracking-tight sm:text-2xl">{quote}</p>
                </blockquote>
              </InView>
            )}

            {bio.length > 0 && (
              <div className="mt-6 space-y-4">
                {bio.map((para, i) => (
                  <InView
                    key={i}
                    as="p"
                    variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.5, delay: 0.05 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    viewOptions={{ once: true, margin: "-40px" }}
                    className="max-w-prose text-[15px] font-medium leading-[1.75] text-muted-foreground sm:text-base"
                  >
                    {para}
                  </InView>
                ))}
              </div>
            )}

            {tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span key={t} className="rounded-full border bg-card shadow-sm px-3 py-1 text-xs font-bold tracking-tight">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {(cta || availability) && (
              <div className="mt-10 flex flex-wrap items-center gap-5 border-t pt-8">
                {cta &&
                  (() => {
                    const label = cta.href ? (
                      <a href={cta.href} className="inline-flex h-11 items-center rounded-full bg-foreground px-7 font-display text-sm font-bold tracking-tight text-background transition-transform hover:scale-[1.02] active:scale-[0.98]">
                        {cta.label}
                      </a>
                    ) : (
                      <button type="button" onClick={cta.onClick} className="inline-flex h-11 items-center rounded-full bg-foreground px-7 font-display text-sm font-bold tracking-tight text-background transition-transform hover:scale-[1.02] active:scale-[0.98]">
                        {cta.label}
                      </button>
                    )
                    return <Magnetic intensity={0.18} range={60}>{label}</Magnetic>
                  })()}
                {availability && (
                  <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <span aria-hidden className="h-2 w-2 rounded-full bg-emerald-500 motion-reduce:animate-none" />
                    {availability}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
