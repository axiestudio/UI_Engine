import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { Check, Sparkles, Undo2, X } from "lucide-react"
import { toast, Toaster } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — "AI proposed 6 changes" done HONESTLY.
// JOB      accept a machine edit hungrily — or hungrily, in pieces
// ROUND 2  undo window = Sonner notification (preset-scoped toasterId); counts
//           read as registry Badge; every transition is real state, not a mock
// SIGNATURE the header carries overall accept/reject; each hunk card accepts
//           INDIVIDUALLY: accepted hunks fold their diff away and stamp ✓
//           while the header count climbs; rejected cards slide out left with
//           a 4s undo notification that re-parks them pending.
// A11Y     every control is a real button; counts in a polite live region.

export type Hunk = { id: string; file: string; title: string; from: string; to: string }
export type AiChangeReviewProps = { hunks: Hunk[]; onAccept: (id: string) => void; onReject?: (id: string) => void; onAcceptAll?: (ids: string[]) => void; className?: string }

type HState = "pending" | "in" | "out"
const TOASTER_ID = "ai-change-review"
const UNDO_MS = 4000

export function AiChangeReview({ hunks, onAccept, onReject, onAcceptAll, className }: AiChangeReviewProps) {
  const [state, setState] = React.useState<Record<string, HState>>({})
  const st = (id: string): HState => state[id] ?? "pending"
  const toPending = (id: string) => setState((s) => (s[id] === "out" ? { ...s, [id]: "pending" } : s))
  const accept = (id: string) => { setState((s) => ({ ...s, [id]: "in" })); onAccept(id) }
  const reject = (id: string) => {
    setState((s) => ({ ...s, [id]: "out" }))
    onReject?.(id)
    toast.dismiss(`skip-${id}`)
    toast("Hunk skipped", {
      id: `skip-${id}`,
      description: `${hunks.find((h) => h.id === id)?.file ?? "change"} — you can put it back`,
      action: { label: "Undo", onClick: () => toPending(id) },
      duration: UNDO_MS,
      toasterId: TOASTER_ID,
    })
    setTimeout(() => toPending(id), UNDO_MS + 200)
  }
  const pend = hunks.filter((h) => st(h.id) === "pending")
  const ins = hunks.filter((h) => st(h.id) === "in")
  const acceptAll = () => {
    const ids = pend.map((h) => h.id)
    setState((s) => ({ ...s, ...Object.fromEntries(ids.map((id) => [id, "in" as HState])) }))
    if (onAcceptAll) onAcceptAll(ids)
    else ids.forEach((id) => onAccept(id))
    toast.success(`${ids.length} change${ids.length === 1 ? "" : "s"} accepted`, { toasterId: TOASTER_ID })
  }
  const dismissRest = () => {
    const ids = hunks.filter((h) => st(h.id) !== "out").map((h) => h.id)
    setState((s) => ({ ...s, ...Object.fromEntries(ids.map((id) => [id, "out" as HState])) }))
    ids.forEach((id) => onReject?.(id))
    toast(`${ids.length} left as-is`, { description: "Nothing was applied to those hunks.", duration: 3000, toasterId: TOASTER_ID })
  }
  return (
    <div className={cn("relative isolate w-full overflow-hidden rounded-xl border bg-card font-sans", className)}>
      <MotionConfig reducedMotion="user">
        <header className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
          <Sparkles aria-hidden className="size-4 text-[hsl(var(--pinned))]" />
          <p className="text-sm font-medium">Agent proposed {hunks.length} changes</p>
          <Badge variant="secondary" className="font-mono text-[10px]">{ins.length}/{hunks.length} accepted</Badge>
          <div className="ml-auto flex gap-1.5">
            <Button type="button" size="sm" disabled={!pend.length} onClick={acceptAll} className="h-7 rounded-md bg-[hsl(var(--ok))] px-3 text-xs font-medium text-primary-foreground hover:bg-[hsl(var(--ok))] hover:opacity-90 disabled:opacity-40">Accept all</Button>
            <Button type="button" size="sm" variant="outline" disabled={!pend.length && !ins.length} onClick={dismissRest} className="h-7 rounded-md px-3 text-xs font-medium text-muted-foreground disabled:opacity-40">Dismiss rest</Button>
          </div>
        </header>
        <AnimatePresence initial={false}>
          {hunks.map((h) => {
            const v = st(h.id)
            return (
              <motion.div key={h.id} layout initial={false} animate={v === "out" ? { height: 0, opacity: 0 } : { height: "auto", opacity: v === "in" ? 0.75 : 1 }} exit={{ x: -40, opacity: 0 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden border-b last:border-0">
                <div className="flex items-center gap-2 px-4 py-2.5">
                  <span className="min-w-0 flex-1 truncate text-sm">
                    <span className="font-mono font-medium text-muted-foreground">{h.file}</span> · {h.title}
                  </span>
                  {v === "in" ? (
                    <span className="flex items-center gap-1 font-medium text-[hsl(var(--ok))]">
                      <Check className="size-3.5" /> applied
                      <Button type="button" variant="ghost" size="icon" aria-label={`Undo accepting ${h.title}`} onClick={() => setState((s) => ({ ...s, [h.id]: "pending" }))} className="ml-1 size-6 opacity-60 hover:opacity-100"><Undo2 className="size-3.5" /></Button>
                    </span>
                  ) : v === "out" ? (
                    <span className="font-medium text-[hsl(var(--err))]">skipped · undo in the notification</span>
                  ) : (
                    <span className="flex gap-1">
                      <Button type="button" variant="outline" size="icon" aria-label={`Accept hunk: ${h.title}`} onClick={() => accept(h.id)} className="size-7 rounded-md border-[hsl(var(--ok)/0.5)] text-[hsl(var(--ok))] hover:bg-[hsl(var(--ok)/0.12)]"><Check className="size-4" /></Button>
                      <Button type="button" variant="outline" size="icon" aria-label={`Reject hunk: ${h.title}`} onClick={() => reject(h.id)} className="size-7 rounded-md text-muted-foreground hover:border-[hsl(var(--err)/0.5)] hover:text-[hsl(var(--err))]"><X className="size-4" /></Button>
                    </span>
                  )}
                </div>
                {v === "pending" && (
                  <div className="mx-4 mb-3 grid gap-px overflow-hidden rounded-md border bg-background font-mono text-[11px]">
                    <div className="bg-[hsl(var(--err)/0.08)] px-3 py-2"><del className="text-[hsl(var(--err))]">{h.from}</del></div>
                    <div className="bg-[hsl(var(--ok)/0.08)] px-3 py-2"><ins className="no-underline text-[hsl(var(--ok))]">{h.to}</ins></div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
        <p className="sr-only" aria-live="polite">{ins.length} of {hunks.length} changes accepted.</p>
      </MotionConfig>
      <Toaster id={TOASTER_ID} position="top-right" richColors closeButton />
    </div>
  )
}
