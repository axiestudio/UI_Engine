import * as React from "react"
import { CalendarDays } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Booking bar — a compact inline booking widget.
// ═══ EMOTION     Book in one glance.
// ═══ SIGNATURE   A date + service + button booking row.

export type BookingBarProps = {
  eyebrow?: string
  title?: React.ReactNode
  services?: string[]
  cta?: string
  tone?: "paper" | "ink"
  className?: string
}

export function BookingBar({ eyebrow = "BOOK", title = "Pick a slot.", services = ["Consultation", "Session", "Retreat"], cta = "Book now", tone = "paper", className }: BookingBarProps) {
  const ink = tone === "ink"
  const [service, setService] = React.useState(services[0])
  const [date, setDate] = React.useState("")
  return (
    <SectionShell tone={tone} width={920} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className={cn("rounded-2xl border p-6 sm:p-8", ink ? "border-background/20 bg-background/5" : "border-border bg-card")}>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
              <h2 className="font-display text-xl font-black">{title}</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Service</span>
              <select value={service} onChange={(e) => setService(e.target.value)} className={cn("w-full rounded-lg border bg-background px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring")}>
                {services.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={cn("w-full rounded-lg border bg-background px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring")} />
            </label>
            <Button className="h-[46px] rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-widest">{cta}</Button>
          </div>
        </div>
      </InView>
    </SectionShell>
  )
}
