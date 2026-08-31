import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Photo essay — an editorial narrative interleaving text + imagery.
// ═══ EMOTION     Long-form, magazine.
// ═══ SIGNATURE   Alternating prose blocks and full-width / offset plates.

export type EssayFooter = { id: string; src?: string; alt?: string; caption?: string; offset?: boolean }

export type PhotoEssayProps = {
  eyebrow?: string
  title?: React.ReactNode
  intro?: React.ReactNode
  /** Non-image prose paragraphs. */
  paragraphs?: string[]
  images: EssayFooter[]
  tone?: "paper" | "ink"
  className?: string
}

export function PhotoEssay({ eyebrow = "ESSAY", title = "A room, in four blocks.", intro = "How light, layout and restraint turn a space into a page.", paragraphs = [
  "The first decision is usually the quiet one: what you leave out.",
  "Textures carry the story when the palette stays disciplined.",
], images = [
  { id: "p1", src: "/showcase/content/content-01-office.webp", alt: "Plate 1", caption: "PLATE I" },
  { id: "p2", src: "/showcase/content/content-02-team.webp", alt: "Plate 2", caption: "PLATE II", offset: true },
  { id: "p3", src: "/showcase/content/content-03-product.webp", alt: "Plate 3", caption: "PLATE III" },
], tone = "paper", className }: PhotoEssayProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className="max-w-2xl">
          <p className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-[0.98] tracking-[-0.03em] sm:text-5xl">{title}</h2>
          <p className={cn("mt-4 text-base font-medium leading-relaxed", ink ? "text-background/75" : "text-muted-foreground")}>{intro}</p>
        </div>
      </InView>
      <div className="mt-10 space-y-10">
        {paragraphs.map((p, i) => (
          <InView key={i} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <p className={cn("max-w-xl text-lg font-medium leading-relaxed", ink ? "text-background/85" : "text-foreground")}>{p}</p>
          </InView>
        ))}
        {images.map((img, i) => (
          <InView key={img.id} once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
            <figure className={cn(img.offset ? "sm:ml-auto sm:w-3/4" : "sm:w-4/5")}>
              <div className="img-hover-wash aspect-[16/9] overflow-hidden rounded-xl border bg-muted">
                {img.src ? <img src={img.src} alt={img.alt ?? ""} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
              </div>
              {img.caption && <figcaption className={cn("mt-2 font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>{img.caption}</figcaption>}
            </figure>
          </InView>
        ))}
      </div>
    </SectionShell>
  )
}
