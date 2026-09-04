import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { CheckCircle2, CircleDashed, Loader2, ScrollText, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — CI made glanceable at 3am.
// JOB      follow a multi-stage run without opening four tabs
// SIGNATURE a horizontal node strip (queued → running spinner → pass/fail)
//           with a progress RAIL that lights between stages; a failed node
//           pulses a ring; clicking any node slides the log drawer for THAT
//           stage and auto-tails new lines (scroll-locked).
// API      stages [{id,label,status,duration?,log?}], openLog handled inside.
// A11Y     status is text in aria; stage buttons labelled; log region polite.

export type Stage = { id: string; label: string; status: "idle" | "queued" | "running" | "pass" | "fail" | "skip"; duration?: string; log?: string[] }
export type PipelineRunGraphProps = { run?: string; stages: Stage[]; onRerunFailed?: () => void; className?: string }

const IC = { idle: CircleDashed, queued: CircleDashed, running: Loader2, pass: CheckCircle2, fail: XCircle, skip: CircleDashed } as const

export function PipelineRunGraph({ run, stages, onRerunFailed, className }: PipelineRunGraphProps) {
  const [log, setLog] = React.useState<Stage | null>(null)
  const logBox = React.useRef<HTMLPreElement>(null)
  React.useEffect(() => { logBox.current?.scrollTo(0, logBox.current.scrollHeight) }, [log?.log?.length])
  const failed = stages.some((s) => s.status === "fail")
  return (
    <div className={cn("relative isolate w-full overflow-hidden rounded-xl border border-border/70 bg-card p-4 shadow-sm", className)}>
      <MotionConfig reducedMotion="user">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <span className="font-semibold">{run ? `RUN ${run}` : "RUN"}</span>
        <span aria-hidden className="flex items-center gap-0.5">{stages.map((s) => <span key={s.id} className={cn("h-2 w-6 rounded-sm", s.status === "pass" ? "bg-[hsl(var(--ok))]" : s.status === "running" ? "bg-[hsl(var(--info))] motion-safe:motion-safe:motion-safe:animate-pulse" : s.status === "fail" ? "bg-[hsl(var(--err))]" : s.status === "skip" ? "bg-muted" : "bg-border")} />)}</span>
        {failed && onRerunFailed && <Button type="button" variant="ghost" onClick={onRerunFailed} className="ml-auto rounded-full border border-[hsl(var(--err)/0.5)] px-3 py-1 text-xs font-medium text-[hsl(var(--err))] hover:bg-[hsl(var(--err)/0.08)]">rerun failed</Button>}
          
    </div>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
        {stages.map((s, i) => { const I = IC[s.status]; return (
          <li key={s.id} className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={() => setLog(s)} aria-label={`${s.label}: ${s.status}`} className={cn("group flex items-center gap-2 rounded-full border border-border/70 px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted/50", s.status === "running" && "border-[hsl(var(--info)/0.6)] bg-[hsl(var(--info)/0.08)]", s.status === "pass" && "border-[hsl(var(--ok)/0.5)]", s.status === "fail" && "border-[hsl(var(--err))]")}
            >
              <I aria-hidden className={cn("size-4", s.status === "running" && "motion-safe:motion-safe:motion-safe:animate-spin", s.status === "pass" && "text-[hsl(var(--ok))]", s.status === "fail" && "text-[hsl(var(--err))]")} />
              {s.label}
              {s.duration && <span className="font-mono text-[10px] font-medium text-muted-foreground">{s.duration}</span>}
            </Button>
            {i < stages.length - 1 && <motion.span aria-hidden className="h-px w-5 bg-border" animate={{ background: s.status === "pass" ? "hsl(var(--ok))" : "hsl(var(--border))" }} />}
          </li>
        )})}
      </ol>
      <AnimatePresence>
        {log && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><ScrollText className="size-3.5" /> {log.label} <span className="font-mono text-[10px] font-medium normal-case text-muted-foreground">{log.status}</span><Button type="button" variant="ghost" className="ml-auto text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => setLog(null)}>close ✕</Button></div>
            <pre ref={logBox} className="mt-2 max-h-52 overflow-y-auto rounded-lg bg-muted/40 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground" aria-label="Stage log">{(log.log ?? []).join("\n")}</pre>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="sr-only" aria-live="polite">{stages.map((s) => `${s.label} ${s.status}`).join(", ")}</p>
          </MotionConfig>
    </div>
  )
}
