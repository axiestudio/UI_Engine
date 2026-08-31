import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
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
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
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
    </SectionShell>
  )
}
