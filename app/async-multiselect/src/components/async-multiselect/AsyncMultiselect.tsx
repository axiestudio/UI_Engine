import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { Check, ChevronDown, Loader2, Plus, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — the combobox that admits the list is a million rows.
// JOB      pick N things from a huge, remote set
// SIGNATURE paged fetch loop with a sentinel row: scroll to the bottom and the
//           next page streams in with a shimmer; typed queries debounce 220ms;
//           "Create ‹term›" floats up when nothing matches exactly.
// API      value: T[] , onValueChange, loadItems(query, page) → Promise<{items,more}>
// A11Y     combobox + listbox semantics, aria-expanded, multiselectable true,
//          pills have remove labels, focus ring via roving.

export type PickOption = { id: string; label: string; meta?: string }
export type AsyncMultiselectProps = {
  value: PickOption[]
  onValueChange: (v: PickOption[]) => void
  loadItems: (query: string, page: number) => Promise<{ items: PickOption[]; more: boolean }>
  placeholder?: string
  onCreate?: (label: string) => PickOption | undefined
  label?: string
  className?: string
}

export function AsyncMultiselect({ value, onValueChange, loadItems, placeholder = "Search people, teams, tags…", onCreate, label = "Multi-select", className }: AsyncMultiselectProps) {
  const [q, setQ] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [items, setItems] = React.useState<PickOption[]>([])
  const [page, setPage] = React.useState(1)
  const [more, setMore] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const input = React.useRef<HTMLInputElement>(null)
  const debounce = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const selected = new Set(value.map((v) => v.id))
  const exact = items.some((i) => i.label.toLowerCase() === q.trim().toLowerCase())

  const fetchPage = React.useCallback((query: string, p: number) => {
    setLoading(true)
    loadItems(query, p).then((r) => { setItems((prev) => (p === 1 ? r.items : [...prev, ...r.items])); setMore(r.more); setPage(p) }).finally(() => setLoading(false))
  }, [loadItems])
  React.useEffect(() => {
    if (!open) return
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => fetchPage(q, 1), q ? 220 : 0)
    return () => clearTimeout(debounce.current)
  }, [q, open, fetchPage])

  const toggle = (it: PickOption) => onValueChange(selected.has(it.id) ? value.filter((v) => v.id !== it.id) : [...value, it])
  const create = () => { if (!onCreate) return; const made = onCreate(q.trim()); if (made) { onValueChange([...value, made]); setQ("") } }

  return (
    <div className={cn("relative font-sans", className)}>
      <MotionConfig reducedMotion="user">
      <div role="combobox" aria-expanded={open} aria-haspopup="listbox" aria-label={label} onClick={() => { setOpen(true); input.current?.focus() }} className={cn("flex min-h-11 cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 py-1.5 shadow-sm transition-shadow", open && "ring-2 ring-ring")}>
        <AnimatePresence initial={false}>
          {value.map((v) => (
            <motion.span layout key={v.id} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ duration: 0.16 }} className="flex items-center gap-1 rounded-full bg-secondary py-0.5 pl-2.5 pr-1 text-[13px] font-medium">
              {v.label}
              <Button type="button" variant="ghost" aria-label={`Remove ${v.label}`} onClick={(e) => { e.stopPropagation(); onValueChange(value.filter((x) => x.id !== v.id)) }} className="grid size-4 place-items-center rounded-full hover:bg-border"><X className="size-3" /></Button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input ref={input} value={q} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 140)} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Backspace" && !q && value.length) onValueChange(value.slice(0, -1)); if (e.key === "Enter" && onCreate && q && !exact) { e.preventDefault(); create() } }} placeholder={value.length ? "" : placeholder} className="h-7 min-w-[10ch] flex-1 bg-transparent text-sm outline-none" aria-autocomplete="list" />
        <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
          
    </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4, transition: { duration: 0.1 } }} onMouseDown={(e) => e.preventDefault()} className="absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-lg border bg-popover shadow-xl">
            {onCreate && q.trim() && !exact && (
              <Button type="button" variant="ghost" onClick={create} className="flex h-auto w-full items-center gap-2 border-b border-border/60 bg-accent/50 px-3 py-2.5 text-left text-sm font-medium hover:bg-accent"><Plus className="size-4" aria-hidden /> Create “{q.trim()}”</Button>
            )}
            <ul role="listbox" aria-multiselectable="true" className="max-h-64 overflow-y-auto py-1" onScroll={(e) => { const el = e.currentTarget; if (more && !loading && el.scrollTop + el.clientHeight > el.scrollHeight - 40) fetchPage(q, page + 1) }}>
              {items.map((it) => (
                <li key={it.id}>
                  <Button type="button" variant="ghost" role="option" aria-selected={selected.has(it.id)} onClick={() => toggle(it)} className={cn("flex h-auto w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-accent", selected.has(it.id) && "bg-accent/50")}>
                    <span className={cn("grid size-4 place-items-center rounded border", selected.has(it.id) ? "border-primary bg-primary text-primary-foreground" : "border-input")}><Check className="size-3" aria-hidden /></span>
                    <span className="min-w-0 flex-1 truncate">{it.label}</span>
                    {it.meta && <span className="text-xs text-muted-foreground">{it.meta}</span>}
                  </Button>
                </li>
              ))}
              {loading && <li className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground"><Search className="size-3.5 motion-safe:motion-safe:motion-safe:animate-pulse" /> loading…</li>}
              {!loading && !items.length && <li className="px-3 py-6 text-center text-sm text-muted-foreground">no matches</li>}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
          </MotionConfig>
    </div>
  )
}
