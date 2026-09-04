import * as React from "react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Text + gallery — copy above, a running gallery below.
// ═══ EMOTION     Written and seen together.
// ═══ SIGNATURE   A narrow copy block intro over a wide auto-scan gallery.

export type TextAndGalleryProps = {
  eyebrow?: string
  title?: React.ReactNode
  body?: React.ReactNode
  frames?: { src?: string; alt?: string }[]
  tone?: "paper" | "ink"
  className?: string
}

export function TextAndGallery({ eyebrow = "FIELD NOTES", title = "The process, in frames.", body = "Words above, images below — a running record of how a section comes together.", frames = [
  { src: "/showcase/content/content-01-office.webp", alt: "1" }, { src: "/showcase/content/content-02-team.webp", alt: "2" }, { src: "/showcase/content/content-03-product.webp", alt: "3" }
], tone = "paper", className }: TextAndGalleryProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-5 sm:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className="max-w-2xl">
            <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
          <p className={cn("mt-4 text-base font-medium leading-relaxed", ink ? "text-background/75" : "text-muted-foreground")}>{body}</p>
        </div>
      </InView>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {frames.map((f, i) => (
            <div key={i} className="img-hover-wash overflow-hidden rounded-xl border bg-muted">
              {f.src ? <img src={f.src} alt={f.alt ?? ""} className="aspect-[4/3] w-full object-cover" loading="lazy" /> : <div className="aspect-[4/3] w-full bg-gradient-to-br from-secondary to-muted" />}
            </div>
          ))}
        </div>
      </InView>
    
  </div>
</section>
  )
}
