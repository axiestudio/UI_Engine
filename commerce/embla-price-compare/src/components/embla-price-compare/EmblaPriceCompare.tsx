import * as React from "react"
// embla-carousel-react v8 documents the default import — portable across builds
import useEmblaCarousel from "embla-carousel-react"
import { motion } from "motion/react"
import { Check } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Make the honest price the loudest thing on the street.
// ═══ EMOTION     Window-shopping a row of salons — the middle one glows.
// ═══ SIGNATURE   Four cards on a center-snap rail; the selected card leans
//                 in (scale 1.04, ring, full ink) while the neighbours step
//                 back (0.94, half ink). Drag or tap — the caption names it.

export type PriceOffer = {
  id: string
  name: string
  price: string
  features: string[]
  cta: string
  us?: boolean
}

export type EmblaPriceCompareProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  offers?: PriceOffer[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_OFFERS: PriceOffer[] = [
  { id: "nord", name: "Salong Nord", price: "329 kr", features: ["Cut & blow-dry", "Walk-in queue"], cta: "Visit site" },
  { id: "klippo", name: "Klippoteket", price: "389 kr", features: ["Cut & colour", "Product upsell"], cta: "Visit site" },
  { id: "studio", name: "Studio Frisör", price: "299 kr", features: ["Cut only", "No colour bar"], cta: "Visit site" },
  { id: "us", name: "Quiet Times Studio", price: "249 kr", features: ["Cut, colour & care", "Chair-side lunch incl."], cta: "Book intro", us: true },
]

export function EmblaPriceCompare({
  eyebrow = "QUIET TIMES STUDIO · PRICE CHECK",
  title = "One price, three excuses.",
  subtitle = "A full cut, colour and care in Jönköping — what the street charges, what we charge, and what lands in your lap either way. Drag or tap a card.",
  offers = DEFAULT_OFFERS,
  caption = "PRICES SEPT · CUT + COLOUR · JÖNKÖPING",
  tone = "paper",
  className,
}: EmblaPriceCompareProps) {
  const ink = tone === "ink"
  const reducedMotion = React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )
  const [emblaRef, embla] = useEmblaCarousel({ align: "center", loop: false, containScroll: "keepSnaps" })
  const [selected, setSelected] = React.useState(0)

  React.useEffect(() => {
    if (!embla) return
    const onSelect = () => setSelected(embla.selectedScrollSnap())
    embla.on("select", onSelect)
    return () => {
      embla.off("select", onSelect)
    }
  }, [embla])

  const current = offers[selected]

  return (
    <SectionShell tone={tone} width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
        <figure className="mt-10">
          <div className="overflow-hidden py-2" ref={emblaRef} role="group" aria-roledescription="carousel" aria-label="Price comparison">
            <div className="-ml-4 flex touch-pan-y">
              {offers.map((offer, i) => {
                const active = i === selected
                const us = offer.us
                return (
                  <div key={offer.id} className="min-w-0 shrink-0 grow-0 basis-[84%] pl-4 sm:basis-[58%]">
                    <motion.button
                      type="button"
                      initial={false}
                      animate={{
                        scale: active || reducedMotion ? 1.04 : 0.94,
                        opacity: active ? 1 : 0.5,
                      }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => embla?.scrollTo(i)}
                      aria-label={`Compare ${offer.name}, ${offer.price}`}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "flex h-full w-full flex-col rounded-[18px] border p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-7",
                        us ? "border-transparent bg-foreground text-background" : "border-border bg-card text-foreground",
                        active && "ring-2 ring-primary",
                      )}
                    >
                      <header className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-lg font-bold tracking-tight">{offer.name}</h3>
                        {us && (
                          <span className="rounded-full bg-background/15 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em]">
                            Us
                          </span>
                        )}
                      </header>
                      <p className="mt-4 flex items-baseline gap-1.5">
                        <span className="font-display text-[34px] font-bold leading-none tabular-nums">{offer.price}</span>
                        <span className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.16em]", us ? "text-background/60" : "text-muted-foreground")}>
                          / cut
                        </span>
                      </p>
                      <ul className="mb-5 mt-5 space-y-2.5">
                        {offer.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-[13px] font-medium">
                            <Check className={cn("size-3.5 shrink-0", us ? "text-background" : "text-primary")} aria-hidden />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <span
                        aria-hidden
                        className={cn(
                          "mt-auto inline-flex h-9 items-center justify-center rounded-full border text-[11px] font-bold uppercase tracking-[0.14em]",
                          us
                            ? "border-background/40 text-background"
                            : "border-border text-foreground",
                        )}
                      >
                        {offer.cta}
                      </span>
                    </motion.button>
                  </div>
                )
              })}
            </div>
          </div>

          {caption && (
            <figcaption
              className={cn(
                "mt-8 flex items-center justify-between gap-4 border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
                ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
              )}
            >
              <span aria-live="polite">
                Selected · {current?.name} · {current?.price}
              </span>
              <span className="opacity-60">{caption}</span>
              <span aria-hidden>●</span>
            </figcaption>
          )}
        </figure>
      </InView>
    </SectionShell>
  )
}
