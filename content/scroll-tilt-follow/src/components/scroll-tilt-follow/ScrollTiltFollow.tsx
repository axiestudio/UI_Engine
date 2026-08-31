import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { Tilt } from "@/components/primitives/tilt"
import { SectionShell } from "@/components/primitives/handcraft"

// ═══ JOB         Tilt follow — a card that tilts with scroll AND cursor.
// ═══ EMOTION     Two kinds of motion, one card.
// ═══ SIGNATURE   Scroll-driven rotation + pointer tilt on a showcase card.

export type ScrollTiltFollowProps = {
  eyebrow?: string
  title?: string
  body?: string
  image?: string
  className?: string
}

export function ScrollTiltFollow({ eyebrow = "FOLLOW", title = "It tilts two ways.", body = "Scroll rotates the card; the cursor tilts it. Both at once.", image = "/showcase/content/content-01-office.webp", className }: ScrollTiltFollowProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const rotY = useTransform(scrollYProgress, [0, 1], [-10, 10])
  return (
    <SectionShell width={920} rule="bottom" className={className}>
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
      <div ref={ref} className="mt-10 grid place-items-center [perspective:1200px]">
        <motion.div style={{ rotateY: rotY }} className="w-full max-w-md">
          <Tilt rotationFactor={9}>
            <div className="overflow-hidden rounded-[28px] border bg-card shadow-2xl">
              <div className="img-hover-wash aspect-[4/3]">
                <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold">{title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </div>
          </Tilt>
        </motion.div>
      </div>
    </SectionShell>
  )
}
