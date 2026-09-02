import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ImagePlus, UploadCloud, X } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Accept images (drop or browse) and reorder them.
// ═══ EMOTION     A tidy gallery, in the order you want.
// ═══ SIGNATURE   A droppable drop zone + a sortable thumbnail grid.

export type UploadImage = { id: string; src?: string; name?: string; size?: string }

export type DndImageUploaderProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  images?: UploadImage[]
  onChange?: (images: UploadImage[]) => void
  onRemove?: (id: string) => void
  /** Simulated async add; returns demo images. */
  onAdd?: (files: File[]) => void | Promise<void>
  className?: string
}

let seq = 0
const mk = (name: string): UploadImage => ({ id: `img-${++seq}`, name, size: `${(Math.random() * 3 + 0.4).toFixed(1)} MB` })

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_DND_IMAGE_UPLOADER_IMAGES = [ { id: "i1", name: "poster.webp", size: "1.2 MB", src: "/showcase/hero-poster.webp" }, { id: "i2", name: "frame_0032.webp", size: "900 KB", src: "/showcase/content/content-02-team.webp" }, ]


export function DndImageUploader({
  eyebrow = "GALLERY",
  title = "Drop & order your images.",
  subtitle = "Drop files anywhere in the zone, then drag thumbnails to set the order they'll display.",
  images = DEMO_DND_IMAGE_UPLOADER_IMAGES,
  onChange,
  onRemove,
  onAdd,
  className,
}: DndImageUploaderProps) {
  const [internal, setInternal] = React.useState(images)
  React.useEffect(() => { setInternal(images) }, [images])
  const list = internal
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleAdd = (files: File[]) => {
    const next = [...list, ...files.map((f) => mk(f.name))]
    setInternal(next)
    onChange?.(next)
    onAdd?.(files)
  }

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = list.findIndex((i) => i.id === active.id)
    const newIndex = list.findIndex((i) => i.id === over.id)
    const next = arrayMove(list, oldIndex, newIndex)
    setInternal(next)
    onChange?.(next)
  }

  const handleRemove = (id: string) => {
    const next = list.filter((i) => i.id !== id)
    setInternal(next)
    onRemove?.(id)
  }

  const active = activeId ? list.find((i) => i.id === activeId) : null

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
          <Button variant="outline" size="sm" onClick={() => { setInternal([]); onChange?.([]); setAnnounce("Gallery cleared") }} className="h-7 rounded-full px-3 text-xs font-medium shadow-sm">
            Reset
          </Button>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">A11y • Advanced</span>
        </div>
      </div>
      <DropZone onFiles={handleAdd} />
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announce}</div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveId(String(active.id))} onDragCancel={() => setActiveId(null)} onDragEnd={onDragEnd}>
        {list.length > 0 && (
          <SortableContext items={list.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {list.map((img) => (
                <Thumb key={img.id} img={img} onRemove={handleRemove} />
              ))}
            </div>
          </SortableContext>
        )}
        <DragOverlay>{active ? <Thumb img={active} onRemove={() => {}} overlay /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function DropZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: "image-dropzone" })
  const [dragActive, setDragActive] = React.useState(false)
  return (
    <label
      ref={setNodeRef}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragActive(false)
        const files = Array.from(e.dataTransfer.files ?? [])
        if (files.length) onFiles(files)
      }}
      className={cn("mt-8 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-muted/20 px-6 py-12 text-center transition-colors", (isOver || dragActive) && "dnd-over")}
    >
      <input type="file" multiple accept="image/*" className="sr-only" onChange={(e) => { const fs = Array.from(e.target.files ?? []); if (fs.length) onFiles(fs); e.currentTarget.value = "" }} />
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
        <UploadCloud className="h-6 w-6" />
      </span>
      <p className="font-display text-base font-bold">Drop images here, or click to browse</p>
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">png · jpg · webp · up to 5 MB</p>
    </label>
  )
}

function Thumb({ img, onRemove, overlay = false }: { img: UploadImage; onRemove: (id: string) => void; overlay?: boolean }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: img.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("relative overflow-hidden rounded-xl border bg-card", isDragging && "dnd-lift opacity-90", overlay && "dnd-lift")}
    >
      <div className="aspect-square bg-gradient-to-br from-secondary to-muted">
        {img.src ? <img src={img.src} alt={img.name ?? ""} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><ImagePlus className="h-6 w-6 text-muted-foreground" /></div>}
      </div>
      <div {...attributes} {...listeners} className="absolute inset-x-0 bottom-0 flex cursor-grab touch-none items-center justify-between bg-gradient-to-t from-background/90 to-transparent px-2 pb-2 pt-6 active:cursor-grabbing">
        <span className="truncate font-mono text-[10px] font-bold text-foreground">{img.name ?? img.id}</span>
        <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(img.id) }} aria-label={`Remove ${img.name ?? img.id}`} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-background/80 text-muted-foreground hover:text-destructive">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
