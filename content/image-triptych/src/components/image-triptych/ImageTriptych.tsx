import * as React from "react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Image triptych — three framed images side by side with captions.
// ═══ EMOTION     Display-work trio.
// ═══ SIGNATURE   A three-up triptych with a shared baseline caption rail.

export type ImageTriptychProps = {
  eyebrow?: string
  title?: React.ReactNode
  frames?: { src?: string; alt?: string; caption?: string }[]
  tone?: "paper" | "ink"
  className?: string
}

export function ImageTriptych({ eyebrow = "TRIPTYCH", title = "Three frames.", frames = [
  { src: "/showcase/content/content-01-office.webp", alt: "A", caption: "01" },
  { src: "/showcase/content/content-02-team.webp", alt: "B", caption: "02" },
  { src: "/showcase/content/content-03-product.webp", alt: "C", caption: "03" },
], tone = "paper", className }: ImageTriptychProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {frames.map((f, i) => (
          <InView key={i} once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}>
            <figure>
              <div className="img-hover-wash aspect-[3/4] overflow-hidden rounded-xl border bg-muted">
                {f.src ? <img src={f.src} alt={f.alt ?? ""} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
              </div>
              {f.caption && <figcaption className={cn("mt-2 font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>{f.caption}</figcaption>}
            </figure>
          </InView>
        ))}
      </div>
    
  </div>
</section>
  )
}
