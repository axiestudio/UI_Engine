import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, rectSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, LayoutGrid } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Rearrange dashboard widgets across a multi-zone grid.
// ═══ EMOTION     Your dashboard, your composition.
// ═══ SIGNATURE   Widgets move between named zones via a drag-over remap.

export type Widget = { id: string; title: string; body?: string }
export type WidgetZone = { id: string; title: string; widgets: Widget[] }

export type DndDashboardWidgetsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  zones: WidgetZone[]
  onChange?: (zones: WidgetZone[]) => void
  onReset?: () => void
  className?: string
}

export function DndDashboardWidgets({
  eyebrow = "DASH",
  title = "Compose your dashboard.",
  subtitle = "Move widgets between zones or reorder within a zone. Every zone re-flows instantly.",
  zones,
  onChange,
  className,
}: DndDashboardWidgetsProps) {
  const [state, setState] = React.useState(zones)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const findZone = (id: string): string | null => {
    for (const z of state) if (z.widgets.some((w) => w.id === id)) return z.id
    return null
  }

  const onDragStart = ({ active }: DragStartEvent) => setActiveId(String(active.id))
  const onDragCancel = () => setActiveId(null)

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const aId = String(active.id)
    const oId = String(over.id)
    const fromZ = findZone(aId)
    const toZ = findZone(oId)
    if (!fromZ || !toZ || fromZ === toZ) return
    setState((prev) => {
      const moving = prev.find((z) => z.id === fromZ)!.widgets.find((w) => w.id === aId)!
      const without = prev.map((z) => (z.id === fromZ ? { ...z, widgets: z.widgets.filter((w) => w.id !== aId) } : z))
      const oIdx = without.find((z) => z.id === toZ)!.widgets.findIndex((w) => w.id === oId)
      const insertAt = oIdx >= 0 ? oIdx : without.find((z) => z.id === toZ)!.widgets.length
      return without.map((z) => (z.id === toZ ? { ...z, widgets: [...z.widgets.slice(0, insertAt), moving, ...z.widgets.slice(insertAt)] } : z))
    })
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    if (!over) return
    const aId = String(active.id)
    const oId = String(over.id)
    const zid = findZone(aId)
    if (zid && findZone(oId) === zid) {
      const zone = state.find((z) => z.id === zid)!
      const oldIndex = zone.widgets.findIndex((w) => w.id === aId)
      const newIndex = zone.widgets.findIndex((w) => w.id === oId)
      if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
        const next = state.map((z) => (z.id === zid ? { ...z, widgets: arrayMove(zone.widgets, oldIndex, newIndex) } : z))
        setState(next)
        onChange?.(next)
      }
      return
    }
    onChange?.(state)
  }

  const active = activeId ? state.flatMap((z) => z.widgets).find((w) => w.id === activeId) : null

  return (
    <SectionShell width={1280} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragCancel={onDragCancel} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {state.map((zone) => (
            <Zone key={zone.id} zone={zone} />
          ))}
        </div>
        <DragOverlay>{active ? <WidgetCard widget={active} overlay /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function Zone({ zone }: { zone: WidgetZone }) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-3">
      <p className="flex items-center gap-2 px-1 pb-2 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        <LayoutGrid className="h-3.5 w-3.5" /> {zone.title}
        <span className="ml-auto rounded-full bg-accent px-2 font-mono text-[10px] font-bold tabular-nums">{zone.widgets.length}</span>
      </p>
      <SortableContext items={zone.widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
        <div className="grid min-h-[120px] grid-cols-1 gap-2 sm:grid-cols-2">
          {zone.widgets.map((w) => (
            <WidgetCard key={w.id} widget={w} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

function WidgetCard({ widget, overlay = false }: { widget: Widget; overlay?: boolean }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: widget.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn("flex cursor-grab touch-none flex-col rounded-xl border bg-card p-4 active:cursor-grabbing", isDragging && "dnd-lift opacity-90", overlay && "dnd-lift")}
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-bold">{widget.title}</p>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      {widget.body && <p className="mt-2 text-xs font-medium leading-relaxed text-muted-foreground">{widget.body}</p>}
    </div>
  )
}
