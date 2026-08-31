import { useEffect, useState } from "react"
import { Radio, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"
import { JobTray, type Job } from "job-tray"
import { UploadQueue, type UploadFile } from "upload-queue"
import { EventTimelineDay, type TimelineEvent } from "event-timeline-day"
import { CronPreview } from "cron-preview"
import { MentionTextarea } from "mention-textarea"

// COMPOSITE SCREEN · PODCAST STUDIO SHOW RUNNER
// composed of: job-tray (render jobs), upload-queue (guest drop-box),
// event-timeline-day (guest episode timeline), cron-preview (publish cron),
// mention-textarea (show-notes composer) + purpose-built feed targets panel.
//
// DESIGN BAR: header strip ≤48px · label 11px semibold uppercase 12% tracking
// · body 13px · numerics 12px tabular right-aligned · panels rounded-lg
// bordered with a 36px header strip · functional copy only · motion marks
// state changes, never decorates.

export type PodcastStudioDeskProps = {
  show?: string
  episode?: string
  className?: string
}

const INITIAL_JOBS: Job[] = [
  { id: "j1", label: "mixdown · ep128-final.wav", status: "running", progress: 58, log: ["loudness target -16 LUFS", "de-esser pass 2/2"] },
  { id: "j2", label: "transcript · whisper-large-v3", status: "queued", progress: 0 },
  { id: "j3", label: "chapters · auto from markers", status: "done", progress: 100 },
  { id: "j4", label: "ad splice · midroll slot", status: "error", progress: 40, log: ["source ad-take-3.flac truncated"] },
]

const INITIAL_FILES: UploadFile[] = [
  { id: "u1", name: "guest-adeyemi-tracks.zip", size: 412_000_000, status: "uploading", progress: 34 },
  { id: "u2", name: "guest-nakamura-tracks.zip", size: 388_000_000, status: "done", progress: 100 },
  { id: "u3", name: "field-recording-harbour.flac", size: 96_000_000, status: "error", progress: 71, error: "checksum mismatch" },
]

const DEFAULT_TIMELINE: TimelineEvent[] = [
  { id: "t1", at: "2026-08-29T09:02:00", actor: "producer", kind: "create", text: "session opened · ep128 “Quiet logistics”" },
  { id: "t2", at: "2026-08-29T09:31:00", actor: "guest · r.adeyemi", kind: "comment", text: "joined from Lagos studio, -51 dB floor confirmed" },
  { id: "t3", at: "2026-08-29T10:15:00", actor: "host · m.lune", kind: "edit", text: "segment 1 retake — mic bump at 14:20" },
  { id: "t4", at: "2026-08-29T11:02:00", actor: "producer", kind: "alert", text: "guest n.nakamura dropped — reconnected after 4 min" },
  { id: "t5", at: "2026-08-29T12:40:00", actor: "host · m.lune", kind: "create", text: "ad read recorded, take 3 kept" },
  { id: "t6", at: "2026-08-29T13:05:00", actor: "producer", kind: "create", text: "wrap · raw session locked, 3 h 12 min" },
]

const FEEDS = [
  { name: "RSS", state: "ok" as const, note: "cdn.pod.example/quiet-logistics.xml" },
  { name: "Apple Podcasts", state: "ok" as const, note: "credentials valid · 41 episodes live" },
  { name: "Spotify", state: "warn" as const, note: "token refreshes in 6 days" },
]

export function PodcastStudioDesk({ show = "Quiet logistics", episode = "EP 128", className }: PodcastStudioDeskProps) {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS)
  const [files, setFiles] = useState<UploadFile[]>(INITIAL_FILES)
  const [cron, setCron] = useState("0 6 * * 2")
  const [notes, setNotes] = useState(
    "Cold open on the harbour field recording. @guest · r.adeyemi on why the quietest warehouses run the hottest software. Chapters from markers.",
  )

  useEffect(() => {
    const tick = window.setInterval(() => {
      setJobs((js: Job[]) =>
        js.map((j: Job) => {
          if (j.status !== "running") return j
          const next = Math.min(100, (j.progress ?? 0) + 6)
          return next >= 100 ? { ...j, progress: 100, status: "done" } : { ...j, progress: next }
        }),
      )
      setFiles((fs: UploadFile[]) =>
        fs.map((f: UploadFile) => {
          if (f.status !== "uploading") return f
          const next = Math.min(100, (f.progress ?? 0) + 5)
          return next >= 100 ? { ...f, progress: 100, status: "done" } : { ...f, progress: next }
        }),
      )
    }, 500)
    return () => window.clearInterval(tick)
  }, [])

  const running = jobs.filter((j: Job) => j.status === "running" || j.status === "queued").length

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      {/* screen header */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Show runner</h2>
        <span className="text-[12px] text-muted-foreground">{show}</span>
        <span className="text-[12px] text-muted-foreground">· {episode} · recording locked</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-mono text-[12px] tabular-nums text-muted-foreground">
            <Radio className="size-3.5" /> {running} render job{running === 1 ? "" : "s"}
          </span>
          <button
            onClick={() =>
              setJobs((js: Job[]) => [
                ...js.filter((j: Job) => j.id !== "mixdown-re"),
                { id: "mixdown-re", label: `mixdown · ${episode.toLowerCase()}-final.wav`, status: "queued", progress: 0 },
              ])
            }
            className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"
          >
            Queue new mixdown
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 xl:grid-cols-[340px_minmax(0,1fr)_340px]">
        {/* renders + drop-box */}
        <div className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Render jobs</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{jobs.length}</span>
            </header>
            <div className="p-3">
              <JobTray
                jobs={jobs}
                onCancel={(j: Job) => setJobs((js: Job[]) => js.filter((x: Job) => x.id !== j.id))}
                onDismiss={(id: string) => setJobs((js: Job[]) => js.filter((x: Job) => x.id !== id))}
              />
            </div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-2 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <Upload className="size-3.5" /> Guest drop-box
            </header>
            <div className="p-3">
              <UploadQueue
                files={files}
                onRetry={(id: string) => setFiles((fs: UploadFile[]) => fs.map((f: UploadFile) => (f.id === id ? { ...f, status: "uploading", progress: 0, error: undefined, tries: (f.tries ?? 0) + 1 } : f)))}
                onRemove={(id: string) => setFiles((fs: UploadFile[]) => fs.filter((f: UploadFile) => f.id !== id))}
              />
            </div>
          </section>
        </div>

        {/* episode timeline */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Guest episode timeline · {episode}</span>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">2026-08-29</span>
          </header>
          <div className="max-h-[420px] overflow-y-auto p-3">
            <EventTimelineDay events={DEFAULT_TIMELINE} groupBy={(e: TimelineEvent) => (e.actor?.startsWith("guest") ? "Guests" : e.actor?.startsWith("host") ? "Host" : "Studio")} />
          </div>
          <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Timeline writes back to the episode record — editors and guests see the same log.</div>
        </section>

        {/* publish + notes */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Publish schedule</span>
              <MonoLabel className="text-[10px] text-muted-foreground" tick={false}>cron</MonoLabel>
            </header>
            <div className="space-y-2 p-3">
              <CronPreview expr={cron} onChange={(v: string) => setCron(v)} />
              <p className="text-[11px] text-muted-foreground">Publishes only when mixdown, transcript and notes are green. Late assets push the slot, never truncate it.</p>
            </div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Feed targets</header>
            <ul className="divide-y divide-border">
              {FEEDS.map((f) => (
                <li key={f.name} className="flex items-center gap-2.5 px-3 py-2">
                  <span className={cn("size-2 rounded-full", f.state === "ok" ? "bg-[hsl(var(--ok))]" : "bg-[hsl(var(--warn))]")} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-semibold">{f.name}</span>
                    <span className="block truncate font-mono text-[11px] text-muted-foreground">{f.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Show-notes composer</span>
              <span className="text-[11px] text-muted-foreground">/ for commands</span>
            </header>
            <div className="p-3">
              <MentionTextarea
                value={notes}
                onChange={(v: string) => setNotes(v)}
                mentions={[
                  { id: "m1", label: "@guest · r.adeyemi", sub: "episode 128" },
                  { id: "m2", label: "@guest · n.nakamura", sub: "episode 128" },
                  { id: "m3", label: "@host · m.lune", sub: "host" },
                ]}
                commands={[
                  { cmd: "/chapter", describe: "insert chapter mark", run: () => setNotes((n: string) => `${n}\n[chapter —]`) },
                  { cmd: "/link", describe: "insert guest link", run: () => setNotes((n: string) => `${n}\nhttps://quiet-logistics.example/guests`) },
                ]}
                max={2000}
                placeholder="Show notes…"
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
