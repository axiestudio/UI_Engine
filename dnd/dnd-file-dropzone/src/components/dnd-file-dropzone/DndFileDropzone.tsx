import * as React from "react"
import { DndContext, PointerSensor, KeyboardSensor, closestCenter, useDroppable, useSensor, useSensors } from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { File, FileText, Folder, Image as ImageIcon, Music, X } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Accept OS-level file drops into a captive dropzone.
// ═══ EMOTION     Drag-and-drop that feels native.
// ═══ SIGNATURE   A full-surface droppable zone (dataTransfer) + file list.
// ═══ NOTE        dnd-kit handles in-app drags; OS-level drops use onDrop here.

export type DroppedFile = { id: string; name: string; size?: string; kind: "image" | "pdf" | "audio" | "folder" | "other" }

export type DndFileDropzoneProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  files?: DroppedFile[]
  onChange?: (files: DroppedFile[]) => void
  accept?: string
  maxFiles?: number
  className?: string
}

// dnd-kit DndContext is wired so in-app draggables can still be hosted later;
// the dropzone primarily uses native DataTransfer for OS files.
export function DndFileDropzone({
  eyebrow = "DROPZONE",
  title = "Drop files here.",
  subtitle = "Drag files from your computer onto the zone. Any order you land them is the order they keep.",
  files: filesProp,
  onChange,
  accept,
  maxFiles = 12,
  className,
}: DndFileDropzoneProps) {
  const [internal, setInternal] = React.useState<DroppedFile[]>(filesProp ?? [])
  React.useEffect(() => {
    if (filesProp) setInternal(filesProp)
  }, [filesProp])
  const files = internal
  const [active, setActive] = React.useState(false)
  const [announce, setAnnounce] = React.useState("")
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const addFiles = (list: FileList | File[]) => {
    const next = [...files]
    for (const f of Array.from(list)) {
      if (next.length >= maxFiles) break
      next.push({ id: `os-${f.name}-${Date.now()}-${next.length}`, name: f.name, size: `${(f.size / 1024 / 1024).toFixed(1)} MB`, kind: kindOf(f) })
    }
    setInternal(next)
    onChange?.(next)
  }

  const remove = (id: string) => {
    const next = files.filter((f) => f.id !== id)
    setInternal(next)
    onChange?.(next)
  }

  return (
    <SectionShell width={760} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/50 px-4 py-3 shadow-sm ">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
            {files.length} items
          </span>
          <span className="hidden sm:inline text-xs font-medium text-muted-foreground">Advanced • Professional DnD</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setInternal([]); onChange?.([]); setAnnounce("Files cleared") }} className="h-7 rounded-full px-3 text-xs font-medium shadow-sm">
            Reset
          </Button>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">A11y • Advanced</span>
        </div>
      </div>
      {/* dnd-kit root so in-app draggables can drop here later; OS files use native events */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announce}</div>
      <DndContext sensors={sensors} collisionDetection={closestCenter}>
        <FullDropZone active={active} setActive={setActive} accept={accept} onFiles={addFiles} />
      </DndContext>
      {files.length > 0 && (
        <ul className="mt-6 space-y-2">
          {files.map((f) => (
            <FileRow key={f.id} f={f} onRemove={remove} />
          ))}
        </ul>
      )}
    </SectionShell>
  )
}

function kindOf(f: File): DroppedFile["kind"] {
  if (f.type.startsWith("image/")) return "image"
  if (f.type === "application/pdf") return "pdf"
  if (f.type.startsWith("audio/")) return "audio"
  return "other"
}

function FullDropZone({
  active,
  setActive,
  accept,
  onFiles,
}: {
  active: boolean
  setActive: (v: boolean) => void
  accept?: string
  onFiles: (files: FileList | File[]) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "file-dropzone" })
  const inputRef = React.useRef<HTMLInputElement>(null)
  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click() }}
      onDragOver={(e) => { e.preventDefault(); setActive(true) }}
      onDragLeave={() => setActive(false)}
      onDrop={(e) => {
        e.preventDefault()
        setActive(false)
        if (e.dataTransfer?.files?.length) onFiles(e.dataTransfer.files)
      }}
      className={cn(
        "flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-muted/20 px-6 text-center transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        (active || isOver) && "dnd-over",
      )}
    >
      <input ref={inputRef} type="file" multiple accept={accept} className="sr-only" onChange={(e) => { if (e.target.files?.length) onFiles(e.target.files); e.currentTarget.value = "" }} />
      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent"><File className="h-7 w-7" /></span>
      <p className="font-display text-base font-bold">Drag files or click to browse</p>
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{accept ?? "any file"} · dropped order is kept</p>
    </div>
  )
}

const KIND_ICON: Record<DroppedFile["kind"], React.ElementType> = { image: ImageIcon, pdf: FileText, audio: Music, folder: Folder, other: File }

function FileRow({ f, onRemove }: { f: DroppedFile; onRemove: (id: string) => void }) {
  const Icon = KIND_ICON[f.kind]
  return (
    <li className="flex items-center gap-3 rounded-xl border bg-card shadow-sm p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-muted-foreground"><Icon className="h-4 w-4" /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold tracking-tight">{f.name}</p>
        {f.size && <p className="font-mono text-[10px] text-muted-foreground">{f.size}</p>}
      </div>
      <Button variant="ghost" size="icon-sm" onClick={() => onRemove(f.id)} aria-label={`Remove ${f.name}`} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"><X className="h-4 w-4" /></Button>
    </li>
  )
}
