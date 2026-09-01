import * as React from "react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Hover-zoom grid — tiles that zoom and reveal a title on hover.
// ═══ EMOTION     Curated, tactile.
// ═══ SIGNATURE   A grid where the hovered tile scales and lifts its caption.

export type ZoomTile = { id: string; src?: string; alt?: string; title?: string }

export type MediaHoverZoomGridProps = {
  eyebrow?: string
  title?: React.ReactNode
  tiles: ZoomTile[]
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_TILES = [
  { id: "f1", src: "/showcase/gallery-01.webp", alt: "Detail one", title: "Look closer" },
  { id: "f2", src: "/showcase/gallery-02.webp", alt: "Detail two", title: "Look closer" },
  { id: "f3", src: "/showcase/gallery-03.webp", alt: "Detail three", title: "Look closer" },
  { id: "f4", src: "/showcase/gallery-04.webp", alt: "Detail four", title: "Look closer" },
  { id: "f5", src: "/showcase/gallery-05.webp", alt: "Detail five", title: "Look closer" },
  { id: "f6", src: "/showcase/gallery-06.webp", alt: "Detail six", title: "Look closer" },
]
export function MediaHoverZoomGrid({ eyebrow = "HOVER", title = "Get closer.", tiles = DEFAULT_TILES, tone = "paper", className }: MediaHoverZoomGridProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1280), ["--shell-w" as string]: `${(1280)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t, i) => (
          <InView key={t.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}>
            <figure className="group [perspective:1000px]">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl border bg-muted transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:rotate-[0.4deg]">
                {t.src ? <img src={t.src} alt={t.alt ?? ""} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {t.title && <figcaption className="absolute bottom-3 left-3 translate-y-2 font-display text-sm font-bold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">{t.title}</figcaption>}
              </div>
            </figure>
          </InView>
        ))}
      </div>
    
  </div>
</section>
  )
}
