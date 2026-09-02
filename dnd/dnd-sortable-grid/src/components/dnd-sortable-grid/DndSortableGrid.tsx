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
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Reorder tiles in a photo / feature grid.
// ═══ EMOTION     Playful but precise — tiles swap cleanly.
// ═══ SIGNATURE   rectSortingStrategy grid + DragOverlay mirrored card.

export type GridTile = { id: string; title: string; description?: string; imageSrc?: string }

export type DndSortableGridProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  tiles?: GridTile[]
  onChange?: (tiles: GridTile[]) => void
  columns?: 2 | 3 | 4
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_DND_SORTABLE_GRID_TILES = [ { id: "t1", title: "Treatment room", imageSrc: "/showcase/content/content-08-conference.webp" }, { id: "t2", title: "Waiting corner", imageSrc: "/showcase/content/content-09-materials.webp" }, { id: "t3", title: "Evening light", imageSrc: "/showcase/content/content-10-atelier.webp" }, { id: "t4", title: "Storage wall", imageSrc: "/showcase/gallery-01.webp" }, { id: "t5", title: "Table detail", imageSrc: "/showcase/gallery-02.webp" }, { id: "t6", title: "The entrance", imageSrc: "/showcase/content/content-01-office.webp" }, ]


export function DndSortableGrid({
  eyebrow = "TILER",
  title = "Arrange the grid.",
  subtitle = "Drag tiles to re-order the gallery — the card mirrors where it will land.",
  tiles = DEMO_DND_SORTABLE_GRID_TILES,
  onChange,
  columns = 3,
  className,
}: DndSortableGridProps) {
  const [internal, setInternal] = React.useState(tiles)
  React.useEffect(() => { setInternal(tiles) }, [tiles])
  const list = internal
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const initialRef = React.useRef(tiles)
  const handleReset = () => { setInternal(tiles); onChange?.(tiles); setAnnounce("Grid reset"); }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    setAnnounce(`Moved ${String(active.id)} to ${String(over?.id ?? "end")}`)
    if (!over || active.id === over.id) return
    const oldIndex = list.findIndex((t) => t.id === active.id)
    const newIndex = list.findIndex((t) => t.id === over.id)
    const next = arrayMove(list, oldIndex, newIndex)
    setInternal(next)
    onChange?.(next)
  }

  const active = activeId ? list.find((t) => t.id === activeId) : null
  const cols = columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"

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
        <SortableContext items={list.map((t) => t.id)} strategy={rectSortingStrategy}>
          <div className={cn("mt-8 grid grid-cols-1 gap-4", cols)}>
            {list.map((tile) => (
              <GridCard key={tile.id} tile={tile} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {active ? <GridCard tile={active} overlay /> : null}
        </DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function GridCard({ tile, overlay = false }: { tile: GridTile; overlay?: boolean }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: tile.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab touch-none rounded-xl border bg-card p-4 active:cursor-grabbing",
        isDragging && "dnd-lift opacity-90",
        overlay && "dnd-lift",
      )}
    >
      <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        {tile.imageSrc ? (
          <img src={tile.imageSrc} alt={tile.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />
        )}
        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-background/80 text-muted-foreground backdrop-blur">
          <GripVertical className="h-4 w-4" />
        </span>
      </div>
      <p className="font-semibold tracking-tight">{tile.title}</p>
      {tile.description && <p className="mt-1 text-sm font-medium text-muted-foreground">{tile.description}</p>}
    </div>
  )
}
