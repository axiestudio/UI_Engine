import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { Bell, CheckCheck, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ProgressiveBlur } from "@/components/primitives/progressive-blur"
import { RadialGauge } from "radial-gauge"
import { OfflineQueueBanner } from "offline-queue-banner"
import { ToastStack, type Toast } from "toast-stack"

// COMPOSITE SCREEN · KDS — KITCHEN DISPLAY
// composed of: radial-gauge (pass load), offline-queue-banner (kitchen-line
// warning), toast-stack (bump notices), vendored progressive-blur (rail edge)
// + purpose-built ticket rail with per-order flare countdowns.

export type TicketItem = { name: string; qty: number; mods?: string }
export type Ticket = {
  id: string
  order: string
  channel: "dine-in" | "takeaway" | "delivery"
  items: TicketItem[]
  firedMin: number
  station: "grill" | "cold" | "fry"
}

export type KitchenDisplayProps = {
  line?: string
  service?: string
  tickets?: Ticket[]
  onBumped?: (order: string) => void
  className?: string
}

const TARGET_MIN = 12

const DEFAULT_TICKETS: Ticket[] = [
  { id: "t1", order: "K-142", channel: "dine-in", station: "grill", firedMin: 9, items: [{ name: "Halibut, brown butter", qty: 2 }, { name: "Beet tartare", qty: 1, mods: "no capers" }] },
  { id: "t2", order: "K-143", channel: "takeaway", station: "grill", firedMin: 11, items: [{ name: "Hamburger royale", qty: 3, mods: "one medium" }, { name: "Fries, large", qty: 2 }] },
  { id: "t3", order: "K-144", channel: "delivery", station: "fry", firedMin: 13, items: [{ name: "Fried plaice box", qty: 2 }] },
  { id: "t4", order: "K-145", channel: "dine-in", station: "cold", firedMin: 4, items: [{ name: "Cured salmon plate", qty: 1 }, { name: "Green salad", qty: 2, mods: "dressing on side" }, { name: "Sourdough & butter", qty: 3 }] },
  { id: "t5", order: "K-146", channel: "takeaway", station: "grill", firedMin: 2, items: [{ name: "Chargrilled leeks", qty: 1 }] },
]

const itemTotal = (t: Ticket) => t.items.reduce((a, i) => a + i.qty, 0)

