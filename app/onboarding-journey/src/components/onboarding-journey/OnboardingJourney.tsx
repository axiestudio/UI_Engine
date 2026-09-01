import { useEffect, useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { CloudUpload, Compass, FileCheck, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { StepperForm, type Step } from "stepper-form"
import { UploadQueue, type UploadFile } from "upload-queue"
import { ProductTourSpotlight, type TourStep } from "product-tour-spotlight"
import { MentionTextarea } from "mention-textarea"
import { ToastStack, type Toast } from "toast-stack"

// COMPOSITE SCREEN · NEW-HIRE ONBOARDING
// composed of: stepper-form (validated wizard), upload-queue (document drop),
// product-tour-spotlight (live-app guided tour), mention-textarea (buddy note)
// + purpose-built document checklist with completion rings.
//
// DESIGN BAR: header strip ≤48px · label 11px semibold uppercase 12% tracking
// · body 13px · numerics 12px tabular right-aligned · panels rounded-lg
// bordered with a 36px header strip · functional copy only · motion marks
// state changes, never decorates.

export type RequiredDoc = { id: string; name: string; fileName: string; size: number }

export type OnboardingJourneyProps = {
  hire?: string
  role?: string
  buddy?: string
  className?: string
}

const DEFAULT_DOCS: RequiredDoc[] = [
  { id: "id", name: "Passport / ID", fileName: "id-scan.pdf", size: 1_820_000 },
  { id: "tax", name: "Tax declaration", fileName: "skatteform-2026.pdf", size: 240_000 },
  { id: "nda", name: "NDA", fileName: "nda-signed.pdf", size: 96_000 },
  { id: "bank", name: "Bank details", fileName: "bank-details.pdf", size: 58_000 },
]

const INITIAL_FILES: UploadFile[] = [
  { id: "id", name: "id-scan.pdf", size: 1_820_000, status: "done", progress: 100 },
  { id: "tax", name: "skatteform-2026.pdf", size: 240_000, status: "uploading", progress: 62 },
  { id: "nda", name: "nda-signed.pdf", size: 96_000, status: "waiting", progress: 0 },
]

const WIZARD_STEPS: Step[] = [
  {
    title: "Personal details",
    fields: [
      { key: "fullName", label: "Full legal name", type: "text", required: true, placeholder: "e.g. Dana Kowalski", validate: (v: string) => (v.trim().length >= 3 ? null : "Enter the name as it appears on the ID") },
      { key: "startDate", label: "Start date", type: "text", required: true, placeholder: "2026-09-01", validate: (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v.trim()) ? null : "Use the YYYY-MM-DD format") },
    ],
  },
  {
    title: "Equipment",
    fields: [
      { key: "laptop", label: "Laptop model", type: "text", required: true, placeholder: "macbook-pro-14-m4", validate: (v: string) => (/^[a-z0-9-]+$/.test(v.trim()) ? null : "Use the asset-tag slug, lowercase with dashes") },
      { key: "monitor", label: "External monitor serial", type: "text", placeholder: "optional" },
    ],
  },
  {
    title: "Access",
    fields: [
      { key: "email", label: "Email prefix", type: "text", required: true, placeholder: "d.kowalski", validate: (v: string) => (/^[a-z0-9.]+$/.test(v.trim()) ? null : "Lowercase letters, digits and dots only") },
      { key: "badgeZone", label: "Badge zone", type: "text", required: true, placeholder: "office-floor-3", validate: (v: string) => (["office-floor-2", "office-floor-3", "office-floor-4", "lab"].includes(v.trim()) ? null : "Pick a valid zone: office-floor-2/3/4 or lab") },
    ],
  },
]

const TOUR_STEPS: TourStep[] = [
  { selector: '[data-tour="wizard"]', title: "Step 1 · Wizard", body: "Every field validates before the next step unlocks. Blocked fields explain themselves in red." },
  { selector: '[data-tour="docs"]', title: "Step 2 · Documents", body: "Rings show per-document completeness. The queue retries failed uploads automatically." },
  { selector: '[data-tour="notes"]', title: "Step 3 · Buddy note", body: "The hire can ping their buddy with @mentions any time during the first week." },
]

const BUDDIES = [
  { id: "b1", label: "@jonas.e", sub: "buddy · platform" },
  { id: "b2", label: "@priya.r", sub: "onboarding lead" },
  { id: "b3", label: "@hr-desk", sub: "people ops" },
]

function Ring({ pct, tone }: { pct: number; tone: string }) {
  const r = 13
  const c = 2 * Math.PI * r
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" className="shrink-0 -rotate-90">
      <MotionConfig reducedMotion="user">
      <circle cx="16" cy="16" r={r} fill="none" strokeWidth="3" className="stroke-muted" />
      <circle
        cx="16"
        cy="16"
        r={r}
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className={cn("transition-[stroke-dashoffset]", tone)}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
      />
          
          </MotionConfig>
    </svg>
  )
}

