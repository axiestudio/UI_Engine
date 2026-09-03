import { useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { Download, Minus, Pause, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Spotlight } from "@/components/primitives/spotlight"
import { AnnotationPinLayer, type Pin } from "annotation-pin-layer"
import { AiChangeReview, type Hunk } from "ai-change-review"
import { DiffPaneSplit, type DiffLine } from "diff-pane-split"
import { ToastStack, type Toast } from "toast-stack"

// COMPOSITE SCREEN · MEDIA REVIEW ROOM
// composed of: annotation-pin-layer (canvas pins, collision fan on the stage),
// spotlight (screening-room hover light), diff-pane-split (copy diffs),
// ai-change-review (agent re-edit hunks), toast-stack (review notices) +
// purpose-built timecode scrubber.

export type MediaReviewRoomProps = {
  cut?: string
  runtime?: string
  onExported?: () => void
  className?: string
}

const PINS: Pin[] = [
  { id: "m1", x: 46, y: 52, author: "R. Idris", text: "Hold two frames longer before the cut." },
  { id: "m2", x: 47, y: 55, author: "R. Idris", text: "Luv stabilisation jitters at the edge." },
  { id: "m3", x: 44, y: 49, author: "T. Vale", text: "Grade: lift the shadows on the face." },
  { id: "m4", x: 78, y: 30, author: "T. Vale", text: "Logo crops here on 9:16." },
]

const REEDIT_HUNKS: Hunk[] = [
  {
    id: "c1",
    file: "timeline · interview b-roll",
    title: "Trim 00:12–00:19",
    from: "Static interview shot, flat delivery, dead air at 00:16.",
    to: "Cut to mill b-roll at 00:12, back on interview at 00:19; keep room tone under the join.",
  },
  {
    id: "c2",
    file: "timeline · cold open",
    title: "Re-order establishes",
    from: "Harbour drone wide, then market interior.",
    to: "Market interior first, drone wide as the title lands — pays off the VO.",
  },
  {
    id: "c3",
    file: "mix · bed music",
    title: "Duck bed under VO",
    from: "Bed rides at −14 LUFS across the segment.",
    to: "Duck to −22 LUFS under VO, release 400 ms after each sentence.",
  },
]

const COPY_DIFF: DiffLine[] = [
  { kind: "hunk", text: "@@ captions · 00:41–00:52 @@" },
  { kind: "ctx", text: "We started with a question." },
  { kind: "del", text: "The answer took three years." },
  { kind: "add", text: "The answer took three winters." },
  { kind: "add", text: "And one stubborn little town." },
  { kind: "ctx", text: "This is what we found." },
]

const diffTone: Record<DiffLine["kind"], string> = {
  ctx: "text-muted-foreground",
  add: "bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))]",
  del: "bg-[hsl(var(--err)/0.1)] text-[hsl(var(--err))] line-through",
  hunk: "font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground",
}

const fmtTC = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`

export function MediaReviewRoom({ cut = "V4 · runtime 02:41", runtime = "02:41", onExported, className }: MediaReviewRoomProps) {
  const [pins, setPins] = useState(PINS)
  const [resolved, setResolved] = useState<Record<string, "accepted" | "rejected">>({})
  const [tc, setTc] = useState(41)
  const [playing, setPlaying] = useState(false)
  const [exported, setExported] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = (title: string, tone: Toast["tone"] = "ok") =>
    setToasts((ts) => [...ts.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])

  const decide = (h: Hunk, call: "accepted" | "rejected") => {
    setResolved((r) => ({ ...r, [h.id]: call }))
    push(`${h.title} ${call} on ${cut}`, call === "accepted" ? "ok" : "warn")
  }

  const pending = REEDIT_HUNKS.filter((h) => !resolved[h.id]).length

  const exportReview = () => {
    setExported(true)
    push("review notes exported to the editor", "ok")
    onExported?.()
  }

  return (
    <div className={cn("relative isolate flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Review a cut</h2>
        <span className="text-[12px] text-muted-foreground">{cut}</span>
        <span className={cn("text-[12px] font-semibold", pending === 0 ? "text-[hsl(var(--ok))]" : "text-muted-foreground")}>{REEDIT_HUNKS.length - pending}/{REEDIT_HUNKS.length} re-edit hunks resolved</span>
        <Button type="button" variant="ghost" onClick={exportReview} disabled={exported} className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted disabled:opacity-40">
          <Download className="size-3.5" /> {exported ? "Exported" : "Export review"}
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* stage + copy */}
        <section className="flex min-w-0 flex-col gap-4">
          <div className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Screening stage · click the frame to pin</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{pins.length} pins</span>
            </header>
            <div className="p-3">
              <AnnotationPinLayer
                author="R. Idris"
                pins={pins}
                onAddPin={(p: { x: number; y: number }) => setPins((ps) => [...ps, { id: "m" + String(Date.now()), x: p.x, y: p.y, author: "R. Idris", text: `Note at ${fmtTC(tc)} — describe the fix.` }])}
                onRemove={(id: string) => setPins((ps) => ps.filter((p) => p.id !== id))}
                canvas={
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md border bg-gradient-to-br from-app-stage-1 via-app-stage-2 to-app-stage-3">
                    <Spotlight size={280} className="from-zinc-300/20 via-zinc-500/10 to-zinc-700/5" />
                    <div className="absolute inset-x-4 bottom-4 flex items-center gap-3">
                      <Button type="button" variant="ghost" onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause" : "Play"} className="flex h-8 w-8 items-center justify-center rounded-md border border-white/15 bg-white/10 text-white hover:bg-white/20">
                        {playing ? <Pause className="size-3.5" /> : <span className="ml-0.5 border-y-[5px] border-l-[8px] border-y-transparent border-l-white" />}
                      </Button>
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
                        <div className="h-full rounded-full bg-white/70" style={{ width: `${(tc / 161) * 100}%` }} />
          
    </div>
                      <motion.span key={tc} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="rounded border border-white/15 bg-black/50 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-white/90">
                        TC {fmtTC(tc)} / {runtime}
                      </motion.span>
                    </div>
                    <div className="absolute right-4 top-4 flex gap-1">
                      <Button type="button" variant="ghost" onClick={() => setTc((t) => Math.max(0, t - 1))} aria-label="Back one second" className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/80 hover:bg-black/60"><Minus className="size-3" /></Button>
                      <Button type="button" variant="ghost" onClick={() => setTc((t) => Math.min(161, t + 1))} aria-label="Forward one second" className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/80 hover:bg-black/60"><Plus className="size-3" /></Button>
                    </div>
                  </div>
                }
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Copy diffs · captions.v4</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">+2 −1</span>
            </header>
            <div className="p-3">
              <DiffPaneSplit lines={COPY_DIFF} file="captions.v4.srt" />
            </div>
          </div>
        </section>

        {/* re-edit + notes */}
        <aside className="flex min-h-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Agent re-edit</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{pending} pending</span>
            </header>
            <div className="p-3">
              <AiChangeReview
                hunks={REEDIT_HUNKS}
                onAccept={(id: string) => {
                  const h = REEDIT_HUNKS.find((x) => x.id === id)
                  if (h && !resolved[id]) decide(h, "accepted")
                }}
                onReject={(id: string) => {
                  const h = REEDIT_HUNKS.find((x) => x.id === id)
                  if (h && !resolved[id]) decide(h, "rejected")
                }}
              />
            </div>
          </section>
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Review notes</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{Object.keys(resolved).length} logged</span>
            </header>
            <ul className="min-h-0 flex-1 divide-y divide-border/60 overflow-auto">
              {REEDIT_HUNKS.filter((h) => resolved[h.id]).map((h) => (
                <motion.li key={h.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="px-3 py-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold">{h.title}</span>
                    <span className={cn("text-[10px] font-bold uppercase tracking-[0.1em]", resolved[h.id] === "accepted" ? "text-[hsl(var(--ok))]" : "text-[hsl(var(--warn))]")}>{resolved[h.id]}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{h.file}</p>
                </motion.li>
              ))}
              {Object.keys(resolved).length === 0 && <li className="px-3 py-6 text-center text-[12px] text-muted-foreground">Accept or reject each hunk to log a note.</li>}
            </ul>
            <AnimatePresence>
              {pending === 0 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-t bg-[hsl(var(--ok)/0.08)] px-3 py-2 text-[11px] font-semibold text-[hsl(var(--ok))]">
                  ALL HUNKS RESOLVED — export unlocked
                </motion.p>
              )}
            </AnimatePresence>
          </section>
        </aside>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((ts) => ts.filter((t) => t.id !== id))} pos="br" />
      </MotionConfig>
    </div>
  )
}
