import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Scroll gallery — a tall gallery where images parallax at different rates.
// ═══ EMOTION     Depth as you scroll.
// ═══ SIGNATURE   Three image columns that scroll at opposing speeds.

export type ScrollGalleryProps = {
  eyebrow?: string
  title?: React.ReactNode
  frames?: { src?: string; alt?: string }[]
  tone?: "paper" | "ink"
  className?: string
}

export function ScrollGallery({ eyebrow = "PARALLAX", title = "A gallery that moves.", frames = [
  { src: "/showcase/content/content-01-office.webp", alt: "1" }, { src: "/showcase/content/content-02-team.webp", alt: "2" },
  { src: "/showcase/content/content-03-product.webp", alt: "3" }, { src: "/showcase/content/content-04-architecture.webp", alt: "4" },
  { src: "/showcase/content/content-05-workshop.webp", alt: "5" }, { src: "/showcase/content/content-06-nature.webp", alt: "6" },
], tone = "paper", className }: ScrollGalleryProps) {
  const ink = tone === "ink"
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y1 = useTransform(scrollYProgress, [0, 1], ["-6%", "10%"])
  const y2 = useTransform(scrollYProgress, [0, 1], ["10%", "-6%"])
  const y3 = useTransform(scrollYProgress, [0, 1], ["-3%", "6%"])
  const cols = [frames.slice(0, 2), frames.slice(2, 4), frames.slice(4, 6)]
  const ys = [y1, y2, y3]
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1280), ["--shell-w" as string]: `${(1280)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <div ref={ref} className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cols.map((col, ci) => (
          <motion.div key={ci} style={{ y: ys[ci] }} className="space-y-4">
            {col.map((f, i) => (
              <div key={i} className="img-hover-wash overflow-hidden rounded-xl border bg-muted">
                {f.src ? <img src={f.src} alt={f.alt ?? ""} className={cn("w-full object-cover", i % 2 === 0 ? "aspect-[3/4]" : "aspect-[4/3]")} loading="lazy" /> : <div className="aspect-[3/4] w-full bg-gradient-to-br from-secondary to-muted" />}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    
  </div>
</section>
  )
}
