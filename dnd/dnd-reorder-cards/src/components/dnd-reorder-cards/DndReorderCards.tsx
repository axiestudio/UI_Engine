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
import { GripVertical, Star } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Reorder a stack of cards (ranked priorities / steps).
// ═══ EMOTION     Ranking feels decisive.
// ═══ SIGNATURE   Full keyboard + pointer sortable cards with a lift overlay.

export type RankCard = { id: string; title: string; description?: string; score?: string }

export type DndReorderCardsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  cards: RankCard[]
  onChange?: (cards: RankCard[]) => void
  className?: string
}

export function DndReorderCards({
  eyebrow = "RANK",
  title = "Rank the priorities.",
  subtitle = "Drag cards into order, or focus one and use the arrow keys. The number is your position.",
  cards,
  onChange,
  className,
}: DndReorderCardsProps) {
  const [internal, setInternal] = React.useState(cards)
  React.useEffect(() => { setInternal(cards) }, [cards])
  const list = internal
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

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
    <SectionShell width={760} rule="bottom" className={className}>
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
          <Button variant="outline" size="sm" onClick={() => { setInternal(cards); onChange?.(cards); setAnnounce("Order reset") }} className="h-7 rounded-full px-3 text-xs font-medium shadow-sm">
            Reset
          </Button>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">A11y • Advanced</span>
        </div>
      </div>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announce}</div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveId(String(active.id))} onDragCancel={() => setActiveId(null)} onDragEnd={onDragEnd}>
        <SortableContext items={list.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="mt-8 space-y-3">
            {list.map((card, i) => (
              <RankRow key={card.id} card={card} index={i} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>{active ? <RankRow card={active} index={list.findIndex((c) => c.id === active.id)} overlay /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function RankRow({ card, index, overlay = false }: { card: RankCard; index: number; overlay?: boolean }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: card.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "flex cursor-grab touch-none items-stretch gap-3 rounded-xl border bg-card p-4 active:cursor-grabbing",
        isDragging && "dnd-lift opacity-90",
        overlay && "dnd-lift",
      )}
    >
      <span className="flex min-w-[46px] flex-col items-center justify-center rounded-xl bg-accent px-2 font-display text-xl font-black">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-display font-bold">
          {card.title}
          {index === 0 && <Star className="h-4 w-4 fill-current text-amber-400" />}
        </p>
        {card.description && <p className="mt-1 text-sm font-medium text-muted-foreground">{card.description}</p>}
        {card.score && <p className="mt-2 inline-block rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{card.score}</p>}
      </div>
      <GripVertical className="h-5 w-5 shrink-0 self-center text-muted-foreground" />
    </div>
  )
}
