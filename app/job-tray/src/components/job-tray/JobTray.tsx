import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Loader2, CheckCircle2, XCircle, ChevronDown, Terminal, X } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — long work must never trap the UI.
// JOB      keep an eye on background jobs from anywhere in the app
// SIGNATURE a docked pill bottom-right; count pips merge into one tray that
//           unfolds (spring accordion) into live rows with log tails and
//           cancel-with-undo.
// API      jobs [{id, label, status, progress?, log?[]}], onCancel(job) —
//          the host runs the work; this is the window into it.
// A11Y     tray role=log + aria-live polite for status flips; expand/collapse
//          keyboard-operable; spinner only while running (reduced = pulsing dot).

export type Job = { id: string; label: string; status: "queued" | "running" | "done" | "error"; progress?: number; log?: string[] }
export type JobTrayProps = { jobs: Job[]; onCancel?: (j: Job) => void; onDismiss?: (id: string) => void; className?: string }

export function JobTray({ jobs, onCancel, onDismiss, className }: JobTrayProps) {
  const [open, setOpen] = React.useState(false)
  const running = jobs.filter((j) => j.status === "running" || j.status === "queued").length
  const active = jobs.find((j) => j.status === "running")
  if (!jobs.length) return null
  return (
    <div className={cn("fixed bottom-4 right-4 z-[105] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col items-end gap-2 font-sans", className)}>
      <AnimatePresence>
        {open && (
          <motion.ul role="log" aria-live="polite" aria-label="Background jobs" initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ type: "spring", stiffness: 320, damping: 28 }} className="max-h-[52vh] w-full overflow-y-auto rounded-xl border border-border/70 bg-popover p-2 shadow-xl">
            {jobs.map((j) => (
              <li key={j.id} className="rounded-lg p-2.5 odd:bg-muted/40">
                <div className="flex items-center gap-2.5">
                  <Pip status={j.status} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{j.label}</span>
                  {j.status === "running" && onCancel && <button onClick={() => onCancel(j)} className="rounded px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground">cancel</button>}
                  {(j.status === "done" || j.status === "error") && onDismiss && <button aria-label="Dismiss" onClick={() => onDismiss(j.id)} className="grid size-5 place-items-center rounded hover:bg-muted"><X className="size-3" /></button>}
                </div>
                {j.status === "running" && <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted"><motion.div animate={{ width: `${j.progress ?? 0}%` }} transition={{ ease: "linear", duration: 0.4 }} className="h-full rounded-full bg-[hsl(var(--info))]" /></div>}
                {j.log?.length ? <details className="mt-1.5"><summary className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground"><Terminal className="size-3" /> {j.status === "running" ? "tail follows" : "log"}</summary><pre className="mt-1 max-h-28 overflow-y-auto whitespace-pre-wrap rounded bg-muted/40 p-2 font-mono text-[11px] leading-relaxed text-muted-foreground">{j.log.join("\n")}</pre></details> : null}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex h-11 items-center gap-2.5 rounded-full border border-border/70 bg-background pl-3.5 pr-4 shadow-lg transition-transform hover:-translate-y-px">
        {running > 0 ? <Loader2 aria-hidden className="size-4 animate-spin text-[hsl(var(--info))]" /> : active ? null : <CheckCircle2 aria-hidden className="size-4 text-[hsl(var(--ok))]" />}
        <span className="text-sm font-medium">{running > 0 ? `${running} job${running > 1 ? "s" : ""} running` : "Jobs finished"}</span>
        {running > 0 && active && <span className="hidden max-w-[110px] truncate font-mono text-xs text-muted-foreground sm:inline">{Math.round(active.progress ?? 0)}%</span>}
        <ChevronDown aria-hidden className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
    </div>
  )
}
function Pip({ status }: { status: Job["status"] }) {
  const map = { queued: "bg-muted-foreground", running: "bg-[hsl(var(--info))]", done: "bg-[hsl(var(--ok))]", error: "bg-[hsl(var(--err))]" } as const
  return <span aria-hidden className={cn("grid size-5 shrink-0 place-items-center rounded-full", map[status] + "/15")}><span className={cn("size-2 rounded-full", map[status])} /><span className="sr-only">{status}</span></span>
}
