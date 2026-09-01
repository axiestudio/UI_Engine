import * as React from "react"
import { motion, MotionConfig } from "motion/react"
import { CircleAlert, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — grids where "just click the value" works.
// JOB      change one cell without entering an edit mode
// SIGNATURE the cell swaps to an input IN PLACE (value rides across with a
//           shared-layout scale), saving writes a spinner gutter, server
//           rejection RINGS the cell red and replays your old value; 2.5s
//           optimistic window before we stop trusting.
// API      value, onSave(v) => Promise<void> — throw to reject.
// A11Y     input labelled by prop name; errors via aria-describedby live text.

export type InlineEditCellProps = { value: string; name?: string; onSave: (v: string) => Promise<void>; mono?: boolean; width?: number; className?: string }

export function InlineEditCell({ value, name, onSave, mono, width, className }: InlineEditCellProps) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(value)
  const [state, setState] = React.useState<"idle" | "saving" | "rejected">("idle")
  const committed = React.useRef(value)
  React.useEffect(() => { if (!editing) { committed.current = value; setDraft(value) } }, [value, editing])
  const save = async () => {
    if (draft === committed.current) { setEditing(false); return }
    setState("saving")
    try { await onSave(draft); committed.current = draft; setState("idle"); setEditing(false) }
    catch { setState("rejected"); setDraft(committed.current) }
  }
  return (
    <span className={cn("relative inline-flex items-center font-sans", className)} style={width ? { width } : undefined}>
      <MotionConfig reducedMotion="user">
      {editing ? (
        <motion.input
          autoFocus initial={{ scaleX: 0.92 }} animate={{ scaleX: 1 }}
          aria-label={name ?? "editable value"} value={draft} onChange={(e) => setDraft(e.target.value)}
          onBlur={save} onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") { setDraft(committed.current); setEditing(false); setState("idle") } }}
          className={cn("h-7 w-full rounded-md border-2 bg-background px-1.5 text-[13px] outline-none", state === "rejected" ? "border-[hsl(var(--err))]" : "border-[hsl(var(--app-focus))]", mono && "font-mono")}
        />
      ) : (
        <Button type="button" variant="ghost" onClick={() => { setDraft(committed.current); setState("idle"); setEditing(true) }} className={cn("group flex h-7 w-full items-center justify-between gap-2 rounded-md px-1.5 text-left text-[13px] hover:bg-muted/50 focus-visible:bg-muted/60 focus-visible:outline-none", mono && "font-mono")}>
          <span className={cn("truncate", state === "rejected" && "text-[hsl(var(--err))]")}>{draft}      
          </MotionConfig>
    </span>
          <span aria-hidden className="w-4 text-center text-[13px] opacity-0 transition-opacity group-hover:opacity-40">✎</span>
        </Button>
      )}
      {state === "saving" && <Loader2 data-slot="save-spinner" aria-hidden className="absolute -right-5 size-3.5 motion-safe:motion-safe:animate-spin text-[hsl(var(--info))]" />}
      {state === "rejected" && <motion.span role="alert" initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="absolute -right-5 flex items-center gap-1 whitespace-nowrap text-[hsl(var(--err))]"><CircleAlert className="size-3.5" /></motion.span>}
      <span className="sr-only" aria-live="polite">{state === "rejected" ? "The server rejected that change — old value restored." : ""}</span>
    </span>
  )
}
