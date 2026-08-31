import * as React from "react"
import { Clock, Loader2, Check, AlertCircle, Users } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type WaitlistBandProps = {
  eyebrow?: string
  title?: React.ReactNode
  count?: number
  cta?: string
  placeholder?: string
  tone?: "paper" | "ink"
  onSubmit?: (email: string) => Promise<void> | void
  successTitle?: string
  className?: string
}

export function WaitlistBand({
  eyebrow = "WAITLIST",
  title = "You're early — that's the point.",
  count = 1280,
  cta = "Join the waitlist",
  placeholder = "you@studio.com",
  tone = "paper",
  onSubmit,
  successTitle = "You're on the list",
  className,
}: WaitlistBandProps) {
  const ink = tone === "ink"
  const [email, setEmail] = React.useState("")
  const [touched, setTouched] = React.useState(false)
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success">("idle")
  const [error, setError] = React.useState<string | null>(null)
  const inputId = React.useId()

  const validationError = React.useMemo(() => {
    if (!touched) return null
    if (!email.trim()) return "Email is required."
    if (!EMAIL_RE.test(email.trim())) return "Enter a valid email address."
    return null
  }, [email, touched])

  const showError = error || validationError
  const isSubmitting = status === "submitting"

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    const trimmed = email.trim()
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      setError(!trimmed ? "Email is required." : "Enter a valid email address.")
      return
    }
    setError(null)
    setStatus("submitting")
    try {
      await onSubmit?.(trimmed)
      setStatus("success")
    } catch {
      setError("We couldn’t join you to the waitlist. Try again.")
      setStatus("idle")
    }
  }

  if (status === "success") {
    return (
      <SectionShell tone={tone} width={920} grain={!ink} rule="bottom" className={className}>
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <div className={cn("rounded-2xl border p-8 text-center shadow-sm sm:p-10", ink ? "border-background/20 bg-background/5" : "border-border bg-card")} role="status" aria-live="polite">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <Check className="h-5 w-5 text-emerald-600" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-2xl font-black tracking-[-0.02em] sm:text-3xl">{successTitle} ✓</h2>
            <p className="mt-2 font-mono text-sm font-medium text-muted-foreground">We’ll email you at {email} when it’s your turn.</p>
          </div>
        </InView>
      </SectionShell>
    )
  }

  return (
    <SectionShell tone={tone} width={920} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-40px" }}>
        <div className={cn("rounded-2xl border p-8 text-center shadow-sm sm:p-10", ink ? "border-background/20 bg-background/5" : "border-border bg-card")}>
          <span className={cn("mx-auto flex h-12 w-12 items-center justify-center rounded-full ring-1", ink ? "bg-background/10 ring-background/15" : "bg-accent ring-border")}>
            <Clock className="h-5 w-5" aria-hidden />
          </span>
          <p className={cn("mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.24em]", ink ? "text-background/60" : "text-muted-foreground")}>{eyebrow}</p>
          <h2 className="mt-3 font-display text-2xl font-black tracking-[-0.02em] sm:text-4xl">{title}</h2>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-1.5 font-mono text-xs font-bold text-background shadow-sm">
            <Users className="h-3.5 w-3.5" aria-hidden />
            <span className="tabular-nums">{count.toLocaleString()}</span>
            <span className="font-medium opacity-80">already in</span>
          </p>

          <form onSubmit={submit} noValidate className="mx-auto mt-6 max-w-sm text-left" aria-label="Waitlist signup">
            <label htmlFor={inputId} className="sr-only">
              Email address
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  id={inputId}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError(null)
                  }}
                  onBlur={() => setTouched(true)}
                  placeholder={placeholder}
                  aria-invalid={!!showError}
                  aria-describedby={showError ? `${inputId}-error` : `${inputId}-hint`}
                  className={cn(
                    "h-11 w-full rounded-full border bg-background px-4 text-sm font-medium shadow-xs outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    ink ? "border-background/20" : "border-border",
                    showError && "border-destructive focus-visible:ring-destructive/40",
                  )}
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="h-11 shrink-0 rounded-full px-5 font-mono text-[10px] font-bold uppercase tracking-widest shadow-sm">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden /> Joining…
                  </>
                ) : (
                  cta
                )}
              </Button>
            </div>
            <div className="min-h-[20px] pt-1.5">
              {showError ? (
                <p id={`${inputId}-error`} role="alert" className="flex items-center gap-1 text-xs font-medium text-destructive">
                  <AlertCircle className="h-3 w-3" aria-hidden />
                  {showError}
                </p>
              ) : (
                <p id={`${inputId}-hint`} className="text-xs font-medium text-muted-foreground">
                  No spam — just the invite.
                </p>
              )}
            </div>
          </form>
        </div>
      </InView>
    </SectionShell>
  )
}
