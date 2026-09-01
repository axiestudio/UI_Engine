import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { Button } from "@/components/ui/button"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         A masked content band that parallaxes as you scroll it in.
// ═══ EMOTION     Depth — layers move at different rates.
// ═══ SIGNATURE   The heading and image drift on opposing parallax inside the reveal.

export type RevealParallaxProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  /** Array of fact tiles shown alongside. */
  rows?: { id?: string; label: string; value: string }[]
  /** A background image for the parallax layer. */
  imageSrc?: string
  imageAlt?: string
  action?: { label: string; href?: string; onClick?: () => void }
  tone?: "paper" | "ink"
  className?: string
}

export function RevealParallax({
  eyebrow = "DEPTH",
  title = "Layers, not lines.",
  subtitle = "As the band enters, its layers drift apart — the image faster than the copy.",
  rows = [
    { id: "a", label: "Shift", value: "1.5x" },
    { id: "b", label: "Tone", value: "photo" },
    { id: "c", label: "Mask", value: "clip" },
  ],
  imageSrc,
  imageAlt = "",
  action,
  tone = "paper",
  className,
}: RevealParallaxProps) {
  const ink = tone === "ink"
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const imgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"])
  const textY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"])
  const maskReveal = useTransform(scrollYProgress, [0, 0.5], ["inset(0 0 100% 0)", "inset(0 0 0% 0)"])

  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <div ref={ref} className="relative">
        <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <div className={cn("grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center", ink && "text-background")}>
            <div className="relative overflow-hidden rounded-[24px] bg-muted">
              <motion.div style={{ y: imgY, scale: 1.15 }} className="absolute inset-0">
                {imageSrc ? (
                  <img src={imageSrc} alt={imageAlt} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />
                )}
              </motion.div>
              <motion.div style={{ clipPath: maskReveal }} className="absolute inset-0 z-[2]" />
            </div>

            <motion.div style={{ y: textY }}>
              <p className="font-mono text-[11px] font-bold tracking-[0.25em] text-muted-foreground">{eyebrow}</p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-[0.98] tracking-[-0.03em] sm:text-5xl">{title}</h2>
              {subtitle && <p className={cn("mt-4 max-w-md text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>}
              <dl className="mt-8 grid grid-cols-3 gap-3">
                {rows.map((r) => (
                  <div key={r.id} className="rounded-xl border p-4 text-center">
                    <dt className={cn("text-[11px] font-medium uppercase tracking-widest", ink ? "text-background/60" : "text-muted-foreground")}>{r.label}</dt>
                    <dd className="font-display text-2xl font-bold">{r.value}</dd>
                  </div>
                ))}
              </dl>
              {action && (
                <div className="mt-8">
                  <Button onClick={action.onClick} asChild={!!action.href && !action.onClick}>
                    {action.href && !action.onClick ? <a href={action.href}>{action.label}</a> : action.label}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </InView>
        {!ink && <span aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", z-[1])}><Noise patternAlpha={Math.round((0.04) * 255)} patternSize={240} patternRefreshInterval={3} /></span>}
      </div>
    
  </div>
</section>
  )
}
