import * as React from "react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Story split — a narrative pane beside a supportive image.
// ═══ EMOTION     Origin story, quietly told.
// ═══ SIGNATURE   A chapter-style copy block with a vertical rule beside media.

export type StorySplitProps = {
  eyebrow?: string
  title?: React.ReactNode
  paragraphs?: string[]
  signature?: string
  image?: { src?: string; alt?: string }
  tone?: "paper" | "ink"
  className?: string
}

export function StorySplit({
  eyebrow = "ORIGIN",
  title = "We started in a basement.",
  paragraphs = [
    "Two designers, one borrowed table, and a shared frustration with template-y websites.",
    "We wanted sections that read like they were written — so we built them as sentences, not rectangles.",
  ],
  signature = "— The founders",
  image = { src: "/showcase/content/content-01-office.webp", alt: "Early days" },
  tone = "paper",
  className,
}: StorySplitProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-5 sm:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div>
              <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
            <div className={cn("mt-5 space-y-4 border-l pl-6", ink ? "border-background/25" : "border-border")}>
              {paragraphs.map((p, i) => (
                <p key={i} className={cn("text-base font-medium leading-relaxed", ink ? "text-background/75" : "text-muted-foreground")}>{p}</p>
              ))}
              {signature && <p className={cn("font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/55" : "text-muted-foreground")}>{signature}</p>}
            </div>
          </div>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
          <div className="img-hover-wash aspect-[4/3] overflow-hidden rounded-[24px] border">
            {image.src ? <img src={image.src} alt={image.alt ?? ""} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
          </div>
        </InView>
      </div>
    
  </div>
</section>
  )
}
