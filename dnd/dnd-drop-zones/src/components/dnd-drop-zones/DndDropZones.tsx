import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { GripVertical, CheckCircle2 } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Route dropped items to specific regions, filtering the rest.
// ═══ EMOTION     Clear accept/reject feedback.
// ═══ SIGNATURE   Multiple droppable zones where each accepts only a matching category.

export type ZoneItem = { id: string; label: string; kind: string }
export type ZoneDef = { id: string; title: string; kinds: string[] }

export type DndDropZonesProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  items: ZoneItem[]
  zones: ZoneDef[]
  onChange?: (assignments: Record<string, string>) => void
  className?: string
}

export function DndDropZones({
  eyebrow = "ZONES",
  title = "Route each piece.",
  subtitle = "Each zone only accepts the kinds it declares — drop the rest back and it snaps home.",
  items,
  zones,
  onChange,
  className,
}: DndDropZonesProps) {
  const [assignments, setAssignments] = React.useState<Record<string, string>>({})
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const assignedIds = React.useMemo(() => Object.values(assignments), [assignments])

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const itemId = String(active.id)
    const zoneId = String(over.id)
    const item = items.find((i) => i.id === itemId)
    const zone = zones.find((z) => z.id === zoneId)
    if (!item || !zone) return
    if (!zone.kinds.includes(item.kind)) return // reject: stays put
    const next = { ...assignments }
    for (const [k, v] of Object.entries(next)) if (v === itemId) delete next[k]
    next[zoneId] = itemId
    setAssignments(next)
    onChange?.(next)
  }

  const activeData = activeId ? items.find((i) => i.id === activeId) : null

  return (
    <SectionShell width={1120} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <DndContext sensors={sensors} onDragStart={({ active }) => setActiveId(String(active.id))} onDragCancel={() => setActiveId(null)} onDragEnd={onDragEnd}>
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Palette</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {items.map((item) => {
                const placed = assignedIds.includes(item.id)
                if (placed) return null
                return <PaletteChip key={item.id} item={item} />
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {zones.map((zone) => (
              <ZoneBox key={zone.id} zone={zone} assigned={assignments[zone.id]} item={items.find((i) => i.id === assignments[zone.id])} />
            ))}
          </div>
        </div>
        <DragOverlay>{activeData ? <PaletteChip item={activeData} overlay /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function PaletteChip({ item, overlay = false }: { item: ZoneItem; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id })
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn("flex cursor-grab touch-none items-center gap-2 rounded-xl border bg-card px-3 py-2 font-display text-sm font-bold active:cursor-grabbing", isDragging && "opacity-40", overlay && "dnd-lift")}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      {item.label}
    </div>
  )
}

function ZoneBox({ zone, assigned, item }: { zone: ZoneDef; assigned?: string; item?: ZoneItem }) {
  const { setNodeRef, isOver } = useDroppable({ id: zone.id })
  return (
    <div ref={setNodeRef} className={cn("rounded-2xl border bg-muted/20 p-3 transition-colors", isOver && "dnd-over")}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{zone.title}</p>
        <span className="font-mono text-[9px] text-muted-foreground/70">{zone.kinds.join("/")}</span>
      </div>
      <div className="mt-2 min-h-[64px]">
        {item ? (
          <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 font-display text-sm font-bold">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            {item.label}
          </div>
        ) : (
          <div className="flex h-[42px] items-center justify-center rounded-lg border border-dashed border-border font-mono text-[10px] text-muted-foreground">waiting…</div>
        )}
      </div>
    </div>
  )
}
