import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, GripHorizontal, Plus, X } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Compose a page from a block palette into an ordered canvas.
// ═══ EMOTION     You are the builder.
// ═══ SIGNATURE   Palette draggables (clone) + a sortable canvas (move/remove).

export type PageBlock = { id: string; type: string; label: string }

export type DndPageBuilderProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  palette?: PageBlock[]
  initialBlocks?: PageBlock[]
  onChange?: (blocks: PageBlock[]) => void
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_DND_PAGE_BUILDER_PALETTE = [ { id: "hero", type: "hero", label: "Hero" }, { id: "features", type: "content", label: "Features" }, { id: "bento", type: "content", label: "Bento" }, { id: "pricing", type: "commerce", label: "Pricing" }, { id: "footer", type: "chrome", label: "Footer" }, ]


export function DndPageBuilder({
  eyebrow = "PAGES",
  title = "Build the page.",
  subtitle = "Drag a block onto the canvas and reorder it. Remove anything you don't need.",
  palette = DEMO_DND_PAGE_BUILDER_PALETTE,
  initialBlocks = [],
  onChange,
  className,
}: DndPageBuilderProps) {
  const [canvas, setCanvas] = React.useState<PageBlock[]>(initialBlocks)
  React.useEffect(() => { setCanvas(initialBlocks) }, [initialBlocks])
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const [fromPalette, setFromPalette] = React.useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id))
    setFromPalette(palette.some((p) => p.id === active.id))
  }
  const onDragCancel = () => setActiveId(null)

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    setAnnounce(`Moved ${String(active.id)}`)
    const aId = String(active.id)
    const overId = over ? String(over.id) : null

    if (fromPalette) {
      const block = palette.find((p) => p.id === aId)
      if (!block) return
      const targetId = overId === "canvas-dropzone" ? null : overId
      if (!over && canvas.length !== 0) return
      const newBlock = { ...block, id: `${block.id}-${Date.now()}` }
      setCanvas((prev) => {
        const idx = targetId ? prev.findIndex((b) => b.id === targetId) : -1
        const spliceAt = idx >= 0 ? idx : prev.length
        const next = [...prev.slice(0, spliceAt), newBlock, ...prev.slice(spliceAt)]
        onChange?.(next)
        return next
      })
      return
    }

    if (!overId || aId === overId) return
    setCanvas((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === aId)
      const newIndex = prev.findIndex((b) => b.id === overId)
      if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
        const next = arrayMove(prev, oldIndex, newIndex)
        onChange?.(next)
        return next
      }
      return prev
    })
  }

  const remove = (id: string) => {
    const next = canvas.filter((b) => b.id !== id)
    setCanvas(next)
    onChange?.(next)
  }

  const activeData = activeId ? [...palette, ...canvas].find((b) => b.id === activeId) : null

  return (
    <SectionShell width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/50 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
            {canvas.length} items
          </span>
          <span className="hidden sm:inline text-xs font-medium text-muted-foreground">Advanced • Professional DnD</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setCanvas([]); onChange?.([]); setAnnounce("Canvas cleared") }} className="h-7 rounded-full px-3 text-xs font-medium shadow-sm">
            Reset
          </Button>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">A11y • Advanced</span>
        </div>
      </div>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announce}</div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragCancel={onDragCancel} onDragEnd={onDragEnd}>
        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-xl border bg-card shadow-sm p-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Palette — drag onto canvas</p>
            <div className="mt-3 space-y-2">
              {palette.map((p) => (
                <PaletteItem key={p.id} block={p} />
              ))}
            </div>
          </aside>
          <CanvasDropArea canvas={canvas} onClear={() => { setCanvas([]); onChange?.([]) }}>
            <div className="mt-3 min-h-[240px]">
              {canvas.length === 0 ? (
                <div className="flex h-[220px] items-center justify-center rounded-xl border-2 border-dashed border-border font-mono text-[11px] text-muted-foreground">drop a block here</div>
              ) : (
                <SortableContext items={canvas.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {canvas.map((b) => (
                      <CanvasBlock key={b.id} block={b} onRemove={remove} />
                    ))}
                  </div>
                </SortableContext>
              )}
            </div>
          </CanvasDropArea>
        </div>
        <DragOverlay>{activeData ? <BlockChip block={activeData} /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function CanvasDropArea({ canvas, onClear, children }: { canvas: PageBlock[]; onClear: () => void; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-dropzone" })
  return (
    <div ref={setNodeRef} className={cn("rounded-xl border bg-muted/20 p-4 transition-colors", isOver && "dnd-over")}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Canvas — {canvas.length} blocks</p>
        {canvas.length > 0 && (
          <Button variant="outline" size="sm" className="h-7 rounded-full font-mono text-[10px] font-semibold uppercase tracking-widest" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>
      {children}
    </div>
  )
}

function PaletteItem({ block }: { block: PageBlock }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: block.id })
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className={cn("flex cursor-grab touch-none items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-semibold tracking-tight active:cursor-grabbing", isDragging && "opacity-40")}>
      <Plus className="h-4 w-4 text-muted-foreground" />
      {block.label}
    </div>
  )
}

function CanvasBlock({ block, onRemove }: { block: PageBlock; onRemove: (id: string) => void }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: block.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-3 rounded-xl border bg-card px-4 py-3", isDragging && "dnd-lift opacity-90")}
    >
      <GripHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div {...attributes} {...listeners} className="flex flex-1 cursor-grab touch-none items-center justify-between active:cursor-grabbing">
        <span className="text-sm font-semibold tracking-tight">{block.label}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{block.type}</span>
      </div>
      <Button variant="ghost" size="icon-sm" onClick={() => onRemove(block.id)} aria-label={`Remove ${block.label}`} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"><X className="h-4 w-4" /></Button>
    </div>
  )
}

function BlockChip({ block }: { block: PageBlock }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-card shadow-sm px-4 py-3 text-sm font-semibold tracking-tight dnd-lift">
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      {block.label}
    </div>
  )
}
