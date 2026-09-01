import * as React from "react"
import { motion } from "motion/react"
import { Lock } from "lucide-react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"
import { MacbookPro } from "@/components/eldora/macbook-pro"

// ═══ JOB         Show a full website as it lands on a real desktop.
// ═══ EMOTION     "That could be my site, on my machine, tonight."
// ═══ SIGNATURE   The power-on moment — the panel wakes with a scanline sweep,
//                 then the browser chrome reads like hardware, not a drawing.

export type DeviceDesktopProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  /** Screenshot for the screen (or pass children as custom screen content). */
  src?: string
  alt?: string
  children?: React.ReactNode
  /** URL shown in the chrome's address pill. */
  url?: string
  /** Browser tab titles; the first is active. */
  tabs?: string[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function DeviceDesktop({
  eyebrow = "DESKTOP",
  title = "Every pixel, full size.",
  subtitle = "Your site on a 1440-wide canvas — chrome, tabs and address bar included. Pass a screenshot or render live children on the screen.",
  src = "/showcase/content/content-01-office.webp",
  alt = "Website shown in a desktop browser",
  children,
  url = "studio.example.com",
  tabs = ["Home", "Booking", "Journal"],
  caption = "VIEWPORT 1440 · DESKTOP CHROME",
  tone = "paper",
  className,
}: DeviceDesktopProps) {
  const ink = tone === "ink"
  const [woken, setWoken] = React.useState(false)

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
          {/* ── The machine — Eldora UI MacbookPro repo frame ── */}
          <div className="relative mx-auto w-full max-w-[760px]">
            <MacbookPro className="pointer-events-none block h-auto w-full" />
            {/* screen content sits on the Eldora display rect (11.46%/5.33%/77.11%/80.96%) */}
            <div className="absolute overflow-hidden" style={{ left: "11.46%", top: "5.33%", width: "77.11%", height: "80.96%" }}>
              {/* Browser chrome — token-styled */}
              <div className="flex items-center gap-2 border-b border-background/15 bg-black/90 px-3 pb-1.5 pt-2">
                {/* Monochrome traffic lights — deliberate hardware-neutral chrome */}
                <span aria-hidden className="flex gap-1">
                  {["opacity-60", "opacity-40", "opacity-25"].map((o, i) => (
                    <span key={i} className={cn("size-2 rounded-full bg-white", o)} />
                  ))}
                </span>
                {/* Tab strip */}
                <span aria-hidden className="ml-2 hidden items-end gap-1 sm:flex">
                  {tabs.map((t, i) => (
                    <span
                      key={t}
                      className={cn(
                        "rounded-t px-2.5 py-0.5 font-mono text-[9px] font-semibold tracking-wide",
                        i === 0 ? "bg-black text-white/85" : "text-white/35",
                      )}
                    >
                      {t}
                    </span>
                  ))}
                </span>
                {/* Address pill */}
                <span className="ml-auto flex h-5 min-w-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 font-mono text-[9px] font-medium text-white/60">
                  <Lock className="size-2.5 shrink-0" aria-hidden />
                  <span className="truncate">{url}</span>
                </span>
              </div>
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-background">
              {children ?? (
                <img
                  src={src}
                  alt={alt}
                  loading="lazy"
                  className="h-full w-full object-cover object-top"
                />
              )}
              {/* wake overlay */}
              <motion.span
                aria-hidden
                className="absolute inset-0 z-[2] bg-black"
                initial={{ opacity: 1 }}
                animate={{ opacity: woken ? 0 : 1 }}
                transition={{ duration: 0.55, ease: "easeOut", delay: 0.35 }}
                onAnimationComplete={() => setWoken(true)}
              />
              {/* scanline sweep */}
              <motion.span
                aria-hidden
                className="absolute inset-x-0 z-[3] h-16 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background)/0.16),transparent)]"
                initial={{ y: "-20%", opacity: 0 }}
                animate={{ y: "420%", opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.1, ease: "easeInOut", delay: 0.45, times: [0, 0.2, 0.8, 1] }}
              />
              <span aria-hidden className={cn("pointer-events-none absolute inset-0", "z-[4] text-white/50")}>
    <span className="absolute border-current top-[10px] left-[10px] border-t border-l" style={{ width: 14, height: 14 }} />
    <span className="absolute border-current top-[10px] right-[10px] border-t border-r" style={{ width: 14, height: 14 }} />
    <span className="absolute border-current bottom-[10px] left-[10px] border-b border-l" style={{ width: 14, height: 14 }} />
    <span className="absolute border-current bottom-[10px] right-[10px] border-b border-r" style={{ width: 14, height: 14 }} />
  </span>
              </div>
            </div>
          </div>

          {/* Caption rail */}
          {caption && (
            <figcaption
              className={cn(
                "mt-3 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
                ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
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
