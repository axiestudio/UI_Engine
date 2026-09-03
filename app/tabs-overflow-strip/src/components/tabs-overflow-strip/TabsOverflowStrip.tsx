import * as React from "react"
import { X, ChevronsUpDown, Pin, PinOff } from "lucide-react"
import {
  FloatingPortal,
  autoUpdate,
  flip,
  hide,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
  useTypeahead,
} from "@floating-ui/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — every editor-class webapp needs honest tabs.
// JOB      work on many records at once without tab soup
// SIGNATURE pinned tabs stay; the rest folds into a chevron overflow that
//           LISTS the hidden ones in a Floating UI menu (flip + shift keep it
//           on screen in a side drawer); middle-click closes; wheel scrolls
//           the strip.
// POSITIONING overflow popup = useFloating on the chevron trigger,
//           middleware [offset → flip → shift(8) → hide], autoUpdate. The
//           width measuring is tab logic (ResizeObserver), allowed to stay —
//           only the popup anchoring moved to the engine.
// API      controlled `value` + `onChange`/`onClose`/`onPin` — your store owns it.
// A11Y     tabs role list; overflow menu is role=menu with roving focus
//          (useListNavigation) + typeahead; close buttons labelled.

export type AppTab = { id: string; label: string; dirty?: boolean; pinned?: boolean }
export type TabsOverflowStripProps = { tabs: AppTab[]; value: string; onChange: (id: string) => void; onClose?: (id: string) => void; onPin?: (id: string) => void; className?: string }

export function TabsOverflowStrip({ tabs, value, onChange, onClose, onPin, className }: TabsOverflowStripProps) {
  const strip = React.useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = React.useState<AppTab[]>([])
  const [shady, setShady] = React.useState(false)
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
      setShady(el.scrollWidth - el.clientWidth > 2 && el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
    }
    calc()
    const ro = new ResizeObserver(calc)
    ro.observe(el)
    el.addEventListener("scroll", calc, { passive: true })
    return () => { ro.disconnect(); el.removeEventListener("scroll", calc) }
  }, [tabs, value])
  const visible = tabs.filter((t) => !overflow.includes(t))
  const key = (e: React.KeyboardEvent) => { const i = visible.findIndex((t) => t.id === value); if (e.key === "ArrowRight") { e.preventDefault(); onChange(visible[Math.min(visible.length - 1, i + 1)].id) } if (e.key === "ArrowLeft") { e.preventDefault(); onChange(visible[Math.max(0, i - 1)].id) } if (e.key === "w" && (e.metaKey || e.ctrlKey) && onClose) { e.preventDefault(); onClose(value) } }

  return (
    <div className={cn("relative isolate flex items-stretch overflow-hidden border-b border-border", className)}>
      <div className="relative flex min-w-0 flex-1">
      <div ref={strip} role="tablist" aria-label="Open records" tabIndex={0} onKeyDown={key} onWheel={(e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) strip.current?.scrollBy({ left: e.deltaX }) }} className="flex flex-1 items-stretch gap-0.5 overflow-x-auto px-2 no-scrollbar">
        {visible.map((t) => {
          const active = t.id === value
          return (
            <div key={t.id} className="group relative flex shrink-0 items-center gap-1.5">
              <Button type="button" variant="ghost" role="tab" aria-selected={active} onClick={() => onChange(t.id)} onMouseDown={(e) => { if (e.button === 1) { e.preventDefault(); onClose?.(t.id) } }} className={cn("flex min-w-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring", active ? "text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground")}>
                {t.pinned && <Pin aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />}
                <span className="max-w-[18ch] truncate">{t.label}</span>
                {t.dirty && <span aria-hidden title="unsaved" className="size-1.5 shrink-0 rounded-full bg-[hsl(var(--warn))]" />}
              </Button>
              {!t.pinned && onClose && <Button type="button" variant="ghost" aria-label={`Close ${t.label}`} onClick={() => onClose(t.id)} className="grid size-5 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 hover:bg-muted"><X className="size-3.5" /></Button>}
              {onPin && <Button type="button" variant="ghost" aria-label={`${t.pinned ? "Unpin" : "Pin"} ${t.label}`} onClick={() => onPin(t.id)} className="grid size-5 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 hover:bg-muted">{t.pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}</Button>}
              {active && <span aria-hidden className="pointer-events-none absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-foreground" />}
            </div>
          )
        })}
        {visible.length === 0 && <span className="self-center px-2.5 py-2 text-sm text-muted-foreground">No open records</span>}
      </div>
      {shady && <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />}
      </div>
      {overflow.length > 0 && <OverflowMenu items={overflow} onPick={(id) => onChange(id)} />}
    </div>
  )
}

/** Floating UI menu listing the collapsed tabs, anchored to the chevron chip. */
function OverflowMenu({ items, onPick }: { items: AppTab[]; onPick: (id: string) => void }) {
  const [menu, setMenu] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const listRef = React.useRef<Array<HTMLElement | null>>([])
  // useTypeahead matches by string; indices align with the element list
  const labelsRef = React.useRef<Array<string | null>>([])
  labelsRef.current = items.map((t) => t.label)

  const { refs, floatingStyles, context } = useFloating({
    open: menu,
    onOpenChange: setMenu,
    placement: "bottom-end",
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 }), hide()],
    whileElementsMounted: autoUpdate,
  })
  const click = useClick(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: "menu" })
  const listNav = useListNavigation(context, { listRef, activeIndex, onNavigate: setActiveIndex })
  const typeahead = useTypeahead(context, { listRef: labelsRef, activeIndex, onMatch: setActiveIndex })
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([click, dismiss, role, listNav, typeahead])

  return (
    <>
      <Button type="button" ref={refs.setReference} variant="ghost" aria-label={`${items.length} hidden tabs`} {...getReferenceProps({ "aria-haspopup": "menu", "aria-expanded": menu })} className="mb-1 mr-1 flex items-center gap-1 self-center rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"><ChevronsUpDown className="size-4" /> {items.length}</Button>
      <FloatingPortal>
        {menu && (
          <ul
            ref={refs.setFloating}
            style={floatingStyles}
            className="z-40 flex w-60 flex-col gap-0.5 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl outline-none"
            {...getFloatingProps()}
          >
            {items.map((t, i) => (
              <Button
                key={t.id}
                type="button"
                variant="ghost"
                ref={(el) => { listRef.current[i] = el }}
                {...getItemProps({
                  role: "menuitem",
                  onClick: () => { onPick(t.id); setMenu(false) },
                })}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-sm font-normal hover:bg-accent"
              >
                <span className="truncate">{t.label}</span>
                {t.dirty && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[hsl(var(--warn))]" />}
              </Button>
            ))}
          </ul>
        )}
      </FloatingPortal>
    </>
  )
}
