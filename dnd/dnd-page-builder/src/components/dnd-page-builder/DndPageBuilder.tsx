import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
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
  palette: PageBlock[]
  initialBlocks?: PageBlock[]
  onChange?: (blocks: PageBlock[]) => void
  className?: string
}

export function DndPageBuilder({
  eyebrow = "PAGES",
  title = "Build the page.",
  subtitle = "Drag a block onto the canvas and reorder it. Remove anything you don't need.",
  palette,
  initialBlocks = [],
  onChange,
  className,
}: DndPageBuilderProps) {
  const [canvas, setCanvas] = React.useState<PageBlock[]>(initialBlocks)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [fromPalette, setFromPalette] = React.useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id))
    setFromPalette(palette.some((p) => p.id === active.id))
  }
  const onDragCancel = () => setActiveId(null)

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    const aId = String(active.id)
    const overId = over ? String(over.id) : null

    if (fromPalette) {
      // dropped onto a canvas block (or canvas) -> add the palette item
      if (!overId) return
      const block = palette.find((p) => p.id === aId)
      if (!block) return
      const newBlock = { ...block, id: `${block.id}-${Date.now()}` }
      setCanvas((prev) => {
        const idx = prev.findIndex((b) => b.id === overId)
        const spliceAt = idx >= 0 ? idx : prev.length
        const next = [...prev.slice(0, spliceAt), newBlock, ...prev.slice(spliceAt)]
        onChange?.(next)
        return next
      })
      return
    }

    // reorder canvas
    if (!overId || aId === overId) return
    const oldIndex = canvas.findIndex((b) => b.id === aId)
    const newIndex = canvas.findIndex((b) => b.id === overId)
    if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
      const next = arrayMove(canvas, oldIndex, newIndex)
      setCanvas(next)
      onChange?.(next)
    }
  }

  const remove = (id: string) => {
    const next = canvas.filter((b) => b.id !== id)
    setCanvas(next)
    onChange?.(next)
  }

  const activeData = activeId ? [...palette, ...canvas].find((b) => b.id === activeId) : null

  return (
    <SectionShell width={1120} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragCancel={onDragCancel} onDragEnd={onDragEnd}>
        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-2xl border bg-card p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Palette — drag onto canvas</p>
            <div className="mt-3 space-y-2">
              {palette.map((p) => (
                <PaletteItem key={p.id} block={p} />
              ))}
            </div>
          </aside>
          <div className="rounded-2xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Canvas — {canvas.length} blocks</p>
              {canvas.length > 0 && (
                <Button variant="outline" size="sm" className="h-7 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest" onClick={() => { setCanvas([]); onChange?.([]) }}>
                  Clear
                </Button>
              )}
            </div>
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
          </div>
        </div>
        <DragOverlay>{activeData ? <BlockChip block={activeData} /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function PaletteItem({ block }: { block: PageBlock }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: block.id })
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className={cn("flex cursor-grab touch-none items-center gap-2 rounded-lg border bg-background px-3 py-2 font-display text-sm font-bold active:cursor-grabbing", isDragging && "opacity-40")}>
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
        <span className="font-display text-sm font-bold">{block.label}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{block.type}</span>
      </div>
      <button type="button" onClick={() => onRemove(block.id)} aria-label={`Remove ${block.label}`} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function BlockChip({ block }: { block: PageBlock }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 font-display text-sm font-bold dnd-lift">
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      {block.label}
    </div>
  )
}
