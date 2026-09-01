import * as React from "react"
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, animate } from "motion/react"
import type { MotionValue } from "motion/react"
import { cn } from "@/lib/utils"
import Noise from "@/components/primitives/noise"


// ═══ JOB      make a reveal physical — you unzip it yourself
// ═══ EMOTION  the two seconds before opening a parcel
// ═══ SIGNATURE a brass pull tab drags (or scrolls, or clicks) across the
//               kraft front; the flap peels back on the zip line to the teeth
//               strip hiding the contents — which were always in the DOM
//   SITE     → product-drop unboxing section (scroll-scrubbed)
//   APP      → archive/release-notes panel: pass `open` 0..1, contents as
//             children; drag stays live only in scrub mode
//   A11Y     contents readable by SR at all times; pull is role=slider with
//            live aria-valuenow; reduced = starts open, click toggles

export type ZipRevealProps = {
  eyebrow?: string
  label?: string
  title?: React.ReactNode
  /** site mode: pinned scroll length */
  height?: string
  /** app mode: controlled 0..1 */
  open?: number
  onOpen?: (v: number) => void
  children?: React.ReactNode
  className?: string
}

export function ZipReveal({ eyebrow = "UNSEALED ON ARRIVAL", label = "drop-01.zip", title = "The contents were worth the wait.", height = "200vh", open, onOpen, children, className }: ZipRevealProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const controlled = open !== undefined
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start 75%", "end 45%"] })
  const z = useMotionValue(controlled ? open : reduce ? 1 : 0)
  const [zNow, setZNow] = React.useState(0)
  useMotionValueEvent(z, "change", (v) => { setZNow(Math.round(v * 100)); onOpen?.(v) })
  React.useEffect(() => { if (controlled) z.set(open) }, [controlled, open, z])
  useMotionValueEvent(scrollYProgress, "change", (v) => { if (!controlled) z.set(reduce ? 1 : v) })

  const flap = useTransform(z, (v) => `inset(0 ${(1 - v) * 100}% 0 0)`)

  const setFromClientX = (clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect()
    if (!r) return
    z.set(Math.max(0, Math.min(1, (clientX - r.left - 22) / Math.max(40, r.width - 44))))
  }
  const startDrag = (e: React.PointerEvent) => {
    if (controlled) return
    e.preventDefault()
    setFromClientX(e.clientX)
    const move = (ev: PointerEvent) => setFromClientX(ev.clientX)
    const up = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      animate(z, z.get() > 0.5 ? 1 : 0, { type: "spring", stiffness: 150, damping: 22 })
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }

  const Parcel = (
    <div ref={trackRef} className="relative w-full overflow-hidden rounded-lg border shadow-[0_30px_70px_-30px_rgba(0,0,0,0.5)]">
      {/* under-layer: real content, always in DOM */}
      <div className="relative min-h-[300px] bg-[hsl(var(--parcel))] px-6 py-8 text-[hsl(var(--parcel-ink))] sm:min-h-[340px]">
        <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "opacity-60")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
        {children ?? (
          <>
            <h3 className="mt-3 max-w-sm font-display text-2xl font-bold tracking-tight sm:text-[30px]">{title}</h3>
            <ul className="mt-5 grid gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] sm:grid-cols-2">
              {["01 / lookbook-cover.webp", "02 / studio-reel.mp4", "03 / colour-bar-cuts", "04 / press-kit.pdf"].map((f) => (
                <li key={f} className="flex items-center gap-2 rounded-sm bg-black/8 px-3 py-2"><span className="size-1.5 rounded-full bg-current opacity-60" /> {f}</li>
              ))}
            </ul>
          </>
        )}
        {/* teeth strip sits here, exposed as the flap retreats */}
        <span aria-hidden className="pointer-events-none absolute inset-x-[18px] top-1/2 h-3.5 -translate-y-1/2 rounded-[2px] bg-[hsl(var(--zip-tape))]/15" style={{ backgroundImage: "repeating-linear-gradient(90deg, hsl(var(--zip-teeth)) 0 5px, transparent 5px 10px), repeating-linear-gradient(90deg, transparent 0 2.5px, hsl(var(--zip-teeth)) 2.5px 7.5px)", backgroundPosition: "0 0, 3px 1px", opacity: 0.9 }} />
      </div>

      {/* kraft flap over the content, clipped by the zip */}
      <motion.div aria-hidden style={{ clipPath: flap }} className="absolute inset-0 z-[1]">
        <div className="absolute inset-0" style={{ background: "linear-gradient(115deg, hsl(var(--parcel-deep)) 0%, hsl(var(--parcel)) 32%, hsl(var(--parcel-deep)) 100%)" }} />
        <span className="absolute left-8 top-8 -rotate-3 border border-dashed border-[hsl(var(--parcel-ink))/0.5] bg-white/70 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--parcel-ink))]">{label}</span>
        <span className="absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 -rotate-2 bg-white/25 mix-blend-multiply" />
        <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden"><Noise patternAlpha={Math.round((0.1) * 255)} patternSize={240} patternRefreshInterval={3} /></span>
        {/* flap's cut edge rides with the clip */}
        <motion.span style={{ opacity: 1 }} className="absolute inset-y-0 right-0 w-1 bg-[hsl(var(--zip-tape))]/70 -translate-x-1/2" />
      </motion.div>

      {/* the pull — motion-positioned by the same value */}
      <PullKnob z={z} onPointerDown={startDrag} zNow={zNow} controlled={controlled} />
    </div>
  )

  if (controlled) return <div className={cn("py-2", className)}>{Parcel}</div>
  return (
    <div ref={wrapRef} className={cn("relative isolate w-full", className)} style={{ height }}>
      <div className="sticky top-[10vh] mx-auto w-full max-w-[980px] px-6 py-10">{Parcel}</div>
    </div>
  )
}

function PullKnob({ z, onPointerDown, zNow, controlled }: { z: MotionValue<number>; onPointerDown: (e: React.PointerEvent) => void; zNow: number; controlled: boolean }) {
  const left = useTransform(z, (v) => `calc(4% + ${v} * 92%)`)
  return (
    <motion.button
      type="button"
      role="slider"
      aria-label="Unzip package"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={zNow}
      aria-valuetext={zNow > 98 ? "opened" : zNow < 2 ? "sealed" : `${zNow}% open`}
      onPointerDown={onPointerDown}
      onClick={() => { if (!controlled) animate(z, zNow > 98 ? 0 : 1, { duration: 0.9, ease: [0.16, 1, 0.3, 1] }) }}
      style={{ left }}
      className="absolute top-1/2 z-[2] grid size-9 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none place-items-center rounded-md border-2 border-[hsl(var(--zip-tape))] bg-gradient-to-b from-[hsl(var(--zip-teeth))] to-[hsl(var(--zip-tape))] shadow-[0_6px_14px_rgba(0,0,0,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--zip-tape))] active:cursor-grabbing"
    >
      <span aria-hidden className="block h-3.5 w-[3px] rounded bg-[hsl(var(--zip-tape))]" />
      <span aria-hidden className="mt-0.5 block size-3 rounded-full border-[3px] border-[hsl(var(--zip-tape))]" />
    </motion.button>
  )
}
