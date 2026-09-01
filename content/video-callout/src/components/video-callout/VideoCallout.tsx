import * as React from "react"
import { Play } from "lucide-react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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

export function VideoCallout({ eyebrow = "FILM", title = "One watch.", src = "/showcase/content/video/editorial-drift.mp4", poster, duration = "02:14", caption = "WATCH — THE METHOD", tone = "paper", className }: VideoCalloutProps) {
  const ink = tone === "ink"
  const [playing, setPlaying] = React.useState(false)
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <InView once variants={{ hidden: { opacity: 0, scale: 0.97 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div className="relative mt-10 overflow-hidden rounded-xl border bg-foreground">
          <video className="aspect-video w-full object-cover" src={src} poster={poster} controls={playing} autoPlay={playing} playsInline muted loop />
          {!playing && (
            <Button type='button' onClick={() => setPlaying(true)} aria-label="Play video" className="absolute inset-0 flex items-center justify-center group" variant="default">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background/90 text-foreground shadow-xl transition-transform group-hover:scale-110">
                <Play className="h-6 w-6 ml-0.5" />
              </span>
            </Button>
          )}
          {duration && <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10px] font-bold text-white">{duration}</span>}
        </div>
        {caption && <p className={cn("mt-3 text-right font-mono text-[10px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{caption}</p>}
      </InView>
    
  </div>
</section>
  )
}
