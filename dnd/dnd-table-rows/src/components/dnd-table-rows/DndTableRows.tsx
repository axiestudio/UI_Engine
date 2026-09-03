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
import { Button } from "@/components/ui/button"

// ═══ JOB         Reorder table rows.
// ═══ EMOTION     You set the data order, not the query.
// ═══ SIGNATURE   Sortable <tr> rows with a drag-into rank column.

export type TableRowData = { id: string; cells: React.ReactNode[]; meta?: string }

export type DndTableRowsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  headers?: string[]
  rows?: TableRowData[]
  onChange?: (rows: TableRowData[]) => void
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_DND_TABLE_ROWS_HEADERS = ["Treatment", "Min", "kr"]
const DEMO_DND_TABLE_ROWS_ROWS = [ { id: "r1", cells: ["Deep tissue", "60", "890"] }, { id: "r2", cells: ["Classic relaxation", "60", "790"] }, { id: "r3", cells: ["Prenatal", "45", "690"] }, { id: "r4", cells: ["Couples", "90", "1680"] }, ]


export function DndTableRows({
  eyebrow = "ROWS",
  title = "Reorder the table.",
  subtitle = "Grab any row and drag it to a new position. Column order never changes.",
  headers = DEMO_DND_TABLE_ROWS_HEADERS,
  rows = DEMO_DND_TABLE_ROWS_ROWS,
  onChange,
  className,
}: DndTableRowsProps) {
  const [internal, setInternal] = React.useState(rows)
  React.useEffect(() => { setInternal(rows) }, [rows])
  const list = internal
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const initialRef = React.useRef(rows)
  const handleReset = () => { setInternal(rows); onChange?.(rows); setAnnounce("Rows reset"); }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    setAnnounce(`Moved ${String(active.id)} to ${String(over?.id ?? "end")}`)
    if (!over || active.id === over.id) return
    const oldIndex = list.findIndex((r) => r.id === active.id)
    const newIndex = list.findIndex((r) => r.id === over.id)
    const next = arrayMove(list, oldIndex, newIndex)
    setInternal(next)
    onChange?.(next)
  }

  const active = activeId ? list.find((r) => r.id === activeId) : null

  return (
    <SectionShell width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/50 px-4 py-3 shadow-sm ">
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
        <div className="mt-8 overflow-hidden rounded-xl border bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="w-12 px-3 py-3" />
                {headers.map((h) => (
                  <th key={h} className="px-3 py-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{h}</th>
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
        {/* dnd-kit grip handle: listeners require a real <button> element, not the registry Button. */}
        <button type="button" {...attributes} {...listeners} className="flex cursor-grab touch-none items-center gap-2 text-muted-foreground active:cursor-grabbing" aria-label={`Reorder row ${index + 1}`}>
          <GripVertical className="h-4 w-4" />
          <span className="font-mono text-[10px] font-semibold tabular-nums">{String(index + 1).padStart(2, "0")}</span>
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
        <tr className="dnd-lift rounded-xl border bg-card shadow-sm">
          {row.cells.map((c, i) => (
            <td key={i} className="px-3 py-3 font-medium">{c}</td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}
