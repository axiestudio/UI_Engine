import * as React from "react"
// embla-carousel-react v8 documents the default import — portable across builds
import useEmblaCarousel from "embla-carousel-react"
import { Pause, Play } from "lucide-react"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"

export type VideoChapter = { at: number; title: string; note?: string }

export type VideoChapterRailProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: string
  caption?: string
  tone?: "paper" | "ink"
  src?: string
  poster?: string
  chapters?: VideoChapter[]
  className?: string
}

const DEFAULT_CHAPTERS: VideoChapter[] = [
  { at: 0, title: "The book opens", note: "Doors unlocked, the first chair spins up." },
  { at: 2, title: "Chairs fill", note: "The floor hums — every chair taken." },
  { at: 4, title: "The ledger closes", note: "Last kr entered, lights down to half." },
]

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`

export function VideoChapterRail({
  eyebrow = "Showreel · Quiet Times Studio",
  title = "Five seconds, three chapters.",
  subtitle = "One loop of a working day on the floor — click a chapter card to jump the loop around.",
  caption = "Loop 0:05 · Shot in Jönköping",
  tone = "paper",
  src = "/showcase/video/background-loop.mp4",
  poster = "/showcase/video/background-loop-poster.webp",
  chapters = DEFAULT_CHAPTERS,
  className,
}: VideoChapterRailProps) {
  const vidRef = React.useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const [time, setTime] = React.useState(0)
  const [duration, setDuration] = React.useState(5)
  const [emblaRef] = useEmblaCarousel({ dragFree: true, containScroll: "keepSnaps", align: "start" })

  const activeIndex = React.useMemo(() => {
    let idx = 0
    chapters.forEach((c, i) => {
      if (time + 0.001 >= c.at) idx = i
    })
    return idx
  }, [time, chapters])

  const toggle = () => {
    const v = vidRef.current
    if (!v) return
    if (v.paused) void v.play()
    else v.pause()
  }

  const seek = (at: number) => {
    const v = vidRef.current
    if (!v) return
    v.currentTime = at
    setTime(at)
  }

  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", cn(className))}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", false ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", false ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", false ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>

      <InView once className="mt-10">
        <div className="group relative overflow-hidden rounded-[18px] border bg-muted">
          <video
            ref={vidRef}
            src={src}
            poster={poster}
            controls={false}
            muted
            loop
            playsInline
            preload="metadata"
            className="block aspect-video w-full object-cover"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 5)}
          />
          <Button type='button' onClick={toggle} aria-label={playing ? "Pause video" : "Play video"} className={cn(
              "absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-foreground text-background shadow-lg transition-opacity duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              playing && "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
            )} variant="default">
            {playing ? <Pause className="size-6 fill-current" aria-hidden /> : <Play className="size-6 translate-x-0.5 fill-current" aria-hidden />}
          </Button>
          <p className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-border bg-background/85 px-3 py-1 font-mono text-[11px] font-bold tabular-nums text-foreground shadow-sm backdrop-blur">
            {fmt(time)} <span className="text-muted-foreground">/ {fmt(duration)}</span>
          </p>
        </div>
      </InView>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />Chapters</span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Drag or click</span>
        </div>
        <div ref={emblaRef} className="mt-4 cursor-grab overflow-hidden active:cursor-grabbing">
          <div className="flex gap-4">
            {chapters.map((c, i) => {
              const active = i === activeIndex
              return (
                <Button type='button' key={c.at} onClick={() => seek(c.at)} aria-current={active ? "true" : undefined} aria-label={`Jump to chapter ${i + 1}: ${c.title} at ${fmt(c.at)}`} className={cn(
                    "block h-auto w-[240px] flex-none whitespace-normal rounded-xl border p-4 text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "border-primary bg-card" : "border-border bg-card hover:border-foreground/30",
                  )} variant="default">
                  <div className="flex items-center justify-between">
                    <span className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.2em]", active ? "text-foreground" : "text-muted-foreground")}>{fmt(c.at)}</span>
                    {active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-background">
                        <span aria-hidden className="size-1 rounded-full bg-background" /> Now
                      </span>
                    ) : (
                      <span className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.2em] opacity-60 tabular-nums", "text-muted-foreground")}>{String(i + 1).padStart(2, "0")}<span className="opacity-50"> / {String(chapters.length).padStart(2, "0")}</span></span>
                    )}
                  </div>
                  <p className={cn("mt-3 font-display text-base font-bold tracking-tight", active ? "text-foreground" : "text-foreground/70")}>{c.title}</p>
                  {c.note && <p className="mt-1 text-xs font-medium leading-relaxed text-muted-foreground">{c.note}</p>}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        <span>{caption}</span>
        <span aria-hidden>●</span>
      </p>
    
  </div>
</section>
  )
}
