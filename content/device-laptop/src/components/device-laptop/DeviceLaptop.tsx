import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Present the product on the machine people actually buy.
// ═══ EMOTION     Unboxing — the lid was closed, and now it opens for you.
// ═══ SIGNATURE   The hinge: the lid swings open on scroll-into-view with a
//                 weighted spring, the screen lights mid-swing, and a sheen
//                 sweeps the glass once it rests. Hardware stays physically
//                 black in every theme.

export type DeviceLaptopProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  /** Screenshot for the screen (or pass children as custom screen content). */
  src?: string
  alt?: string
  children?: React.ReactNode
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function DeviceLaptop({
  eyebrow = "LAPTOP",
  title = "Open on arrival.",
  subtitle = "The lid swings up when the section enters the viewport, the screen wakes mid-swing, and a sheen sweeps the glass as it settles.",
  src = "/showcase/content/content-04-architecture.webp",
  alt = "Website shown on a laptop",
  children,
  caption = "VIEWPORT 1280 · RETINA DECK",
  tone = "paper",
  className,
}: DeviceLaptopProps) {
  const ink = tone === "ink"
  const reduce = useReducedMotion()
  const hair = ink ? "border-background/15" : "border-border"

  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView
        once
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <figure className="mt-10">
          <div
            className="relative mx-auto w-full max-w-[880px]"
            style={{ perspective: "1600px" }}
          >
            {/* ── Lid ── */}
            <motion.div
              initial={reduce ? { rotateX: 0 } : { rotateX: -82 }}
              whileInView={reduce ? { rotateX: 0 } : { rotateX: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ type: "spring", stiffness: 46, damping: 11, mass: 1.1, delay: 0.15 }}
              style={{ transformOrigin: "bottom", transformStyle: "preserve-3d" }}
              className="relative z-[2] mx-auto w-full rounded-t-[18px] bg-black p-[10px] pb-[12px] shadow-[inset_0_0_0_2px_hsl(0_0%_100%/0.08)]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[10px] bg-background">
                {children ?? (
                  <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover object-top" />
                )}
                {/* screen wake */}
                <motion.span
                  aria-hidden
                  className="absolute inset-0 z-[2] bg-black"
                  initial={{ opacity: 1 }}
                  whileInView={{ opacity: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.85 }}
                />
                {/* glass sheen — one sweep as the lid rests */}
                {!reduce && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/3 z-[3] w-1/3 -skew-x-12 bg-[linear-gradient(90deg,transparent,hsl(0_0%_100%/0.1),transparent)]"
                    initial={{ x: "-20%" }}
                    whileInView={{ x: "420%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: "easeInOut", delay: 1.35 }}
                  />
                )}
                {/* camera notch */}
                <span aria-hidden className="absolute left-1/2 top-0 z-[4] h-[9px] w-[86px] -translate-x-1/2 rounded-b-md bg-black" />
              </div>
            </motion.div>

            {/* ── Base / deck ── */}
            <div className="relative z-[1] mx-auto h-[15px] w-[112%] -translate-x-[5.35%] rounded-b-[16px] rounded-t-sm bg-[linear-gradient(to_bottom,#1c1c1c,#0b0b0b)] shadow-[0_28px_48px_-22px_hsl(var(--foreground)/0.55)]">
              {/* thumb scoop */}
              <span aria-hidden className="absolute left-1/2 top-0 h-[7px] w-28 -translate-x-1/2 rounded-b-lg bg-black" />
              {/* faint key grid on the deck lip */}
              <span
                aria-hidden
                className="absolute inset-x-10 top-[3px] h-[4px] opacity-25 [background-image:radial-gradient(circle_at_1px_1px,hsl(0_0%_100%/0.5)_0.8px,transparent_0)] [background-size:6px_4px]"
              />
            </div>

            {/* desk reflection */}
            <span aria-hidden className="mx-auto mt-1 block h-2.5 w-[92%] rounded-[100%] bg-[hsl(var(--foreground)/0.14)] blur-md" />
          </div>

          {caption && (
            <figcaption
              className={cn(
                "mx-auto mt-8 flex max-w-[880px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
                hair,
                ink ? "text-background/55" : "text-muted-foreground",
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
