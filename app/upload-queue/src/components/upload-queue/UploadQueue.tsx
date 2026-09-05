import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { Check, FileArchive, FileImage, FileText, Loader2, RotateCw, X } from "lucide-react"
import { toast, Toaster } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — uploads with receipts, not vibes.
// JOB      move files and know exactly what happened
// SIGNATURE per-file progress RINGS (stroke-dasharray springs); done files
//           morph ring→check with a settle; failures expose a retry chip that
//           shows next backoff ("retry in 8s"); the footer sums bytes + eta.
//           RINGS stay in-layout (persistent state); transient news is Sonner:
//           every done/error transition fires a preset-scoped toast and Retry
//           rides a real toast.promise lifecycle resolved off the queue state.
// API      files [{id,name,size,status,progress?,tries?,error?}] — host runs
//          the transfer; onRetry(id), onRemove(id).
// A11Y     role=list; each row status in text; ring aria-hidden.

export type UploadFile = { id: string; name: string; size: number; status: "waiting" | "uploading" | "done" | "error"; progress?: number; tries?: number; error?: string }
export type UploadQueueProps = { files: UploadFile[]; onRetry?: (id: string) => void; onRemove?: (id: string) => void; className?: string }

const TOASTER_ID = "upload-queue"
const human = (b: number) => b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB"
const iconFor = (n: string) => /(\.png|\.jpe?g|\.webp|\.gif)$/i.test(n) ? FileImage : /(\.zip|\.tar)/i.test(n) ? FileArchive : FileText
const tid = (id: string) => `uq-${id}`

