import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { CalendarClock, MessageSquareReply, Pause, Play, SendHorizonal } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/watermelon/table"
import { Checkbox } from "@/components/watermelon/checkbox"
import { CronPreview } from "cron-preview"
import { MentionTextarea } from "mention-textarea"
import { ActivityHeatmap } from "activity-heatmap"
import { InboxSnoozeCenter, type InboxItem } from "inbox-snooze-center"

// COMPOSITE SCREEN · SOCIAL SCHEDULER
// composed of: cron-preview (posting cadence + next runs), mention-textarea
// (composer with @mentions), activity-heatmap (reach heat), inbox-snooze-center
// (reply inbox) + purpose-built network segments and the week queue table.

export type QueuePost = {
  id: string
  when: string
  network: "instagram" | "linkedin" | "x" | "newsletter"
  preview: string
  state: "queued" | "published" | "held"
}
export type NetworkSeg = {
  network: QueuePost["network"]
  used: number
  queued: number
  quota: number
  paused?: boolean
}
export type SocialSchedulerProps = {
  handle?: string
  cadence?: string
  posts?: QueuePost[]
  networks?: NetworkSeg[]
  replies?: InboxItem[]
  onQueued?: (post: QueuePost) => void
  className?: string
}

const DEFAULT_POSTS: QueuePost[] = [
  { id: "q1", when: "Tue 09:30", network: "linkedin", preview: "Case study: halving onboarding time for B2B fleets", state: "queued" },
  { id: "q2", when: "Wed 17:00", network: "instagram", preview: "Reel — behind the build week 34", state: "queued" },
  { id: "q3", when: "Thu 12:15", network: "x", preview: "Thread: 5 pricing myths we stopped believing", state: "held" },
  { id: "q4", when: "Mon 09:30", network: "linkedin", preview: "Customer story: Nordvik Logistics goes zero-downtime", state: "published" },
]

const DEFAULT_NETWORKS: NetworkSeg[] = [
  { network: "instagram", used: 3, queued: 2, quota: 7 },
  { network: "linkedin", used: 2, queued: 1, quota: 5 },
  { network: "x", used: 6, queued: 1, quota: 10, paused: true },
  { network: "newsletter", used: 0, queued: 1, quota: 1 },
]

const DEFAULT_REPLIES: InboxItem[] = [
  { id: "r1", title: "Comment on Reel — price?", body: "“Does the fleet tier include the API?”", at: "18 min ago" },
  { id: "r2", title: "DM — reseller request", body: "Stockholm studio asking about partner terms", at: "1 h ago" },
  { id: "r3", title: "Quote-post — launch thread", body: "Adding our benchmark numbers, needs fact check", at: "3 h ago" },
]

const NETWORK_META: Record<QueuePost["network"], { label: string; color: string }> = {
  instagram: { label: "Instagram", color: "hsl(var(--pinned))" },
  linkedin: { label: "LinkedIn", color: "hsl(var(--info))" },
  x: { label: "X", color: "hsl(var(--foreground))" },
  newsletter: { label: "Newsletter", color: "hsl(var(--ok))" },
}

// 14 weeks of daily reach, mid-week lunch peaks
const REACH: number[] = Array.from({ length: 98 }, (_, i) => {
  const day = i % 7
  const base = day === 2 || day === 3 ? 180 : day === 6 || day === 0 ? 40 : 110
  return Math.max(0, Math.round(base + Math.sin((i / 98) * Math.PI * 3) * 60 + ((i * 29) % 40)))
})

