import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Check, Sparkles, Undo2, X } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — "AI proposed 6 changes" done HONESTLY.
// JOB      accept a machine edit hungrily — or hungrily, in pieces
// SIGNATURE the header carries overall accept/reject; each hunk card accepts
//           INDIVIDUALLY: accepted hunks fold their diff away and stamp ✓
//           while the header count climbs; rejected cards slide out left with
//           a 4s undo window that re-parks them pending.
// A11Y     every control is a real button; counts in a polite live region.

export type Hunk = { id: string; file: string; title: string; from: string; to: string }
export type AiChangeReviewProps = { hunks: Hunk[]; onAccept: (id: string) => void; onReject?: (id: string) => void; className?: string }

type HState = "pending" | "in" | "out"

export function AiChangeReview({ hunks, onAccept, onReject, className }: AiChangeReviewProps) {
  const [state, setState] = React.useState<Record<string, HState>>({})
  const st = (id: string): HState => state[id] ?? "pending"
  const accept = (id: string) => { setState((s) => ({ ...s, [id]: "in" })); onAccept(id) }
  const reject = (id: string) => {
    setState((s) => ({ ...s, [id]: "out" }))
    onReject?.(id)
    setTimeout(() => setState((s) => (s[id] === "out" ? { ...s, [id]: "pending" } : s)), 4000)
  }
  const pend = hunks.filter((h) => st(h.id) === "pending")
  const ins = hunks.filter((h) => st(h.id) === "in").length
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card font-sans", className)}>
      <header className="flex items-center gap-2 border-b bg-[hsl(var(--pinned)/0.07)] px-4 py-3">
        <Sparkles aria-hidden className="size-4 text-[hsl(var(--pinned))]" />
        <p className="text-[12px] font-bold">
          Agent proposed {hunks.length} changes <span className="font-mono text-[10px] text-muted-foreground">{ins}/{hunks.length} accepted</span>
        </p>
        <div className="ml-auto flex gap-1.5">
          <button disabled={!pend.length} onClick={() => pend.forEach((h) => accept(h.id))} className="h-7 rounded-md bg-[hsl(var(--ok))] px-3 text-[10px] font-black uppercase tracking-[0.1em] text-white disabled:opacity-40">Accept all</button>
          <button disabled={!pend.length && !ins} onClick={() => setState(Object.fromEntries(hunks.map((h) => [h.id, st(h.id) === "in" ? st(h.id) : "out"])))} className="h-7 rounded-md border px-3 text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground hover:bg-muted disabled:opacity-40">Dismiss rest</button>
        </div>
      </header>
      <AnimatePresence initial={false}>
        {hunks.map((h) => {
          const v = st(h.id)
          return (
            <motion.div key={h.id} layout initial={false} animate={v === "out" ? { height: 0, opacity: 0 } : { height: "auto", opacity: v === "in" ? 0.75 : 1 }} exit={{ x: -40, opacity: 0 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden border-b last:border-0">
              <div className="flex items-center gap-2 px-4 py-2.5 text-[12px]">
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-mono font-bold text-muted-foreground">{h.file}</span> · {h.title}
                </span>
                {v === "in" ? (
                  <span className="flex items-center gap-1 font-black text-[hsl(var(--ok))]">
                    <Check className="size-3.5" /> applied
                    <button aria-label={`Undo accepting ${h.title}`} onClick={() => setState((s) => ({ ...s, [h.id]: "pending" }))} className="ml-1 opacity-60 hover:opacity-100"><Undo2 className="size-3.5" /></button>
                  </span>
                ) : v === "out" ? (
                  <span className="font-black text-[hsl(var(--err))]">skipped <span className="font-mono text-[9px] font-bold opacity-70">undo in 4s</span></span>
                ) : (
                  <span className="flex gap-1">
                    <button aria-label={`Accept hunk: ${h.title}`} onClick={() => accept(h.id)} className="grid size-7 place-items-center rounded-md border border-[hsl(var(--ok)/0.5)] text-[hsl(var(--ok))] hover:bg-[hsl(var(--ok)/0.12)]"><Check className="size-4" /></button>
                    <button aria-label={`Reject hunk: ${h.title}`} onClick={() => reject(h.id)} className="grid size-7 place-items-center rounded-md border text-muted-foreground hover:border-[hsl(var(--err)/0.5)] hover:text-[hsl(var(--err))]"><X className="size-4" /></button>
                  </span>
                )}
              </div>
              {v === "pending" && (
                <div className="mx-4 mb-3 grid gap-px overflow-hidden rounded-md border font-mono text-[11px]">
                  <div className="bg-[hsl(var(--err)/0.08)] px-3 py-2"><del className="text-[hsl(var(--err))]">{h.from}</del></div>
                  <div className="bg-[hsl(var(--ok)/0.08)] px-3 py-2"><ins className="text-[hsl(var(--ok))]" >{h.to}</ins></div>
                </div>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
      <p className="sr-only" aria-live="polite">{ins} of {hunks.length} changes accepted.</p>
    </div>
  )
}
