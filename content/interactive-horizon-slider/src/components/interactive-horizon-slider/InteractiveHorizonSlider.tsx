import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { ImageComparison, ImageComparisonImage, ImageComparisonSlider } from "@/components/primitives/image-comparison"
import { cn } from "@/lib/utils"


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
  before = { src: "/showcase/content/content-01-office.webp", alt: "Before" },
  after = { src: "/showcase/content/content-02-team.webp", alt: "After" },
  labelBefore = "SKETCH",
  labelAfter = "BUILT",
  className,
}: InteractiveHorizonSliderProps) {
  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", false ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", false ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <InView once variants={{ hidden: { opacity: 0, scale: 0.98 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div className="mt-10 overflow-hidden rounded-xl border bg-muted">
          <ImageComparison enableHover className="relative aspect-[16/9] w-full">
            <ImageComparisonImage src={before.src} alt={before.alt ?? "Before"} position="right" />
            <ImageComparisonImage src={after.src} alt={after.alt ?? "After"} position="left" />
            <ImageComparisonSlider className="bg-foreground">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-background text-sm font-bold shadow-lg">⇄</span>
            </ImageComparisonSlider>
            <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-[hsl(var(--overlay-bg)/0.6)] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--overlay-fg))]">{labelBefore}</span>
            <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-[hsl(var(--overlay-bg)/0.6)] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--overlay-fg))]">{labelAfter}</span>
          </ImageComparison>
        </div>
        <p className="mt-3 text-right font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">DRAG THE HANDLE</p>
      </InView>
    
  </div>
</section>
  )
}
