import * as React from "react"
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react"
import type { MotionValue } from "motion/react"
import { Eye } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ JOB      a before/after you feel yourself opening, not a slider drag
// ═══ EMOTION  the slow reveal of blinds letting light in
// ═══ SIGNATURE N horizontal slats rotateX 0→88° on staggered scrub bands;
//               each slat carries a perfectly-registered slice of the "before"
//   SITE  → renovation / treatment result section (scroll-driven, `height`)
//   APP   → privacy curtain on a sensitive panel — controlled `value`+`onChange`
//           (host button snaps 0↔1; CSS spring handles the tilt)
//   A11Y  before/after described in sr-only text; the slat layer is decorative;
//         reduced motion → instant crossfade to "after", no tilt

export type BlindsSlatProps = {
  before: { src?: string; label?: string }
  after: { src?: string; label?: string }
  slats?: number
  /** Site mode: scroll length that drives the opening. */
  height?: string
  /** App mode (controlled): 0 = closed/before, 1 = open/after. */
  value?: number
  eyebrow?: string
  caption?: React.ReactNode
  className?: string
}

export function BlindsSlat({ before, after, slats = 12, height = "230vh", value, eyebrow = "THE TURN", caption, className }: BlindsSlatProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const controlled = value !== undefined
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start 78%", "end 38%"] })
  const mv = useMotionValue(value ?? 0)

  React.useEffect(() => {
    if (controlled) mv.set(value)
  }, [controlled, value, mv])
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!controlled && !reduce) mv.set(v)
    if (!controlled && reduce) mv.set(v >= 0.5 ? 1 : 0)
  })
  React.useEffect(() => {
    if (reduce && !controlled) mv.set(1)
  }, [reduce, controlled, mv])

  return (
    <div ref={wrapRef} className={cn("relative isolate w-full", className)} style={controlled ? undefined : { height }}>
      <div className={controlled ? "w-full" : "sticky top-[8vh] w-full"}>
        <figure className="relative mx-auto w-full max-w-[980px] overflow-hidden rounded-lg border bg-card shadow-sm">
          {/* after: the revealed truth */}
          <AfterPanel data={after} label={before.label} />
          {/* before: the slat curtain */}
          <div className="absolute inset-0" aria-hidden>
            {Array.from({ length: slats }, (_, i) => (
              <Slat key={i} i={i} slats={slats} mv={mv} controlled={controlled} before={before.src} reduce={reduce} />
            ))}
          </div>
          <figcaption className="relative flex items-center justify-between gap-4 border-t bg-card shadow-sm px-5 py-3.5">
            <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
            {caption && <p className="truncate text-[12px] font-semibold text-muted-foreground">{caption}</p>}
            <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground"><Eye className="size-3.5" /> after</span>
          </figcaption>
          <p className="sr-only">Slide: before — {before.label ?? "original state"}; after — {after.label ?? "current state"}.</p>
        </figure>
      </div>
    </div>
  )
}

function Slat({ i, slats, mv, controlled, before, reduce }: { i: number; slats: number; mv: MotionValue<number>; controlled: boolean; before?: string; reduce: boolean }) {
  // staggered bands: each slat starts a little later down the scrub
  const lo = (i / slats) * 0.5
  const hi = Math.min(1, lo + 0.5)
  const rotScrub = useTransform(mv, [lo, hi], [0, 88])
  const rotSnap = useTransform(mv, [0, 1], [0, 88])
  const rot = reduce ? undefined : controlled ? rotSnap : rotScrub
  const face = (
    <div className="relative h-full w-full overflow-hidden bg-[hsl(var(--slat))]">
      {before && <img src={before} alt="" className="absolute inset-x-0 w-full" style={{ height: `${slats * 100}%`, top: `-${i * 100}%` }} />}
      <span className="absolute inset-x-0 bottom-0 h-px bg-black/25" />
      <span className="absolute inset-x-0 top-0 h-[1px] bg-white/25" />
    </div>
  )
  return (
    <div className="absolute inset-x-0" style={{ top: `${(i * 100) / slats}%`, height: `${100 / slats}%`, perspective: 480 }}>
      <motion.div style={rot ? { rotateX: rot, transformOrigin: "top center" } : { transformOrigin: "top center" }} className={cn("h-full w-full will-change-transform", controlled && !reduce && "transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]")}>
        {face}
      </motion.div>
    </div>
  )
}

function AfterPanel({ data, label }: { data: BlindsSlatProps["after"]; label?: string }) {
  return data.src ? (
    <div className="relative">
      <img src={data.src} alt={data.label ?? label ?? "after"} className="aspect-[16/10] w-full object-cover" loading="lazy" />
      {data.label && <span className="absolute bottom-3 left-3 rounded-sm bg-foreground/80 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-background">{data.label}</span>}
    </div>
  ) : (
    <div className="grid aspect-[16/10] w-full place-items-center bg-muted">
      <span className="px-6 text-center font-display text-2xl font-bold text-muted-foreground">{data.label}</span>
    </div>
  )
}
