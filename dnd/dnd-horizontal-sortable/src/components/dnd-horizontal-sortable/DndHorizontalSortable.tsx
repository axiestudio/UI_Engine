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
import { SortableContext, arrayMove, horizontalListSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Reorder a horizontal run of chips or steps.
// ═══ EMOTION     You're sequencing the plan.
// ═══ SIGNATURE   horizontalListSortingStrategy across a connected chip row.

export type ChipItem = { id: string; label: string; icon?: React.ReactNode }

export type DndHorizontalSortableProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  items?: ChipItem[]
  onChange?: (items: ChipItem[]) => void
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_DND_HORIZONTAL_SORTABLE_ITEMS = [ { id: "p1", label: "Choose" }, { id: "p2", label: "Book" }, { id: "p3", label: "Confirm" }, { id: "p4", label: "Arrive" }, ]


export function DndHorizontalSortable({
  eyebrow = "SEQ",
  title = "Order the steps.",
  subtitle = "Drag chips left or right to sequence them. Arrow keys work too.",
  items = DEMO_DND_HORIZONTAL_SORTABLE_ITEMS,
  onChange,
  className,
}: DndHorizontalSortableProps) {
  const [internal, setInternal] = React.useState(items)
  React.useEffect(() => { setInternal(items) }, [items])
  const list = internal
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const initialRef = React.useRef(items)
  const handleReset = () => {
    setInternal(initialRef.current)
    onChange?.(initialRef.current)
    setAnnounce("Sequence reset")
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    setAnnounce(`Moved ${String(active.id)} to ${String(over?.id ?? "end")}`)
    if (!over || active.id === over.id) return
    const oldIndex = list.findIndex((c) => c.id === active.id)
    const newIndex = list.findIndex((c) => c.id === over.id)
    const next = arrayMove(list, oldIndex, newIndex)
    setInternal(next)
    onChange?.(next)
  }

  const active = activeId ? list.find((c) => c.id === activeId) : null

  return (
    <SectionShell width={1120} rule="bottom" className={className}>
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
          <Button variant="outline" size="sm" onClick={handleReset} className="h-7 rounded-full px-3 text-xs font-medium shadow-sm">
            Reset
          </Button>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">A11y • Advanced</span>
        </div>
      </div>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announce}</div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveId(String(active.id))} onDragCancel={() => setActiveId(null)} onDragEnd={onDragEnd}>
        <SortableContext items={list.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
          <div className="mt-8 flex flex-wrap gap-3">
            {list.map((chip, i) => (
              <SortableChip key={chip.id} chip={chip} index={i} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>{active ? <SortableChip chip={active} index={list.findIndex((c) => c.id === active.id)} overlay /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function SortableChip({ chip, index, overlay = false }: { chip: ChipItem; index: number; overlay?: boolean }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: chip.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "flex cursor-grab touch-none items-center gap-2 rounded-full border bg-card py-2 pl-4 pr-3 active:cursor-grabbing",
        isDragging && "dnd-lift opacity-90",
        overlay && "dnd-lift",
      )}
    >
      <span className="font-mono text-[10px] font-bold tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
      {chip.icon}
      <span className="text-sm font-semibold tracking-tight">{chip.label}</span>
      <GripVertical className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}
