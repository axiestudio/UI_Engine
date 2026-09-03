import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Link2, Plus, X } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Compose a navigation menu from link blocks.
// ═══ EMOTION     Your menu, your order.
// ═══ SIGNATURE   Palette of destinations -> reorderable menu items.

export type MenuItem = { id: string; label: string; href?: string }

export type DndMenuBuilderProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  palette?: MenuItem[]
  initialItems?: MenuItem[]
  onChange?: (items: MenuItem[]) => void
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_DND_MENU_BUILDER_PALETTE = [ { id: "home", label: "Home", href: "/" }, { id: "services", label: "Services", href: "/services" }, { id: "pricing", label: "Pricing", href: "/pricing" }, { id: "journal", label: "Journal", href: "/journal" }, ]


export function DndMenuBuilder({
  eyebrow = "MENUS",
  title = "Build the menu.",
  subtitle = "Drag destinations onto the menu, then reorder or remove them.",
  palette = DEMO_DND_MENU_BUILDER_PALETTE,
  initialItems = [],
  onChange,
  className,
}: DndMenuBuilderProps) {
  const [menu, setMenu] = React.useState<MenuItem[]>(initialItems)
  React.useEffect(() => { setMenu(initialItems) }, [initialItems])
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const [fromPalette, setFromPalette] = React.useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id))
    setFromPalette(palette.some((p) => p.id === active.id))
  }
  const onDragCancel = () => setActiveId(null)

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    setAnnounce(`Moved ${String(active.id)}`)
    const aId = String(active.id)
    const overId = over ? String(over.id) : null
    if (fromPalette) {
      const item = palette.find((p) => p.id === aId)
      if (!item) return
      const targetId = overId === "canvas-dropzone" ? null : overId
      if (!over && menu.length !== 0) return
      const newItem = { ...item, id: `${item.id}-${Date.now()}` }
      setMenu((prev) => {
        const idx = targetId ? prev.findIndex((m) => m.id === targetId) : -1
        const spliceAt = idx >= 0 ? idx : prev.length
        const next = [...prev.slice(0, spliceAt), newItem, ...prev.slice(spliceAt)]
        onChange?.(next)
        return next
      })
      return
    }
    if (!overId || aId === overId) return
    setMenu((prev) => {
      const oldIndex = prev.findIndex((m) => m.id === aId)
      const newIndex = prev.findIndex((m) => m.id === overId)
      if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
        const next = arrayMove(prev, oldIndex, newIndex)
        onChange?.(next)
        return next
      }
      return prev
    })
  }

  const remove = (id: string) => {
    const next = menu.filter((m) => m.id !== id)
    setMenu(next)
    onChange?.(next)
  }

  const activeData = activeId ? [...menu, ...palette].find((m) => m.id === activeId) : null

  return (
    <SectionShell width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/50 px-4 py-3 shadow-sm ">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
            {menu.length} items
          </span>
          <span className="hidden sm:inline text-xs font-medium text-muted-foreground">Advanced • Professional DnD</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setMenu([]); onChange?.([]); setAnnounce("Menu cleared") }} className="h-7 rounded-full px-3 text-xs font-medium shadow-sm">
            Reset
          </Button>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">A11y • Advanced</span>
        </div>
      </div>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announce}</div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragCancel={onDragCancel} onDragEnd={onDragEnd}>
        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-xl border bg-card shadow-sm p-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Destinations</p>
            <div className="mt-3 space-y-2">
              {palette.map((p) => (
                <PaletteMenu key={p.id} item={p} />
              ))}
            </div>
          </aside>
          <CanvasDropArea menu={menu} onClear={() => { setMenu([]); onChange?.([]) }}>
            <div className="mt-3 min-h-[200px]">
              {menu.length === 0 ? (
                <div className="flex h-[180px] items-center justify-center rounded-xl border-2 border-dashed border-border font-mono text-[11px] text-muted-foreground">drop a destination here</div>
              ) : (
                <SortableContext items={menu.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {menu.map((m) => (
                      <MenuRow key={m.id} item={m} onRemove={remove} />
                    ))}
                  </div>
                </SortableContext>
              )}
            </div>
          </CanvasDropArea>
        </div>
        <DragOverlay>{activeData ? <MenuChip item={activeData} /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function CanvasDropArea({ menu, onClear, children }: { menu: MenuItem[]; onClear: () => void; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-dropzone" })
  return (
    <div ref={setNodeRef} className={cn("rounded-xl border bg-muted/20 p-4 transition-colors", isOver && "dnd-over")}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Menu — {menu.length} items</p>
        {menu.length > 0 && (
          <Button variant="outline" size="sm" className="h-7 rounded-full font-mono text-[10px] font-semibold uppercase tracking-widest" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>
      {children}
    </div>
  )
}

function PaletteMenu({ item }: { item: MenuItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id })
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className={cn("flex cursor-grab touch-none items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-semibold tracking-tight active:cursor-grabbing", isDragging && "opacity-40")}>
      <Link2 className="h-4 w-4 text-muted-foreground" />
      {item.label}
    </div>
  )
}

function MenuRow({ item, onRemove }: { item: MenuItem; onRemove: (id: string) => void }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: item.id })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("flex items-center gap-3 rounded-xl border bg-card px-3 py-3", isDragging && "dnd-lift opacity-90")}>
      {/* dnd-kit grip handle: listeners require a real <button> element, not the registry Button. */}
      <button type="button" {...attributes} {...listeners} className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing" aria-label={`Reorder ${item.label}`}>
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="text-sm font-semibold tracking-tight">{item.label}</span>
      <span className="ml-auto truncate font-mono text-[10px] text-muted-foreground">{item.href ?? "#"}</span>
      <Button variant="ghost" size="icon-sm" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.label}`} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"><X className="h-4 w-4" /></Button>
    </div>
  )
}

function MenuChip({ item }: { item: MenuItem }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-card shadow-sm px-4 py-3 text-sm font-semibold tracking-tight dnd-lift">
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      {item.label}
    </div>
  )
}
