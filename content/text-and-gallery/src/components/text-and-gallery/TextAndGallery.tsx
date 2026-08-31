import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
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
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className="max-w-2xl">
          <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
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
    </SectionShell>
  )
}
