import * as React from "react"
import { Play } from "lucide-react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Video hover mask — a grid where the hovered card inhales a mask + plays.
// ═══ EMOTION     Peek and play.
// ═══ SIGNATURE   Cards reveal a masked hover state + embedded video playback.

export type VideoMaskCard = { id: string; title?: string; meta?: string; src?: string }

export type MediaVideoHoverMaskProps = {
  eyebrow?: string
  title?: React.ReactNode
  cards: VideoMaskCard[]
  className?: string
}

const DEFAULT_CARDS = [
  { id: "m1", title: "First cut", meta: "0:42", src: "/showcase/video/bench.mp4" },
  { id: "m2", title: "The glue-up", meta: "1:18", src: "/showcase/video/build.mp4" },
  { id: "m3", title: "Final fit", meta: "0:56", src: "/showcase/video/studio.mp4" },
]
export function MediaVideoHoverMask({ eyebrow = "MASK", title = "Hover to unmask.", cards = DEFAULT_CARDS, className }: MediaVideoHoverMaskProps) {
  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-5 sm:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", false ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", false ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {cards.map((c, i) => (
          <InView key={c.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}>
            <HoverCard card={c} />
          </InView>
        ))}
      </div>
    
  </div>
</section>
  )
}

function HoverCard({ card }: { card: VideoMaskCard }) {
  const ref = React.useRef<HTMLVideoElement>(null)
  const [hover, setHover] = React.useState(false)
  React.useEffect(() => {
    const v = ref.current
    if (!v) return
    if (hover) { v.play().catch(() => {}) } else { v.pause(); v.currentTime = 0 }
  }, [hover])
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-foreground"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="relative aspect-[4/3]">
        <video ref={ref} className="h-full w-full scale-105 object-cover" src={card.src ?? "/showcase/content/video/editorial-drift.mp4"} loop muted playsInline preload="metadata" />
        {/* masked wipe */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/90 p-3 text-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
          <Play className="h-4 w-4 ml-0.5" />
        </div>
        <span className="absolute left-1/2 top-1/2 h-[150%] w-[0%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--primary)/0.2)] blur-2xl transition-all duration-500 group-hover:w-[130%]" />
      </div>
      <div className="flex items-center justify-between p-4">
        <p className="font-display text-sm font-bold">{card.title ?? `Clip ${card.id}`}</p>
        {card.meta && <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{card.meta}</span>}
      </div>
    </div>
  )
}
