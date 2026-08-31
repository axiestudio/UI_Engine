import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, Grain } from "@/components/primitives/handcraft"

// ═══ JOB      introduce a team/lineup as a cast, not a grid of boxes
// ═══ EMOTION  warm applause energy on a dark stage
// ═══ SIGNATURE each card steps forward and takes a staggered BOW (rotateX dip
//               + rise) as it enters the viewport, spotlight ellipse underfoot
//   SITE     → team / speakers / "the humans" reveal band
//   APP      → season recap / per-player awards screen (interactive `current`)
//   A11Y     real heading per person; bows are decorative (aria-hidden card
//             motion, content readable static); reduced motion = no tilt

export type Performer = { name: string; role: string; img?: string; note?: string }

export type EncoreBowsProps = {
  eyebrow?: string
  title?: React.ReactNode
  members: Performer[]
  bowDelay?: number
  /** App mode: highlight a specific member (awards screen). */
  current?: number
  className?: string
}

export function EncoreBows({ eyebrow = "THE CAST", title, members, bowDelay = 400, current, className }: EncoreBowsProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-[hsl(var(--encore-stage))] px-4 py-20 text-white sm:px-6 lg:px-8", className)}>
      <Grain opacity={0.06} />
      <div className="relative mx-auto w-full max-w-[1120px]">
        <div className="mb-10 max-w-xl">
          <MonoLabel className="text-[hsl(var(--encore))]">{eyebrow}</MonoLabel>
          {title && <h2 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-[40px]">{title}</h2>}
        </div>
        <ul className={cn("grid grid-cols-2 gap-5 md:grid-cols-4")}>
          {members.map((m, i) => (
            <li key={m.name}>
              <BowCard i={i} m={m} reduce={reduce} start={bowDelay} spot={i === (current ?? -1)} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function BowCard({ i, m, reduce, start, spot }: { i: number; m: Performer; reduce: boolean; start: number; spot: boolean }) {
  const variants = {
    hidden: { opacity: 0, y: 18, rotateX: 0 },
    visible: {
      opacity: 1,
      y: 0,
      // three-beat bow: step forward, dip, rise
      transition: { duration: reduce ? 0 : 0.7, delay: reduce ? 0 : i * 0.18, ease: [0.16, 1, 0.3, 1] as const },
    },
  }
  return (
    <motion.div variants={variants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} className="h-full">
      <div className="group relative h-full">
        {/* pooled spotlight on the floorboard */}
        <span aria-hidden className="absolute -bottom-2 left-1/2 h-4 w-[80%] -translate-x-1/2 rounded-[50%] blur-md transition-opacity duration-700" style={{ background: "hsl(var(--encore)/0.5)", opacity: spot ? 1 : 0.35 }} />
        <motion.div
          aria-hidden={false}
          style={{ transformOrigin: "50% 100%" }}
          animate={reduce ? undefined : { rotateX: [0, 0, 18, -4, 0], z: [0, 6, 14, 6, 0] }}
          transition={{ delay: (i * 0.18) + 0.75, duration: 1.6, ease: [0.5, 0, 0.5, 1] }}
          className={cn("relative overflow-hidden rounded-lg border bg-white/5 backdrop-blur-[1px] transition-colors h-full", spot ? "border-[hsl(var(--encore))]" : "border-white/10 hover:border-white/30")}
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            {m.img ? (
              <img src={m.img} alt={m.name} loading="lazy" className="h-full w-full object-cover grayscale-[35%] transition-all duration-500 group-hover:grayscale-0" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-gradient-to-b from-white/8 to-white/2">
                <span className="font-display text-4xl font-black text-white/25">{m.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</span>
              </div>
            )}
            <span aria-hidden className="absolute right-3 top-3 font-mono text-[10px] font-black tracking-[0.2em] text-white/45">{String(i + 1).padStart(2, "0")}</span>
          </div>
          <div className="p-3.5">
            <p className="truncate font-display text-[15px] font-extrabold">{m.name}</p>
            <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--encore))]/90">{m.role}</p>
            {m.note && <p className="mt-1.5 line-clamp-2 text-[12px] font-medium leading-snug text-white/50">{m.note}</p>}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
