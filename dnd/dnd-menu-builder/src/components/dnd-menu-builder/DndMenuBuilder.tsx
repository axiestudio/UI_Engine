import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
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
  palette: MenuItem[]
  initialItems?: MenuItem[]
  onChange?: (items: MenuItem[]) => void
  className?: string
}

export function DndMenuBuilder({
  eyebrow = "MENUS",
  title = "Build the menu.",
  subtitle = "Drag destinations onto the menu, then reorder or remove them.",
  palette,
  initialItems = [],
  onChange,
  className,
}: DndMenuBuilderProps) {
  const [menu, setMenu] = React.useState<MenuItem[]>(initialItems)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [fromPalette, setFromPalette] = React.useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id))
    setFromPalette(palette.some((p) => p.id === active.id))
  }
  const onDragCancel = () => setActiveId(null)

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    const aId = String(active.id)
    const overId = over ? String(over.id) : null
    if (fromPalette) {
      if (!overId) return
      const item = palette.find((p) => p.id === aId)
      if (!item) return
      const newItem = { ...item, id: `${item.id}-${Date.now()}` }
      setMenu((prev) => {
        const idx = prev.findIndex((m) => m.id === overId)
        const spliceAt = idx >= 0 ? idx : prev.length
        const next = [...prev.slice(0, spliceAt), newItem, ...prev.slice(spliceAt)]
        onChange?.(next)
        return next
      })
      return
    }
    if (!overId || aId === overId) return
    const oldIndex = menu.findIndex((m) => m.id === aId)
    const newIndex = menu.findIndex((m) => m.id === overId)
    if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
      const next = arrayMove(menu, oldIndex, newIndex)
      setMenu(next)
      onChange?.(next)
    }
  }

  const remove = (id: string) => {
    const next = menu.filter((m) => m.id !== id)
    setMenu(next)
    onChange?.(next)
  }

  const activeData = activeId ? [...menu, ...palette].find((m) => m.id === activeId) : null

  return (
    <SectionShell width={920} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragCancel={onDragCancel} onDragEnd={onDragEnd}>
        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-2xl border bg-card p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Destinations</p>
            <div className="mt-3 space-y-2">
              {palette.map((p) => (
                <PaletteMenu key={p.id} item={p} />
              ))}
            </div>
          </aside>
          <div className="rounded-2xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Menu — {menu.length} items</p>
              {menu.length > 0 && (
                <Button variant="outline" size="sm" className="h-7 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest" onClick={() => { setMenu([]); onChange?.([]) }}>Clear</Button>
              )}
            </div>
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
          </div>
        </div>
        <DragOverlay>{activeData ? <MenuChip item={activeData} /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function PaletteMenu({ item }: { item: MenuItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id })
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className={cn("flex cursor-grab touch-none items-center gap-2 rounded-lg border bg-background px-3 py-2 font-display text-sm font-bold active:cursor-grabbing", isDragging && "opacity-40")}>
      <Link2 className="h-4 w-4 text-muted-foreground" />
      {item.label}
    </div>
  )
}

function MenuRow({ item, onRemove }: { item: MenuItem; onRemove: (id: string) => void }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: item.id })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("flex items-center gap-3 rounded-xl border bg-card px-3 py-3", isDragging && "dnd-lift opacity-90")}>
      <button type="button" {...attributes} {...listeners} className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing" aria-label={`Reorder ${item.label}`}>
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="font-display text-sm font-bold">{item.label}</span>
      <span className="ml-auto truncate font-mono text-[10px] text-muted-foreground">{item.href ?? "#"}</span>
      <button type="button" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.label}`} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><X className="h-4 w-4" /></button>
    </div>
  )
}

function MenuChip({ item }: { item: MenuItem }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 font-display text-sm font-bold dnd-lift">
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      {item.label}
    </div>
  )
}
