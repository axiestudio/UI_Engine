import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"

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

const DEFAULT_TILES = [
  { id: "f1", title: "Dovetails", body: "Cut by hand, fitted to a paper's width.", src: "/showcase/gallery-02.webp", tag: "joinery" },
  { id: "f2", title: "Drawers", body: "Felt-lined bottoms, full extension.", src: "/showcase/gallery-03.webp", tag: "hardware" },
  { id: "f3", title: "Tops", body: "Stave-glued so the grain runs true.", src: "/showcase/gallery-05.webp", tag: "timber" },
  { id: "f4", title: "Feet", body: "Thirty millimetres of levelling travel.", src: "/showcase/gallery-06.webp", tag: "details" },
]
export function ScrollFlipTiles({ eyebrow = "FLIP", title = "Cards with a second side.", tiles = DEFAULT_TILES, tone = "paper", className }: ScrollFlipTilesProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-5 sm:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
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
    
  </div>
</section>
  )
}
