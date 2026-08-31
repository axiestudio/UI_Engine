import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { CalendarCheck, ClipboardList, FilePlus2, KeyRound } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, Grain } from "@/components/primitives/handcraft"
import { StepperForm, type Step } from "stepper-form"
import { UploadQueue, type UploadFile } from "upload-queue"
import { CopySecretField } from "copy-secret-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/watermelon/checkbox"

// COMPOSITE SCREEN · PATIENT INTAKE
// composed of: stepper-form (questionnaire with validation), upload-queue
// (documents), copy-secret-field (record key reveal), watermelon checkbox
// (consents) + purpose-built first-visit window picker.
//
// DESIGN BAR: header strip ≤48px · labels 11px semibold uppercase 12% tracking
// · body 13px · numerics 12px mono tabular right · panels rounded-lg with 36px
// header strips · motion marks state changes only.

export type ClinicIntakeProps = {
  patient?: string
  clinic?: string
  onSubmitIntake?: (data: Record<string, string>) => void
  className?: string
}

const STEPS: Step[] = [
  {
    title: "Who you are",
    fields: [
      { key: "name", label: "Legal name", required: true, placeholder: "as on your ID" },
      { key: "personnummer", label: "Personal identity no.", required: true, placeholder: "YYMMDD-XXXX", validate: (v) => (/^\d{6}-\d{4}$/.test(v.trim()) ? null : "Use the YYMMDD-XXXX format") },
      { key: "phone", label: "Mobile", required: true, placeholder: "for reminders", validate: (v) => (/^\+?[\d\s-]{7,}$/.test(v.trim()) ? null : "Enter a reachable phone number") },
    ],
  },
  {
    title: "Why you are here",
    fields: [
      { key: "reason", label: "Main reason", type: "textarea", required: true, placeholder: "symptoms, duration, what you have tried", validate: (v) => (v.trim().length < 12 ? "Give the nurse a little more to work with" : null) },
      { key: "gp", label: "Referring GP / clinic", placeholder: "leave blank if none" },
    ],
  },
  {
    title: "Medical history",
    fields: [
      { key: "medication", label: "Current medication", placeholder: "name and dose, or 'none'" },
      { key: "allergies", label: "Allergies", required: true, placeholder: "drug, food, latex…", validate: (v, d) => (d.medication && !v.trim() ? "State 'none known' if you have no allergies" : null) },
    ],
  },
]

const INITIAL_FILES: UploadFile[] = [
  { id: "f1", name: "referral-letter.pdf", size: 214_000, status: "done", progress: 100 },
  { id: "f2", name: "id-scan-front.jpg", size: 1_820_000, status: "uploading", progress: 42 },
  { id: "f3", name: "insurance-card.pdf", size: 640_000, status: "error", tries: 2, error: "scanner kiosk unreachable" },
]

const DAYS = [
  { day: "Thu 3", slots: ["08:30", "10:00", null, "13:00", "15:30"] },
  { day: "Fri 4", slots: [null, null, "11:30", "13:00", null] },
  { day: "Mon 7", slots: ["08:30", "10:00", "11:30", null, "15:30"] },
]

const CONSENTS = [
  { id: "c1", label: "Share records with referring GP", required: true },
  { id: "c2", label: "SMS appointment reminders", required: false },
  { id: "c3", label: "Anonymous research registry", required: false },
]

