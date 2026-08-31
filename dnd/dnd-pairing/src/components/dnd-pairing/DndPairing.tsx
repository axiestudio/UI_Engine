import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Match a left term to its right target.
// ═══ EMOTION     Word-bank energy — snap it to the right column.
// ═══ SIGNATURE   pointerWithin collision so the nearest target wins precisely.

export type PairLeft = { id: string; label: string }
export type PairRight = { id: string; label: string }

export type DndPairingProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  left: PairLeft[]
  right: PairRight[]
  /** Mark pairs correct when id matches the right id. */
  matches?: Record<string, string>
  onMatch?: (pairs: Record<string, string>) => void
  className?: string
}

export function DndPairing({
  eyebrow = "MATCH",
  title = "Pair them up.",
  subtitle = "Drag a term onto its match. Correct pairings lock in.",
  left,
  right,
  matches = {},
  onMatch,
  className,
}: DndPairingProps) {
  const [pairs, setPairs] = React.useState<Record<string, string>>(matches)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const matchedRightIds = React.useMemo(() => Object.values(pairs), [pairs])

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const leftId = String(active.id)
    const rightId = String(over.id)
    const next = { ...pairs }
    for (const [k, v] of Object.entries(next)) if (v === rightId) delete next[k]
    next[leftId] = rightId
    setPairs(next)
    onMatch?.(next)
  }

  const activeData = activeId ? left.find((l) => l.id === activeId) : null

  return (
    <SectionShell width={920} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={({ active }) => setActiveId(String(active.id))} onDragCancel={() => setActiveId(null)} onDragEnd={onDragEnd}>
        <div className="mt-8 grid grid-cols-2 gap-6">
          <div className="space-y-3">
            {left.map((item) => {
              const placed = !!pairs[item.id]
              return <PairChip key={item.id} item={item} disabled={placed} />
            })}
          </div>
          <div className="space-y-3">
            {right.map((item) => {
              const matchedBy = pairs ? Object.keys(pairs).find((k) => pairs[k] === item.id) : undefined
              const correct = !!matchedBy && matchedBy === item.id
              return <PairTarget key={item.id} item={item} matchedBy={matchedBy} correct={correct} />
            })}
          </div>
        </div>
        <DragOverlay>{activeData ? <PairChip item={activeData} overlay /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function PairChip({ item, disabled = false, overlay = false }: { item: PairLeft; disabled?: boolean; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id, disabled })
  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: disabled ? 0.4 : 1, y: 0 }}
      whileHover={disabled ? undefined : { x: 4 }}
      className={cn("cursor-grab touch-none rounded-xl border bg-card px-4 py-3 font-display text-sm font-bold active:cursor-grabbing", disabled && "cursor-default", isDragging && "opacity-40", overlay && "dnd-lift")}
    >
      {item.label}
    </motion.div>
  )
}

function PairTarget({ item, matchedBy, correct }: { item: PairRight; matchedBy?: string; correct: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: item.id })
  return (
    <div
      ref={setNodeRef}
      className={cn("flex min-h-[52px] items-center justify-between rounded-xl border bg-muted/30 px-4 py-3 transition-colors", isOver && "dnd-over", correct && "border-emerald-500/60 bg-emerald-500/10")}
    >
      <p className="font-display text-sm font-bold text-muted-foreground">{item.label}</p>
      <span className={cn("font-mono text-[10px] font-bold uppercase tracking-widest", correct ? "text-emerald-600" : matchedBy ? "text-muted-foreground" : "text-inherit")}>
        {correct ? "matched" : matchedBy ? "taken" : "drop"}
      </span>
    </div>
  )
}
