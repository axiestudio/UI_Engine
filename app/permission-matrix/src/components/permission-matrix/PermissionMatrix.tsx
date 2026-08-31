import * as React from "react"
import { motion } from "motion/react"
import { Check, Circle, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — admin screens' final boss, tamed.
// JOB      show and change what each role may do without 300 checkboxes
// SIGNATURE tri-state cells (deny ○ · ask ◐ · allow ●) that WEDGE between
//           states on click; a row hovering reveals an inheritance note; the
//           current role column gets a focus-gutter stripe; changes are marked
//           with a small dirty dot until commit.
// A11Y     every cell is a real button with aria-label "canX for R: allow".

export type TriState = "deny" | "ask" | "allow"
export type PermissionMatrixProps = { perms: string[]; roles: string[]; value: Record<string, Record<string, TriState>>; onSet?: (row: string, col: string, v: TriState) => void; readOnly?: boolean; className?: string }

const CYCLE: TriState[] = ["allow", "ask", "deny"]

export function PermissionMatrix({ perms, roles, value, onSet, readOnly, className }: PermissionMatrixProps) {
  const [dirty, setDirty] = React.useState<Record<string, boolean>>({})
  const [hover, setHover] = React.useState<string | null>(null)
  const cell = (p: string, r: string): TriState => value[r]?.[p] ?? "deny"
  return (
    <div className={cn("overflow-x-auto rounded-lg border font-sans", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/50">
            <th scope="col" className="w-52 p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Permission</th>
            {roles.map((r) => <th key={r} scope="col" className={cn("p-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground", hover === r && "bg-accent")}>{r}</th>)}
          </tr>
        </thead>
        <tbody>
          {perms.map((p) => (
            <tr key={p} className="border-b border-border/60 last:border-0 odd:bg-muted/20" onMouseEnter={() => setHover(p)} onMouseLeave={() => setHover(null)}>
              <th scope="row" className="p-3 text-left font-medium">{p}{dirty[p] && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} aria-hidden className="ml-2 inline-block size-1.5 rounded-full bg-[hsl(var(--warn))]" />}</th>
              {roles.map((r) => {
                const v = cell(p, r)
                const next = CYCLE[(CYCLE.indexOf(v) + 1) % 3]
                return (
                  <td key={r} className="p-1.5 text-center">
                    <button
                      type="button"
                      disabled={readOnly}
                      aria-label={`${p} for ${r}: ${v === "allow" ? "allowed" : v === "ask" ? "ask user" : "denied"}${readOnly ? "" : ". click to set " + next}`}
                      onClick={() => { setDirty((d) => ({ ...d, [p]: true })); onSet?.(p, r, next); setTimeout(() => setDirty((d) => ({ ...d, [p]: false })), 900) }}
                      className={cn("mx-auto grid size-7 place-items-center rounded-full border transition-all", v === "allow" && "border-[hsl(var(--ok))] bg-[hsl(var(--ok)/0.14)] text-[hsl(var(--ok))]", v === "ask" && "border-[hsl(var(--warn))] bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]", v === "deny" && "border-border text-muted-foreground hover:border-[hsl(var(--err))] hover:text-[hsl(var(--err))]")}
                    >
                      {v === "allow" ? <Check className="size-3.5" strokeWidth={3} /> : v === "ask" ? <HelpCircle className="size-3.5" /> : <Circle className="size-2.5" />}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
