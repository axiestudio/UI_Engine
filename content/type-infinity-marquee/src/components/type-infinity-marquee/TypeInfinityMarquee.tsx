import * as React from "react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Infinity marquee — a seamless word stream that never ends.
// ═══ EMOTION     Hypnotic rhythm.
// ═══ SIGNATURE   Continuous marquee of phrases with mask edges and hover pause.

export type TypeInfinityMarqueeProps = {
  eyebrow?: string
  title?: React.ReactNode
  phrases?: string[]
  reverse?: boolean
  className?: string
}

export function TypeInfinityMarquee({ eyebrow = "STREAM", title = "On and on.", phrases = ["design", "motion", "tokens", "accessibility", "shipping", "sections"], reverse = false, className }: TypeInfinityMarqueeProps) {
  const key = reverse ? "infRev" : "infFwd"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1280), ["--shell-w" as string]: `${(1280)}px` }}>

      <style>{`@keyframes ${key} { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", false ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", false ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
        <div className="mt-10 overflow-hidden border-y [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          <div className="flex w-max items-center gap-8 py-6 hover:[animation-play-state:paused]" style={{ animation: `${key} 28s linear infinite` }}>
            {[...phrases, ...phrases].map((p, i) => (
              <span key={i} className="flex items-center gap-8 font-display text-5xl font-bold uppercase tracking-tight sm:text-7xl">
                {p}
                <span className="text-2xl text-muted-foreground/40">·</span>
              </span>
            ))}
          </div>
        </div>
      </InView>
    
  </div>
</section>
  )
}
