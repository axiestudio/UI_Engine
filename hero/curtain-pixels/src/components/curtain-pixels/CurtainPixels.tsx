import * as React from "react"
import { animate, motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react"
import type { MotionValue } from "motion/react"
import { Button } from "@/components/ui/button"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ═══ JOB         Open the page as a block-quantized dissolve.
// ═══ EMOTION     Pixels — the cover comes apart in cells.
// ═══ SIGNATURE   A grid of cells each scales/fades on its own threshold.
// ═══ ISOLATION   fixed inset-0 is the named behavior — whole-viewport curtain reveal.

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

export type CurtainPixelsProps = {
  mode?: "overlay" | "stage"
  logo?: { src: string; alt?: string }
  kicker?: string
  title?: React.ReactNode
  description?: React.ReactNode
  enter?: { label?: string; href?: string; onClick?: () => void }
  hint?: string
  range?: number
  lockScroll?: boolean
  skipOnReducedMotion?: boolean
  stageHeight?: string
  columns?: number
  onOpen?: () => void
  overlayClassName?: string
  className?: string
}

export function CurtainPixels({
  mode = "overlay",
  logo,
  kicker = "UI ENGINE",
  title = "WELCOME",
  description = "A token-first collection of pre-built website sections. Scroll to dissolve the cover.",
  enter = { label: "Enter" },
  hint = "SCROLL TO REVEAL",
  range = 900,
  lockScroll = true,
  skipOnReducedMotion = true,
  stageHeight = "240vh",
  columns = 10,
  onOpen,
  overlayClassName,
  className,
}: CurtainPixelsProps) {
  const reduce = React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )
  const progress = useMotionValue(0)
  const [done, setDone] = React.useState(reduce && mode === "overlay" && skipOnReducedMotion)
  const openedRef = React.useRef(false)
  const open = React.useCallback(() => {
    if (openedRef.current) return
    openedRef.current = true
    setDone(true)
    onOpen?.()
  }, [onOpen])

  React.useEffect(() => {
    if (mode !== "overlay" || done) return
    const prevOverflow = document.body.style.overflow
    if (lockScroll) {
      document.body.style.overflow = "hidden"
      window.scrollTo(0, 0)
    }
    const add = (v: number) => progress.set(clamp01(progress.get() + v))
    const onWheel = (e: WheelEvent) => {
      if (lockScroll) e.preventDefault()
      add(e.deltaY / range)
    }
    let lastTouchY = 0
    const onTouchStart = (e: TouchEvent) => { lastTouchY = e.touches[0]?.clientY ?? lastTouchY }
    const onTouchMove = (e: TouchEvent) => {
      if (lockScroll) e.preventDefault()
      const y = e.touches[0]?.clientY ?? lastTouchY
      add((lastTouchY - y) / range)
      lastTouchY = y
    }
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " ", "Enter"].includes(e.key)) add(120 / range)
      if (["ArrowUp", "PageUp"].includes(e.key)) add(-120 / range)
    }
    window.addEventListener("wheel", onWheel, { passive: !lockScroll })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: !lockScroll })
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("keydown", onKey)
    }
  }, [mode, done, lockScroll, range, progress])

  const stageRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start start", "end end"] })
  React.useEffect(() => {
    if (mode !== "stage") return
    return scrollYProgress.on("change", (v) => progress.set(clamp01(v)))
  }, [mode, scrollYProgress, progress])

  useMotionValueEvent(progress, "change", (v) => { if (v >= 0.995) open() })

  const enterSite = () => {
    enter.onClick?.()
    if (enter.href) { window.location.href = enter.href; return }
    if (progress.get() >= 1) open()
    else animate(progress, 1, { duration: reduce ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] })
  }

  if (mode === "overlay" && done) return null

  return (
    <div
      ref={mode === "stage" ? stageRef : undefined}
      className={cn(mode === "overlay" ? "fixed inset-0 z-[90]" : "relative isolate w-full", className)}
      style={mode === "stage" ? { height: stageHeight } : undefined}
    >
      <div
        className={cn(mode === "stage" ? "sticky top-0 h-screen w-full overflow-hidden" : "absolute inset-0", overlayClassName)}
        role={mode === "overlay" ? "presentation" : undefined}
        aria-label={mode === "overlay" ? "Intro pixels" : undefined}
      >
        <PixelsScene
          progress={progress}
          reduce={reduce}
          columns={columns}
          logo={logo}
          kicker={kicker}
          title={title}
          description={description}
          enter={enter}
          hint={hint}
          onEnter={enterSite}
          onEnterKey={mode === "overlay"}
        />
      </div>
    </div>
  )
}

