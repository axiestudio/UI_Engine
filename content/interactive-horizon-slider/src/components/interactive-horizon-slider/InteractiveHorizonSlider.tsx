import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { ImageComparison, ImageComparisonImage, ImageComparisonSlider } from "@/components/primitives/image-comparison"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"

// ═══ JOB         Horizon slider — a draggable reveal toggling two interpretations.
// ═══ EMOTION     See both sides.
// ═══ SIGNATURE   A draggable before/after that flips a caption beneath.

export type InteractiveHorizonSliderProps = {
  eyebrow?: string
  title?: React.ReactNode
  before?: { src: string; alt?: string }
  after?: { src: string; alt?: string }
  labelBefore?: string
  labelAfter?: string
  className?: string
}

export function InteractiveHorizonSlider({
  eyebrow = "REVEAL",
  title = "Two ways to see it.",
  before = { src: "/frames/frame_0032.webp", alt: "Before" },
  after = { src: "/frames/frame_0044.webp", alt: "After" },
  labelBefore = "SKETCH",
  labelAfter = "BUILT",
  className,
}: InteractiveHorizonSliderProps) {
  return (
    <SectionShell width={920} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0, scale: 0.98 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div className="mt-10 overflow-hidden rounded-2xl border bg-muted">
          <ImageComparison enableHover className="relative aspect-[16/9] w-full">
            <ImageComparisonImage src={before.src} alt={before.alt ?? "Before"} position="right" />
            <ImageComparisonImage src={after.src} alt={after.alt ?? "After"} position="left" />
            <ImageComparisonSlider className="bg-foreground">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-background text-sm font-bold shadow-lg">⇄</span>
            </ImageComparisonSlider>
            <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">{labelBefore}</span>
            <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">{labelAfter}</span>
          </ImageComparison>
        </div>
        <p className="mt-3 text-right font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">DRAG THE HANDLE</p>
      </InView>
    </SectionShell>
  )
}
