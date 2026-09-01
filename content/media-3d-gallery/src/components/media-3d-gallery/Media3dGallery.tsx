import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"

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

const DEFAULT_FRAMES = [
  { id: "f1", src: "/showcase/gallery-01.webp", alt: "Showroom long shot" },
  { id: "f2", src: "/showcase/gallery-02.webp", alt: "Oak detail" },
  { id: "f3", src: "/showcase/gallery-03.webp", alt: "Brass hardware" },
  { id: "f4", src: "/showcase/gallery-04.webp", alt: "Studio corner" },
  { id: "f5", src: "/showcase/gallery-05.webp", alt: "Freshly oiled top" },
  { id: "f6", src: "/showcase/gallery-06.webp", alt: "Evening bench" },
]
export function Media3dGallery({ eyebrow = "DEPTH", title = "A deep carousel.", frames = DEFAULT_FRAMES, tone = "paper", className }: Media3dGalleryProps) {
  const ink = tone === "ink"
  const [active, setActive] = React.useState(0)
  const n = frames.length
  const cycle = (d: number) => setActive((a) => (a + d + n) % n)

  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1280), ["--shell-w" as string]: `${(1280)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
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
    
  </div>
</section>
  )
}
