import * as React from "react"
import { motion } from "motion/react"
import { Check, GitMerge } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — collisions happen; resolve them with two hands free.
// JOB      settle "incoming vs current" without a terminal
// SIGNATURE each conflict is a card: two candidate columns, keyboard 1/2/3
//           picks Current/Incoming/Both and the card LAUNCHES resolved
//           (spring up + fade) while the counter ticks; a live result pane
//           shows the merged text building hunk by hunk.
// A11Y     radiogroups per hunk; all copy is text.

export type Conflict = { id: string; file: string; current: string; incoming: string }
export type MergeConflictPanelProps = { conflicts: Conflict[]; onResolve: (id: string, choice: "current" | "incoming" | "both", text: string) => void; className?: string }
type Choice = "current" | "incoming" | "both"

export function MergeConflictPanel({ conflicts, onResolve, className }: MergeConflictPanelProps) {
  const [pick, setPick] = React.useState<Record<string, Choice>>({})
  const [done, setDone] = React.useState<Record<string, boolean>>({})
  const choose = (c: Conflict, v: Choice) => {
    setPick((p) => ({ ...p, [c.id]: v }))
    const text = v === "current" ? c.current : v === "incoming" ? c.incoming : c.current + "\n" + c.incoming
    setTimeout(() => { onResolve(c.id, v, text); setDone((d) => ({ ...d, [c.id]: true })) }, 260)
  }
  React.useEffect(() => {
    const k = (e: KeyboardEvent) => { const open = conflicts.find((c) => !done[c.id]); if (!open) return; if (e.key === "1") choose(open, "current"); if (e.key === "2") choose(open, "incoming"); if (e.key === "3") choose(open, "both") }
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k)
  })
  const pending = conflicts.filter((c) => !done[c.id])
  const current = pending[0]
  return (
    <div className={cn("font-sans", className)}>
      <div className="mb-3 flex items-center gap-2 text-[12px] font-bold">
        <GitMerge aria-hidden className="size-4" />
        <span>{conflicts.length - pending.length}/{conflicts.length} conflicts resolved</span>
        <div className="ml-auto h-1 w-24 overflow-hidden rounded-full bg-muted"><motion.div animate={{ width: `${((conflicts.length - pending.length) / conflicts.length) * 100}%` }} className="h-full rounded-full bg-[hsl(var(--ok))]" /></div>
      </div>
      {current && (
        <motion.div layout key={current.id} className="overflow-hidden rounded-xl border bg-card shadow-lg">
          <p className="border-b bg-[hsl(var(--app-code))] px-4 py-2 font-mono text-[11px] font-bold">{current.file}</p>
          <div role="radiogroup" aria-label={`Resolution for ${current.file}`} className="grid gap-px bg-border sm:grid-cols-2">
            {([["current", "Current — 1"], ["incoming", "Incoming — 2"]] as const).map(([v, l]) => (
              <button key={v} role="radio" aria-checked={pick[current.id] === v} onClick={() => choose(current, v)} className={cn("group flex flex-col p-4 text-left text-[13px] transition-colors", pick[current.id] === v ? "bg-accent" : "bg-card hover:bg-muted/40", v === "incoming" && "border-l")}>
                <span className="mb-2 flex items-center justify-between font-mono text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">{l}{pick[current.id] === v && <Check className="size-3.5 text-[hsl(var(--ok))]" />}</span>
                <pre className={cn("whitespace-pre-wrap font-mono text-[12px]", v === "current" && "text-[hsl(var(--err))]", v === "incoming" && "text-[hsl(var(--info))]")}>{current[v]}</pre>
              </button>
            ))}
          </div>
          <div className="flex border-t">
            <button onClick={() => choose(current, "both")} className="flex-1 py-2.5 text-[12px] font-bold hover:bg-muted/40">Keep both — 3</button>
          </div>
        </motion.div>
      )}
      {!current && <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-lg border border-[hsl(var(--ok)/0.4)] bg-[hsl(var(--ok)/0.08)] px-4 py-3 text-[13px] font-bold text-[hsl(var(--ok))]"><Check className="size-4" /> Branch is clean. Ship it.</motion.p>}
    </div>
  )
}
