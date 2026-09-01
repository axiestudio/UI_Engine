import * as React from "react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Image showcase — a large featured image with a film-strip of thumbnails.
// ═══ EMOTION     Curated, gallery-like.
// ═══ SIGNATURE   A big frame + a row of selectable frames (active one syncs).

export type ShowcaseFrame = { id: string; src?: string; alt?: string }

export type ImageShowcaseProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  frames: ShowcaseFrame[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function ImageShowcase({
  eyebrow = "SHOWCASE",
  title = "A look inside.",
  subtitle = "Pick a frame from the strip — the large view follows.",
  frames,
  caption,
  tone = "paper",
  className,
}: ImageShowcaseProps) {
  const ink = tone === "ink"
  const [activeId, setActiveId] = React.useState(frames[0]?.id ?? "")
  const active = frames.find((f) => f.id === activeId) ?? frames[0]
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>
      <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div className="mt-10">
          <div className="img-hover-wash aspect-[3/2] overflow-hidden rounded-xl border bg-muted">
            {active?.src ? <img src={active.src} alt={active.alt ?? ""} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
          </div>
          {caption && <p className={cn("mt-3 text-right font-mono text-[10px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/55" : "text-muted-foreground")}>{caption}</p>}
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {frames.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveId(f.id)}
                className={cn("img-hover-wash aspect-[4/3] overflow-hidden rounded-lg border bg-muted transition-all", f.id === activeId ? "ring-2 ring-foreground" : "opacity-70 hover:opacity-100")}
                aria-label={f.alt}
              >
                {f.src ? <img src={f.src} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
              </button>
            ))}
          </div>
        </div>
      </InView>
    
  </div>
</section>
  )
}
