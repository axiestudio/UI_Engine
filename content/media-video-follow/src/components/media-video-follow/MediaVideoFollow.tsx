import * as React from "react"
import { Play } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

function HoverVideo({ src }: { src: string }) {
  const ref = React.useRef<HTMLVideoElement>(null)
  const [hover, setHover] = React.useState(false)
  React.useEffect(() => {
    const v = ref.current
    if (!v) return
    if (hover) { v.play().catch(() => {}) } else { v.pause(); v.currentTime = 0 }
  }, [hover])
  return (
    <div className="relative aspect-[16/10]" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <video ref={ref} className="h-full w-full object-cover" src={src} loop muted playsInline preload="metadata" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background/90 text-foreground"><Play className="h-5 w-5 ml-0.5" /></span>
      </div>
    </div>
  )
}

// ═══ JOB         Video-follow — a row of posts where hovering a card plays its video.
// ═══ EMOTION     Peek-to-play.
// ═══ SIGNATURE   A grid where the hovered card plays its embedded video.

export type VideoPost = { id: string; title?: string; src?: string; kind?: string }

export type MediaVideoFollowProps = {
  eyebrow?: string
  title?: React.ReactNode
  posts: VideoPost[]
  tone?: "paper" | "ink"
  className?: string
}

export function MediaVideoFollow({ eyebrow = "PLAY", title = "Hover to preview.", posts, tone = "paper", className }: MediaVideoFollowProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={1280} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {posts.map((p, i) => (
          <InView key={p.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}>
            <div className="group relative overflow-hidden rounded-2xl border bg-foreground">
              <HoverVideo src={p.src ?? "/videos/hero.mp4"} />
              <div className="flex items-center justify-between p-4">
                <p className="font-display text-sm font-bold">{p.title ?? `Piece ${i + 1}`}</p>
                {p.kind && <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{p.kind}</span>}
              </div>
            </div>
          </InView>
        ))}
      </div>
    </SectionShell>
  )
}
