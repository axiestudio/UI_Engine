import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
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
  { src: "/frames/frame_0008.webp" }, { src: "/frames/frame_0020.webp" }, { src: "/frames/frame_0032.webp" },
  { src: "/frames/frame_0044.webp" }, { src: "/frames/frame_0056.webp" }, { src: "/frames/frame_0068.webp" },
], reverse = false, tone = "paper", className }: MediaImageMarqueeProps) {
  const ink = tone === "ink"
  const anim = reverse ? "marquee-rev" : "marquee-fwd"
  const key = reverse ? "marqueeRev" : "marqueeFwd"
  return (
    <SectionShell tone={tone} width={1280} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
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
    </SectionShell>
  )
}
