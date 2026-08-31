import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Spotlight } from "@/components/primitives/spotlight"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Lightbox gallery — a tile grid; hover reveals a spotlight, click enlarges.
// ═══ EMOTION     Attentive, hotel-light.
// ═══ SIGNATURE   A spotlight-follow tile grid with a single-frame focus view.

export type LightboxFrame = { id: string; src?: string; alt?: string }

export type LightboxGalleryProps = {
  eyebrow?: string
  title?: React.ReactNode
  frames: LightboxFrame[]
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_FRAMES = [
  { id: "f1", src: "/showcase/gallery-01.webp", alt: "Showroom long shot" },
  { id: "f2", src: "/showcase/gallery-02.webp", alt: "Oak detail" },
  { id: "f3", src: "/showcase/gallery-03.webp", alt: "Brass hardware" },
  { id: "f4", src: "/showcase/gallery-04.webp", alt: "Studio corner" },
  { id: "f5", src: "/showcase/gallery-05.webp", alt: "Freshly oiled top" },
  { id: "f6", src: "/showcase/gallery-06.webp", alt: "Evening bench" },
]
export function LightboxGallery({ eyebrow = "LIGHTBOX", title = "Look closer.", frames = DEFAULT_FRAMES, tone = "paper", className }: LightboxGalleryProps) {
  const ink = tone === "ink"
  const [activeId, setActiveId] = React.useState<string | null>(frames[0]?.id ?? null)
  const active = frames.find((f) => f.id === activeId) ?? frames[0]
  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {frames.map((f) => (
            <button key={f.id} type="button" onClick={() => setActiveId(f.id)} className="relative overflow-hidden rounded-xl border bg-muted focus-visible:ring-2 focus-visible:ring-ring" aria-label={f.alt}>
              <Spotlight className="z-10" size={160} />
              {f.src ? <img src={f.src} alt={f.alt ?? ""} className={cn("aspect-square w-full object-cover transition-opacity", f.id === activeId ? "opacity-100" : "opacity-80")} loading="lazy" /> : <div className="aspect-square w-full bg-gradient-to-br from-secondary to-muted" />}
              <span className="pointer-events-none absolute right-2 top-2 z-20 rounded-full bg-black/50 px-2 py-0.5 font-mono text-[9px] font-bold text-white">{f.id === activeId ? "✓" : "+"}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border bg-muted">
          {active?.src ? <img src={active.src} alt={active.alt ?? ""} className="aspect-[16/9] w-full object-cover" /> : <div className="aspect-[16/9] w-full bg-gradient-to-br from-secondary to-muted" />}
        </div>
      </InView>
    </SectionShell>
  )
}
