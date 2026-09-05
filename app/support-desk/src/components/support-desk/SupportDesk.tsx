import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { AlarmClock, BellRing, PhoneForwarded, Search, Waypoints } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/watermelon/table"
import { Checkbox } from "@/components/watermelon/checkbox"
import { Badge } from "@/components/ui/badge"
import { GroupedSearchResults, type SearchHit } from "grouped-search-results"
import { AsyncMultiselect, type PickOption } from "async-multiselect"
import { ContextMenuStack, type MenuItem } from "context-menu-stack"
import { InboxSnoozeCenter, type InboxItem } from "inbox-snooze-center"

// COMPOSITE SCREEN · SUPPORT AGENT CONSOLE
// composed of: grouped-search-results (entity search), async-multiselect
// (assignee picker), context-menu-stack (switchboard routing on right-click),
// inbox-snooze-center (snooze-able alerts) + purpose-built ticket cards,
// triage filters and routing log.

export type Ticket = {
  id: string
  subject: string
  requester: string
  priority: "urgent" | "high" | "normal"
  ageMin: number
  queue: string
  assignee?: string
  status: "new" | "open" | "snoozed" | "solved"
}
export type RoutingRow = { id: string; at: string; ticket: string; queue: string; by: string }
export type SupportDeskProps = {
  agent?: string
  tickets?: Ticket[]
  alerts?: InboxItem[]
  onRouted?: (ticket: Ticket, queue: string) => void
  className?: string
}

const DEFAULT_TICKETS: Ticket[] = [
  { id: "TCK-4182", subject: "Card charge duplicated on order #81221", requester: "M. Ahlberg", priority: "urgent", ageMin: 34, queue: "payments", status: "new" },
  { id: "TCK-4179", subject: "SSO loop after password reset", requester: "Nordvik Logistics", priority: "high", ageMin: 71, queue: "accounts", status: "open", assignee: "J. Nyberg" },
  { id: "TCK-4176", subject: "Export CSV missing VAT column", requester: "L. Mbeki", priority: "normal", ageMin: 156, queue: "product", status: "open" },
  { id: "TCK-4171", subject: "Webhook retries exhausting quota", requester: "F. Holm AB", priority: "high", ageMin: 203, queue: "integrations", status: "new" },
  { id: "TCK-4168", subject: "Change billing email for studio account", requester: "E. Kall", priority: "normal", ageMin: 388, queue: "accounts", status: "snoozed" },
  { id: "TCK-4160", subject: "Refund received but invoice still open", requester: "P. Olausson", priority: "normal", ageMin: 940, queue: "payments", status: "solved", assignee: "J. Nyberg" },
]

const DEFAULT_ALERTS: InboxItem[] = [
  { id: "al1", title: "SLA breach in 26 min", body: "TCK-4182 · urgent · first response due 15:10", at: "now" },
  { id: "al2", title: "Payment webhook failing", body: "integrations · 12 deliveries stuck in retry", at: "12 min ago" },
  { id: "al3", title: "Backlog spike: accounts", body: "7 new since shift start — above pace by 3", at: "38 min ago" },
]

const AGENT_POOL: PickOption[] = [
  { id: "ag1", label: "J. Nyberg", meta: "payments · 5 open" },
  { id: "ag2", label: "R. Diallo", meta: "integrations · 2 open" },
  { id: "ag3", label: "S. Watt", meta: "accounts · 7 open" },
  { id: "ag4", label: "M. Lind", meta: "product · 3 open" },
  { id: "ag5", label: "T. Okafor", meta: "payments · 1 open" },
  { id: "ag6", label: "A. Bergström", meta: "escalations · 4 open" },
  { id: "ag7", label: "K. Sato", meta: "float · 0 open" },
]

const HITS: SearchHit[] = [
  { id: "h1", kind: "doc", title: "Refunds after invoice settlement", sub: "runbook · payments" },
  { id: "h2", kind: "doc", title: "SSO reset loop — known fix", sub: "runbook · accounts" },
  { id: "h3", kind: "doc", title: "Webhook quota & retry windows", sub: "policy · integrations" },
  { id: "h4", kind: "person", title: "J. Nyberg", sub: "payments specialist" },
  { id: "h5", kind: "person", title: "A. Bergström", sub: "escalations" },
  { id: "h6", kind: "tag", title: "duplicate-charge", sub: "43 tickets this quarter" },
  { id: "h7", kind: "tag", title: "sso-loop", sub: "11 tickets" },
]

