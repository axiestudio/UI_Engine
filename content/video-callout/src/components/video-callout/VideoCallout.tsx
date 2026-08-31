import * as React from "react"
import { Play } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Video callout — a single carded video with a play face.
// ═══ EMOTION     Watch this.
// ═══ SIGNATURE   A poster-tile with a centered play button + caption.

export type VideoCalloutProps = {
  eyebrow?: string
  title?: React.ReactNode
  src?: string
  poster?: string
  duration?: string
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function VideoCallout({ eyebrow = "FILM", title = "One watch.", src = "/videos/hero.mp4", poster, duration = "02:14", caption = "WATCH — THE METHOD", tone = "paper", className }: VideoCalloutProps) {
  const ink = tone === "ink"
  const [playing, setPlaying] = React.useState(false)
  return (
    <SectionShell tone={tone} width={920} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0, scale: 0.97 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div className="relative mt-10 overflow-hidden rounded-2xl border bg-foreground">
          <video className="aspect-video w-full object-cover" src={src} poster={poster} controls={playing} autoPlay={playing} playsInline muted loop />
          {!playing && (
            <button type="button" onClick={() => setPlaying(true)} className="absolute inset-0 flex items-center justify-center group" aria-label="Play video">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background/90 text-foreground shadow-xl transition-transform group-hover:scale-110">
                <Play className="h-6 w-6 ml-0.5" />
              </span>
            </button>
          )}
          {duration && <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10px] font-bold text-white">{duration}</span>}
        </div>
        {caption && <p className={cn("mt-3 text-right font-mono text-[10px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{caption}</p>}
      </InView>
    </SectionShell>
  )
}
