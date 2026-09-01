import { useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { KeyRound, MoonStar, RefreshCw, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/watermelon/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/watermelon/table"
import { StepperForm, type Step } from "stepper-form"
import { OfflineQueueBanner } from "offline-queue-banner"
import { ToastStack, type Toast } from "toast-stack"

// COMPOSITE SCREEN · PMS NIGHT AUDIT
// composed of: stepper-form (close-out wizard), offline-queue-banner (channel
// resync), toast-stack (audit notices) + watermelon table/checkbox for the
// keycard reconciliation and a purpose-built PMS health panel.
//
// DESIGN BAR: header strip ≤48px · label 11px semibold uppercase 12% tracking
// · body 13px · numerics 12px tabular right-aligned · panels rounded-lg
// bordered with a 36px header strip · functional copy only · motion marks
// state changes, never decorates.

export type HousePass = {
  id: string
  room: string
  guest: string
  issued: number
  returned: number
}

export type NightAuditProps = {
  property?: string
  clerk?: string
  businessDate?: string
  passes?: HousePass[]
  className?: string
}

const DEFAULT_PASSES: HousePass[] = [
  { id: "p1", room: "204", guest: "L. Ferreira", issued: 2, returned: 2 },
  { id: "p2", room: "311", guest: "K. Nakata", issued: 2, returned: 1 },
  { id: "p3", room: "118", guest: "B. Okonkwo", issued: 4, returned: 4 },
  { id: "p4", room: "426", guest: "S. Marchetti", issued: 1, returned: 0 },
  { id: "p5", room: "502", guest: "A. Duval", issued: 2, returned: 2 },
  { id: "p6", room: "227", guest: "T. Bergström", issued: 3, returned: 2 },
]

const AUDIT_STEPS: Step[] = [
  {
    title: "Folio sweep",
    fields: [
      { key: "foliosClosed", label: "In-house folios closed to zero", type: "number", required: true, placeholder: "e.g. 118", validate: (v: string) => (Number(v) > 0 ? null : "Enter the folio count — cannot be zero on a full house") },
      { key: "noShowFees", label: "No-show fees posted (count)", type: "number", required: true, placeholder: "0 if none", validate: (v: string) => (v !== "" && !Number.isNaN(Number(v)) ? null : "Enter a count, 0 if none") },
    ],
  },
  {
    title: "Drawer count",
    fields: [
      { key: "floatCounted", label: "Drawer float counted (SEK)", type: "number", required: true, placeholder: "3000", validate: (v: string) => (Number(v) >= 0 ? null : "Count cannot be negative") },
      {
        key: "varianceNote",
        label: "Variance explanation",
        type: "text",
        placeholder: "required if float ≠ 3000",
        validate: (v: string, d: Record<string, string>) => (Math.abs(Number(d.floatCounted ?? "0") - 3000) <= 50 || v.trim().length > 4 ? null : "Float differs from the 3 000 kr base — explain the variance"),
      },
    ],
  },
  {
    title: "Keycards",
    fields: [
      { key: "cardsIssued", label: "Cards issued tonight", type: "number", required: true, validate: (v: string) => (Number(v) >= 0 ? null : "Enter a count") },
      {
        key: "cardsReturned",
        label: "Cards returned by checkout",
        type: "number",
        required: true,
        validate: (v: string, d: Record<string, string>) => (Number(v) <= Number(d.cardsIssued ?? "0") ? null : "Returned cards cannot exceed issued"),
      },
    ],
  },
]

type PmsService = { name: string; state: "ok" | "degraded" | "down"; note: string }

const PMS_SERVICES: PmsService[] = [
  { name: "Folio service", state: "ok", note: "v4.2 · 118 folios, 0 locked" },
  { name: "Channel manager", state: "degraded", note: "OTA queue backpressure 4 msgs" },
  { name: "Payment terminal T1", state: "ok", note: "batch open · settlement 02:00" },
  { name: "Keycard encoder", state: "ok", note: "stock 140 blanks" },
]

export function NightAudit({ property = "Hotel Bryggen", clerk = "N. Haddad", businessDate = "2026-08-30", passes = DEFAULT_PASSES, className }: NightAuditProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [online, setOnline] = useState(true)
  const [queued, setQueued] = useState(4)
  const [flushing, setFlushing] = useState(false)
  const [closed, setClosed] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = (title: string, tone: Toast["tone"] = "ok", action?: { label: string; run: () => void }) =>
    setToasts((t: Toast[]) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone, action }])

  const toggleRow = (id: string, on: boolean) =>
    setSelected((s: Set<string>) => {
      const next = new Set(s)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const allSelected = selected.size === passes.length
  const someSelected = selected.size > 0 && !allSelected

  const flagSelected = () => {
    setFlagged((f: Set<string>) => new Set([...f, ...selected]))
    push(`${selected.size} pass${selected.size > 1 ? "es" : ""} flagged for key audit`, "warn")
    setSelected(new Set())
  }

  const retryResync = () => {
    setFlushing(true)
    window.setTimeout(() => {
      setFlushing(false)
      setOnline(true)
      setQueued(0)
      push("Channel queue flushed — 4 messages confirmed by PMS", "ok")
    }, 1400)
  }

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      {/* screen header */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <MoonStar className="size-4 text-muted-foreground" />
        <h2 className="text-[13px] font-bold">Night audit</h2>
        <span className="text-[12px] text-muted-foreground">{property}</span>
        <span className="text-[12px] text-muted-foreground">· business day {businessDate} · clerk {clerk}</span>
        <Button type="button" variant="ghost"
          onClick={() => {
            setOnline((o: boolean) => !o)
            setQueued((q: number) => (online ? q + 3 : q))
            push(online ? "WAN link dropped — audit actions queue locally" : "WAN link restored", online ? "warn" : "ok")
          }}
          className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"
        >
          {online ? <WifiOff className="size-3.5" /> : <RefreshCw className="size-3.5" />} {online ? "Simulate link drop" : "Restore link"}
        </Button>
      </header>

      {!online && (
        <div className="px-4 pt-3">
          <OfflineQueueBanner online={online} queued={queued} flushing={flushing} onRetryNow={retryResync} />
          
    </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 xl:grid-cols-[340px_minmax(0,1fr)_300px]">
        {/* close-out wizard */}
        <section data-wizard className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Close-out wizard · step gate</span>
          </header>
          <div className="p-3">
            <StepperForm
              steps={AUDIT_STEPS}
              submitLabel="Close business day"
              onSubmit={(data: Record<string, string>) => {
                setClosed(true)
                push(`Business day ${businessDate} closed · ${data.foliosClosed ?? "—"} folios zeroed`, "ok")
              }}
            />
            <p className="mt-3 border-t pt-2 text-[11px] text-muted-foreground">Every step must pass before the day can roll. Audit trail is written to pms_audit_log.</p>
          </div>
        </section>

        {/* keycard reconciliation */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Keycard reconciliation · in-house passes</span>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{passes.reduce((a: number, p: HousePass) => a + p.issued, 0)} cards out</span>
          </header>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20 hover:bg-muted/20">
                <TableHead className="w-10 px-3">
                  <Checkbox
                    aria-label="Select all passes"
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={(checked: boolean | "indeterminate") => setSelected(checked ? new Set(passes.map((p: HousePass) => p.id)) : new Set())}
                  />
                </TableHead>
                <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Room</TableHead>
                <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Guest</TableHead>
                <TableHead className="h-8 w-16 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Out</TableHead>
                <TableHead className="h-8 w-16 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Ret</TableHead>
                <TableHead className="h-8 w-24 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {passes.map((p: HousePass) => {
                const short = p.returned < p.issued
                return (
                  <TableRow key={p.id} className={cn("text-[12px]", selected.has(p.id) && "bg-accent/50", flagged.has(p.id) && "opacity-60")}>
                    <TableCell className="px-3">
                      <Checkbox checked={selected.has(p.id)} onCheckedChange={(checked: boolean | "indeterminate") => toggleRow(p.id, checked === true)} />
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">{p.room}</TableCell>
                    <TableCell className="font-medium">{p.guest}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{p.issued}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{p.returned}</TableCell>
                    <TableCell className="text-right">
                      {flagged.has(p.id) ? (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">flagged</span>
                      ) : short ? (
                        <span className="rounded bg-[hsl(var(--warn)/0.14)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[hsl(var(--warn))]">short {p.issued - p.returned}</span>
                      ) : (
                        <span className="rounded bg-[hsl(var(--ok)/0.1)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[hsl(var(--ok))]">reconciled</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between gap-3 border-t px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Short passes stay flagged until reception confirms loss or return.</p>
            <Button type="button" variant="ghost"
              onClick={flagSelected}
              disabled={selected.size === 0}
              className="flex h-8 shrink-0 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted disabled:opacity-40"
            >
              <KeyRound className="size-3.5" /> Flag {selected.size || ""} for key audit
            </Button>
          </div>
        </section>

        {/* health + status */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">PMS health</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">22:47</span>
            </header>
            <ul className="divide-y divide-border">
              {PMS_SERVICES.map((s: PmsService) => (
                <li key={s.name} className="flex items-center gap-2.5 px-3 py-2">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      s.state === "ok" && "bg-[hsl(var(--ok))]",
                      s.state === "degraded" && "bg-[hsl(var(--warn))]",
                      s.state === "down" && "bg-[hsl(var(--err))]",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-semibold">{s.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{s.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className={cn("overflow-hidden rounded-lg border bg-card transition-colors", closed && "border-[hsl(var(--ok)/0.5)]")}>
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Close-out</header>
            <div className="p-3">
              <AnimatePresence mode="wait">
                {closed ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-md border border-[hsl(var(--ok)/0.5)] bg-[hsl(var(--ok)/0.08)] px-3 py-2 text-[12px] font-bold text-[hsl(var(--ok))]"
                  >
                    DAY CLOSED · {businessDate}
                    <span className="mt-0.5 block text-[11px] font-semibold text-muted-foreground">rolled to 2026-08-31 at 23:59 · report filed</span>
                  </motion.div>
                ) : (
                  <motion.p key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] text-muted-foreground">
                    Business day still open. Finish the wizard, reconcile short passes and flush the channel queue before rolling the date.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </section>
        </aside>
      </div>

      <ToastStack toasts={toasts} onDismiss={(id: string) => setToasts((t: Toast[]) => t.filter((x: Toast) => x.id !== id))} pos="br" />
          </MotionConfig>
    </div>
  )
}
