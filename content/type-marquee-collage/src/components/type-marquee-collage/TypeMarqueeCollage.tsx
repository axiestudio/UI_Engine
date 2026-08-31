import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Marquee collage — an infinite strip of images interleaved with words.
// ═══ EMOTION     A running scrapbook.
// ═══ SIGNATURE   One marquee track where image chips and word chips alternate.

export type MarqueeCollageItem = { kind: "image" | "word"; src?: string; text?: string }

export type TypeMarqueeCollageProps = {
  eyebrow?: string
  title?: React.ReactNode
  items: MarqueeCollageItem[]
  reverse?: boolean
  className?: string
}

export function TypeMarqueeCollage({ eyebrow = "COLLAGE", title = "Images and words, on a loop.", items, reverse = false, className }: TypeMarqueeCollageProps) {
  const key = reverse ? "collage-rev" : "collage-fwd"
  return (
    <SectionShell width={1280} grain rule="bottom" className={className}>
      <style>{`@keyframes ${key} { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
        <div className="relative mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          <div className="flex w-max items-center gap-4 py-2 hover:[animation-play-state:paused]" style={{ animation: `${key} 34s linear infinite` }}>
            {[...items, ...items].map((it, i) =>
              it.kind === "image" ? (
                <div key={i} className="img-hover-wash h-28 w-44 shrink-0 overflow-hidden rounded-xl border bg-muted">
                  {it.src ? <img src={it.src} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
                </div>
              ) : (
                <span key={i} className="shrink-0 whitespace-nowrap font-display text-4xl font-black uppercase tracking-tight sm:text-5xl">{it.text}</span>
              )
            )}
          </div>
        </div>
      </InView>
    </SectionShell>
  )
}
