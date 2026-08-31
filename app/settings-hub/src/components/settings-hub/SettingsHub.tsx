import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Disclosure, DisclosureTrigger, DisclosureContent } from "@/components/primitives/disclosure"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel, Grain } from "@/components/primitives/handcraft"
import { SegmentedControl } from "segmented-control"
import { PasswordMeter } from "password-meter"
import { CopySecretField } from "copy-secret-field"
import { StorageRingMeter } from "storage-ring-meter"
import { UploadQueue, type UploadFile } from "upload-queue"
import { ToastStack } from "toast-stack"
import { MentionTextarea } from "mention-textarea"

// COMPOSITE — segmented-control + password-meter + copy-secret-field +
// storage-ring-meter + upload-queue + mention-textarea + toast-stack, in
// watermelon card/switch/label/separator + motion-disclosure accordions.
// JOB      the page admins actually live in
// MOVE     switching panes slides the whole column (shared-layout), and every
//          danger zone is a disclosure that must be READ before it arms

const PANES = [
  { value: "profile", label: "Profile" }, { value: "security", label: "Security" }, { value: "plan", label: "Plan & data" }, { value: "prefs", label: "Preferences" },
]

export type SettingsHubProps = { className?: string }

export function SettingsHub({ className }: SettingsHubProps) {
  const [pane, setPane] = React.useState("profile")
  const [pw, setPw] = React.useState("")
  const [files, setFiles] = React.useState<UploadFile[]>([{ id: "1", name: "avatar.jpg", size: 240000, status: "uploading", progress: 58 }])
  const [bio, setBio] = React.useState("")
  const [toasts, setToasts] = React.useState<{ id: string; title: string; tone?: "ok" | "warn" | "info" }[]>([])
  const push = (title: string, tone: "ok" | "warn" | "err" | "info" = "info") => setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])
  React.useEffect(() => { const iv = setInterval(() => setFiles((fs) => fs.map((f) => (f.status === "uploading" ? { ...f, progress: (f.progress ?? 0) + 10, ...(f.progress! + 10 >= 100 ? { status: "done" as const, progress: 100 } : {}) } : f))), 400); return () => clearInterval(iv) }, [])

  return (
    <div className={cn("relative isolate min-h-[560px] overflow-hidden rounded-2xl border bg-background font-sans", className)}>
      <Grain opacity={0.035} />
      <header className="flex flex-wrap items-center gap-4 border-b bg-card px-5 py-4">
        <h2 className="font-display text-lg font-black tracking-tight">Settings</h2>
        <SegmentedControl size="sm" className="ml-2" value={pane} onChange={setPane} options={PANES} />
        <p className="ml-auto font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">northline-studio · plan: house</p>
      </header>

      <InView key={pane} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
        <div className="mx-auto max-w-[860px] space-y-5 p-5">
          {pane === "profile" && (
            <Card><CardContent className="grid gap-5 p-5 sm:grid-cols-2">
              <div>
                <MonoLabel className="mb-1 block text-muted-foreground">DISPLAY NAME / EMAIL</MonoLabel>
                <input defaultValue="Elin Sandberg" className="h-9 w-full rounded-md border bg-background px-3 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--app-focus))]" />
                <div className="mt-3"><MentionTextarea value={bio} onChange={setBio} max={160} onSubmit={() => push("bio saved", "ok")} placeholder="One line the team sees on your card — you can @mention teams…" /></div>
              </div>
              <div>
                <MonoLabel className="mb-1 block text-muted-foreground">AVATAR / BRAND KIT UPLOAD</MonoLabel>
                <UploadQueue files={files} onRetry={(id) => setFiles((fs) => fs.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 8 } : f)))} onRemove={(id) => setFiles((fs) => fs.filter((f) => f.id !== id))} />
              </div>
            </CardContent></Card>
          )}
          {pane === "security" && (
            <>
              <Card><CardContent className="space-y-4 p-5">
                <MonoLabel className="block text-muted-foreground">PASSWORD — the meter is the bouncer</MonoLabel>
                <PasswordMeter value={pw} onChange={setPw} />
                <button disabled={pw.length < 12} onClick={() => push("password rotated; sessions held", "ok")} className="h-9 rounded-md bg-primary px-4 text-[10px] font-black uppercase tracking-[0.16em] text-primary-foreground disabled:opacity-40">update password</button>
              </CardContent></Card>
              <Card><CardContent className="space-y-4 p-5">
                <CopySecretField label="PERSONAL API TOKEN" value="el_sk_019d·77b2·ce11·8f" onRotate={() => push("token rotated after next API call", "warn")} />
                <Disclosure>
                  <DisclosureTrigger className="w-full rounded-md border px-3 py-2 text-left text-[12px] font-bold">danger zone · delete workspace disclosure…</DisclosureTrigger>
                  <DisclosureContent className="px-3 pt-3 text-[12px] text-muted-foreground">
                    <p>Permanent. Visits, clients, the lot — 30-day vault then gone.</p>
                    <button onClick={() => push("type DELETE in the terminal of your heart", "err")} className="mt-3 h-9 rounded-md border-2 border-[hsl(var(--err))] px-4 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-[hsl(var(--err))]">delete workspace</button>
                  </DisclosureContent>
                </Disclosure>
              </CardContent></Card>
            </>
          )}
          {pane === "plan" && (
            <Card><CardContent className="p-5">
              <MonoLabel className="mb-4 block text-muted-foreground">PLAN & DATA — this is what “House” buys</MonoLabel>
              <StorageRingMeter quota={512 * 1073741824} resetNote="renews 12 Nov" segments={[
                { label: "Visit archive", bytes: 103 * 1073741824 }, { label: "Reference media", bytes: 209 * 1073741824 }, { label: "Press output", bytes: 84 * 1073741824 }, { label: "Snapshots", bytes: 111 * 1073741824 },
              ]} />
              <Separator className="my-5" />
              <div className="flex flex-wrap gap-6 text-[13px] font-semibold">
                {[["Seats", "8 / 8"], ["Chairs", "10"], ["SMS pack", "2,000"], ["API /mo", "1.2M"]].map(([l, v]) => (
                  <div key={l as string}><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{l}</p><p className="mt-0.5 text-lg font-black tabular-nums">{v}</p></div>
                ))}
              </div>
            </CardContent></Card>
          )}
          {pane === "prefs" && (
            <Card><CardContent className="space-y-3 p-5">
              {[["Email digests", true], ["Push for new bookings", true], ["Weekly board photo", false], ["Marketing: we never sell your data", false]].map(([l, v], idx) => (
                <div key={idx} className="flex items-center justify-between py-1">
                  <Label className="text-[13px] font-medium">{l}</Label>
                  <Switch checked={Boolean(v)} disabled={l === "Marketing: we never sell your data"} onCheckedChange={() => push(String(l) + " updated", "ok")} />
                </div>
              ))}
            </CardContent></Card>
          )}
        </div>
      </InView>
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
    </div>
  )
}
