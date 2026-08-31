import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CheckCircle2, Circle, Clock3, GripVertical, Plus, Trash2 } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Move tasks across a lifecycle board, with a live a11y announcer.
// ═══ EMOTION     Momentum — work visibly advances.
// ═══ SIGNATURE   Three-column lifecycle DnD + screen-reader announcements.

export type TaskItem = { id: string; title: string; kind?: "todo" | "doing" | "done" }

export type DndTaskBoardProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  tasks: TaskItem[]
  onChange?: (tasks: TaskItem[]) => void
  className?: string
}

const COLUMNS = [
  { id: "todo", title: "To do", icon: Circle },
  { id: "doing", title: "In progress", icon: Clock3 },
  { id: "done", title: "Done", icon: CheckCircle2 },
] as const

export function DndTaskBoard({ eyebrow = "LIFEBOARD", title = "Move work forward.", subtitle = "Drag a task across the board. It announces its move for a consistent experience.", tasks, onChange, className }: DndTaskBoardProps) {
  const [state, setState] = React.useState(tasks)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const promote = (task: TaskItem, kind: TaskItem["kind"]) => {
    setAnnounce(`${task.title} moved to ${kind}`)
  }

  const onDragStart = ({ active }: DragStartEvent) => setActiveId(String(active.id))

  const findKind = (id: string): TaskItem["kind"] | null => {
    const t = state.find((x) => x.id === id)
    return t?.kind ?? null
  }

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const activeIdv = String(active.id)
    const overId = String(over.id)
    const activeKind = findKind(activeIdv)
    const overTask = state.find((t) => t.id === overId)
    if (activeKind && overTask && overTask.kind !== activeKind) {
      setState((prev) => prev.map((t) => (t.id === activeIdv ? { ...t, kind: overTask.kind } : t)))
      promote(overTask, overTask.kind)
    }
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    if (!over) return
    const activeIdv = String(active.id)
    const overId = String(over.id)
    const activeKind = findKind(activeIdv)
    const overKind = findKind(overId)
    const sameKind = activeKind === overKind && activeKind !== null
    const list = state.filter((t) => t.kind === activeKind)
    const oldIndex = list.findIndex((t) => t.id === activeIdv)
    const newIndex = list.findIndex((t) => t.id === overId)
    if (sameKind && oldIndex !== newIndex && newIndex >= 0) {
      const moved = arrayMove(list, oldIndex, newIndex)
      const nextKind = activeKind
      const others = state.filter((t) => t.kind !== nextKind)
      const next = [...others, ...moved]
      setState(next)
      onChange?.(next)
    }
  }

  const active = activeId ? state.find((t) => t.id === activeId) : null

  return (
    <SectionShell width={1280} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <div className="sr-only" role="status" aria-live="polite">{announce}</div>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragCancel={() => setActiveId(null)} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {COLUMNS.map((col) => {
            const items = state.filter((t) => t.kind === col.id)
            return <BoardColumn key={col.id} def={col} items={items} onAdd={() => {}} />
          })}
        </div>
        <DragOverlay>{active ? <TaskCard task={active} overlay /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function BoardColumn({ def, items, onAdd }: { def: { id: string; title: string; icon: React.ElementType }; items: TaskItem[]; onAdd: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: def.id })
  const Icon = def.icon
  return (
    <div ref={setNodeRef} className={cn("rounded-2xl border bg-muted/30 p-3", isOver && "dnd-over")}>
      <div className="flex items-center justify-between px-2 pb-2">
        <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <Icon className="h-4 w-4" /> {def.title}
        </p>
        <span className="rounded-full bg-accent px-2 font-mono text-[10px] font-bold tabular-nums">{items.length}</span>
      </div>
      <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[160px] space-y-2">
          {items.map((t) => (
            <TaskCard key={t.id} task={t} />
          ))}
        </div>
      </SortableContext>
      <button type="button" onClick={onAdd} className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-accent">
        <Plus className="h-3.5 w-3.5" /> add
      </button>
    </div>
  )
}

function TaskCard({ task, overlay = false }: { task: TaskItem; overlay?: boolean }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: task.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn("flex cursor-grab touch-none items-center gap-2 rounded-xl border bg-card px-3 py-3 active:cursor-grabbing", isDragging && "dnd-lift opacity-90", overlay && "dnd-lift")}
    >
      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
      <p className="flex-1 font-display text-sm font-bold">{task.title}</p>
      <button type="button" aria-label={`Delete ${task.title}`} className="text-muted-foreground transition-colors hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
