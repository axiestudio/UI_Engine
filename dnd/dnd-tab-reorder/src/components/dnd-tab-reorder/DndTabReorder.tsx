import * as React from "react"
import { closestCenter, 
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates,  SortableContext, horizontalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion } from "motion/react"
import { GripVertical } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Reorder a strip of tabs.
// ═══ EMOTION     Navigation you own.
// ═══ SIGNATURE   horizontal sortable tabs + a motion layout-id active underline.

export type TabItem = { id: string; label: string }

export type DndTabReorderProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  tabs?: TabItem[]
  activeId?: string
  onActiveChange?: (id: string) => void
  onChange?: (tabs: TabItem[]) => void
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_DND_TAB_REORDER_TABS = [ { id: "overview", label: "Overview" }, { id: "features", label: "Features" }, { id: "pricing", label: "Pricing" }, { id: "faq", label: "FAQ" }, ]


export function DndTabReorder({
  eyebrow = "TABS",
  title = "Order the tabs.",
  subtitle = "Drag a tab to a new position — the active indicator follows with a shared layout animation.",
  tabs = DEMO_DND_TAB_REORDER_TABS,
  activeId,
  onActiveChange,
  onChange,
  className,
}: DndTabReorderProps) {
  const [internal, setInternal] = React.useState(tabs)
  React.useEffect(() => { setInternal(tabs) }, [tabs])
  const list = internal
  const [selected, setSelected] = React.useState<string | null>(activeId ?? list[0]?.id ?? null)
  const [activeMoveId, setActiveMoveId] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

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
    <SectionShell width={920} rule="bottom" className={className}>
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
          <Button variant="outline" size="sm" onClick={() => { setInternal(tabs); onChange?.(tabs); setAnnounce("Tabs reset") }} className="h-7 rounded-full px-3 text-xs font-medium shadow-sm">
            Reset
          </Button>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">A11y • Advanced</span>
        </div>
      </div>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announce}</div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveMoveId(String(active.id))} onDragCancel={() => setActiveMoveId(null)} onDragEnd={onDragEnd}>
        <SortableContext items={list.map((t) => t.id)} strategy={horizontalListSortingStrategy}>
          <div className="mt-8 flex flex-wrap items-center gap-1 border-b">
            {list.map((tab) => (
              <SortableTab key={tab.id} tab={tab} selected={selected === tab.id} onSelect={select} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>{activeMoveId ? (() => { const t = list.find((x) => x.id === activeMoveId); return t ? <TabChip tab={t} overlay /> : null })() : null}</DragOverlay>
      </DndContext>
      <div className="mt-6 rounded-xl border bg-card shadow-sm p-6">
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
