import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"
import { MacbookPro } from "@/components/eldora/macbook-pro"

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
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
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
              className="relative z-[2] mx-auto w-full rounded-t-[18px] bg-[hsl(var(--device-black))] p-[10px] pb-[12px] shadow-[inset_0_0_0_2px_hsl(var(--background)/0.08)]"
            >
              {/* Eldora UI MacbookPro frame */}
              <MacbookPro className="pointer-events-none block h-auto w-full" />
              {/* screen content lies on Eldora's display rect (11.46%/5.33%/77.11%/80.96%) */}
              <div className="absolute overflow-hidden" style={{ left: "11.46%", top: "5.33%", width: "77.11%", height: "80.96%" }}>
                {children ?? (
                  <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover object-top" />
                )}
                {/* screen wake */}
                <motion.span
                  aria-hidden
                  className="absolute inset-0 z-[2] bg-[hsl(var(--device-black))]"
                  initial={{ opacity: 1 }}
                  whileInView={{ opacity: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.85 }}
                />
                {/* glass sheen — one sweep as the lid rests */}
                {!reduce && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/3 z-[3] w-1/3 -skew-x-12 bg-[linear-gradient(90deg,transparent,hsl(var(--background)/0.1),transparent)]"
                    initial={{ x: "-20%" }}
                    whileInView={{ x: "420%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: "easeInOut", delay: 1.35 }}
                  />
                )}
                {/* camera notch */}
                <span aria-hidden className="absolute left-1/2 top-0 z-[4] h-[9px] w-[86px] -translate-x-1/2 rounded-b-md bg-[hsl(var(--device-black))]" />
              </div>
            </motion.div>


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
    
  </div>
</section>
  )
}