const PRIO_TONE: Record<Ticket["priority"], string> = {
  urgent: "border-[hsl(var(--err)/0.5)] text-[hsl(var(--err))]",
  high: "border-[hsl(var(--warn)/0.6)] text-[hsl(var(--warn))]",
  normal: "border-border text-muted-foreground",
}

export function SupportDesk({
  agent = "You · Tier 1",
  tickets = DEFAULT_TICKETS,
  alerts = DEFAULT_ALERTS,
  onRouted,
  className,
}: SupportDeskProps) {
  const [rows, setRows] = React.useState(tickets)
  const [query, setQuery] = React.useState("")
  const [focus, setFocus] = React.useState<string | null>(null)
  const [onlyMine, setOnlyMine] = React.useState(false)
  const [hideSolved, setHideSolved] = React.useState(true)
  const [assignees, setAssignees] = React.useState<PickOption[]>([AGENT_POOL[0]])
  const [alertItems, setAlertItems] = React.useState(alerts)
  const [handled, setHandled] = React.useState(0)
  const [log, setLog] = React.useState<RoutingRow[]>([
    { id: "lg0", at: "14:02", ticket: "TCK-4170", queue: "payments", by: "J. Nyberg" },
  ])

  const at = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  const route = (t: Ticket, queue: string, by: string) => {
    setRows((rs) => rs.map((r) => (r.id === t.id ? { ...r, queue, assignee: by, status: r.status === "new" ? "open" : r.status } : r)))
    setLog((ls) => [{ id: "lg" + Date.now(), at: at(), ticket: t.id, queue, by }, ...ls])
    onRouted?.(t, queue)
  }

  const menuFor = (t: Ticket): MenuItem[] => [
    { label: "Assign to me", shortcut: "M", run: () => route(t, t.queue, "You") },
    {
      label: "Route to…",
      submenu: [
        { label: "Tier 2 · payments", run: () => route(t, "tier2-payments", "unassigned") },
        { label: "Tier 2 · technical", run: () => route(t, "tier2-tech", "unassigned") },
        { label: "Billing back office", run: () => route(t, "billing-ops", "unassigned") },
        { sep: true },
        { label: "Escalations", danger: true, run: () => route(t, "escalations", "A. Bergström") },
      ],
    },
    { label: "Snooze 1 h", run: () => setRows((rs) => rs.map((r) => (r.id === t.id ? { ...r, status: "snoozed" } : r))) },
    { sep: true },
    { label: "Merge into focused ticket", disabled: !focus || focus === t.id },
  ]

  const loadAgents = React.useCallback(async (q: string, page: number) => {
    await new Promise((res) => setTimeout(res, 320))
    const filtered = AGENT_POOL.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()))
    const start = page * 4
    return { items: filtered.slice(start, start + 4), more: start + 4 < filtered.length }
  }, [])

  const visible = rows.filter((r) => (onlyMine ? r.assignee === "You" : true) && (hideSolved ? r.status !== "solved" : true))

  return (
    <div className={cn("relative isolate flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Agent console</h2>
        <span className="text-[12px] text-muted-foreground">{agent}</span>
        <span className="text-[12px] text-muted-foreground">· shift 14:00–22:00 · queue pace normal</span>
        <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">
          {rows.filter((r) => r.status !== "solved").length} active · {log.length} routed this shift
        </span>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 items-start gap-4 overflow-auto p-4 lg:grid-cols-[300px_minmax(0,1fr)_290px]">
        {/* search + alerts */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-2 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <Search className="size-3.5" /> Search
            </header>
            <div className="grid gap-2 p-3">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tickets, people, tags…"
                className="h-8 rounded-md border bg-background px-2.5 text-[12px]"
              />
              <GroupedSearchResults
                query={query}
                items={[...HITS, ...rows.map((t) => ({ id: t.id, kind: "doc" as const, title: t.subject, sub: `${t.id} · ${t.queue}` }))]}
                onSelect={(h) => setFocus(rows.some((r) => r.id === h.id) ? h.id : null)}
              />
              <p className="text-[11px] text-muted-foreground">Selecting a ticket hit focuses its card on the switchboard.</p>
          
    </div>
          </section>

          <section className="flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-2 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <BellRing className="size-3.5" /> Alerts
            </header>
            <div className="p-3">
              <InboxSnoozeCenter
                items={alertItems}
                completed={handled}
                onComplete={(id) => {
                  setAlertItems((xs) => xs.filter((x) => x.id !== id))
                  setHandled((h) => h + 1)
                }}
                onSnooze={(id, span) => setAlertItems((xs) => xs.map((x) => (x.id === id ? { ...x, at: `snoozed ${span}` } : x)))}
              />
            </div>
          </section>
        </aside>

        {/* switchboard */}
        <div className="flex min-w-0 flex-col gap-4">
          <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                <Waypoints className="size-3.5" /> Switchboard · {visible.length} tickets
              </span>
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <Checkbox checked={onlyMine} onCheckedChange={(c) => setOnlyMine(c === true)} aria-label="Only mine" />
                  only mine
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <Checkbox checked={hideSolved} onCheckedChange={(c) => setHideSolved(c === true)} aria-label="Hide solved" />
                  hide solved
                </label>
              </div>
            </header>
            <ul className="grid gap-2 p-3">
              <AnimatePresence initial={false}>
                {visible.map((t) => (
                  <motion.li key={t.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}>
                    <ContextMenuStack items={menuFor(t)} label={`Route ${t.id}`} className="rounded-lg">
                      <div
                        onClick={() => setFocus(t.id)}
                        className={cn(
                          "cursor-pointer rounded-lg border bg-background p-3 transition-colors hover:bg-muted/40",
                          focus === t.id ? "border-[hsl(var(--info)/0.6)] ring-2 ring-[hsl(var(--info)/0.25)]" : "border-border",
                          t.status === "snoozed" && "opacity-60",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] text-muted-foreground">{t.id}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", PRIO_TONE[t.priority])}>{t.priority}</span>
                            {t.status === "snoozed" && <AlarmClock className="size-3.5 text-muted-foreground" />}
                          </div>
                        </div>
                        <p className="mt-1 text-[13px] font-bold leading-snug">{t.subject}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {t.requester} · {t.queue} · open {t.ageMin < 60 ? `${t.ageMin} min` : `${Math.floor(t.ageMin / 60)} h ${t.ageMin % 60} min`}
                          {t.assignee && ` · with ${t.assignee}`}
                        </p>
                      </div>
                    </ContextMenuStack>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">
              Right-click (or Shift+F10) a card to route it · focus a card first to enable merge
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Routing log
            </header>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Time</TableHead>
                  <TableHead className="h-8 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Ticket</TableHead>
                  <TableHead className="h-8 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Queue</TableHead>
                  <TableHead className="h-8 px-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {log.slice(0, 5).map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="px-3 py-1 font-mono text-[12px] tabular-nums text-muted-foreground">{l.at}</TableCell>
                    <TableCell className="px-2 py-1 font-mono text-[12px]">{l.ticket}</TableCell>
                    <TableCell className="px-2 py-1 text-[12px]">{l.queue}</TableCell>
                    <TableCell className="px-3 py-1 text-right text-[12px]">{l.by}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        </div>

        {/* assignees */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Assignees
            </header>
            <div className="p-3">
              <AsyncMultiselect
                label="Routing pool"
                value={assignees}
                onValueChange={setAssignees}
                loadItems={loadAgents}
                placeholder="Search agents…"
              />
            </div>
          </section>
          <section className="flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Pool load
              <PhoneForwarded className="size-3.5" />
            </header>
            <ul className="grid gap-3 p-3">
              {assignees.map((a) => {
                const open = AGENT_POOL.find((x) => x.id === a.id)?.meta ?? ""
                const load = Math.min(100, parseInt(open.match(/(\d+) open/)?.[1] ?? "0", 10) * 12)
                return (
                  <li key={a.id}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[12px] font-bold">{a.label}</span>
                      <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{open}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <motion.span
                        className="block h-full rounded-full"
                        style={{ background: load > 60 ? "hsl(var(--err))" : load > 40 ? "hsl(var(--warn))" : "hsl(var(--ok))" }}
                        animate={{ width: `${load}%` }}
                      />
                    </div>
                  </li>
                )
              })}
              {!assignees.length && (
                <li>
                  <Badge variant="outline" className="text-[10px]">pool empty — no routing target</Badge>
                </li>
              )}
            </ul>
            <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Load = open tickets weighted by priority · red agents page before routing</div>
          </section>
        </aside>
      </div>
          </MotionConfig>
    </div>
  )
}
