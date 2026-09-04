import * as React from "react"
import { Tilt } from "@/components/primitives/tilt"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Tilt stack — a stack of tilted cards that fan as you hover.
// ═══ EMOTION     Playful depth.
// ═══ SIGNATURE   Each card is a Tilt surface; hovering fans the row.

export type TiltStackCard = { id: string; title: string; body?: string; src?: string }

export type MediaTiltStackProps = {
  eyebrow?: string
  title?: React.ReactNode
  cards: TiltStackCard[]
  className?: string
}

const DEFAULT_CARDS = [
  { id: "c1", title: "The first bench", body: "Pine, screws slightly proud. Still in use.", src: "/showcase/gallery-01.webp" },
  { id: "c2", title: "The long table", body: "Eleven feet of oak for a bakery that outgrew us.", src: "/showcase/gallery-03.webp" },
  { id: "c3", title: "The quiet cabinet", body: "Felt-lined, brass, no visible fixings.", src: "/showcase/gallery-04.webp" },
]
export function MediaTiltStack({ eyebrow = "TILT", title = "Cards you can nudge.", cards = DEFAULT_CARDS, className }: MediaTiltStackProps) {
  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-5 sm:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", false ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", false ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {cards.map((c, i) => (
          <InView key={c.id} once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}>
            <div className="[perspective:1000px]">
              <Tilt rotationFactor={12} className="h-full">
                <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
                  <div className="img-hover-wash mb-4 aspect-[16/10] overflow-hidden bg-muted">
                    {c.src ? <img src={c.src} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold">{c.title}</h3>
                    {c.body && <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">{c.body}</p>}
                  </div>
                </div>
              </Tilt>
            </div>
          </InView>
        ))}
      </div>
    
  </div>
</section>
  )
}
