import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Flip through product screens on one steady canvas.
// ═══ EMOTION     Curated demo table — the reviewer is in control.
// ═══ SIGNATURE   The film strip: thumbnails switch the screen with a
//                 crossfade while the caption slides through an Ordinal.
//                 Hardware stays physically black in every theme.

export type DeviceTabletScreen = {
  src: string
  caption?: string
  alt?: string
}

export type DeviceTabletProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  /** Screens to load onto the tablet; the film strip switches between them. */
  screens?: DeviceTabletScreen[]
  children?: React.ReactNode
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function DeviceTablet({
  eyebrow = "TABLET",
  title = "One canvas, every screen.",
  subtitle = "Landscape tablet with a film strip underneath — tap a thumbnail and the screen crossfades while the caption counts through the reel.",
  screens = [
    { src: "/showcase/content/content-01-office.webp", caption: "Overview" },
    { src: "/showcase/content/content-03-product.webp", caption: "Product" },
    { src: "/showcase/content/content-02-team.webp", caption: "The team" },
  ],
  children,
  caption = "VIEWPORT 1024 · TABLET",
  tone = "paper",
  className,
}: DeviceTabletProps) {
  const ink = tone === "ink"
  const reduce = useReducedMotion()
  const [i, setI] = React.useState(0)
  const active = screens[Math.min(i, screens.length - 1)]
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
          {/* ── The machine ── */}
          <div className="relative">
            <div className="relative rounded-[30px] bg-black p-[12px] shadow-[0_36px_72px_-32px_hsl(var(--foreground)/0.5),inset_0_0_0_2px_hsl(0_0%_100%/0.08)]">
              {/* camera — physical hardware */}
              <span aria-hidden className="absolute left-3 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-white/25" />

              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[19px] bg-background sm:aspect-[16/10]">
                {children ?? (
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.img
                      key={active.src}
                      src={active.src}
                      alt={active.alt ?? "Tablet screen"}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover object-top"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.015 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.995 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </AnimatePresence>
                )}
                {/* home indicator */}
                <span aria-hidden className="absolute bottom-1.5 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-black/50" />
              </div>
            </div>

            {/* stand shadow */}
            <span aria-hidden className="mx-auto mt-4 block h-3.5 w-3/4 rounded-[100%] bg-[hsl(var(--foreground)/0.16)] blur-lg" />
          </div>

          {/* ── Film strip ── */}
          {!children && screens.length > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3" role="tablist" aria-label="Screens">
              {screens.map((s, x) => (
                <button
                  key={s.src}
                  type="button"
                  role="tab"
                  aria-selected={x === i}
                  onClick={() => setI(x)}
                  className={cn(
                    "group relative h-14 w-24 overflow-hidden rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    x === i
                      ? "border-primary ring-1 ring-primary shadow-md"
                      : "border-border opacity-60 hover:opacity-90",
                  )}
                >
                  <img src={s.src} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <span
                    className={cn(
                      "sr-only",
                    )}
                  >
                    {s.caption ?? `Screen ${x + 1}`}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Caption rail with sliding label */}
          <figcaption
            className={cn(
              "mt-3 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
              hair,
              ink ? "text-background/55" : "text-muted-foreground",
            )}
          >
            <span className="relative inline-flex h-[1.2em] items-center overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={active.caption ?? String(i)}
                  initial={reduce ? { opacity: 0 } : { y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { y: -14, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="whitespace-nowrap"
                >
                  {children ? caption : `${String(i + 1).padStart(2, "0")} · ${active.caption ?? caption}`}
                </motion.span>
              </AnimatePresence>
            </span>
            <span aria-hidden className="ml-auto pl-6">
              {String(screens.length).padStart(2, "0")}
            </span>
          </figcaption>
        </figure>
      </InView>
    
  </div>
</section>
  )
}
