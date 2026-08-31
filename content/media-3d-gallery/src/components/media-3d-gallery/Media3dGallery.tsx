import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         3D gallery — a perspective carousel of images you drag through.
// ═══ EMOTION     Depth, immersive.
// ═══ SIGNATURE   A draggable track with rotateY/translateZ per active tile.

export type Gallery3dFrame = { id: string; src?: string; alt?: string }

export type Media3dGalleryProps = {
  eyebrow?: string
  title?: React.ReactNode
  frames: Gallery3dFrame[]
  tone?: "paper" | "ink"
  className?: string
}

export function Media3dGallery({ eyebrow = "DEPTH", title = "A deep carousel.", frames, tone = "paper", className }: Media3dGalleryProps) {
  const ink = tone === "ink"
  const [active, setActive] = React.useState(0)
  const n = frames.length
  const cycle = (d: number) => setActive((a) => (a + d + n) % n)

  return (
    <SectionShell tone={tone} width={1280} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
        <div className="mt-10 grid [perspective:1400px] place-items-center">
          <div className="relative h-[320px] w-full max-w-3xl [transform-style:preserve-3d]">
            {frames.map((f, i) => {
              const offset = (i - active + n) % n
              const adj = offset > n / 2 ? offset - n : offset
              const x = adj * 150
              const z = Math.abs(adj) * -90
              const opacity = Math.abs(adj) > 1 ? 0 : 1
              return (
                <motion.div
                  key={f.id}
                  animate={{ x, z, rotateY: adj * -16, opacity, scale: adj === 0 ? 1 : 0.92 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-1/2 top-0 h-[300px] w-[420px] -translate-x-1/2 overflow-hidden rounded-xl border bg-muted shadow-2xl"
                  onClick={() => setActive(i)}
                >
                  {f.src ? <img src={f.src} alt={f.alt ?? ""} className="h-full w-full object-cover" draggable={false} /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
                </motion.div>
              )
            })}
          </div>
          <div className="mt-8 flex items-center gap-4">
            <button type="button" onClick={() => cycle(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border hover:bg-accent" aria-label="Previous">←</button>
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{active + 1} / {n}</span>
            <button type="button" onClick={() => cycle(1)} className="flex h-10 w-10 items-center justify-center rounded-full border hover:bg-accent" aria-label="Next">→</button>
          </div>
        </div>
      </InView>
    </SectionShell>
  )
}
