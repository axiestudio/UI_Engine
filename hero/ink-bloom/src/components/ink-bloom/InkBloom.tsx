import * as React from "react"
import { animate, motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react"
import { cn } from "@/lib/utils"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"

// ═══ JOB      land a quiet brand promise with a single unforgettable gesture
// ═══ EMOTION  stillness, then ink deciding to exist
// ═══ SIGNATURE the headline blooms one MotionValue at a time: blur 14→0,
//               a radial "soak-in" mask opening, brush rule drawing under —
//               driven by scroll (site) or mount (app)
//   SITE     → wellness/craft hero, scroll-scrubbed
//   APP      → article header that blooms once the piece loads
//   A11Y     real h1; mask+blur decorative; reduced = headline simply set

export type InkBloomProps = {
  kicker?: string
  title: React.ReactNode
  sub?: React.ReactNode
  cta?: { label: string; href?: string; onClick?: () => void }
  /** site mode: scrub length; app mode ignores it */
  height?: string
  mode?: "site" | "app"
  className?: string
}

const maskAt = (p: number) => `radial-gradient(115% 90% at 50% 55%, black ${Math.max(0, (p - 1) * 42)}%, rgba(0,0,0,0) ${p * 48 + 42}%)`

export function InkBloom({ kicker = "静 — STILLNESS", title, sub, cta, height = "200vh", mode = "site", className }: InkBloomProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start 90%", "start 25%"] })
  const b = useMotionValue(reduce ? 1 : 0)

  // site: scroll drives the soak; app/first paint: animate in once
  useMotionValueEvent(scrollYProgress, "change", (v) => { if (!reduce && mode === "site") b.set(v) })
  React.useEffect(() => {
    if (reduce) { b.set(1); return }
    if (mode === "app") {
      const controls = animate(b, 1, { duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] })
      return () => controls.stop()
    }
    // site mode also settles to 1 if the section is already past when mounted
    if (scrollYProgress.get() >= 0.99) b.set(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, reduce])

  const filter = useTransform(b, (v) => `blur(${(1 - v) * 14}px)`)
  const imageMask = useTransform(b, maskAt)
  const ruleScale = useTransform(b, [0.15, 0.85], [0, 1])
  const softOpacity = useTransform(b, [0.45, 1], [0, 1])

  const Head = (
    <div className="mx-auto flex h-screen max-w-[860px] flex-col justify-center px-6 text-center">
      <MonoLabel className="justify-center text-[hsl(var(--sumi-soft))]">{kicker}</MonoLabel>
      <h1 className="mt-6 font-serif text-[clamp(40px,8vw,76px)] font-black leading-[1.02] tracking-[-0.02em] text-[hsl(var(--sumi))]">
        <motion.span className="block" style={{ opacity: b, filter, WebkitMaskImage: imageMask, maskImage: imageMask }}>{title}</motion.span>
      </h1>
      <motion.span aria-hidden className="mx-auto mt-6 block h-[3px] w-[240px] rounded-full bg-[hsl(var(--sumi))]/70" style={{ scaleX: ruleScale }} />
      {sub && <motion.p className="mx-auto mt-6 max-w-xl text-[15px] font-medium leading-[1.8] text-[hsl(var(--sumi-soft))]" style={{ opacity: softOpacity }}>{sub}</motion.p>}
      {cta && (
        <motion.a href={cta.href ?? "#"} onClick={cta.onClick} className="mx-auto mt-9 inline-flex h-12 w-fit items-center rounded-full border-2 border-[hsl(var(--sumi))] px-7 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-[hsl(var(--sumi))] transition-colors hover:bg-[hsl(var(--sumi))] hover:text-[hsl(var(--xuan))]" style={{ opacity: softOpacity }}>
          {cta.label}
        </motion.a>
      )}
    </div>
  )

  if (mode === "app") {
    return <div className={cn("relative isolate overflow-hidden bg-[hsl(var(--xuan))] py-4 text-[hsl(var(--sumi))]", className)}><div className="[&>*]:!h-auto [&_h1]:mt-3">{Head}</div><Grain opacity={0.05} /></div>
  }
  return (
    <div ref={wrapRef} className={cn("relative isolate bg-[hsl(var(--xuan))] text-[hsl(var(--sumi))]", className)} style={{ height }}>
      <div className="sticky top-0 h-screen w-full">{Head}</div>
      <Grain opacity={0.05} />
    </div>
  )
}
