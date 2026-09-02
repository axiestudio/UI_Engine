import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Move cards between several independent containers.
// ═══ EMOTION     You re-route things freely.
// ═══ SIGNATURE   Multi-container cross-drop with live over-column moves (kanban-grade lift).

export type ContainerItem = { id: string; label: string }
export type DragContainer = { id: string; title: string; items: ContainerItem[] }

export type DndDragContainersProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  containers?: DragContainer[]
  onChange?: (containers: DragContainer[]) => void
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_DND_DRAG_CONTAINERS_CONTAINERS = [ { id: "c1", title: "Queue", items: [{ id: "q1", label: "Set up repo" }, { id: "q2", label: "Write tokens" }] }, { id: "c2", title: "Doing", items: [{ id: "d1", label: "Build sidebar" }] }, { id: "c3", title: "Done", items: [{ id: "s1", label: "Design system" }] }, ]


export function DndDragContainers({
  eyebrow = "MULTI",
  title = "Drag between containers.",
  subtitle = "Cards can move to any container — reorder within a column or cross the gap.",
  containers = DEMO_DND_DRAG_CONTAINERS_CONTAINERS,
  onChange,
  className,
}: DndDragContainersProps) {
  const [state, setState] = React.useState(containers)
  React.useEffect(() => { setState(containers) }, [containers])
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const initialRef = React.useRef(containers)
  const handleReset = () => {
    setState(initialRef.current)
    onChange?.(initialRef.current)
    setAnnounce("Containers reset")
  }
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const getContainerForId = React.useCallback((id: string, snap: DragContainer[]): string | null => {
    if (snap.some((c) => c.id === id)) return id
    for (const c of snap) if (c.items.some((i) => i.id === id)) return c.id
    return null
  }, [])

  const findContainer = React.useCallback((id: string): string | null => getContainerForId(id, state), [state, getContainerForId])

  const onDragStart = ({ active }: DragStartEvent) => setActiveId(String(active.id))
  const onDragCancel = () => setActiveId(null)

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const activeIdv = String(active.id)
    const overId = String(over.id)
    setState((prev) => {
      const fromC = getContainerForId(activeIdv, prev)
      const toC = getContainerForId(overId, prev)
      if (!fromC || !toC || fromC === toC) return prev
      const moving = prev.find((c) => c.id === fromC)!.items.find((i) => i.id === activeIdv)
      if (!moving) return prev
      const removed = prev.map((c) => (c.id === fromC ? { ...c, items: c.items.filter((i) => i.id !== activeIdv) } : c))
      const overIdx = removed.find((c) => c.id === toC)!.items.findIndex((i) => i.id === overId)
      const insertAt = overIdx >= 0 ? overIdx : removed.find((c) => c.id === toC)!.items.length
      const next = removed.map((c) =>
        c.id === toC ? { ...c, items: [...c.items.slice(0, insertAt), moving, ...c.items.slice(insertAt)] } : c,
      )
      queueMicrotask(() => onChange?.(next))
      return next
    })
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    setAnnounce(`Moved ${String(active.id)}`)
    if (!over) return
    const activeIdv = String(active.id)
    const overId = String(over.id)
    setState((prev) => {
      const cid = getContainerForId(activeIdv, prev)
      const ocid = getContainerForId(overId, prev)
      if (cid && cid === ocid) {
        const col = prev.find((c) => c.id === cid)!
        const oldIndex = col.items.findIndex((i) => i.id === activeIdv)
        const newIndex = col.items.findIndex((i) => i.id === overId)
        if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
          const next = prev.map((c) => (c.id === cid ? { ...c, items: arrayMove(col.items, oldIndex, newIndex) } : c))
          queueMicrotask(() => onChange?.(next))
          return next
        }
      } else if (cid && ocid) {
        queueMicrotask(() => onChange?.(prev))
      }
      return prev
    })
  }

  const active = activeId ? state.flatMap((c) => c.items).find((i) => i.id === activeId) : null

  return (
    <SectionShell width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/50 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
            {state.flatMap(c=>c.items).length} items
          </span>
          <span className="hidden sm:inline text-xs font-medium text-muted-foreground">Drag or keyboard — Tab → Space → Arrows</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="h-7 rounded-full px-3 text-xs font-medium shadow-sm">
            Reset
          </Button>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">A11y • Advanced</span>
        </div>
      </div>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announce}</div>
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
    <div ref={setNodeRef} className={cn("flex flex-col rounded-xl border bg-muted/30 p-3", isOver && "dnd-over")}>
      <div className="flex items-center justify-between px-2 pb-2">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{container.title}</p>
        <span className="rounded-full bg-accent px-2 font-mono text-[10px] font-semibold tabular-nums">{container.items.length}</span>
      </div>
      <SortableContext items={container.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[120px] space-y-2">
          {container.items.map((item) => (
            <ContainerItemCard key={item.id} item={item} />
          ))}
        </div>
      </SortableContext>
      <Button variant="outline" size="sm" className="mt-2 w-full border-dashed font-mono text-[10px] font-semibold uppercase tracking-widest">
        <Plus className="h-3.5 w-3.5" /> add
      </Button>
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
      <p className="flex-1 text-sm font-semibold tracking-tight">{item.label}</p>
    </div>
  )
}
