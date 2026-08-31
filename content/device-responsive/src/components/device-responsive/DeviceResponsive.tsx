import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Lock, MoveHorizontal, Play } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Prove the design survives every viewport — live.
// ═══ EMOTION     Control. "I dragged it; it held."
// ═══ SIGNATURE   The viewport scrubber: drag the frame's edge between
//                 breakpoint markers on a real ruler; it snaps magnetically,
//                 reads its width, and a reel button walks 390 → 834 → 1180.
//                 Chrome stays fixed; the world inside it reflows.

const MIN_W = 320
const BREAKPOINTS = [640, 768, 1024] as const

export type DeviceResponsiveProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  /** Fallback screenshot; pass children to demo a real reflow. */
  src?: string
  alt?: string
  children?: React.ReactNode
  url?: string
  /** Initial viewport width in px (clamped to the stage). */
  initialWidth?: number
  /** Show the reel button that cycles the three signature widths. */
  reel?: boolean
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function DeviceResponsive({
  eyebrow = "RESPONSIVE",
  title = "Drag it. It holds.",
  subtitle = "Grab the frame's edge and scrub the viewport across real breakpoints — the ruler marks sm, md and lg, the readout counts pixels, and everything inside reflows live.",
  src = "/showcase/content/content-02-team.webp",
  alt = "Website reflowing across viewports",
  children,
  url = "studio.example.com",
  initialWidth = 1000,
  reel = true,
  caption = "LIVE VIEWPORT SCRUBBER",
  tone = "paper",
  className,
}: DeviceResponsiveProps) {
  const ink = tone === "ink"
  const reduce = useReducedMotion()
  const stageRef = React.useRef<HTMLDivElement>(null)
  const [stageW, setStageW] = React.useState(1200)
  const [w, setW] = React.useState(initialWidth)
  const [dragging, setDragging] = React.useState(false)
  const [reelIdx, setReelIdx] = React.useState(-1)

  // keep the stage width measured so clamps + ruler stay honest
  React.useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setStageW(el.clientWidth))
    ro.observe(el)
    setStageW(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  React.useEffect(() => {
    setW((cur) => Math.min(cur, stageW))
  }, [stageW])

  const clamp = React.useCallback(
    (v: number) => Math.max(MIN_W, Math.min(stageW, Math.round(v))),
    [stageW],
  )

  // magnetic snap to a breakpoint while dragging
  const scrubTo = React.useCallback(
    (px: number) => {
      const raw = clamp(px)
      const snapped = BREAKPOINTS.find((bp) => Math.abs(raw - bp) < 22)
      setW(snapped ?? raw)
    },
    [clamp],
  )

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    setReelIdx(-1)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !stageRef.current) return
    const left = stageRef.current.getBoundingClientRect().left
    scrubTo(e.clientX - left)
  }
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    setDragging(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 1 : 80
    let next: number | null = null
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = w - step
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = w + step
    if (e.key === "Home") next = MIN_W
    if (e.key === "End") next = stageW
    if (next !== null) {
      e.preventDefault()
      setReelIdx(-1)
      setW(clamp(next))
    }
  }

  const REEL = [390, 834, Math.min(1180, stageW)]
  const runReel = () => {
    if (reduce) {
      setW(REEL[0])
      return
    }
    setReelIdx((i) => (i + 1) % REEL.length)
    setW(REEL[(reelIdx + 1) % REEL.length])
  }

  const label = w < BREAKPOINTS[0] ? "MOBILE" : w < BREAKPOINTS[2] ? "TABLET" : "DESKTOP"

  return (
    <SectionShell tone={tone} width={1280} rule="bottom" className={className}>
      <InView
        once
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <figure className="mt-10">
          <div ref={stageRef} className="relative w-full select-none">
            {/* ── The frame ── */}
            <motion.div
              animate={{ width: w }}
              transition={dragging || reduce ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 28 }}
              className={cn(
                "relative overflow-hidden rounded-[16px] border bg-[#0b0b0b] shadow-[0_24px_56px_-26px_hsl(var(--foreground)/0.45),0_2px_0_0_hsl(var(--foreground)/0.3)]",
                ink ? "border-background/15" : "border-border",
                dragging && "cursor-ew-resize",
              )}
              style={{ maxWidth: "100%" }}
            >
              {/* compact chrome */}
              <div className="border-b border-white/[0.07] bg-[#161616] px-3 py-2">
                <div className="flex items-center gap-2">
                  <span aria-hidden className="flex gap-1.5">
                    <span className="size-2 rounded-full bg-white/60" />
                    <span className="size-2 rounded-full bg-white/40" />
                    <span className="size-2 rounded-full bg-white/25" />
                  </span>
                  <span className="ml-2 flex h-5 min-w-0 items-center gap-1.5 rounded-full bg-white/[0.07] px-2.5 font-mono text-[9px] font-medium text-white/60">
                    <Lock className="size-2.5 shrink-0" aria-hidden />
                    <span className="truncate">{url}</span>
                  </span>
                  <span className="ml-auto hidden font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 sm:block">
                    {label} · {w}PX
                  </span>
                </div>
              </div>

              {/* screen — fixed height so the reflow is the show */}
              <div className="relative h-[380px] overflow-hidden bg-background sm:h-[440px]">
                {children ?? (
                  <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover object-top" />
                )}
              </div>
            </motion.div>

            {/* ── The scrubber handle ── */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Viewport width"
              aria-orientation="horizontal"
              aria-valuemin={MIN_W}
              aria-valuemax={stageW}
              aria-valuenow={w}
              aria-valuetext={`${w} pixels, ${label.toLowerCase()}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onKeyDown={onKeyDown}
              className={cn(
                "absolute -right-3 z-[3] flex h-[calc(100%-38px)] w-7 cursor-ew-resize touch-none items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                dragging && "bg-primary/5",
              )}
              style={{ top: 19, right: "auto", left: `calc(${w}px - 14px)` }}
            >
              <span
                aria-hidden
                className={cn(
                  "flex h-9 w-4 items-center justify-center rounded-full border bg-background shadow-md transition-colors",
                  ink ? "border-background/25" : "border-border",
                  dragging ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                <MoveHorizontal className="size-3" />
              </span>
            </div>
          </div>

          {/* ── The ruler ── */}
          <div
            aria-hidden
            className={cn(
              "relative mt-4 h-9 w-full overflow-hidden rounded-md border font-mono text-[9px] font-bold tracking-widest",
              ink ? "border-background/15 text-background/50" : "border-border text-muted-foreground",
            )}
          >
            {/* filled span up to current width */}
            <motion.span
              className={cn("absolute inset-y-0 left-0", ink ? "bg-background/10" : "bg-primary/10")}
              animate={{ width: w }}
              transition={dragging || reduce ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 28 }}
            />
            {BREAKPOINTS.map((bp) => (
              <span key={bp} className="absolute inset-y-0" style={{ left: `${(bp / stageW) * 100}%` }}>
                <span className={cn("absolute inset-y-0 w-px", ink ? "bg-background/25" : "bg-border")} />
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 whitespace-nowrap">
                  {bp}
                  {bp === 640 ? " SM" : bp === 768 ? " MD" : " LG"}
                </span>
              </span>
            ))}
          </div>

          {/* ── Controls rail ── */}
          <figcaption
            className={cn(
              "mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
              ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
            )}
          >
            <span>{caption}</span>
            <span className="flex items-center gap-3">
              {reel && (
                <button
                  type="button"
                  onClick={runReel}
                  className={cn(
                    "inline-flex h-7 items-center gap-1.5 rounded-full border px-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    ink ? "border-background/25 text-background hover:bg-background/10" : "border-border text-foreground hover:bg-muted",
                  )}
                >
                  <Play className="size-2.5" aria-hidden />
                  Reel
                </button>
              )}
              <span aria-hidden>●</span>
            </span>
          </figcaption>
        </figure>
      </InView>
    </SectionShell>
  )
}
