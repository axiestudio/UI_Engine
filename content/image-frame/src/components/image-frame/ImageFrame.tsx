import * as React from "react"
import { InView } from "@/components/primitives/in-view"

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
  src = "/showcase/content/content-01-office.webp",
  alt = "Framed shot",
  caption = "FRAME 01 · EVENING LIGHT",
  aspect = "aspect-[4/3]",
  tone = "paper",
  className,
}: ImageFrameProps) {
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
        <figure className="mt-10">
          <div className={cn("relative overflow-hidden rounded-[24px] border bg-muted shadow-2xl", aspect)}>
            <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
            <span aria-hidden className={cn("pointer-events-none absolute inset-0", "text-background")}>
    <span className="absolute border-current top-[14px] left-[14px] border-t border-l" style={{ width: 18, height: 18 }} />
    <span className="absolute border-current top-[14px] right-[14px] border-t border-r" style={{ width: 18, height: 18 }} />
    <span className="absolute border-current bottom-[14px] left-[14px] border-b border-l" style={{ width: 18, height: 18 }} />
    <span className="absolute border-current bottom-[14px] right-[14px] border-b border-r" style={{ width: 18, height: 18 }} />
  </span>
          </div>
          {caption && (
            <figcaption className={cn("mt-3 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]", ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground")}>
              <span>{caption}</span>
              <span aria-hidden>●</span>
            </figcaption>
          )}
        </figure>
      </InView>
    
  </div>
</section>
  )
}
