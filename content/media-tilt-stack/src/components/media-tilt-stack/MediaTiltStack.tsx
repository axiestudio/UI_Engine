import * as React from "react"
import { Tilt } from "@/components/primitives/tilt"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
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

export function MediaTiltStack({ eyebrow = "TILT", title = "Cards you can nudge.", cards, className }: MediaTiltStackProps) {
  return (
    <SectionShell width={1120} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} />
      </InView>
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {cards.map((c, i) => (
          <InView key={c.id} once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}>
            <div className="[perspective:1000px]">
              <Tilt rotationFactor={12} className="h-full">
                <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card">
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
    </SectionShell>
  )
}
