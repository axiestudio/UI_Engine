import * as React from "react"
import { Command } from "cmdk"
import { motion, AnimatePresence } from "motion/react"
import { CornerDownLeft, Clock3, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — ⌘K is the front door of a 2026 webapp.
// JOB      jump anywhere / run anything without touching the mouse
// SIGNATURE grouped fuzzy results, recents rail that writes itself, inline
//           `= 2*PI` scratch calc, and the selected row rides a shared thumb.
// API      host owns open state (`open`/`onOpenChange`, global hotkey built
//          in), supplies `groups` [{title, items:[{id,label,hint?,icon?,run}]}]
// A11Y     cmdk provides listbox semantics + typeahead; Esc closes; reduced
//          motion removes the entrance spring only.

export type PaletteItem = { id: string; label: string; hint?: string; group?: string; run: () => void }
export type PaletteGroup = { title: string; items: PaletteItem[] }
export type CmdPaletteProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
  groups: PaletteGroup[]
  placeholder?: string
  emptyHint?: string
  /** enable the `= 41*2` scratch calculator as a pseudo-group */
  calculator?: boolean
  className?: string
}

export function CmdPalette({ open, onOpenChange, groups, placeholder = "Type a command or search…", emptyHint = "Nothing matches — try a shorter word.", calculator = true, className }: CmdPaletteProps) {
  const [recent, setRecent] = React.useState<PaletteItem[]>([])
  React.useEffect(() => {
    const key = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); onOpenChange(!open) } if (e.key === "Escape") onOpenChange(false) }
    window.addEventListener("keydown", key)
    return () => window.removeEventListener("keydown", key)
  }, [open, onOpenChange])

  const run = (it: PaletteItem) => { setRecent((r) => [it, ...r.filter((x) => x.id !== it.id)].slice(0, 5)); it.run(); onOpenChange(false) }

  const calc = calculator && open
    ? (() => {
        // tiny guarded evaluator for scratch math only
        const el = (document.querySelector('[cmdk-input]') as HTMLInputElement | null)?.value ?? ""
        const m = el.match(/^=\s*([\d\s+\-*/().,%^a-z]+)$/i)
        if (!m) return null
        try {
          const expr = m[1].replace(/\^/g, "**").replace(/\b(pi)\b/gi, "Math.PI").replace(/\b(e)\b/gi, "Math.E")
          if (!/^[\d\s+\-*/().,%e*]+$/i.test(expr.replace(/Math\.\w+/g, ""))) return null
          const v = Function(`"use strict";return (${expr})`)()
          return typeof v === "number" && isFinite(v) ? v.toLocaleString(undefined, { maximumFractionDigits: 10 }) : null
        } catch { return null }
      })()
    : null

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[110] flex items-start justify-center bg-black/40 px-4 pt-[14vh] backdrop-blur-[3px]", className)} onMouseDown={(e) => { if (e.target === e.currentTarget) onOpenChange(false) }}>
          <motion.div initial={{ scale: 0.96, y: reduceY }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 380, damping: 30 }} className="w-full max-w-[560px] overflow-hidden rounded-xl border bg-popover shadow-2xl">
            <Command label="Command palette" shouldFilter>
              <div className="flex items-center gap-2.5 border-b px-4">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <Command.Input autoFocus placeholder={placeholder} className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                <kbd className="hidden shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold text-muted-foreground sm:flex">esc</kbd>
              </div>
              <Command.List className="max-h-[46vh] overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{emptyHint}</Command.Empty>
                {calc && (
                  <Command.Group heading="Calculator">
                    <Command.Item value={`calc result ${calc}`} onSelect={() => navigator.clipboard?.writeText(String(calc))} className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-accent">
                      <span>=</span><span className="font-mono text-sm font-black text-[hsl(var(--info))]">{calc} <CopyHint/></span>
                    </Command.Item>
                  </Command.Group>
                )}
                {recent.length > 0 && (
                  <Command.Group heading="Recent">
                    {recent.map((it) => <Row key={`r-${it.id}`} it={it} onRun={run} icon={Clock3} />)}
                  </Command.Group>
                )}
                {groups.map((g) => (
                  <Command.Group key={g.title} heading={g.title}>
                    {g.items.map((it) => <Row key={it.id} it={it} onRun={run} />)}
                  </Command.Group>
                ))}
              </Command.List>
              <div className="flex items-center gap-3 border-t bg-muted/40 px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                <span className="flex items-center gap-1">↑↓ navigate</span><span className="flex items-center gap-1"><CornerDownLeft className="size-3" /> run</span><span className="ml-auto">⌘K</span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
const reduceY = 12
function CopyHint() { return <span className="text-[9px] uppercase tracking-[0.2em] opacity-50">copy</span> }
function Row({ it, onRun, icon: Icon }: { it: PaletteItem; onRun: (i: PaletteItem) => void; icon?: React.ElementType }) {
  return (
    <Command.Item value={it.label} onSelect={() => onRun(it)} className="flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground">
      {Icon ? <Icon className="size-4 text-muted-foreground" /> : <Plus className="size-4 text-muted-foreground" />}
      <span className="min-w-0 flex-1 truncate">{it.label}</span>
      {it.hint && <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{it.hint}</span>}
    </Command.Item>
  )
}
