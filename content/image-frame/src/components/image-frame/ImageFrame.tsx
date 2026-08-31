import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { CornerTicks, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Image frame — a packaged image with viewfinder chrome.
// ═══ EMOTION     Framed, deliberate, museum-like.
// ═══ SIGNATURE   An image inside a shot-frame with corner ticks + a caption rule.

export type ImageFrameProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  src?: string
  alt?: string
  caption?: string
  aspect?: string
  tone?: "paper" | "ink"
  className?: string
}

export function ImageFrame({
  eyebrow = "FRAME",
  title = "A frame for the shot.",
  subtitle = "The image sits inside a viewfinder — corner ticks, a caption rail, no clutter.",
  src = "/frames/frame_0008.webp",
  alt = "Framed shot",
  caption = "FRAME 01 · EVENING LIGHT",
  aspect = "aspect-[4/3]",
  tone = "paper",
  className,
}: ImageFrameProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={920} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0, scale: 0.97 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <figure className="mt-10">
          <div className={cn("relative overflow-hidden rounded-[24px] border bg-muted shadow-2xl", aspect)}>
            <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
            <CornerTicks size={18} offset={14} className="text-background" />
          </div>
          {caption && (
            <figcaption className={cn("mt-3 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]", ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground")}>
              <span>{caption}</span>
              <span aria-hidden>●</span>
            </figcaption>
          )}
        </figure>
      </InView>
    </SectionShell>
  )
}
