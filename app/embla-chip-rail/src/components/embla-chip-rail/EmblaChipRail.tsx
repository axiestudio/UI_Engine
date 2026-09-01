import * as React from "react"
// embla-carousel-react v8 documents the default import — portable across builds
import useEmblaCarousel from "embla-carousel-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"


// ═══ JOB         Long filter lists that never wrap into soup.
// ═══ EMOTION     A rail of tags you can flick through like a card index.
// ═══ SIGNATURE   Variable-width chips on a drag-free snap rail — the rail
//                 only scrolls when you flick, the selected chip pulls
//                 itself into view, and the readout names the active set.

export type EmblaChipRailProps = {
  label?: string
  chips?: string[]
  onChange?: (selected: string[]) => void
  /** Show the mono readout of the current selection. */
  readout?: boolean
  className?: string
}

export function EmblaChipRail({
  label = "Services",
  chips = ["Cut & style", "Colour bar", "Keratin", "Beard trim", "School bookings", "Bridal updo", "Perm wave", "Scalp ritual", "Blow-dry express", "Grey blend"],
  onChange,
  readout = true,
  className,
}: EmblaChipRailProps) {
  const [emblaRef, embla] = useEmblaCarousel({ dragFree: true, containScroll: "keepSnaps" })
  const [selected, setSelected] = React.useState<string[]>([])

  const toggle = (chip: string) => {
    setSelected((cur) => {
      const next = cur.includes(chip) ? cur.filter((x) => x !== chip) : [...cur, chip]
      onChange?.(next)
      return next
    })
  }

  // keep the latest selection visible on the rail
  React.useEffect(() => {
    const el = document.querySelector(`[data-chip="${CSS.escape(selected[selected.length - 1] ?? "")}"]`)
    if (selected.length && el && embla) {
      const slides = Array.from(embla.containerNode().querySelectorAll("[data-chip]"))
      const idx = slides.indexOf(el)
      if (idx >= 0) embla.scrollTo(idx, true)
    }
  }, [selected, embla])

  return (
    <div className={cn("w-full", className)}>
      <InView once variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">{label}</span>
          {readout && (
            <span aria-live="polite" className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {selected.length ? selected.join(" · ") : "everything"}
            </span>
          )}
        </div>
        <div className="relative mt-3">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-2 py-1 touch-pan-y">
              {chips.map((chip) => {
                const on = selected.includes(chip)
                return (
                  <Button
                    key={chip}
                    type="button"
                    data-chip={chip}
                    role="switch"
                    aria-checked={on}
                    onClick={() => toggle(chip)}
                    className={cn(
                      "h-9 shrink-0 grow-0 whitespace-nowrap rounded-full border px-4 font-mono text-[11px] font-bold uppercase tracking-[0.1em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      on
                        ? "border-foreground bg-foreground text-background shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground",
                    )}
                  >
                    {chip}
                  </Button>
                )
              })}
            </div>
          </div>
          {/* edge fades — the rail continues */}
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-[linear-gradient(to_right,var(--background),transparent)]" />
          <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-[linear-gradient(to_left,var(--background),transparent)]" />
        </div>
      </InView>
    </div>
  )
}
