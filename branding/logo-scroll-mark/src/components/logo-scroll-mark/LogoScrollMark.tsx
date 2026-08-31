import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { ScrollProgress } from "@/components/primitives/scroll-progress"

// ═══ JOB      make the logomark an event, not a decoration
// ═══ EMOTION  the mark assembles itself — craft you watched happen
// ═══ SIGNATURE the SVG logomark's strokes draw with scroll scrub; a hairline
//               progress rail runs down the side; fully drawn = sign-off tick
//   SITE      → about-page openers, investor decks
//   APP       → onboarding splash (drives progress from any value)
//   A11Y      decorative svg; h2 carries meaning; reduce-motion = drawn state

export type LogoScrollMarkProps = {
  title?: string
  className?: string
}

export function LogoScrollMark({ title = "Built, stroke by stroke.", className }: LogoScrollMarkProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "center 0.45"] })
  const draw = reduce ? 1 : scrollYProgress
  const rail = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  return (
    <div ref={ref} className={cn("relative", className)}>
      <SectionShell width={760} rails>
        {/* side progress rail */}
        <span aria-hidden className="pointer-events-none absolute inset-y-16 right-6 hidden w-px bg-border sm:block">
          <motion.span style={{ height: rail }} className="absolute inset-x-0 top-0 bg-foreground" />
        </span>

        <div className="flex flex-col items-center py-8 text-center">
          <MonoLabel className="text-muted-foreground">THE MARK · DRAWN ON SCROLL</MonoLabel>

          <svg width="150" height="150" viewBox="0 0 48 48" fill="none" aria-hidden className="mt-10 text-foreground">
            <motion.rect x="4" y="4" width="40" height="40" rx="10" stroke="currentColor" strokeWidth="2.4"
              style={{ pathLength: draw }} />
            <motion.path d="M14 32 L24 14 L34 32" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
              style={{ pathLength: draw }} />
            <motion.circle cx="24" cy="27" r="3.5" fill="currentColor"
              style={{ scale: draw, transformOrigin: "24px 27px", opacity: draw }} />
          </svg>

          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-10 font-display text-[40px] font-black leading-[0.98] tracking-[-0.035em] text-foreground sm:text-[56px]"
          >
            {title}
          </motion.h2>
          <ScrollProgress className="mt-8 w-40" />
        </div>
      </SectionShell>
    </div>
  )
}
