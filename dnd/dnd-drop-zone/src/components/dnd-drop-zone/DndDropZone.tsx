import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  useDraggable,
  type DragEndEvent,
} from "@dnd-kit/core"
import { GripVertical } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Drag loose items into one of several target slots.
// ═══ EMOTION     Assembly — fit the pieces into the right pocket.
// ═══ SIGNATURE   useDraggable + useDroppable, free placement (not sortable).

export type SlotItem = { id: string; label: string }
export type DropSlot = { id: string; label: string }

export type DndDropZoneProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  items: SlotItem[]
  slots: DropSlot[]
  onChange?: (assignments: Record<string, string>) => void
  className?: string
}

export function DndDropZone({
  eyebrow = "ASSEMBLE",
  title = "Fit it in.",
  subtitle = "Drag each piece into a slot. A slot only accepts one piece at a time.",
  items,
  slots,
  onChange,
  className,
}: DndDropZoneProps) {
  const [assignments, setAssignments] = React.useState<Record<string, string>>({})
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const assignedIds = React.useMemo(() => Object.values(assignments), [assignments])

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const itemId = String(active.id)
    const slotId = String(over.id)
    // remove item from any prior slot it occupied
    const next = { ...assignments }
    for (const [k, v] of Object.entries(next)) if (v === itemId) delete next[k]
    next[slotId] = itemId
    setAssignments(next)
    onChange?.(next)
  }

  const activeData = activeId ? items.find((i) => i.id === activeId) : null

  return (
    <SectionShell width={920} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Available — {items.length - assignedIds.length}</p>
          <div className="mt-3 space-y-2">
            {items.map((item) => {
              const placed = assignedIds.includes(item.id)
              return <DraggableItem key={item.id} item={item} disabled={placed} />
            })}
          </div>
        </div>
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Slots</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {slots.map((slot) => (
              <SlotBox key={slot.id} slot={slot} assigned={assignments[slot.id]} items={items} />
            ))}
          </div>
        </div>
      </div>
      <DndContext sensors={sensors} onDragStart={({ active }) => setActiveId(String(active.id))} onDragCancel={() => setActiveId(null)} onDragEnd={onDragEnd}>
        <DragOverlay>{activeData ? <ItemChip item={activeData} overlay /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function ItemChip({ item, overlay = false }: { item: SlotItem; overlay?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-xl border bg-card px-4 py-3 font-display text-sm font-bold", overlay && "dnd-lift")}>
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      {item.label}
    </div>
  )
}

function DraggableItem({ item, disabled }: { item: SlotItem; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id, disabled })
  if (disabled) return null
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn("flex cursor-grab touch-none items-center gap-2 rounded-xl border bg-card px-4 py-3 font-display text-sm font-bold transition-colors hover:bg-accent active:cursor-grabbing", isDragging && "opacity-40")}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      {item.label}
    </div>
  )
}

function SlotBox({ slot, assigned, items }: { slot: DropSlot; assigned?: string; items: SlotItem[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: slot.id })
  const placed = assigned ? items.find((i) => i.id === assigned) : undefined
  return (
    <div
      ref={setNodeRef}
      className={cn("min-h-[96px] rounded-2xl border bg-muted/30 p-3 transition-colors", isOver && "dnd-over")}
    >
      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{slot.label}</p>
      <div className="mt-2">
        {placed ? (
          <ItemChip item={placed} />
        ) : (
          <div className="flex h-[40px] items-center justify-center rounded-lg border border-dashed border-border font-mono text-[11px] text-muted-foreground">empty</div>
        )}
      </div>
    </div>
  )
}
