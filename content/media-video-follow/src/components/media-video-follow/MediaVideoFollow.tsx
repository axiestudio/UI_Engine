import * as React from "react"
import { Play } from "lucide-react"
import { InView } from "@/components/primitives/in-view"

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
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-foreground/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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

const DEFAULT_POSTS = [
  { id: "v1", title: "Oiling the top", src: "/showcase/video/bench.mp4", kind: "process" },
  { id: "v2", title: "Assembly, timelapse", src: "/showcase/video/build.mp4", kind: "timelapse" },
  { id: "v3", title: "Evening sweep", src: "/showcase/video/studio.mp4", kind: "scene" },
]
export function MediaVideoFollow({ eyebrow = "PLAY", title = "Hover to preview.", posts = DEFAULT_POSTS, tone = "paper", className }: MediaVideoFollowProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-5 sm:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1280), ["--shell-w" as string]: `${(1280)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {posts.map((p, i) => (
          <InView key={p.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}>
            <div className="group relative overflow-hidden rounded-xl border bg-foreground">
              <HoverVideo src={p.src ?? "/showcase/content/video/editorial-drift.mp4"} />
              <div className="flex items-center justify-between p-4">
                <p className="font-display text-sm font-bold">{p.title ?? `Piece ${i + 1}`}</p>
                {p.kind && <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{p.kind}</span>}
              </div>
            </div>
          </InView>
        ))}
      </div>
    
  </div>
</section>
  )
}
