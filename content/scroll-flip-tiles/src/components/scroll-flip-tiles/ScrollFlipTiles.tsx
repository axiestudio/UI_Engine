import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Flip-tiles — a grid of cards that flip to their face on hover.
// ═══ EMOTION     A revealing deck.
// ═══ SIGNATURE   RotateY flip on hover from a title face to a detail face.

export type FlipTile = { id: string; title: string; body?: string; src?: string; tag?: string }

export type ScrollFlipTilesProps = {
  eyebrow?: string
  title?: React.ReactNode
  tiles: FlipTile[]
  tone?: "paper" | "ink"
  className?: string
}

export function ScrollFlipTiles({ eyebrow = "FLIP", title = "Cards with a second side.", tiles, tone = "paper", className }: ScrollFlipTilesProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tiles.map((t, i) => (
          <InView key={t.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}>
            <div className="group h-56 [perspective:1200px]">
              <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                <div className={cn("absolute inset-0 flex flex-col justify-between rounded-xl border p-6 [backface-visibility:hidden]", ink ? "border-background/15 bg-card" : "border-border bg-card")}>
                  {t.tag && <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.tag}</span>}
                  <h3 className="font-display text-2xl font-bold">{t.title}</h3>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">HOVER →</span>
                </div>
                <div className={cn("absolute inset-0 flex flex-col justify-center rounded-xl border p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]", ink ? "inner:border-background/20" : "inner:border-border", "bg-foreground text-background")}>
                  <p className="text-sm font-medium leading-relaxed text-background/80">{t.body}</p>
                  {t.src && <img src={t.src} alt="" className="mt-3 aspect-[16/10] rounded-lg object-cover" loading="lazy" />}
                </div>
              </div>
            </div>
          </InView>
        ))}
      </div>
    </SectionShell>
  )
}
