import * as React from "react"
// embla-carousel-react v8 documents the default import — portable across builds
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         A booking flow that survives thumb-dragging.
// ═══ EMOTION     index cards on a rail — flip through, nothing falls off.
// ═══ SIGNATURE   Four form panels on one Embla rail; drag between steps and
//                 every field keeps its state because nothing unmounts.
//                 Prev never lies, Next becomes Finish, the readout counts.

export type WizardField = {
  id: string
  label: string
  placeholder: string
  type?: string
}

export type WizardStep = {
  id: string
  label: string
  title: string
  fields: WizardField[]
}

export type EmblaStepsWizardProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  steps?: WizardStep[]
  caption?: string
  onFinished?: (values: Record<string, string>) => void
  className?: string
}

const DEFAULT_STEPS: WizardStep[] = [
  {
    id: "who",
    label: "Who",
    title: "Who's coming in?",
    fields: [
      { id: "name", label: "Name", placeholder: "Vera Lindqvist" },
      { id: "phone", label: "Phone", placeholder: "070-123 45 67" },
    ],
  },
  {
    id: "what",
    label: "What",
    title: "What are we doing?",
    fields: [
      { id: "service", label: "Service", placeholder: "Cut & colour" },
      { id: "stylist", label: "Stylist", placeholder: "First available" },
    ],
  },
  {
    id: "when",
    label: "When",
    title: "Pick your moment.",
    fields: [
      { id: "date", label: "Date", placeholder: "Fri 18 Sep" },
      { id: "time", label: "Time", placeholder: "14:30" },
    ],
  },
  {
    id: "confirm",
    label: "Confirm",
    title: "Anything we should know?",
    fields: [
      { id: "email", label: "Email", placeholder: "vera@example.se", type: "email" },
      { id: "notes", label: "Notes", placeholder: "Sensitive scalp — gentle line, please" },
    ],
  },
]

export function EmblaStepsWizard({
  eyebrow = "QUIET TIMES STUDIO · BOOKING",
  title = "Four quick steps to a better chair.",
  subtitle = "Drag between steps or use the arrows — your answers stay put while you browse. No account, no phone tree.",
  steps = DEFAULT_STEPS,
  caption = "DRAG · SNAP · DONE IN 40 SECONDS",
  onFinished,
  className,
}: EmblaStepsWizardProps) {
  const [emblaRef, embla] = useEmblaCarousel({ align: "start", containScroll: "keepSnaps" })
  const [selected, setSelected] = React.useState(0)
  const [values, setValues] = React.useState<Record<string, string>>({})
  const [finished, setFinished] = React.useState(false)
  const last = steps.length - 1

  React.useEffect(() => {
    if (!embla) return
    const onSelect = () => setSelected(embla.selectedScrollSnap())
    embla.on("select", onSelect)
    return () => {
      embla.off("select", onSelect)
    }
  }, [embla])

  const advance = () => {
    if (selected === last) {
      setFinished(true)
      onFinished?.(values)
    } else {
      embla?.scrollNext()
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                <header className="mx-auto max-w-2xl text-center mx-auto">
          {eyebrow != null && (
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>
          )}
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">{title}</h2>
          {subtitle != null && (
            <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{subtitle}</p>
          )}
        </header>
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
        <div className="mx-auto mt-8 max-w-[520px]">
          <div className="overflow-hidden rounded-[16px] border border-border bg-card shadow-[0_24px_52px_-30px_hsl(var(--foreground)/0.45)]">
            {/* chrome header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">QUIET TIMES · BOKA</span>
              <span aria-live="polite" className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {finished ? "DONE · TACK!" : `STEP ${selected + 1} / ${steps.length}`}
              </span>
            </div>

            {/* steps rail — all panels stay mounted, so state survives drags */}
            <div className="overflow-hidden" ref={emblaRef} role="group" aria-roledescription="carousel" aria-label="Booking steps">
              <div className="flex touch-pan-y">
                {steps.map((step, si) => (
                  <div
                    key={step.id}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`Step ${si + 1} of ${steps.length}: ${step.title}`}
                    inert={si !== selected || undefined}
                    className="min-w-0 shrink-0 grow-0 basis-[100%] px-5 py-6 sm:px-6"
                  >
                    <h3 className="font-display text-lg font-bold tracking-tight text-foreground">{step.title}</h3>
                    <div className="mt-4 grid gap-4">
                      {step.fields.map((field) => {
                        const key = `${step.id}:${field.id}`
                        return (
                          <div key={field.id}>
                            <label
                              htmlFor={`wiz-${key}`}
                              className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground"
                            >
                              {field.label}
                            </label>
                            <input
                              id={`wiz-${key}`}
                              type={field.type ?? "text"}
                              value={values[key] ?? ""}
                              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                              placeholder={field.placeholder}
                              className="h-10 w-full rounded-md border border-border bg-background px-3 text-[13px] font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* footer: back · dots · next/finish */}
            <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3.5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => embla?.scrollPrev()}
                disabled={selected === 0}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronLeft className="size-3.5" aria-hidden />
                Back
              </Button>

              <div className="flex items-center gap-2">
                {steps.map((step, i) => (
                  <Button
                    key={step.id}
                    type="button"
                    aria-label={`Go to step ${i + 1}: ${step.title}`}
                    aria-current={i === selected ? "true" : undefined}
                    onClick={() => embla?.scrollTo(i)}
                    className={cn(
                      "size-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      i === selected ? "scale-110 bg-foreground" : "bg-muted-foreground/35 hover:bg-muted-foreground/60",
                    )}
                   />
                ))}
              </div>

              {finished ? (
                <span className="inline-flex h-9 items-center rounded-full bg-foreground px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-background">
                  Bokat ✓
                </span>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={advance}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-background transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {selected === last ? "Finish" : "Next"}
                  <ChevronRight className="size-3.5" aria-hidden />
                </Button>
              )}
            </div>
          </div>

          {caption && (
            <p className="mt-5 flex items-center justify-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              <span aria-hidden>●</span>
              <span>{caption}</span>
            </p>
          )}
        </div>
      </InView>
    </div>
  )
}
