import * as React from "react"
import { Play } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
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

export function MediaVideoHoverMask({ eyebrow = "MASK", title = "Hover to unmask.", cards, className }: MediaVideoHoverMaskProps) {
  return (
    <SectionShell width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} />
      </InView>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {cards.map((c, i) => (
          <InView key={c.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}>
            <HoverCard card={c} />
          </InView>
        ))}
      </div>
    </SectionShell>
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
