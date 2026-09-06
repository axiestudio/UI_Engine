import * as React from "react"
import { motion, useScroll, useTransform, type MotionValue } from "motion/react"
import { cn } from "@/lib/utils"


// ═══ JOB         Zoom stack — a pinned stage where stacked cards zoom into each other.
// ═══ EMOTION     A camera push through layers.
// ═══ SIGNATURE   Cards scale up and fade as the next one zooms forward.

export type ZoomLayer = { id: string; title: string; body?: string; src?: string }

export type ScrollZoomStackProps = {
  eyebrow?: string
  layers: ZoomLayer[]
  className?: string
}

const DEFAULT_LAYERS = [
  { id: "z1", title: "The room", body: "Six benches under north glass.", src: "/showcase/content/content-05-workshop.webp" },
  { id: "z2", title: "The bench", body: "Flat within a credit card over three metres.", src: "/showcase/gallery-01.webp" },
  { id: "z3", title: "The detail", body: "Dovetails you can run a fingernail across.", src: "/showcase/gallery-02.webp" },
]
export function ScrollZoomStack({ eyebrow = "PUSH", layers = DEFAULT_LAYERS, className }: ScrollZoomStackProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const runway = `${layers.length * 90}vh`
  return (
    <section className={cn("relative isolate w-full", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-5 sm:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
      <div ref={ref} className="relative mt-8" style={{ height: runway }}>
        <div className="sticky top-10 flex h-[76vh] items-center justify-center overflow-hidden rounded-[28px] border bg-foreground">
          {layers.map((l, i) => {
            const start = i / layers.length
            const end = (i + 1) / layers.length
            return <ZoomCard key={l.id} layer={l} progress={scrollYProgress} range={[start, end]} last={i === layers.length - 1} />
          })}
        </div>
      </div>
    
  </div>
</section>
  )
}

function ZoomCard({ layer, progress, range, last }: { layer: ZoomLayer; progress: MotionValue<number>; range: [number, number]; last: boolean }) {
  const enterScale = useTransform(progress, range, [0.7, 1])
  const opacity = useTransform(progress, range, [0, 1])
  const exitScale = useTransform(progress, [range[1], Math.min(1, range[1] + 0.2)], [1, last ? 1 : 1.25])
  const scale = useTransform([enterScale, exitScale], ([a, b]: number[]) => a * b)
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-background" style={{ scale, opacity }}>
      <div className="img-hover-wash mb-6 aspect-[16/9] w-3/4 overflow-hidden rounded-xl border border-background/15">
        {layer.src ? <img src={layer.src} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
      </div>
      <h3 className="font-display text-3xl font-bold sm:text-4xl">{layer.title}</h3>
      {layer.body && <p className="mt-3 max-w-md text-base font-medium text-background/70">{layer.body}</p>}
    </motion.div>
  )
}
