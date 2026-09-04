import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { ImageComparison, ImageComparisonImage, ImageComparisonSlider } from "@/components/primitives/image-comparison"

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
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>
      <InView once variants={{ hidden: { opacity: 0, scale: 0.97 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div className="mt-10 overflow-hidden rounded-xl border bg-muted">
          <ImageComparison enableHover className="relative aspect-[16/10] w-full">
            <ImageComparisonImage src={before.src} alt={before.alt ?? "Before"} position="right" />
            <ImageComparisonImage src={after.src} alt={after.alt ?? "After"} position="left" />
            <ImageComparisonSlider className="bg-foreground">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-xs font-bold shadow-lg">⇄</span>
            </ImageComparisonSlider>
            <span className={cn("pointer-events-none absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground")}>{labelBefore}</span>
            <span className={cn("pointer-events-none absolute right-4 top-4 rounded-full bg-background/85 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground")}>{labelAfter}</span>
          </ImageComparison>
        </div>
      </InView>
    
  </div>
</section>
  )
}
