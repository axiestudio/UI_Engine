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
    <div className={cn("relative flex items-stretch border-b bg-muted/30", className)}>
      <div ref={strip} role="tablist" aria-label="Open records" tabIndex={0} onKeyDown={key} onWheel={(e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) strip.current?.scrollBy({ left: e.deltaX }) }} className="flex flex-1 items-stretch gap-px overflow-x-auto no-scrollbar">
        {visible.map((t) => (
          <div key={t.id} className={cn("group flex shrink-0 items-center gap-1 border-r px-3 py-2 text-[13px] transition-colors", t.id === value ? "border-b-2 border-b-[hsl(var(--app-focus))] bg-background font-semibold" : "bg-muted/40 text-muted-foreground hover:bg-background/70")}>
            <button role="tab" aria-selected={t.id === value} onClick={() => onChange(t.id)} onMouseDown={(e) => { if (e.button === 1) { e.preventDefault(); onClose?.(t.id) } }} className="flex min-w-0 items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--app-focus))] rounded">
              {t.pinned && <Pin aria-hidden className="size-3 shrink-0 text-[hsl(var(--pinned))]" />}
              <span className="max-w-[18ch] truncate">{t.label}</span>
              {t.dirty && <span aria-hidden title="unsaved" className="size-1.5 shrink-0 rounded-full bg-[hsl(var(--warn))]" />}
            </button>
            {!t.pinned && onClose && <button aria-label={`Close ${t.label}`} onClick={() => onClose(t.id)} className="grid size-5 place-items-center rounded opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 hover:bg-muted"><X className="size-3.5" /></button>}
            {onPin && <button aria-label={`${t.pinned ? "Unpin" : "Pin"} ${t.label}`} onClick={() => onPin(t.id)} className="grid size-5 place-items-center rounded opacity-0 hover:bg-muted focus-visible:opacity-100 group-hover:opacity-100">{t.pinned ? <PinOff className="size-3" /> : <Pin className="size-3" />}</button>}
          </div>
        ))}
      </div>
      {overflow.length > 0 && (
        <>
          <button aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)} className="flex items-center gap-1 border-l px-3 text-[12px] font-semibold text-muted-foreground hover:bg-muted"><ChevronsUpDown className="size-4" /> {overflow.length}</button>
          {menu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setMenu(false)} aria-hidden />
              <ul role="menu" className="absolute right-9 top-full z-30 w-60 rounded-lg border bg-popover p-1 shadow-xl">
                {overflow.map((t) => <li key={t.id}><button role="menuitem" onClick={() => { onChange(t.id); setMenu(false) }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] hover:bg-accent"><span className="truncate">{t.label}</span>{t.dirty && <span aria-hidden className="ml-auto size-1.5 rounded-full bg-[hsl(var(--warn))]" />}</button></li>)}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  )
}
