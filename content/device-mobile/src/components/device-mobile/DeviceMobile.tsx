import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Show the pocket version of the product — app or site.
// ═══ EMOTION     Held in one hand, obviously. Intimate, alive.
// ═══ SIGNATURE   The floating grip — the device hovers at a slight rest
//                 angle, tilts toward the pointer, and its grip shadow
//                 answers the movement. Hardware constants (bezel, island)
//                 stay physically black in every theme, like real devices.

export type DeviceMobileProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  /** Screenshot for the screen (or pass children as custom screen content). */
  src?: string
  alt?: string
  children?: React.ReactNode
  /** Clock drawn into the status bar. */
  time?: string
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function DeviceMobile({
  eyebrow = "MOBILE",
  title = "It fits in a thumb.",
  subtitle = "Status bar, dynamic island, home indicator — the real chrome around your screen. Tilt follows the pointer; the grip shadow answers.",
  src = "/showcase/content/content-05-workshop.webp",
  alt = "Website shown on a phone",
  children,
  time = "9:41",
  caption = "VIEWPORT 390 · iOS CHROME",
  tone = "paper",
  className,
}: DeviceMobileProps) {
  const ink = tone === "ink"
  const reduce = useReducedMotion()
  const tiltX = reduce ? 0 : 10
  const tiltY = reduce ? 0 : -12

  return (
    <SectionShell tone={tone} width={920} rule="bottom" className={className}>
      <InView
        once
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 28, rotate: reduce ? 0 : -1.5 }, visible: { opacity: 1, y: 0, rotate: 0 } }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <figure className="mt-10 flex flex-col items-center">
          <motion.div
            role="img"
            aria-label={alt}
            whileHover={reduce ? undefined : { rotateX: tiltX, rotateY: tiltY, y: -6 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            style={{ transformPerspective: 900 }}
            className="relative w-[248px] rounded-[44px] bg-black p-[10px] shadow-[0_40px_80px_-32px_hsl(var(--foreground)/0.55),inset_0_0_0_2px_hsl(0_0%_100%/0.08)]"
          >
            {/* hardware side buttons — physical constants */}
            <span aria-hidden className="absolute -left-[2.5px] top-[92px] h-12 w-[3px] rounded-l-sm bg-black/90" />
            <span aria-hidden className="absolute -left-[2.5px] top-[152px] h-9 w-[3px] rounded-l-sm bg-black/90" />
            <span aria-hidden className="absolute -right-[2.5px] top-[118px] h-16 w-[3px] rounded-r-sm bg-black/90" />

            {/* screen */}
            <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[35px] bg-background">
              {children ?? (
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              )}
              {/* status bar */}
              <span aria-hidden className="absolute inset-x-0 top-0 z-[2] flex items-center justify-between px-5 pt-2.5 font-mono text-[10px] font-bold text-white mix-blend-difference">
                <span>{time}</span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-3 rounded-[2px] border border-current" />
                  <span className="inline-block h-2.5 w-5 rounded-[3px] border border-current" />
                </span>
              </span>
              {/* dynamic island — physical hardware */}
              <span aria-hidden className="absolute left-1/2 top-2 z-[3] h-[22px] w-[86px] -translate-x-1/2 rounded-full bg-black" />
              {/* home indicator */}
              <span aria-hidden className="absolute bottom-2 left-1/2 z-[3] h-1 w-24 -translate-x-1/2 rounded-full bg-black/60" />
            </div>
          </motion.div>

          {/* grip shadow — answers the tilt */}
          <motion.span
            aria-hidden
            className="mt-5 h-4 w-44 rounded-[100%] bg-[hsl(var(--foreground)/0.22)] blur-md"
            whileHover={{ scaleX: 0.88, opacity: 0.7 }}
          />

          {caption && (
            <figcaption
              className={cn(
                "mt-5 flex w-full items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
                ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
              )}
            >
              <span>{caption}</span>
              <span aria-hidden>●</span>
            </figcaption>
          )}
        </figure>
      </InView>
    </SectionShell>
  )
}
