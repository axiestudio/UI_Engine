import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion } from "motion/react"
import { GripVertical } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Reorder a strip of tabs.
// ═══ EMOTION     Navigation you own.
// ═══ SIGNATURE   horizontal sortable tabs + a motion layout-id active underline.

export type TabItem = { id: string; label: string }

export type DndTabReorderProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  tabs: TabItem[]
  activeId?: string
  onActiveChange?: (id: string) => void
  onChange?: (tabs: TabItem[]) => void
  className?: string
}

export function DndTabReorder({
  eyebrow = "TABS",
  title = "Order the tabs.",
  subtitle = "Drag a tab to a new position — the active indicator follows with a shared layout animation.",
  tabs,
  activeId,
  onActiveChange,
  onChange,
  className,
}: DndTabReorderProps) {
  const [internal, setInternal] = React.useState(tabs)
  const list = tabs ?? internal
  const [selected, setSelected] = React.useState<string | null>(activeId ?? list[0]?.id ?? null)
  const [activeMoveId, setActiveMoveId] = React.useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const select = (id: string) => {
    setSelected(id)
    onActiveChange?.(id)
  }

  const onDragEnd = (e: DragEndEvent) => {
    setActiveMoveId(null)
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = list.findIndex((t) => t.id === active.id)
    const newIndex = list.findIndex((t) => t.id === over.id)
    const next = arrayMove(list, oldIndex, newIndex)
    setInternal(next)
    onChange?.(next)
  }

  return (
    <SectionShell width={920} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <DndContext sensors={sensors} onDragStart={({ active }) => setActiveMoveId(String(active.id))} onDragCancel={() => setActiveMoveId(null)} onDragEnd={onDragEnd}>
        <SortableContext items={list.map((t) => t.id)} strategy={horizontalListSortingStrategy}>
          <div className="mt-8 flex flex-wrap items-center gap-1 border-b">
            {list.map((tab) => (
              <SortableTab key={tab.id} tab={tab} selected={selected === tab.id} onSelect={select} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>{activeMoveId ? (() => { const t = list.find((x) => x.id === activeMoveId); return t ? <TabChip tab={t} overlay /> : null })() : null}</DragOverlay>
      </DndContext>
      <div className="mt-6 rounded-2xl border bg-card p-6">
        <p className="font-display text-lg font-bold">{(list.find((t) => t.id === selected) ?? list[0])?.label}</p>
        <p className="mt-2 text-sm font-medium text-muted-foreground">The active tab content renders here — reordering the strip doesn't change the selected panel, it just reorders the navigation.</p>
      </div>
    </SectionShell>
  )
}

function SortableTab({ tab, selected, onSelect }: { tab: TabItem; selected: boolean; onSelect: (id: string) => void }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: tab.id })
  return (
    <button
      type="button"
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(tab.id)}
      className={cn("relative flex cursor-grab touch-none items-center gap-1.5 px-4 py-3 font-display text-sm font-bold transition-colors active:cursor-grabbing", isDragging && "dnd-lift opacity-80", selected ? "text-foreground" : "text-muted-foreground")}
    >
      <GripVertical className="h-3.5 w-3.5 opacity-60" />
      {tab.label}
      {selected && <motion.span layoutId="active-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
    </button>
  )
}

function TabChip({ tab, overlay = false }: { tab: TabItem; overlay?: boolean }) {
  return (
    <span className={cn("flex items-center gap-1.5 rounded-xl border bg-card px-4 py-3 font-display text-sm font-bold", overlay && "dnd-lift")}>
      <GripVertical className="h-3.5 w-3.5 opacity-60" />
      {tab.label}
    </span>
  )
}
