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
import { Button } from "@/components/ui/button"

// ═══ JOB         Move tasks across a lifecycle board, with a live a11y announcer.
// ═══ EMOTION     Momentum — work visibly advances.
// ═══ SIGNATURE   Three-column lifecycle DnD + screen-reader announcements.

export type TaskItem = { id: string; title: string; kind?: "todo" | "doing" | "done" }

export type DndTaskBoardProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  tasks?: TaskItem[]
  onChange?: (tasks: TaskItem[]) => void
  className?: string
}

const COLUMNS = [
  { id: "todo", title: "To do", icon: Circle },
  { id: "doing", title: "In progress", icon: Clock3 },
  { id: "done", title: "Done", icon: CheckCircle2 },
] as const

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_DND_TASK_BOARD_TASKS: TaskItem[] = [ { id: "ta1", title: "Sketch wireframes", kind: "todo" }, { id: "ta2", title: "Write tokens", kind: "doing" }, { id: "ta3", title: "Land the hero", kind: "done" }, ]


export function DndTaskBoard({ eyebrow = "LIFEBOARD", title = "Move work forward.", subtitle = "Drag a task across the board. It announces its move for a consistent experience.", tasks = DEMO_DND_TASK_BOARD_TASKS, onChange, className }: DndTaskBoardProps) {
  const [state, setState] = React.useState(tasks)
  React.useEffect(() => { setState(tasks) }, [tasks])
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const initialRef = React.useRef(tasks)
  const handleReset = () => {
    setState(initialRef.current)
    onChange?.(initialRef.current)
    setAnnounce("Board reset")
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const promote = (task: TaskItem, kind: TaskItem["kind"]) => {
    setAnnounce(`${task.title} moved to ${kind}`)
  }

  const onDragStart = ({ active }: DragStartEvent) => setActiveId(String(active.id))

  const findKind = React.useCallback((id: string, snap: TaskItem[]): TaskItem["kind"] | null => {
    const t = snap.find((x) => x.id === id)
    if (t?.kind) return t.kind
    if ((COLUMNS as readonly { id: string }[]).some((c) => c.id === id)) return id as TaskItem["kind"]
    return null
  }, [])

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const activeIdv = String(active.id)
    const overId = String(over.id)
    setState((prev) => {
      const activeKind = findKind(activeIdv, prev)
      const overKind = findKind(overId, prev)
      if (!activeKind || !overKind || activeKind === overKind) return prev
      const overTask = prev.find((t) => t.id === overId)
      const targetKind = overTask?.kind ?? overKind
      const next = prev.map((t) => (t.id === activeIdv ? { ...t, kind: targetKind } : t))
      queueMicrotask(() => {
        const movedTask = prev.find((x) => x.id === activeIdv)
        if (movedTask) promote(movedTask, targetKind)
        onChange?.(next)
      })
      return next
    })
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    if (!over) return
    const activeIdv = String(active.id)
    const overId = String(over.id)
    setState((prev) => {
      const activeKind = findKind(activeIdv, prev)
      const overKind = findKind(overId, prev)
      if (!activeKind) return prev
      const sameKind = activeKind === overKind && activeKind !== null
      if (sameKind) {
        const list = prev.filter((t) => t.kind === activeKind)
        const oldIndex = list.findIndex((t) => t.id === activeIdv)
        const newIndex = list.findIndex((t) => t.id === overId)
        if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
          const moved = arrayMove(list, oldIndex, newIndex)
          const nextKind = activeKind
          const others = prev.filter((t) => t.kind !== nextKind)
          const next = [...others, ...moved]
          queueMicrotask(() => onChange?.(next))
          return next
        }
      } else if (overKind) {
        queueMicrotask(() => onChange?.(prev))
      }
      return prev
    })
  }

  const active = activeId ? state.find((t) => t.id === activeId) : null

  return (
    <SectionShell width={1280} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/50 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
            {state.length} items
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
    <div ref={setNodeRef} className={cn("rounded-xl border bg-muted/30 p-3", isOver && "dnd-over")}>
      <div className="flex items-center justify-between px-2 pb-2">
        <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <Icon className="h-4 w-4" /> {def.title}
        </p>
        <span className="rounded-full bg-accent px-2 font-mono text-[10px] font-semibold tabular-nums">{items.length}</span>
      </div>
      <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[160px] space-y-2">
          {items.map((t) => (
            <TaskCard key={t.id} task={t} />
          ))}
        </div>
      </SortableContext>
      <Button variant="outline" size="sm" onClick={onAdd} className="mt-2 w-full border-dashed font-mono text-[10px] font-semibold uppercase tracking-widest">
        <Plus className="h-3.5 w-3.5" /> add
      </Button>
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
      <p className="flex-1 text-sm font-semibold tracking-tight">{task.title}</p>
      <Button variant="ghost" size="icon-sm" aria-label={`Delete ${task.title}`} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
