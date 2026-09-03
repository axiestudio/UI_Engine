import * as React from "react"
import { Lock, Loader2, Check, AlertCircle } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Invite gate — a members-only invite wall with real validation.
// ═══ EMOTION     Exclusivity with clarity.
// ═══ SIGNATURE   A locked panel with an accessible email request and
//                 honest async states (idle → submitting → success / error).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type InviteGateProps = {
  eyebrow?: string
  title?: React.ReactNode
  body?: React.ReactNode
  cta?: string
  placeholder?: string
  tone?: "paper" | "ink"
  onSubmit?: (email: string) => Promise<void> | void
  successTitle?: string
  successDescription?: string
  className?: string
}

export function InviteGate({
  eyebrow = "INVITE ONLY",
  title = "This part is by invite.",
  body = "Request access and we'll send a key when a spot opens up.",
  cta = "Request access",
  placeholder = "you@studio.com",
  tone = "paper",
  onSubmit,
  successTitle = "Request received",
  successDescription = "You're on the list — we'll email you when a spot opens.",
  className,
}: InviteGateProps) {
  const ink = tone === "ink"
  const [email, setEmail] = React.useState("")
  const [touched, setTouched] = React.useState(false)
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle")
  const [error, setError] = React.useState<string | null>(null)
  const inputId = React.useId()

  const validationError = React.useMemo(() => {
    if (!touched) return null
    if (!email.trim()) return "Email is required."
    if (!EMAIL_RE.test(email.trim())) return "Enter a valid email address."
    return null
  }, [email, touched])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    const trimmed = email.trim()
    if (!trimmed) {
      setError("Email is required.")
      return
    }
    if (!EMAIL_RE.test(trimmed)) {
      setError("Enter a valid email address.")
      return
    }
    setError(null)
    setStatus("submitting")
    try {
      await onSubmit?.(trimmed)
      setStatus("success")
    } catch {
      setStatus("error")
      setError("Something went wrong. Please try again.")
    } finally {
      if (status !== "success") setStatus((s) => (s === "submitting" ? "idle" : s))
      // actual success keeps "success" — submitting -> success already set
      // if error, we set error above and reset to idle after catch would be wrong
      // fix: keep submitting handling correctly
    }
  }

  // Correct async flow: set success stays, error goes idle with message
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
      setError("Something went wrong. Please try again.")
      setStatus("idle")
    }
  }

  const showError = error || validationError
  const isSubmitting = status === "submitting"

  if (status === "success") {
    return (
      <SectionShell tone={tone} width={760} grain={!ink} rule="bottom" className={className}>
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <div
            className={cn("relative overflow-hidden rounded-2xl border p-8 text-center shadow-sm sm:p-10", ink ? "border-background/20 bg-background/5" : "border-border bg-card")}
            role="status"
            aria-live="polite"
          >
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <Check className="h-5 w-5 text-emerald-600" aria-hidden />
            </span>
            <h2 className="mt-5 font-display text-2xl font-black tracking-[-0.02em] sm:text-3xl">{successTitle}</h2>
            <p className={cn("mx-auto mt-3 max-w-sm text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{successDescription}</p>
            <p className="mt-4 font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-600">✓ We’ve got {email}</p>
          </div>
        </InView>
      </SectionShell>
    )
  }

  return (
    <SectionShell tone={tone} width={760} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-40px" }}>
        <div className={cn("relative overflow-hidden rounded-2xl border p-8 text-center shadow-sm sm:p-10", ink ? "border-background/20 bg-background/5 bg-background/90" : "border-border bg-card")}>
          <span className={cn("mx-auto flex h-12 w-12 items-center justify-center rounded-full ring-1", ink ? "bg-background/10 ring-background/15" : "bg-accent ring-border")}>
            <Lock className="h-5 w-5" aria-hidden />
          </span>
          <p className={cn("mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.24em]", ink ? "text-background/60" : "text-muted-foreground")}>{eyebrow}</p>
          <h2 className="mt-3 font-display text-2xl font-black tracking-[-0.02em] sm:text-3xl">{title}</h2>
          <p className={cn("mx-auto mt-3 max-w-sm text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{body}</p>

          <form onSubmit={submit} noValidate className="mx-auto mt-6 max-w-sm text-left" aria-label="Invite request">
            <label htmlFor={inputId} className="sr-only">
              Email address
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
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
                  aria-describedby={showError ? `${inputId}-error` : undefined}
                  className={cn(
                    "h-11 w-full rounded-full border bg-background px-4 text-sm font-medium shadow-xs outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    ink ? "border-background/20 bg-background text-foreground placeholder:text-background/40" : "border-border",
                    showError && "border-destructive focus-visible:ring-destructive/40",
                  )}
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="h-11 shrink-0 rounded-full px-5 font-mono text-[10px] font-bold uppercase tracking-widest shadow-sm">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden /> Sending…
                  </>
                ) : (
                  cta
                )}
              </Button>
            </div>
            <div className="min-h-[20px] pt-1.5">
              {showError ? (
                <p id={`${inputId}-error`} role="alert" className="flex items-center gap-1 text-xs font-medium text-destructive">
                  <AlertCircle className="h-3 w-3 shrink-0" aria-hidden />
                  {showError}
                </p>
              ) : (
                <p className="text-xs font-medium text-muted-foreground">We’ll only use this to send your invite.</p>
              )}
            </div>
          </form>
        </div>
      </InView>
    </SectionShell>
  )
}
