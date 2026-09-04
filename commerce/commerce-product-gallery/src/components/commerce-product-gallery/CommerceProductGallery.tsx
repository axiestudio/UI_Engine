import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Product gallery — a draggable main frame with thumbs.
// ═══ EMOTION     Inspect before you buy.
// ═══ SIGNATURE   An Embla-powered rail — drag, snap and loop mechanics belong
//                 to the library; thumbs, counter and the product story stay ours.

export type GalleryFrame = { id: string; src?: string; alt?: string }

const DEFAULT_FRAMES: GalleryFrame[] = [
  { id: "front", src: "/frames/frame_0002.webp", alt: "Oak desk lamp — front" },
  { id: "side", src: "/frames/frame_0005.webp", alt: "Oak desk lamp — side profile" },
  { id: "detail", src: "/frames/frame_0009.webp", alt: "Oak desk lamp — brass joint detail" },
  { id: "room", src: "/frames/frame_0011.webp", alt: "Oak desk lamp — in the skylight room" },
]

export type CommerceProductGalleryProps = {
  eyebrow?: string
  name?: string
  price?: string
  frames: GalleryFrame[]
  className?: string
}

export function CommerceProductGallery({ eyebrow = "PRODUCT", name = "Product gallery", price = "€890", frames = DEFAULT_FRAMES, className }: CommerceProductGalleryProps) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true })
  const [selected, setSelected] = React.useState(0)

  React.useEffect(() => {
    if (!embla) return
    const onSelect = () => setSelected(embla.selectedScrollSnap())
    embla.on("select", onSelect)
    onSelect()
    return () => {
      embla.off("select", onSelect)
    }
  }, [embla])

  return (
    <SectionShell width={1120} grain rule="bottom" className={cn("min-h-[400px]", className)}>
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <InView once variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div>
            <div
              className="relative cursor-grab overflow-hidden rounded-2xl border bg-muted active:cursor-grabbing"
              ref={emblaRef}
              role="group"
              aria-roledescription="carousel"
              aria-label={`${name} gallery`}
            >
              <div className="flex touch-pan-y">
                {frames.map((f, i) => (
                  <div
                    key={f.id}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${f.alt ?? `Frame ${i + 1}`}, ${i + 1} of ${frames.length}`}
                    className="relative aspect-[4/3] min-w-0 shrink-0 grow-0 basis-[100%]"
                  >
                    {f.src ? (
                      <img src={f.src} alt={f.alt ?? ""} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-secondary to-muted" />
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                aria-label="Previous image"
                onClick={() => embla?.scrollPrev()}
                className="absolute left-3 top-1/2 z-10 size-9 -translate-y-1/2 rounded-full bg-popover text-foreground hover:bg-popover/90"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                aria-label="Next image"
                onClick={() => embla?.scrollNext()}
                className="absolute right-3 top-1/2 z-10 size-9 -translate-y-1/2 rounded-full bg-popover text-foreground hover:bg-popover/90"
              >
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {frames.map((f, i) => (
                <Button key={f.id} type="button" variant="ghost" size="sm" onClick={() => embla?.scrollTo(i)} aria-label={f.alt ?? `Frame ${i + 1}`} aria-current={i === selected ? "true" : undefined}
                  className={cn("img-hover-wash h-16 w-20 overflow-hidden rounded-lg border p-0 transition-all", i === selected ? "ring-2 ring-foreground" : "opacity-70 hover:opacity-100")}>
                  {f.src ? <img src={f.src} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
                </Button>
              ))}
              <span aria-live="polite" className="ml-auto font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground tabular-nums">
                {selected + 1} / {frames.length}
              </span>
            </div>
          </div>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em]">{name}</h2>
            <p className="mt-2 font-display text-2xl font-semibold">{price}</p>
            <p className="mt-4 text-sm font-medium leading-relaxed text-muted-foreground">Solid oak, hand-finished. Ships in three frames so you can look at it from every side before it ships.</p>
            <div className="mt-6 flex gap-3">
              <Button size="lg" className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">Add to bag</Button>
              <Button size="lg" variant="outline" className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">Details</Button>
            </div>
            <dl className="mt-8 space-y-2 border-t pt-4 text-sm">
              {[["Material", "Solid oak"], ["Finish", "Natural oil"], ["Lead time", "2–3 weeks"]].map(([k, v]) => (
                <div key={k} className="flex justify-between"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
          </div>
        </InView>
      </div>
    </SectionShell>
  )
}
