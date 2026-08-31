import * as React from "react"
import { X, ChevronsUpDown, Pin, PinOff } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — every editor-class webapp needs honest tabs.
// JOB      work on many records at once without tab soup
// SIGNATURE pinned tabs stay; the rest folds into a chevron overflow that
//           LISTS the hidden ones; middle-click closes; wheel scrolls the strip.
// API      controlled `value` + `onChange`/`onClose`/`onPin` — your store owns it.
// A11Y     proper tabs role list, roving arrow keys, close buttons labelled.

export type AppTab = { id: string; label: string; dirty?: boolean; pinned?: boolean }
export type TabsOverflowStripProps = { tabs: AppTab[]; value: string; onChange: (id: string) => void; onClose?: (id: string) => void; onPin?: (id: string) => void; className?: string }

export function TabsOverflowStrip({ tabs, value, onChange, onClose, onPin, className }: TabsOverflowStripProps) {
  const strip = React.useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = React.useState<AppTab[]>([])
  const [menu, setMenu] = React.useState(false)
  React.useEffect(() => {
    const el = strip.current
    if (!el) return
    const calc = () => {
      const w = el.clientWidth - 64
      let used = 0
      const hidden: AppTab[] = []
      for (const t of tabs) {
        const tw = Math.max(96, t.label.length * 7.6 + (t.pinned ? 14 : 0) + (t.dirty ? 10 : 0) + 46)
        if (used + tw > w && !(t.pinned || t.id === value)) hidden.push(t)
        else used += tw
      }
      setOverflow(hidden)
    }
    calc()
    const ro = new ResizeObserver(calc)
    ro.observe(el)
    return () => ro.disconnect()
  }, [tabs, value])
  const visible = tabs.filter((t) => !overflow.includes(t))
  const key = (e: React.KeyboardEvent) => { const i = visible.findIndex((t) => t.id === value); if (e.key === "ArrowRight") { e.preventDefault(); onChange(visible[Math.min(visible.length - 1, i + 1)].id) } if (e.key === "ArrowLeft") { e.preventDefault(); onChange(visible[Math.max(0, i - 1)].id) } if (e.key === "w" && (e.metaKey || e.ctrlKey) && onClose) { e.preventDefault(); onClose(value) } }

  return (
    <div className={cn("relative flex items-stretch border-b border-border", className)}>
      <div ref={strip} role="tablist" aria-label="Open records" tabIndex={0} onKeyDown={key} onWheel={(e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) strip.current?.scrollBy({ left: e.deltaX }) }} className="flex flex-1 items-stretch gap-0.5 overflow-x-auto px-2 no-scrollbar">
        {visible.map((t) => {
          const active = t.id === value
          return (
            <div key={t.id} className="group relative flex shrink-0 items-center gap-1.5">
              <button role="tab" aria-selected={active} onClick={() => onChange(t.id)} onMouseDown={(e) => { if (e.button === 1) { e.preventDefault(); onClose?.(t.id) } }} className={cn("flex min-w-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring", active ? "text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground")}>
                {t.pinned && <Pin aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />}
                <span className="max-w-[18ch] truncate">{t.label}</span>
                {t.dirty && <span aria-hidden title="unsaved" className="size-1.5 shrink-0 rounded-full bg-[hsl(var(--warn))]" />}
              </button>
              {!t.pinned && onClose && <button aria-label={`Close ${t.label}`} onClick={() => onClose(t.id)} className="grid size-5 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 hover:bg-muted"><X className="size-3.5" /></button>}
              {onPin && <button aria-label={`${t.pinned ? "Unpin" : "Pin"} ${t.label}`} onClick={() => onPin(t.id)} className="grid size-5 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 hover:bg-muted">{t.pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}</button>}
              {active && <span aria-hidden className="pointer-events-none absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-foreground" />}
            </div>
          )
        })}
        {visible.length === 0 && <span className="self-center px-2.5 py-2 text-sm text-muted-foreground">No open records</span>}
      </div>
      {overflow.length > 0 && (
        <>
          <button aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)} className="mb-1 mr-1 flex items-center gap-1 self-center rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"><ChevronsUpDown className="size-4" /> {overflow.length}</button>
          {menu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setMenu(false)} aria-hidden />
              <ul role="menu" className="absolute right-3 top-full z-30 mt-1 w-60 rounded-lg border border-border bg-popover p-1 shadow-xl">
                {overflow.map((t) => <li key={t.id}><button role="menuitem" onClick={() => { onChange(t.id); setMenu(false) }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-accent"><span className="truncate">{t.label}</span>{t.dirty && <span aria-hidden className="ml-auto size-1.5 rounded-full bg-[hsl(var(--warn))]" />}</button></li>)}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  )
}
