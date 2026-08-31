import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         True masonry gallery — multi-column, variable heights.
// ═══ EMOTION     A gallery that feels curated, not cropped.
// ═══ SIGNATURE   CSS columns masonry with varied aspect ratios.

export type MasonryItem = { id: string; src?: string; alt?: string; ratio?: "tall" | "wide" | "square" | "xtall" }

export type MasonryGalleryProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  items: MasonryItem[]
  columns?: 2 | 3 | 4
  caption?: boolean
  tone?: "paper" | "ink"
  className?: string
}

const RATIOS: Record<NonNullable<MasonryItem["ratio"]>, string> = {
  tall: "aspect-[3/4]",
  xtall: "aspect-[2/3]",
  wide: "aspect-[4/3]",
  square: "aspect-square",
}

export function MasonryGallery({
  eyebrow = "GALLERY",
  title = "A gallery that breathes.",
  subtitle = "Multi-column masonry — images keep their natural proportions.",
  items,
  columns = 3,
  caption = true,
  tone = "paper",
  className,
}: MasonryGalleryProps) {
  const ink = tone === "ink"
  const cols = columns === 2 ? "columns-2" : columns === 4 ? "columns-2 lg:columns-4 sm:columns-3" : "columns-2 lg:columns-3"
  return (
    <SectionShell tone={tone} width={1280} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className={cn("mt-10 gap-4 [column-fill:_balance]", cols)}>
          {items.map((it) => (
            <figure key={it.id} className="mb-4 break-inside-avoid overflow-hidden rounded-xl border bg-muted">
              <div className={cn("img-hover-wash", RATIOS[it.ratio ?? "square"])}>
                {it.src ? <img src={it.src} alt={it.alt ?? ""} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
              </div>
              {caption && it.alt && <figcaption className={cn("px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/55" : "text-muted-foreground")}>{it.alt}</figcaption>}
            </figure>
          ))}
        </div>
      </InView>
    </SectionShell>
  )
}
