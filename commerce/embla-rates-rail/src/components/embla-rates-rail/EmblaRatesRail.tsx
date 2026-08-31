import * as React from "react"
import { useEmblaCarousel } from "embla-carousel-react"
import { cn } from "@/lib/utils"
import { Ordinal, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB         Make the rooms bookable from one horizontal rail.
// ═══ EMOTION     Walking the corridor at Quiet Times and pointing: that one.
// ═══ SIGNATURE   Four rate cards on a start-aligned rail with a hard 01/04
//                 counter — the arrows walk the corridor, the counter holds
//                 the door. Drag works too; Embla keeps every snap honest.

export type RateCard = {
  src: string
  alt?: string
  name: string
  blurb?: string
  price: string
  amenities: string[]
}

export type EmblaRatesRailProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  rates?: RateCard[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function EmblaRatesRail({
  eyebrow = "EMBLA · RATES RAIL",
  title = "Four rooms, one philosophy: no surprises.",
  subtitle = "Every rate below is the rate. Towels, tea and a straight answer included — what the card says is what lands on the receipt.",
  rates = [
    { src: "/showcase/content/content-01-office.webp", name: "The North Room", blurb: "Big window, quietest chair in the house.", price: "1 250 kr / night", amenities: ["North light", "Backwash", "Own basin"] },
    { src: "/showcase/content/content-02-team.webp", name: "The Corner Chair", blurb: "One chair, one stylist, all afternoon.", price: "950 kr / night", amenities: ["Street view", "Mirror wall", "Lockable drawer"] },
    { src: "/showcase/content/content-03-product.webp", name: "The Colour Lab", blurb: "Ventilated, tiled, unbothered by daylight.", price: "1 450 kr / night", amenities: ["Extraction", "Mix station", "Hot water"] },
    { src: "/showcase/content/content-04-architecture.webp", name: "The Rinse Suite", blurb: "Reclining backwash and absolutely no small talk.", price: "780 kr / night", amenities: ["Recliner", "Rain head", "Dim light"] },
  ],
  caption = "DRAG OR ARROWS · PRICES IN SEK · FINAL",
  tone = "paper",
  className,
}: EmblaRatesRailProps) {
  const ink = tone === "ink"
  const [emblaRef, embla] = useEmblaCarousel({ align: "start", axis: "x", containScroll: "keepSnaps" })
  const [active, setActive] = React.useState(0)
  const [canPrev, setCanPrev] = React.useState(false)
  const [canNext, setCanNext] = React.useState(false)

  const onSync = React.useCallback(() => {
    if (!embla) return
    setActive(embla.selectedScrollSnap())
    setCanPrev(embla.canScrollPrev())
    setCanNext(embla.canScrollNext())
  }, [embla])

  React.useEffect(() => {
    if (!embla) return
    onSync()
    embla.on("select", onSync)
    embla.on("reInit", onSync)
    return () => {
      embla.off("select", onSync)
      embla.off("reInit", onSync)
    }
  }, [embla, onSync])

  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
        <div className="mt-10">
          {/* counter + arrows */}
          <div className="flex items-center justify-between">
            <Ordinal n={active + 1} total={rates.length} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => embla?.scrollPrev()}
                disabled={!canPrev}
                aria-label="Previous rate"
                className="flex size-10 items-center justify-center rounded-full border bg-background transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M10 3 5 8l5 5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => embla?.scrollNext()}
                disabled={!canNext}
                aria-label="Next rate"
                className="flex size-10 items-center justify-center rounded-full border bg-background transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="m6 3 5 5-5 5" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {rates.map((rate, i) => (
                <div key={`${rate.name}-${i}`} className="min-w-0 shrink-0 grow-0 basis-[85%] px-2 sm:basis-[46%] lg:basis-[32%]">
                  <article className={cn("overflow-hidden rounded-[16px] border bg-card", ink ? "border-background/15" : "border-border")}>
                    <img src={rate.src} alt={rate.alt ?? rate.name} loading="lazy" draggable={false} className="aspect-[4/3] w-full object-cover" />
                    <div className="p-4 sm:p-5">
                      <h3 className="text-base font-semibold tracking-tight">{rate.name}</h3>
                      {rate.blurb && <p className="mt-1 text-sm leading-5 text-muted-foreground">{rate.blurb}</p>}
                      <p className="mt-3 font-mono text-sm font-bold tabular-nums">{rate.price}</p>
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {rate.amenities.map((amenity) => (
                          <li
                            key={amenity}
                            className={cn(
                              "rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
                              ink ? "border-background/15" : "border-border",
                            )}
                          >
                            {amenity}
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        className="mt-4 w-full rounded-full border bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Book
                      </button>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>

          <p
            className={cn(
              "mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
              ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
            )}
          >
            <span>{caption}</span>
            <span aria-hidden>●</span>
          </p>
        </div>
      </InView>
    </SectionShell>
  )
}
