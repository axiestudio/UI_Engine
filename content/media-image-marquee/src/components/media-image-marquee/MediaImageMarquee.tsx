import * as React from "react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Image marquee — an infinite strip of images drifting along one row.
// ═══ EMOTION     Continuous, rhythmic.
// ═══ SIGNATURE   An infinite CSS-keyframe marquee of framed images with mask edges.

export type MediaImageMarqueeProps = {
  eyebrow?: string
  title?: React.ReactNode
  images?: { src?: string; alt?: string }[]
  reverse?: boolean
  tone?: "paper" | "ink"
  className?: string
}

export function MediaImageMarquee({ eyebrow = "RUNNER", title = "A never-ending strip.", images = [
  { src: "/showcase/content/content-01-office.webp" }, { src: "/showcase/content/content-02-team.webp" }, { src: "/showcase/content/content-03-product.webp" },
  { src: "/showcase/content/content-04-architecture.webp" }, { src: "/showcase/content/content-05-workshop.webp" }, { src: "/showcase/content/content-06-nature.webp" },
], reverse = false, tone = "paper", className }: MediaImageMarqueeProps) {
  const ink = tone === "ink"
  const anim = reverse ? "marquee-rev" : "marquee-fwd"
  const key = reverse ? "marqueeRev" : "marqueeFwd"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-5 sm:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1280), ["--shell-w" as string]: `${(1280)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <style>{`@keyframes ${key} { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
        <div className="relative mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <div className="flex w-max gap-3 hover:[animation-play-state:paused]" style={{ animation: `${anim} 36s linear infinite` }}>
            {[...images, ...images].map((im, i) => (
              <div key={i} className="img-hover-wash aspect-[4/3] w-[300px] shrink-0 overflow-hidden rounded-xl border bg-muted">
                {im.src ? <img src={im.src} alt={im.alt ?? ""} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
              </div>
            ))}
          </div>
        </div>
      </InView>
    
  </div>
</section>
  )
}
