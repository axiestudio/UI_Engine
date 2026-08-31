import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Parallax-depth hero — a layered scene that drifts at multiple speeds.
// ═══ EMOTION     Deep, atmospheric.
// ═══ SIGNATURE   Foreground, midground, background layers translating on scroll.

export type HeroParallaxDepthProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: { label: string; href?: string }[]
  layers?: { src?: string }[]
  tone?: "paper" | "ink"
  className?: string
}

export function HeroParallaxDepth({ eyebrow = "DEPTH", title = "A scene with air between the layers.", subtitle = "Scroll to let the foreground, midground and background drift at their own pace.", actions = [{ label: "Enter", href: "#" }], layers = [
  { src: "/showcase/gallery-04.webp" }, { src: "/showcase/gallery-03.webp" }, { src: "/showcase/gallery-01.webp" },
], tone = "paper", className }: HeroParallaxDepthProps) {
  const ink = tone === "ink"
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const yBg = useTransform(scrollYProgress, [0, 1], [60, -60])
  const yMid = useTransform(scrollYProgress, [0, 1], [120, -140])
  const yFg = useTransform(scrollYProgress, [0, 1], [200, -260])
  return (
    <section ref={ref} className={cn("relative isolate overflow-hidden py-16 sm:py-24", ink && "bg-foreground text-background", className)}>
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className="max-w-2xl">
            <MonoLabel className={ink ? "text-background/55" : "text-muted-foreground"}>{eyebrow}</MonoLabel>
            <h1 className="mt-4 font-display text-4xl font-black leading-[0.98] tracking-[-0.035em] sm:text-6xl">{title}</h1>
            <p className={cn("mt-4 text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>
            <div className="mt-6 flex gap-3">
              {actions.map((a) => <Button key={a.label} size="lg" onClick={() => { if (a.href) window.location.href = a.href }} className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-widest">{a.label}</Button>)}
            </div>
          </div>
        </InView>
      </div>
      <div className="relative mt-12 h-[320px] overflow-hidden sm:h-[420px]">
        <motion.div style={{ y: yBg }} className="absolute inset-0">
          <LayerImg src={layers[0]?.src} className="opacity-60" />
        </motion.div>
        <motion.div style={{ y: yMid }} className="absolute inset-0">
          <LayerImg src={layers[1]?.src} className="opacity-85 mx-[8%]" />
        </motion.div>
        <motion.div style={{ y: yFg }} className="absolute inset-0">
          <LayerImg src={layers[2]?.src} className="mx-[18%] shadow-2xl" />
        </motion.div>
      </div>
    </section>
  )
}

function LayerImg({ src, className }: { src?: string; className?: string }) {
  return <div className={cn("img-hover-wash h-full overflow-hidden rounded-2xl border", className)}>{src ? <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}</div>
}
