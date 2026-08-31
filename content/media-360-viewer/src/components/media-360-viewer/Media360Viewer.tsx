import * as React from "react"
import { motion, useMotionValue, useTransform, useSpring, animate } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Drag-to-spin 360 viewer — spin a product through a frame strip.
// ═══ EMOTION     Tangible product feel.
// ═══ SIGNATURE   Draggable scrubber that cycles frames by horizontal drag.

export type Media360ViewerProps = {
  eyebrow?: string
  title?: React.ReactNode
  frames?: { src?: string; alt?: string }[]
  hint?: string
  tone?: "paper" | "ink"
  className?: string
}

export function Media360Viewer({ eyebrow = "360°", title = "Give it a spin.", frames = [
  { src: "/showcase/content/content-01-office.webp" }, { src: "/showcase/content/content-02-team.webp" }, { src: "/showcase/content/content-03-product.webp" },
  { src: "/showcase/content/content-04-architecture.webp" }, { src: "/showcase/content/content-05-workshop.webp" }, { src: "/showcase/content/content-06-nature.webp" },
], hint = "DRAG TO ROTATE", tone = "paper", className }: Media360ViewerProps) {
  const ink = tone === "ink"
  const boxRef = React.useRef<HTMLDivElement>(null)
  const dragX = useMotionValue(0)
  const spring = useSpring(dragX, { stiffness: 90, damping: 16 })
  const [frame, setFrame] = React.useState(0)

  React.useEffect(() => {
    const unsub = spring.on("change", (v) => {
      const n = frames.length
      const idx = ((Math.floor(v / 60) % n) + n) % n
      setFrame(idx)
    })
    return unsub
  }, [spring, frames.length])

  const reset = () => animate(dragX, 0, { duration: 0.6, ease: [0.16, 1, 0.3, 1] })

  return (
    <SectionShell tone={tone} width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0, scale: 0.97 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div
          ref={boxRef}
          className="relative mt-10 overflow-hidden rounded-xl border bg-muted"
          style={{ cursor: "grab", touchAction: "none" }}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId) }}
        >
          <motion.div
            className="motion-reduce:hidden"
            style={{ x: dragX }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={reset}
          >
            <div className="flex">
              {frames.map((f, i) => (
                <div key={i} className="aspect-video w-full shrink-0">
                  {f.src ? <img src={f.src} alt={f.alt ?? ""} draggable={false} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
                </div>
              ))}
            </div>
          </motion.div>
          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">{hint}</span>
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/50 px-2 py-1 font-mono text-[10px] font-bold text-white">{frame + 1}/{frames.length}</span>
        </div>
      </InView>
    </SectionShell>
  )
}
