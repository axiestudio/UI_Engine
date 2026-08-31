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
import { GripVertical, Plus, X } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Compose a form by dragging field types onto a canvas.
// ═══ EMOTION     You design the intake, not the backend.
// ═══ SIGNATURE   Palette of field types -> reorderable form field cards.

export type FieldType = "text" | "email" | "tel" | "textarea" | "select" | "switch"
export type FormField = { id: string; type: FieldType; label: string }

export type DndFormBuilderProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  fieldTypes: { type: FieldType; label: string }[]
  initialFields?: FormField[]
  onChange?: (fields: FormField[]) => void
  className?: string
}

export function DndFormBuilder({
  eyebrow = "FORMS",
  title = "Build the form.",
  subtitle = "Drag field types onto the canvas, then reorder and remove them.",
  fieldTypes,
  initialFields = [],
  onChange,
  className,
}: DndFormBuilderProps) {
  const [canvas, setCanvas] = React.useState<FormField[]>(initialFields)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [fromPalette, setFromPalette] = React.useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id))
    setFromPalette(fieldTypes.some((f) => f.type === active.id))
  }
  const onDragCancel = () => setActiveId(null)

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    const aId = String(active.id)
    const overId = over ? String(over.id) : null
    if (fromPalette) {
      if (!overId) return
      const ft = fieldTypes.find((f) => f.type === aId)
      if (!ft) return
      const newField: FormField = { id: `${aId}-${Date.now()}`, type: aId as FieldType, label: ft.label }
      setCanvas((prev) => {
        const idx = prev.findIndex((f) => f.id === overId)
        const spliceAt = idx >= 0 ? idx : prev.length
        const next = [...prev.slice(0, spliceAt), newField, ...prev.slice(spliceAt)]
        onChange?.(next)
        return next
      })
      return
    }
    if (!overId || aId === overId) return
    const oldIndex = canvas.findIndex((f) => f.id === aId)
    const newIndex = canvas.findIndex((f) => f.id === overId)
    if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
      const next = arrayMove(canvas, oldIndex, newIndex)
      setCanvas(next)
      onChange?.(next)
    }
  }

  const remove = (id: string) => {
    const next = canvas.filter((f) => f.id !== id)
    setCanvas(next)
    onChange?.(next)
  }

  const activeData = activeId ? [...canvas, ...fieldTypes.map((f) => ({ id: f.type, type: f.type, label: f.label }))].find((f) => f.id === activeId) : null

  return (
    <SectionShell width={1120} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragCancel={onDragCancel} onDragEnd={onDragEnd}>
        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-2xl border bg-card p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Field types</p>
            <div className="mt-3 space-y-2">
              {fieldTypes.map((f) => (
                <PaletteField key={f.type} type={f.type} label={f.label} />
              ))}
            </div>
          </aside>
          <div className="rounded-2xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Canvas — {canvas.length} fields</p>
              {canvas.length > 0 && (
                <Button variant="outline" size="sm" className="h-7 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest" onClick={() => { setCanvas([]); onChange?.([]) }}>Clear</Button>
              )}
            </div>
            <div className="mt-3 min-h-[240px]">
              {canvas.length === 0 ? (
                <div className="flex h-[220px] items-center justify-center rounded-xl border-2 border-dashed border-border font-mono text-[11px] text-muted-foreground">drop a field here</div>
              ) : (
                <SortableContext items={canvas.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {canvas.map((f) => (
                      <FieldCard key={f.id} field={f} onRemove={remove} />
                    ))}
                  </div>
                </SortableContext>
              )}
            </div>
          </div>
        </div>
        <DragOverlay>{activeData ? <FieldPreview field={activeData} /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function PaletteField({ type, label }: { type: FieldType; label: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: type })
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className={cn("flex cursor-grab touch-none items-center gap-2 rounded-lg border bg-background px-3 py-2 font-display text-sm font-bold active:cursor-grabbing", isDragging && "opacity-40")}>
      <Plus className="h-4 w-4 text-muted-foreground" />
      {label}
    </div>
  )
}

function FieldCard({ field, onRemove }: { field: FormField; onRemove: (id: string) => void }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: field.id })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("rounded-xl border bg-card p-3", isDragging && "dnd-lift opacity-90")}>
      <div className="flex items-center gap-3">
        <button type="button" {...attributes} {...listeners} className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing" aria-label={`Reorder ${field.label}`}>
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="font-display text-sm font-bold">{field.label}</span>
        <span className="ml-1 rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{field.type}</span>
        <button type="button" onClick={() => onRemove(field.id)} aria-label={`Remove ${field.label}`} className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-3 rounded-lg border border-dashed border-border px-3 py-2 text-sm font-medium text-muted-foreground">{placeholderFor(field.type)}</div>
    </div>
  )
}

function placeholderFor(type: FieldType) {
  switch (type) {
    case "textarea": return "Multi-line answer…"
    case "select": return "Select one…"
    case "switch": return "Toggle on/off"
    default: return "Your answer"
  }
}

function FieldPreview({ field }: { field: FormField }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 font-display text-sm font-bold dnd-lift">
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      {field.label}
    </div>
  )
}
