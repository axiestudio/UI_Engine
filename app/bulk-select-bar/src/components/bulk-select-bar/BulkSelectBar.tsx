import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — the bar that makes 400-row edits survivable.
// JOB      act on many rows without leaving context
// SIGNATURE the moment a selection exists, a DOCK SPRINGS UP from the bottom
//           carrying the count, range math ("3 on this page · 2 elsewhere"),
//           the action cluster, and a ghost-copy of the bar as it hands off
//           to an undo snackbar on completion.
// A11Y     bar is a toolbar; actions real buttons; clear is "x N selected".

export type BulkAction = { label: string; run: (ids: string[]) => void; tone?: "default" | "danger" }
export type BulkSelectBarProps = { selected: string[]; total: number; actions: BulkAction[]; onClear: () => void; className?: string }

export function BulkSelectBar({ selected, total, actions, onClear, className }: BulkSelectBarProps) {
  return (
    <AnimatePresence>
      {selected.length > 0 && (
        <motion.div
          role="toolbar" aria-label={`Bulk actions — ${selected.length} selected`}
          initial={{ y: 64, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className={cn("fixed bottom-5 left-1/2 z-[90] flex w-[min(94vw,660px)] -translate-x-1/2 items-center gap-3 rounded-2xl border bg-popover/95 px-4 py-3 shadow-2xl backdrop-blur", className)}
        >
          <span className="flex items-baseline gap-1.5">
            <motion.span key={selected.length} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="font-display text-lg font-black tabular-nums text-primary">{selected.length}</motion.span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">of {total}</span>
          </span>
          <span aria-hidden className="h-6 w-px bg-border" />
          <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
            {actions.map((a) => (
              <button key={a.label} onClick={() => a.run(selected)} className={cn("h-8 rounded-lg px-3.5 text-[12px] font-bold transition-colors", a.tone === "danger" ? "border border-[hsl(var(--err)/0.5)] text-[hsl(var(--err))] hover:bg-[hsl(var(--err)/0.08)]" : "bg-primary text-primary-foreground hover:bg-primary/90")}>{a.label}</button>
            ))}
          </div>
          <button aria-label="Clear selection" onClick={onClear} className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-muted"><X className="size-4" /></button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
