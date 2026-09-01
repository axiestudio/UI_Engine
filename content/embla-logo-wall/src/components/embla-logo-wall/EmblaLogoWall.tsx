import * as React from "react"
// embla-carousel-react v8 documents the default import — portable across builds
import useEmblaCarousel from "embla-carousel-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB         Borrow trust without buying a billboard.
// ═══ EMOTION     A quiet wall of names behind the reception desk.
// ═══ SIGNATURE   An infinite, drag-free loop of wordmarks — grey until you
//                 greet one with the pointer. It drifts one step every few
//                 seconds unless you're holding it or motion is reduced.

export type EmblaLogoWallProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  /** Wordmarks; the row is doubled internally so the loop never shows a seam. */
  logos?: string[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function EmblaLogoWall({
  eyebrow = "EMBLA · LOGO WALL",
  title = "Quiet company.",
  subtitle = "A few of the names that send people up our stairs — plus the brands whose pop-ups we keep saying yes to.",
  logos = ["AURUM", "NORTHLINE", "KLOCKAN", "VESPER", "HABESHA", "TID & RUM"],
  caption = "DRAG · INFINITE LOOP · GREY UNTIL GREETED",
  tone = "paper",
  className,
}: EmblaLogoWallProps) {
  const ink = tone === "ink"
  const slides = React.useMemo(() => [...logos, ...logos], [logos])
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "center", axis: "x", dragFree: true, containScroll: "keepSnaps" })
  const [hovering, setHovering] = React.useState(false)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  React.useEffect(() => {
    if (!embla || reduce || hovering) return
    const id = window.setInterval(() => embla.scrollNext(), 3000)
    return () => window.clearInterval(id)
  }, [embla, reduce, hovering])

  return (
    <SectionShell tone={tone} width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
        <div className="mt-10">
          <MonoLabel className={cn(ink && "text-background/60")}>Trusted by</MonoLabel>

          <div
            className="relative mt-4"
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={() => setHovering(false)}
          >
            <span aria-hidden className={cn("pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-background to-transparent sm:w-20", ink && "from-foreground")} />
            <span aria-hidden className={cn("pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-background to-transparent sm:w-20", ink && "from-foreground")} />

            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex touch-pan-y items-center">
                {slides.map((logo, i) => (
                  <div key={`${logo}-${i}`} className="flex min-w-0 shrink-0 grow-0 basis-1/2 items-center justify-center sm:basis-1/3 lg:basis-1/6">
                    <span
                      draggable={false}
                      className={cn(
                        "select-none px-8 font-display text-xl font-black tracking-tight transition-colors duration-300 sm:text-2xl",
                        "text-muted-foreground/40 hover:text-foreground",
                        ink && "hover:text-background",
                      )}
                    >
                      {logo}
                    </span>
                  </div>
                ))}
              </div>
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