export function SocialScheduler({
  handle = "@norrsken.studio",
  cadence = "30 9 * * 1-5",
  posts = DEFAULT_POSTS,
  networks = DEFAULT_NETWORKS,
  replies = DEFAULT_REPLIES,
  onQueued,
  className,
}: SocialSchedulerProps) {
  const [expr, setExpr] = React.useState(cadence)
  const [segs, setSegs] = React.useState(networks)
  const [queue, setQueue] = React.useState(posts)
  const [picked, setPicked] = React.useState<string[]>([])
  const [text, setText] = React.useState("New case study drops Tuesday — the numbers surprised even us. cc @marit your favourite chart is slide 3")
  const [inbox, setInbox] = React.useState(replies)
  const [handled, setHandled] = React.useState(0)
  const [flash, setFlash] = React.useState<string | null>(null)

  const setSeg = (network: QueuePost["network"], patch: Partial<NetworkSeg>) =>
    setSegs((ss) => ss.map((s) => (s.network === network ? { ...s, ...patch } : s)))

  const queueIt = () => {
    if (!text.trim()) return
    const net: QueuePost["network"] = "linkedin"
    const post: QueuePost = {
      id: "q" + Date.now(),
      when: "Tue 09:30",
      network: net,
      preview: text.trim().slice(0, 64) + (text.trim().length > 64 ? "…" : ""),
      state: "queued",
    }
    setQueue((qs) => [post, ...qs])
    setSeg(net, { queued: (segs.find((s) => s.network === net)?.queued ?? 0) + 1 })
    setText("")
    setFlash(`queued for ${post.when} on ${NETWORK_META[net].label}`)
    onQueued?.(post)
    window.setTimeout(() => setFlash(null), 2400)
  }

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Queue the week</h2>
        <span className="font-mono text-[12px] text-muted-foreground">{handle}</span>
        <span className="text-[12px] text-muted-foreground">· week 35 · 4 channels</span>
        <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">
          {queue.filter((q) => q.state === "queued").length} queued · {queue.filter((q) => q.state === "published").length} published
        </span>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-[300px_minmax(0,1fr)_290px]">
        {/* cadence + segments */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-2 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <CalendarClock className="size-3.5" /> Cadence
            </header>
            <div className="p-3">
              <CronPreview expr={expr} onChange={setExpr} />
            </div>
          </section>

          <section className="flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Network segments
              <span className="font-mono text-[10px] normal-case tracking-normal">week quota</span>
            </header>
            <ul className="grid gap-3 p-3">
              {segs.map((s) => {
                const meta = NETWORK_META[s.network]
                const pct = Math.min(100, Math.round(((s.used + s.queued) / s.quota) * 100))
                return (
                  <li key={s.network}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[12px] font-bold">
                        <span className="size-2 rounded-[2px]" style={{ background: meta.color }} aria-hidden />
                        {meta.label}
                      </span>
                      <button
                        onClick={() => setSeg(s.network, { paused: !s.paused })}
                        className="flex h-6 items-center gap-1 rounded border bg-background px-1.5 text-[10px] font-bold uppercase text-muted-foreground hover:bg-muted"
                        aria-label={s.paused ? `Resume ${meta.label}` : `Pause ${meta.label}`}
                      >
                        {s.paused ? <Play className="size-3" /> : <Pause className="size-3" />}
                        {s.paused ? "resume" : "pause"}
                      </button>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${s.used} published, ${s.queued} queued of ${s.quota}`}>
                      <motion.span className="h-full" style={{ background: meta.color, opacity: 0.45 }} animate={{ width: `${(s.used / s.quota) * 100}%` }} />
                      <motion.span className={cn("h-full", s.paused && "opacity-40")} style={{ background: meta.color }} animate={{ width: `${(s.queued / s.quota) * 100}%` }} />
                    </div>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                      {s.used} pub · {s.queued} queued / {s.quota} {s.paused && <span className="font-bold text-[hsl(var(--warn))]">· paused</span>}
                    </p>
                  </li>
                )
              })}
            </ul>
          </section>
        </aside>

        {/* composer + queue + heat */}
        <div className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Composer</span>
              <AnimatePresence>
                {flash && (
                  <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="font-mono text-[10px] font-bold uppercase tracking-wide text-[hsl(var(--ok))]">
                    {flash}
                  </motion.span>
                )}
              </AnimatePresence>
            </header>
            <div className="grid gap-2 p-3">
              <MentionTextarea
                value={text}
                onChange={setText}
                max={500}
                placeholder="Draft the post… @mention teammates, /commands for slots"
                mentions={[
                  { id: "m1", label: "marit", sub: "design lead" },
                  { id: "m2", label: "jonas", sub: "growth" },
                  { id: "m3", label: "norrsken.studio", sub: "brand account" },
                ]}
                commands={[
                  { cmd: "/peak", describe: "queue at next peak slot", run: () => setFlash("slot locked — Tue 09:30 peak") },
                  { cmd: "/thread", describe: "split into a thread draft", run: () => setFlash("thread draft created") },
                ]}
                onSubmit={queueIt}
              />
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">Links get a per-channel UTM · images are cropped per segment on publish</p>
                <button onClick={queueIt} disabled={!text.trim()} className="flex h-8 items-center gap-1.5 rounded-md bg-[hsl(var(--info))] px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-white hover:bg-[hsl(var(--info)/0.9)] disabled:opacity-40">
                  <SendHorizonal className="size-3.5" /> Queue post
                </button>
              </div>
            </div>
          </section>

          <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Week queue</span>
              <button
                disabled={!picked.length}
                onClick={() => {
                  setQueue((qs) => qs.filter((q) => !picked.includes(q.id)))
                  setPicked([])
                }}
                className="text-[11px] font-bold text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                pull {picked.length || ""} from queue
              </button>
            </header>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 w-9 px-3" />
                  <TableHead className="h-8 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">When</TableHead>
                  <TableHead className="h-8 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Draft</TableHead>
                  <TableHead className="h-8 px-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">State</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.map((q) => (
                  <TableRow key={q.id} className={cn(q.state !== "queued" && "opacity-50")}>
                    <TableCell className="px-3 py-1">
                      <Checkbox
                        checked={picked.includes(q.id)}
                        disabled={q.state !== "queued"}
                        onCheckedChange={(c) => setPicked((p) => (c ? [...p, q.id] : p.filter((x) => x !== q.id)))}
                        aria-label={`Select ${q.preview}`}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-2 py-1.5 font-mono text-[12px] tabular-nums">{q.when}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[12px]">
                      <span className="mr-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase text-muted-foreground">
                        <span className="size-1.5 rounded-full" style={{ background: NETWORK_META[q.network].color }} aria-hidden />
                        {q.network}
                      </span>
                      {q.preview}
                    </TableCell>
                    <TableCell className="px-3 py-1.5 text-right">
                      <span
                        className={cn(
                          "rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          q.state === "queued" && "border-[hsl(var(--info)/0.4)] text-[hsl(var(--info))]",
                          q.state === "published" && "border-[hsl(var(--ok)/0.4)] text-[hsl(var(--ok))]",
                          q.state === "held" && "border-[hsl(var(--warn)/0.5)] text-[hsl(var(--warn))]",
                        )}
                      >
                        {q.state}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Reach heat · past 14 weeks</span>
              <MonoLabel tick={false} className="text-[10px] text-muted-foreground">mid-week lunches win</MonoLabel>
            </header>
            <div className="p-3">
              <ActivityHeatmap cells={REACH.map((c) => ({ count: c }))} weeks={14} levelOf={(c) => (c === 0 ? 0 : c < 60 ? 1 : c < 130 ? 2 : c < 210 ? 3 : 4)} />
            </div>
          </section>
        </div>

        {/* reply inbox */}
        <aside className="flex flex-col gap-4">
          <section className="flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-2 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <MessageSquareReply className="size-3.5" /> Reply inbox
            </header>
            <div className="p-3">
              <InboxSnoozeCenter
                items={inbox}
                completed={handled}
                onComplete={(id) => {
                  setInbox((xs) => xs.filter((x) => x.id !== id))
                  setHandled((h) => h + 1)
                }}
                onSnooze={(id, span) => setInbox((xs) => xs.map((x) => (x.id === id ? { ...x, at: `snoozed ${span}` } : x)))}
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
