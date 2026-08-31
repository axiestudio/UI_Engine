import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Panorama drag — an oversize image you drag/scroll through horizontally.
// ═══ EMOTION     A body of landscape, explored.
// ═══ SIGNATURE   A wide scene pinned and pannable by drag or scroll.

export type MediaPanoramaDragProps = {
  eyebrow?: string
  caption?: string
  src?: string
  className?: string
}

export function MediaPanoramaDrag({ eyebrow = "PANORAMA", caption = "DRAG TO PAN", src = "/frames/frame_0068.webp", className }: MediaPanoramaDragProps) {
  const railRef = React.useRef<HTMLDivElement>(null)
  const [dragX, setDragX] = React.useState(0)
  const dragging = React.useRef(false)
  const last = React.useRef(0)
  const onDown = (e: React.PointerEvent) => { dragging.current = true; last.current = e.clientX; (e.target as Element).setPointerCapture?.(e.pointerId) }
  const onMove = (e: React.PointerEvent) => { if (!dragging.current) return; const d = e.clientX - last.current; last.current = e.clientX; setDragX((x) => clamp(x + d, railRef.current, e)) }
  const onUp = () => { dragging.current = false }
  const clamp = (v: number, el: HTMLDivElement | null, e: React.PointerEvent) => {
    const w = el?.scrollWidth ?? 1, vw = el?.clientWidth ?? 1
    return Math.min(0, Math.max(vw - w, v))
  }
  return (
    <SectionShell width={1280} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
      </InView>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
        <div
          ref={railRef}
          className="relative mt-10 h-[52vh] cursor-grab select-none overflow-hidden rounded-2xl border bg-foreground active:cursor-grabbing"
          style={{ touchAction: "none" }}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
        >
          <motion.img src={src} alt="" draggable={false} className="absolute inset-y-0 left-0 h-full w-auto"
            style={{ x: dragX, maxWidth: "none" }} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {caption && <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">{caption}</span>}
        </div>
      </InView>
    </SectionShell>
  )
}
