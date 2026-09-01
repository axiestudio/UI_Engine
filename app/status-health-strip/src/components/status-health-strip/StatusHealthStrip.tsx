import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { AlertTriangle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — "is it us?" answered in one glance.
// JOB      surface service truth where work happens
// SIGNATURE a slim strip of service pips; degraded/failed rows glow and
//           unroll an incident ticker underneath; regions filter live.
// API      services [{name, state, region?, note?}] — poll it, render it, done.
// A11Y     strip is a statusbar landmark; states in text too; detail rows are
//          disclosure buttons with aria-expanded.

export type Service = { name: string; state: "operational" | "degraded" | "down"; region?: string; note?: string }
export type StatusHealthStripProps = { services: Service[]; region?: string; onRegion?: (r: string) => void; className?: string }

const DOT: Record<Service["state"], string> = { operational: "bg-[hsl(var(--ok))]", degraded: "bg-[hsl(var(--warn))]", down: "bg-[hsl(var(--err))]" }

export function StatusHealthStrip({ services, region, onRegion, className }: StatusHealthStripProps) {
  const [open, setOpen] = React.useState(false)
  const regions = Array.from(new Set(services.map((s) => s.region).filter(Boolean))) as string[]
  const shown = region ? services.filter((s) => s.region === region) : services
  const bad = shown.filter((s) => s.state !== "operational")
  return (
    <div className={cn("border-b bg-muted/40 font-sans", className)} role="status" aria-label="System health">
      <MotionConfig reducedMotion="user">
      <div className="mx-auto flex h-9 w-full max-w-[1200px] items-center gap-3 px-4 text-xs">
        <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-muted-foreground">
          <span className={cn("size-2 rounded-full", bad.length === 0 ? "bg-[hsl(var(--ok))] shadow-[0_0_8px_hsl(var(--ok)/0.7)]" : bad.some((b) => b.state === "down") ? "bg-[hsl(var(--err))]" : "bg-[hsl(var(--warn))]")} />
          {bad.length === 0 ? "All systems normal" : `${bad.length} issue${bad.length > 1 ? "s" : ""}`}
        </span>
        <span aria-hidden className="flex items-center gap-2.5">
          {shown.slice(0, 9).map((s) => <span key={s.name} title={`${s.name}: ${s.state}`} className={cn("size-1.5 rounded-full", DOT[s.state])} />)}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {onRegion && regions.length > 0 && (
            <label className="flex items-center gap-1 text-muted-foreground">
              <span className="sr-only">Region</span>
              <select value={region ?? "all"} onChange={(e) => onRegion(e.target.value === "all" ? "" : e.target.value)} className="rounded-md border border-border/70 bg-background px-1.5 py-1 text-xs">
                <option value="all">All regions</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
          )}
          <Button type="button" variant="ghost" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted">
            details <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
          </Button>
          
    </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden border-t bg-background">
            {shown.map((s) => (
              <li key={s.name} className="flex items-center gap-3 px-4 py-2 text-sm odd:bg-muted/30">
                <span className={cn("size-2 shrink-0 rounded-full", DOT[s.state])} aria-hidden />
                <span className="w-44 shrink-0 font-medium">{s.name}</span>
                {s.region && <span className="hidden w-20 shrink-0 text-xs uppercase tracking-wide text-muted-foreground sm:block">{s.region}</span>}
                <span className={cn("truncate", s.state === "down" ? "font-semibold text-[hsl(var(--err))]" : s.state === "degraded" ? "text-[hsl(var(--warn))]" : "text-muted-foreground")}>{s.state === "operational" ? "operational" : s.state === "degraded" ? "degraded performance" : "major outage"}{s.note ? ` — ${s.note}` : ""}</span>
                {s.state !== "operational" && <AlertTriangle aria-hidden className={cn("ml-auto size-3.5 shrink-0", s.state === "down" ? "text-[hsl(var(--err))]" : "text-[hsl(var(--warn))]")} />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
          </MotionConfig>
    </div>
  )
}