export function UploadQueue({ files, onRetry, onRemove, className }: UploadQueueProps) {
  const filesRef = React.useRef(files)
  filesRef.current = files
  const lastStatus = React.useRef<Record<string, UploadFile["status"]> | null>(null)
  const retrying = React.useRef(new Set<string>())
  const summaryFired = React.useRef(false)

  // Retry hands off to the host, then watches the real queue state until the
  // item lands — a genuine promise lifecycle without owning the transport.
  const retry = (f: UploadFile) => {
    if (!onRetry) return
    retrying.current.add(f.id)
    const started = Date.now()
    onRetry(f.id)
    toast.promise(
      new Promise<void>((resolve, reject) => {
        const iv = setInterval(() => {
          const cur = filesRef.current.find((x) => x.id === f.id)
          if (!cur) { clearInterval(iv); reject(new Error("dropped from the queue")) }
          else if (cur.status === "done") { clearInterval(iv); resolve() }
          else if (cur.status === "error" && Date.now() - started > 1500) { clearInterval(iv); reject(new Error(cur.error ?? "failed again")) }
        }, 250)
      }),
      {
        id: tid(f.id),
        loading: `Retrying ${f.name}…`,
        success: `${f.name} uploaded`,
        error: (e: unknown) => `${f.name} failed — ${e instanceof Error ? e.message : "retry didn't take"}`,
        duration: 4000,
        toasterId: TOASTER_ID,
        finally: () => { retrying.current.delete(f.id) },
      },
    )
  }

  // Every host-driven done/error transition gets its receipt toast — nothing
  // flashes bespoke anymore. First render only seeds the diff map.
  React.useEffect(() => {
    const prev = lastStatus.current
    lastStatus.current = Object.fromEntries(files.map((f) => [f.id, f.status]))
    if (!prev) return
    for (const id of Object.keys(prev)) {
      if (!files.some((f) => f.id === id)) { toast.dismiss(tid(id)); retrying.current.delete(id) }
    }
    for (const f of files) {
      const before = prev[f.id]
      if (!before || before === f.status || retrying.current.has(f.id)) continue
      if (f.status === "done") toast.success(`${f.name} uploaded`, { id: tid(f.id), description: human(f.size), duration: 4000, toasterId: TOASTER_ID })
      else if (f.status === "error") toast.error(`${f.name} failed`, {
        id: tid(f.id), description: f.error ?? "transfer failed", duration: 7000, toasterId: TOASTER_ID,
        action: onRetry ? { label: "Retry", onClick: () => retry(f) } : undefined,
      })
    }
    const allDone = files.length > 0 && files.every((f) => f.status === "done")
    if (allDone && !summaryFired.current && files.length > 1) {
      summaryFired.current = true
      toast.success(`All ${files.length} uploads finished`, { description: files.reduce((a, f) => a + f.size, 0).toLocaleString() + " bytes · nothing pending", duration: 5000, toasterId: TOASTER_ID })
    }
  })

  const done = files.filter((f) => f.status === "done")
  const up = files.find((f) => f.status === "uploading")
  return (
    <div className={cn("relative isolate overflow-hidden rounded-xl border border-border/70 bg-card p-3 shadow-sm", className)}>
      <Toaster id={TOASTER_ID} position="top-right" richColors closeButton />
      <MotionConfig reducedMotion="user">
      <ul role="list" className="space-y-1">
        <AnimatePresence initial={false}>
          {files.map((f) => {
            const Icon = iconFor(f.name)
            return (
              <motion.li layout role="listitem" key={f.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.22 }} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg px-2 py-2 hover:bg-muted/40">
                <Ring state={f} />
                <span className="min-w-0 flex-1 basis-36">
                  <span className="flex items-center gap-1.5"><Icon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" /><span className="truncate text-[13px] font-medium">{f.name}</span></span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {f.status === "uploading" && <>{human(f.size)} · {Math.round(f.progress ?? 0)}%</>}
                    {f.status === "waiting" && "queued"}
                    {f.status === "done" && human(f.size) + " · uploaded"}
                    {f.status === "error" && (f.error ?? "failed")}
                  </span>
                </span>
                {f.status === "error" && onRetry && <Button type="button" variant="ghost" onClick={() => retry(f)} className="flex shrink-0 items-center gap-1 rounded-full border border-[hsl(var(--warn)/0.5)] px-2.5 py-1 font-mono text-[11px] font-medium text-[hsl(var(--warn))]"><RotateCw className="size-3" /> retry{(f.tries ?? 1) > 1 ? ` ×${f.tries}` : ""}</Button>}
                {(f.status === "done" || f.status === "error") && onRemove && <Button type="button" variant="ghost" aria-label={`Remove ${f.name}`} onClick={() => onRemove(f.id)} className="grid size-6 shrink-0 place-items-center rounded hover:bg-muted"><X className="size-3.5" /></Button>}
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
      {files.length > 0 && (
        <div aria-live="polite" className="mt-2 flex items-center gap-2 border-t border-border/60 px-2 pt-2 text-xs font-medium text-muted-foreground">
          {up && <Loader2 className="size-3 motion-safe:animate-spin" />}<span>{done.length}/{files.length} done</span>
          {up && <span className="ml-auto tabular-nums">{human(Math.max(0, ...[Math.round(up.size * (1 - (up.progress ?? 0) / 100))]))} remaining</span>}
          
    </div>
      )}
          </MotionConfig>
    </div>
  )
}

function Ring({ state }: { state: UploadFile }) {
  const C = 2 * Math.PI * 12
  const p = state.status === "done" ? 1 : (state.progress ?? 0) / 100
  const col = state.status === "error" ? "hsl(var(--err))" : state.status === "done" ? "hsl(var(--ok))" : "hsl(var(--info))"
  return (
    <span aria-hidden className="relative grid size-[30px] shrink-0 place-items-center">
      <svg viewBox="0 0 28 28" className="size-[30px] -rotate-90"><circle cx="14" cy="14" r="12" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" /><motion.circle cx="14" cy="14" r="12" fill="none" stroke={col} strokeWidth="3" strokeLinecap="round" initial={false} animate={{ strokeDasharray: `${p * C} ${C}` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} /></svg>
      {state.status === "done" ? <motion.span initial={{ scale: 0 }} animate={{ scale: [0, 1.25, 1] }} transition={{ duration: 0.35 }}><Check className="absolute size-3.5 text-[hsl(var(--ok))]" /></motion.span> : state.status === "error" ? <X className="absolute size-3 text-[hsl(var(--err))]" /> : state.status === "waiting" ? <span className="absolute size-1.5 rounded-full bg-muted-foreground" /> : <span className="absolute font-mono text-[8px] font-medium">{Math.round(p * 100)}</span>}
    </span>
  )
}
