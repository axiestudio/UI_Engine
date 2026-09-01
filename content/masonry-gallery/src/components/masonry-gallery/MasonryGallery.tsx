import * as React from "react"
import { InView } from "@/components/primitives/in-view"

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
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1280), ["--shell-w" as string]: `${(1280)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
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
    
  </div>
</section>
  )
}
