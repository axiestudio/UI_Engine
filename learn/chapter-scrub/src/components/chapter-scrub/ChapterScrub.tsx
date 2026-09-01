import * as React from "react"
import { motion } from "motion/react"
import { Clock3, Play } from "lucide-react"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"
import { cva } from "class-variance-authority"
import { Button } from "@/components/ui/button"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
  {
    variants: {
      variant: { default: "bg-primary text-primary-foreground border-transparent hover:bg-primary/90 shadow-sm", outline: "bg-background hover:bg-accent hover:text-accent-foreground" },
      size: { default: "h-8 px-3", sm: "h-7 px-3 text-[11px]" },
    },
    defaultVariants: { variant: "outline", size: "sm" },
  }
)

// ═══ JOB      make long video navigable at a glance
// ═══ EMOTION  calm editorial player — chapters read like a table of contents
// ═══ SIGNATURE scrub bar with segmented markers + keyboard-accessible chapter pills

export type Chapter = { label: string; at: number }
export type ChapterScrubProps = {
  title?: string
  duration?: number
  chapters?: Chapter[]
  poster?: string
  className?: string
  onSeek?: (t: number) => void
}

const DEFAULT_CHAPTERS: Chapter[] = [
  { label: "Why small ships", at: 0 },
  { label: "The two-list method", at: 320 },
  { label: "Cutting scope", at: 780 },
  { label: "Friday demos", at: 1320 },
  { label: "Q&A", at: 1890 },
]

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`

export function ChapterScrub({ title = "Lesson 04 — Shipping small", duration = 2400, chapters = DEFAULT_CHAPTERS, poster, className, onSeek }: ChapterScrubProps) {
  const [t, setT] = React.useState(0)
  const [hover, setHover] = React.useState<Chapter | null>(null)
  const [focusedTick, setFocusedTick] = React.useState<number | null>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const pct = (t / duration) * 100

  const seekTo = (next: number) => {
    const cl = Math.max(0, Math.min(duration, next))
    setT(cl)
    onSeek?.(cl)
  }
  const pctToTime = (clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect()
    if (!r) return
    const p = (clientX - r.left) / r.width
    seekTo(p * duration)
  }

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    pctToTime(e.clientX)
  }
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.buttons !== 1) return
    pctToTime(e.clientX)
  }

  const activeChapter = [...chapters].reverse().find((c) => t >= c.at) ?? chapters[0]

  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", cn(className))}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />VIDEO · CHAPTERS</span>

      <InView once className="mt-6">
        <div className="group relative overflow-hidden rounded-xl border bg-muted">
          <div
            className="grid aspect-video place-items-center bg-foreground text-background"
            style={poster ? { backgroundImage: `url(${poster})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          >
            <Button type='button' aria-label="Play lesson" className="grid size-14 place-items-center rounded-full bg-background text-foreground shadow-sm ring-1 ring-border transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" variant="default">
              <Play className="size-5 translate-x-px fill-current" aria-hidden />
            </Button>
          </div>
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.14em] text-foreground shadow-sm backdrop-blur">
            <Clock3 className="size-3" aria-hidden /> {fmt(duration)}
          </span>
        </div>
      </InView>

      <div className="mt-6 rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-[17px] font-bold leading-tight tracking-tight text-foreground">{title}</h3>
          <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground" aria-live="polite">
            {fmt(t)} / {fmt(duration)}
          </span>
        </div>
        {activeChapter && <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Now: {activeChapter.label}</p>}

        {/* accessible scrubber — visual + hidden range */}
        <div className="relative mt-4 select-none">
          {/* ticks popover */}
          {(hover ?? (focusedTick !== null ? chapters[focusedTick] : null)) && (
            <motion.div
              initial={reduce ? {} : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="pointer-events-none absolute -top-9 z-20 -translate-x-1/2 rounded-md border bg-popover px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-popover-foreground shadow-md"
              style={{ left: `${((hover ?? chapters[focusedTick!])!.at / duration) * 100}%` }}
            >
              {(hover ?? chapters[focusedTick!])!.label} · {fmt((hover ?? chapters[focusedTick!])!.at)}
            </motion.div>
          )}

          <div
            ref={trackRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            className="relative h-12 cursor-ew-resize rounded-lg border bg-muted/40 px-1 py-3"
            role="group"
            aria-label="Video scrubber"
          >
            <div className="relative h-full overflow-hidden rounded-md bg-background">
              <div className="absolute inset-y-0 left-0 bg-foreground/15 transition-[width] duration-150" style={{ width: `${pct}%` }} aria-hidden />
              <motion.span
                aria-hidden
                className="absolute top-1/2 h-6 w-0.5 -translate-y-1/2 rounded bg-foreground shadow-sm"
                style={{ left: `${pct}%` }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }}
              />
              {chapters.map((c, i) => {
                const left = (c.at / duration) * 100
                const reached = t >= c.at
                return (
                  <Button type='button' key={c.label} aria-label={`Jump to ${c.label} at ${fmt(c.at)}`} onClick={() => seekTo(c.at)} onMouseEnter={() => setHover(c)} onMouseLeave={() => setHover(null)} onFocus={() => setFocusedTick(i)} onBlur={() => setFocusedTick(null)} style={{ left: `${left}%` }} className="absolute top-1/2 z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" variant="default">
                    <span className={cn("absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full", reached ? "bg-foreground" : "bg-border")} />
                  </Button>
                )
              })}
            </div>
          </div>

          {/* hidden range for keyboard / screen reader */}
          <label className="sr-only" htmlFor="chapter-scrub-range">
            Seek in video
          </label>
          <input
            id="chapter-scrub-range"
            type="range"
            min={0}
            max={duration}
            step={1}
            value={Math.round(t)}
            onChange={(e) => seekTo(Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Home") seekTo(0)
              if (e.key === "End") seekTo(duration)
            }}
            className="mt-3 w-full accent-foreground"
          />
          <div className="mt-1 flex justify-between font-mono text-[10px] font-medium tabular-nums text-muted-foreground">
            <span>0:00</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {chapters.map((c, i) => {
            const active = t >= c.at && (i === chapters.length - 1 || t < chapters[i + 1]!.at)
            return (
              <Button type='button' key={c.label} onClick={() => seekTo(c.at)} aria-current={active ? "true" : undefined} className={cn(buttonVariants({ variant: active ? "default" : "outline", size: "sm" }), "font-mono text-[10px] font-medium tracking-[0.12em]")} variant="default">
                {String(i + 1).padStart(2, "0")} · {c.label}
              </Button>
            )
          })}
        </div>
      </div>
    
  </div>
</section>
  )
}
