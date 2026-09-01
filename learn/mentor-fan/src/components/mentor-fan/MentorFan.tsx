import * as React from "react"
import { motion } from "motion/react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"

export type Mentor = { name: string; role: string; slots: string; free: boolean; bio?: string }
export type MentorFanProps = {
  mentors?: Mentor[]
  className?: string
  onPick?: (name: string) => void
}

const DEFAULT_MENTORS: Mentor[] = [
  { name: "Mara Lindqvist", role: "Systems · ex-Stripe", slots: "Tue/Thu", free: true, bio: "Platform design, API craft" },
  { name: "Jonas Beck", role: "Motion · WebGL", slots: "Mon/Wed", free: false, bio: "Realtime graphics" },
  { name: "Priya Shah", role: "Product craft", slots: "Fri", free: true, bio: "Discovery → delivery" },
  { name: "Tomas Keller", role: "Perf · Rust", slots: "Weekends", free: true, bio: "Systems performance" },
  { name: "Elin Haugen", role: "Brand & voice", slots: "Tue", free: false, bio: "Voice & positioning" },
]

export function MentorFan({ mentors = DEFAULT_MENTORS, className, onPick }: MentorFanProps) {
  const [selected, setSelected] = React.useState<string | null>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  return (
    <section className={cn("relative isolate w-full overflow-hidden", className)}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <div className="mx-auto max-w-2xl text-center">
        <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "justify-center text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />MENTORS · OFFICE HOURS</span>
        <h2 className="mx-auto mt-2 max-w-[18ch] font-display text-[30px] font-bold leading-[0.98] tracking-tight text-foreground sm:text-[36px]">
          Learn with people who ship.
        </h2>
        <p className="mx-auto mt-3 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">Five mentors, real office hours. Pick one to see availability and book.</p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mentors.map((m, i) => {
          const isSelected = selected === m.name
          return (
            <InView key={m.name} once delay={i * 0.05}>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <Button type='button' onClick={() => {
                    setSelected(m.name)
                    if (m.free) onPick?.(m.name)
                  }} aria-pressed={isSelected} className={cn(
                    "group flex w-full flex-col rounded-xl border bg-card p-5 text-left shadow-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected && "border-foreground bg-card ring-1 ring-foreground/10"
                  )} variant="default">
                  <div className="flex w-full items-start justify-between gap-3">
                    <span className="grid size-11 place-items-center rounded-full border bg-muted font-mono text-xs font-bold tracking-[0.14em] text-foreground">
                      {m.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
                        m.free ? "bg-foreground text-background border-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", m.free ? "bg-background" : "bg-muted-foreground")} aria-hidden />
                      {m.free ? "Available" : "Booked"}
                    </span>
                  </div>

                  <span className="mt-4 font-display text-[17px] font-bold leading-tight text-foreground">{m.name}</span>
                  <span className="text-sm text-muted-foreground">{m.role}</span>
                  {m.bio && <span className="mt-1 text-xs leading-relaxed text-muted-foreground">{m.bio}</span>}

                  <span className="mt-4 flex w-full items-center justify-between border-t pt-3">
                    <span className="font-mono text-[11px] font-medium text-muted-foreground">{m.slots}</span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-3 py-1.5 font-mono text-xs font-semibold transition-colors",
                        m.free ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isSelected && m.free ? <Check className="size-3.5" aria-hidden /> : null}
                      {m.free ? (isSelected ? "Selected" : "Book") : "Waitlist"}
                    </span>
                  </span>
                </Button>
              </motion.div>
            </InView>
          )
        })}
      </div>

      <p className="mt-6 text-center font-mono text-[11px] font-medium text-muted-foreground">All mentors reply within 24h · Cancel anytime</p>
    
  </div>
</section>
  )
}
