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
import { FileText, GripVertical, Image as ImageIcon, Music, X } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Arrange a set of uploaded files into the order you want.
// ═══ EMOTION     "this is ready to submit"
// ═══ SIGNATURE   Sortable upload rows + remove + a reset-to-start example.

export type UploadFile = { id: string; name: string; size?: string; kind?: "image" | "pdf" | "audio" | "other" }

export type DndUploadSortProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  files: UploadFile[]
  onChange?: (files: UploadFile[]) => void
  onRemove?: (id: string) => void
  className?: string
}

const KIND_ICON: Record<NonNullable<UploadFile["kind"]>, React.ElementType> = {
  image: ImageIcon,
  pdf: FileText,
  audio: Music,
  other: FileText,
}

export function DndUploadSort({
  eyebrow = "UPLOAD",
  title = "Arrange your files.",
  subtitle = "Drag rows to set the order they'll appear. Remove anything you don't need.",
  files,
  onChange,
  onRemove,
  className,
}: DndUploadSortProps) {
  const [internal, setInternal] = React.useState(files)
  const list = files ?? internal
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = list.findIndex((f) => f.id === active.id)
    const newIndex = list.findIndex((f) => f.id === over.id)
    const next = arrayMove(list, oldIndex, newIndex)
    setInternal(next)
    onChange?.(next)
  }

  const handleRemove = (id: string) => {
    const next = list.filter((f) => f.id !== id)
    setInternal(next)
    onRemove?.(id)
  }

  const active = activeId ? list.find((f) => f.id === activeId) : null

  return (
    <SectionShell width={760} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveId(String(active.id))} onDragCancel={() => setActiveId(null)} onDragEnd={onDragEnd}>
        <SortableContext items={list.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <ul className="mt-8 space-y-2">
            {list.map((file) => (
              <UploadRow key={file.id} file={file} onRemove={handleRemove} />
            ))}
          </ul>
        </SortableContext>
        <DragOverlay>{active ? <UploadRow file={active} onRemove={() => {}} overlay /> : null}</DragOverlay>
      </DndContext>
      <div className="mt-6">
        <Button variant="outline" size="sm" className="rounded-full font-mono text-[11px] font-bold uppercase tracking-widest">Add files</Button>
      </div>
    </SectionShell>
  )
}

function UploadRow({ file, onRemove, overlay = false }: { file: UploadFile; onRemove: (id: string) => void; overlay?: boolean }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: file.id })
  const Icon = KIND_ICON[file.kind ?? "other"]
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card p-3",
        isDragging && "dnd-lift opacity-90",
        overlay && "dnd-lift",
      )}
    >
      <button type="button" {...attributes} {...listeners} aria-label={`Reorder ${file.name}`} className="flex h-9 w-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </button>
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", file.kind === "image" ? "bg-violet-500/10 text-violet-600" : "bg-accent text-muted-foreground")}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-bold">{file.name}</p>
        {file.size && <p className="font-mono text-[10px] text-muted-foreground">{file.size}</p>}
      </div>
      <button type="button" onClick={() => onRemove(file.id)} aria-label={`Remove ${file.name}`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
        <X className="h-4 w-4" />
      </button>
    </li>
  )
}
