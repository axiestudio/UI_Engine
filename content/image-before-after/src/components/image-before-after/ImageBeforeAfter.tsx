import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { ImageComparison, ImageComparisonImage, ImageComparisonSlider } from "@/components/primitives/image-comparison"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Before / after comparison slider.
// ═══ EMOTION     Show the transformation.
// ═══ SIGNATURE   A draggable image-comparison slider between two frames.

export type ImageBeforeAfterProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  before?: { src: string; alt?: string }
  after?: { src: string; alt?: string }
  labelBefore?: string
  labelAfter?: string
  tone?: "paper" | "ink"
  className?: string
}

export function ImageBeforeAfter({
  eyebrow = "TRANSFORM",
  title = "See the difference.",
  subtitle = "Drag the handle to compare before and after — the slider rides between two frames.",
  before = { src: "/showcase/content/content-01-office.webp", alt: "Before" },
  after = { src: "/showcase/content/content-02-team.webp", alt: "After" },
  labelBefore = "BEFORE",
  labelAfter = "AFTER",
  tone = "paper",
  className,
}: ImageBeforeAfterProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0, scale: 0.97 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div className="mt-10 overflow-hidden rounded-xl border bg-muted">
          <ImageComparison enableHover className="relative aspect-[16/10] w-full">
            <ImageComparisonImage src={before.src} alt={before.alt ?? "Before"} position="right" />
            <ImageComparisonImage src={after.src} alt={after.alt ?? "After"} position="left" />
            <ImageComparisonSlider className="bg-foreground">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-xs font-bold shadow-lg">⇄</span>
            </ImageComparisonSlider>
            <span className={cn("pointer-events-none absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white")}>{labelBefore}</span>
            <span className={cn("pointer-events-none absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white")}>{labelAfter}</span>
          </ImageComparison>
        </div>
      </InView>
    </SectionShell>
  )
}
