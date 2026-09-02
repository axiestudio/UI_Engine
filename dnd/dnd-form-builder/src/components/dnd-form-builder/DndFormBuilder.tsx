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
  fieldTypes?: { type: FieldType; label: string }[]
  initialFields?: FormField[]
  onChange?: (fields: FormField[]) => void
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_DND_FORM_BUILDER_FIELDTYPES: { type: FieldType; label: string }[] = [ { type: "text", label: "Text field" }, { type: "email", label: "Email" }, { type: "tel", label: "Phone" }, { type: "textarea", label: "Paragraph" }, { type: "select", label: "Dropdown" }, { type: "switch", label: "Switch" }, ]


export function DndFormBuilder({
  eyebrow = "FORMS",
  title = "Build the form.",
  subtitle = "Drag field types onto the canvas, then reorder and remove them.",
  fieldTypes = DEMO_DND_FORM_BUILDER_FIELDTYPES,
  initialFields = [],
  onChange,
  className,
}: DndFormBuilderProps) {
  const [canvas, setCanvas] = React.useState<FormField[]>(initialFields)
  React.useEffect(() => { setCanvas(initialFields) }, [initialFields])
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const [fromPalette, setFromPalette] = React.useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id))
    setFromPalette(fieldTypes.some((f) => f.type === active.id))
  }
  const onDragCancel = () => setActiveId(null)

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    setAnnounce(`Moved ${String(active.id)}`)
    const aId = String(active.id)
    const overId = over ? String(over.id) : null
    if (fromPalette) {
      const ft = fieldTypes.find((f) => f.type === aId)
      if (!ft) return
      // allow drop on canvas itself when empty (id === "canvas-dropzone")
      const targetId = overId === "canvas-dropzone" ? null : overId
      if (!over && canvas.length !== 0) return
      const newField: FormField = { id: `${aId}-${Date.now()}`, type: aId as FieldType, label: ft.label }
      setCanvas((prev) => {
        const idx = targetId ? prev.findIndex((f) => f.id === targetId) : -1
        const spliceAt = idx >= 0 ? idx : prev.length
        const next = [...prev.slice(0, spliceAt), newField, ...prev.slice(spliceAt)]
        onChange?.(next)
        return next
      })
      return
    }
    if (!overId || aId === overId) return
    setCanvas((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === aId)
      const newIndex = prev.findIndex((f) => f.id === overId)
      if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
        const next = arrayMove(prev, oldIndex, newIndex)
        onChange?.(next)
        return next
      }
      return prev
    })
  }

  const remove = (id: string) => {
    const next = canvas.filter((f) => f.id !== id)
    setCanvas(next)
    onChange?.(next)
  }

  const activeData = activeId ? [...canvas, ...fieldTypes.map((f) => ({ id: f.type, type: f.type, label: f.label }))].find((f) => f.id === activeId) : null

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
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Field types</p>
            <div className="mt-3 space-y-2">
              {fieldTypes.map((f) => (
                <PaletteField key={f.type} type={f.type} label={f.label} />
              ))}
            </div>
          </aside>
          <CanvasDropArea canvas={canvas} onClear={() => { setCanvas([]); onChange?.([]) }}>
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
          </CanvasDropArea>
        </div>
        <DragOverlay>{activeData ? <FieldPreview field={activeData} /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function PaletteField({ type, label }: { type: FieldType; label: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: type })
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className={cn("flex cursor-grab touch-none items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-semibold tracking-tight active:cursor-grabbing", isDragging && "opacity-40")}>
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
        <span className="text-sm font-semibold tracking-tight">{field.label}</span>
        <span className="ml-1 rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{field.type}</span>
        <Button variant="ghost" size="icon-sm" onClick={() => onRemove(field.id)} aria-label={`Remove ${field.label}`} className="ml-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10"><X className="h-4 w-4" /></Button>
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

function CanvasDropArea({ canvas, onClear, children }: { canvas: FormField[]; onClear: () => void; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-dropzone" })
  return (
    <div ref={setNodeRef} className={cn("rounded-xl border bg-muted/20 p-4 transition-colors", isOver && "dnd-over")}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Canvas — {canvas.length} fields</p>
        {canvas.length > 0 && (
          <Button variant="outline" size="sm" className="h-7 rounded-full font-mono text-[10px] font-semibold uppercase tracking-widest" onClick={onClear}>Clear</Button>
        )}
      </div>
      {children}
    </div>
  )
}

function FieldPreview({ field }: { field: FormField }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-card shadow-sm px-4 py-3 text-sm font-semibold tracking-tight dnd-lift">
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      {field.label}
    </div>
  )
}
