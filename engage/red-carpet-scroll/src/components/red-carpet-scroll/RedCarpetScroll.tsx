import * as React from "react"
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, useReducedMotion } from "motion/react"
import type { MotionValue } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, CornerTicks } from "@/components/primitives/handcraft"

// ═══ JOB      walk the visitor in like a premiere — the page rolls out for them
// ═══ EMOTION  being expected somewhere important
// ═══ SIGNATURE scroll unrolls the velvet runner top-down; brass stanchions
//               pop in along both rails with spring overshoot and rope
//               catenaries sag between them
//   SITE     → connector before a venue/booking section (scrubbed)
//   APP      → "royal treatment" onboarding: pass `progress` 0..1 controlled —
//             the carpet lays itself for completed steps, no scroll capture
//   A11Y     copy is plain DOM; carpet decoration; reduced = full carpet immediately

export type RedCarpetScrollProps = {
  eyebrow?: string
  title?: React.ReactNode
  sub?: React.ReactNode
  cta?: { label: string; href?: string; onClick?: () => void }
  /** app mode: controlled unroll 0..1 */
  progress?: number
  posts?: number
  /** site mode: pinned length */
  height?: string
  className?: string
}

export function RedCarpetScroll({
  eyebrow = "THE WELCOME",
  title = "You're late. The carpet waited anyway.",
  sub,
  cta,
  progress,
  posts = 4,
  height = "220vh",
  className,
}: RedCarpetScrollProps) {
  const _reduce = useReducedMotion()
  const reduce = !!_reduce
  const controlled = progress !== undefined
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start 70%", "end 40%"] })
  const mv = useMotionValue(controlled ? (reduce ? 1 : progress) : 0)
  React.useEffect(() => { if (controlled) mv.set(reduce ? 1 : progress) }, [controlled, progress, mv, reduce])
  useMotionValueEvent(scrollYProgress, "change", (v) => { if (!controlled && !reduce) mv.set(v) })
  if (reduce && !controlled) { mv.set(1) }

  const p = mv as MotionValue<number>
  const scaleY = useTransform(p, [0, 1], [0, 1])

  return (
    <div ref={wrapRef} className={cn("relative isolate w-full", className)} style={controlled ? undefined : { height }}>
      <div className={cn("relative mx-auto flex w-full max-w-[980px] flex-col items-center px-6", controlled ? "py-16" : "sticky top-[6vh] h-[88vh] justify-start pt-16")}>
        {/* header copy sits at the head of the carpet */}
        <div className="relative z-10 text-center">
          <MonoLabel className="text-muted-foreground">{eyebrow}</MonoLabel>
          <h2 className="mx-auto mt-3 max-w-xl font-display text-3xl font-black tracking-tight sm:text-[40px]">{title}</h2>
          {sub && <p className="mx-auto mt-3 max-w-md text-[15px] font-medium text-muted-foreground">{sub}</p>}
        </div>

        {/* the carpet */}
        <div aria-hidden className="relative mt-8 w-full max-w-[300px] flex-1">
          <motion.div
            style={{ scaleY, transformOrigin: "top center" }}
            className="absolute inset-x-3 bottom-6 overflow-hidden rounded-b-lg"
          >
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, hsl(var(--carpet-deep)) 0 8%, hsl(var(--carpet)) 8% 92%, hsl(var(--carpet-deep)) 92% 100%)" }} />
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/15 to-transparent" />
            <div className="absolute inset-0 opacity-25 mix-blend-overlay" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgb(0 0 0 / 0.25) 0 3px, transparent 3px 7px)" }} />
            <CornerTicks size={8} offset={6} className="text-[hsl(var(--stanchion))]/70" corners={["bl", "br"]} />
            {/* CTA pinning the end of the carpet (site) / last post (both) */}
            {cta && (
              <div className="absolute inset-x-0 bottom-8 flex justify-center">
                <a href={cta.href ?? "#"} onClick={cta.onClick} className="pointer-events-auto h-11 inline-flex items-center rounded-full bg-[hsl(var(--stanchion))] px-6 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-black shadow-lg transition-transform hover:-translate-y-0.5">
                  {cta.label}
                </a>
              </div>
            )}
          </motion.div>

          {/* stanchion rows grow down as the carpet lays */}
          {Array.from({ length: posts }, (_, i) => (
            <Post key={i} i={i} posts={posts} p={p} reduce={reduce} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Post({ i, posts, p, reduce }: { i: number; posts: number; p: MotionValue<number>; reduce: boolean }) {
  const at = 0.12 + (i / (posts - 1 || 1)) * 0.82
  const appear = useTransform(p, [at - 0.12, at], [0, 1])
  const top = `${at * 100}%`
  return (
    <>
      {(["left", "right"] as const).map((side) => (
        <motion.span key={side} aria-hidden style={{ top, opacity: appear, scale: appear, [side]: "-6px", transformOrigin: "bottom center" } as unknown as React.CSSProperties} className="absolute z-[2] flex -translate-y-full flex-col items-center">
          <span className={cn("size-3 rounded-full bg-gradient-to-b from-[hsl(var(--stanchion))] to-[hsl(var(--stanchion)/0.6)] shadow-[0_0_10px_hsl(var(--stanchion)/0.8)]", !reduce && "transition-transform")} />
          <span className="h-9 w-[3px] bg-gradient-to-b from-[hsl(var(--stanchion))] to-[hsl(var(--stanchion)/0.5)]" />
          <span className="h-[3px] w-5 rounded-full bg-[hsl(var(--stanchion)/0.8)]" />
        </motion.span>
      ))}
      {/* rope only between posts */}
      {i < posts - 1 && (
        <motion.svg aria-hidden viewBox="0 0 300 60" preserveAspectRatio="none" style={{ top, height: `${82 / posts}%`, opacity: appear }} className="absolute left-0 z-[1] w-full">
          <path d="M0 10 C 80 48, 220 48, 300 10" fill="none" stroke="hsl(var(--rope))" strokeWidth={6} strokeLinecap="round" opacity={0.9} />
          <path d="M0 10 C 80 48, 220 48, 300 10" fill="none" stroke="hsl(var(--stanchion)/0.25)" strokeWidth={2} />
        </motion.svg>
      )}
    </>
  )
}
