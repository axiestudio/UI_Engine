import * as React from "react"
import { toast, Toaster } from "sonner"
import { CornerDownLeft, Clock3, Plus, type LucideIcon } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — ⌘K is the front door of a 2026 webapp.
// JOB      jump anywhere / run anything without touching the mouse
// SIGNATURE grouped fuzzy results (cmdk), recents rail that writes itself,
//           inline `= 2*PI` scratch calc whose result copies with a scoped
//           Sonner receipt, and a footer keymap rail.
// SHELL      the shadcn Command+Dialog kit (registry ui/command + ui/dialog),
//           vendored from the snapshot; centering/overlay/focus-trap belong to
//           Radix dialog — Floating UI is for ANCHORED surfaces, this is a
//           modal palette. Preset voice lives in Dialog content className.
// API      host owns open state (`open`/`onOpenChange`, global hotkey built
//          in), supplies `groups` [{title, items:[{id,label,hint?,icon?,run}]}]
// A11Y     dialog + listbox semantics from the kit; Esc closes; ⌘K toggles.

const TOASTER_ID = "cmd-palette"

export type PaletteItem = { id: string; label: string; hint?: string; group?: string; icon?: LucideIcon; run: () => void }
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

function evalScratch(raw: string): string | null {
  // tiny guarded evaluator for scratch math only
  const m = raw.match(/^=\s*([\d\s+\-*/().,%^a-z]+)$/i)
  if (!m) return null
  try {
    const expr = m[1].replace(/\^/g, "**").replace(/\b(pi)\b/gi, "Math.PI").replace(/\b(e)\b/gi, "Math.E")
    if (!/^[\d\s+\-*/().,%e*]+$/i.test(expr.replace(/Math\.\w+/g, ""))) return null
    const v = Function(`"use strict";return (${expr})`)()
    return typeof v === "number" && isFinite(v) ? v.toLocaleString(undefined, { maximumFractionDigits: 10 }) : null
  } catch {
    return null
  }
}

export function CmdPalette({ open, onOpenChange, groups, placeholder = "Type a command or search…", emptyHint = "Nothing matches — try a shorter word.", calculator = true, className }: CmdPaletteProps) {
  const [recent, setRecent] = React.useState<PaletteItem[]>([])
  const [query, setQuery] = React.useState("")
  React.useEffect(() => {
    const key = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); onOpenChange(!open) } }
    window.addEventListener("keydown", key)
    return () => window.removeEventListener("keydown", key)
  }, [open, onOpenChange])
  React.useEffect(() => { if (!open) setQuery("") }, [open])

  const run = (it: PaletteItem) => { setRecent((r) => [it, ...r.filter((x) => x.id !== it.id)].slice(0, 5)); it.run(); onOpenChange(false) }
  const calc = calculator ? evalScratch(query) : null

  return (
    <>
      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Command palette"
        description="Run commands and jump anywhere."
        showCloseButton={false}
        className={cn("top-[14vh] translate-y-0 gap-0 overflow-hidden rounded-xl border-border/70 bg-popover p-0 shadow-2xl sm:max-w-[560px]", className)}
      >
        <CommandInput placeholder={placeholder} onInput={(e) => setQuery((e.target as HTMLInputElement).value)} className="text-sm" />
        <CommandList className="max-h-[46vh] p-2">
          <CommandEmpty>{emptyHint}</CommandEmpty>
          {calc && (
            <CommandGroup heading="Calculator">
              <CommandItem
                value={`${query} = ${calc}`}
                onSelect={() => {
                  navigator.clipboard?.writeText(calc)
                  toast.success(`Copied ${calc}`, { description: "Scratch result is on your clipboard.", duration: 2400, toasterId: TOASTER_ID })
                }}
              >
                <span aria-hidden>=</span>
                <span className="font-mono text-sm font-medium text-[hsl(var(--info))]">{calc}</span>
                <span className="ml-auto text-xs text-muted-foreground">copy</span>
              </CommandItem>
            </CommandGroup>
          )}
          {recent.length > 0 && (
            <CommandGroup heading="Recent">
              {recent.map((it) => <Row key={`r-${it.id}`} it={it} onRun={run} DefaultIcon={Clock3} />)}
            </CommandGroup>
          )}
          {groups.map((g) => (
            <CommandGroup key={g.title} heading={g.title}>
              {g.items.map((it) => <Row key={it.id} it={it} onRun={run} />)}
            </CommandGroup>
          ))}
        </CommandList>
        <div className="flex items-center gap-3 border-t bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">↑↓ navigate</span><span className="flex items-center gap-1"><CornerDownLeft className="size-3" /> run</span><span className="ml-auto font-mono">⌘K</span>
        </div>
      </CommandDialog>
      <Toaster id={TOASTER_ID} position="bottom-center" visibleToasts={2} />
    </>
  )
}

function Row({ it, onRun, DefaultIcon }: { it: PaletteItem; onRun: (i: PaletteItem) => void; DefaultIcon?: LucideIcon }) {
  const Icon = it.icon ?? DefaultIcon ?? Plus
  return (
    <CommandItem value={it.label} onSelect={() => onRun(it)}>
      <Icon className="text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate">{it.label}</span>
      {it.hint && <kbd className="font-mono text-[10px] text-muted-foreground">{it.hint}</kbd>}
    </CommandItem>
  )
}
