import * as React from "react"
// embla-carousel-react v8 documents the default import — portable across builds
import useEmblaCarousel from "embla-carousel-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"


// ═══ JOB         Sell the collection as a film, not a grid.
// ═══ EMOTION     Flipping through a lookbook at the studio table.
// ═══ SIGNATURE   The center slide breathes: neighbors scale down and dim
//                 while the focused look stays full — and the thumbnail rail
//                 drives the deck. Drag, arrows or thumbs; Embla carries it.

export type LookEntry = { src: string; alt?: string; label?: string }

export type EmblaLookbookProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  looks?: LookEntry[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function EmblaLookbook({
  eyebrow = "EMBLA · LOOKBOOK",
  title = "The collection, on rails.",
  subtitle = "Drag through the deck — the focused look stays full while its neighbors step back. Arrows, drag or the thumbnail rail: Embla keeps every move spring-honest.",
  looks = [
    { src: "/showcase/gallery-01.webp", label: "Look 01 · Studio" },
    { src: "/showcase/gallery-02.webp", label: "Look 02 · Workshop" },
    { src: "/showcase/gallery-03.webp", label: "Look 03 · Detail" },
    { src: "/showcase/gallery-04.webp", label: "Look 04 · Atelier" },
    { src: "/showcase/gallery-05.webp", label: "Look 05 · Tools" },
    { src: "/showcase/gallery-06.webp", label: "Look 06 · Light" },
  ],
  caption = "SCALE + OPACITY FOCUS · THUMBNAIL RAIL",
  tone = "paper",
  className,
}: EmblaLookbookProps) {
  const ink = tone === "ink"
  const [emblaRef, embla] = useEmblaCarousel({ align: "center", loop: true })
  const [emblaThumbsRef, emblaThumbs] = useEmblaCarousel({ align: "center", containScroll: "keepSnaps", dragFree: true })
  const [active, setActive] = React.useState(0)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  const onSelect = React.useCallback(() => {
    if (!embla) return
    setActive(embla.selectedScrollSnap())
    emblaThumbs?.scrollTo(embla.selectedScrollSnap(), undefined, true)
  }, [embla, emblaThumbs])

  React.useEffect(() => {
    if (!embla) return
    onSelect()
    embla.on("select", onSelect)
    embla.on("reInit", onSelect)
    return () => {
      embla.off("select", onSelect)
      embla.off("reInit", onSelect)
    }
  }, [embla, onSelect])

  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
        <figure className="mt-10">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y py-2">
              {looks.map((look, i) => (
                <div key={look.src} className="min-w-0 shrink-0 grow-0 basis-[72%] px-3 sm:basis-[58%]">
                  <motion.figure
                    aria-hidden={i !== active}
                    animate={{ scale: i === active ? 1 : 0.9, opacity: i === active ? 1 : 0.45 }}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 26 }}
                    className={cn("overflow-hidden rounded-[18px] border", ink ? "border-background/15" : "border-border")}
                  >
                    <img src={look.src} alt={look.alt ?? look.label ?? `Look ${i + 1}`} loading="lazy" className="aspect-[16/10] w-full object-cover" draggable={false} />
                    <figcaption className={cn("border-t px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em]", ink ? "border-background/15 text-background/60" : "border-border text-muted-foreground")}>
                      {look.label ?? `Look ${String(i + 1).padStart(2, "0")}`}
                    </figcaption>
                  </motion.figure>
                </div>
              ))}
            </div>
          </div>

          {/* controls */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => embla?.scrollPrev()}
              aria-label="Previous look"
              className="flex size-10 items-center justify-center rounded-full border bg-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M10 3 5 8l5 5" /></svg>
            </button>
            {/* thumbnail rail */}
            <div className="overflow-hidden max-w-[62%]" ref={emblaThumbsRef}>
              <div className="flex gap-2 touch-pan-y">
                {looks.map((look, i) => (
                  <button
                    key={look.src}
                    type="button"
                    onClick={() => embla?.scrollTo(i)}
                    aria-label={`Go to ${look.label ?? `look ${i + 1}`}`}
                    aria-current={i === active}
                    className={cn(
                      "relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      i === active ? "border-primary ring-1 ring-primary" : cn("opacity-50 hover:opacity-90", ink ? "border-background/20" : "border-border"),
                    )}
                  >
                    <img src={look.src} alt="" loading="lazy" className="h-full w-full object-cover" draggable={false} />
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => embla?.scrollNext()}
              aria-label="Next look"
              className="flex size-10 items-center justify-center rounded-full border bg-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="m6 3 5 5-5 5" /></svg>
            </button>
          </div>

          {caption && (
            <figcaption
              className={cn(
                "mx-auto mt-8 flex max-w-[640px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
                ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
              )}
            >
              <span>{caption}</span>
              <span aria-hidden className="tabular-nums">{String(active + 1).padStart(2, "0")} / {String(looks.length).padStart(2, "0")}</span>
            </figcaption>
          )}
        </figure>
      </InView>
    </SectionShell>
  )
}
