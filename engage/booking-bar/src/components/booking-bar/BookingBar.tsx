import * as React from "react"
import { CalendarDays, Loader2, AlertCircle } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Booking bar — a compact inline booking widget with validation.
// ═══ EMOTION     Book in one glance — no dead ends.

export type BookingBarProps = {
  eyebrow?: string
  title?: React.ReactNode
  services?: string[]
  cta?: string
  tone?: "paper" | "ink"
  onSubmit?: (data: { service: string; date: string }) => Promise<void> | void
  className?: string
}

export function BookingBar({
  eyebrow = "BOOK",
  title = "Pick a slot.",
  services = ["Consultation", "Session", "Retreat"],
  cta = "Book now",
  tone = "paper",
  onSubmit,
  className,
}: BookingBarProps) {
  const ink = tone === "ink"
  const [service, setService] = React.useState(services[0] ?? "")
  const [date, setDate] = React.useState("")
  const [touched, setTouched] = React.useState({ service: false, date: false })
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success">("idle")
  const [error, setError] = React.useState<string | null>(null)
  const serviceId = React.useId()
  const dateId = React.useId()

  React.useEffect(() => {
    if (services.length && !services.includes(service)) setService(services[0])
  }, [services, service])

  const serviceError = touched.service && !service ? "Select a service." : null
  const dateError = React.useMemo(() => {
    if (!touched.date) return null
    if (!date) return "Pick a date."
    const selected = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selected < today) return "Date can’t be in the past."
    return null
  }, [date, touched.date])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ service: true, date: true })
    if (!service || !date || dateError) {
      setError("Fix the highlighted fields before booking.")
      return
    }
    setError(null)
    setStatus("submitting")
    try {
      await onSubmit?.({ service, date })
      setStatus("success")
    } catch {
      setError("We couldn’t book that slot. Try another date.")
      setStatus("idle")
    }
  }

  const isSubmitting = status === "submitting"

  return (
    <SectionShell tone={tone} width={920} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-40px" }}>
        <div className={cn("rounded-2xl border p-6 shadow-sm sm:p-7", ink ? "border-background/20 bg-background/5 backdrop-blur" : "border-border bg-card")}>
          <div className="flex items-center gap-3">
            <span className={cn("grid size-9 place-items-center rounded-xl ring-1", ink ? "bg-background/10 ring-background/15" : "bg-accent ring-border")}>
              <CalendarDays className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.24em]", ink ? "text-background/60" : "text-muted-foreground")}>{eyebrow}</p>
              <h2 className="font-display text-xl font-black tracking-tight">{title}</h2>
            </div>
          </div>

          {status === "success" ? (
            <div className="mt-6 rounded-xl bg-emerald-500/10 p-4 ring-1 ring-emerald-500/15" role="status" aria-live="polite">
              <p className="font-display text-sm font-bold text-emerald-700">Booked — {service} on {new Date(date).toLocaleDateString()}</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">We’ll confirm by email. You can pick another slot below.</p>
              <button type="button" onClick={() => setStatus("idle")} className="mt-3 font-mono text-[11px] font-bold uppercase tracking-widest text-foreground underline-offset-4 hover:underline">
                Book another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
              <div>
                <label htmlFor={serviceId} className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Service <span aria-hidden className="text-foreground">*</span>
                </label>
                <select
                  id={serviceId}
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, service: true }))}
                  aria-invalid={!!serviceError}
                  aria-describedby={serviceError ? `${serviceId}-error` : undefined}
                  className={cn(
                    "h-11 w-full rounded-xl border bg-background px-3 text-sm font-medium shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    serviceError && "border-destructive focus-visible:ring-destructive/40",
                  )}
                >
                  {services.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="min-h-[18px] pt-1">
                  {serviceError && (
                    <p id={`${serviceId}-error`} role="alert" className="flex items-center gap-1 text-xs font-medium text-destructive">
                      <AlertCircle className="h-3 w-3" aria-hidden />
                      {serviceError}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor={dateId} className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Date <span aria-hidden className="text-foreground">*</span>
                </label>
                <input
                  id={dateId}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, date: true }))}
                  aria-invalid={!!dateError}
                  aria-describedby={dateError ? `${dateId}-error` : undefined}
                  className={cn(
                    "h-11 w-full rounded-xl border bg-background px-3 text-sm font-medium shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    dateError && "border-destructive focus-visible:ring-destructive/40",
                  )}
                />
                <div className="min-h-[18px] pt-1">
                  {dateError && (
                    <p id={`${dateId}-error`} role="alert" className="flex items-center gap-1 text-xs font-medium text-destructive">
                      <AlertCircle className="h-3 w-3" aria-hidden />
                      {dateError}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:pt-[22px]">
                <Button type="submit" disabled={isSubmitting} className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-widest shadow-sm">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden /> Booking…
                    </>
                  ) : (
                    cta
                  )}
                </Button>
              </div>

              {error && (
                <p role="alert" className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive ring-1 ring-destructive/15 sm:col-span-3">
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </InView>
    </SectionShell>
  )
}
