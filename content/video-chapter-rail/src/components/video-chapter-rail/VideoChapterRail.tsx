import * as React from "react"
import { useEmblaCarousel } from "embla-carousel-react"
import { Pause, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, Ordinal, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

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
    <SectionShell tone={tone} width={1120} rule="bottom" className={cn(className)}>
      <InView>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
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
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause video" : "Play video"}
            className={cn(
              "absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-foreground text-background shadow-lg transition-opacity duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              playing && "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
            )}
          >
            {playing ? <Pause className="size-6 fill-current" aria-hidden /> : <Play className="size-6 translate-x-0.5 fill-current" aria-hidden />}
          </button>
          <p className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-border bg-background/85 px-3 py-1 font-mono text-[11px] font-bold tabular-nums text-foreground shadow-sm backdrop-blur">
            {fmt(time)} <span className="text-muted-foreground">/ {fmt(duration)}</span>
          </p>
        </div>
      </InView>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <MonoLabel className="text-muted-foreground">Chapters</MonoLabel>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Drag or click</span>
        </div>
        <div ref={emblaRef} className="mt-4 cursor-grab overflow-hidden active:cursor-grabbing">
          <div className="flex gap-4">
            {chapters.map((c, i) => {
              const active = i === activeIndex
              return (
                <button
                  key={c.at}
                  type="button"
                  onClick={() => seek(c.at)}
                  aria-current={active ? "true" : undefined}
                  aria-label={`Jump to chapter ${i + 1}: ${c.title} at ${fmt(c.at)}`}
                  className={cn(
                    "w-[240px] flex-none rounded-xl border p-4 text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "border-primary bg-card" : "border-border bg-card hover:border-foreground/30",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.2em]", active ? "text-foreground" : "text-muted-foreground")}>{fmt(c.at)}</span>
                    {active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-background">
                        <span aria-hidden className="size-1 rounded-full bg-background" /> Now
                      </span>
                    ) : (
                      <Ordinal n={i + 1} total={chapters.length} className="text-muted-foreground" />
                    )}
                  </div>
                  <p className={cn("mt-3 font-display text-base font-bold tracking-tight", active ? "text-foreground" : "text-foreground/70")}>{c.title}</p>
                  {c.note && <p className="mt-1 text-xs font-medium leading-relaxed text-muted-foreground">{c.note}</p>}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        <span>{caption}</span>
        <span aria-hidden>●</span>
      </p>
    </SectionShell>
  )
}
