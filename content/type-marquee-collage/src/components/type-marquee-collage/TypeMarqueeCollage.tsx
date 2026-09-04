import * as React from "react"
import { InView } from "@/components/primitives/in-view"

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

const DEFAULT_ITEMS: MarqueeCollageItem[] = [
  { kind: "image", src: "/frames/frame_0002.webp" },
  { kind: "word", text: "Quiet Times" },
  { kind: "image", src: "/frames/frame_0005.webp" },
  { kind: "word", text: "Studio" },
  { kind: "image", src: "/frames/frame_0009.webp" },
  { kind: "word", text: "Jönköping" },
]

export function TypeMarqueeCollage({ eyebrow = "COLLAGE", title = "Images and words, on a loop.", items = DEFAULT_ITEMS, reverse = false, className }: TypeMarqueeCollageProps) {
  const key = reverse ? "collage-rev" : "collage-fwd"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-5 sm:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1280), ["--shell-w" as string]: `${(1280)}px` }}>

      <style>{`@keyframes ${key} { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", false ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", false ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
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
                <span key={i} className="shrink-0 whitespace-nowrap font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl">{it.text}</span>
              )
            )}
          </div>
        </div>
      </InView>
    
  </div>
</section>
  )
}
