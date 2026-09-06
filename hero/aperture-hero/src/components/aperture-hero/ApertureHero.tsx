import * as React from "react"
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react"
import { Crosshair } from "lucide-react"
import type { MotionValue } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"

// ═══ JOB      turn the hero image into a camera you're looking through
// ═══ EMOTION  the click of glass settling behind the shutter
// ═══ SIGNATURE eight iris blades (rotating wedge polygons) breathe closed→
//               open on scroll; tap anywhere to MOVE THE FOCUS RETICLE and
//               the scene shifts its zoom origin — a real photographer beat
//   SITE     → portfolio/photography/launch hero (scroll-scrubbed)
//   APP      → image-review "loupe" header: pass `open` 0..1 controlled and
//             `onFocusPoint` to wire it to your viewer
//   A11Y     H1 + copy always readable below the aperture frame; reticle is
//             a real button pattern (click/tap); reduced = open, static

export type ApertureHeroProps = {
  img?: string
  kicker?: string
  title: React.ReactNode
  sub?: React.ReactNode
  cta?: { label: string; href?: string; onClick?: () => void }
  /** site mode: pinned scroll length */
  height?: string
  /** app mode: controlled 0..1 aperture */
  open?: number
  /** app hook — where the photographer clicked */
  onFocusPoint?: (x: number, y: number) => void
  className?: string
}

const BLADES = 8

function useBladeTransforms(mv: MotionValue<number>) {
  return Array.from({ length: BLADES }, (_, i) => {
    const start = (i / BLADES) * 0.3
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const rot = useTransform(mv, [start, Math.min(1, start + 0.55)], [0, 46])
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const scale = useTransform(mv, [start, Math.min(1, start + 0.55)], [1, 0.42])
    return { rot, scale }
  })
}

export function ApertureHero({ img, kicker = "THROUGH THE LENS", title, sub, cta, height = "260vh", open, onFocusPoint, className }: ApertureHeroProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const controlled = open !== undefined
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] })
  const mv = useMotionValue(reduce ? 1 : open ?? 0)
  React.useEffect(() => { if (controlled) mv.set(reduce ? 1 : open) }, [controlled, open, mv, reduce])
  useMotionValueEvent(scrollYProgress, "change", (v) => { if (!controlled && !reduce) mv.set(v) })

  // per-blade transforms: wedge rotates + scales away from centre (fixed order — 8 hooks)
  const bladeVals = useBladeTransforms(mv)

  const [focus, setFocus] = React.useState({ x: 50, y: 50 })
  const sceneX = useTransform(mv, [0, 1], ["0%", "-2%"])

  const onStageClick = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 100
    const y = ((e.clientY - r.top) / r.height) * 100
    setFocus({ x, y })
    onFocusPoint?.(x / 100, y / 100)
  }

  const Frame = (
    <div className="relative mx-auto w-full max-w-[1120px] overflow-hidden px-6">
      <div
        onClick={onStageClick}
        className="group relative cursor-crosshair overflow-hidden rounded-xl"
        style={{ aspectRatio: "16/9" }}
      >
        {img && <motion.img src={img} alt="" style={{ x: sceneX, transformOrigin: `${focus.x}% ${focus.y}%` }} animate={{ scale: focus ? 1.05 : 1.05 }} className="absolute inset-0 h-full w-full object-cover" />}
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 55%, hsl(var(--foreground)/0.62))" }} />

        {/* iris */}
        <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className={cn("absolute inset-0 size-full", controlled && "transition-opacity")}>
          {bladeVals.map((b, i) => (
            <motion.path
              key={i}
              d="M50 50 L135 18 A125 125 0 0 1 135 82 Z"
              fill="hsl(var(--blade))"
              stroke="hsl(var(--blade-edge))"
              strokeWidth={0.4}
              style={{ rotate: b.rot, scale: b.scale, transformOrigin: "50px 50px" }}
            />
          ))}
        </svg>

        {/* focus reticle */}
        <motion.span aria-hidden animate={{ left: `${focus.x}%`, top: `${focus.y}%` }} transition={{ type: "spring", stiffness: 240, damping: 26 }} className="absolute z-10 -translate-x-1/2 -translate-y-1/2">
          <span className={cn("grid size-10 place-items-center rounded-sm", "border-2 border-[hsl(var(--reticle))]/80 shadow-[0_0_20px_hsl(var(--reticle)/0.4)]")}>
            <Crosshair className="size-4 text-[hsl(var(--reticle))]" />
          </span>
        </motion.span>

        <span className="absolute left-4 top-4 z-10 rounded-sm bg-foreground/55 px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-background/85">ƒ/1.8 · 1/250 · ISO&nbsp;64</span>

        <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-center sm:p-10">
          <MonoLabel className="text-white/60">{kicker}</MonoLabel>
          <h1 className="mt-2 font-display text-[clamp(26px,5vw,52px)] font-black leading-[0.98] tracking-tight text-white">{title}</h1>
          {sub && <p className="mx-auto mt-2 max-w-md text-[13px] font-medium text-white/70 sm:text-[15px]">{sub}</p>}
          {cta && <a href={cta.href ?? "#"} onClick={(e) => { e.stopPropagation(); cta.onClick?.() }} className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-background px-6 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-foreground">{cta.label}</a>}
        </div>
      </div>
    </div>
  )

  if (controlled) return <div className={cn("relative isolate w-full overflow-hidden bg-[hsl(var(--lens))] p-4", className)}>{Frame}</div>
  return (
    <div ref={wrapRef} className={cn("relative isolate w-full bg-[hsl(var(--lens))]", className)} style={{ height: `max(${height}, 100vh)` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">{Frame}</div>
    </div>
  )
}
