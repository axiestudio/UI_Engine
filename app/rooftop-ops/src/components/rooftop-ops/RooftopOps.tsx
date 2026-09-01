import { useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { Armchair, Ticket, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TabsOverflowStrip, type AppTab } from "tabs-overflow-strip"
import { StatusHealthStrip, type Service } from "status-health-strip"
import { EventTimelineDay, type TimelineEvent } from "event-timeline-day"
import { ToastStack, type Toast } from "toast-stack"

// COMPOSITE SCREEN · VENUE ROOFTOP OPS
// composed of: tabs-overflow-strip (zone tab rail, dot = wifi degraded),
// status-health-strip (wifi resilience), event-timeline-day (service log),
// toast-stack (switchboard + pass notices) + purpose-built hostess switchboard
// and wristband pass cards.
//
// DESIGN BAR: header strip ≤48px · label 11px semibold uppercase 12% tracking
// · body 13px · numerics 12px tabular right-aligned · panels rounded-lg
// bordered with a 36px header strip · functional copy only · motion marks
// state changes, never decorates.

export type Zone = {
  id: string
  label: string
  wifi: "operational" | "degraded" | "down"
  seated: number
  cap: number
  bands: { tier: "ga" | "vip" | "crew"; issued: number; serial: string }
}

export type RooftopOpsProps = {
  venue?: string
  night?: string
  zones?: Zone[]
  className?: string
}

const DEFAULT_ZONES: Zone[] = [
  { id: "terrace", label: "Terrace", wifi: "degraded", seated: 96, cap: 120, bands: { tier: "ga", issued: 218, serial: "RT-GA-014258" } },
  { id: "main", label: "Main floor", wifi: "operational", seated: 142, cap: 180, bands: { tier: "ga", issued: 460, serial: "RT-GA-022901" } },
  { id: "bar", label: "Bar rail", wifi: "down", seated: 38, cap: 70, bands: { tier: "vip", issued: 64, serial: "RT-VIP-000214" } },
  { id: "cloak", label: "Cloakroom", wifi: "operational", seated: 0, cap: 0, bands: { tier: "crew", issued: 22, serial: "RT-CRW-000038" } },
]

type WalkIn = { id: string; name: string; party: number; wait: number; preference: string }

const DEFAULT_WALKINS: WalkIn[] = [
  { id: "w1", name: "Party · Lindqvist", party: 4, wait: 18, preference: "terrace, wind-sheltered" },
  { id: "w2", name: "Walk-in · 2 pax", party: 2, wait: 11, preference: "bar rail" },
  { id: "w3", name: "Party · Osei", party: 6, wait: 4, preference: "anywhere, one high chair" },
]

const BASE_LOG: TimelineEvent[] = [
  { id: "s1", at: "2026-08-28T22:58:00", actor: "hostess", kind: "create", text: "table T14 seated — 4 pax, terrace wind side" },
  { id: "s2", at: "2026-08-28T22:47:00", actor: "runner", kind: "comment", text: "glassware run to bar rail, 24 pcs" },
  { id: "s3", at: "2026-08-28T22:31:00", actor: "security", kind: "alert", text: "fire exit B propped — cleared, logged" },
  { id: "s4", at: "2026-08-28T22:12:00", actor: "hostess", kind: "create", text: "walk-in queue opened · 3 parties on file" },
]

const TIER_LABEL: Record<Zone["bands"]["tier"], string> = { ga: "General", vip: "VIP lounge", crew: "Crew" }

export function RooftopOps({ venue = "Rooftop Astrakan", night = "Friday · 2026-08-28", zones = DEFAULT_ZONES, className }: RooftopOpsProps) {
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "terrace")
  const [walkins, setWalkins] = useState<WalkIn[]>(DEFAULT_WALKINS)
  const [voided, setVoided] = useState(false)
  const [log, setLog] = useState<TimelineEvent[]>(BASE_LOG)
  const [toasts, setToasts] = useState<Toast[]>([])

  const zone = zones.find((z: Zone) => z.id === zoneId) ?? zones[0]
  const tabs: AppTab[] = zones.map((z: Zone) => ({ id: z.id, label: z.label, pinned: z.id === "main", dirty: z.wifi !== "operational" }))
  const inHouse = zones.reduce((a: number, z: Zone) => a + z.seated, 0)

  const push = (title: string, tone: Toast["tone"] = "ok", action?: { label: string; run: () => void }) =>
    setToasts((t: Toast[]) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone, action }])

  const seat = (w: WalkIn) => {
    const table = `T${10 + Math.floor(Math.random() * 12)}`
    setWalkins((ws: WalkIn[]) => ws.filter((x: WalkIn) => x.id !== w.id))
    setLog((l: TimelineEvent[]) => [
      { id: "s" + String(Date.now()), at: new Date().toISOString(), actor: "hostess", kind: "create", text: `table ${table} seated — ${w.party} pax, ${w.preference}` },
      ...l,
    ])
    push(`${w.name} seated at ${table} · ${w.party} pax`, "ok")
  }

  const wifiServices: Service[] = zones.map((z: Zone) => ({
    name: `${z.label.toLowerCase().replace(/\s/g, "-")}-ap-1`,
    state: z.wifi,
    note: z.wifi === "down" ? "no beacons for 12 min — failover to mesh" : z.wifi === "degraded" ? "packet loss 6 % on 5 GHz" : "rssi steady, 41 clients",
  }))

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      {/* screen header */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Rooftop ops</h2>
        <span className="text-[12px] text-muted-foreground">{venue}</span>
        <span className="text-[12px] text-muted-foreground">· {night}</span>
        <span className="ml-auto font-mono text-[12px] tabular-nums text-muted-foreground">{inHouse} seated / cap 370</span>
        <span className="rounded bg-[hsl(var(--ok)/0.1)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[hsl(var(--ok))]">doors open</span>
      </header>

      {/* zone tab rail — dot on a tab means wifi degraded in that zone */}
      <div className="border-b bg-background px-4 py-2">
        <TabsOverflowStrip tabs={tabs} value={zoneId} onChange={(id: string) => setZoneId(id)} />
        <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Wifi className="size-3" /> dot on a tab = wifi degraded in that zone · badges auto-print on the WP80 printer
        </p>
          
    </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        {/* hostess switchboard */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Hostess switchboard</span>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{walkins.length} waiting</span>
          </header>
          <ul className="divide-y divide-border">
            {walkins.map((w: WalkIn) => (
              <li key={w.id} className="px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold">{w.name}</span>
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">wait {w.wait}′</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{w.party} pax · {w.preference}</p>
                <Button type="button" variant="ghost"
                  onClick={() => seat(w)}
                  className="mt-1.5 flex h-7 items-center gap-1.5 rounded-md border bg-background px-2.5 text-[11px] font-semibold hover:bg-muted"
                >
                  <Armchair className="size-3" /> Seat next free
                </Button>
              </li>
            ))}
            {walkins.length === 0 && <li className="px-3 py-4 text-center text-[11px] text-muted-foreground">Queue clear — next reservation block at 23:30.</li>}
          </ul>
          <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Seating writes straight to the service log the floor runners watch.</div>
        </section>

        {/* wristband passes */}
        <div className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Wristband passes · {zone?.label}</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{zone?.seated}/{zone?.cap || "—"} seated</span>
            </header>
            <div className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_200px]">
              <div>
                <table className="w-full border-collapse text-[12px]">
                  <thead>
                    <tr className="border-b text-left text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                      <th className="py-1.5 font-semibold">Tier</th>
                      <th className="py-1.5 text-right font-semibold">Issued</th>
                      <th className="py-1.5 text-right font-semibold">Scans/h</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/60"><td className="py-1 font-medium">{TIER_LABEL[zone?.bands.tier ?? "ga"]}</td><td className="py-1 text-right font-mono tabular-nums">{zone?.bands.issued}</td><td className="py-1 text-right font-mono tabular-nums">{Math.round((zone?.bands.issued ?? 0) / 3.2)}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-1 text-muted-foreground">top-up stock</td><td className="py-1 text-right font-mono tabular-nums">500</td><td className="py-1 text-right font-mono tabular-nums">—</td></tr>
                    <tr><td className="py-1 text-muted-foreground">voided tonight</td><td className="py-1 text-right font-mono tabular-nums">{voided ? 1 : 0}</td><td className="py-1 text-right font-mono tabular-nums">—</td></tr>
                  </tbody>
                </table>
                <p className="mt-2 text-[11px] text-muted-foreground">Tap-in reads the band NFC, checks the tier against the zone and opens the turnstile. Lost bands void at the reader, not the printer.</p>
              </div>
              {/* pass preview */}
              <div className={cn("group relative overflow-hidden rounded-lg border bg-background p-3", voided && "opacity-60")}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{venue}</span>
                  <Ticket className="size-3.5 text-muted-foreground" />
                </div>
                <p className="mt-2 font-mono text-[12px] font-bold tracking-[0.08em]">{zone?.bands.serial}</p>
                <p className="text-[11px] text-muted-foreground">{TIER_LABEL[zone?.bands.tier ?? "ga"]} · {zone?.label}</p>
                <AnimatePresence>
                  {voided && (
                    <motion.span
                      initial={{ opacity: 0, scale: 1.3, rotate: -8 }}
                      animate={{ opacity: 1, scale: 1, rotate: -8 }}
                      exit={{ opacity: 0, scale: 1.3 }}
                      className="absolute inset-0 grid place-items-center"
                    >
                      <span className="rounded border-2 border-[hsl(var(--err))] px-2 py-0.5 text-[13px] font-black uppercase tracking-[0.2em] text-[hsl(var(--err))]">void</span>
                    </motion.span>
                  )}
                </AnimatePresence>
                <Button type="button" variant="ghost"
                  onClick={() => {
                    if (voided) {
                      setVoided(false)
                      push("Pass restored to valid", "ok")
                      return
                    }
                    setVoided(true)
                    push(`Pass ${zone?.bands.serial} voided at the reader`, "warn", {
                      label: "Undo",
                      run: () => setVoided(false),
                    })
                  }}
                  className={cn(
                    "mt-3 flex h-7 w-full items-center justify-center rounded-md border text-[11px] font-semibold",
                    voided ? "bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))] hover:bg-[hsl(var(--ok)/0.16)]" : "bg-background hover:bg-muted",
                  )}
                >
                  {voided ? "Restore pass" : "Void pass"}
                </Button>
              </div>
            </div>
          </section>

          {/* wifi resilience */}
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-2 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <Wifi className="size-3.5" /> Wifi resilience · venue mesh
            </header>
            <div className="p-3">
              <StatusHealthStrip services={wifiServices} region="venue mesh" />
            </div>
          </section>
        </div>

        {/* service log */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Service log</span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">live</span>
            </header>
            <div className="max-h-[430px] overflow-y-auto p-3">
              <EventTimelineDay events={log} />
            </div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Handover</header>
            <p className="p-3 text-[11px] text-muted-foreground">
              Night close prints this log with the till Z-report. Wifi incidents stay attached to the zone they hit, so the Saturday crew sees the pattern.
            </p>
          </section>
        </aside>
      </div>

      <ToastStack toasts={toasts} onDismiss={(id: string) => setToasts((t: Toast[]) => t.filter((x: Toast) => x.id !== id))} pos="br" />
          </MotionConfig>
    </div>
  )
}
