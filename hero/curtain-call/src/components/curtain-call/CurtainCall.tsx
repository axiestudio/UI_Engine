import * as React from "react"
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react"
import type { MotionValue } from "motion/react"
import { cn } from "@/lib/utils"

// Verbatim port of the engine's intro gate (engine/src/Curtain.tsx), productized
// as a props-driven preset: same panels, same seam, same statement block, same
// hint, and the same reveal contract — the curtain fully disappears.
//
//   JOB        land the visitor on a closed stage before the page begins
//   EMOTION    held breath — house lights dim, then the hero is just there
//   SIGNATURE  twin panels scrub apart on wheel/touch/keys; the statement
//              scales (0.96→1.12) and fades as the opening completes
//   REVEAL     the peel rides the entire pinned span on a circInOut curve —
//              slow start, heavy middle, gliding stop with both panels fully
//              off-frame; at ≥0.995 the scene unmounts, zero curtain nodes left
//   TOKENS     the stage is a deliberate dark band: --curtain/--curtain-lit
//              tokens — never accidental color
//   A11Y       keyboard scrub (Arrow/PageUp-Down/Space/Enter, global keydown);
//              panels + seam + hint aria-hidden; reduced motion skips the gate
//   ISOLATION  root-scoped: the gate paints `absolute inset-0` inside a
//              `relative isolate overflow-hidden` root — never `fixed`, so the
//              reveal stays inside the engine content pane.

// Panels translate -104%/+104% of their OWN width (w = 52%) so both leave the
// frame well before the sticky releases. Progress at which the scene unmounts.
const OPEN_AT = 0.995

const clamp = (v: number) => Math.max(0, Math.min(1, v))

// Heavy velvet curve: slow catch, fast middle, gliding stop (circular in/out).
const circInOut = (raw: number) => {
  const t = clamp(raw)
  return t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2
}

  export type CurtainCallProps = {
  /** `overlay` — root-scoped gate that fills the preset root (engine behavior).
   *  `stage`  — sticky h-screen theatre inside a stageHeight scroll wrapper; pass
   *  the hero it reveals as `children`. Page scroll is never captured. */
  mode?: "overlay" | "stage"
  /** Stage (or overlay background): the content the curtain reveals, rendered
   * under the panels; stays mounted, the curtain around it does not. */
  children?: React.ReactNode
  logo?: { src: string; alt?: string }
  kicker?: string
  title?: React.ReactNode
  description?: React.ReactNode
  /** Label above the mouse glyph (engine: "SCROLL TO REVEAL"). */
  hint?: string
  /** Overlay: total wheel/touch delta px needed to fully open the curtain. */
  range?: number
  /** Overlay: lock body scroll while closed (default true, engine behavior). */
  lockScroll?: boolean
  /** Overlay: render nothing for prefers-reduced-motion visitors (default true). */
  skipOnReducedMotion?: boolean
  /** Stage: scroll length the pinned curtain is given. */
  stageHeight?: string
  /** Fires exactly once, when the curtain has fully opened. */
  onOpen?: () => void
  className?: string
}

