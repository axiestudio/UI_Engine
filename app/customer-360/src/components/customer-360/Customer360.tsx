import * as React from "react"
import { motion } from "motion/react"
import { UserRound, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { TabsOverflowStrip, type AppTab } from "tabs-overflow-strip"
import { EventTimelineDay } from "event-timeline-day"
import { SwitchAuditTrail } from "switch-audit-trail"
import { CopySecretField } from "copy-secret-field"
import { StorageRingMeter } from "storage-ring-meter"
import { ToastStack } from "toast-stack"
import { DetailDrawerSplit } from "detail-drawer-split"

// COMPOSITE — tabs-overflow-strip + event-timeline-day + switch-audit-trail
// + copy-secret-field + storage-ring-meter + detail-drawer-split + toast-stack
// JOB      open a client and know everything, then act
// MOVE     the header identity card is the sun: every tab orbit keeps its
//          avatar halo pulsing when a live event touches it

const TABS: AppTab[] = [
  { id: "visits", label: "Visits", pinned: true }, { id: "ledger", label: "Ledger", dirty: true },
  { id: "keys", label: "Client keys" }, { id: "media", label: "Reference media" }, { id: "docs", label: "Docs" },
  { id: "notes", label: "Notes" }, { id: "history", label: "Edit history" }, { id: "devices", label: "Devices" },
]

export type Customer360Props = { name?: string; since?: string; chair?: string; onAction?: (what: string) => void; className?: string }

export function Customer360({ name = "M. Ahlberg", since = "client since 2021", chair = "chair 03", onAction, className }: Customer360Props) {
  const [tab, setTab] = React.useState("visits")
  const [drawer, setDrawer] = React.useState(false)
  const [editIndex, setEditIndex] = React.useState(2)
  const [toasts, setToasts] = React.useState<{ id: string; title: string; tone?: "ok" | "warn" | "info" }[]>([])
  const push = (title: string, tone: "ok" | "warn" | "info" = "info") => setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])
  const now = Date.now()

  const audit = [
    { id: "e1", at: new Date(now - 30e5).toISOString(), actor: "Elin S.", field: "visit.premium", from: "false", to: "true" },
    { id: "e2", at: new Date(now - 9e7).toISOString(), actor: "system", field: "consent.marketing", from: "true", to: "false" },
    { id: "e3", at: new Date(now - 4e8).toISOString(), actor: "Klara L.", field: "chair.preferred", from: "01", to: "03" },
  ]
  const [entries, setEntries] = React.useState(audit)
  const events = [
    { id: "v1", at: now - 86400000, actor: name, kind: "create" as const, text: "booked chair 03 — colour refresh" },
    { id: "v2", at: now - 86400000 * 4, actor: "Klara L.", kind: "edit" as const, text: "tone adjusted after patch note" },
    { id: "v3", at: now - 86400000 * 18, kind: "alert" as const, text: "missed 15:00 — rebooked same week" },
    { id: "v4", at: now - 86400000 * 40, kind: "comment" as const, actor: "front desk", text: "requests the quiet chair by the press" },
  ]

  return (
    <div className={cn("relative isolate overflow-hidden rounded-xl border border-border/70 bg-background", className)}>
      {/* identity header */}
      <div className="flex flex-wrap items-center gap-4 border-b border-border/60 bg-card px-5 py-4">
        <Avatar className="size-12 ring-2 ring-ring/20 ring-offset-background">
          <AvatarFallback className="bg-accent text-[13px] font-semibold">{name.split(/[ .]/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <motion.h2 animate={{ textShadow: toasts.length ? "0 0 24px hsl(var(--ring)/0.5)" : "none" }} className="font-display text-lg font-semibold tracking-tight">{name}</motion.h2>
          <p className="text-xs text-muted-foreground">{since} · {chair}</p>
          
    </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 text-xs"><Wallet className="size-3" aria-hidden /> 12 visits · 4.9★</Badge>
        </div>
      </div>

      <TabsOverflowStrip tabs={TABS} value={tab} onChange={setTab} onClose={(id) => push(`detached ${id}`)} onPin={(id) => push(id + " pinned", "ok")} />

      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-border/70 bg-card p-5">
          <p className="mb-4 text-sm font-medium text-muted-foreground">{tab.toUpperCase()} — {tab === "history" ? "every edit, with receipt" : "the long view"}</p>
          {tab === "history" ? (
            <SwitchAuditTrail entries={entries} onRevert={(e) => { setEntries((x) => [{ id: Math.random().toFixed(2), at: new Date().toISOString(), actor: "you", field: e.field, from: e.to, to: e.from }, ...x]); push("reverted + stamped", "ok") }} />
          ) : (
            <EventTimelineDay events={events} />
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <StorageRingMeter quota={4 * 1073741824} segments={[
                { label: "Reference photos", bytes: 1_610_612_736 }, { label: "Colour formulas", bytes: 322_122_547 }, { label: "Voice notes", bytes: 107_374_182 },
              ]} label="CLIENT VAULT" resetNote="archive 12/31" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4 p-4">
              <CopySecretField label="Client portal link" value="https://house.fit/a/ahl-2021-m" />
              <CopySecretField label="Booking token" value="tk_live_88·41·02·7f" onRotate={() => { push("token rotated", "warn") }} />
              <Button type="button" variant="ghost" onClick={() => setDrawer(true)} className="h-9 w-full rounded-lg border border-border/70 text-sm font-medium hover:bg-muted">open full record → side drawer</Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      <DetailDrawerSplit open={drawer} onClose={() => setDrawer(false)} title={`${name} · full record`} index={editIndex} count={3} onPrev={() => setEditIndex((i) => Math.max(0, i - 1))} onNext={() => { const n = Math.min(2, editIndex + 1); setEditIndex(n); onAction?.("record " + n) }} persistKey="c360">
          <div className="space-y-3 text-[13px]">
          <p className="text-muted-foreground">Record {editIndex + 1} — hairline edit rail, same data.</p>
          <div className="h-40 rounded-lg border border-border/60 bg-muted/40" /><div className="h-24 rounded-lg border border-border/60 bg-muted/40" />
          <Button type="button" variant="ghost" className="mt-2 h-9 w-full rounded-md bg-[hsl(var(--err))] text-sm font-medium text-primary-foreground" onClick={() => { push("anonymisation scheduled", "warn"); setDrawer(false) }}>anonymise account</Button>
        </div>
      </DetailDrawerSplit>
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  )
}
