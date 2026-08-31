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
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Let a visitor reorder a vertical list.
// ═══ EMOTION     Direct, satisfying, immediately reversible.
// ═══ SIGNATURE   dnd-kit sortable rows with a drag handle + keyboard sort.

export type DndSortableListItem = { id: string; title: string; description?: string; tag?: string }

export type DndSortableListProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  items: DndSortableListItem[]
  onChange?: (items: DndSortableListItem[]) => void
  tone?: "paper" | "ink"
  className?: string
}

export function DndSortableList({
  eyebrow = "SORTABLE",
  title = "Reorder the list.",
  subtitle = "Grab a handle and drag, or focus an item and use arrow keys.",
  items,
  onChange,
  tone = "paper",
  className,
}: DndSortableListProps) {
  const [internal, setInternal] = React.useState(items)
  const list = items ?? internal
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const ink = tone === "ink"

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (e: DragEndEvent) => {
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
    <SectionShell tone={tone} width={760} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveId(String(active.id))} onDragCancel={() => setActiveId(null)} onDragEnd={handleDragEnd}>
        <SortableContext items={list.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="mt-8 space-y-3">
            {list.map((item, i) => (
              <SortableRow key={item.id} item={item} index={i} ink={ink} />
            ))}
          </ul>
        </SortableContext>
        <DragOverlay>
          {active ? <SortableRow item={active} index={list.findIndex((i) => i.id === active.id)} ink={ink} overlay /> : null}
        </DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function SortableRow({
  item,
  index,
  ink,
  overlay = false,
}: {
  item: DndSortableListItem
  index: number
  ink: boolean
  overlay?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-4 transition-shadow",
        ink ? "border-background/15 bg-background/5" : "border-border bg-card",
        isDragging && "dnd-lift opacity-90",
        overlay && "dnd-lift",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${item.title}`}
        className="flex h-9 w-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className={cn("font-mono text-[11px] font-bold tabular-nums", ink ? "text-background/50" : "text-muted-foreground")}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display font-bold">{item.title}</p>
        {item.description && <p className={cn("truncate text-sm font-medium", ink ? "text-background/65" : "text-muted-foreground")}>{item.description}</p>}
      </div>
      {item.tag && (
        <span className={cn("rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "border-background/20" : "border-border")}>
          {item.tag}
        </span>
      )}
    </li>
  )
}
