import * as React from "react"
import { motion, useInView, useMotionValue, useSpring } from "motion/react"

import { cn } from "@/lib/utils"

// ═══ JOB         Reveal an image through a widening slit.
// ═══ EMOTION     A shutter opens onto the picture.
// ═══ SIGNATURE   clip-path inset from a centre slit → full frame, tied to view.

export type RevealImageMaskProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  src: string
  alt?: string
  caption?: React.ReactNode
  tone?: "paper" | "ink"
  className?: string
}

export function RevealImageMask({
  eyebrow = "MASKS",
  title = "A picture parts.",
  subtitle = "The frame opens from a hairline slit in the middle, like curtains over a window.",
  src,
  alt = "",
  caption,
  tone = "paper",
  className,
}: RevealImageMaskProps) {
  const ink = tone === "ink"
  const figRef = React.useRef<HTMLDivElement>(null)
  const inView = useInView(figRef, { once: true, amount: 0.3 })
  const open = useMotionValue(0)
  const openSpring = useSpring(open, { stiffness: 160, damping: 26 })
  const [clipH, setClip] = React.useState<{ clipPath: string }>({ clipPath: "inset(50% 0% 50% 0%)" })
  const [scale, setScale] = React.useState(1.15)
  React.useEffect(() => {
    if (inView) { open.set(1) }
  }, [inView, open])
  React.useEffect(() => {
    const unsub = openSpring.on("change", (v) => {
      setClip({ clipPath: `inset(${50 - 50 * v}% 0% ${50 - 50 * v}% 0%)` })
      setScale(1.15 - 0.15 * v)
    })
    return unsub
  }, [openSpring])

  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute top-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-t border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <div className={cn("grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center", ink && "text-background")}>
        <div>
          <p className="font-mono text-[11px] font-bold tracking-[0.25em] text-muted-foreground">{eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-[0.98] tracking-[-0.03em] sm:text-4xl">{title}</h2>
          {subtitle && <p className={cn("mt-4 max-w-md text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>}
        </div>

        <figure>
          <div ref={figRef} className="relative overflow-hidden rounded-[24px] bg-muted">
            <img
              src={src}
              alt={alt}
              style={{ clipPath: clipH.clipPath, transform: `scale(${scale})` }}
              className="aspect-[4/3] w-full object-cover will-change-[clip-path,transform]"
            />
          </div>
          {caption && <figcaption className="mt-3 font-mono text-[11px] font-bold tracking-widest text-muted-foreground">{caption}</figcaption>}
        </figure>
      </div>
    
  </div>
</section>
  )
}
