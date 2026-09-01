import * as React from "react"
// embla-carousel-react v8 documents the default import — portable across builds
import useEmblaCarousel from "embla-carousel-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"


// ═══ JOB         Pick a booking time the way your thumb expects.
// ═══ EMOTION     Muscle memory — the iPhone wheel, on the web.
// ═══ SIGNATURE   Two Embla wheels on the y-axis with loop: hours and
//                 minutes roll under a fixed selection window; the focused
//                 value is full ink, the rest fade with distance. Snap and
//                 it is chosen — no dropdown, no typing.

export type EmblaTimePickerProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  hours?: number[]
  minutes?: number[]
  initial?: { hour: number; minute: number }
  onConfirm?: (t: { hour: number; minute: number }) => void
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

function Wheel({
  values,
  value,
  onChange,
  format,
  ariaLabel,
}: {
  values: number[]
  value: number
  onChange: (v: number) => void
  format?: (v: number) => string
  ariaLabel: string
}) {
  const [emblaRef, embla] = useEmblaCarousel({ axis: "y", loop: true, align: "center", containScroll: false })
  const fmt = format ?? ((v: number) => String(v).padStart(2, "0"))

  React.useEffect(() => {
    if (!embla) return
    const idx = values.indexOf(value)
    if (idx >= 0) embla.scrollTo(idx, true)
    const onSelect = () => onChange(values[embla.selectedScrollSnap()])
    embla.on("select", onSelect)
    return () => {
      embla.off("select", onSelect)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embla])

  return (
    <div className="relative h-[132px] w-[92px] overflow-hidden" role="listbox" aria-label={ariaLabel}>
      <div className="h-full" ref={emblaRef}>
        <div className="flex h-full flex-col touch-pan-y">
          {values.map((v) => (
            <div key={v} className="flex shrink-0 grow-0 basis-[44px] items-center justify-center">
              <span
                className={cn(
                  "font-display text-[22px] font-black tabular-nums transition-colors",
                  v === value ? "text-foreground" : "text-muted-foreground/40",
                )}
              >
                {fmt(v)}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* selection window */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-11 -translate-y-1/2 rounded-lg border border-primary/50 bg-primary/[0.04]" />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(to_bottom,var(--card),transparent)]" />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,var(--card),transparent)]" />
    </div>
  )
}

export function EmblaTimePicker({
  eyebrow = "EMBLA · TIME PICKER",
  title = "Wheel the appointment in.",
  subtitle = "Two y-axis wheels with true loop — hours and minutes roll under the selection window the way native pickers do. Snap to choose; the button books.",
  hours = Array.from({ length: 24 }, (_, i) => i),
  minutes = [0, 15, 30, 45],
  initial = { hour: 14, minute: 30 },
  onConfirm,
  caption = "Y-AXIS · LOOP · SNAP",
  tone = "paper",
  className,
}: EmblaTimePickerProps) {
  const ink = tone === "ink"
  const [{ hour, minute }, setT] = React.useState(initial)

  return (
    <SectionShell tone={tone} width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
        <figure className="mt-10">
          <div className="mx-auto max-w-[380px]">
            <div className={cn("rounded-[18px] border bg-card p-6 shadow-[0_24px_52px_-30px_hsl(var(--foreground)/0.45)]", ink ? "border-background/15" : "border-border")}>
              <div className="flex items-center justify-center gap-1">
                <Wheel values={hours} value={hour} onChange={(h) => setT((t) => ({ ...t, hour: h }))} ariaLabel="Hours" />
                <span aria-hidden className="font-display text-[22px] font-black text-muted-foreground/50">:</span>
                <Wheel values={minutes} value={minute} onChange={(m) => setT((t) => ({ ...t, minute: m }))} ariaLabel="Minutes" />
              </div>
              <Button
                type="button"
                onClick={() => onConfirm?.({ hour, minute })}
                className="mt-6 h-11 w-full rounded-full text-[11px] font-black uppercase tracking-[0.14em] transition-transform hover:-translate-y-0.5"
              >
                Book {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}
              </Button>
            </div>
          </div>

          {caption && (
            <figcaption
              className={cn(
                "mx-auto mt-8 flex max-w-[380px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
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
