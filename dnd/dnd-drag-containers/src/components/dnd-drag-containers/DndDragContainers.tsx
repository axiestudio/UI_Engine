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
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Move cards between several independent containers.
// ═══ EMOTION     You re-route things freely.
// ═══ SIGNATURE   Multi-container cross-drop with live over-column moves (kanban-grade lift).

export type ContainerItem = { id: string; label: string }
export type DragContainer = { id: string; title: string; items: ContainerItem[] }

export type DndDragContainersProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  containers: DragContainer[]
  onChange?: (containers: DragContainer[]) => void
  className?: string
}

export function DndDragContainers({
  eyebrow = "MULTI",
  title = "Drag between containers.",
  subtitle = "Cards can move to any container — reorder within a column or cross the gap.",
  containers,
  onChange,
  className,
}: DndDragContainersProps) {
  const [state, setState] = React.useState(containers)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const findContainer = (id: string): string | null => {
    for (const c of state) if (c.items.some((i) => i.id === id)) return c.id
    return null
  }

  const onDragStart = ({ active }: DragStartEvent) => setActiveId(String(active.id))
  const onDragCancel = () => setActiveId(null)

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const activeIdv = String(active.id)
    const overId = String(over.id)
    const fromC = findContainer(activeIdv)
    const toC = findContainer(overId)
    if (!fromC || !toC || fromC === toC) return
    setState((prev) => {
      const removed = prev.map((c) => (c.id === fromC ? { ...c, items: c.items.filter((i) => i.id !== activeIdv) } : c))
      const moving = prev.find((c) => c.id === fromC)!.items.find((i) => i.id === activeIdv)!
      const overIdx = removed.find((c) => c.id === toC)!.items.findIndex((i) => i.id === overId)
      const insertAt = overIdx >= 0 ? overIdx : removed.find((c) => c.id === toC)!.items.length
      return removed.map((c) => (c.id === toC ? { ...c, items: [...c.items.slice(0, insertAt), moving, ...c.items.slice(insertAt)] } : c))
    })
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    if (!over) return
    // reorder within the same container
    const activeIdv = String(active.id)
    const overId = String(over.id)
    const cid = findContainer(activeIdv)
    const ocid = findContainer(overId)
    if (cid && cid === ocid) {
      const col = state.find((c) => c.id === cid)!
      const oldIndex = col.items.findIndex((i) => i.id === activeIdv)
      const newIndex = col.items.findIndex((i) => i.id === overId)
      if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
        const next = state.map((c) => (c.id === cid ? { ...c, items: arrayMove(col.items, oldIndex, newIndex) } : c))
        setState(next)
        onChange?.(next)
      }
      return
    }
    onChange?.(state)
  }

  const active = activeId ? state.flatMap((c) => c.items).find((i) => i.id === activeId) : null

  return (
    <SectionShell width={1120} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragCancel={onDragCancel} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {state.map((c) => (
            <ContainerBox key={c.id} container={c} />
          ))}
        </div>
        <DragOverlay>{active ? <ContainerItemCard item={active} overlay /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function ContainerBox({ container }: { container: DragContainer }) {
  const { setNodeRef, isOver } = useSortable({ id: container.id, data: { type: "container" } })
  return (
    <div ref={setNodeRef} className={cn("flex flex-col rounded-2xl border bg-muted/30 p-3", isOver && "dnd-over")}>
      <div className="flex items-center justify-between px-2 pb-2">
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{container.title}</p>
        <span className="rounded-full bg-accent px-2 font-mono text-[10px] font-bold tabular-nums">{container.items.length}</span>
      </div>
      <SortableContext items={container.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[120px] space-y-2">
          {container.items.map((item) => (
            <ContainerItemCard key={item.id} item={item} />
          ))}
        </div>
      </SortableContext>
      <button type="button" className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-accent">
        <Plus className="h-3.5 w-3.5" /> add
      </button>
    </div>
  )
}

function ContainerItemCard({ item, overlay = false }: { item: ContainerItem; overlay?: boolean }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: item.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn("flex cursor-grab touch-none items-center gap-2 rounded-xl border bg-card px-3 py-3 active:cursor-grabbing", isDragging && "dnd-lift opacity-90", overlay && "dnd-lift")}
    >
      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
      <p className="flex-1 font-display text-sm font-bold">{item.label}</p>
    </div>
  )
}
