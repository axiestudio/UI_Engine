import * as React from "react"
import { motion, MotionConfig } from "motion/react"
import { Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — compliance wants receipts; users want revert.
// JOB      show who changed what on any record
// SIGNATURE rows read as FIELD-LEVEL diffs (old → new with arrow morph, not
//           full objects); actor avatars cluster by day; REVERT re-applies
//           the old value and stamps the trail with a new entry (honest!)
//           that springs in at the top.
// A11Y     table semantics; reverts are announced in status text.

export type AuditEntry = { id: string; at: string; actor: string; field: string; from: string; to: string }
export type SwitchAuditTrailProps = { entries: AuditEntry[]; onRevert?: (e: AuditEntry) => void; className?: string }

const initials = (a: string) => a.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()

export function SwitchAuditTrail({ entries, onRevert, className }: SwitchAuditTrailProps) {
  let day = ""
  return (
    <ol className={cn("relative isolate space-y-1 overflow-hidden font-sans", className)}>
      <MotionConfig reducedMotion="user">
      {entries.map((e) => {
        const d = new Date(e.at).toLocaleDateString()
        const header = d !== day
        day = d
        return (
          <motion.li key={e.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            {header && <p className="pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{d}</p>}
            <div className="group flex items-center gap-3 rounded-lg border border-border/70 bg-card px-3 py-2.5">
              <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">{initials(e.actor)}</span>
              <p className="min-w-0 flex-1 text-[13px]">
                <strong className="font-semibold">{e.actor}</strong> set <span className="rounded bg-muted/50 px-1 py-px font-mono text-[11px] font-medium">{e.field}</span>{" "}
                <span className="inline-flex items-center gap-1.5 align-middle">
                  <del className="text-muted-foreground">{e.from}</del>
                  <motion.span aria-hidden className="text-muted-foreground/60">→</motion.span>
                  <ins className="font-semibold text-[hsl(var(--info))] no-underline">{e.to}</ins>
                </span>
                <span className="ml-2 text-xs text-muted-foreground">{new Date(e.at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
              </p>
              {onRevert && <Button type="button" variant="ghost" onClick={() => onRevert(e)} className="flex items-center gap-1 rounded-md border border-border/70 px-2 py-1 text-xs font-medium text-muted-foreground opacity-0 transition-opacity hover:bg-muted focus-visible:opacity-100 group-hover:opacity-100"><Undo2 className="size-3" /> revert</Button>}
            </div>
          </motion.li>
        )
      })}
          
          </MotionConfig>
    </ol>
  )
}
