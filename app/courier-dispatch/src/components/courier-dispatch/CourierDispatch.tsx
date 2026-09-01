import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { MapPin, Navigation, RadioTower, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { StickyGroupList, type GroupList } from "sticky-group-list"
import { AnnotationPinLayer, type Pin } from "annotation-pin-layer"
import { OfflineQueueBanner } from "offline-queue-banner"
import { ToastStack, type Toast } from "toast-stack"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/watermelon/checkbox"

// COMPOSITE SCREEN · COURIER DISPATCH
// composed of: sticky-group-list (route stops that stick), annotation-pin-layer
// (driver pins over a map card), offline-queue-banner (resilience strip),
// toast-stack (courier status pings) + purpose-built ETA scrubbers and wave
// selection.
//
// DESIGN BAR: header strip ≤48px · labels 11px semibold uppercase 12% tracking
// · body 13px · numerics 12px mono tabular right · panels rounded-lg with 36px
// header strips · motion marks state changes only.

export type Stop = { id: string; label: string; window: string; parcels: number; done?: boolean }

export type CourierDispatchProps = {
  city?: string
  routes?: { id: string; name: string; van: string; stops: Stop[]; eta: number }[]
  className?: string
}

type Route = { id: string; name: string; van: string; stops: Stop[]; eta: number }

const DEFAULT_ROUTES: Route[] = [
  {
    id: "roed", name: "Röd route", van: "van 7 · Dana K.", eta: 4,
    stops: [
      { id: "s1", label: "Klara gata 4 · pickup hub", window: "09:00–09:30", parcels: 14 },
      { id: "s2", label: "Sveavägen 18 · office", window: "10:15–11:00", parcels: 3 },
      { id: "s3", label: "Drottninggatan 71 · shop", window: "11:30–12:15", parcels: 2, done: true },
    ],
  },
  {
    id: "blaa", name: "Blå route", van: "van 3 · Orhan T.", eta: -2,
    stops: [
      { id: "s4", label: "Medborgarplatsen 8 · café", window: "09:20–10:00", parcels: 6 },
      { id: "s5", label: "Renstiernas gata 12 · clinic", window: "10:45–11:30", parcels: 1, done: true },
    ],
  },
]

const DRIVERS: Pin[] = [
  { id: "d1", x: 0.32, y: 0.44, author: "van 7 · Dana K.", text: "3 stops left · idling at Sveavägen traffic" },
  { id: "d2", x: 0.68, y: 0.62, author: "van 3 · Orhan T.", text: "delivered clinic · heading to hub" },
]

const WAVE = [
  { id: "w1", name: "Dana K.", van: "van 7" },
  { id: "w2", name: "Orhan T.", van: "van 3" },
  { id: "w3", name: "Linn Aa.", van: "e-bike 12" },
  { id: "w4", name: "Petr N.", van: "van 9" },
]

export function CourierDispatch({ city = "Stockholm innerstad", routes = DEFAULT_ROUTES, className }: CourierDispatchProps) {
  const [wave, setWave] = React.useState(routes)
  const [pins, setPins] = React.useState(DRIVERS)
  const [picked, setPicked] = React.useState<string[]>(["w1", "w2"])
  const [online, setOnline] = React.useState(true)
  const [queued, setQueued] = React.useState(0)
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const push = (title: string, tone: Toast["tone"] = "info", body?: string) =>
    setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone, body }])

  const scrub = (id: string, eta: number) => setWave((ws) => ws.map((r) => (r.id === id ? { ...r, eta } : r)))

  const deliverNext = (route: Route) => {
    const next = route.stops.find((s) => !s.done)
    if (!next) return
    setWave((ws) => ws.map((r) => (r.id === route.id ? { ...r, stops: r.stops.map((s) => (s.id === next.id ? { ...s, done: true } : s)) } : r)))
    push(`${route.name}: delivered`, "ok", `${next.label} · ${next.parcels} parcels`)
  }

  const pingAll = () => {
    if (!online) {
      setQueued((q) => q + 1)
      push("Dispatch ping queued", "warn", "No data link — the ping flushes when the link returns.")
      return
    }
    push("Pinged 2 drivers", "info", "Both acknowledged within 40 s.")
  }

  const groups: GroupList<Stop>[] = wave.map((r) => ({
    key: r.id,
    header: (
      <span className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground"><Truck className="size-3.5" /> {r.name}</span>
        <span className={cn("font-mono text-[11px] tabular-nums", r.eta > 5 ? "text-[hsl(var(--err))]" : r.eta > 0 ? "text-[hsl(var(--warn))]" : "text-muted-foreground")}>{r.van} · ETA {r.eta >= 0 ? "+" : ""}{r.eta} min</span>
      </span>
    ),
    rows: r.stops,
  }))

  const remaining = wave.reduce((a, r) => a + r.stops.filter((s) => !s.done).length, 0)

  return (
    <div className={cn("relative isolate flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>

      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Courier dispatch</h2>
        <span className="text-[12px] text-muted-foreground">{city}</span>
        <span className="text-[12px] text-muted-foreground">· wave 2 · {remaining} stops left</span>
        <Button type="button" variant="ghost" onClick={() => setOnline((o) => !o)} className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"><RadioTower className="size-3.5" /> {online ? "Simulate dead zone" : "Data link down"}</Button>
        <Button type="button" variant="ghost" onClick={pingAll} className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted">Ping drivers</Button>
      </header>

      <OfflineQueueBanner online={online} queued={queued} onRetryNow={() => { if (online) return; setOnline(true); setQueued(0); push("Link restored", "ok", `${queued} queued pings flushed.`) }} className="shrink-0 rounded-none border-x-0 border-t-0" />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* left — routes + wave */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 shrink-0 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Route stops</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{wave.length} running</span>
            </header>
            <div className="min-h-0 flex-1">
              <StickyGroupList<Stop>
                groups={groups}
                height="100%"
                renderRow={(s) => (
                  <div className={cn("flex items-center justify-between px-3 py-1.5 text-[12px]", s.done && "opacity-50")}>
                    <span className={cn("font-medium", s.done && "line-through")}>{s.label}</span>
                    <span className="ml-2 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">{s.window} · {s.parcels}p</span>
          
    </div>
                )}
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Wave 2 crew</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{picked.length} / {WAVE.length} in</span>
            </header>
            <div className="grid gap-1 p-3">
              {WAVE.map((c) => (
                <label key={c.id} className="flex items-center gap-2 rounded-md px-1.5 py-1 text-[12px] hover:bg-muted/50">
                  <Checkbox checked={picked.includes(c.id)} onCheckedChange={(v: boolean) => setPicked((p) => (v ? [...p, c.id] : p.filter((x) => x !== c.id)))} aria-label={`include ${c.name}`} />
                  <span className="font-medium">{c.name}</span>
                  <Badge variant="outline" className="ml-auto font-mono text-[9px] uppercase">{c.van}</Badge>
                </label>
              ))}
            </div>
          </section>
        </aside>

        {/* right — map card + eta scrubbers */}
        <section className="flex min-w-0 flex-col gap-4">
          <Card className="min-h-0 flex-1 gap-0 overflow-hidden rounded-lg border py-0">
            <CardHeader className="h-9 flex-row items-center justify-between border-b bg-muted/30 gap-0 px-3 py-0">
              <CardTitle className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Live map · driver pins</CardTitle>
              <CardDescription className="flex items-center gap-1 font-mono text-[11px] tabular-nums"><Navigation className="size-3" /> gps · 8 s cadence</CardDescription>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 p-0">
              <AnnotationPinLayer
                className="h-full min-h-[260px]"
                pins={pins}
                onRemove={(id) => setPins((ps) => ps.filter((p) => p.id !== id))}
                onAddPin={({ x, y }) => setPins((ps) => [...ps, { id: "d" + Date.now(), x, y, author: "dispatcher", text: "Manual waypoint — assign a van from the wave crew" }])}
                canvas={
                  <div className="relative h-full min-h-[260px] w-full overflow-hidden bg-[hsl(var(--app-code))]">
                    <div aria-hidden className="absolute inset-0 opacity-[0.5] [background-image:linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] [background-size:56px_56px]" />
                    <div aria-hidden className="absolute -left-16 top-1/2 h-24 w-[130%] -rotate-6 rounded-[100%] bg-[hsl(var(--info)/0.12)]" />
                    <div aria-hidden className="absolute right-[12%] top-[10%] size-28 rounded-md bg-[hsl(var(--ok)/0.10)]" />
                    <span className="absolute bottom-2 left-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">karta · wgs84 · tiles cached</span>
                  </div>
                }
              />
            </CardContent>
          </Card>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">ETA scrubbers</span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">±15 min · customers notified &gt; 5</span>
            </header>
            <div className="grid gap-2.5 p-3 sm:grid-cols-2">
              {wave.map((r) => (
                <div key={r.id} className="rounded-md border bg-background p-2.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-1.5 font-semibold"><MapPin className="size-3.5 text-muted-foreground" /> {r.name}</span>
                    <motion.span key={r.eta} initial={{ scale: 1.12 }} animate={{ scale: 1 }} className={cn("font-mono text-[12px] tabular-nums", r.eta > 5 ? "font-bold text-[hsl(var(--err))]" : r.eta > 0 ? "text-[hsl(var(--warn))]" : "text-muted-foreground")}>
                      {r.eta >= 0 ? "+" : ""}{r.eta} min
                    </motion.span>
                  </div>
                  <input
                    type="range"
                    min={-15}
                    max={15}
                    value={r.eta}
                    aria-label={`Scrub ETA for ${r.name}`}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => scrub(r.id, Number(e.target.value))}
                    className="mt-2 w-full accent-[hsl(var(--info))]"
                  />
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>

      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
    </div>
  )
}
