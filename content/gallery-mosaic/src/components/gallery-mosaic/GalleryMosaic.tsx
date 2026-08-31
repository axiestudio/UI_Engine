import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Gallery mosaic — an asymmetric mixed-size image collage.
// ═══ EMOTION     Curated, editorial collage.
// ═══ SIGNATURE   A 12-span mosaic grid where some tiles span 2x1 / 1x2.

export type MosaicFrame = { id: string; src?: string; alt?: string; span?: string }

export type GalleryMosaicProps = {
  eyebrow?: string
  title?: React.ReactNode
  frames: MosaicFrame[]
  tone?: "paper" | "ink"
  className?: string
}

export function GalleryMosaic({ eyebrow = "MOSAIC", title = "A spread, not a grid.", frames, tone = "paper", className }: GalleryMosaicProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={1280} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
        <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {frames.map((f) => (
            <div key={f.id} className={cn("img-hover-wash overflow-hidden rounded-xl border bg-muted", f.span ?? "aspect-square")}>
              {f.src ? <img src={f.src} alt={f.alt ?? ""} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
            </div>
          ))}
        </div>
      </InView>
    </SectionShell>
  )
}
