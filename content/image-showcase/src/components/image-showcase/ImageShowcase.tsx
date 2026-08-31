import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
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
    <SectionShell tone={tone} width={1120} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div className="mt-10">
          <div className="img-hover-wash aspect-[3/2] overflow-hidden rounded-2xl border bg-muted">
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
    </SectionShell>
  )
}
