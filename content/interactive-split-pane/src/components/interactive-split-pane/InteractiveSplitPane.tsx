import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"

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
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", false ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", false ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
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
    
  </div>
</section>
  )
}
