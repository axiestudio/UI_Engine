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
import { GripVertical } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Reorder table rows.
// ═══ EMOTION     You set the data order, not the query.
// ═══ SIGNATURE   Sortable <tr> rows with a drag-into rank column.

export type TableRowData = { id: string; cells: React.ReactNode[]; meta?: string }

export type DndTableRowsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  headers: string[]
  rows: TableRowData[]
  onChange?: (rows: TableRowData[]) => void
  className?: string
}

export function DndTableRows({
  eyebrow = "ROWS",
  title = "Reorder the table.",
  subtitle = "Grab any row and drag it to a new position. Column order never changes.",
  headers,
  rows,
  onChange,
  className,
}: DndTableRowsProps) {
  const [internal, setInternal] = React.useState(rows)
  const list = rows ?? internal
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = list.findIndex((r) => r.id === active.id)
    const newIndex = list.findIndex((r) => r.id === over.id)
    const next = arrayMove(list, oldIndex, newIndex)
    setInternal(next)
    onChange?.(next)
  }

  const active = activeId ? list.find((r) => r.id === activeId) : null

  return (
    <SectionShell width={920} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveId(String(active.id))} onDragCancel={() => setActiveId(null)} onDragEnd={onDragEnd}>
        <div className="mt-8 overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="w-12 px-3 py-3" />
                {headers.map((h) => (
                  <th key={h} className="px-3 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <SortableContext items={list.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {list.map((row, i) => (
                  <SortableRow key={row.id} row={row} index={i} colSpan={headers.length} />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </div>
        <DragOverlay>{active ? <ActiveRow row={active} /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function SortableRow({ row, index, colSpan }: { row: TableRowData; index: number; colSpan: number }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: row.id })
  return (
    <tr
      ref={setNodeRef}
      className={cn("border-b last:border-0", isDragging && "dnd-lift opacity-90")}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <td className="px-3 py-3">
        <button type="button" {...attributes} {...listeners} className="flex cursor-grab touch-none items-center gap-2 text-muted-foreground active:cursor-grabbing" aria-label={`Reorder row ${index + 1}`}>
          <GripVertical className="h-4 w-4" />
          <span className="font-mono text-[10px] font-bold tabular-nums">{String(index + 1).padStart(2, "0")}</span>
        </button>
      </td>
      {row.cells.map((c, i) => (
        <td key={i} className="px-3 py-3 font-medium">{c}</td>
      ))}
    </tr>
  )
}

function ActiveRow({ row }: { row: TableRowData }) {
  return (
    <table className="w-full text-left text-sm">
      <tbody>
        <tr className="dnd-lift rounded-xl border bg-card">
          {row.cells.map((c, i) => (
            <td key={i} className="px-3 py-3 font-medium">{c}</td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}