export function OnboardingJourney({ hire = "Dana Kowalski", role = "Frontend engineer", buddy = "@jonas.e", className }: OnboardingJourneyProps) {
  const [files, setFiles] = useState<UploadFile[]>(INITIAL_FILES)
  const [done, setDone] = useState(false)
  const [note, setNote] = useState("")
  const [tourStep, setTourStep] = useState<number | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = (title: string, tone: Toast["tone"] = "ok") =>
    setToasts((t: Toast[]) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])

  // advance upload progress so the rings describe real queue state
  useEffect(() => {
    const tick = window.setInterval(() => {
      setFiles((fs: UploadFile[]) => {
        if (!fs.some((f: UploadFile) => f.status === "uploading" || f.status === "waiting")) return fs
        return fs.map((f: UploadFile) => {
          if (f.status === "waiting") return { ...f, status: "uploading", progress: 1 }
          if (f.status !== "uploading") return f
          const next = Math.min(100, (f.progress ?? 0) + 7)
          return next >= 100 ? { ...f, progress: 100, status: "done" } : { ...f, progress: next }
        })
      })
    }, 420)
    return () => window.clearInterval(tick)
  }, [])

  const docPct = (id: string) => files.find((f: UploadFile) => f.id === id)?.progress ?? 0
  const complete = files.filter((f: UploadFile) => f.status === "done").length

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      {/* screen header */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Onboarding</h2>
        <span className="text-[12px] text-muted-foreground">{hire}</span>
        <span className="text-[12px] text-muted-foreground">· {role} · buddy {buddy}</span>
        <div className="ml-auto flex gap-2">
          <span className="flex h-8 items-center rounded-md border bg-muted/40 px-3 font-mono text-[12px] tabular-nums text-muted-foreground">
            {complete}/{DEFAULT_DOCS.length} docs
          </span>
          <Button type="button" variant="ghost"
            onClick={() => setTourStep(0)}
            className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"
          >
            <Compass className="size-3.5" /> Run guided tour
          </Button>
    </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 xl:grid-cols-[360px_minmax(0,1fr)_320px]">
        {/* wizard */}
        <section data-tour="wizard" className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Wizard · 3 validated steps</span>
          </header>
          <div className="p-3">
            <StepperForm
              steps={WIZARD_STEPS}
              submitLabel="File onboarding packet"
              onSubmit={(data: Record<string, string>) => {
                setDone(true)
                push(`Packet filed · ${data.fullName ?? hire} starts ${data.startDate ?? "—"} · badge zone ${data.badgeZone ?? "—"}`, "ok")
              }}
            />
          </div>
        </section>

        {/* documents with rings + drop-box */}
        <div data-tour="docs" className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Documents</span>
              <span className="text-[11px] text-muted-foreground">ring = upload completeness</span>
            </header>
            <ul className="divide-y divide-border">
              {DEFAULT_DOCS.map((d: RequiredDoc) => {
                const pct = docPct(d.id)
                const uploading = pct > 0 && pct < 100
                return (
                  <li key={d.id} className="flex items-center gap-3 px-3 py-2">
                    <div className="relative grid place-items-center">
                      <Ring pct={pct} tone={pct >= 100 ? "stroke-[hsl(var(--ok))]" : uploading ? "stroke-[hsl(var(--info))]" : "stroke-muted-foreground/30"} />
                      {pct >= 100 ? (
                        <FileCheck className="absolute size-3.5 text-[hsl(var(--ok))]" />
                      ) : (
                        <span className="absolute font-mono text-[8px] font-bold tabular-nums text-muted-foreground">{pct}</span>
                      )}
                    </div>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-semibold">{d.name}</span>
                      <span className="block truncate font-mono text-[11px] text-muted-foreground">{d.fileName} · {(d.size / 1000).toFixed(0)} kB</span>
                    </span>
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase", pct >= 100 ? "bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))]" : uploading ? "bg-[hsl(var(--info)/0.1)] text-[hsl(var(--info))]" : "bg-muted text-muted-foreground")}>
                      {pct >= 100 ? "filed" : uploading ? "uploading" : "missing"}
                    </span>
                  </li>
                )
              })}
            </ul>
            <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">HR cannot file the packet until all four rings are green.</div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-2 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <CloudUpload className="size-3.5" /> Drop-box
            </header>
            <div className="p-3">
              <UploadQueue
                files={files}
                onRetry={(id: string) => {
                  setFiles((fs: UploadFile[]) => fs.map((f: UploadFile) => (f.id === id ? { ...f, status: "uploading", progress: 0, error: undefined } : f)))
                  push("Retrying upload from the first byte")
                }}
                onRemove={(id: string) => setFiles((fs: UploadFile[]) => fs.filter((f: UploadFile) => f.id !== id))}
              />
            </div>
          </section>
        </div>

        {/* buddy note */}
        <aside data-tour="notes" className="flex min-w-0 flex-col gap-4">
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Buddy note</span>
              <span className="text-[11px] text-muted-foreground">@ to mention</span>
            </header>
            <div className="flex min-h-0 flex-1 flex-col p-3">
              <MentionTextarea
                value={note}
                onChange={(v: string) => setNote(v)}
                mentions={BUDDIES}
                max={480}
                placeholder={`${buddy.split("@")[1] ?? "buddy"} — I land on the 1st, could we walk the deploy checklist on day one?`}
                onSubmit={() => push(`Note sent to ${buddy}`, "ok")}
              />
              <Button type="button" variant="ghost"
                onClick={() => note.trim() && push(`Note sent to ${buddy}`, "ok")}
                disabled={!note.trim()}
                className="mt-3 flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-[hsl(var(--info))] text-[12px] font-bold uppercase tracking-[0.12em] text-white hover:bg-[hsl(var(--info)/0.9)] disabled:opacity-40"
              >
                <Send className="size-3.5" /> Send note
              </Button>
            </div>
          </section>
          <AnimatePresence>
            {done && (
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="overflow-hidden rounded-lg border border-[hsl(var(--ok)/0.5)] bg-[hsl(var(--ok)/0.06)]"
              >
                <header className="flex h-9 items-center border-b border-[hsl(var(--ok)/0.3)] px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--ok))]">Packet filed</header>
                <p className="p-3 text-[12px] text-muted-foreground">
                  IT provisioning and the payroll file were triggered. The guided tour unlocks for the hire the first time they open the live app.
                </p>
              </motion.section>
            )}
          </AnimatePresence>
        </aside>
      </div>

      {tourStep !== null && (
        <ProductTourSpotlight
          steps={TOUR_STEPS}
          step={tourStep}
          onStep={(i: number) => setTourStep(i)}
          onExit={() => setTourStep(null)}
        />
      )}
      <ToastStack toasts={toasts} onDismiss={(id: string) => setToasts((t: Toast[]) => t.filter((x: Toast) => x.id !== id))} pos="br" />
    </div>
  )
}
