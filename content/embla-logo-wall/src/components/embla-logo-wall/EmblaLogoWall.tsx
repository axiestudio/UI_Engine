import * as React from "react"
// embla-carousel-react v8 documents the default import — portable across builds
import useEmblaCarousel from "embla-carousel-react"
import { cn } from "@/lib/utils"

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
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
        <div className="mt-10">
          <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", cn(ink && "text-background/60"))}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />Trusted by</span>

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
    
  </div>
</section>
  )
}
