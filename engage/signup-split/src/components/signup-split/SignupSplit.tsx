import * as React from "react"
import { Check, Loader2, AlertCircle } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type SignupSplitProps = {
  eyebrow?: string
  title?: React.ReactNode
  points?: string[]
  cta?: string
  placeholder?: string
  tone?: "paper" | "ink"
  onSubmit?: (email: string) => Promise<void> | void
  className?: string
}

export function SignupSplit({
  eyebrow = "JOIN",
  title = "Start in seconds.",
  points = ["No card to start", "Every section included", "Cancel anytime"],
  cta = "Create account",
  placeholder = "you@studio.com",
  tone = "paper",
  onSubmit,
  className,
}: SignupSplitProps) {
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

  return (
    <SectionShell tone={tone} width={920} grain={!ink} rule="bottom" className={className}>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-10">
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true }}>
          <div>
            <p className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.24em]", ink ? "text-background/60" : "text-muted-foreground")}>{eyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-black tracking-[-0.03em] sm:text-4xl">{title}</h2>
            <ul className="mt-6 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm font-medium">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
                    <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </InView>

        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.08 }} viewOptions={{ once: true, margin: "-40px" }}>
          {status === "success" ? (
            <div className={cn("rounded-2xl border p-6 shadow-sm sm:p-7", ink ? "border-background/20 bg-background/5" : "border-border bg-card")} role="status" aria-live="polite">
              <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 p-4 ring-1 ring-emerald-500/15">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                <div>
                  <p className="font-display text-sm font-bold">Account request received</p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">We’ve sent a magic link to {email} — it’s valid for 15 minutes.</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className={cn("rounded-2xl border p-6 shadow-sm sm:p-7", ink ? "border-background/20 bg-background/5" : "border-border bg-card")} aria-label="Signup">
              <label htmlFor={inputId} className="mb-2 block font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Work email
              </label>
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
                  "h-11 w-full rounded-xl border bg-background px-4 text-sm font-medium shadow-xs outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  showError && "border-destructive focus-visible:ring-destructive/40",
                )}
              />
              <div className="min-h-[20px] pt-1.5">
                {showError ? (
                  <p id={`${inputId}-error`} role="alert" className="flex items-center gap-1 text-xs font-medium text-destructive">
                    <AlertCircle className="h-3 w-3" aria-hidden />
                    {showError}
                  </p>
                ) : (
                  <p id={`${inputId}-hint`} className="text-xs font-medium text-muted-foreground">
                    Free for 14 days. No card required.
                  </p>
                )}
              </div>

              <Button type="submit" disabled={status === "submitting"} size="lg" className="mt-3 h-11 w-full rounded-full font-mono text-[11px] font-bold uppercase tracking-widest shadow-sm">
                {status === "submitting" ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden /> Creating…
                  </>
                ) : (
                  cta
                )}
              </Button>
              <p className="mt-3 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">By joining you agree to our terms & privacy</p>
            </form>
          )}
        </InView>
      </div>
    </SectionShell>
  )
}
