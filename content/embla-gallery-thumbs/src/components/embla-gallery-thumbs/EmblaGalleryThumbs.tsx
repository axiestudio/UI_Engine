import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { AnimatePresence, motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { Ordinal, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Let the room do the talking — six frames, zero text.
// ═══ EMOTION     Contact sheet under a loupe: pick the thumbnail, keep the
//                 big picture.
// ═══ SIGNATURE   A looped main rail that crossfades on every snap, synced
//                 both ways with a plain grid of thumbnails — the counter
//                 keeps score in the caption.

export type GalleryFrame = {
  id: string
  src: string
  alt: string
}

export type EmblaGalleryThumbsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  frames?: GalleryFrame[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_FRAMES: GalleryFrame[] = [
  { id: "g1", src: "/showcase/gallery-01.webp", alt: "Studio floor in morning light" },
  { id: "g2", src: "/showcase/gallery-02.webp", alt: "Chair 01 by the window" },
  { id: "g3", src: "/showcase/gallery-03.webp", alt: "The colour bar, mid-mix" },
  { id: "g4", src: "/showcase/gallery-04.webp", alt: "The wash corner, low light" },
  { id: "g5", src: "/showcase/gallery-05.webp", alt: "Tools laid out before opening" },
  { id: "g6", src: "/showcase/gallery-06.webp", alt: "Chairs stacked after closing" },
]

export function EmblaGalleryThumbs({
  eyebrow = "QUIET TIMES STUDIO · THE ROOM",
  title = "Six frames of quiet.",
  subtitle = "The studio in Jönköping as it actually looks — morning light, warm water, chairs where they belong. Tap a thumbnail or drag the main frame.",
  frames = DEFAULT_FRAMES,
  caption = "FOLIO · JÖNKÖPING · SHOT ON FILM",
  tone = "paper",
  className,
}: EmblaGalleryThumbsProps) {
  const ink = tone === "ink"
  const reducedMotion = React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )
  const [emblaRef, embla] = useEmblaCarousel({ loop: true })
  const [selected, setSelected] = React.useState(0)

  React.useEffect(() => {
    if (!embla) return
    const onSelect = () => setSelected(embla.selectedScrollSnap())
    embla.on("select", onSelect)
    return () => {
      embla.off("select", onSelect)
    }
  }, [embla])

  return (
    <SectionShell tone={tone} width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
        <figure className="mt-10">
          {/* main rail — crossfades on every snap */}
          <div
            className="cursor-grab overflow-hidden active:cursor-grabbing"
            ref={emblaRef}
            role="group"
            aria-roledescription="carousel"
            aria-label="Studio gallery"
          >
            <div className="flex touch-pan-y">
              {frames.map((frame, i) => (
                <div
                  key={frame.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${frame.alt}, ${i + 1} of ${frames.length}`}
                  className="min-w-0 shrink-0 grow-0 basis-[100%]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] border border-border bg-muted">
                    <AnimatePresence initial={false}>
                      {i === selected && (
                        <motion.img
                          key={frame.id}
                          src={frame.src}
                          alt={frame.alt}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: reducedMotion ? 0 : 0.45, ease: "easeOut" }}
                          className="absolute inset-0 h-full w-full object-cover"
                          draggable={false}
                        />
                      )}
                    </AnimatePresence>
                    <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-background/85 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-foreground">
                      {frame.alt}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* static thumbnail grid — not an embla */}
          <div className="mt-4 grid grid-cols-6 gap-2">
            {frames.map((frame, i) => (
              <button
                key={frame.id}
                type="button"
                aria-label={`View image ${i + 1}: ${frame.alt}`}
                aria-current={i === selected ? "true" : undefined}
                onClick={() => embla?.scrollTo(i)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  i === selected ? "border-transparent opacity-100 ring-2 ring-primary" : "border-border opacity-70 hover:opacity-100",
                )}
              >
                <img src={frame.src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
              </button>
            ))}
          </div>

          {caption && (
            <figcaption
              className={cn(
                "mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
                ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
              )}
            >
              <span>{caption}</span>
              <span aria-live="polite" className="flex items-center gap-3">
                <Ordinal n={selected + 1} total={frames.length} className={ink ? "text-background/60" : undefined} />
                <span aria-hidden>●</span>
              </span>
            </figcaption>
          )}
        </figure>
      </InView>
    </SectionShell>
  )
}
