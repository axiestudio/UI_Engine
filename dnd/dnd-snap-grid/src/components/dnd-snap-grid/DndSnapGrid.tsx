import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { restrictToParentElement, restrictToWindowEdges, snapCenterToCursor } from "@dnd-kit/modifiers"
import { GripVertical } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Drag pieces around a snap-to-grid stage, constrained to it.
// ═══ EMOTION     A pegboard — the piece clicks onto the grid.
// ═══ SIGNATURE   snapCenterToCursor + restrictToParentElement modifiers.

export type SnapPiece = { id: string; label: string }

export type DndSnapGridProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  pieces?: SnapPiece[]
  onChange?: (positions: Record<string, { x: number; y: number }>) => void
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_DND_SNAP_GRID_PIECES = [ { id: "g1", label: "Logo" }, { id: "g2", label: "Hero" }, { id: "g3", label: "CTA" }, { id: "g4", label: "Footer" }, { id: "g5", label: "Stats" }, { id: "g6", label: "Gallery" }, ]


export function DndSnapGrid({
  eyebrow = "PINBOARD",
  title = "Drop it on the grid.",
  subtitle = "Pieces snap to the cell grid and stay inside the board. Drag to re-lay them out.",
  pieces = DEMO_DND_SNAP_GRID_PIECES,
  onChange,
  className,
}: DndSnapGridProps) {
  const [positions, setPositions] = React.useState<Record<string, { x: number; y: number }>>(() =>
    Object.fromEntries(pieces.map((p, i) => [p.id, { x: (i % 4) * 140 + 20, y: Math.floor(i / 4) * 90 + 20 }])),
  )
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    setAnnounce(`Moved ${String(e.active.id)}`)
    const { active, delta } = e
    const id = String(active.id)
    const current = positions[id] ?? { x: 0, y: 0 }
    const rawX = current.x + delta.x
    const rawY = current.y + delta.y
    const grid = 20
    const snapped = { x: Math.round(rawX / grid) * grid, y: Math.round(rawY / grid) * grid }
    const next = { ...positions, [id]: snapped }
    setPositions(next)
    onChange?.(next)
  }

  const active = activeId ? pieces.find((p) => p.id === activeId) : null

  return (
    <SectionShell width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/50 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
            {pieces.length} items
          </span>
          <span className="hidden sm:inline text-xs font-medium text-muted-foreground">Advanced • Professional DnD</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const reset = Object.fromEntries(pieces.map((p, i) => [p.id, { x: (i % 4) * 140 + 20, y: Math.floor(i / 4) * 90 + 20 }]))
              setPositions(reset)
              onChange?.(reset)
              setAnnounce("Positions reset")
            }}
            className="h-7 rounded-full px-3 text-xs font-medium shadow-sm"
          >
            Reset
          </Button>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">A11y • Advanced</span>
        </div>
      </div>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announce}</div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToParentElement, restrictToWindowEdges, snapCenterToCursor]} onDragStart={({ active }) => setActiveId(String(active.id))} onDragCancel={() => setActiveId(null)} onDragEnd={onDragEnd}>
        <Stage positions={positions}>
          <div className="absolute inset-0 grid grid-cols-6 gap-2 p-5">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="h-[70px] rounded-lg border border-dashed border-border/50" />
            ))}
          </div>
          {pieces.map((p) => (
            <SnapChip key={p.id} id={p.id} label={p.label} x={positions[p.id]?.x ?? 20} y={positions[p.id]?.y ?? 20} />
          ))}
        </Stage>
        <DragOverlay>{active ? <SnapChip id={active.id} label={active.label} x={0} y={0} overlay /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function Stage({ children, positions }: { children: React.ReactNode; positions: Record<string, { x: number; y: number }> }) {
  const { setNodeRef, isOver } = useDroppable({ id: "stage" })
  return (
    <div ref={setNodeRef} className={cn("relative mt-8 h-[360px] overflow-hidden rounded-xl border bg-muted/20 shadow-sm", isOver && "dnd-over")}>
      {children}
    </div>
  )
}

function SnapChip({ id, label, x, y, overlay = false }: { id: string; label: string; x: number; y: number; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({ id })
  const tx = transform?.x ?? 0
  const ty = transform?.y ?? 0
  const style = { transform: `translate3d(${x + tx}px, ${y + ty}px, 0)` }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("absolute left-0 top-0 flex cursor-grab touch-none items-center gap-2 rounded-xl border bg-card shadow-sm px-4 py-3 text-sm font-semibold tracking-tight active:cursor-grabbing hover:shadow-md", isDragging && "opacity-40", overlay && "dnd-lift")}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      {label}
    </div>
  )
}
