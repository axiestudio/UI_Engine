import * as React from "react"
import { closestCenter, 
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  type DragEndEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates,  SortableContext, horizontalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
  React.useEffect(() => { setInternal(columns) }, [columns])
  const list = internal
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")

  const sensors = useSensors(useSensor(PointerSensor,
  KeyboardSensor, { activationConstraint: { distance: 6 } }))

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
    <SectionShell width={920} rule="bottom" className={className}>
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
          <Button variant="outline" size="sm" onClick={() => { setInternal(columns); onChange?.(columns); setAnnounce("Columns reset") }} className="h-7 rounded-full px-3 text-xs font-medium shadow-sm">
            Reset
          </Button>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">A11y • Advanced</span>
        </div>
      </div>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announce}</div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveId(String(active.id))} onDragCancel={() => setActiveId(null)} onDragEnd={onDragEnd}>
        <div className="mt-8 overflow-hidden rounded-xl border bg-card shadow-sm">
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