function PixelsScene({
  progress,
  reduce,
  columns,
  logo,
  kicker,
  title,
  description,
  enter,
  hint,
  onEnter,
  onEnterKey,
}: {
  progress: MotionValue<number>
  reduce: boolean
  columns: number
  logo?: { src: string; alt?: string }
  kicker: string
  title: React.ReactNode
  description: React.ReactNode
  enter: NonNullable<CurtainPixelsProps["enter"]>
  hint: string
  onEnter: () => void
  onEnterKey: boolean
}) {
  const textOpacity = useTransform(progress, [0, 0.6], [1, 0])
  const textScale = useTransform(progress, [0, 1], [0.96, 1.1])
  const textY = useTransform(progress, [0, 1], [0, -50])
  const hintOpacity = useTransform(progress, [0, 0.35], [1, 0])
  const cols = Math.max(columns, 3)
  const rows = Math.round(cols * 0.6)

  return (
    <>
      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
        {Array.from({ length: cols * rows }).map((_, i) => {
          const row = Math.floor(i / cols)
          const col = i % cols
          const wander = ((row + col) % 5) / 5
          const start = wander * 0.35
          const end = start + 0.6
          const opacity = useTransform(progress, [start, end], [1, 0])
          const scale = useTransform(progress, [start, end], [1, 0.4])
          return (
            <motion.div
              key={i}
              style={{ opacity, scale }}
              className="bg-[hsl(var(--curtain))] will-change-transform"
            />
          )
        })}
      </div>

      <motion.div
        style={{ opacity: textOpacity, scale: textScale, y: textY }}
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <InView
          once
          variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.15 }}
        >
          <div className="flex flex-col items-center">
            {logo?.src && <img src={logo.src} alt={logo.alt ?? ""} className={cn("mb-6 h-16 w-16 rounded-2xl object-cover", !reduce && "shadow-2xl ring-1 ring-[hsl(var(--curtain-glow)/0.1)]")} />}
            <p className="font-mono text-[11px] font-bold tracking-[0.4em] text-[hsl(var(--curtain-text)/0.6)]">{kicker}</p>
            <h1 className="mt-3 font-display text-6xl font-extrabold tracking-tight text-[hsl(var(--curtain-text))] sm:text-8xl">{title}</h1>
            <p className="mt-4 max-w-md text-base font-medium leading-relaxed text-[hsl(var(--curtain-text)/0.6)]">{description}</p>
            {enter.label && (
              <Button
                type="button"
                onClick={onEnter}
                tabIndex={onEnterKey ? 0 : -1}
                className="pointer-events-auto mt-8 h-11 rounded-full border border-[hsl(var(--curtain-glow)/0.25)] bg-[hsl(var(--curtain-glow)/0.1)] px-7 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-[hsl(var(--curtain-text))] transition-colors hover:border-[hsl(var(--curtain-glow)/0.5)] hover:bg-[hsl(var(--curtain-glow)/0.18)] focus-visible:ring-2 focus-visible:ring-[hsl(var(--curtain-glow)/0.7)]"
              >
                {enter.label}
              </Button>
            )}
          </div>
        </InView>
      </motion.div>

      <motion.div
        style={{ opacity: hintOpacity }}
        className="pointer-events-none absolute inset-x-0 bottom-9 flex flex-col items-center gap-2 text-[hsl(var(--curtain-text)/0.7)]"
      >
        <span className="font-mono text-[10px] font-bold tracking-[0.3em]">{hint}</span>
        <span className="flex h-9 w-6 items-start justify-center rounded-full border border-[hsl(var(--curtain-glow)/0.25)] p-1.5">
          <motion.span animate={reduce ? undefined : { y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="block h-1.5 w-1.5 rounded-full bg-[hsl(var(--curtain-text)/0.8)]" />
        </span>
      </motion.div>
    </>
  )
}
