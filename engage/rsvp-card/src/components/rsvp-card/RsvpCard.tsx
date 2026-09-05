import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { CalendarDays, Check, MapPin, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

type Attending = "yes" | "no"
type Meal = "Everything" | "Veg" | "GF"

const MEALS: Meal[] = ["Everything", "Veg", "GF"]

export type RsvpCardProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  eventName?: string
  eventDate?: string
  eventPlace?: string
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function RsvpCard({
  eyebrow = "Quiet Times Studio · RSVP",
  title = "Will we hold your chair?",
  subtitle = "The board session closes the month — seats, colour stock and the winter school plan. Answer once and we pencil you in.",
  eventName = "The Board Session",
  eventDate = "Sep 24 · 18:00",
  eventPlace = "Bråvalla gata 9 · Jönköping",
  caption = "RSVP · SEAT HELD FOR 24 H",
  tone = "paper",
  className,
}: RsvpCardProps) {
  const ink = tone === "ink"
  const reduce = React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  )
  const [attending, setAttending] = React.useState<Attending>("yes")
  const [plusOne, setPlusOne] = React.useState(0)
  const [meal, setMeal] = React.useState<Meal>("Veg")
  const [confirmed, setConfirmed] = React.useState(false)

  const choose = (a: Attending) => {
    setAttending(a)
    setConfirmed(false)
  }
  const bumpPlusOne = (d: number) => {
    setPlusOne((n) => Math.min(2, Math.max(0, n + d)))
    setConfirmed(false)
  }
  const pickMeal = (m: Meal) => {
    setMeal(m)
    setConfirmed(false)
  }

  const collapse = {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { duration: reduce ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] as const },
  }

  return (
    <SectionShell tone={tone} width={760} rule="bottom" className={className}>
      <InView
        once
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.12 }}
      >
        <div className="mt-10">
          <div
            className={cn(
              "mx-auto w-full max-w-[460px] overflow-hidden rounded-[16px] border bg-card shadow-[0_24px_52px_-30px_hsl(var(--foreground)/0.45)]",
              ink ? "border-background/15" : "border-border"
            )}
          >
            <div className={cn("relative isolate overflow-hidden flex items-center justify-between gap-4 px-6 py-5", ink ? "border-b border-background/15" : "border-b border-border")}>
              <div className="flex items-center gap-3.5">
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted", ink ? "border-background/15" : "border-border")}>
                  <CalendarDays className="size-[18px]" aria-hidden />
                </span>
                <div>
                  <p className="font-display text-[15px] font-bold leading-tight">{eventName}</p>
                  <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{eventDate}</p>
                </div>
              </div>
              <p className="hidden items-center gap-1 text-[11px] font-medium text-muted-foreground sm:flex">
                <MapPin className="size-3.5" aria-hidden />
                {eventPlace}
              </p>
            </div>

            <div className="px-6 pb-5 pt-5">
              <MonoLabel className="text-muted-foreground">Attending?</MonoLabel>
              <RadioGroup
                value={attending ?? ""}
                onValueChange={(v) => choose(v as "yes" | "no")}
                aria-label="Will you attend?"
                className="mt-3 grid grid-cols-2 gap-2.5 [&_[data-slot=radio-group-indicator]]:hidden"
              >
                <RadioGroupItem
                  value="yes"
                  className="aspect-auto flex h-auto w-full flex-col items-start rounded-xl border px-4 py-3.5 text-left shadow-none transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary/[0.06] data-[state=unchecked]:border-border hover:border-foreground/30 hover:bg-muted/40"
                >
                  <span className="block font-display text-[14px] font-bold">Joyfully yes</span>
                  <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">Hold a chair for me</span>
                </RadioGroupItem>
                <RadioGroupItem
                  value="no"
                  className="aspect-auto flex h-auto w-full flex-col items-start rounded-xl border px-4 py-3.5 text-left shadow-none transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary/[0.06] data-[state=unchecked]:border-border hover:border-foreground/30 hover:bg-muted/40"
                >
                  <span className="block font-display text-[14px] font-bold">Regretfully no</span>
                  <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">Release my seat</span>
                </RadioGroupItem>
              </RadioGroup>
            </div>

            <AnimatePresence initial={false} mode="wait">
              {attending === "yes" ? (
                <motion.div key="yes" className="overflow-hidden" {...collapse}>
                  <div className="space-y-2.5 px-6 pb-5">
                    <div className={cn("flex items-center justify-between rounded-xl border px-4 py-3", ink ? "border-background/15" : "border-border")}>
                      <div>
                        <p className="font-display text-[13px] font-bold">Bring a plus-one</p>
                        <p className="text-[11px] font-medium text-muted-foreground">Up to two chairs can be held</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          aria-label="Remove plus-one"
                          disabled={plusOne === 0}
                          onClick={() => bumpPlusOne(-1)}
                          className={cn(
                            "size-11 rounded-full bg-background p-0 hover:bg-muted disabled:pointer-events-none disabled:opacity-40",
                            ink ? "border-background/15" : "border-border",
                          )}
                        >
                          <Minus className="size-3.5" aria-hidden />
                        </Button>
                        <span aria-live="polite" className="w-6 text-center font-mono text-[13px] font-bold tabular-nums">
                          {plusOne}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          aria-label="Add plus-one"
                          disabled={plusOne === 2}
                          onClick={() => bumpPlusOne(1)}
                          className={cn(
                            "size-11 rounded-full bg-background p-0 hover:bg-muted disabled:pointer-events-none disabled:opacity-40",
                            ink ? "border-background/15" : "border-border",
                          )}
                        >
                          <Plus className="size-3.5" aria-hidden />
                        </Button>
                      </div>
                    </div>

                    <div className={cn("flex items-center justify-between gap-3 rounded-xl border px-4 py-3", ink ? "border-background/15" : "border-border")}>
                      <p className="font-display text-[13px] font-bold">Meal</p>
                      <RadioGroup
                        value={meal}
                        onValueChange={(v) => pickMeal(v as Meal)}
                        aria-label="Meal preference"
                        className="flex gap-1.5 [&_[data-slot=radio-group-indicator]]:hidden"
                      >
                        {MEALS.map((m) => (
                          <RadioGroupItem
                            key={m}
                            value={m}
                            className="aspect-auto h-auto w-auto rounded-full border px-3 py-1 text-[11px] font-bold shadow-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=unchecked]:border-border data-[state=unchecked]:text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                          >
                            {m}
                          </RadioGroupItem>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="no" className="overflow-hidden" {...collapse}>
                  <p className={cn("mx-6 mb-5 rounded-lg bg-muted px-4 py-3 text-[12px] font-medium leading-relaxed text-muted-foreground")}>
                    <span className="font-bold text-foreground">We&rsquo;ll miss you.</span> The chair goes back on the board — your colour card stays on file for next time.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={cn("flex items-center justify-between gap-4 px-6 py-4", ink ? "border-t border-background/15 bg-foreground/5" : "border-t border-border bg-muted/40")}>
              <p aria-live="polite" className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {attending === "yes" ? `${1 + plusOne} attending · ${meal}` : "Regrets sent"}
              </p>
              <Button
                type="button"
                onClick={() => setConfirmed(true)}
                disabled={confirmed}
                variant={confirmed ? "outline" : "default"}
                className={cn(
                  "gap-1.5 rounded-full px-5 py-2.5 font-display text-[12px] font-bold",
                  confirmed && ink && "border-background/30 bg-transparent text-background",
                  confirmed && !ink && "border-primary bg-transparent text-primary",
                )}
              >
                {confirmed && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
                {confirmed ? (attending === "yes" ? "Saved — see you there" : "Saved — next time") : "Confirm seat"}
              </Button>
            </div>
          </div>

          <p className="mx-auto mt-8 flex w-full max-w-[460px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            <span>{caption}</span>
            <span aria-hidden>●</span>
          </p>
        </div>
      </InView>
    </SectionShell>
  )
}
