import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Reorder a nav sidebar's items.
// ═══ EMOTION     Your navigation, your order.
// ═══ SIGNATURE   A collapsible rail with sortable nav items.

export type SideItem = { id: string; label: string; icon?: React.ReactNode }

export type DndSidebarReorderProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  items: SideItem[]
  onChange?: (items: SideItem[]) => void
  className?: string
}

export function DndSidebarReorder({
  eyebrow = "NAV",
  title = "Order the sidebar.",
  subtitle = "Drag items to reorder the navigation — collapse the rail to preview the compact view.",
  items,
  onChange,
  className,
}: DndSidebarReorderProps) {
  const [internal, setInternal] = React.useState(items)
  React.useEffect(() => { setInternal(items) }, [items])
  const list = internal
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const [collapsed, setCollapsed] = React.useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = list.findIndex((i) => i.id === active.id)
    const newIndex = list.findIndex((i) => i.id === over.id)
    const next = arrayMove(list, oldIndex, newIndex)
    setInternal(next)
    onChange?.(next)
  }

  const active = activeId ? list.find((i) => i.id === activeId) : null

  return (
    <SectionShell width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/50 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
            {list.length} items
          </span>
          <span className="hidden sm:inline text-xs font-medium text-muted-foreground">Drag or keyboard — Tab → Space → Arrows</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setInternal(items); onChange?.(items); setAnnounce("Navigation reset") }} className="h-7 rounded-full px-3 text-xs font-medium shadow-sm">
            Reset
          </Button>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">A11y • Advanced</span>
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announce}</div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveId(String(active.id))} onDragCancel={() => setActiveId(null)} onDragEnd={onDragEnd}>
          <aside className={cn("rounded-xl border bg-card p-2 transition-[width] duration-200", collapsed ? "w-[68px]" : "w-[240px]")}>
            <div className="flex h-9 items-center justify-end px-1">
              <button type="button" onClick={() => setCollapsed((v) => !v)} aria-label="Toggle sidebar" className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent">
                {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </button>
            </div>
            <SortableContext items={list.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <nav className="mt-1 space-y-1">
                {list.map((item) => (
                  <NavRow key={item.id} item={item} collapsed={collapsed} />
                ))}
              </nav>
            </SortableContext>
          </aside>
          <DragOverlay>{active ? <NavRow item={active} collapsed={false} overlay /> : null}</DragOverlay>
        </DndContext>
        <div className="rounded-xl border bg-muted/20 p-8">
          <p className="font-display text-lg font-bold">Selected content</p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">This is where the active route's content renders. Reordering the sidebar only changes the navigation order.</p>
        </div>
      </div>
    </SectionShell>
  )
}

function NavRow({ item, collapsed, overlay = false }: { item: SideItem; collapsed: boolean; overlay?: boolean }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: item.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "flex cursor-grab touch-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:cursor-grabbing",
        collapsed && "justify-center",
        isDragging && "dnd-lift opacity-90",
        overlay && "dnd-lift",
      )}
    >
      {item.icon}
      {!collapsed && <span className="flex-1 font-display text-sm font-bold">{item.label}</span>}
      {!collapsed && <GripVertical className="h-4 w-4 opacity-50" />}
    </div>
  )
}