export function ClinicIntake({ patient = "New patient", clinic = "Sundberg Family Health", onSubmitIntake, className }: ClinicIntakeProps) {
  const [files, setFiles] = React.useState<UploadFile[]>(INITIAL_FILES)
  const [day, setDay] = React.useState<string | null>(null)
  const [slot, setSlot] = React.useState<string | null>(null)
  const [consents, setConsents] = React.useState<string[]>([])
  const [note, setNote] = React.useState("")
  const [keyValue, setKeyValue] = React.useState("PT-7F3K-9MQ2-88XW")
  const [rotating, setRotating] = React.useState(false)
  const [submitted, setSubmitted] = React.useState<Record<string, string> | null>(null)
  const timer = React.useRef<number | null>(null)

  React.useEffect(() => {
    timer.current = window.setInterval(() => {
      setFiles((fs) =>
        fs.map((f) => {
          if (f.status !== "uploading") return f
          const next = Math.min(100, (f.progress ?? 0) + 9)
          return next >= 100 ? { ...f, progress: 100, status: "done" } : { ...f, progress: next }
        }),
      )
    }, 500)
    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
  }, [])

  const rotate = () => {
    if (rotating) return
    setRotating(true)
    window.setTimeout(() => {
      const chunk = () => Math.random().toString(36).slice(2, 6).toUpperCase()
      setKeyValue(`PT-${chunk()}-${chunk()}-${chunk()}`)
      setRotating(false)
    }, 1100)
  }

  const addScan = () => setFiles((fs) => [...fs, { id: "f" + Date.now(), name: "insurance-card-retry.pdf", size: 655_000, status: "uploading", progress: 0 }])

  const allRequired = CONSENTS.filter((c) => c.required).every((c) => consents.includes(c.id))
  const intakeReady = Boolean(day && slot) && allRequired

  return (
    <div className={cn("relative isolate flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <Grain opacity={0.03} />

      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Patient intake</h2>
        <span className="text-[12px] text-muted-foreground">{clinic}</span>
        <span className="text-[12px] text-muted-foreground">· {patient}</span>
        <span className={cn("ml-2 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold", intakeReady ? "border-[hsl(var(--ok)/0.4)] text-[hsl(var(--ok))]" : "text-muted-foreground")}>
          {intakeReady ? "ready to book" : "incomplete"}
        </span>
        <button onClick={addScan} className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"><FilePlus2 className="size-3.5" /> Scan document</button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_330px]">
        {/* questionnaire */}
        <section className="min-h-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Questionnaire · 3 steps</span>
            <ClipboardList className="size-3.5 text-muted-foreground" />
          </header>
          <div className="p-4">
            {submitted ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <p className="text-[13px] font-bold">Intake received — {submitted.name ?? "patient"}</p>
                <p className="text-[12px] text-muted-foreground">A nurse reviews answers before your {day} {slot} window. You will get an SMS to {submitted.phone ?? "your mobile"}.</p>
                <div className="rounded-md border bg-muted/30 p-3 font-mono text-[11px] leading-relaxed">
                  {Object.entries(submitted).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="truncate">{v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <StepperForm
                steps={STEPS}
                submitLabel="Submit intake"
                onSubmit={(data) => {
                  setSubmitted(data)
                  onSubmitIntake?.(data)
                }}
              />
            )}
          </div>
        </section>

        {/* right rail */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">First-visit window</span>
              <CalendarCheck className="size-3.5 text-muted-foreground" />
            </header>
            <div className="grid gap-2 p-3">
              {DAYS.map((d) => (
                <div key={d.day}>
                  <MonoLabel tick={false} className="mb-1 block text-[10px] text-muted-foreground">{d.day}</MonoLabel>
                  <div className="flex flex-wrap gap-1">
                    {d.slots.map((s, i) => (
                      <button
                        key={i}
                        disabled={!s}
                        onClick={() => { setDay(d.day); setSlot(s) }}
                        className={cn(
                          "h-7 rounded border px-2 font-mono text-[11px] tabular-nums transition-colors",
                          !s && "cursor-not-allowed border-dashed text-muted-foreground/40 line-through",
                          s && day === d.day && slot === s ? "border-primary bg-accent text-accent-foreground" : s && "hover:bg-muted/60",
                        )}
                      >
                        {s ?? "taken"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <p className="border-t pt-2 text-[11px] text-muted-foreground">{day && slot ? <>Held for you: <span className="font-semibold text-foreground">{day} · {slot}</span> — 20 min with the practice nurse.</> : "Pick a day, then a slot. Slots are held for 15 minutes."}</p>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Documents</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{files.filter((f) => f.status === "done").length}/{files.length} done</span>
            </header>
            <div className="p-3">
              <UploadQueue files={files} onRetry={(id) => setFiles((fs) => fs.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 0, error: undefined } : f)))} onRemove={(id) => setFiles((fs) => fs.filter((f) => f.id !== id))} />
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Record key & consents</span>
              <KeyRound className="size-3.5 text-muted-foreground" />
            </header>
            <div className="space-y-3 p-3">
              <CopySecretField value={keyValue} onRotate={rotate} rotating={rotating} label="record key" mono />
              <div className="grid gap-1.5">
                {CONSENTS.map((c) => (
                  <label key={c.id} className="flex items-start gap-2 text-[12px] leading-snug">
                    <Checkbox
                      className="mt-0.5"
                      checked={consents.includes(c.id)}
                      onCheckedChange={(v: boolean) => setConsents((cs) => (v ? [...cs, c.id] : cs.filter((x) => x !== c.id)))}
                      aria-label={c.label}
                    />
                    <span>
                      {c.label}
                      {c.required && <span className="ml-1 text-[10px] font-bold uppercase text-[hsl(var(--err))]">required</span>}
                    </span>
                  </label>
                ))}
              </div>
              <AnimatePresence>
                {!allRequired && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[11px] text-[hsl(var(--warn))]">The GP-share consent is required before booking.</motion.p>
                )}
              </AnimatePresence>
              <div className="space-y-1.5 border-t pt-3">
                <Label htmlFor="reception-note" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Note to reception</Label>
                <Input id="reception-note" value={note} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNote(e.target.value)} placeholder="access needs, interpreter…" className="h-8 text-[12px]" />
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
