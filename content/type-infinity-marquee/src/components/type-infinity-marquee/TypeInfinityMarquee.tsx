import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
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
    <SectionShell width={1280} rule="bottom" className={className}>
      <style>{`@keyframes ${key} { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} />
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
    </SectionShell>
  )
}