const fmt = (sec: number) => {
  const v = Math.abs(Math.round(sec))
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`
}

export function KitchenDisplay({ line = "Line Grill 1", service = "dinner service", tickets = DEFAULT_TICKETS, onBumped, className }: KitchenDisplayProps) {
  const [orders, setOrders] = useState(tickets)
  const [online, setOnline] = useState(true)
  const [queuedIds, setQueuedIds] = useState<Set<string>>(new Set())
  const [flushing, setFlushing] = useState(false)
  const [pass, setPass] = useState<{ order: string; items: number; at: string }[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [recallFlash, setRecallFlash] = useState<string | null>(null)
  const mounted = useRef(Date.now())
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const push = (title: string, tone: Toast["tone"] = "ok") =>
    setToasts((ts) => [...ts.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])

  const elapsedSec = (t: Ticket) => (now - mounted.current) / 1000 + t.firedMin * 60
  const remainingSec = (t: Ticket) => TARGET_MIN * 60 - elapsedSec(t)

  const bump = (t: Ticket) => {
    if (online) {
      const at = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      setPass((p) => [...p, { order: t.order, items: itemTotal(t), at }])
      setOrders((os) => os.filter((o) => o.id !== t.id))
      push(`${t.order} bumped to pass · ${at}`, "ok")
      onBumped?.(t.order)
    } else {
      setQueuedIds((q) => new Set(q).add(t.id))
      push(`${t.order} queued — line link down`, "warn")
    }
  }

  const retryNow = () => {
    setFlushing(true)
    setTimeout(() => {
      const at = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      setPass((p) => [...p, ...orders.filter((o) => queuedIds.has(o.id)).map((o) => ({ order: o.order, items: itemTotal(o), at }))])
      setOrders((os) => os.filter((o) => !queuedIds.has(o.id)))
      push(`${queuedIds.size} queued order${queuedIds.size === 1 ? "" : "s"} flushed to pass`, "ok")
      setQueuedIds(new Set())
      setFlushing(false)
      setOnline(true)
    }, 900)
  }

  const recall = () => {
    const last = pass[pass.length - 1]
    if (!last) return push("pass is empty", "info")
    const src = tickets.find((t) => t.order === last.order)
    if (src) setOrders((os) => (os.some((o) => o.id === src.id) ? os : [...os, { ...src, firedMin: 0 }]))
    setRecallFlash(last.order)
    setTimeout(() => setRecallFlash(null), 1400)
    push(`${last.order} recalled to rail`, "warn")
  }

  const passLoad = pass.reduce((a, p) => a + p.items, 0)
  const queuedCount = queuedIds.size

  return (
    <div className={cn("relative isolate flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Kitchen display</h2>
        <span className="text-[12px] text-muted-foreground">{line} · {service}</span>
        <span className={cn("flex items-center gap-1 text-[12px] font-semibold", online ? "text-[hsl(var(--ok))]" : "text-[hsl(var(--err))]")}>
          {online ? <CheckCheck className="size-3.5" /> : <WifiOff className="size-3.5" />} line link {online ? "live" : "down"}
        </span>
        <Button type="button" variant="ghost" onClick={() => { setOnline(!online); push(online ? "line link dropped — bumping queues locally" : "line link restored", online ? "warn" : "ok") }} className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted">
          {online ? <WifiOff className="size-3.5" /> : <CheckCheck className="size-3.5" />} {online ? "Drop link" : "Restore link"}
        </Button>
        <Button type="button" variant="ghost" onClick={recall} className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted">
          <Bell className="size-3.5" /> Recall last
        </Button>
      </header>

      <div className="min-h-0 flex-1 p-4">
        <AnimatePresence>
          {!online && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-3">
              <OfflineQueueBanner online={online} queued={queuedCount} flushing={flushing} onRetryNow={queuedCount > 0 ? retryNow : undefined} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* ticket rail */}
          <section className="relative min-h-0 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Ticket rail · {orders.length} open</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">target {TARGET_MIN}:00</span>
            </header>
            <div className="relative h-[380px] overflow-hidden">
              <div className="flex h-full gap-3 overflow-x-auto p-3">
                {orders.map((t) => {
                  const due = remainingSec(t)
                  const flare = due <= 120
                  const overdue = due <= 0
                  const pct = Math.min(100, (elapsedSec(t) / (TARGET_MIN * 60)) * 100)
                  return (
                    <motion.article
                      key={t.id}
                      layout
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: queuedIds.has(t.id) ? 0.55 : 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      className={cn("flex w-[228px] shrink-0 flex-col overflow-hidden rounded-lg border bg-background", overdue && "border-[hsl(var(--err)/0.6)]")}
                    >
                      <MotionConfig reducedMotion="user">
                      <header className={cn("flex h-9 shrink-0 items-center justify-between border-b px-3", overdue ? "bg-[hsl(var(--err)/0.12)]" : flare ? "bg-[hsl(var(--warn)/0.12)]" : "bg-muted/30")}>
                        <span className="text-[13px] font-bold">{t.order}</span>
                        <span className="rounded border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">{t.channel}</span>
                      </header>
                      <ul className="flex-1 space-y-1.5 px-3 py-2">
                        {t.items.map((i) => (
                          <li key={i.name} className="text-[12px] leading-tight">
                            <span className="mr-1.5 font-mono tabular-nums text-muted-foreground">{i.qty}×</span>{i.name}
                            {i.mods && <span className="block pl-6 text-[11px] text-[hsl(var(--info))]">{i.mods}</span>}
                          </li>
                        ))}
                      </ul>
                      <footer className="border-t px-3 py-2">
                        <div className="flex items-baseline justify-between font-mono text-[12px] tabular-nums">
                          <span className={cn(overdue && "text-[hsl(var(--err))]", flare && !overdue && "text-[hsl(var(--warn))]")}>{fmt(elapsedSec(t))}</span>
                          <motion.span
                            key={overdue ? "over" : flare ? "flare" : "due"}
                            animate={overdue ? { opacity: [1, 0.45, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 1.1 }}
                            className={cn("text-[11px] font-bold uppercase tracking-[0.08em]", overdue ? "text-[hsl(var(--err))]" : flare ? "text-[hsl(var(--warn))]" : "text-muted-foreground")}
                          >
                            {overdue ? `over ${fmt(due)}` : `due ${fmt(due)}`}
                          </motion.span>
          
    </div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                          <div className={cn("h-full rounded-full", overdue ? "bg-[hsl(var(--err))]" : flare ? "bg-[hsl(var(--warn))]" : "bg-[hsl(var(--ok))]")} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{t.station} · {itemTotal(t)} pcs</span>
                          <Button type="button" variant="ghost" onClick={() => bump(t)} className="flex h-7 items-center rounded-md border bg-background px-2.5 text-[11px] font-bold hover:bg-muted">{queuedIds.has(t.id) ? "queued" : "Bump"}</Button>
                        </div>
                      </footer>
                                          </MotionConfig>
                    </motion.article>
                  )
                })}
                {orders.length === 0 && (
                  <div className="flex h-full w-full items-center justify-center text-[12px] text-muted-foreground">Rail clear — all tickets bumped.</div>
                )}
              </div>
              <ProgressiveBlur direction="right" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16" />
            </div>
          </section>

          {/* pass rail */}
          <aside className="flex min-h-0 flex-col gap-4">
            <section className="overflow-hidden rounded-lg border bg-card">
              <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Pass load</header>
              <div className="p-3">
                <RadialGauge
                  value={passLoad}
                  max={24}
                  unit=" pcs"
                  precision={0}
                  size={170}
                  label="waiting on pass"
                  zones={[
                    { to: 0.55, color: "hsl(var(--ok))", label: "flowing" },
                    { to: 0.8, color: "hsl(var(--warn))", label: "stacked" },
                    { to: 1, color: "hsl(var(--err))", label: "backed up" },
                  ]}
                />
              </div>
            </section>
            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
              <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Pass log</span>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{pass.length}</span>
              </header>
              <ul className="min-h-0 flex-1 divide-y divide-border/60 overflow-auto">
                {pass.length === 0 && <li className="px-3 py-6 text-center text-[12px] text-muted-foreground">Nothing on the pass yet.</li>}
                {pass.map((p) => (
                  <motion.li key={p.order + p.at} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn("flex items-center justify-between px-3 py-1.5", recallFlash === p.order && "bg-[hsl(var(--warn)/0.15)]")}>
                    <span className="text-[12px] font-semibold">{p.order}</span>
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{p.items} pcs · {p.at}</span>
                  </motion.li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((ts) => ts.filter((t) => t.id !== id))} pos="br" />
    </div>
  )
}
