import * as React from "react"
import { motion } from "motion/react"
import { PenLine } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TextEffect } from "@/components/primitives/text-effect"
import { MonoLabel, Grain } from "@/components/primitives/handcraft"
import { MentionTextarea } from "mention-textarea"
import { SmartSkeleton } from "smart-skeleton"
import { CodeSnippetPanel } from "code-snippet-panel"
import { CronPreview } from "cron-preview"
import { SegmentedControl } from "segmented-control"
import { ToastStack } from "toast-stack"

// COMPOSITE — text-effect + mention-textarea + smart-skeleton +
// code-snippet-panel + cron-preview + segmented-control + toast-stack
// JOB      publish the studio's words without a 14-tab CMS
// MOVE     the headline scramble-decodes AS it's drafted (TextEffect per-word),
//          the right column is a live "what readers get" preview

const CHAN = [
  { value: "site", label: "Site" }, { value: "board", label: "Board ticker" }, { value: "letter", label: "Letter" },
]

export type EditorialStudioProps = { className?: string }

export function EditorialStudio({ className }: EditorialStudioProps) {
  const [channel, setChannel] = React.useState("site")
  const [title, setTitle] = React.useState("Why the north mirror wins in November")
  const [body, setBody] = React.useState("")
  const [cron, setCron] = React.useState("0 9 * * 5")
  const [rendering, setRendering] = React.useState(false)
  const [toasts, setToasts] = React.useState<{ id: string; title: string; tone?: "ok" | "warn" }[]>([])
  const push = (title: string, tone: "ok" | "warn" = "ok") => setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])
  const publish = () => { setRendering(true); setTimeout(() => { setRendering(false); push("queued for " + channel + " · 09:00 Friday") }, 1600) }

  return (
    <div className={cn("relative isolate min-h-[560px] overflow-hidden rounded-2xl border bg-background font-sans", className)}>
      <Grain opacity={0.035} />
      <header className="flex flex-wrap items-center gap-4 border-b bg-card px-5 py-4">
        <span className="flex items-center gap-2"><PenLine className="size-4 text-muted-foreground" aria-hidden />{!rendering ? <TextEffect key={title} preset="fade" as="h2" className="font-display text-lg font-black tracking-tight" per="char" speed={0.3}>{title}</TextEffect> : <h2 className="font-display text-lg font-black tracking-tight">rendering…</h2>}</span>
        <Badge variant="secondary" className="font-mono text-[9px]">draft 2201-04</Badge>
        <SegmentedControl size="sm" className="ml-auto" value={channel} onChange={setChannel} options={CHAN} />
      </header>
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card><CardContent className="p-5">
            <MonoLabel className="mb-1 block text-muted-foreground">HEADLINE (edit and watch it decode)</MonoLabel>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mb-4 h-9 w-full rounded-md border bg-background px-3 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--app-focus))]" />
            <MentionTextarea value={body} onChange={setBody} max={900} onSubmit={publish} placeholder="Paragraph one… @Elin for the photo credit, /gif for the loop" mentions={[{ id: "e", label: "Elin" }, { id: "k", label: "Klara" }]} commands={[{ cmd: "gif", describe: "embed the press loop", run: () => push("loop embedded (press-loop.mp4)") }]} />
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <MonoLabel className="mb-3 block text-muted-foreground">EMBED ON THE SITE — deploy snippet</MonoLabel>
            <CodeSnippetPanel title={`<EngineArticle slug=\"${title.split(" ")[0].toLowerCase()}\" channel=\"${channel}\" />`} code={`import { EngineArticle } from "engine/web"\n\n<EngineArticle slug="north-mirror-nov" channel="${channel}" autoSync={${true}} />`} />
          </CardContent></Card>
        </div>
        <aside className="space-y-5">
          <Card><CardContent className="p-5">
            <MonoLabel className="mb-2 block text-muted-foreground">PUBLISH WINDOW — what readers see, and when</MonoLabel>
            <CronPreview expr={cron} onChange={setCron} />
            <motion.button whileTap={{ scale: 0.97 }} onClick={publish} className="mt-4 h-10 w-full rounded-lg bg-primary font-mono text-[11px] font-black uppercase tracking-[0.18em] text-primary-foreground">{rendering ? "building…" : "publish → " + channel}</motion.button>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <MonoLabel className="mb-3 block text-muted-foreground">READER PREVIEW</MonoLabel>
            <SmartSkeleton loading={rendering} lines={6}>
              <article className="space-y-2">
                <h3 className="font-display text-lg font-black leading-tight">{title}</h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{body || "Start typing — the preview fills as the words arrive."}</p>
                {body.match(/@(\w+)/) && <p className="text-[11px] font-bold text-[hsl(var(--app-focus))]">with thanks to @{body.match(/@(\w+)/)?.[1]}</p>}
              </article>
            </SmartSkeleton>
          </CardContent></Card>
        </aside>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} pos="tl" />
    </div>
  )
}
