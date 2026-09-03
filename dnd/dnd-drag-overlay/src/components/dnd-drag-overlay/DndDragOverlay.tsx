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
  type DragStartEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { CornerDownLeft, GripVertical, Move } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Show a custom DragOverlay that follows the pointer precisely.
// ═══ EMOTION     "this is exactly what I'm holding"
// ═══ SIGNATURE   A driven overlay (scale + rotate) rendered via a React portal.

export type OverlayPiece = { id: string; label: string; color?: string }

export type DndDragOverlayProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  pieces?: OverlayPiece[]
  onDrop?: (id: string, target: string | null) => void
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_DND_DRAG_OVERLAY_PIECES = [ { id: "o1", label: "Violet tile" }, { id: "o2", label: "Amber tile" }, { id: "o3", label: "Ink tile" }, ]


export function DndDragOverlay({
  eyebrow = "OVERLAY",
  title = "Drag with a true overlay.",
  subtitle = "The lifted card follows your pointer at full fidelity — it's a real element, not a ghost.",
  pieces = DEMO_DND_DRAG_OVERLAY_PIECES,
  onDrop,
  className,
}: DndDragOverlayProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const { setNodeRef: dropRef, isOver } = useDroppable({ id: "overlay-target" })

  const onDragStart = ({ active }: DragStartEvent) => setActiveId(String(active.id))
  const onDragCancel = () => setActiveId(null)
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const id = String(active.id)
    const target = over && String(over.id) !== id ? String(over.id) : null
    setActiveId(null)
    onDrop?.(id, target)
  }

  const active = activeId ? pieces.find((p) => p.id === activeId) : null

  return (
    <SectionShell width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/50 px-4 py-3 shadow-sm ">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
            {pieces.length} items
          </span>
          <span className="hidden sm:inline text-xs font-medium text-muted-foreground">Advanced • Professional DnD</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setAnnounce("Overlay reset") }} className="h-7 rounded-full px-3 text-xs font-medium shadow-sm">
            Reset
          </Button>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">A11y • Advanced</span>
        </div>
      </div>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announce}</div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragCancel={onDragCancel} onDragEnd={onDragEnd}>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Draggable tiles</p>
            <div className="mt-3 space-y-2">
              {pieces.map((p) => (
                <OverlayTile key={p.id} piece={p} />
              ))}
            </div>
          </div>
          <div ref={dropRef} className={cn("flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-muted/20 p-4 text-center transition-colors", isOver && "dnd-over")}>
            <CornerDownLeft className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-semibold tracking-tight">Drop target</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">the overlay follows your cursor</p>
          </div>
        </div>
        <DragOverlay dropAnimation={null}>
          {active ? <OverlayTile piece={active} overlay /> : null}
        </DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function OverlayTile({ piece, overlay = false }: { piece: OverlayPiece; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: piece.id })
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={piece.color ? { background: piece.color, color: "#fff" } : undefined}
      className={cn(
        "flex cursor-grab touch-none items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-semibold tracking-tight active:cursor-grabbing",
        overlay && "dnd-lift",
        isDragging && "opacity-40",
      )}
    >
      <GripVertical className="h-4 w-4 opacity-70" />
      {piece.label}
      <Move className="ml-auto h-4 w-4 opacity-50" />
    </div>
  )
}
