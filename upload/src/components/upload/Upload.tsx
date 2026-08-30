import * as React from "react"
import { CheckCircle2, Upload as UploadIcon } from "lucide-react"
import { FileUploadArea, type FileEntry, type FileState } from "@/components/watermelon/file-upload-3"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type UploadProps = {
  eyebrow?: string
  title?: string
  description?: string
  /** Accept string of extensions/MIME like input[accept]. */
  accept?: string
  maxSizeMB?: number
  maxFiles?: number
  /** Async host handler. Called with the batch; returns failed ids (optional). No handler → files stay queued. */
  onUpload?: (files: File[]) => Promise<void | string[]> | void | string[]
  submitLabel?: string
  successLabel?: string
  /** Clear the list shortly after a successful submit. Default true. */
  resetAfterSuccess?: boolean
  className?: string
}

/**
 * FileUploadArea is uncontrolled-friendly: we own entries + status here and hand the area an
 * adapter, so the host only passes an async onUpload. Progress only ever reflects real work.
 */
export function Upload({
  eyebrow = "Documents",
  title = "Attach your files",
  description = "Drag files in or click to browse — they stay on this page until you press upload.",
  accept,
  maxSizeMB = 20,
  maxFiles = 10,
  onUpload,
  submitLabel = "Upload files",
  successLabel = "Everything uploaded",
  resetAfterSuccess = true,
  className,
}: UploadProps) {
  const [entries, setEntries] = React.useState<FileEntry[]>([])
  const [status, setStatus] = React.useState<"idle" | "busy" | "done" | "partial" | "err">("idle")
  const [hint, setHint] = React.useState<string | null>(null)

  const addFiles = (incoming: File[]) => {
    if (!incoming.length) return
    const room = maxFiles - entries.length
    if (room <= 0) {
      setHint(`Max ${maxFiles} files.`)
      return
    }
    const acceptedTypes = (accept ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
    const tooBig = (f: File) => f.size > maxSizeMB * 1024 * 1024
    const matches = (f: File) =>
      acceptedTypes.length === 0 ||
      acceptedTypes.some(
        (t) => (t.startsWith(".") ? f.name.toLowerCase().endsWith(t) : new RegExp(`^${t.replace("*", ".*")}$`).test(f.type))
      )
    const kept = incoming.filter((f) => matches(f) && !tooBig(f))
    const rejected = incoming.length - kept.length
    if (rejected > 0) {
      setHint(`${rejected} skipped (size/type). Limit ${maxSizeMB} MB.`)
    } else {
      setHint(null)
    }
    setStatus("idle")
    setEntries((cur) => [
      ...cur,
      ...kept.slice(0, room).map((f) => ({
        id: `${f.name}-${f.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file: f,
        progress: 0,
        state: "queued" as FileState,
      })),
    ])
  }

  const submit = async () => {
    if (!entries.length || !onUpload) return
    setStatus("busy")
    const ids = new Map(entries.map((e) => [e.file, e.id]))
    setEntries((cur) => cur.map((e) => ({ ...e, state: "uploading", progress: 0 })))
    try {
      const failed = (await onUpload(entries.map((e) => e.file))) ?? []
      const failedSet = new Set(failed)
      setEntries((cur) =>
        cur.map((e) => ({
          ...e,
          progress: 100,
          state: failedSet.has(e.id) || failedSet.has(e.file.name) ? "failed" : "completed",
          error: failedSet.has(e.id) || failedSet.has(e.file.name) ? "Upload failed" : undefined,
        }))
      )
      setStatus(failed.length ? "partial" : "done")
      if (!failed.length && resetAfterSuccess) {
        window.setTimeout(() => setEntries((cur) => cur.filter((e) => e.state === "failed")), 1800)
      }
    } catch {
      setStatus("err")
      setEntries((cur) =>
        cur.map((e) => ({
          ...e,
          state: "failed",
          error: "Upload failed",
          progress: e.progress || 30,
        }))
      )
    }
  }

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-label={title}>
      <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
        <div className="mx-auto w-full max-w-[760px] px-4 py-16 sm:px-6">
          <header className="mb-6">
            {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>}
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
          </header>

          <FileUploadArea
            title={title}
            description={description}
            accept={accept}
            maxFiles={maxFiles}
            maxSizeMB={maxSizeMB}
            files={entries}
            onFilesSelect={addFiles}
            onFileRemove={(id) => {
              setEntries((cur) => cur.filter((e) => e.id !== id))
              setStatus("idle")
            }}
          />

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              onClick={submit}
              disabled={!entries.length || status === "busy" || !onUpload}
              className="h-11 rounded-full px-7 font-display text-sm font-extrabold tracking-tight"
              aria-busy={status === "busy"}
            >
              <UploadIcon className="mr-1.5 h-3.5 w-3.5" />
              {status === "busy" ? "Uploading…" : `${submitLabel}${entries.length ? ` (${entries.filter((e) => e.state !== "completed").length})` : ""}`}
            </Button>
            {status === "done" && (
              <p role="status" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> {successLabel}
              </p>
            )}
            {status === "partial" && <p role="status" className="text-sm font-bold text-amber-600">Some files failed — retry them.</p>}
            {(hint || status === "err") && <p role="alert" className="text-sm font-semibold text-destructive">{hint ?? "Upload failed — try again."}</p>}
          </div>
          {!onUpload && (
            <p className="mt-3 text-[11px] font-medium text-muted-foreground">Wire `onUpload` to enable the upload action — the dropzone collects files meanwhile.</p>
          )}
        </div>
      </InView>
    </section>
  )
}
