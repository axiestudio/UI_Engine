import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { Check, ChevronLeft, ChevronRight, CircleAlert } from "lucide-react"
import { toast, Toaster } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — multi-step flows that can't be linear-only.
// JOB      collect structured data over steps without stranding the user
// SIGNATURE the rail fills like a progress fuse; completed chips become
//           check-marked and REVISITABLE (deep-link back keeps data); invalid
//           "Continue" shakes, focuses the first bad field, marks it inline
//           AND reports a Sonner summary naming the field — never lies.
//           Final submit runs toast.promise (loading → success/error) and the
//           form shows its confirmation state.
// API      steps [{title, fields:[{key,label,type?,required?,validate?}]}],
//          onSubmit(data) ; state lives in the component with controlled option.
// A11Y     fieldset/legend per step, aria-invalid + describedby error text,
//          aria-current on the rail.

export type Field = { key: string; label: string; type?: string; required?: boolean; placeholder?: string; validate?: (v: string, d: Record<string, string>) => string | null }
export type Step = { title: string; fields: Field[] }
export type StepperFormProps = { steps: Step[]; onSubmit: (data: Record<string, string>) => void; submitLabel?: string; className?: string }

const TOASTER_ID = "stepper-form"

export function StepperForm({ steps, onSubmit, submitLabel = "Finish", className }: StepperFormProps) {
  const [i, setI] = React.useState(0)
  const [data, setData] = React.useState<Record<string, string>>({})
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [shake, setShake] = React.useState(0)
  const [sending, setSending] = React.useState(false)
  const [finished, setFinished] = React.useState(false)
  const step = steps[i]
  const refs = React.useRef<Record<string, HTMLInputElement>>({})
  const dataRef = React.useRef(data)
  dataRef.current = data
  const submitRef = React.useRef(onSubmit)
  submitRef.current = onSubmit

  // real validation pass — inline marks PLUS a toast summary naming first bad field
  const validateStep = () => {
    const e: Record<string, string> = {}
    const bad: { label: string; msg: string }[] = []
    for (const f of step.fields) {
      const v = (data[f.key] ?? "").trim()
      if (f.required && !v) { e[f.key] = "Required"; bad.push({ label: f.label, msg: "is required" }) }
      else if (f.validate && v) { const m = f.validate(v, data); if (m) { e[f.key] = m; bad.push({ label: f.label, msg: m }) } }
    }
    setErrors(e)
    if (bad.length) {
      refs.current[Object.keys(e)[0]]?.focus()
      setShake((s) => s + 1)
      toast.error(`Step “${step.title}” can't advance — ${bad.length === 1 ? "one field needs you" : `${bad.length} fields need you`}`, {
        description: bad[0].label + " " + bad[0].msg + (bad.length > 1 ? ` · +${bad.length - 1} more marked in red` : ""),
        duration: 6000,
        toasterId: TOASTER_ID,
      })
    }
    return !bad.length
  }

  // final submit: fake network hop around the host's synchronous onSubmit —
  // a threw-in there rejects and the toast reports the error instead.
  const finish = () => {
    if (!validateStep()) return
    setSending(true)
    toast.promise(
      new Promise<Record<string, string>>((resolve, reject) => {
        setTimeout(() => {
          try { submitRef.current({ ...dataRef.current }); resolve({ ...dataRef.current }) } catch { reject(new Error("the save refused")) }
        }, 900)
      }),
      {
        loading: `Checking step ${i + 1} of ${steps.length} and sending…`,
        success: () => { setFinished(true); setSending(false); return `Saved — all ${steps.length} steps check out` },
        error: "Could not save — the answers stayed put",
        duration: 4000,
        toasterId: TOASTER_ID,
      },
    )
  }

  const next = () => { if (validateStep()) { if (i === steps.length - 1) finish(); else setI(i + 1) } }
  const doneThrough = (s: number) => s < i

  if (finished) {
    return (
      <div className={cn("font-sans", className)} role="status" aria-live="polite">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-3 rounded-xl border border-[hsl(var(--ok)/0.4)] bg-[hsl(var(--ok)/0.06)] px-6 py-10 text-center">
          <span className="grid size-10 place-items-center rounded-full bg-[hsl(var(--ok))] text-white"><Check className="size-5" aria-hidden /></span>
          <p className="font-display text-lg font-semibold tracking-tight">Sent and checked through.</p>
          <p className="text-sm text-muted-foreground">{steps.length} steps · {Object.keys(data).length} answers · nothing left required.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => { setFinished(false); setI(steps.length - 1) }}>Edit answers</Button>
        </div>
        <Toaster id={TOASTER_ID} position="bottom-center" richColors closeButton />
      </div>
    )
  }

  return (
    <div className={cn("font-sans", className)}>
      <MotionConfig reducedMotion="user">
      <ol className="mb-6 flex items-center gap-0" aria-label="Form steps">
        {steps.map((s, x) => (
          <li key={s.title} className="flex flex-1 items-center last:flex-none">
            <Button variant="ghost"
              type="button"
              onClick={() => { if (doneThrough(x) || x === i) { setErrors({}); setI(x) } }}
              aria-current={x === i ? "step" : undefined}
              disabled={!doneThrough(x) && x !== i}
              className={cn("flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-xs font-medium transition-colors", x === i && "bg-accent text-accent-foreground", doneThrough(x) ? "text-[hsl(var(--ok))]" : "text-muted-foreground", !doneThrough(x) && x !== i && "opacity-50")}
            >
              <motion.span layout className={cn("grid size-6 place-items-center rounded-full border-2 text-[11px] tabular-nums", x === i ? "border-[hsl(var(--app-focus))]" : doneThrough(x) ? "border-[hsl(var(--ok))] bg-[hsl(var(--ok))] text-white" : "border-current")}>{doneThrough(x) ? <Check className="size-3.5" /> : x + 1}</motion.span>
              <span className="hidden sm:inline">{s.title}</span>
            </Button>
            {x < steps.length - 1 && <span className="relative mx-2 h-[2px] flex-1 overflow-hidden rounded bg-muted"><motion.span initial={false} animate={{ width: doneThrough(x) ? "100%" : "0%" }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="block h-full bg-[hsl(var(--ok))]" /></span>}
          </li>
        ))}
      </ol>
      <AnimatePresence mode="wait">
        <motion.fieldset key={step.title} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="space-y-4 border-0 p-0 m-0">
          <legend className="font-display text-lg font-semibold tracking-tight">{step.title}</legend>
          {step.fields.map((f) => (
            <div key={f.key}>
              <label htmlFor={`f-${f.key}`} className="mb-1.5 flex items-center gap-1 text-sm font-medium text-muted-foreground">{f.label}{f.required ? <span aria-hidden className="text-[hsl(var(--err))]">*</span> : <span className="text-xs text-muted-foreground">optional</span>}</label>
              <Input
                id={`f-${f.key}`}
                ref={(el) => { if (el) refs.current[f.key] = el }}
                type={f.type ?? "text"}
                value={data[f.key] ?? ""}
                onChange={(e) => setData((d) => ({ ...d, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                aria-invalid={!!errors[f.key]}
                aria-describedby={errors[f.key] ? `e-${f.key}` : undefined}
                className={cn("h-10 rounded-lg text-sm", errors[f.key] && "border-[hsl(var(--err))]")}
              />
              {errors[f.key] && <p id={`e-${f.key}`} className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-[hsl(var(--err))]"><CircleAlert className="size-3.5" /> {errors[f.key]}</p>}
            </div>
          ))}
        </motion.fieldset>
      </AnimatePresence>
      <div className="mt-7 flex items-center gap-2">
        {i > 0 && <Button type="button" variant="ghost" onClick={() => setI(i - 1)} className="flex h-10 items-center gap-1 rounded-md border border-border/70 bg-background px-3 text-sm font-medium hover:bg-muted"><ChevronLeft className="size-4" /> Back</Button>}
        <motion.div animate={shake ? { x: [0, -7, 7, -5, 5, -2, 2, 0] } : { x: 0 }} transition={{ duration: 0.42 }}>
          <Button type="button" onClick={next} disabled={sending} className="flex h-10 items-center gap-1 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm">
            {sending ? "Sending…" : i === steps.length - 1 ? submitLabel : "Continue"} <ChevronRight className="size-4" />
          </Button>
        </motion.div>
        <span className="ml-auto text-xs text-muted-foreground">step {i + 1}/{steps.length}</span>
      </div>
      </MotionConfig>
      <Toaster id={TOASTER_ID} position="bottom-center" richColors closeButton />
    </div>
  )
}
