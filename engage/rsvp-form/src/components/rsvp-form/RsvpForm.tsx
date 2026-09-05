import * as React from "react"
import { Check, Loader2, AlertCircle } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type RsvpFormProps = {
  eyebrow?: string
  title?: React.ReactNode
  options?: string[]
  cta?: string
  tone?: "paper" | "ink"
  onSubmit?: (data: { name: string; email: string; choice: string }) => Promise<void> | void
  className?: string
}

export function RsvpForm({
  eyebrow = "RSVP",
  title = "Will you make it?",
  options = ["Yes, count me in", "Maybe", "Can't make it"],
  cta = "Send RSVP",
  tone = "paper",
  onSubmit,
  className,
}: RsvpFormProps) {
  const ink = tone === "ink"
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [choice, setChoice] = React.useState(options[0])
  const [touched, setTouched] = React.useState({ name: false, email: false })
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success">("idle")
  const [formError, setFormError] = React.useState<string | null>(null)
  const nameId = React.useId()
  const emailId = React.useId()
  const groupId = React.useId()

  const nameError = touched.name && !name.trim() ? "Name is required." : null
  const emailError = React.useMemo(() => {
    if (!touched.email) return null
    if (!email.trim()) return "Email is required."
    if (!EMAIL_RE.test(email.trim())) return "Enter a valid email."
    return null
  }, [email, touched.email])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true })
    if (!name.trim() || !email.trim() || !EMAIL_RE.test(email.trim())) {
      setFormError("Please fix the highlighted fields.")
      return
    }
    setFormError(null)
    setStatus("submitting")
    try {
      await onSubmit?.({ name: name.trim(), email: email.trim(), choice })
      setStatus("success")
    } catch {
      setFormError("We couldn’t send your RSVP. Try again.")
      setStatus("idle")
    }
  }

  return (
    <SectionShell tone={tone} width={760} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-40px" }}>
        <div className={cn("relative isolate overflow-hidden rounded-2xl border p-6 shadow-sm sm:p-7", ink ? "border-background/20 bg-background/5 bg-background/90" : "border-border bg-card")}>
          <p className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.24em]", ink ? "text-background/60" : "text-muted-foreground")}>{eyebrow}</p>
          <h2 className="mt-2 font-display text-2xl font-black tracking-[-0.02em] sm:text-3xl">{title}</h2>

          {status === "success" ? (
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-[hsl(var(--ok)/0.1)] p-4 ring-1 ring-[hsl(var(--ok)/0.15)]" role="status" aria-live="polite">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[hsl(var(--ok))] text-primary-foreground">
                <Check className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="font-display text-sm font-bold">See you there — {choice}.</p>
                <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">
                  Thanks, {name}. We’ve logged your RSVP for {email}.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-6 space-y-4" aria-labelledby={groupId}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor={nameId} className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Name <span aria-hidden className="text-foreground">*</span>
                  </label>
                  <input
                    id={nameId}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    placeholder="Jane Doe"
                    autoComplete="name"
                    aria-invalid={!!nameError}
                    aria-describedby={nameError ? `${nameId}-error` : undefined}
                    className={cn(
                      "h-11 w-full rounded-xl border bg-background px-3 text-sm font-medium shadow-xs outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring",
                      nameError && "border-destructive focus-visible:ring-destructive/40",
                    )}
                  />
                  <div className="min-h-[18px] pt-1">
                    {nameError && (
                      <p id={`${nameId}-error`} role="alert" className="flex items-center gap-1 text-xs font-medium text-destructive">
                        <AlertCircle className="h-3 w-3" aria-hidden />
                        {nameError}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor={emailId} className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Email <span aria-hidden className="text-foreground">*</span>
                  </label>
                  <input
                    id={emailId}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    placeholder="you@studio.com"
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? `${emailId}-error` : undefined}
                    className={cn(
                      "h-11 w-full rounded-xl border bg-background px-3 text-sm font-medium shadow-xs outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring",
                      emailError && "border-destructive focus-visible:ring-destructive/40",
                    )}
                  />
                  <div className="min-h-[18px] pt-1">
                    {emailError && (
                      <p id={`${emailId}-error`} role="alert" className="flex items-center gap-1 text-xs font-medium text-destructive">
                        <AlertCircle className="h-3 w-3" aria-hidden />
                        {emailError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <p id={groupId} className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Attendance
                </p>
                <RadioGroup value={choice} onValueChange={(v) => setChoice(v as (typeof options)[number])} aria-labelledby={groupId} className="flex flex-wrap gap-2">
                  {options.map((o) => (
                    <RadioGroupItem
                      key={o}
                      value={o}
                      className={cn(
                        "h-9 w-auto aspect-auto rounded-full border px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest shadow-none transition-colors [&_[data-slot=radio-group-indicator]]:hidden data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background",
                        !ink && "border-border bg-background hover:bg-accent hover:text-accent-foreground data-[state=unchecked]:text-foreground",
                        ink && "border-background/20 bg-transparent data-[state=unchecked]:text-background hover:bg-background/10",
                      )}
                    >
                      {o}
                    </RadioGroupItem>
                  ))}
                </RadioGroup>
              </div>

              {formError && (
                <p role="alert" className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive ring-1 ring-destructive/15">
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                  {formError}
                </p>
              )}

              <Button type="submit" disabled={status === "submitting"} className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-widest shadow-sm">
                {status === "submitting" ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden /> Sending…
                  </>
                ) : (
                  cta
                )}
              </Button>
            </form>
          )}
        </div>
      </InView>
    </SectionShell>
  )
}
