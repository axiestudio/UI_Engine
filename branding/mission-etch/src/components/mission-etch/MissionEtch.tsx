import * as React from "react"
import { motion, useScroll, useTransform, MotionValue } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"

// ═══ JOB      make the mission statement felt, not skimmed
// ═══ EMOTION  engraved conviction — words carved, not printed
// ═══ SIGNATURE outlined mission text that fills with ink as you scroll;
//               each sentence snaps filled clause-by-clause with ordinals
//   SITE      → mission/about chapters, annual letters
//   APP       → company-config splash, values onboarding
//   A11Y      real text; reduce-motion = fully filled

export type MissionEtchProps = {
  lines?: string[]
  className?: string
}

function EtchedLine({ line, i, total, fill, reduce }: { line: string; i: number; total: number; fill: MotionValue<number>; reduce: boolean }) {
  const clip = useTransform(fill, [i / total, (i + 0.92) / total], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"])
  return (
    <p className="relative font-display text-[26px] font-black leading-[1.14] tracking-[-0.02em] text-foreground sm:text-[38px]">
      <span aria-hidden className="absolute inset-0 [-webkit-text-stroke:1.2px_currentColor] text-transparent opacity-25">
        {line}
      </span>
      <motion.span aria-hidden style={reduce ? { clipPath: "inset(0 0% 0 0)" } : { clipPath: clip }} className="relative">
        {line}
      </motion.span>
      <span className="sr-only">{line}</span>
      <span className="mt-3 block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        — clause {String(i + 1).padStart(2, "0")}
      </span>
    </p>
  )
}

export function MissionEtch({ lines = [
  "We believe good work compounds quietly.",
  "We build tools that respect the hand that uses them.",
  "We finish. That is the whole trick.",
], className }: MissionEtchProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.55"] })
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <div ref={ref}>
      <SectionShell width={920} rails className={className}>
        <MonoLabel className="text-muted-foreground">MISSION · ENGRAVED</MonoLabel>
        <div className="mt-8 space-y-10">
          {lines.map((line, i) => (
            <EtchedLine key={i} line={line} i={i} total={lines.length} fill={fill} reduce={reduce} />
          ))}
        </div>
        <div className="mt-14 flex items-center gap-3 border-t border-dashed border-border pt-6">
          <span className="size-[7px] rotate-45 bg-foreground" aria-hidden />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">signed in ink · the partners</span>
        </div>
      </SectionShell>
    </div>
  )
}
