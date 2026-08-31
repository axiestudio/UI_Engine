import * as React from "react"
import { motion, useScroll, useTransform, type MotionValue } from "motion/react"
import { SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Text-fade — a long paragraph whose words dim when they leave the center.
// ═══ EMOTION     Reading as a spotlight.
// ═══ SIGNATURE   Each word fades in/out based on its position relative to the scroll center.

export type ScrollTextFadeProps = {
  eyebrow?: string
  text?: string
  tone?: "paper" | "ink"
  className?: string
}

export function ScrollTextFade({ eyebrow = "READ", text = "Scroll slowly. As each phrase passes the center of the screen it brightens, then recedes — a spotlight that follows your pace.", tone = "paper", className }: ScrollTextFadeProps) {
  const ink = tone === "ink"
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.15"] })
  const words = text.split(" ")
  return (
    <SectionShell tone={tone} width={920} grain={!ink} rule="bottom" className={className}>
      <div ref={ref} className={cn("py-10", ink ? "text-background" : "text-foreground")}>
        {eyebrow && <p className={cn("mb-6 font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>}
        <p className="flex flex-wrap font-display text-2xl font-bold leading-[1.4] tracking-[-0.01em] sm:text-4xl">
          {words.map((w, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} ink={ink}>{w}</Word>
          ))}
        </p>
      </div>
    </SectionShell>
  )
}

function Word({ progress, range, children, ink }: { progress: MotionValue<number>; range: [number, number]; children: string; ink: boolean }) {
  const opacity = useTransform(progress, range, ink ? [0.18, 1, 0.18] : [0.15, 1, 0.15])
  const y = useTransform(progress, range, [6, 0, 6])
  return (
    <motion.span style={{ opacity, y }} className="mr-[0.35em] inline-block">{children}</motion.span>
  )
}
