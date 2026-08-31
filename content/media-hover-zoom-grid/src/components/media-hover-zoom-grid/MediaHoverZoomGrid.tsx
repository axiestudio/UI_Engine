import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
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

export function MediaHoverZoomGrid({ eyebrow = "HOVER", title = "Get closer.", tiles, tone = "paper", className }: MediaHoverZoomGridProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={1280} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t, i) => (
          <InView key={t.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}>
            <figure className="group [perspective:1000px]">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl border bg-muted transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:rotate-[0.4deg]">
                {t.src ? <img src={t.src} alt={t.alt ?? ""} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {t.title && <figcaption className="absolute bottom-3 left-3 translate-y-2 font-display text-sm font-bold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">{t.title}</figcaption>}
              </div>
            </figure>
          </InView>
        ))}
      </div>
    </SectionShell>
  )
}
