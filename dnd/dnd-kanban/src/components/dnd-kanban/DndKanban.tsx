import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Move cards between columns of a kanban board.
// ═══ EMOTION     Control — you own the pipeline.
// ═══ SIGNATURE   Cross-column sortable columns, closescorners collision.

export type KanbanCard = { id: string; title: string; tag?: string }
export type KanbanColumn = { id: string; title: string; accent?: string; cards: KanbanCard[] }

export type DndKanbanProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  columns: KanbanColumn[]
  onChange?: (columns: KanbanColumn[]) => void
  className?: string
}

export function DndKanban({ eyebrow = "KANBAN", title = "Move the cards.", subtitle = "Drag a card between columns, or sort within a column. Keyboard works too.", columns, onChange, className }: DndKanbanProps) {
  const [state, setState] = React.useState(columns)
  const [activeCard, setActiveCard] = React.useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const findColumn = React.useCallback((id: string): string | null => {
    for (const col of state) if (col.cards.some((c) => c.id === id)) return col.id
    return null
  }, [state])

  const onDragStart = ({ active }: DragStartEvent) => setActiveCard(String(active.id))
  const onDragCancel = () => setActiveCard(null)

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)
    const activeCol = findColumn(activeId)
    const overCol = findColumn(overId)
    if (!activeCol || !overCol || activeCol === overCol) return

    setState((prev) => {
      const withNew = prev.map((col) => {
        if (col.id === activeCol) return { ...col, cards: col.cards.filter((c) => c.id !== activeId) }
        return col
      })
      return withNew.map((col) => {
        if (col.id === overCol) {
          const targetIndex = col.cards.findIndex((c) => c.id === overId)
          const idx = targetIndex >= 0 ? targetIndex : col.cards.length
          const moving = prev.find((c) => c.id === activeCol)!.cards.find((c) => c.id === activeId)!
          return { ...col, cards: [...col.cards.slice(0, idx), moving, ...col.cards.slice(idx)] }
        }
        return col
      })
    })
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveCard(null)
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)
    const activeCol = findColumn(activeId)
    const overCol = findColumn(overId)
    if (!activeCol || !overCol) return

    if (activeCol === overCol) {
      const col = state.find((c) => c.id === activeCol)!
      const oldIndex = col.cards.findIndex((c) => c.id === activeId)
      const newIndex = col.cards.findIndex((c) => c.id === overId)
      if (oldIndex !== newIndex && newIndex >= 0) {
        const next = state.map((c) => (c.id === activeCol ? { ...c, cards: arrayMove(col.cards, oldIndex, newIndex) } : c))
        setState(next)
        onChange?.(next)
      }
    }
  }

  const activeCardData = activeCard
    ? state.flatMap((c) => c.cards).find((c) => c.id === activeCard)
    : null

  return (
    <SectionShell width={1280} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragCancel={onDragCancel} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {state.map((col) => (
            <Column key={col.id} col={col} />
          ))}
        </div>
        <DragOverlay>
          {activeCardData ? (
            <div className="dnd-lift rounded-xl border bg-card p-4">
              <p className="font-display font-bold">{activeCardData.title}</p>
              {activeCardData.tag && <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{activeCardData.tag}</p>}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function Column({ col }: { col: KanbanColumn }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: col.id, data: { type: "column" } })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("rounded-2xl border bg-muted/30 p-3", isDragging && "dnd-over")}
    >
      <div {...attributes} {...listeners} className="flex cursor-grab items-center justify-between px-2 pb-2 pt-1 active:cursor-grabbing">
        <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <GripVertical className="h-3.5 w-3.5" />
          {col.title}
        </p>
        <span className="rounded-full bg-accent px-2 font-mono text-[10px] font-bold tabular-nums">{col.cards.length}</span>
      </div>
      <SortableContext items={col.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[120px] space-y-2">
          {col.cards.map((card) => (
            <KanbanRow key={card.id} card={card} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

function KanbanRow({ card }: { card: KanbanCard }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: card.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn("cursor-grab touch-none rounded-xl border bg-card p-4 active:cursor-grabbing", isDragging && "dnd-lift")}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-sm font-bold">{card.title}</p>
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
      {card.tag && <p className="mt-2 inline-block rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{card.tag}</p>}
    </div>
  )
}
