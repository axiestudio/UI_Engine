import * as React from "react"
// embla-carousel-react v8 documents the default import — portable across builds
import useEmblaCarousel from "embla-carousel-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"

// ═══ JOB         Answer "when can I get in?" without a phone call.
// ═══ EMOTION     Checking the week on the fridge calendar.
// ═══ SIGNATURE   Seven day pills on a draggable rail over one honest ledger —
//                 pick a day (or drag to it) and that day's bookings swap in
//                 with a small, unhurried fade. Time, client, chair. Nothing else.

export type DayBooking = { time: string; client: string; chair: string }

export type EmblaDayTimelineProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  days?: { label: string; date: number }[]
  /** Bookings keyed by day label. */
  bookings?: Record<string, DayBooking[]>
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

const WEEK: { label: string; date: number }[] = [
  { label: "Mon", date: 14 },
  { label: "Tue", date: 15 },
  { label: "Wed", date: 16 },
  { label: "Thu", date: 17 },
  { label: "Fri", date: 18 },
  { label: "Sat", date: 19 },
  { label: "Sun", date: 20 },
]

const LEDGER: Record<string, DayBooking[]> = {
  Mon: [
    { time: "09:00", client: "A. Lindqvist", chair: "Chair 1" },
    { time: "11:30", client: "M. Berg", chair: "Chair 2" },
    { time: "15:00", client: "T. Nguyen", chair: "Chair 1" },
  ],
  Tue: [
    { time: "08:30", client: "J. Ek", chair: "Chair 2" },
    { time: "12:00", client: "S. Okafor", chair: "Chair 1" },
    { time: "16:30", client: "L. Sandberg", chair: "Chair 2" },
  ],
  Wed: [
    { time: "09:30", client: "P. Johansson", chair: "Chair 1" },
    { time: "13:00", client: "R. Ali", chair: "Chair 3" },
    { time: "17:00", client: "K. Lund", chair: "Chair 1" },
  ],
  Thu: [
    { time: "10:00", client: "E. Persson", chair: "Chair 2" },
    { time: "14:15", client: "N. Holm", chair: "Chair 1" },
    { time: "18:00", client: "D. Aliyev", chair: "Chair 3" },
  ],
  Fri: [
    { time: "09:00", client: "F. Karlsson", chair: "Chair 1" },
    { time: "11:45", client: "V. Månsson", chair: "Chair 2" },
    { time: "15:30", client: "H. Abebe", chair: "Chair 1" },
  ],
  Sat: [
    { time: "10:30", client: "B. Erixon", chair: "Chair 2" },
    { time: "13:30", client: "G. Falk", chair: "Chair 1" },
    { time: "16:00", client: "O. Rehn", chair: "Chair 3" },
  ],
  Sun: [
    { time: "11:00", client: "C. Wide", chair: "Chair 1" },
    { time: "13:45", client: "I. Dahl", chair: "Chair 2" },
    { time: "15:15", client: "U. Sten", chair: "Chair 1" },
  ],
}

export function EmblaDayTimeline({
  eyebrow = "EMBLA · DAY TIMELINE",
  title = "The week, as it actually looks.",
  subtitle = "Seven days on a draggable rail, one chair ledger underneath. If a day shows three bookings, that's all there is — we don't double-book.",
  days = WEEK,
  bookings = LEDGER,
  caption = "DRAG THE WEEK · CLICK A DAY · CHAIR LEDGER BELOW",
  tone = "paper",
  className,
}: EmblaDayTimelineProps) {
  const ink = tone === "ink"
  const [emblaRef, embla] = useEmblaCarousel({ loop: false, align: "start", axis: "x", dragFree: true, containScroll: "keepSnaps" })
  const [active, setActive] = React.useState(0)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  React.useEffect(() => {
    if (!embla) return
    const onSelect = () => setActive(embla.selectedScrollSnap())
    onSelect()
    embla.on("select", onSelect)
    embla.on("reInit", onSelect)
    return () => {
      embla.off("select", onSelect)
      embla.off("reInit", onSelect)
    }
  }, [embla])

  const day = days[Math.min(active, days.length - 1)]
  const ledger = (day && bookings[day.label]) ?? []

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
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {days.map((d, i) => {
                const selected = i === active
                return (
                  <div key={d.label} className="min-w-0 shrink-0 grow-0 basis-1/3 px-1.5 sm:basis-1/4 lg:basis-[calc(100%/7)]">
                    <Button type='button' onClick={() => {
                        setActive(i)
                        embla?.scrollTo(i)
                      }} aria-pressed={selected} aria-label={`${d.label} ${d.date}`} className={cn(
                        "flex w-full flex-col items-center gap-0.5 rounded-[16px] border px-3 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : cn(ink ? "border-background/15 text-muted-foreground hover:border-background/30 hover:bg-background/5 hover:text-background" : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted hover:text-foreground"),
                      )} variant="default">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] opacity-70">{d.label}</span>
                      <span className="text-lg font-semibold tabular-nums">{d.date}</span>
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>

          <motion.div
            key={day ? day.label : active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
            className={cn("mt-4 rounded-[16px] border bg-card p-5", ink ? "border-background/15" : "border-border")}
          >
            <div className="flex items-center justify-between">
              <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", cn(ink && "text-background/60"))}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />
                {day ? `${day.label} ${day.date}` : "—"}
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {ledger.length} {ledger.length === 1 ? "booking" : "bookings"}
              </span>
            </div>
            <ul className="mt-2 divide-y divide-border">
              {ledger.map((b) => (
                <li key={`${b.time}-${b.client}`} className="flex items-center gap-4 py-3 first:pt-1 last:pb-0">
                  <span className="w-12 shrink-0 font-mono text-xs font-bold tabular-nums text-muted-foreground">{b.time}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{b.client}</span>
                  <span className="shrink-0 rounded-full border border-border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {b.chair}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

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
