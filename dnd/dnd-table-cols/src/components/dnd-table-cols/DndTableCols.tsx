import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Reorder table columns and keep the matching cells in sync.
// ═══ EMOTION     You shape the report, not the schema.
// ═══ SIGNATURE   A horizontal sortable header whose order drives the body cells.

export type ColDef = { id: string; label: string; width?: string }

export type DndTableColsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  columns: ColDef[]
  /** Rows keyed by column id. */
  rows: Record<string, React.ReactNode>[]
  onChange?: (columns: ColDef[]) => void
  className?: string
}

export function DndTableCols({
  eyebrow = "COLS",
  title = "Reshape the columns.",
  subtitle = "Drag the header cells to move whole columns — the values follow.",
  columns,
  rows,
  onChange,
  className,
}: DndTableColsProps) {
  const [internal, setInternal] = React.useState(columns)
  const list = columns ?? internal
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = list.findIndex((c) => c.id === active.id)
    const newIndex = list.findIndex((c) => c.id === over.id)
    const next = arrayMove(list, oldIndex, newIndex)
    setInternal(next)
    onChange?.(next)
  }

  const active = activeId ? list.find((c) => c.id === activeId) : null

  return (
    <SectionShell width={920} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <DndContext sensors={sensors} onDragStart={({ active }) => setActiveId(String(active.id))} onDragCancel={() => setActiveId(null)} onDragEnd={onDragEnd}>
        <div className="mt-8 overflow-hidden rounded-2xl border bg-card">
          <SortableContext items={list.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex border-b bg-muted/40">
              {list.map((col, i) => (
                <SortableColHeader key={col.id} col={col} index={i} width={col.width} />
              ))}
            </div>
            <div>
              {rows.map((row, ri) => (
                <div key={ri} className="flex border-b last:border-0">
                  {list.map((col) => (
                    <div key={col.id} className="min-w-0 flex-1 px-3 py-3 text-sm font-medium">{row[col.id]}</div>
                  ))}
                </div>
              ))}
            </div>
          </SortableContext>
        </div>
        <DragOverlay>{active ? <HeaderChip col={active} overlay /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function SortableColHeader({ col, index, width }: { col: ColDef; index: number; width?: string }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: col.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, width: width ?? undefined }}
      {...attributes}
      {...listeners}
      className={cn("flex cursor-grab touch-none items-center gap-1 px-3 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground active:cursor-grabbing", isDragging && "dnd-lift opacity-90")}
    >
      <GripVertical className="h-3.5 w-3.5" />
      {col.label}
      <span className="font-mono text-[9px] text-muted-foreground/60">{index + 1}</span>
    </div>
  )
}

function HeaderChip({ col, overlay = false }: { col: ColDef; overlay?: boolean }) {
  const { attributes, listeners } = useDraggable({ id: col.id })
  return (
    <div {...attributes} {...listeners} className={cn("flex items-center gap-1 rounded-lg border bg-card px-3 py-3 font-mono text-[11px] font-bold uppercase tracking-widest", overlay && "dnd-lift")}>
      <GripVertical className="h-3.5 w-3.5" />
      {col.label}
    </div>
  )
}
