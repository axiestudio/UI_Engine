import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { AlertCircle, ArrowRight, Check, Clock, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { InView } from "@/components/primitives/in-view"
import { Magnetic } from "@/components/primitives/magnetic"
import { TextEffect } from "@/components/primitives/text-effect"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type ContactFieldType = "text" | "email" | "tel" | "select" | "textarea"

export type ContactFieldDef = {
  name: string
  label: string
  type?: ContactFieldType
  placeholder?: string
  required?: boolean
  /** select options — required when type === "select" */
  options?: { label: string; value: string }[]
  rows?: number
  /** When set, a live character counter is shown. */
  maxLength?: number
  hint?: string
  autoComplete?: string
  /** Force full-width (1) or half-width (1/2). Default: textarea full, others half from sm-up. */
  colSpan?: 1 | 2
}

export type ContactInfoItem = { label: string; value: React.ReactNode; href?: string; icon?: React.ElementType }

export type ContactProps = {
  eyebrow?: string
  title?: string
  intro?: React.ReactNode
  fields?: ContactFieldDef[]
  /** Async handler — receives a flat record of trimmed values. Rejection surfaces a form-level error; resolution shows the success state. */
  onSubmit?: (values: Record<string, string>) => Promise<void> | void
  submitLabel?: string
  submittingLabel?: string
  /** Small reassurance line under the submit button. */
  responseTime?: string
  successTitle?: string
  successDescription?: string
  /** Show a "Send another" reset after success. Default true. */
  allowResetAfterSuccess?: boolean
  info?: { title?: string; items: ContactInfoItem[] }
  /** Honeypot field name (bots only). Set "" to disable. Default "_gotcha". */
  honeypotName?: string
  className?: string
}

// ── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_FIELDS: ContactFieldDef[] = [
  { name: "name", label: "Full name", placeholder: "Jane Doe", required: true, autoComplete: "name", colSpan: 1 },
  { name: "email", label: "Email", type: "email", placeholder: "jane@example.com", required: true, autoComplete: "email", colSpan: 1 },
  { name: "phone", label: "Phone", type: "tel", placeholder: "+46 …", autoComplete: "tel", colSpan: 1 },
  { name: "topic", label: "Topic", type: "select", colSpan: 1, options: [{ label: "General", value: "general" }, { label: "Booking", value: "booking" }, { label: "Collaboration", value: "collab" }] },
  { name: "message", label: "Message", type: "textarea", rows: 5, required: true, maxLength: 1200, placeholder: "Tell us what you need — the more context, the better the answer.", colSpan: 2 },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ── Sub components ───────────────────────────────────────────────────────────

function FieldShell({ f, error, count, children }: { f: ContactFieldDef; error?: string; count?: { n: number; max: number }; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", f.colSpan === 2 ? "sm:col-span-2" : f.colSpan === 1 ? "sm:col-span-1" : undefined)}>
      <Label htmlFor={`contact-${f.name}`} className="flex items-baseline gap-1 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {f.label}
        {f.required && (
          <span aria-hidden className="text-foreground">
            *
          </span>
        )}
      </Label>
      {children}
      <div className="flex min-h-[16px] items-start justify-between gap-3">
        {error ? (
          <p id={`contact-${f.name}-error`} role="alert" className="flex items-center gap-1 text-[11px] font-semibold text-destructive">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error}
          </p>
        ) : f.hint ? (
          <p id={`contact-${f.name}-hint`} className="text-[11px] font-medium text-muted-foreground">
            {f.hint}
          </p>
        ) : (
          <span />
        )}
        {count && (
          <span id={`contact-${f.name}-count`} className="ml-auto shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground" aria-live="off">
            {count.n}/{count.max}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Contact ──────────────────────────────────────────────────────────────────


// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_CONTACT_ONSUBMIT = () => {}

export function Contact({
  eyebrow = "Contact",
  title = "Get in touch",
  intro,
  fields = DEFAULT_FIELDS,
  onSubmit = DEMO_CONTACT_ONSUBMIT,
  submitLabel = "Send message",
  submittingLabel = "Sending…",
  responseTime = "We usually reply within one business day.",
  successTitle = "Message sent",
  successDescription = "Thanks — we've received your message.",
  allowResetAfterSuccess = true,
  info,
  honeypotName = "_gotcha",
  className,
}: ContactProps) {
  const reduce = useReducedMotion()
  const [values, setValues] = React.useState<Record<string, string>>({})
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle")
  const [formError, setFormError] = React.useState<string | null>(null)
  const fieldRefs = React.useRef<Record<string, HTMLElement | null>>({})

  const setValue = (name: string, v: string) => setValues((s) => ({ ...s, [name]: v }))

  const validateField = (f: ContactFieldDef): string | null => {
    const v = (values[f.name] ?? "").trim()
    if (f.required && !v) return `${f.label} is required.`
    if (f.type === "email" && v && !EMAIL_RE.test(v)) return "Enter a valid email address."
    if (f.type === "textarea" && f.required && v && v.length < 10) return "A little more detail helps — 10 characters minimum."
    return null
  }

  const onBlur = (f: ContactFieldDef) => {
    setTouched((t) => ({ ...t, [f.name]: true }))
    setErrors((e) => ({ ...e, [f.name]: validateField(f) ?? "" }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === "submitting") return
    if (honeypotName && (values[honeypotName] ?? "")) return
    const next: Record<string, string> = {}
    let firstInvalid: string | null = null
    for (const f of fields) {
      const err = validateField(f)
      if (err) {
        next[f.name] = err
        if (!firstInvalid) firstInvalid = f.name
      }
    }
    setTouched(Object.fromEntries(fields.map((f) => [f.name, true])))
    setErrors(next)
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus()
      return
    }
    setFormError(null)
    setStatus("submitting")
    try {
      const payload: Record<string, string> = {}
      for (const f of fields) payload[f.name] = (values[f.name] ?? "").trim()
      await onSubmit(payload)
      setStatus("success")
    } catch {
      setStatus("error")
      setFormError("We couldn't deliver your message. Try again, or reach us by phone/email.")
    }
  }

  const reset = () => {
    setValues({})
    setTouched({})
    setErrors({})
    setStatus("idle")
  }

  const errOf = (f: ContactFieldDef) => (touched[f.name] ? errors[f.name] || undefined : undefined)

  const describedBy = (f: ContactFieldDef) =>
    [errOf(f) && `contact-${f.name}-error`, f.hint && !errOf(f) && `contact-${f.name}-hint`, f.maxLength !== undefined && f.type === "textarea" && `contact-${f.name}-count`]
      .filter(Boolean)
      .join(" ") || undefined

  const shared = (f: ContactFieldDef) => ({
    id: `contact-${f.name}`,
    name: f.name,
    "aria-invalid": !!errOf(f),
    "aria-describedby": describedBy(f),
  })

  const errorCount = fields.filter((f) => errOf(f)).length

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-labelledby="contact-title">
      <InView variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-80px" }}>
        <div className="mx-auto w-full max-w-[1080px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          {/* header */}
          <div className="mb-12 max-w-2xl">
            {eyebrow && (
              <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                <span aria-hidden className="h-px w-8 bg-foreground/30" />
                {eyebrow}
              </p>
            )}
            <h2 id="contact-title" className="mt-3 font-display text-[34px] font-black leading-[0.95] tracking-tight sm:text-5xl">
              {title}
            </h2>
            {intro &&
              (typeof intro === "string" && !reduce ? (
                <TextEffect per="word" preset="fade" as="p" delay={0.2} className="mt-4 text-[15px] font-medium leading-relaxed text-muted-foreground">
                  {intro}
                </TextEffect>
              ) : (
                <p className="mt-4 text-[15px] font-medium leading-relaxed text-muted-foreground">{intro}</p>
              ))}
          </div>

          <div className={cn("grid gap-6 lg:gap-8", info ? "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]" : "")}>
            {/* form panel */}
            <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
              <AnimatePresence mode="wait" initial={false}>
                {status === "success" ? (
                  <motion.div key="success" initial={{ opacity: 0, y: reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} role="status" className="flex min-h-[420px] flex-col items-start justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg">
                      <Check className="h-6 w-6 stroke-[3]" />
                    </span>
                    <h3 className="mt-6 font-display text-[28px] font-black leading-tight tracking-tight">{successTitle}</h3>
                    <p className="mt-2 max-w-sm text-sm font-medium leading-relaxed text-muted-foreground">{successDescription}</p>
                    {responseTime && <p className="mt-4 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground"><Clock className="h-3 w-3" />{responseTime}</p>}
                    {allowResetAfterSuccess && (
                      <Button variant="outline" className="mt-7 h-11 rounded-full px-7 font-display text-sm font-bold tracking-tight" onClick={reset}>
                        Send another <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    )}
                  </motion.div>
                ) : (
                  <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onSubmit={submit} noValidate className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
                    {fields.map((f) => {
                      const type = f.type ?? "text"
                      const err = errOf(f)
                      return (
                        <FieldShell key={f.name} f={f} error={err} count={type === "textarea" && f.maxLength !== undefined ? { n: (values[f.name] ?? "").length, max: f.maxLength } : undefined}>
                          {type === "textarea" ? (
                            <div className="relative">
                              <Textarea
                                {...shared(f)}
                                rows={f.rows ?? 4}
                                maxLength={f.maxLength}
                                placeholder={f.placeholder}
                                value={values[f.name] ?? ""}
                                onChange={(e) => setValue(f.name, e.target.value)}
                                onBlur={() => onBlur(f)}
                                ref={(el: HTMLTextAreaElement | null) => {
                                  fieldRefs.current[f.name] = el
                                }}
                                className={cn("min-h-[120px] rounded-xl bg-background shadow-xs", err && "border-destructive focus-visible:ring-destructive/40")}
                              />
                            </div>
                          ) : type === "select" ? (
                            <Select value={values[f.name] || undefined} onValueChange={(v) => setValue(f.name, v)} onOpenChange={(o) => !o && onBlur(f)}>
                              <SelectTrigger {...shared(f)} ref={(el: HTMLButtonElement | null) => { fieldRefs.current[f.name] = el }} className={cn("h-11 w-full rounded-xl bg-background shadow-xs", err && "border-destructive")}>
                                <SelectValue placeholder="Select…" />
                              </SelectTrigger>
                              <SelectContent>
                                {(f.options ?? []).map((o) => (
                                  <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              {...shared(f)}
                              type={type === "tel" ? "tel" : type === "email" ? "email" : "text"}
                              placeholder={f.placeholder}
                              autoComplete={f.autoComplete}
                              value={values[f.name] ?? ""}
                              onChange={(e) => setValue(f.name, e.target.value)}
                              onBlur={() => onBlur(f)}
                              ref={(el: HTMLInputElement | null) => {
                                fieldRefs.current[f.name] = el
                              }}
                              className={cn("h-11 rounded-xl bg-background shadow-xs", err && "border-destructive focus-visible:ring-destructive/40")}
                            />
                          )}
                        </FieldShell>
                      )
                    })}

                    {honeypotName && (
                      <div aria-hidden className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0">
                        <label htmlFor={`contact-${honeypotName}`}>Leave this field empty</label>
                        <input id={`contact-${honeypotName}`} name={honeypotName} tabIndex={-1} autoComplete="off" value={values[honeypotName] ?? ""} onChange={(e) => setValue(honeypotName, e.target.value)} />
                      </div>
                    )}

                    <div className="mt-2 sm:col-span-2">
                      {status === "error" && formError && (
                        <p role="alert" className="mb-3 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-sm font-semibold text-destructive">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          {formError}
                        </p>
                      )}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Magnetic intensity={0.2} range={50}>
                          <Button type="submit" disabled={status === "submitting"} aria-busy={status === "submitting"} className="h-11 w-full rounded-full px-8 font-display text-sm font-extrabold tracking-tight shadow-sm sm:w-auto">
                            {status === "submitting" ? (
                              <>
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                {submittingLabel}
                              </>
                            ) : (
                              <>
                                {submitLabel}
                                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                              </>
                            )}
                          </Button>
                        </Magnetic>
                        <p className="text-[11px] font-medium text-muted-foreground">
                          Fields marked <span aria-hidden>*</span> are required.
                        </p>
                      </div>
                      <span aria-live="assertive" className="sr-only">
                        {errorCount > 0 ? `The form contains ${errorCount} ${errorCount === 1 ? "error" : "errors"}. Review the highlighted fields.` : ""}
                      </span>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* info rail */}
            {info && info.items.length > 0 && (
              <aside className="flex flex-col gap-3">
                <div className="rounded-2xl border bg-foreground p-6 text-background shadow-sm">
                  <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-background/60">{info.title ?? "Direct lines"}</h3>
                  <ul className="mt-4 flex flex-col gap-4">
                    {info.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <li key={item.label}>
                          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-background/60">
                            {Icon && <Icon className="h-3 w-3" />}
                            {item.label}
                          </p>
                          {item.href ? (
                            <a href={item.href} className="mt-1 block break-all text-sm font-bold underline-offset-4 transition-colors hover:underline">
                              {item.value}
                            </a>
                          ) : (
                            <p className="mt-1 text-sm font-bold">{item.value}</p>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                  {responseTime && (
                    <p className="mt-6 flex items-start gap-2 border-t border-background/15 pt-4 text-xs font-medium leading-relaxed text-background/70">
                      <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {responseTime}
                    </p>
                  )}
                </div>
              </aside>
            )}
          </div>
        </div>
      </InView>
    </section>
  )
}
