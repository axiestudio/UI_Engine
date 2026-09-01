import * as React from "react"
import { Check } from "lucide-react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Image + text split — an image pane beside copy.
// ═══ EMOTION     Editorial two-up.
// ═══ SIGNATURE   Image pane (hover wash) alternating beside a copy column.

export type ImageTextSplitProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  image?: { src: string; alt?: string }
  points?: string[]
  ctaLabel?: string
  ctaHref?: string
  /** Put the image on the right. */
  flip?: boolean
  tone?: "paper" | "ink"
  className?: string
}

export function ImageTextSplit({
  eyebrow = "APPROACH",
  title = "A method, not a theme.",
  subtitle = "Every section ships with real typography, texture and a single signature move — so a site feels made by hand.",
  image = { src: "/showcase/content/content-01-office.webp", alt: "Detail" },
  points = ["Token-first, re-themes instantly", "Accessible and reduced-motion aware", "One deliberate interaction per section"],
  ctaLabel = "Read the process",
  ctaHref = "#",
  flip = false,
  tone = "paper",
  className,
}: ImageTextSplitProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <div className={cn("grid gap-10 lg:grid-cols-2 lg:items-center", className)}>
        <InView once variants={{ hidden: { opacity: 0, x: flip ? 24 : -24 }, visible: { opacity: 1, x: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className={cn("img-hover-wash aspect-[4/3] overflow-hidden rounded-[24px] border", flip && "lg:order-last")}>
            <img src={image.src} alt={image.alt ?? ""} className="h-full w-full object-cover" loading="lazy" />
          </div>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, x: flip ? -24 : 24 }, visible: { opacity: 1, x: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
          <div>
              <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
            {points && (
              <ul className="mt-6 space-y-2">
                {points.map((p) => (
                  <li key={p} className={cn("flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/60" : "text-muted-foreground")}>
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> {p}
                  </li>
                ))}
              </ul>
            )}
            {ctaLabel && <a href={ctaHref} className={cn("mt-8 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest underline underline-offset-4", ink ? "text-background" : "text-foreground")}>{ctaLabel}</a>}
          </div>
        </InView>
      </div>
    
  </div>
</section>
  )
}