export function CurtainCall({
  mode = "stage",
  children,
  logo,
  kicker = "UI ENGINE",
  title = "WELCOME",
  description = "A token-first collection of 40+ pre-built website sections. Scroll to open the curtain.",
  hint = "SCROLL TO REVEAL",
  range = 900,
  lockScroll = true,
  skipOnReducedMotion = true,
  stageHeight = "240vh",
  onOpen,
  className,
}: CurtainCallProps) {
  const reduce = React.useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
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

  // Overlay: lock the page so scroll only drives the curtain — the app stays
  // put until revealed (engine mechanic, preserved line for line).
  React.useEffect(() => {
    if (mode !== "overlay" || done) return
    const prevOverflow = document.body.style.overflow
    if (lockScroll) {
      document.body.style.overflow = "hidden"
      window.scrollTo(0, 0)
    }

    const add = (v: number) => progress.set(clamp(progress.get() + v))

    const onWheel = (e: WheelEvent) => {
      if (lockScroll) e.preventDefault()
      add(e.deltaY / range)
    }
    let lastTouchY = 0
    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0]?.clientY ?? lastTouchY
    }
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

  // Stage: plain scroll position drives the same transforms — page never locked.
  const stageRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start start", "end end"] })
  React.useEffect(() => {
    if (mode !== "stage") return
    const unsub = scrollYProgress.on("change", (v) => progress.set(clamp(v)))
    return unsub
  }, [mode, scrollYProgress, progress])

  useMotionValueEvent(progress, "change", (v) => {
    if (v >= OPEN_AT) open()
  })

  // Peel rides an eased curve across the WHOLE pinned span: the panels start
  // slowly, reach full speed mid-open, and are gliding to a stop by the time
  // they clear the frame. `x` % is relative to the panel itself (w = 52%), so
  // ~100% is what actually puts a panel off-frame — the engine's -53% value
  // was half-travel that read as an abrupt stop once the stage stayed mounted.
  const peel = useTransform(progress, circInOut)
  const leftX = useTransform(peel, [0, 1], ["0%", "-104%"])
  const rightX = useTransform(peel, [0, 1], ["0%", "104%"])
  const seamOpacity = useTransform(peel, [0, 0.5], [1, 0])
  const textOpacity = useTransform(peel, [0, 0.62], [1, 0])
  const textScale = useTransform(peel, [0, 1], [0.96, 1.14])
  const textY = useTransform(peel, [0, 1], [0, -80])
  const hintOpacity = useTransform(peel, [0, 0.3], [1, 0])

  if (mode === "overlay" && done) return null

  const scene = (
    <>
      {/* left curtain panel */}
      <motion.div
        style={{ x: leftX }}
        aria-hidden
        className="absolute inset-y-0 left-0 z-20 w-[52%] overflow-hidden bg-[hsl(var(--curtain,0_0%_4.3%))] will-change-transform"
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,hsl(var(--curtain-lit,0_0%_13.7%))_0%,hsl(var(--curtain,0_0%_4.3%))_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,hsl(var(--curtain-glow,0_0%_100%)/0.06)_0%,transparent_35%,transparent_70%,hsl(var(--curtain-glow,0_0%_100%)/0.03)_100%)]" />
      </motion.div>

      {/* right curtain panel */}
      <motion.div
        style={{ x: rightX }}
        aria-hidden
        className="absolute inset-y-0 right-0 z-20 w-[52%] overflow-hidden bg-[hsl(var(--curtain,0_0%_4.3%))] will-change-transform"
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_100%_0%,hsl(var(--curtain-lit,0_0%_13.7%))_0%,hsl(var(--curtain,0_0%_4.3%))_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(245deg,hsl(var(--curtain-glow,0_0%_100%)/0.06)_0%,transparent_35%,transparent_70%,hsl(var(--curtain-glow,0_0%_100%)/0.03)_100%)]" />
      </motion.div>

      {/* center seam */}
      <motion.div
        aria-hidden
        style={{ opacity: seamOpacity }}
        className="pointer-events-none absolute inset-y-0 left-1/2 z-30 w-px -translate-x-1/2 bg-gradient-to-b from-white/0 via-white/25 to-white/0"
      />
    </>
  )

  const statement = (
    <motion.div
      style={{ opacity: textOpacity, scale: textScale, y: textY }}
      aria-hidden={done}
      className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center px-6 text-center"
    >
      {logo?.src && (
        <img src={logo.src} alt={logo.alt ?? ""} className="mb-6 h-16 w-16 rounded-2xl object-cover shadow-2xl ring-1 ring-white/10" />
      )}
      <p className="font-mono text-[11px] font-bold tracking-[0.4em] text-white/60">{kicker}</p>
      <h1 className="mt-3 font-display text-6xl font-extrabold tracking-tight text-[hsl(var(--curtain-text,0_0%_98%))] sm:text-8xl">{title}</h1>
      <p className="mt-4 max-w-md text-base font-medium leading-relaxed text-white/60">{description}</p>
    </motion.div>
  )

  const scrollHint = (
    <motion.div
      style={{ opacity: hintOpacity }}
      className="pointer-events-none absolute inset-x-0 bottom-[max(2.25rem,env(safe-area-inset-bottom,2.25rem))] z-40 flex flex-col items-center gap-2 px-4 text-white/70"
    >
      <span className="font-mono text-[10px] font-bold tracking-[0.3em]">{hint}</span>
      <span className="flex h-9 w-6 items-start justify-center rounded-full border border-white/25 p-1.5">
        <motion.span
          animate={reduce || done ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="block h-1.5 w-1.5 rounded-full bg-white/80"
        />
      </span>
    </motion.div>
  )

  if (mode === "stage") {
    return (
      <div
        ref={stageRef}
        className={cn("relative isolate w-full overflow-hidden", className)}
        style={{ height: stageHeight }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* the content the curtain reveals — never unmounts */}
          {children ?? null}
          {/* the curtain itself — fully gone once open */}
          {!done && (
            <>
              {scene}
              {statement}
              {scrollHint}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative isolate min-h-[60vh] w-full overflow-hidden", className)}>
      {children ?? null}
      {!done && scene}
      {statement}
      {scrollHint}
    </div>
  )
}
