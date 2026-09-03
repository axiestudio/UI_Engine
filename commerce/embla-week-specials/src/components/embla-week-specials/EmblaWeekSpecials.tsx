import * as React from "react"
// embla-carousel-react v8 documents the default import — portable across builds
import useEmblaCarousel from "embla-carousel-react"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel, Ordinal, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Sell the weekday lunch without a single photo.
// ═══ EMOTION     The chalk board at the counter — five days, five deals.
// ═══ SIGNATURE   Typographic deal cards on a center-snapping rail; the day
//                 you land on owns the frame and the dots keep the week.
//                 No autoplay, no imagery — the user does the driving.

export type WeekSpecial = {
  id: string
  day: string
  dayLabel: string
  dish: string
  description: string
  price: string
  tag: string
}

export type EmblaWeekSpecialsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  specials?: WeekSpecial[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_SPECIALS: WeekSpecial[] = [
  {
    id: "mon",
    day: "Monday",
    dayLabel: "MÅNDAG",
    dish: "Toast Skagen",
    description: "Toasted rye, hand-peeled shrimp, dill-lemon cream. Eaten foils in, fork steady.",
    price: "149 kr",
    tag: "Chair-side lunch",
  },
  {
    id: "tue",
    day: "Tuesday",
    dayLabel: "TISDAG",
    dish: "Ärtsoppa & Pannkakor",
    description: "Yellow pea soup with thyme, and a thin sweet pancake after. Old Jönköping Tuesdays.",
    price: "119 kr",
    tag: "Stylist's pick",
  },
  {
    id: "wed",
    day: "Wednesday",
    dayLabel: "ONSDAG",
    dish: "Gravad Lax Plate",
    description: "Two-day cured salmon, mustard-dill sauce, new potatoes. Slow food for fast colour.",
    price: "139 kr",
    tag: "With any cut",
  },
  {
    id: "thu",
    day: "Thursday",
    dayLabel: "TORSDAG",
    dish: "Köttbullar & Pressgurka",
    description: "Cream sauce, lingonberry, pressed cucumber, rye crisp. The chair-side favourite.",
    price: "135 kr",
    tag: "Chair-side lunch",
  },
  {
    id: "fri",
    day: "Friday",
    dayLabel: "FREDAG",
    dish: "Västerbotten Pie",
    description: "Cheese pie with red onion and chives, baked in-house every Friday. Gone by 13:00.",
    price: "165 kr",
    tag: "Walk-in only",
  },
]

export function EmblaWeekSpecials({
  eyebrow = "QUIET TIMES STUDIO · WEEKLY SPECIALS",
  title = "The chair-side lunch board.",
  subtitle = "Five weekday deals served at your chair between cuts — no queue, no phone tree, first floor in Jönköping. Drag the rail; the week stays put.",
  specials = DEFAULT_SPECIALS,
  caption = "MÅN–FRE · 11:30–14:00 · WALK INS WELCOME",
  tone = "paper",
  className,
}: EmblaWeekSpecialsProps) {
  const ink = tone === "ink"
  const [emblaRef, embla] = useEmblaCarousel({ align: "center", containScroll: "keepSnaps" })
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
          <div className="overflow-hidden" ref={emblaRef} role="group" aria-roledescription="carousel" aria-label="Weekday specials">
            <div className="-ml-4 flex touch-pan-y">
              {specials.map((special, i) => (
                <div
                  key={special.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${special.day}: ${special.dish}, ${i + 1} of ${specials.length}`}
                  className={cn(
                    "min-w-0 shrink-0 grow-0 basis-[86%] pl-4 transition-opacity duration-500 sm:basis-[68%]",
                    i === selected ? "opacity-100" : "opacity-50",
                  )}
                >
                  <article className={cn("flex h-full flex-col rounded-[18px] border bg-card p-6 sm:p-8", ink ? "border-background/15" : "border-border")}>
                    <header className="flex items-center justify-between gap-4">
                      <MonoLabel>{special.dayLabel}</MonoLabel>
                      <Ordinal n={i + 1} total={specials.length} />
                    </header>
                    <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">{special.dish}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{special.description}</p>
                    <footer className={cn("mt-6 flex items-center justify-between gap-3 border-t pt-4", ink ? "border-background/15" : "border-border")}>
                      <span className="font-display text-2xl font-bold tabular-nums text-foreground">{special.price}</span>
                      <span className="rounded-full border border-border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        {special.tag}
                      </span>
                    </footer>
                  </article>
                </div>
              ))}
            </div>
          </div>

          {/* dot buttons — user drives, nothing auto-highlights */}
          <div className="mt-7 flex items-center justify-center gap-2.5">
            {specials.map((special, i) => (
              <Button
                key={special.id}
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label={`${special.day} special`}
                aria-current={i === selected ? "true" : undefined}
                onClick={() => embla?.scrollTo(i)}
                className={cn(
                  "!size-2 rounded-full p-0",
                  i === selected
                    ? ink
                      ? "scale-110 bg-background"
                      : "scale-110 bg-foreground"
                    : ink
                      ? "bg-background/25 hover:bg-background/45"
                      : "bg-muted-foreground/35 hover:bg-muted-foreground/60",
                )}
              />
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
              <span aria-hidden>●</span>
            </figcaption>
          )}
        </figure>
      </InView>
    </SectionShell>
  )
}
