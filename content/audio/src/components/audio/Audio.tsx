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
  src: string
  trackTitle?: string
  artist?: string
  /** Optional cover art (falls back to a token-styled placeholder). */
  cover?: string
  coverAlt?: string
  caption?: string
  className?: string
}

// ── Audio ────────────────────────────────────────────────────────────────────

export function Audio({
  eyebrow = "Listen",
  title,
  subtitle,
  src,
  trackTitle = "Audio note",
  artist,
  cover,
  coverAlt,
  caption,
  className,
}: AudioProps) {
  return (
    <SectionShell width={760} padding="roomy" rule="bottom" className={className}>
      <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
        {(eyebrow || title || subtitle) && <SectionHead eyebrow={eyebrow} title={title ?? trackTitle} subtitle={subtitle} />}
        <figure className="mt-6 rounded-[24px] border bg-card p-4 shadow-sm sm:p-5">
          <AudioPlayer source={src} title={trackTitle} artist={artist} coverImage={cover} />
          {caption && (
            <figcaption className="mt-2 px-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{caption}</figcaption>
          )}
        </figure>
      </InView>
    </SectionShell>
  )
}
