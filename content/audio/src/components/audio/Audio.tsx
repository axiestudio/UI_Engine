import * as React from "react"
import { AudioPlayer } from "@/components/ui/audio-player"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type AudioProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  /** Direct file or stream URL (mp3/ogg). Host owns hosting/CDN. */
  src?: string
  trackTitle?: string
  artist?: string
  /** Optional cover art (falls back to a token-styled placeholder). */
  cover?: string
  coverAlt?: string
  caption?: string
  className?: string
}

// ── Audio ────────────────────────────────────────────────────────────────────


// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_AUDIO_SRC = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

export function Audio({
  eyebrow = "Listen",
  title = "Studio note",
  subtitle,
  src = DEMO_AUDIO_SRC,
  trackTitle = "Audio note",
  artist = "Field recording",
  cover,
  coverAlt,
  caption = "Three minutes from the cutting room floor.",
  className,
}: AudioProps) {
  return (
    <section className={cn("relative isolate w-full overflow-hidden min-h-[400px] bg-background text-foreground", className)} aria-label={title ?? trackTitle}>
      <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
        <div className="mx-auto w-full max-w-[680px] px-5 py-16 sm:px-8">
          {(eyebrow || title) && (
            <header className="mb-6">
              {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>}
              {title && <h2 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>}
              {subtitle && <p className="mt-2 max-w-prose text-sm font-medium leading-relaxed text-muted-foreground">{subtitle}</p>}
            </header>
          )}
          <figure className="rounded-[24px] border bg-card p-4 shadow-sm sm:p-5">
            <AudioPlayer source={src} title={trackTitle} artist={artist} coverImage={cover} />
            {caption && (
              <figcaption className="mt-2 px-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{caption}</figcaption>
            )}
          </figure>
        </div>
      </InView>
    </section>
  )
}
