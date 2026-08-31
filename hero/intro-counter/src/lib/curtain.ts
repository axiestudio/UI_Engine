import * as React from "react"
import { animate, useMotionValue, useMotionValueEvent, useScroll } from "motion/react"

// Shared gesture gate for the curtain-family intro presets (overlay + stage modes).
// Owning parcel keeps wheel/touch/keyboard capture + reduced-motion + scroll-pin
// behaviour identical across every sibling; each preset's Scene stays purely visual.
export type CurtainGateOptions = {
  mode?: "overlay" | "stage"
  range?: number
  lockScroll?: boolean
  skipOnReducedMotion?: boolean
  stageHeight?: string
  onOpen?: () => void
}

export function useCurtainGate({
  mode = "overlay",
  range = 900,
  lockScroll = true,
  skipOnReducedMotion = true,
  stageHeight = "240vh",
  onOpen,
}: CurtainGateOptions) {
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
    const add = (v: number) => progress.set(Math.max(0, Math.min(1, progress.get() + v)))
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
    return scrollYProgress.on("change", (v) => progress.set(Math.max(0, Math.min(1, v))))
  }, [mode, scrollYProgress, progress])

  useMotionValueEvent(progress, "change", (v) => { if (v >= 0.995) open() })

  const enterSite = (href?: string, onClick?: () => void) => {
    onClick?.()
    if (href) { window.location.href = href; return }
    if (progress.get() >= 1) open()
    else animate(progress, 1, { duration: reduce ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] })
  }

  return { reduce, progress, done, setDone, open, stageRef, enterSite, stageHeight }
}
