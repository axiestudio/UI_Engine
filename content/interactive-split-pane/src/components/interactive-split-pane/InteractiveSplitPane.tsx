import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Split pane — a resizable two-pane comparison you drag between.
// ═══ EMOTION     Control the split.
// ═══ SIGNATURE   Two panes; a draggable divider resizes them live.

export type SplitPaneSide = { title: string; body?: string; src?: string }

export type InteractiveSplitPaneProps = {
  eyebrow?: string
  title?: React.ReactNode
  left: SplitPaneSide
  right: SplitPaneSide
  className?: string
}

const DEFAULT_LEFT = { title: "Drawn first", body: "Full-scale on the shop floor, taped out and argued over.", src: "/showcase/content/content-04-architecture.webp" }
const DEFAULT_RIGHT = { title: "Built once", body: "The drawing becomes the piece; the piece outlives the trend.", src: "/showcase/gallery-01.webp" }
export function InteractiveSplitPane({ eyebrow = "SPLIT", title = "Two ways at once.", left = DEFAULT_LEFT, right = DEFAULT_RIGHT, className }: InteractiveSplitPaneProps) {
  const [split, setSplit] = React.useState(50)
  const boxRef = React.useRef<HTMLDivElement>(null)
  const onMove = (e: React.PointerEvent) => {
    const r = boxRef.current?.getBoundingClientRect()
    if (!r) return
    setSplit(Math.max(20, Math.min(80, ((e.clientX - r.left) / r.width) * 100)))
  }
  return (
    <SectionShell width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0, scale: 0.98 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div ref={boxRef} className="relative mt-10 flex h-[420px] overflow-hidden rounded-xl border"
          onPointerMove={(e) => { if (e.buttons) onMove(e) }}>
          {/* left pane */}
          <div className="flex h-full flex-col justify-between overflow-hidden p-6" style={{ width: `${split}%` }}>
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">A</p>
              <h3 className="mt-2 font-display text-2xl font-bold">{left.title}</h3>
              {left.body && <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">{left.body}</p>}
            </div>
            <div className="img-hover-wash aspect-[16/9] overflow-hidden rounded-xl bg-muted">
              {left.src ? <img src={left.src} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
            </div>
          </div>
          {/* right pane */}
          <div className="flex h-full flex-col justify-between overflow-hidden border-l bg-card shadow-sm p-6" style={{ width: `${100 - split}%` }}>
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">B</p>
              <h3 className="mt-2 font-display text-2xl font-bold">{right.title}</h3>
              {right.body && <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">{right.body}</p>}
            </div>
            <div className="img-hover-wash aspect-[16/9] overflow-hidden rounded-xl bg-muted">
              {right.src ? <img src={right.src} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
            </div>
          </div>
          {/* divider */}
          <div className="absolute inset-y-0 z-20 w-1 cursor-ew-resize -translate-x-1/2 bg-foreground hover:bg-[hsl(var(--primary))]"
            style={{ left: `${split}%` }}
            onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId) }}>
            <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-[11px]">⇔</span>
          </div>
        </div>
      </InView>
    </SectionShell>
  )
}
